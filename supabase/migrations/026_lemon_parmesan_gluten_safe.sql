-- ============================================================================
-- Lemon Parmesan dressing: SAFE for gluten
-- Per kitchen confirmation; gluten allergy sheet may list differently.
-- ============================================================================
UPDATE dressing_allergen_rules dar
SET status = 'safe', notes = 'Safe for gluten (confirmed)', updated_at = NOW()
FROM dressings d
WHERE dar.dressing_id = d.id
  AND dar.tenant_id = d.tenant_id
  AND dar.allergen = 'gluten'
  AND d.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND d.name = 'Lemon Parmesan Vinaigrette';
