# Deploy Updated Pack to Production

## Step 1: Upload Pack to Supabase

Run this command with your environment variables:

```bash
SUPABASE_URL=your_url \
SUPABASE_SERVICE_KEY=your_key \
TENANT_ID=your_tenant_id \
npx tsx scripts/uploadPackToSupabase.ts
```

This will:
- Upload the pack to Supabase Storage
- Create a new version record in the database
- Make it available for devices to download

## Step 2: Update Your App

After uploading, do ONE of these:

### Option A: Use Settings Page (Easiest)
1. Open your app
2. Go to Settings (⚙️ icon)
3. Click "Check for Updates"
4. Verify categories are merged

### Option B: Clear Browser Cache
1. Open DevTools (F12)
2. Application tab > Storage > Clear site data
3. Reload the page

### Option C: Reset App
1. Settings > Danger Zone > Reset
2. Re-enter activation code

## Verify Success

You should now see:
- ✅ "Chicken & BBQ" (single merged category)
- ✅ "Specials" (with 5 nightly specials)
- ✅ "Kids Menu" (single category)
- ✅ Total of 11 categories

## Files Modified

Core changes:
- `scripts/generateTenantPack.ts` - Category mapping logic
- `generated/tenant-pack-v1.json` - Output pack (11 categories)
- `src/config/categoryReviewFlags.ts` - Review flags for merged categories

For full details, see:
- `FINAL_CATEGORY_MERGE_SUMMARY.md`
- `CATEGORY_CONSOLIDATION_SUMMARY.md`
