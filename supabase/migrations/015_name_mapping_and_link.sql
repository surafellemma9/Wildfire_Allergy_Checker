-- ============================================================================
-- COMPREHENSIVE NAME MAPPING AND LINKING
-- Maps allergen rule dish names to canonical menu item names
-- ============================================================================

-- Step 1: Add menu_item_id column if not exists
ALTER TABLE allergen_modifications
ADD COLUMN IF NOT EXISTS menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_allergen_mods_menu_item 
ON allergen_modifications(menu_item_id);

-- Step 2: Create a temporary name mapping table
CREATE TEMP TABLE name_mapping (
  rule_name TEXT PRIMARY KEY,
  menu_name TEXT NOT NULL
);

-- Step 3: Populate name mappings (rule_name -> menu_name)
-- These map allergen_modifications.dish_name to menu_items.name
INSERT INTO name_mapping (rule_name, menu_name) VALUES
-- Exact matches (these will match automatically, but listing for completeness)
-- Appetizers variations
('French Onion Soup', 'Baked French Onion Soup'),
('Fried Calamari', 'Crispy Calamari'),
('Goat Cheese', 'Baked Goat Cheese'),
('Sea Scallops', 'Bacon Wrapped Sea Scallop Skewers'),
('Shrimp Cocktail', 'Shrimp Cocktail'),

-- Salads
('Field Green Salad', 'Field Salad'),
('Tuscan Kale Salad', 'Tuscan Kale and Spinach Salad'),
('Kale and Spinach Salad', 'Tuscan Kale and Spinach Salad'),

-- Steaks
('Petite Filet', 'Petite Filet Mignon'),
('Dinner Filet', 'Filet Mignon'),
('Filet', 'Filet Mignon'),
('New York Strip', 'New York Strip Steak'),
('New York', 'New York Strip Steak'),
('Porterhouse', 'Porterhouse Steak'),
('Roumanian Skirt Steak', 'Romanian Skirt Steak'),
('Skirt Steak', 'Romanian Skirt Steak'),

-- Prime Rib
('Prime Rib', 'Roasted Prime Rib'),
('Roasted Prime Rib of Beef', 'Roasted Prime Rib'),

-- Lamb
('Lamb Chops', 'Lamb Porterhouse Chops'),
('Lamb Porterhouse', 'Lamb Porterhouse Chops'),

-- Pork
('Pork Chops', 'Bone-In Pork Chops'),
('Mushroom Crusted Pork Chops', 'Bone-In Pork Chops'),

-- Chicken & BBQ
('Spit-Roasted Chicken', 'Spit-Roasted Rotisserie Chicken'),
('Rotisserie Chicken', 'Spit-Roasted Rotisserie Chicken'),
('Half Chicken', 'Barbecue Half Chicken'),
('BBQ Chicken', 'Barbecue Half Chicken'),
('Barbecued Chicken', 'Barbecue Half Chicken'),
('Lemon Pepper Chicken', 'Lemon Pepper Chicken Breast'),
('Lemon Pepper Chicken Breast', 'Lemon Pepper Chicken Breast'),
('Chicken Moreno', 'Chicken Moreno'),
('Baby Back Ribs', 'Baby Back Ribs'),
('Barbecued Baby Back Ribs', 'Baby Back Ribs'),
('Rib and Chicken Combo', 'BBQ Chicken and Ribs Combo'),
('Chicken and BBQ Rib Combo', 'BBQ Chicken and Ribs Combo'),

-- Seafood
('Halibut', 'Macadamia Crusted Halibut'),
('Macadamia Nut Crusted Halibut', 'Macadamia Crusted Halibut'),
('Cedar Planked Salmon', 'Cedar Plank Salmon'),
('Salmon', 'Cedar Plank Salmon'),
('Scallops de Jonghe', 'East Coast Scallops De Jonghe'),
('Scallop De Jonghe', 'East Coast Scallops De Jonghe'),
('Coconut Shrimp', 'Coconut Shrimp'),
('Crab Cakes', 'Lump Crab Cakes'),
('Crab Cake Entree', 'Lump Crab Cakes'),
('Oven Roasted Crab Cakes', 'Oven Roasted Lump Crab Cakes'),

