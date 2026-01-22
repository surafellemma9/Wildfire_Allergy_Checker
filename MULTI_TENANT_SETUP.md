# Multi-Tenant Deployment Guide

This guide explains how to set up the multi-tenant architecture for the Wildfire Allergy Checker app.

## Architecture Overview

The app is now a **generic shell** that downloads restaurant-specific data (TenantPack) after activation. Key features:

- **Private app**: Users cannot see any menu without activation
- **Activation codes**: 6-character codes that expire after 90 days (for new devices only)
- **Offline-first**: After first download, the app works offline using cached data
- **Auto-update**: Background refresh every 6 hours when online
- **Multi-tenant**: Supports multiple restaurants with separate data packs

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key (Settings > API)
3. Note your service role key (Settings > API > Service Role)

### 2. Run Migrations

Apply the migration file to create tables:

```bash
# Using Supabase CLI
supabase db push

# Or manually run in SQL Editor:
# Copy contents of supabase/migrations/001_multi_tenant_schema.sql
```

### 3. Create Storage Bucket

1. Go to Storage in Supabase Dashboard
2. Create a new bucket named `tenant-packs`
3. Set it to **Private** (no public access)

### 4. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy activate
supabase functions deploy get_latest_pack
supabase functions deploy rotate_activation_code

# Set DEV_SECRET for rotate_activation_code
supabase secrets set DEV_SECRET=your-secret-key
```

## Creating a New Tenant

### 1. Insert Tenant Record

```sql
INSERT INTO public.tenants (concept_name, location_name)
VALUES ('Wildfire', 'Tyson''s Corner')
RETURNING id;
-- Note the returned tenant ID
```

### 2. Create Activation Code

```sql
INSERT INTO public.activation_codes (tenant_id, code, expires_at, max_activations)
VALUES (
  'YOUR_TENANT_ID',
  'ABC123',  -- Or use generate_activation_code()
  now() + interval '90 days',
  10
);
```

Or use the Edge Function (requires DEV_SECRET):

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/rotate_activation_code \
  -H "x-dev-secret: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "YOUR_TENANT_ID"}'
```

### 3. Generate and Upload Pack

```bash
# Generate the pack JSON
npx tsx scripts/generateTenantPack.ts

# Upload to Supabase (set env vars first)
export SUPABASE_URL=https://YOUR_PROJECT.supabase.co
export SUPABASE_SERVICE_KEY=your-service-role-key
export TENANT_ID=your-tenant-id

npx tsx scripts/uploadPackToSupabase.ts
```

## Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For the upload script, set these in your shell:

```bash
export SUPABASE_URL=https://YOUR_PROJECT.supabase.co
export SUPABASE_SERVICE_KEY=your-service-role-key
```

## Activation Flow

1. User launches app → sees Location Verification page
2. User enters activation code → app calls `activate` Edge Function
3. Server validates code, creates device record, returns device token + pack URL
4. App downloads pack, verifies checksum, saves to IndexedDB
5. App saves tenant context and device token locally
6. User can now use the app (offline works!)

## Updating Menu Data

When menu changes need to be published:

1. Update `src/data/menu-items.ts` and/or allergen rules
2. Run `npx tsx scripts/generateTenantPack.ts` to create new pack
3. Run `npx tsx scripts/uploadPackToSupabase.ts` to upload as new version
4. Activated devices will auto-download within 6 hours (or manually via Settings)

## Device Management

### View Devices

```sql
SELECT 
  d.device_fingerprint,
  d.last_seen_at,
  d.is_revoked,
  t.concept_name,
  t.location_name
FROM devices d
JOIN tenants t ON d.tenant_id = t.id;
```

### Revoke a Device

```sql
UPDATE devices
SET is_revoked = true
WHERE device_fingerprint = 'xxx';
```

### Check Activation Usage

```sql
SELECT 
  code,
  activations_used,
  max_activations,
  expires_at
FROM activation_codes
WHERE tenant_id = 'xxx';
```

## Rotating Activation Codes

When an activation code is about to expire or has reached max activations:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/rotate_activation_code \
  -H "x-dev-secret: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "YOUR_TENANT_ID", "deactivatePriorCodes": true}'
```

Note: Existing activated devices continue to work - they don't need the new code.

## TenantPack JSON Structure

```json
{
  "tenantId": "uuid",
  "conceptName": "Wildfire",
  "locationName": "Tyson's Corner",
  "version": 1,
  "generatedAt": "2025-01-20T00:00:00.000Z",
  "allergens": [
    { "id": "dairy", "name": "Dairy", "icon": "🥛" }
  ],
  "categories": [
    { "id": "appetizers", "name": "Appetizers", "sortOrder": 1 }
  ],
  "items": [
    {
      "id": "item_id",
      "name": "Dish Name",
      "categoryId": "appetizers",
      "ticketCode": "TICKET",
      "isEntree": true,
      "requiresCrust": false,
      "sides": [{ "id": "side_id", "name": "Side Name" }],
      "allergenRules": {
        "dairy": {
          "status": "MODIFY",
          "substitutions": ["NO butter", "NO cheese"]
        }
      }
    }
  ]
}
```

## Troubleshooting

### "Invalid activation code"
- Check code exists and is_active = true
- Check expires_at > now()
- Check tenant status = 'active'

### "Maximum activations reached"
- Check activations_used < max_activations
- Create new activation code if needed

### "Device revoked"
- Device was manually revoked
- Contact support to un-revoke: `UPDATE devices SET is_revoked = false WHERE ...`

### App shows cached data
- This is normal when offline
- Check Settings page to see last update time
- Tap "Check for Updates" when online

### Pack checksum mismatch
- The downloaded file was corrupted
- Retry the download
- If persists, regenerate and re-upload the pack
