-- ============================================================================
-- ADD FOREIGN KEY LINKING allergen_modifications TO menu_items
-- This eliminates string-based matching and ensures data integrity
-- ============================================================================

-- Step 1: Add the menu_item_id column (nullable initially for backfill)
ALTER TABLE allergen_modifications
ADD COLUMN IF NOT EXISTS menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE;

-- Create index for fast joins
CREATE INDEX IF NOT EXISTS idx_allergen_mods_menu_item 
ON allergen_modifications(menu_item_id);

-- Step 2: Backfill menu_item_id using EXACT name matches
-- This links allergen rules to menu items where names match exactly
UPDATE allergen_modifications am
SET menu_item_id = mi.id
FROM menu_items mi
WHERE am.tenant_id = mi.tenant_id
  AND LOWER(TRIM(am.dish_name)) = LOWER(TRIM(mi.name))
  AND am.menu_item_id IS NULL;

-- Step 3: Report on matching results
SELECT 
  'Exact matches (linked):' as status,
  COUNT(*) as count
FROM allergen_modifications
WHERE menu_item_id IS NOT NULL
  AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT 
  'Unlinked rules (no exact match):' as status,
  COUNT(*) as count
FROM allergen_modifications
WHERE menu_item_id IS NULL
  AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- Step 4: Show unlinked rule dish names (distinct)
SELECT DISTINCT
  am.dish_name as "Unlinked Rule Dish Name"
FROM allergen_modifications am
WHERE am.menu_item_id IS NULL
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ORDER BY am.dish_name;

-- Step 5: Show all menu item names for comparison
SELECT 
  mi.name as "Menu Item Name"
FROM menu_items mi
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ORDER BY mi.name;
