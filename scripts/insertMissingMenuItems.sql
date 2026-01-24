-- ============================================================================
-- Insert missing menu items from allergen_modifications
-- This adds any dishes referenced in allergen sheets that don't exist in menu_items
-- ============================================================================

-- Insert unique dishes from allergen_modifications that don't exist in menu_items
INSERT INTO menu_items (tenant_id, name, category, ticket_code)
SELECT DISTINCT
  '63c69ee3-0167-4799-8986-09df2824ab93'::UUID as tenant_id,
  am.dish_name as name,
  am.category,
  UPPER(SUBSTRING(am.dish_name, 1, 20)) as ticket_code
FROM allergen_modifications am
WHERE am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND am.menu_item_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM menu_items mi
    WHERE mi.tenant_id = am.tenant_id
    AND LOWER(TRIM(mi.name)) = LOWER(TRIM(am.dish_name))
  )
ON CONFLICT (tenant_id, name) DO NOTHING;

-- Now link allergen rules to the newly created menu items
UPDATE allergen_modifications am
SET menu_item_id = mi.id
FROM menu_items mi
WHERE am.tenant_id = mi.tenant_id
  AND LOWER(TRIM(am.dish_name)) = LOWER(TRIM(mi.name))
  AND am.menu_item_id IS NULL
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- Show results
SELECT
  'Total menu items after insert:' as status,
  COUNT(*) as count
FROM menu_items
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT
  'Linked allergen rules:' as status,
  COUNT(*) as count
FROM allergen_modifications
WHERE menu_item_id IS NOT NULL
  AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT
  'Unlinked allergen rules:' as status,
  COUNT(*) as count
FROM allergen_modifications
WHERE menu_item_id IS NULL
  AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- Show any dishes that still couldn't be linked (if any)
SELECT DISTINCT
  am.dish_name as "Still Unlinked",
  am.category
FROM allergen_modifications am
WHERE am.menu_item_id IS NULL
  AND am.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
ORDER BY am.category, am.dish_name
LIMIT 10;
