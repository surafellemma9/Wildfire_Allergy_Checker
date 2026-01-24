-- ============================================================================
-- ADDITIONAL NAME MAPPINGS
-- Based on the "Menu Items Without Rules" report
-- ============================================================================

-- Add more mappings to the temp table (recreate it)
CREATE TEMP TABLE IF NOT EXISTS name_mapping (
  rule_name TEXT PRIMARY KEY,
  menu_name TEXT NOT NULL
);

-- Clear and repopulate with additional mappings
DELETE FROM name_mapping;

INSERT INTO name_mapping (rule_name, menu_name) VALUES
-- APPETIZERS
('Crab Cakes', 'Oven Roasted Lump Crab Cakes'),
('Oven Roasted Crab Cakes', 'Oven Roasted Lump Crab Cakes'),
('Lump Crab Cakes', 'Oven Roasted Lump Crab Cakes'),

-- SALADS  
('Field Green Salad', 'Field Salad'),
('Field Greens Salad', 'Field Salad'),
('Chopped Salad', 'Wildfire Chopped Salad'),
('Wildfire Chopped Salad', 'Wildfire Chopped Salad'),
('Steak and Blue Cheese Salad', 'Steak and Blue Cheese Salad'),
('Steak Salad', 'Steak and Blue Cheese Salad'),

