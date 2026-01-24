# Kitchen Ticket Logic - Safety-First Implementation

## Overview

This document describes the strict, safety-first kitchen ticket logic implemented for the Wildfire Allergy Checker app. The system uses allergy sheets as the **single source of truth** and implements deterministic decision logic to ensure guest safety.

---

## Core Safety Rules (Non-Negotiable)

### 1. Per-Allergen Rules Only
- A dish/modification is **only valid** for a given allergen if it appears in that allergen's allergy sheet
- If a dish does NOT appear in allergen X's sheet, it is **NOT SAFE** for allergen X
- **No inference across allergens** is allowed (e.g., egg rules do not apply to shellfish)

### 2. Five Distinct Safety States
Each dish/allergen combination has exactly ONE of these statuses:

| Status | Meaning | Kitchen Action |
|--------|---------|----------------|
| `SAFE` | Safe to serve as-is | No modifications needed |
| `MODIFIABLE` | Can be made safe with modifications | Apply listed modifications from allergy sheet |
| `VERIFY_WITH_KITCHEN` | Requires manual confirmation | Chef must verify before serving |
| `UNSAFE` | Cannot be made safe | Do NOT serve |
| `NOT_SAFE_NOT_IN_SHEET` | Not present in allergy sheet | Do NOT serve - cannot verify safety |

### 3. "Not in Sheet = Not Safe"
If a dish is missing from an allergen's sheet, the system will **never** suggest modifications or allow it to be served. It must be marked as `NOT_SAFE_NOT_IN_SHEET`.

### 4. Multi-Allergen Priority
When multiple allergens are selected, the **most restrictive status wins**:

```
Priority Order (strictest → least strict):
NOT_SAFE_NOT_IN_SHEET > UNSAFE > VERIFY_WITH_KITCHEN > MODIFIABLE > SAFE
```

Example: If a dish is `MODIFIABLE` for dairy but `NOT_SAFE_NOT_IN_SHEET` for shellfish, the overall status is `NOT_SAFE_NOT_IN_SHEET`.

---

## Data Flow Architecture

### 1. Allergy Sheet Storage (Source of Truth)

**Database Table:** `allergen_modifications` (Supabase PostgreSQL)

**Location:** `/supabase/migrations/002_all_allergen_modifications.sql`

**Schema:**
```sql
CREATE TABLE allergen_modifications (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  menu_item_id UUID,                    -- Links to menu_items table
  dish_name TEXT NOT NULL,
  category TEXT NOT NULL,
  allergen TEXT NOT NULL,               -- dairy, gluten, shellfish, etc.
  status TEXT NOT NULL,                 -- safe, modifiable, not_modifiable
  modifications TEXT[],                 -- Array of kitchen instructions
  notes TEXT,
  requires_verification BOOLEAN,        -- NEW: Manual verification flag
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Example Data:**
```sql
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
(tenant_id, 'Mediterranean Chicken Skewers', 'Appetizers', 'dairy', 'modifiable', ARRAY['NO yogurt sauce']),
(tenant_id, 'Shrimp Cocktail', 'Appetizers', 'dairy', 'safe', ARRAY[]::TEXT[]),
(tenant_id, 'Breaded Item', 'Appetizers', 'gluten', 'not_modifiable', ARRAY[]::TEXT[]);
```

### 2. TenantPack JSON (Runtime Data)

**Location:** `/generated/tenant-pack-v1.json`

**Generation:** Run `npx tsx scripts/generatePackFromSupabase.ts`

**Type Definitions:** `/src/core/tenant/packTypes.ts`

**Structure:**
```typescript
interface TenantPack {
  tenantId: string;
  allergens: AllergenDef[];
  categories: Category[];
  items: MenuItem[];              // Each item has allergenRules
}

interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  ticketCode?: string;            // Kitchen abbreviation
  allergenRules: Record<string, AllergenRule>;  // Rules per allergen
}