-- Sandwiches & Burgers
('Burger', 'Thick Prime Angus Burger'),
('Cheeseburger', 'Thick Prime Angus Burger'),
('Prime Angus Burger', 'Thick Prime Angus Burger'),
('Turkey Burger', 'All Natural Turkey Burger'),
('Bison Burger', 'Bison Burger'),
('Chicken Club', 'Grilled Chicken Club'),
('Grilled Chicken Club', 'Grilled Chicken Club'),
('French Dip', 'Roasted Prime Rib French Dip'),
('Prime Rib French Dip', 'Roasted Prime Rib French Dip'),
('Blackened Steak Sandwich', 'Blackened New York Steak Sandwich'),
('Blackened New York Steak Sandwich', 'Blackened New York Steak Sandwich'),
('Hot Honey Chicken Sandwich', 'Crispy Hot Honey Chicken Sandwich'),
('Sliced Turkey Sandwich', 'Sliced Turkey Sandwich'),
('Open Faced Mediterranean Salmon', 'Mediterranean Salmon Sandwich'),

-- Sides
('Mashed Potatoes', 'Red Skin Mashed Potatoes'),
('Au Gratin Potatoes', 'Au Gratin Potatoes'),
('Baked Potato', 'Baked Potato'),
('Loaded Baked Potato', 'Loaded Baked Potato'),
('Sweet Potato', 'Sweet Potato'),
('Broccoli', 'Steamed Broccoli'),
('Broccoli with Lemon Vinaigrette', 'Steamed Broccoli'),
('Steamed Broccoli', 'Steamed Broccoli'),
('Roasted Vegetables', 'Roasted Market Vegetables'),
('Mushroom Caps', 'Roasted Mushroom Caps'),
('Sauteed Mushroom Caps', 'Roasted Mushroom Caps'),
('Coleslaw', 'Coleslaw'),
('Applesauce', 'Applesauce'),
('French Fries', 'French Fries'),
('Cottage Fries', 'Cottage Fries'),

-- Nightly Specials
('Long Island Duck', 'Tuesday: Long Island Duck'),
('Duck', 'Tuesday: Long Island Duck'),
('Short Ribs', 'Thursday: Beer Braised Short Ribs'),
('Beer Braised Short Ribs', 'Thursday: Beer Braised Short Ribs'),
('Filet Wellington', 'Friday & Saturday: Filet Mignon Wellington'),
('Friday: Filet Wellington', 'Friday & Saturday: Filet Mignon Wellington'),
('Roast Turkey', 'Sunday: Roast Turkey Dinner'),
('Turkey Dinner', 'Sunday: Roast Turkey Dinner'),
('Sunday: Roast Turkey', 'Sunday: Roast Turkey Dinner'),

-- Kids
('Kids Burger', 'Kids Burger/Cheeseburger'),
('Kids Cheeseburger', 'Kids Burger/Cheeseburger'),
('Kids Filet', 'Kids Filet'),
('Kids Chicken Fingers', 'Kids Chicken Fingers'),
('Kids Grilled Cheese', 'Kids Grilled Cheese'),
('Kids Macaroni and Cheese', 'Kids Macaroni and Cheese'),
('Kids Mac and Cheese', 'Kids Macaroni and Cheese'),
('Kids Hot Fudge Sundae', 'Kids Hot Fudge Sundae'),
('Kids Scramble', 'Kids Scramble'),
('Kids Pancakes', 'Kids Buttermilk Pancakes'),
('Kids Buttermilk Pancakes', 'Kids Buttermilk Pancakes'),
('Kids French Toast', 'Kids French Toast'),
('Kids Chocolate Chip Pancakes', 'Kids Chocolate Chip Pancakes'),

-- Desserts
('Flourless Chocolate Cake', 'Flourless Chocolate Cake'),
('Chocolate Cake', 'Chocolate Layer Cake'),
('Triple Layer Chocolate Cake', 'Chocolate Layer Cake'),
('Chocolate Layer Cake', 'Chocolate Layer Cake'),
('Cheesecake', 'New York Style Cheesecake'),
('New York Cheesecake', 'New York Style Cheesecake'),
('Cherry Pie', 'Door County Cherry Pie'),
('Door County Cherry Pie', 'Door County Cherry Pie'),
('Seasonal Crisp', 'Seasonal Berry Crisp'),
('Berries Crisp', 'Seasonal Berry Crisp'),
('Chocolate Chip Cookie', 'Warm Chocolate Chip Cookie Skillet'),
('Vanilla Ice Cream', 'Vanilla Bean Ice Cream'),