-- FILETS & STEAKS
('Tenderloin Tips', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips'),
('Basil Hayden Tenderloin Tips', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips'),
('Bourbon Tenderloin Tips', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips'),
('Petite Filet', 'Petite Filet Mignon/Filet Mignon'),
('Petite Filet Mignon', 'Petite Filet Mignon/Filet Mignon'),
('Filet Mignon', 'Petite Filet Mignon/Filet Mignon'),
('Dinner Filet', 'Petite Filet Mignon/Filet Mignon'),
('Filet', 'Petite Filet Mignon/Filet Mignon'),
('Filet Duo', 'Filet Medallion Duo/Filet Medallion Trio'),
('Filet Trio', 'Filet Medallion Duo/Filet Medallion Trio'),
('Filet Medallion Duo', 'Filet Medallion Duo/Filet Medallion Trio'),
('Filet Medallion Trio', 'Filet Medallion Duo/Filet Medallion Trio'),
('Filet Duo/Trio', 'Filet Medallion Duo/Filet Medallion Trio'),
('Filet Trio/Duo', 'Filet Medallion Duo/Filet Medallion Trio'),
('Bone-In Ribeye', 'Bone-In Ribeye'),
('Ribeye', 'Bone-In Ribeye'),
('Rib Eye', 'Bone-In Ribeye'),
('Skirt Steak', 'Roumanian Skirt Steak'),
('Romanian Skirt Steak', 'Roumanian Skirt Steak'),
('Roumanian Skirt Steak', 'Roumanian Skirt Steak'),
('Filet Wellington', 'Filet Mignon Wellington'),
('Filet Mignon Wellington', 'Filet Mignon Wellington'),
('Friday: Filet Wellington', 'Filet Mignon Wellington'),

-- PRIME RIB
('Prime Rib', 'Roasted Prime Rib of Beef'),
('Roasted Prime Rib', 'Roasted Prime Rib of Beef'),

-- SEAFOOD
('Halibut', 'Macadamia Crusted Halibut'),
('Macadamia Nut Crusted Halibut', 'Macadamia Crusted Halibut'),
('Macadamia Halibut', 'Macadamia Crusted Halibut'),

-- CHICKEN & BBQ
('Buttermilk Fried Chicken', 'Buttermilk Fried Chicken'),
('Fried Chicken', 'Buttermilk Fried Chicken'),
('Southern Fried Chicken', 'Monday & Tuesday: Southern Fried Chicken'),
('Monday: Southern Fried Chicken', 'Monday & Tuesday: Southern Fried Chicken'),
('Barbecue Chicken', 'Barbecued Half Chicken'),
('BBQ Chicken', 'Barbecued Half Chicken'),
('Half Chicken', 'Barbecued Half Chicken'),
('Barbecued Chicken', 'Barbecued Half Chicken'),
('Spit Roasted Chicken', 'Spit-Roasted Rotisserie Chicken'),
('Rotisserie Chicken', 'Spit-Roasted Rotisserie Chicken'),
('Spit-Roasted Chicken', 'Spit-Roasted Rotisserie Chicken'),
('Short Ribs', 'Beer Braised Short Ribs'),
('Beer Braised Short Ribs', 'Beer Braised Short Ribs'),
('Braised Short Ribs', 'Thursday: Braised Short Ribs'),
('Thursday: Beer Braised Short Ribs', 'Thursday: Braised Short Ribs'),
('Thursday: Short Ribs', 'Thursday: Braised Short Ribs'),

-- NIGHTLY SPECIALS
('Long Island Duck', 'Long Island Duck'),
('Duck', 'Long Island Duck'),
('Tuesday: Long Island Duck', 'Long Island Duck'),
('Wednesday: Long Island Duck', 'Wednesday: Spit Roasted Half Long Island Duck'),
('Spit Roasted Long Island Duck', 'Wednesday: Spit Roasted Half Long Island Duck'),
('Roast Turkey', 'Roast Turkey'),
('Turkey Dinner', 'Roast Turkey'),
('Sunday: Roast Turkey', 'Sunday: Roast Turkey'),
('Sunday: Turkey Dinner', 'Sunday: Roast Turkey'),

-- SANDWICHES
('Turkey Sandwich', 'Sliced Turkey Sandwich'),
('Sliced Turkey', 'Sliced Turkey Sandwich'),

-- SIDES
('Cottage Fries', 'Cottage Fries'),
('French Fries', 'French Fries'),
('Fries', 'French Fries'),
('Mushroom Caps', 'Sauteed Mushroom Caps'),
('Sauteed Mushrooms', 'Sauteed Mushroom Caps'),
('Roasted Mushroom Caps', 'Sauteed Mushroom Caps'),
('Mac and Cheese', 'Macaroni and Cheese'),
('Macaroni and Cheese', 'Macaroni and Cheese'),

-- KIDS
('Kids Chicken Fingers', 'Kids Chicken Fingers'),
('Kids Chicken', 'Kids Chicken Fingers'),
('Kids Mac and Cheese', 'Kids Macaroni and Cheese'),
('Kids Macaroni and Cheese', 'Kids Macaroni and Cheese'),

-- DESSERTS
('Seasonal Crisp', 'Seasonal Crisp'),
('Berry Crisp', 'Seasonal Crisp'),
('Berries Crisp', 'Seasonal Crisp'),
('Vanilla Ice Cream', 'Vanilla Ice Cream'),
('Ice Cream', 'Vanilla Ice Cream'),

-- BRUNCH
('Avocado Toast and Eggs', 'Avocado Toast and Eggs'),
('Avocado Toast with Eggs', 'Avocado Toast and Eggs'),
('Crab Cake Benedict', 'Crab Cake Benedict'),
('Crab Benedict', 'Crab Cake Benedict'),

-- FLATBREADS
('Fresh Mozzarella Flatbread', 'Fresh Mozzarella Flatbread'),
('Mozzarella Flatbread', 'Fresh Mozzarella Flatbread'),
('Fresh Mozzarella Pizza', 'Fresh Mozzarella Flatbread'),
('Grilled Pepperoni Flatbread', 'Grilled Pepperoni Flatbread'),
('Pepperoni Flatbread', 'Grilled Pepperoni Flatbread'),
('Pepperoni Pizza', 'Grilled Pepperoni Flatbread')

ON CONFLICT (rule_name) DO UPDATE SET menu_name = EXCLUDED.menu_name;

-- Re-run the linking with the new mappings
UPDATE allergen_modifications am
SET menu_item_id = mi.id
FROM name_mapping nm, menu_items mi
WHERE LOWER(TRIM(am.dish_name)) = LOWER(nm.rule_name)
  AND LOWER(TRIM(mi.name)) = LOWER(nm.menu_name)
  AND am.tenant_id = mi.tenant_id
  AND am.menu_item_id IS NULL;

-- Also try linking by similar names (contains matching)
-- This catches cases like "Crab Cakes" in rules matching "Oven Roasted Lump Crab Cakes" in menu
UPDATE allergen_modifications am
SET menu_item_id = mi.id
FROM menu_items mi
WHERE am.tenant_id = mi.tenant_id
  AND am.menu_item_id IS NULL
  AND (
    -- Rule name is contained in menu name
    LOWER(mi.name) LIKE '%' || LOWER(TRIM(am.dish_name)) || '%'
    OR
    -- Menu name is contained in rule name (less common)
    LOWER(TRIM(am.dish_name)) LIKE '%' || LOWER(mi.name) || '%'
  );

-- Report updated results
SELECT '=== UPDATED LINKING RESULTS ===' as report;

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

-- Show remaining menu items without rules
SELECT mi.name as "Remaining Menu Items Without Rules"
FROM menu_items mi
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND NOT EXISTS (
    SELECT 1 FROM allergen_modifications am 
    WHERE am.menu_item_id = mi.id
  )
ORDER BY mi.name;

-- Show remaining unlinked rules (unique dish names)
SELECT DISTINCT am.dish_name as "Remaining Unlinked Rule Names"
FROM allergen_modifications am
WHERE am.menu_item_id IS NULL
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ORDER BY am.dish_name;
