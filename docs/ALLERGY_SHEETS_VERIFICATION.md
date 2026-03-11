# Allergy Sheets Verification

## Sauce/Dressing YES–NO Columns

At the end of each allergy sheet there is a column of **YES** and **NO** for sauces/dressings:

- **YES** = sauce/dressing is **safe** for that allergen  
- **NO** = sauce/dressing is **not safe** for that allergen  

The app uses this to set dressing/sauce safety per allergen (e.g. which dressings a gluten-allergic guest can choose).

## Where This Is Stored in Code

| Source | Purpose |
|--------|--------|
| `scripts/generatePackFromSupabase.ts` → `DRESSING_OPTIONS` | Per-dressing `allergenRules` (SAFE/UNSAFE) used in the tenant pack. **Source of truth for dressings.** |
| `supabase/migrations/023_dressings_schema.sql` | Initial `dressing_allergen_rules` in DB (safe/unsafe per dressing per allergen). |
| `supabase/migrations/026_lemon_parmesan_gluten_safe.sql` | Override: Lemon Parmesan = **safe** for gluten (per kitchen confirmation). |
| `scripts/apply*AllergensAllCategories.ts` (e.g. gluten, soy, egg) | Salad **notes** listing “Safe dressings: …” for each allergen; should match the YES column on the sheet. |

## Overrides in Place

- **Lemon Parmesan dressing** is treated as **SAFE for gluten** in code and DB even if the gluten allergy sheet says otherwise (per kitchen confirmation).  
- **Lemon Herb Vinaigrette** is treated as **SAFE for gluten** in code and DB (per kitchen confirmation).  
- Implemented in: `generatePackFromSupabase.ts`, `applyGlutenAllergensAllCategories.ts`, and migrations `026_lemon_parmesan_gluten_safe.sql`, `027_lemon_herb_gluten_safe.sql`.

## How to Verify Against the Sheets

The `.doc` allergy sheet files are binary and can’t be read by the repo. To verify sauce/dressing logic:

1. From each allergy sheet, copy or export the **sauce/dressing column** and the **YES/NO** column (e.g. paste into a text file or CSV), or  
2. Provide a table (e.g. in a comment or doc) with: **Allergen | Sauce/Dressing name | YES or NO**.

With that, the dressing and salad-notes logic can be checked and updated to match the sheets.
