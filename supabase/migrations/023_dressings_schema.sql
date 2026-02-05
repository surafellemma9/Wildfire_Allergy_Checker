-- ============================================================================
-- DRESSINGS SCHEMA FOR MULTI-TENANT SCALABILITY
-- All dressing data stored in Supabase, NOT in source code
-- ============================================================================

-- ============================================================================
-- 1. DRESSINGS TABLE
-- Stores dressing info per tenant
-- ============================================================================
CREATE TABLE IF NOT EXISTS dressings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ingredients TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_dressings_tenant ON dressings(tenant_id);
ALTER TABLE dressings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to dressings" ON dressings;
CREATE POLICY "Service role full access to dressings"
  ON dressings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 2. DRESSING_ALLERGEN_RULES TABLE
-- Stores allergen rules for each dressing per tenant
-- ============================================================================
CREATE TABLE IF NOT EXISTS dressing_allergen_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dressing_id UUID NOT NULL REFERENCES dressings(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('safe', 'unsafe')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, dressing_id, allergen)
);

CREATE INDEX IF NOT EXISTS idx_dressing_allergen_rules_tenant ON dressing_allergen_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dressing_allergen_rules_dressing ON dressing_allergen_rules(dressing_id);
ALTER TABLE dressing_allergen_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to dressing_allergen_rules" ON dressing_allergen_rules;
CREATE POLICY "Service role full access to dressing_allergen_rules"
  ON dressing_allergen_rules FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 3. SALAD_DRESSINGS TABLE
-- Links salads to their default dressing
-- ============================================================================
CREATE TABLE IF NOT EXISTS salad_dressings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  default_dressing_id UUID REFERENCES dressings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, menu_item_id)
);

CREATE INDEX IF NOT EXISTS idx_salad_dressings_tenant ON salad_dressings(tenant_id);
ALTER TABLE salad_dressings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to salad_dressings" ON salad_dressings;
CREATE POLICY "Service role full access to salad_dressings"
  ON salad_dressings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 4. ADD GARNISHES COLUMN TO MENU_ITEMS IF NOT EXISTS
-- ============================================================================
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS garnishes TEXT[] DEFAULT '{}';

-- ============================================================================
-- 5. INSERT DRESSINGS FOR WILDFIRE TYSON'S CORNER
-- ============================================================================
INSERT INTO dressings (tenant_id, name, ingredients, display_order) VALUES
-- No Dressing (always safe option)
('63c69ee3-0167-4799-8986-09df2824ab93', 'No Dressing', ARRAY[]::TEXT[], 0),

-- Balsamic Vinaigrette: house oil, balsamic vinegar, white balsamic vinegar, sugar, shallots, garlic, Dijon mustard, salt, pepper
('63c69ee3-0167-4799-8986-09df2824ab93', 'Balsamic Vinaigrette', 
  ARRAY['house oil', 'balsamic vinegar', 'white balsamic vinegar', 'sugar', 'shallots', 'garlic', 'dijon mustard', 'salt', 'pepper'], 1),

-- Lemon Herb Vinaigrette: lemon juice, red wine vinegar, water, lemon zest, shallots, garlic, salt, pepper, Old Bay, sugar, Dijon mustard, house oil, EVOO, thyme, basil
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Herb Vinaigrette',
  ARRAY['lemon juice', 'red wine vinegar', 'water', 'lemon zest', 'shallots', 'garlic', 'salt', 'pepper', 'old bay seasoning', 'sugar', 'dijon mustard', 'house oil', 'extra virgin olive oil', 'thyme', 'basil'], 2),

-- Lemon Parmesan Vinaigrette: lemon juice, garlic, Dijon mustard, salt, black pepper, house oil, EVOO, Parmesan cheese
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Parmesan Vinaigrette',
  ARRAY['lemon juice', 'garlic', 'dijon mustard', 'salt', 'black pepper', 'house oil', 'extra virgin olive oil', 'parmesan cheese'], 3),

-- Red Wine Vinaigrette: red wine vinegar, sugar, salt, pepper, oregano, thyme, basil, garlic puree, red chilies, parmesan, house oil
('63c69ee3-0167-4799-8986-09df2824ab93', 'Red Wine Vinaigrette',
  ARRAY['red wine vinegar', 'sugar', 'salt', 'pepper', 'oregano', 'thyme', 'basil', 'garlic puree', 'red chilies', 'parmesan', 'house oil'], 4),

