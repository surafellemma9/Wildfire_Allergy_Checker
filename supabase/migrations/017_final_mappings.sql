-- ============================================================================
-- FINAL NAME MAPPINGS
-- Handles remaining unlinked rules
-- ============================================================================

CREATE TEMP TABLE IF NOT EXISTS name_mapping (
  rule_name TEXT PRIMARY KEY,
  menu_name TEXT NOT NULL
);

INSERT INTO name_mapping (rule_name, menu_name) VALUES
-- Kids menu variations (& vs and)
('Kids Mac & Cheese', 'Kids Macaroni and Cheese'),
('Kids Sundae', 'Kids Hot Fudge Sundae'),
('Mac & Cheese', 'Macaroni and Cheese'),

-- Salad variation (& vs and)
('Steak & Blue Cheese Salad', 'Steak and Blue Cheese Salad'),

-- Chicken variations
('Herb Chicken', 'Lemon Pepper Chicken Breast'),
('Spit-Roasted Half Chicken', 'Spit Roasted Half Chicken'),

-- Filet Wellington
('Saturday: Filet Wellington', 'Filet Mignon Wellington'),
('Friday & Saturday: Filet Wellington', 'Filet Mignon Wellington'),

-- Duck variations
('Wednesday: Spit Roasted Duck', 'Wednesday: Spit Roasted Half Long Island Duck'),

-- Breakfast
('Turkey Sausage Burrito', 'Turkey Sausage Breakfast Burrito'),

-- Flatbreads/Pizza
('Mozzarella Pizza', 'Fresh Mozzarella Flatbread'),
('Wild Mushroom Pizza', 'Mushroom and Goat Cheese Flatbread'),

-- Mediterranean Salmon
('Mediterranean Salmon Sandwich', 'Open Faced Mediterranean Salmon Sandwich')

ON CONFLICT (rule_name) DO UPDATE SET menu_name = EXCLUDED.menu_name;

-- Re-run linking with these mappings
UPDATE allergen_modifications am
SET menu_item_id = mi.id
FROM name_mapping nm, menu_items mi
WHERE LOWER(TRIM(am.dish_name)) = LOWER(nm.rule_name)
  AND LOWER(TRIM(mi.name)) = LOWER(nm.menu_name)
  AND am.tenant_id = mi.tenant_id
  AND am.menu_item_id IS NULL;

-- NOTE: These rules are INTENTIONALLY not linked to menu items:
-- They are steak add-ons or salad proteins handled separately in the app
-- - Bearnaise Sauce (steak add-on)
-- - Oscar Style (steak add-on)
-- - Shrimp Skewer (steak add-on)
-- - Side of Fruit (side item)
-- - Salad with Grilled Chicken (salad protein - in SALAD_PROTEIN_OPTIONS)
-- - Salad with Salmon (salad protein - in SALAD_PROTEIN_OPTIONS)
-- - Salad with Steak (salad protein - in SALAD_PROTEIN_OPTIONS)
-- - Salad with Tenderloin Tip (salad protein - in SALAD_PROTEIN_OPTIONS)

-- Final report
SELECT '=== FINAL LINKING RESULTS ===' as report;

SELECT 
  'Total linked rules:' as status,
  COUNT(*) as count
FROM allergen_modifications
WHERE menu_item_id IS NOT NULL
  AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT 
  'Unlinked rules (add-ons/proteins):' as status,
  COUNT(*) as count
FROM allergen_modifications
WHERE menu_item_id IS NULL
  AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT 
  'Menu items WITH allergen rules:' as status,
  COUNT(DISTINCT mi.id) as count
FROM menu_items mi
JOIN allergen_modifications am ON am.menu_item_id = mi.id
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT 
  'Menu items WITHOUT rules (will show UNKNOWN):' as status,
  COUNT(*) as count
FROM menu_items mi
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND NOT EXISTS (
    SELECT 1 FROM allergen_modifications am 
    WHERE am.menu_item_id = mi.id
  );

-- Show remaining menu items without rules (these will show "Verify with Chef")
SELECT mi.name as "Menu Items Still Without Rules"
FROM menu_items mi
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND NOT EXISTS (
    SELECT 1 FROM allergen_modifications am 
    WHERE am.menu_item_id = mi.id
  )
ORDER BY mi.name;
