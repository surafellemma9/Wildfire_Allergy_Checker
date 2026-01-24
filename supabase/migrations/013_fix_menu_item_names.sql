-- ============================================================================
-- FIX MENU ITEM NAMES TO MATCH ALLERGEN RULES
-- The allergen sheets use clean, standardized names - we should use those!
-- ============================================================================

-- Clear existing menu items
DELETE FROM menu_items WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- Get unique dish names from allergen_modifications and insert as menu items
WITH unique_dishes AS (
  SELECT DISTINCT dish_name, category
  FROM allergen_modifications 
  WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
)
INSERT INTO menu_items (tenant_id, name, category, display_order)
SELECT 
  '63c69ee3-0167-4799-8986-09df2824ab93',
  dish_name,
  category,
  0
FROM unique_dishes
ON CONFLICT (tenant_id, name) DO NOTHING;

-- Verification
SELECT 'Menu items created:' as status, count(*) as count
FROM menu_items
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- Show by category
SELECT category, count(*) as items
FROM menu_items
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
GROUP BY category
ORDER BY category;
