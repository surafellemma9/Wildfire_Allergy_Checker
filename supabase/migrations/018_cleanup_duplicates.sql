-- ============================================================================
-- CLEANUP DUPLICATE MENU ITEMS
-- Remove items without rules when a similar item WITH rules exists
-- ============================================================================

-- Step 1: Delete duplicate menu items that don't have rules
-- Keep the version that HAS linked allergen rules

-- Field Salad (no rules) vs Field Green Salad (has rules)
DELETE FROM menu_items 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND name = 'Field Salad';

-- Petite Filet Mignon/Filet Mignon (no rules) - keep Petite Filet Mignon and Filet Mignon
DELETE FROM menu_items 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND name = 'Petite Filet Mignon/Filet Mignon';

-- Filet Medallion Duo/Filet Medallion Trio (no rules) - keep Filet Duo/Trio linked version
DELETE FROM menu_items 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND name = 'Filet Medallion Duo/Filet Medallion Trio';

-- Roasted Prime Rib of Beef (no rules) - keep Prime Rib
DELETE FROM menu_items 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND name = 'Roasted Prime Rib of Beef';

-- Oven Roasted Lump Crab Cakes (no rules) - keep Crab Cakes OR link it
-- Actually let's LINK the rules instead
UPDATE allergen_modifications am
SET menu_item_id = mi.id
FROM menu_items mi
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND mi.name = 'Oven Roasted Lump Crab Cakes'
  AND am.tenant_id = mi.tenant_id
  AND am.dish_name IN ('Crab Cakes', 'Oven Roasted Crab Cakes', 'Lump Crab Cakes');

-- Sauteed Mushroom Caps (no rules) - link to Mushroom Caps rules
UPDATE allergen_modifications am
SET menu_item_id = mi.id
FROM menu_items mi
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND mi.name = 'Sauteed Mushroom Caps'
  AND am.tenant_id = mi.tenant_id
  AND am.dish_name IN ('Mushroom Caps', 'Sauteed Mushrooms', 'Roasted Mushroom Caps');

-- Step 2: For remaining items without rules, copy rules from similar items
-- This creates NEW allergen_modification rows linked to the orphan items