interface AllergenRule {
  status: RuleStatus;             // SAFE | MODIFIABLE | VERIFY_WITH_KITCHEN | NOT_SAFE_NOT_IN_SHEET | UNSAFE
  substitutions?: string[];       // Kitchen modifications (only for MODIFIABLE)
  notes?: string;
  requiresVerification?: boolean;
}
```

### 3. Decision Engine

**Location:** `/src/core/checker/checker.ts`

**Core Function:**
```typescript
export function evaluateDishForAllergen(
  dish: MenuItem,
  allergenId: string
): RuleStatus {
  const rule = dish.allergenRules[allergenId];

  // RULE 1: Not in allergy sheet = NOT SAFE
  if (!rule) {
    return 'NOT_SAFE_NOT_IN_SHEET';
  }

  // RULE 2: Return status from allergy sheet
  return rule.status;
}
```

### 4. Kitchen Ticket Generation

**Location:** `/src/core/checker/checker.ts` (function `generateTicketLines()`)

**Output Format Examples:**

**SAFE Dish:**
```
=== SHRIMP COCKTAIL ===
✓ SAFE - No changes needed
```

**MODIFIABLE Dish:**
```
=== CHICKEN SKEWERS ===
• **NO yogurt sauce**
```

**VERIFY_WITH_KITCHEN:**
```
=== COMPLEX DISH ===
⚠️  VERIFY WITH THE KITCHEN
   Manual confirmation required before serving
   • Dairy: Recipe varies - verify with chef
```

**NOT_SAFE_NOT_IN_SHEET:**
```
=== SALMON ===
🚫 NOT SAFE — NOT IN ALLERGY SHEET
   DO NOT SERVE - Cannot verify safety
   • Shellfish: Missing from allergy sheet
```

**UNSAFE:**
```
=== BREADED ITEM ===
✗ NOT SAFE - Cannot be modified
   • Gluten: Cannot be made gluten-free
```

---

## How to Configure & Extend Allergy Sheets

### Option 1: Direct Database Updates (Recommended for Bulk Changes)

1. **Add new allergen modifications to database:**
```sql
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, requires_verification)
VALUES
  ('your-tenant-id', 'New Dish', 'Appetizers', 'dairy', 'modifiable', ARRAY['NO butter'], false),
  ('your-tenant-id', 'New Dish', 'Appetizers', 'gluten', 'safe', ARRAY[]::TEXT[], false);
```

2. **Mark items for manual verification:**
```sql
UPDATE allergen_modifications
SET requires_verification = true
WHERE dish_name = 'Complex Dish' AND allergen = 'shellfish';
```

3. **Regenerate the TenantPack:**
```bash
SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx TENANT_ID=xxx npx tsx scripts/generatePackFromSupabase.ts
```

4. **Upload to Supabase Storage:**
```bash
SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx npx tsx scripts/uploadPackToSupabase.ts
```

### Option 2: Database Migration Files

1. **Create a new migration file:**
```bash
touch supabase/migrations/022_add_new_dishes.sql
```

2. **Add modifications:**
```sql
DO $$
DECLARE
  t_id UUID;
BEGIN
  SELECT id INTO t_id FROM tenants WHERE concept_name = 'Wildfire' LIMIT 1;

  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, requires_verification)
  VALUES
    (t_id, 'New Salmon Dish', 'Entrees', 'dairy', 'modifiable', ARRAY['NO butter'], false),
    (t_id, 'New Salmon Dish', 'Entrees', 'shellfish', 'safe', ARRAY[]::TEXT[], false),
    (t_id, 'New Salmon Dish', 'Entrees', 'gluten', 'modifiable', ARRAY['GF seasoning'], false)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE
    SET status = EXCLUDED.status,
        modifications = EXCLUDED.modifications,
        requires_verification = EXCLUDED.requires_verification;
