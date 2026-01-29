# Category Consolidation - Changes Summary

## Changes Made

### 1. Renamed "Nightly Specials" → "Specials" ✓
The existing 5 nightly specials are now in the "Specials" category:
- Monday & Tuesday: Southern Fried Chicken
- Wednesday: Spit Roasted Half Long Island Duck
- Thursday: Beer Braised Short Ribs
- Friday & Saturday: Filet Mignon Wellington
- Sunday: Spit Roasted Turkey Dinner

**Files Updated:**
- `src/data/menu-items.ts` - Changed category field for all 5 specials
- `src/config/nightlySpecials.ts` - Updated documentation and references
- `src/core/checker/checker.ts` - Updated category detection logic
- `scripts/generatePackFromSupabase.ts` - Changed CATEGORY_CONFIG
- `scripts/generateTenantPack.ts` - Updated CATEGORY_MAP and entree categories

### 2. Renamed "Chicken and Barbecue" → "Chicken & BBQ" ✓
Consolidated naming for consistency across the codebase.

**Files Updated:**
- `src/data/menu-items.ts` - Updated all items in this category
- `src/config/categoryReviewFlags.ts` - Updated review flag configuration
- `scripts/generatePackFromSupabase.ts` - Changed CATEGORY_CONFIG
- `scripts/applyDairyAllergensAllCategories.ts` - Updated references
- `scripts/applyEggAllergensAllCategories.ts` - Updated references
- `scripts/applyGlutenAllergensAllCategories.ts` - Updated references
- `scripts/applySesameAllergensAllCategories.ts` - Updated references
- `scripts/applyPeanutTreenutAllergensAllCategories.ts` - Updated references
- `scripts/applySoyAllergensAllCategories.ts` - Updated references
- `scripts/applyOnionAllergensAllCategories.ts` - Updated references
- `scripts/generateMenuItemsSQL.ts` - Updated category mapping

### 3. "Kids Menu" Category ✓
Only one "Kids Menu" category exists (no "Kids" duplicate to merge).
- Kept as "Kids Menu" for clarity
- No changes needed

## Current Category Structure

After consolidation, the categories are:
1. Appetizers
2. Salads
3. Filets
4. Steaks and Chops
5. Prime Rib
6. Fresh Fish and Seafood
7. **Chicken & BBQ** (renamed)
8. Sandwiches: Prime Burgers
9. Sandwiches: Signatures
10. Sides
11. **Specials** (renamed, contains 5 dishes)
12. Special Party Items
13. Kids Menu
14. Desserts
15. Brunch

## Test Results

**Before Changes:**
- Test Files: 8 failed | 3 passed (11)
- Tests: 51 failed | 2606 passed (2657)

**After Changes:**
- Test Files: 8 failed | 3 passed (11)
- Tests: 51 failed | 2606 passed (2657)

✓ No new test failures introduced
✓ All category references updated consistently
✓ Specials category properly configured with filtering logic

## Verification Commands

```bash
# Verify category names in data
grep -o '"category": "[^"]*"' src/data/menu-items.ts | sort -u

# Count items per category
grep '"category":' src/data/menu-items.ts | sort | uniq -c

# Run tests
npm test
```

## Notes

- The "Specials" category retains all filtering logic from the previous "Nightly Specials" configuration
- The review flag for "Chicken & BBQ" is still active (marks category as needing allergy review)
- No data was lost or duplicated during the consolidation
- All 5 specials remain in the Specials category as expected
