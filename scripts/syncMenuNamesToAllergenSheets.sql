-- ============================================================================
-- Sync menu_items names to match allergen_modifications (allergen sheets)
-- This ensures dish names are consistent across both tables
-- ============================================================================

-- APPETIZERS
UPDATE menu_items SET name = 'French Onion Soup'
WHERE name = 'Baked French Onion Soup' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Goat Cheese'
WHERE name = 'Baked Goat Cheese' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- SALADS
UPDATE menu_items SET name = 'Steak & Blue Cheese Salad'
WHERE name = 'Steak and Blue Cheese Salad' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Chopped Salad'
WHERE name = 'Wildfire Chopped Salad' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- SANDWICHES
UPDATE menu_items SET name = 'Burger'
WHERE name = 'Thick Prime Angus Burger' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Chicken Club'
WHERE name = 'Grilled Chicken Club' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Mediterranean Salmon Sandwich'
WHERE name = 'Open Faced Mediterranean Salmon' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'French Dip'
WHERE name = 'Prime Rib French Dip' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Turkey Sandwich'
WHERE name = 'Sliced Turkey Sandwich' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Blackened Steak Sandwich'
WHERE name = 'Blackened New York Steak Sandwich' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- FILETS
UPDATE menu_items SET name = 'Tenderloin Tips'
WHERE name = 'Basil Hayden''s Bourbon Marinated Tenderloin Tips' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Petite Filet'
WHERE name LIKE 'Petite Filet%' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Dinner Filet'
WHERE name LIKE '%Filet Mignon' AND name NOT LIKE 'Petite%' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- STEAKS AND CHOPS
UPDATE menu_items SET name = 'Pork Chops'
WHERE name = 'Bone-In Pork Chops' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Skirt Steak'
WHERE name = 'Roumanian Skirt Steak' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'New York Strip'
WHERE name = 'New York Strip Steak' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Ribeye'
WHERE name = 'Bone-In Ribeye' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Lamb Chops'
WHERE name = 'Lamb Porterhouse Chops' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- SEAFOOD
UPDATE menu_items SET name = 'Salmon'
WHERE name = 'Cedar Planked Salmon' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Halibut'
WHERE name = 'Macadamia Crusted Halibut' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

UPDATE menu_items SET name = 'Crab Cake Entree'
WHERE name = 'Jumbo Lump Crab Cakes' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- DESSERTS
UPDATE menu_items SET name = 'Berries Crisp'
WHERE name = 'Seasonal Crisp' AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- Now re-run the linking to connect allergen rules
UPDATE allergen_modifications am
SET menu_item_id = mi.id
FROM menu_items mi
WHERE am.tenant_id = mi.tenant_id
  AND LOWER(TRIM(am.dish_name)) = LOWER(TRIM(mi.name))
  AND am.menu_item_id IS NULL
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- Show updated link counts
SELECT
  'After sync - Linked rules:' as status,
  COUNT(*) as count
FROM allergen_modifications
WHERE menu_item_id IS NOT NULL
  AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT
  'After sync - Unlinked rules:' as status,
  COUNT(*) as count
FROM allergen_modifications
WHERE menu_item_id IS NULL
  AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- Show remaining unlinked dishes
SELECT DISTINCT
  am.dish_name as "Still Unlinked Dish",
  am.category
FROM allergen_modifications am
WHERE am.menu_item_id IS NULL
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ORDER BY am.category, am.dish_name;