-- Ranch Dressing: buttermilk, mayonnaise, Hidden Valley Ranch Dry Dressing
('63c69ee3-0167-4799-8986-09df2824ab93', 'Ranch Dressing',
  ARRAY['buttermilk', 'mayonnaise', 'hidden valley ranch dry dressing'], 5),

-- Caesar Dressing: anchovy, garlic, lemon juice, Dijon mustard, Asiago cheese, pasteurized egg yolk, red wine vinegar, house oil, salt, pepper
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Dressing',
  ARRAY['anchovy', 'garlic', 'lemon juice', 'dijon mustard', 'asiago cheese', 'pasteurized egg yolk', 'red wine vinegar', 'house oil', 'salt', 'pepper'], 6),

-- Citrus Dressing: dry mustard, sugar, garlic, lime juice, red wine vinegar, oregano, chilies, al pastor marinade, kosher salt, house oil
('63c69ee3-0167-4799-8986-09df2824ab93', 'Citrus Dressing',
  ARRAY['dry mustard', 'sugar', 'garlic', 'lime juice', 'red wine vinegar', 'oregano', 'chilies', 'al pastor marinade', 'kosher salt', 'house oil'], 7),

-- Blue Cheese Dressing: mayonnaise, buttermilk, salt, pepper, blue cheese crumbles, tabasco sauce
('63c69ee3-0167-4799-8986-09df2824ab93', 'Blue Cheese Dressing',
  ARRAY['mayonnaise', 'buttermilk', 'salt', 'pepper', 'blue cheese crumbles', 'tabasco sauce'], 8)

ON CONFLICT (tenant_id, name) DO UPDATE SET
  ingredients = EXCLUDED.ingredients,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- ============================================================================
-- 6. INSERT DRESSING ALLERGEN RULES
-- Based on official allergy sheets
-- ============================================================================

-- Helper: Insert allergen rules for all dressings
DO $$
DECLARE
  t_id UUID := '63c69ee3-0167-4799-8986-09df2824ab93';
  d_no_dressing UUID;
  d_balsamic UUID;
  d_lemon_herb UUID;
  d_lemon_parmesan UUID;
  d_red_wine UUID;
  d_ranch UUID;
  d_caesar UUID;
  d_citrus UUID;
  d_blue_cheese UUID;