-- Brunch
('Eggs Benedict', 'Classic Eggs Benedict'),
('Crab Cake Benedict', 'Crab Cake Benedict'),
('Eggs Florentine', 'Eggs Florentine'),
('Smoked Salmon Benedict', 'Smoked Salmon Benedict'),
('Classic Breakfast', 'Classic Breakfast'),
('Avocado Toast', 'Avocado Toast'),
('Avocado Toast and Eggs', 'Avocado Toast and Eggs'),
('Avocado Toast with Sliced Tomatoes', 'Avocado Toast with Sliced Tomatoes'),
('Buttermilk Pancakes', 'Buttermilk Pancakes'),
('Steak and Eggs', 'Skirt Steak and Eggs'),
('Skirt Steak and Eggs', 'Skirt Steak and Eggs'),
('Spinach and Kale Frittata', 'Spinach and Kale Frittata'),
('Breakfast Burrito', 'Turkey Sausage Breakfast Burrito'),
('Turkey Sausage Breakfast Burrito', 'Turkey Sausage Breakfast Burrito'),
('Breakfast Potatoes', 'Breakfast Potatoes'),
('Breakfast Potatoes and Onions', 'Breakfast Potatoes'),
('Belgian Waffle', 'Belgian Waffle'),
('Harvest Grain Bowl', 'Harvest Grain Bowl'),

-- Steak add-ons
('Bearnaise Sauce', 'Béarnaise Sauce'),
('Oscar Style', 'Oscar Style'),
('Shrimp Skewer', 'Shrimp Skewer'),

-- Miscellaneous
('Bacon', 'Side of Bacon'),
('Applewood Bacon', 'Side of Bacon'),
('Side of Bacon', 'Side of Bacon'),
('Turkey Sausage', 'Side of Turkey Sausage'),
('Side of Turkey Sausage', 'Side of Turkey Sausage'),
('Side of Eggs', 'Side of Eggs'),
('Fresh Fruit', 'Side of Fresh Fruit'),
('Side of Fresh Fruit', 'Side of Fresh Fruit'),
('Wheat Toast', 'Side of Wheat Toast')

ON CONFLICT (rule_name) DO NOTHING;

-- Step 4: Link allergen_modifications to menu_items using exact match first
UPDATE allergen_modifications am
SET menu_item_id = mi.id
FROM menu_items mi
WHERE am.tenant_id = mi.tenant_id
  AND LOWER(TRIM(am.dish_name)) = LOWER(TRIM(mi.name))
  AND am.menu_item_id IS NULL;

-- Step 5: Link using the name mapping table
UPDATE allergen_modifications am
SET menu_item_id = mi.id
FROM name_mapping nm, menu_items mi
WHERE LOWER(TRIM(am.dish_name)) = LOWER(nm.rule_name)
  AND LOWER(TRIM(mi.name)) = LOWER(nm.menu_name)
  AND am.tenant_id = mi.tenant_id
  AND am.menu_item_id IS NULL;

-- Step 6: Report results
SELECT '=== LINKING RESULTS ===' as report;

SELECT 
  'Linked rules:' as status,
  COUNT(*) as count
FROM allergen_modifications
WHERE menu_item_id IS NOT NULL
  AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT 
  'Unlinked rules:' as status,
  COUNT(*) as count
FROM allergen_modifications
WHERE menu_item_id IS NULL
  AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT 
  'Menu items with rules:' as status,
  COUNT(DISTINCT mi.id) as count
FROM menu_items mi
JOIN allergen_modifications am ON am.menu_item_id = mi.id
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT 
  'Menu items without rules:' as status,
  COUNT(*) as count
FROM menu_items mi
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND NOT EXISTS (
    SELECT 1 FROM allergen_modifications am 
    WHERE am.menu_item_id = mi.id
  );

-- Step 7: Show remaining unlinked rules (for manual review)
SELECT DISTINCT am.dish_name as "Unlinked Rule Dish Name"
FROM allergen_modifications am
WHERE am.menu_item_id IS NULL
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ORDER BY am.dish_name;

-- Step 8: Show menu items without any rules (will show as UNKNOWN)
SELECT mi.name as "Menu Item Without Rules"
FROM menu_items mi
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND NOT EXISTS (
    SELECT 1 FROM allergen_modifications am 
    WHERE am.menu_item_id = mi.id
  )
ORDER BY mi.name;
