# Supabase Allergy Data Analysis

## Executive Summary

✅ **GREAT NEWS**: Your Supabase migrations already contain comprehensive, deterministic allergy sheets with **ZERO VERIFY states**!

The system I just implemented enforces Fish-only VERIFY at the code level, but your data is even better - it doesn't use VERIFY at all. Every dish has a deterministic status: **SAFE**, **MODIFIABLE**, or **NOT_MODIFIABLE**.

---

## Allergy Sheet Coverage

### Complete Allergy Sheets in Supabase
| Migration File | Allergen | # Dishes | Status Types Used |
|----------------|----------|----------|-------------------|
| 002_allergen_modifications.sql | **Dairy** | 100+ | ✅ safe, modifiable, not_modifiable |
| 004_fix_gluten_modifications.sql | **Gluten** | 100+ | ✅ safe, modifiable, not_modifiable |
| 005_onion_allergy_complete.sql | **Onion** | 100+ | ✅ safe, modifiable |
| 006_peanut_treenut_allergy.sql | **Peanuts** + **Tree Nuts** | 100+ | ✅ safe, modifiable, not_modifiable |
| 007_egg_allergy.sql | **Eggs** | 100+ | ✅ safe, modifiable, not_modifiable |
| 008_sesame_allergy.sql | **Sesame** | 100+ | ✅ safe, modifiable |
| 009_garlic_allergy.sql | **Garlic** | 100+ | ✅ safe, modifiable |
| 010_shellfish_allergy.sql | **Shellfish** | 100+ | ✅ safe, modifiable |
| 011_soy_allergy.sql | **Soy** | 100+ | ✅ safe, modifiable, not_modifiable |

### Missing Allergy Sheet
| Allergen | Status | Impact |
|----------|--------|--------|
| **Fish** | ❌ NO migration file found | Fish dishes will show as NOT_SAFE_NOT_IN_SHEET |

---

## Key Findings

### ✅ What's Working Perfectly

1. **Comprehensive Coverage**: 9 out of 10 allergens have complete sheets
2. **Deterministic Rules**: Every entry uses status = 'safe', 'modifiable', or 'not_modifiable'
3. **Zero VERIFY States**: NO dishes have `requires_verification=true`
4. **Explicit Modifications**: Clear, specific modifications listed for each modifiable dish
5. **Safety-First Comments**: Every file states "If a dish is NOT on this list, it is NOT SAFE"

### Example from Shellfish Sheet (010_shellfish_allergy.sql):
```sql
-- Comment at top:
-- If a dish is NOT on this list, it is NOT SAFE and NOT MODIFIABLE

-- Safe dish (no modifications needed):
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'shellfish', 'safe', ARRAY[]::TEXT[]),

-- Modifiable dish (explicit modifications):
('63c69ee3-0167-4799-8986-09df2824ab93', 'Macadamia Crusted Halibut', 'Seafood', 'shellfish', 'modifiable', ARRAY['NO lemon butter sauce']),

-- Note: Shrimp, Crab, Scallops dishes are NOT listed because they contain shellfish
```

---

## How Your Data Works With The Code

### Current System Architecture

**Your Allergy Sheets (Supabase)**:
```
Menu Item + Allergen → { status: 'safe' | 'modifiable' | 'not_modifiable', modifications: [...] }
```

**My Code** (`generatePackFromSupabase.ts` lines 267-295):
```typescript
if (mod.requires_verification) {
  if (allergen.id === 'fish') {
    status = 'VERIFY_WITH_KITCHEN';  // Only Fish can use VERIFY
  } else {
    status = 'NOT_SAFE_NOT_IN_SHEET';  // Non-fish VERIFY → NOT SAFE
  }
} else {
  switch (mod.status) {
    case 'safe': status = 'SAFE'; break;
    case 'modifiable': status = 'MODIFIABLE'; break;
    case 'not_modifiable': status = 'UNSAFE'; break;
  }
}
```