BEGIN
  -- Get dressing IDs
  SELECT id INTO d_no_dressing FROM dressings WHERE tenant_id = t_id AND name = 'No Dressing';
  SELECT id INTO d_balsamic FROM dressings WHERE tenant_id = t_id AND name = 'Balsamic Vinaigrette';
  SELECT id INTO d_lemon_herb FROM dressings WHERE tenant_id = t_id AND name = 'Lemon Herb Vinaigrette';
  SELECT id INTO d_lemon_parmesan FROM dressings WHERE tenant_id = t_id AND name = 'Lemon Parmesan Vinaigrette';
  SELECT id INTO d_red_wine FROM dressings WHERE tenant_id = t_id AND name = 'Red Wine Vinaigrette';
  SELECT id INTO d_ranch FROM dressings WHERE tenant_id = t_id AND name = 'Ranch Dressing';
  SELECT id INTO d_caesar FROM dressings WHERE tenant_id = t_id AND name = 'Caesar Dressing';
  SELECT id INTO d_citrus FROM dressings WHERE tenant_id = t_id AND name = 'Citrus Dressing';
  SELECT id INTO d_blue_cheese FROM dressings WHERE tenant_id = t_id AND name = 'Blue Cheese Dressing';

  -- NO DRESSING - All safe
  INSERT INTO dressing_allergen_rules (tenant_id, dressing_id, allergen, status, notes) VALUES
  (t_id, d_no_dressing, 'dairy', 'safe', NULL),
  (t_id, d_no_dressing, 'gluten', 'safe', NULL),
  (t_id, d_no_dressing, 'shellfish', 'safe', NULL),
  (t_id, d_no_dressing, 'soy', 'safe', NULL),
  (t_id, d_no_dressing, 'eggs', 'safe', NULL),
  (t_id, d_no_dressing, 'peanuts', 'safe', NULL),
  (t_id, d_no_dressing, 'tree_nuts', 'safe', NULL),
  (t_id, d_no_dressing, 'sesame', 'safe', NULL),
  (t_id, d_no_dressing, 'garlic', 'safe', NULL),
  (t_id, d_no_dressing, 'onion', 'safe', NULL)
  ON CONFLICT (tenant_id, dressing_id, allergen) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = NOW();

  -- BALSAMIC VINAIGRETTE
  -- Safe for: dairy, gluten, shellfish, soy, eggs, peanuts, tree_nuts, sesame
  -- Unsafe for: garlic, onion (shallots)
  INSERT INTO dressing_allergen_rules (tenant_id, dressing_id, allergen, status, notes) VALUES
  (t_id, d_balsamic, 'dairy', 'safe', NULL),
  (t_id, d_balsamic, 'gluten', 'safe', NULL),
  (t_id, d_balsamic, 'shellfish', 'safe', NULL),
  (t_id, d_balsamic, 'soy', 'safe', NULL),
  (t_id, d_balsamic, 'eggs', 'safe', NULL),
  (t_id, d_balsamic, 'peanuts', 'safe', NULL),
  (t_id, d_balsamic, 'tree_nuts', 'safe', NULL),
  (t_id, d_balsamic, 'sesame', 'safe', NULL),
  (t_id, d_balsamic, 'garlic', 'unsafe', 'Contains garlic'),
  (t_id, d_balsamic, 'onion', 'unsafe', 'Contains shallots')
  ON CONFLICT (tenant_id, dressing_id, allergen) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = NOW();

  -- LEMON HERB VINAIGRETTE
  -- Safe for: dairy, shellfish, soy, eggs, peanuts, tree_nuts, sesame
  -- Unsafe for: gluten (not listed), garlic, onion (shallots)
  INSERT INTO dressing_allergen_rules (tenant_id, dressing_id, allergen, status, notes) VALUES
  (t_id, d_lemon_herb, 'dairy', 'safe', NULL),
  (t_id, d_lemon_herb, 'gluten', 'unsafe', 'Not listed as safe for gluten'),
  (t_id, d_lemon_herb, 'shellfish', 'safe', NULL),
  (t_id, d_lemon_herb, 'soy', 'safe', NULL),
  (t_id, d_lemon_herb, 'eggs', 'safe', NULL),
  (t_id, d_lemon_herb, 'peanuts', 'safe', NULL),
  (t_id, d_lemon_herb, 'tree_nuts', 'safe', NULL),
  (t_id, d_lemon_herb, 'sesame', 'safe', NULL),
  (t_id, d_lemon_herb, 'garlic', 'unsafe', 'Contains garlic'),
  (t_id, d_lemon_herb, 'onion', 'unsafe', 'Contains shallots')
  ON CONFLICT (tenant_id, dressing_id, allergen) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = NOW();

  -- LEMON PARMESAN VINAIGRETTE
  -- Safe for: shellfish, soy, eggs, peanuts, tree_nuts, sesame, onion
  -- Unsafe for: dairy (parmesan), gluten (not listed), garlic
  INSERT INTO dressing_allergen_rules (tenant_id, dressing_id, allergen, status, notes) VALUES
  (t_id, d_lemon_parmesan, 'dairy', 'unsafe', 'Contains Parmesan cheese'),
  (t_id, d_lemon_parmesan, 'gluten', 'unsafe', 'Not listed as safe for gluten'),
  (t_id, d_lemon_parmesan, 'shellfish', 'safe', NULL),
  (t_id, d_lemon_parmesan, 'soy', 'safe', NULL),
  (t_id, d_lemon_parmesan, 'eggs', 'safe', NULL),
  (t_id, d_lemon_parmesan, 'peanuts', 'safe', NULL),
  (t_id, d_lemon_parmesan, 'tree_nuts', 'safe', NULL),
  (t_id, d_lemon_parmesan, 'sesame', 'safe', NULL),
  (t_id, d_lemon_parmesan, 'garlic', 'unsafe', 'Contains garlic'),
  (t_id, d_lemon_parmesan, 'onion', 'safe', NULL)
  ON CONFLICT (tenant_id, dressing_id, allergen) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = NOW();

  -- RED WINE VINAIGRETTE
  -- Safe for: gluten, shellfish, soy, eggs, peanuts, tree_nuts, sesame, onion
  -- Unsafe for: dairy (parmesan), garlic
  INSERT INTO dressing_allergen_rules (tenant_id, dressing_id, allergen, status, notes) VALUES
  (t_id, d_red_wine, 'dairy', 'unsafe', 'Contains parmesan'),
  (t_id, d_red_wine, 'gluten', 'safe', NULL),
  (t_id, d_red_wine, 'shellfish', 'safe', NULL),
  (t_id, d_red_wine, 'soy', 'safe', NULL),
  (t_id, d_red_wine, 'eggs', 'safe', NULL),
  (t_id, d_red_wine, 'peanuts', 'safe', NULL),
  (t_id, d_red_wine, 'tree_nuts', 'safe', NULL),
  (t_id, d_red_wine, 'sesame', 'safe', NULL),
  (t_id, d_red_wine, 'garlic', 'unsafe', 'Contains garlic puree'),
  (t_id, d_red_wine, 'onion', 'safe', NULL)
  ON CONFLICT (tenant_id, dressing_id, allergen) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = NOW();

  -- RANCH DRESSING
  -- Safe for: gluten, shellfish, peanuts, tree_nuts, sesame
  -- Unsafe for: dairy (buttermilk), soy (mayo), eggs (mayo), garlic (not listed), onion (not listed)
  INSERT INTO dressing_allergen_rules (tenant_id, dressing_id, allergen, status, notes) VALUES
  (t_id, d_ranch, 'dairy', 'unsafe', 'Contains buttermilk'),
  (t_id, d_ranch, 'gluten', 'safe', NULL),
  (t_id, d_ranch, 'shellfish', 'safe', NULL),
  (t_id, d_ranch, 'soy', 'unsafe', 'Contains mayonnaise with soy'),
  (t_id, d_ranch, 'eggs', 'unsafe', 'Contains mayonnaise with egg'),
  (t_id, d_ranch, 'peanuts', 'safe', NULL),
  (t_id, d_ranch, 'tree_nuts', 'safe', NULL),
  (t_id, d_ranch, 'sesame', 'safe', NULL),
  (t_id, d_ranch, 'garlic', 'unsafe', 'Not listed as safe for garlic'),
  (t_id, d_ranch, 'onion', 'unsafe', 'Not listed as safe for onion')
  ON CONFLICT (tenant_id, dressing_id, allergen) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = NOW();

  -- CAESAR DRESSING
  -- Safe for: gluten, soy, peanuts, tree_nuts, onion
  -- Unsafe for: dairy (asiago), shellfish (anchovy), eggs (egg yolk), sesame (not listed), garlic
  INSERT INTO dressing_allergen_rules (tenant_id, dressing_id, allergen, status, notes) VALUES
  (t_id, d_caesar, 'dairy', 'unsafe', 'Contains Asiago cheese'),
  (t_id, d_caesar, 'gluten', 'safe', NULL),
  (t_id, d_caesar, 'shellfish', 'unsafe', 'Contains anchovy'),
  (t_id, d_caesar, 'soy', 'safe', NULL),
  (t_id, d_caesar, 'eggs', 'unsafe', 'Contains pasteurized egg yolk'),
  (t_id, d_caesar, 'peanuts', 'safe', NULL),
  (t_id, d_caesar, 'tree_nuts', 'safe', NULL),
  (t_id, d_caesar, 'sesame', 'unsafe', 'Not listed as safe for sesame'),
  (t_id, d_caesar, 'garlic', 'unsafe', 'Contains garlic'),
  (t_id, d_caesar, 'onion', 'safe', NULL)
  ON CONFLICT (tenant_id, dressing_id, allergen) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = NOW();

  -- CITRUS DRESSING
  -- Safe for: dairy, gluten, shellfish, soy, eggs, peanuts, tree_nuts, sesame
  -- Unsafe for: garlic, onion (al pastor marinade)
  INSERT INTO dressing_allergen_rules (tenant_id, dressing_id, allergen, status, notes) VALUES
  (t_id, d_citrus, 'dairy', 'safe', NULL),
  (t_id, d_citrus, 'gluten', 'safe', NULL),
  (t_id, d_citrus, 'shellfish', 'safe', NULL),
  (t_id, d_citrus, 'soy', 'safe', NULL),
  (t_id, d_citrus, 'eggs', 'safe', NULL),
  (t_id, d_citrus, 'peanuts', 'safe', NULL),
  (t_id, d_citrus, 'tree_nuts', 'safe', NULL),
  (t_id, d_citrus, 'sesame', 'safe', NULL),
  (t_id, d_citrus, 'garlic', 'unsafe', 'Contains garlic'),
  (t_id, d_citrus, 'onion', 'unsafe', 'Not listed as safe for onion')
  ON CONFLICT (tenant_id, dressing_id, allergen) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = NOW();

  -- BLUE CHEESE DRESSING
  -- Safe for: gluten, shellfish, peanuts, tree_nuts, sesame, garlic, onion
  -- Unsafe for: dairy (blue cheese, buttermilk), soy (mayo), eggs (mayo)
  INSERT INTO dressing_allergen_rules (tenant_id, dressing_id, allergen, status, notes) VALUES
  (t_id, d_blue_cheese, 'dairy', 'unsafe', 'Contains blue cheese and buttermilk'),
  (t_id, d_blue_cheese, 'gluten', 'safe', NULL),
  (t_id, d_blue_cheese, 'shellfish', 'safe', NULL),
  (t_id, d_blue_cheese, 'soy', 'unsafe', 'Contains mayonnaise with soy'),
  (t_id, d_blue_cheese, 'eggs', 'unsafe', 'Contains mayonnaise with egg'),
  (t_id, d_blue_cheese, 'peanuts', 'safe', NULL),
  (t_id, d_blue_cheese, 'tree_nuts', 'safe', NULL),
  (t_id, d_blue_cheese, 'sesame', 'safe', NULL),
  (t_id, d_blue_cheese, 'garlic', 'safe', NULL),
  (t_id, d_blue_cheese, 'onion', 'safe', NULL)
  ON CONFLICT (tenant_id, dressing_id, allergen) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = NOW();

  RAISE NOTICE 'Dressing allergen rules inserted';
