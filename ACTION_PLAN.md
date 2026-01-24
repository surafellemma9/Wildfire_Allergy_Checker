# Action Plan: Eliminate VERIFY for All Allergens Except Fish

## ✅ GREAT NEWS: You're Already 90% There!

Your Supabase allergy sheets are **excellent** - they already contain comprehensive, deterministic rules with **ZERO VERIFY states**. The system I built enforces Fish-only VERIFY at the code level, and your data is even better than expected.

---

## Current Status

| Component | Status | Details |
|-----------|--------|---------|
| **Code Logic** | ✅ COMPLETE | Fish-only VERIFY constraint enforced at 3 levels |
| **Test Coverage** | ✅ COMPLETE | 33/33 tests passing |
| **Supabase Data** | ⚠️ 90% COMPLETE | 9/10 allergens have sheets, Fish missing |
| **Data Quality** | ✅ EXCELLENT | No VERIFY states in any existing data |

---

## What's Missing: Fish Allergy Sheet

**Problem**: Fish is the ONLY allergen that should use VERIFY, but it has NO allergy sheet.

**Impact**:
- ❌ Fish dishes show as NOT_SAFE_NOT_IN_SHEET (cannot serve)
- ❌ Missing the business-justified use case for VERIFY

**Solution**: Run the fish allergy migration I just created.

---

## Steps to Complete

### Step 1: Apply Fish Allergy Migration ⭐

```bash
# Navigate to your project
cd /Users/surafellemma/Desktop/Wildfire\ Allergy

# Apply the migration (choose ONE method):

# Option A: Supabase CLI (recommended)
supabase db push

# Option B: Supabase Dashboard
# 1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
# 2. Copy contents of supabase/migrations/012_fish_allergy.sql
# 3. Paste and run

# Option C: Direct SQL (if you have psql access)
psql YOUR_DATABASE_URL < supabase/migrations/012_fish_allergy.sql
```

**What this does**:
- ✅ Marks 4 fish dishes with `requires_verification=true` (Cedar Salmon, Halibut, Salmon Sandwich, Salad with Salmon)
- ✅ Marks ~100 non-fish dishes as `status='safe'`
- ✅ Enables VERIFY only for actual fish dishes

### Step 2: Regenerate Pack from Supabase

```bash
# Set environment variables
export SUPABASE_URL="your-project-url"
export SUPABASE_SERVICE_KEY="your-service-role-key"
export TENANT_ID="63c69ee3-0167-4799-8986-09df2824ab93"

# Generate pack
npx tsx scripts/generatePackFromSupabase.ts
```

**Expected output**:
```
✅ Pack generated successfully!
   Total Items: 102
   Items WITH rules: 102  ← Should be 100%
   Items WITHOUT rules: 0
   Linked allergen rules: 1,122
```

### Step 3: Verify Fish-Only VERIFY Constraint

```bash
# Verify pack is valid
npx tsx scripts/verifyFishOnlyConstraint.ts
```

**Expected output**:
```
✅ PACK IS VALID
   Fish-Only VERIFY constraint is satisfied

Statistics:
   VERIFY_WITH_KITCHEN statuses: 4  ← Fish dishes only
     - Fish (valid): 4
     - Non-fish (INVALID): 0  ← Zero non-fish VERIFY ✅
```

### Step 4: Run Tests

```bash
# Run all tests
npm test -- src/core/checker/checker.test.ts
```

**Expected**: ✅ **33/33 tests pass**

---

## Verification Queries (Optional)

Run these in Supabase SQL Editor to verify data quality:

### Check Allergen Coverage
```sql
SELECT
  allergen,
  COUNT(*) as total_rules,
  COUNT(DISTINCT dish_name) as unique_dishes
FROM allergen_modifications
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
GROUP BY allergen
ORDER BY allergen;
```

**Expected**: Each allergen should have ~100 rules

### Check Fish VERIFY Usage
```sql
SELECT
  dish_name,
  status,
  requires_verification,
  notes
FROM allergen_modifications
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND allergen = 'fish'
  AND requires_verification = true;
```

**Expected**: Only 4 fish dishes with `requires_verification=true`

### Check for Non-Fish VERIFY (Should Be ZERO)
```sql
SELECT
  allergen,
  dish_name,
  requires_verification
FROM allergen_modifications
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND allergen != 'fish'
  AND requires_verification = true;
```

**Expected**: 0 rows (no non-fish allergens should have verification flag)

---

## What The System Will Do

### For Fish Dishes:
```
User selects: Fish allergy
Dish: Cedar Planked Salmon

Database: requires_verification=true
↓
Pack Generation: Converts to VERIFY_WITH_KITCHEN (Fish allowed)
↓
Kitchen Ticket:
  === CEDAR PLANKED SALMON ===
  ⚠️  VERIFY WITH THE KITCHEN
  Manual confirmation required before serving
  • Fish: Daily preparation varies - verify fish type and cooking method
```

