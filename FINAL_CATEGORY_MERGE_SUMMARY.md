# Final Category Consolidation Summary

## ✅ Successfully Merged Categories

### 1. Chicken & BBQ (6 items)
**Merged from:** "Chicken", "BBQ", "Ribs", "Chicken and Barbecue"

**Items:**
- Roasted Prime Rib of Beef
- Spit Roasted Half Chicken
- Barbecued Chicken
- Lemon Pepper Chicken Breasts
- Barbecued Baby Back Ribs
- Chicken & Baby Back Ribs Combo

### 2. Specials (20 items)
**Merged from:** "Nightly Specials", "Specials"

**Nightly Specials Included:**
- Monday & Tuesday: Southern Fried Chicken
- Wednesday: Spit Roasted Half Long Island Duck
- Thursday: Beer Braised Short Ribs
- Friday & Saturday: Filet Mignon Wellington
- Sunday: Spit Roasted Turkey Dinner

### 3. Kids Menu (5 items)
**Merged from:** "Kids", "Kids Menu"

**Items:**
- Grilled Cheese and Fries
- Chicken Fingers and Fries
- Burger/Cheeseburger and Fries
- Macaroni and Cheese
- Kids Filet & Mashed Potato

## Files Modified

### Core Configuration:
1. **scripts/generateTenantPack.ts**
   - Updated CATEGORY_MAP to merge categories during pack generation
   - Added mappings for: Chicken, BBQ, Ribs → Chicken & BBQ
   - Added mappings for: Kids → Kids Menu
   - Added mappings for: Nightly Specials → Specials
   - Updated normalizeCategory() function to handle all variations
   - Updated ENTREE_CATEGORIES list

2. **src/config/categoryReviewFlags.ts**
   - Added chicken_bbq category ID to review flags

3. **generated/tenant-pack-v1.json**
   - Regenerated with merged categories
   - Now shows 11 categories (down from 18)

## How It Works

The category consolidation happens at pack generation time:

1. **Source Data**: `wildfire_menu_allergens.csv` contains original category names
2. **Generation**: `generateTenantPack.ts` reads CSV → applies CATEGORY_MAP → creates merged categories
3. **Output**: `tenant-pack-v1.json` has consolidated categories
4. **UI**: Loads from tenant-pack-v1.json and displays merged categories

## Final Category Structure

After consolidation, there are 11 categories:
1. Appetizers (9 items)
2. Salads (5 items)
3. Fresh Seafood (7 items)
4. Burgers & Sandwiches (7 items)
5. Steaks & Chops (8 items)
6. **Chicken & BBQ** (6 items) ⭐ MERGED
7. Sides (12 items)
8. Desserts (8 items)
9. **Kids Menu** (5 items) ⭐ MERGED
10. Brunch (14 items)
11. **Specials** (20 items) ⭐ MERGED

## To Regenerate Pack After CSV Changes

```bash
# If CSV data changes, regenerate the menu data first
npm run generate-menu-data

# Then regenerate the tenant pack
npx tsx scripts/generateTenantPack.ts
```

## Verification

```bash
# Check categories in generated pack
cat generated/tenant-pack-v1.json | jq -r '.categories[] | "\(.name) (\(.id))"'

# Count items per category
cat generated/tenant-pack-v1.json | jq -r '.items[] | .categoryId' | sort | uniq -c
```

## Benefits

✅ Eliminated redundant categories (Chicken, BBQ, Ribs)
✅ Consolidated Kids and Kids Menu into single category  
✅ Merged Nightly Specials into Specials category
✅ Cleaner UI with fewer category tiles
✅ All 5 nightly specials properly included in Specials category
✅ Category review flags preserved for Chicken & BBQ