END $$;

-- ============================================================================
-- 7. UPDATE CAESAR SALAD DATA
-- ============================================================================
UPDATE menu_items 
SET 
  ticket_code = 'SIDE CAESAR/CAESAR/LG CAESAR',
  ingredients = ARRAY[
    'romaine lettuce',
    'parmesan cheese'
  ],
  garnishes = ARRAY['croutons'],
  updated_at = NOW()
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
  AND name = 'Caesar Salad';

-- ============================================================================
-- 8. LINK CAESAR SALAD TO DEFAULT DRESSING
-- ============================================================================
INSERT INTO salad_dressings (tenant_id, menu_item_id, default_dressing_id)
SELECT 
  '63c69ee3-0167-4799-8986-09df2824ab93',
  mi.id,
  d.id
FROM menu_items mi
CROSS JOIN dressings d
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
  AND mi.name = 'Caesar Salad'
  AND d.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND d.name = 'Caesar Dressing'
ON CONFLICT (tenant_id, menu_item_id) DO UPDATE SET
  default_dressing_id = EXCLUDED.default_dressing_id,
  updated_at = NOW();

-- ============================================================================
-- 9. UPDATE CAESAR SALAD ALLERGEN RULES (for the salad itself, without dressing)
-- The salad contains: romaine (safe), parmesan (dairy), croutons (gluten - garnish)
-- ============================================================================