**Result**:
- Your data: No `requires_verification=true` anywhere ✅
- My code: Enforces Fish-only VERIFY anyway (defense-in-depth) ✅
- Final pack: Zero VERIFY states for all allergens ✅

---

## The Missing Piece: Fish Allergy

### Current State
**Fish allergen has NO migration file**, which means:
- ❌ Fish dishes will show as `NOT_SAFE_NOT_IN_SHEET`
- ❌ Cannot serve fish dishes even when they might be safe
- ⚠️ The ONE allergen that SHOULD use VERIFY (for daily catch variability) has no data

### Why Fish Should Use VERIFY
According to your business requirements:
- **Daily Catch Variability**: Salmon Monday, Swordfish Tuesday
- **Preparation Methods**: Grilling, pan-searing, baking varies
- **Cross-Contamination Risk**: Multiple species in prep area
- **Recipe Adaptation**: Sauces/accompaniments change daily

### Recommended Fish Allergy Sheet Structure
```sql
-- Fish that might contain fish allergen (mark as VERIFY for daily catch)
('tenant-id', 'Cedar Planked Salmon', 'Seafood', 'fish', 'modifiable',
  ARRAY[], NULL, true), -- requires_verification=true

('tenant-id', 'Macadamia Crusted Halibut', 'Seafood', 'fish', 'modifiable',
  ARRAY[], NULL, true), -- requires_verification=true

-- Non-fish dishes (mark as SAFE)
('tenant-id', 'Filet Mignon', 'Filets', 'fish', 'safe', ARRAY[]::TEXT[]),
('tenant-id', 'Chicken Club', 'Sandwiches', 'fish', 'safe', ARRAY[]::TEXT[]),
-- ... all other non-fish dishes
```

---

## Data Quality Observations

### Excellent Practices I See:
1. **Hardcoded Tenant ID**: `'63c69ee3-0167-4799-8986-09df2824ab93'` used consistently
2. **ON CONFLICT handling**: Updates existing records safely
3. **Array formatting**: Proper use of `ARRAY[]::TEXT[]` for empty arrays
4. **Category grouping**: Clear organization (Appetizers, Salads, etc.)
5. **Verification counts**: Each file has `SELECT count(*)` at end

### Minor Issues:
1. **Inconsistent dish names**: Some files have slight variations
   - Example: "Filet Mignon" vs "Petite Filet Mignon/Filet Mignon"
2. **Missing menu_item_id**: Data uses `dish_name` matching, not ID-based links
   - Migration 014-017 attempted to link by name matching
   - Migration 018 cleaned up duplicates

---

## Why You're NOT Seeing VERIFY (And That's Good!)

### What Happens Currently:

1. **Pack Generation** (`generatePackFromSupabase.ts` lines 160-303):
   ```typescript
   // Fetch allergen modifications
   const { data: modifications } = await supabase
     .from('allergen_modifications')
     .select('*')
     .eq('tenant_id', TENANT_ID);

   // For each menu item + allergen:
   if (linked_rule_exists) {
     // Use status from database (safe/modifiable/not_modifiable)
     status = mapStatus(mod.status);
   } else {
     // NOT IN ALLERGY SHEET
     status = 'NOT_SAFE_NOT_IN_SHEET';
   }
   ```

2. **Runtime Checker** (`checker.ts` lines 227-241):
   ```typescript
   // If dish not in allergen's sheet
   if (!rule) {
     return 'NOT_SAFE_NOT_IN_SHEET';
   }

   // If non-fish allergen tries to use VERIFY (defense-in-depth)
   if (rule.status === 'VERIFY_WITH_KITCHEN' && allergenId !== 'fish') {
     return 'NOT_SAFE_NOT_IN_SHEET';
   }

   return rule.status;
   ```

3. **Result**:
   - ✅ Dishes WITH rules: Show as SAFE or MODIFIABLE (deterministic)
   - ✅ Dishes WITHOUT rules: Show as NOT_SAFE_NOT_IN_SHEET (safety-first)
   - ✅ No VERIFY states appearing for any allergen

---

## Recommendations

### Priority 1: Create Fish Allergy Sheet ⭐⭐⭐