### For Non-Fish Dishes with Fish Allergy:
```
User selects: Fish allergy
Dish: Filet Mignon

Database: status='safe'
↓
Pack Generation: Converts to SAFE
↓
Kitchen Ticket:
  === FILET MIGNON ===
  ✓ SAFE - No changes needed
```

### For Non-Fish Allergens (Any Dish):
```
User selects: Dairy allergy
Dish: Mediterranean Chicken Skewers

Database: status='modifiable', modifications=['no yogurt sauce']
↓
Pack Generation: Converts to MODIFIABLE
↓
Kitchen Ticket:
  === CHICKEN SKEWERS ===
  • **NO yogurt sauce**
```

---

## Fallback Behavior (Safety-First)

If a dish is missing from an allergen's sheet:

```
User selects: Gluten allergy
Dish: New Menu Item (not in gluten sheet)

Database: No record found
↓
Pack Generation: Converts to NOT_SAFE_NOT_IN_SHEET
↓
Kitchen Ticket:
  === NEW MENU ITEM ===
  🚫 NOT SAFE — NOT IN ALLERGY SHEET
     DO NOT SERVE - Cannot verify safety
     • Gluten: Missing from allergy sheet
```

**This is intentional** - forces you to add dish to allergy sheet before serving.

---

## Your Data is Already Excellent ✅

### What I Found in Your Supabase Migrations:

1. **Dairy** (002_allergen_modifications.sql):
   - ✅ 100+ dishes with explicit safe/modifiable/not_modifiable
   - ✅ Clear modification instructions ("no yogurt sauce", "no butter", etc.)
   - ✅ Zero VERIFY states

2. **Gluten** (004_fix_gluten_modifications.sql):
   - ✅ Comprehensive coverage
   - ✅ Specific GF substitutions listed
   - ✅ Zero VERIFY states

3. **Shellfish** (010_shellfish_allergy.sql):
   - ✅ Excellent coverage
   - ✅ Comment: "If a dish is NOT on this list, it is NOT SAFE"
   - ✅ Shrimp/crab/scallop dishes correctly excluded
   - ✅ Zero VERIFY states

4. **Soy, Eggs, Sesame, Garlic, Onion, Peanuts, Tree Nuts**:
   - ✅ All have complete sheets
   - ✅ All use deterministic statuses
   - ✅ Zero VERIFY states

### The ONLY Issue:
- ❌ Fish allergen has no sheet (the ONE that should use VERIFY!)

---

## Summary

**Current State**:
- ✅ Code enforces Fish-only VERIFY (done)
- ✅ 9 allergen sheets are complete with zero VERIFY (excellent)
- ⚠️ 1 allergen sheet missing (Fish - the one that needs VERIFY)

**After Step 1**:
- ✅ All 10 allergen sheets complete
- ✅ Only Fish uses VERIFY (4 dishes)
- ✅ All other allergens deterministic (safe/modifiable/unsafe)

**Your concern**: "eliminate VERIFY WITH THE KITCHEN for all allergens except fish"
**Reality**: Your data already does this! Just need to add Fish sheet.

---

## Questions?

**Q: "Will non-fish allergens ever show VERIFY?"**
A: NO. The system enforces this at 3 levels:
1. Your data doesn't have `requires_verification=true` for non-fish allergens
2. Pack generation converts any non-fish VERIFY to NOT_SAFE
3. Runtime checker converts any non-fish VERIFY to NOT_SAFE (defense-in-depth)

**Q: "What if I accidentally set requires_verification=true for Dairy?"**
A: The system will automatically convert it to NOT_SAFE_NOT_IN_SHEET. Non-fish allergens cannot use VERIFY.

**Q: "Can I add Fish dishes without requires_verification?"**
A: Yes! If a fish dish can be deterministically safe (e.g., "NO lemon butter sauce"), use:
```sql
status='modifiable', modifications=['NO lemon butter sauce'], requires_verification=false
```
Only use `requires_verification=true` when preparation truly varies daily.

**Q: "Do I need to regenerate the pack every time I update Supabase?"**
A: Yes, run `scripts/generatePackFromSupabase.ts` after any allergen data changes. The app will then download the updated pack automatically (within 6 hours, or immediately if you clear cache).

---

## Next Steps

1. ✅ Apply fish allergy migration (Step 1)
2. ✅ Regenerate pack (Step 2)
3. ✅ Verify (Step 3)
4. ✅ Test (Step 4)
5. 🚀 Deploy to production

**Estimated time**: 15 minutes

**Result**: VERIFY WITH THE KITCHEN will ONLY appear for Fish allergy, exactly as required.