-- Link the allergen modifications to the menu_item_id
DO $$
DECLARE
  t_id UUID := '63c69ee3-0167-4799-8986-09df2824ab93';
  caesar_id UUID;
BEGIN
  SELECT id INTO caesar_id FROM menu_items WHERE tenant_id = t_id AND name = 'Caesar Salad';
  
  -- DAIRY: UNSAFE (parmesan in salad)
  INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
  VALUES (t_id, caesar_id, 'Caesar Salad', 'Salads', 'dairy', 'not_modifiable', ARRAY[]::TEXT[], 'Contains Parmesan cheese')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    menu_item_id = caesar_id,
    status = 'not_modifiable',
    modifications = ARRAY[]::TEXT[],
    notes = 'Contains Parmesan cheese',
    updated_at = NOW();

  -- GLUTEN: MODIFIABLE (remove croutons)
  INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
  VALUES (t_id, caesar_id, 'Caesar Salad', 'Salads', 'gluten', 'modifiable', ARRAY['NO croutons', 'SUB gluten free croutons'], 'Remove croutons, substitute GF')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    menu_item_id = caesar_id,
    status = 'modifiable',
    modifications = ARRAY['NO croutons', 'SUB gluten free croutons'],
    notes = 'Remove croutons, substitute GF',
    updated_at = NOW();

  -- SHELLFISH: SAFE (salad itself has no shellfish)
  INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
  VALUES (t_id, caesar_id, 'Caesar Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[], 'No shellfish in salad')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    menu_item_id = caesar_id,
    status = 'safe',
    modifications = ARRAY[]::TEXT[],
    notes = 'No shellfish in salad',
    updated_at = NOW();

  -- SOY: MODIFIABLE (croutons may contain soy)
  INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
  VALUES (t_id, caesar_id, 'Caesar Salad', 'Salads', 'soy', 'modifiable', ARRAY['NO croutons'], 'Remove croutons')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    menu_item_id = caesar_id,
    status = 'modifiable',
    modifications = ARRAY['NO croutons'],
    notes = 'Remove croutons',
    updated_at = NOW();

  -- EGGS: SAFE (salad itself has no eggs)
  INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
  VALUES (t_id, caesar_id, 'Caesar Salad', 'Salads', 'eggs', 'safe', ARRAY[]::TEXT[], 'No eggs in salad')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    menu_item_id = caesar_id,
    status = 'safe',
    modifications = ARRAY[]::TEXT[],
    notes = 'No eggs in salad',
    updated_at = NOW();

  -- PEANUTS: SAFE
  INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
  VALUES (t_id, caesar_id, 'Caesar Salad', 'Salads', 'peanuts', 'safe', ARRAY[]::TEXT[], 'No changes needed')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    menu_item_id = caesar_id,
    status = 'safe',
    modifications = ARRAY[]::TEXT[],
    notes = 'No changes needed',
    updated_at = NOW();

  -- TREE NUTS: SAFE
  INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
  VALUES (t_id, caesar_id, 'Caesar Salad', 'Salads', 'tree_nuts', 'safe', ARRAY[]::TEXT[], 'No changes needed')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    menu_item_id = caesar_id,
    status = 'safe',
    modifications = ARRAY[]::TEXT[],
    notes = 'No changes needed',
    updated_at = NOW();

  -- SESAME: SAFE
  INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
  VALUES (t_id, caesar_id, 'Caesar Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[], 'No changes needed')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    menu_item_id = caesar_id,
    status = 'safe',
    modifications = ARRAY[]::TEXT[],
    notes = 'No changes needed',
    updated_at = NOW();

  -- GARLIC: SAFE (salad itself has no garlic)
  INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
  VALUES (t_id, caesar_id, 'Caesar Salad', 'Salads', 'garlic', 'safe', ARRAY[]::TEXT[], 'No garlic in salad')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    menu_item_id = caesar_id,
    status = 'safe',
    modifications = ARRAY[]::TEXT[],
    notes = 'No garlic in salad',
    updated_at = NOW();

  -- ONION: SAFE
  INSERT INTO allergen_modifications (tenant_id, menu_item_id, dish_name, category, allergen, status, modifications, notes)
  VALUES (t_id, caesar_id, 'Caesar Salad', 'Salads', 'onion', 'safe', ARRAY[]::TEXT[], 'No changes needed')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    menu_item_id = caesar_id,
    status = 'safe',
    modifications = ARRAY[]::TEXT[],
    notes = 'No changes needed',
    updated_at = NOW();

  RAISE NOTICE 'Caesar Salad allergen rules updated';
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT '=== DRESSINGS ===' as section;
SELECT name, ingredients FROM dressings WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' ORDER BY display_order;

SELECT '=== DRESSING ALLERGEN RULES (sample: Caesar) ===' as section;
SELECT d.name, dar.allergen, dar.status, dar.notes
FROM dressing_allergen_rules dar
JOIN dressings d ON dar.dressing_id = d.id
WHERE dar.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
  AND d.name = 'Caesar Dressing'
ORDER BY dar.allergen;

SELECT '=== CAESAR SALAD ===' as section;
SELECT name, ticket_code, ingredients, garnishes 
FROM menu_items WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' AND name = 'Caesar Salad';

SELECT '=== CAESAR SALAD DEFAULT DRESSING ===' as section;
SELECT mi.name as salad, d.name as default_dressing
FROM salad_dressings sd
JOIN menu_items mi ON sd.menu_item_id = mi.id
LEFT JOIN dressings d ON sd.default_dressing_id = d.id
WHERE sd.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT '=== CAESAR SALAD ALLERGEN RULES ===' as section;
SELECT allergen, status, modifications, notes
FROM allergen_modifications
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' AND dish_name = 'Caesar Salad'
ORDER BY allergen;