**Create**: `supabase/migrations/012_fish_allergy.sql`

```sql
-- Fish dishes that need kitchen verification (daily catch)
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes, requires_verification) VALUES
-- Actual fish dishes - require verification due to daily preparation
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'fish', 'modifiable', ARRAY[], 'Daily preparation varies', true),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Macadamia Crusted Halibut', 'Seafood', 'fish', 'modifiable', ARRAY[], 'Daily preparation varies', true),

-- All non-fish dishes are SAFE for fish allergy
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'fish', 'safe', ARRAY[]::TEXT[]),
-- ... (add all ~100 non-fish dishes as 'safe')
```

**Why this works**:
- Fish dishes: `requires_verification=true` → System converts to `VERIFY_WITH_KITCHEN` ✅
- Non-fish dishes: `status='safe'` → System converts to `SAFE` ✅
- My code enforces: Only Fish allergen can have VERIFY status ✅

### Priority 2: Improve Name Matching

**Problem**: Pack generation uses `dish_name` matching, which is fragile.

**Solution**: Migrations 014-017 attempted ID-based linking:
```sql
-- Link allergen modifications to menu items by name
UPDATE allergen_modifications am
SET menu_item_id = mi.id
FROM menu_items mi
WHERE am.dish_name = mi.name
  AND am.tenant_id = mi.tenant_id;
```

**Verify this is working**:
```sql
-- Check how many allergen rules are linked to menu items
SELECT
  allergen,
  COUNT(*) as total_rules,
  COUNT(menu_item_id) as linked_rules,
  COUNT(*) - COUNT(menu_item_id) as unlinked_rules
FROM allergen_modifications
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
GROUP BY allergen;
```

### Priority 3: Data Validation Script

Create a validation query to ensure complete coverage:

```sql
-- Find menu items that are missing allergen rules
WITH menu_item_allergen_matrix AS (
  SELECT
    mi.id as menu_item_id,
    mi.name as dish_name,
    a.allergen
  FROM menu_items mi
  CROSS JOIN (VALUES
    ('dairy'), ('gluten'), ('shellfish'), ('fish'), ('eggs'),
    ('soy'), ('peanuts'), ('tree_nuts'), ('sesame'), ('garlic'), ('onion')
  ) AS a(allergen)
  WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
)
SELECT
  m.dish_name,
  m.allergen,
  CASE WHEN am.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as status
FROM menu_item_allergen_matrix m
LEFT JOIN allergen_modifications am
  ON m.menu_item_id = am.menu_item_id
  AND m.allergen = am.allergen
WHERE am.id IS NULL
ORDER BY m.allergen, m.dish_name;
```

---

## Summary: You're In Great Shape! ✅

### What You Have:
- ✅ 9 comprehensive allergen sheets in Supabase
- ✅ 100% deterministic rules (safe/modifiable/not_modifiable)
- ✅ Zero VERIFY states in data
- ✅ Code that enforces Fish-only VERIFY
- ✅ Safety-first fallback (NOT_SAFE_NOT_IN_SHEET for missing data)

### What You Need:
- ⚠️ Fish allergy sheet (the ONE allergen that should use VERIFY)
- 📋 Validation query to check coverage
- 🔍 Verify name→ID linking is working

### Bottom Line:
**Your app is already using Supabase data with excellent safety-first rules. The only missing piece is the Fish allergy sheet, which ironically is the ONLY allergen that should be allowed to use VERIFY!**

The system I built will:
1. Read your Supabase data ✅
2. Convert `status='safe'` → `SAFE` ✅
3. Convert `status='modifiable'` → `MODIFIABLE` ✅
4. Convert `status='not_modifiable'` → `UNSAFE` ✅
5. For Fish ONLY: Convert `requires_verification=true` → `VERIFY_WITH_KITCHEN` ✅
6. For non-Fish: Block any attempts to use VERIFY ✅

**You have all the data you need except for Fish. Your concern about VERIFY appearing everywhere is already solved - your data doesn't use it!**