END $$;
```

3. **Apply migration and regenerate pack** (as above)

### Status Mapping Rules

When adding data to the database, use these status values:

| Database Status | Pack Status | When to Use |
|----------------|-------------|-------------|
| `safe` | `SAFE` | Dish is safe as-is, no modifications needed |
| `modifiable` | `MODIFIABLE` | Dish can be made safe with listed modifications |
| `not_modifiable` | `UNSAFE` | Dish cannot be made safe for this allergen |
| N/A (requires_verification=true) | `VERIFY_WITH_KITCHEN` | Requires manual kitchen verification |
| Missing from table | `NOT_SAFE_NOT_IN_SHEET` | Generated automatically if no rule exists |

---

## Testing the Logic

### Run Unit Tests

```bash
npm test src/core/checker/checker.test.ts
```

### Test Coverage Includes:

1. ✅ Dish present in allergy sheet and modifiable with explicit modifications
2. ✅ Dish present and safe
3. ✅ Dish present but requires verification
4. ✅ Dish missing from allergy sheet → `NOT_SAFE_NOT_IN_SHEET`
5. ✅ Multi-allergen: one allergen missing dish → `NOT_SAFE_NOT_IN_SHEET` overall
6. ✅ Dish modifiable under allergen A but missing under allergen B → `NOT_SAFE_NOT_IN_SHEET` overall
7. ✅ Status priority enforcement
8. ✅ Kitchen ticket formatting for all states
9. ✅ No cross-allergen inference

---

## Critical Safety Checks

### Before Deploying Changes:

1. **Run the test suite** - All tests MUST pass
   ```bash
   npm test
   ```

2. **Verify pack generation** - Check for errors or warnings
   ```bash
   npx tsx scripts/generatePackFromSupabase.ts
   ```

3. **Check coverage report** - Ensure all dishes have allergen rules
   - The generation script reports items without rules
   - Items without rules will show `NOT_SAFE_NOT_IN_SHEET`

4. **Review ticket output** - Manually test critical allergen combinations
   - Test dishes that are SAFE for one allergen but NOT_SAFE for another
   - Verify VERIFY_WITH_KITCHEN messages are clear
   - Confirm modifications are bold and prominent

### Common Pitfalls to Avoid:

❌ **DO NOT** add modifications to the `modifications` array unless the dish is marked `modifiable`
❌ **DO NOT** assume a dish safe for dairy is safe for eggs (no inference)
❌ **DO NOT** mark items as `safe` without verification from official allergy sheets
❌ **DO NOT** skip regenerating the pack after database changes
✅ **DO** use `requires_verification` flag when unsure
✅ **DO** test with multiple allergen selections
✅ **DO** verify kitchen ticket output is clear and unambiguous

---

## File Reference

### Key Files:

| File | Purpose |
|------|---------|
| `/supabase/migrations/002_all_allergen_modifications.sql` | Database schema and initial allergy data |
| `/supabase/migrations/021_add_verification_flag.sql` | Adds `requires_verification` flag |
| `/src/core/tenant/packTypes.ts` | TypeScript type definitions |
| `/src/core/checker/checker.ts` | Decision engine and ticket generation |
| `/src/core/checker/checker.test.ts` | Comprehensive unit tests |
| `/scripts/generatePackFromSupabase.ts` | Database → JSON pack conversion |
| `/scripts/uploadPackToSupabase.ts` | Upload pack to Supabase Storage |
| `/generated/tenant-pack-v1.json` | Runtime data (auto-generated) |

### Configuration Files:

- Allergen definitions: Line 44-55 in `generatePackFromSupabase.ts`
- Category order/icons: Line 113-129 in `generatePackFromSupabase.ts`
- Status priority: Line 194-209 in `checker.ts`

---

## Support & Maintenance

### Adding a New Allergen:

1. Add to `allergen_modifications` table CHECK constraint (line 15-17 in migration 002)
2. Add to `ALLERGEN_DEFINITIONS` array in `generatePackFromSupabase.ts`
3. Add to `AllergenId` type in `packTypes.ts`
4. Add allergy sheet data for all menu items
5. Regenerate pack and upload

### Modifying Kitchen Ticket Format:

Edit the `formatItemLines()` function in `/src/core/checker/checker.ts` (lines 274-322)

### Changing Status Priority:

Edit the `worstStatus()` function in `/src/core/checker/checker.ts` (lines 194-209)

⚠️ **WARNING:** Changing priority order is a critical safety change and requires thorough testing.

---

## Summary

The kitchen ticket logic is built on three pillars:

1. **Allergy sheets as source of truth** - Database tables define what is safe
2. **Deterministic decision function** - `evaluateDishForAllergen()` provides single decision point
3. **Strict safety rules** - Most restrictive status always wins; no inference allowed

This architecture ensures:
- ✅ No dish is served unless explicitly verified in allergy sheets
- ✅ Kitchen receives clear, unambiguous instructions
- ✅ Guest safety is prioritized over convenience
- ✅ Allergy rules can be easily updated and tested

For questions or issues, refer to the test suite in `checker.test.ts` for concrete examples of expected behavior.