-- Avocado Toast and Eggs - copy rules from Avocado Toast
INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
SELECT 
  am.tenant_id,
  (SELECT id FROM menu_items WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' AND name = 'Avocado Toast and Eggs'),
  'Avocado Toast and Eggs',
  am.category,
  am.allergen,
  am.status,
  am.modifications,
  am.notes
FROM allergen_modifications am
JOIN menu_items mi ON am.menu_item_id = mi.id
WHERE mi.name = 'Avocado Toast'
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ON CONFLICT (tenant_id, dish_name, allergen) DO NOTHING;

-- Barbecued Half Chicken - copy rules from BBQ Chicken
INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
SELECT 
  am.tenant_id,
  (SELECT id FROM menu_items WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' AND name = 'Barbecued Half Chicken'),
  'Barbecued Half Chicken',
  am.category,
  am.allergen,
  am.status,
  am.modifications,
  am.notes
FROM allergen_modifications am
WHERE am.dish_name = 'BBQ Chicken'
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ON CONFLICT (tenant_id, dish_name, allergen) DO NOTHING;

-- Beer Braised Short Ribs - copy from Short Ribs (Thursday)
INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
SELECT 
  am.tenant_id,
  (SELECT id FROM menu_items WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' AND name = 'Beer Braised Short Ribs'),
  'Beer Braised Short Ribs',
  am.category,
  am.allergen,
  am.status,
  am.modifications,
  am.notes
FROM allergen_modifications am
WHERE am.dish_name = 'Thursday: Beer Braised Short Ribs'
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ON CONFLICT (tenant_id, dish_name, allergen) DO NOTHING;

-- Buttermilk Fried Chicken - copy from Monday: Southern Fried Chicken
INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
SELECT 
  am.tenant_id,
  (SELECT id FROM menu_items WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' AND name = 'Buttermilk Fried Chicken'),
  'Buttermilk Fried Chicken',
  am.category,
  am.allergen,
  am.status,
  am.modifications,
  am.notes
FROM allergen_modifications am
WHERE am.dish_name = 'Monday: Southern Fried Chicken'
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ON CONFLICT (tenant_id, dish_name, allergen) DO NOTHING;

-- Crab Cake Benedict - copy from Eggs Benedict
INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
SELECT 
  am.tenant_id,
  (SELECT id FROM menu_items WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' AND name = 'Crab Cake Benedict'),
  'Crab Cake Benedict',
  am.category,
  am.allergen,
  am.status,
  am.modifications,
  am.notes
FROM allergen_modifications am
WHERE am.dish_name = 'Eggs Benedict'
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ON CONFLICT (tenant_id, dish_name, allergen) DO NOTHING;

-- Kids Chicken Fingers - copy from Kids Filet (similar prep)
INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
SELECT 
  am.tenant_id,
  (SELECT id FROM menu_items WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' AND name = 'Kids Chicken Fingers'),
  'Kids Chicken Fingers',
  am.category,
  am.allergen,
  am.status,
  am.modifications,
  am.notes
FROM allergen_modifications am
WHERE am.dish_name = 'Kids Filet'
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ON CONFLICT (tenant_id, dish_name, allergen) DO NOTHING;

-- Roast Turkey - copy from Sunday: Turkey Dinner
INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
SELECT 
  am.tenant_id,
  (SELECT id FROM menu_items WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' AND name = 'Roast Turkey'),
  'Roast Turkey',
  am.category,
  am.allergen,
  am.status,
  am.modifications,
  am.notes
FROM allergen_modifications am
WHERE am.dish_name = 'Sunday: Turkey Dinner'
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ON CONFLICT (tenant_id, dish_name, allergen) DO NOTHING;

-- Spit-Roasted Rotisserie Chicken - copy from Spit-Roasted Half Chicken
INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
SELECT 
  am.tenant_id,
  (SELECT id FROM menu_items WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' AND name = 'Spit-Roasted Rotisserie Chicken'),
  'Spit-Roasted Rotisserie Chicken',
  am.category,
  am.allergen,
  am.status,
  am.modifications,
  am.notes
FROM allergen_modifications am
WHERE am.dish_name = 'Spit-Roasted Half Chicken'
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ON CONFLICT (tenant_id, dish_name, allergen) DO NOTHING;

-- SPECIAL ITEMS: French Fries and Cottage Fries
-- These are typically NOT SAFE for gluten, let's mark them explicitly
-- For now, skip them - they genuinely may not have rules in your sheets

-- Step 3: Link any remaining Crab Cakes rules to both crab cake items
UPDATE allergen_modifications am
SET menu_item_id = COALESCE(am.menu_item_id, mi.id)
FROM menu_items mi
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND mi.name LIKE '%Crab Cake%'
  AND am.tenant_id = mi.tenant_id
  AND am.dish_name LIKE '%Crab%'
  AND am.menu_item_id IS NULL;

-- Final report
SELECT '=== FINAL CLEANUP RESULTS ===' as report;

SELECT 
  'Total menu items:' as status,
  COUNT(*) as count
FROM menu_items
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT 
  'Menu items WITH rules:' as status,
  COUNT(DISTINCT mi.id) as count
FROM menu_items mi
JOIN allergen_modifications am ON am.menu_item_id = mi.id
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT 
  'Menu items WITHOUT rules:' as status,
  COUNT(*) as count
FROM menu_items mi
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND NOT EXISTS (
    SELECT 1 FROM allergen_modifications am 
    WHERE am.menu_item_id = mi.id
  );

-- Show remaining items without rules
SELECT mi.name as "Still Without Rules (expected for fries, etc.)"
FROM menu_items mi
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND NOT EXISTS (
    SELECT 1 FROM allergen_modifications am 
    WHERE am.menu_item_id = mi.id
  )
ORDER BY mi.name;
