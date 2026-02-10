-- ============================================================================
-- BREADS SCHEMA FOR MULTI-TENANT SCALABILITY
-- All bread data stored in Supabase, NOT in source code
-- ============================================================================

-- ============================================================================
-- 1. BREADS TABLE
-- Stores bread info per tenant with ingredients and allergens
-- ============================================================================
CREATE TABLE IF NOT EXISTS breads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ingredients TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_breads_tenant ON breads(tenant_id);
ALTER TABLE breads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to breads" ON breads;
CREATE POLICY "Service role full access to breads"
  ON breads FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 2. ADD DEFAULT_BREAD_ID TO MENU_ITEMS
-- Links sandwiches to their default bread
-- ============================================================================
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS default_bread_id UUID REFERENCES breads(id) ON DELETE SET NULL;

-- ============================================================================
-- 3. INSERT BREADS FOR WILDFIRE TYSON'S CORNER
-- ============================================================================
INSERT INTO breads (tenant_id, name, ingredients, allergens, display_order) VALUES
-- Sesame Seed Bun
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sesame Seed Bun', 
  ARRAY['unbleached enriched flour (wheat flour, malted barley flour, niacin, reduced iron, thiamine mononitrate, riboflavin, folic acid)', 'water', 'non GMO palm oil', 'pure cane sugar', 'salt', 'yeast', 'dough softener (wheat flour, mono glycerides, enzymes)', 'butter flavor (maltodextrin, butter flavorings)', 'dry malt', 'shelf life extender', 'cultured wheat flour', 'sesame seeds', 'whole egg for topping'],
  ARRAY['gluten', 'egg', 'sesame'], 1),

-- Multi-Grain Bread
('63c69ee3-0167-4799-8986-09df2824ab93', 'Multi-Grain Bread',
  ARRAY['white starter (King Arthur flour, yeast, water)', 'coarse whole wheat flour', 'King Arthur flour', 'salt', 'malt liquid (non-diastatic corn)', 'nine grain cereal mix', 'seeds (flax, sunflower seeds, sesame seeds)', 'water'],
  ARRAY['gluten', 'sesame'], 2),

-- Onion Bread (for Bison Meatballs)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Onion Bread',
  ARRAY['flour', 'water', 'sugar', 'eggs', 'double spice (for color)', 'vinegar', 'onions', 'yeast'],
  ARRAY['gluten', 'egg'], 3),

-- Buttery Onion Bun
('63c69ee3-0167-4799-8986-09df2824ab93', 'Buttery Onion Bun',
  ARRAY['unbleached enriched flour (wheat flour, malted barley flour, niacin, reduced iron, thiamine mononitrate, riboflavin, folic acid)', 'water', 'non GMO palm oil', 'pure cane sugar', 'salt', 'yeast', 'dough softener (wheat flour, monoglycerides, enzymes)', 'butter flavor, flavorings', 'dry malt', 'shelf life extender', 'cultured wheat flour', 'onion mix (onions, poppy seeds, sugar, olive oil)', 'ground sesame seeds'],
  ARRAY['gluten', 'dairy', 'sesame'], 4),

-- Gluten Free Bun
('63c69ee3-0167-4799-8986-09df2824ab93', 'Gluten Free Bun',
  ARRAY['melted butter', 'whole eggs', 'rice vinegar', 'lukewarm milk', 'Domata''s Gluten Free flour (rice flour, corn starch, tapioca dextrin, xanthum gum, rice extract)', 'baking powder', 'granulated sugar', 'instant dry yeast', 'table salt'],
  ARRAY['dairy', 'egg'], 5),

-- Kids Bun (Brioche)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Bun',
  ARRAY['white starter (King Arthur flour, yeast, water)', 'King Arthur flour', 'sugar', 'milk powder', 'eggs', 'unsalted sweet butter', 'yeast'],
  ARRAY['gluten', 'egg', 'dairy'], 6),

-- Ciabatta
('63c69ee3-0167-4799-8986-09df2824ab93', 'Ciabatta',
  ARRAY['flour', 'water', 'yeast', 'salt', 'olive oil'],
  ARRAY['gluten'], 7)

ON CONFLICT (tenant_id, name) DO UPDATE SET
  ingredients = EXCLUDED.ingredients,
  allergens = EXCLUDED.allergens,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- ============================================================================
-- 4. LINK SANDWICHES TO THEIR DEFAULT BREADS
-- ============================================================================
DO $$
DECLARE
  t_id UUID := '63c69ee3-0167-4799-8986-09df2824ab93';
  bread_sesame UUID;
  bread_multigrain UUID;
  bread_buttery_onion UUID;
BEGIN
  -- Get bread IDs
  SELECT id INTO bread_sesame FROM breads WHERE tenant_id = t_id AND name = 'Sesame Seed Bun';
  SELECT id INTO bread_multigrain FROM breads WHERE tenant_id = t_id AND name = 'Multi-Grain Bread';
  SELECT id INTO bread_buttery_onion FROM breads WHERE tenant_id = t_id AND name = 'Buttery Onion Bun';

  -- Sandwiches with Sesame Seed Bun
  UPDATE menu_items SET default_bread_id = bread_sesame, updated_at = NOW()
  WHERE tenant_id = t_id AND name IN (
    'Hamburger', 'Burger',
    'Cheeseburger',
    'Thick Prime Angus Burger', 'Thick Prime Angus Cheeseburger',
    'Bison Burger', 'Bison Cheeseburger',
    'All Natural Turkey Burger', 'Turkey Burger',
    'Grilled Chicken Club', 'Chicken Club',
    'Crispy Hot Honey Chicken Sandwich', 'Hot Honey Chicken Sandwich',
    'Crab Cake Sandwich'
  );

  -- Sandwiches with Buttery Onion Bun
  UPDATE menu_items SET default_bread_id = bread_buttery_onion, updated_at = NOW()
  WHERE tenant_id = t_id AND name IN (
    'Roasted Prime Rib French Dip', 'French Dip', 'Prime Rib French Dip',
    'Blackened New York Strip Steak Sandwich', 'Blackened Steak Sandwich', 'Steak Sandwich'
  );

  -- Sandwiches with Multi-Grain Bread
  UPDATE menu_items SET default_bread_id = bread_multigrain, updated_at = NOW()
  WHERE tenant_id = t_id AND name IN (
    'Sliced Turkey Sandwich', 'Turkey Sandwich',
    'Open Faced Mediterranean Salmon', 'Mediterranean Salmon Sandwich', 'Mediterranean Salmon'
  );

  RAISE NOTICE 'Sandwiches linked to default breads';
END $$;

-- ============================================================================
-- 5. ADD SANDWICH INGREDIENTS TO MENU_ITEMS
-- Based on allergy sheets and kitchen prep
-- ============================================================================
DO $$
DECLARE
  t_id UUID := '63c69ee3-0167-4799-8986-09df2824ab93';
BEGIN
  -- Hamburger/Cheeseburger
  UPDATE menu_items SET 
    ingredients = ARRAY['beef patty', 'lettuce', 'tomato', 'red onion', 'pickles'],
    garnishes = ARRAY['ketchup', 'mustard', 'mayonnaise'],
    updated_at = NOW()
  WHERE tenant_id = t_id AND name IN ('Hamburger', 'Burger');

  UPDATE menu_items SET 
    ingredients = ARRAY['beef patty', 'american cheese', 'lettuce', 'tomato', 'red onion', 'pickles'],
    garnishes = ARRAY['ketchup', 'mustard', 'mayonnaise'],
    updated_at = NOW()
  WHERE tenant_id = t_id AND name = 'Cheeseburger';

  -- Bison Burger
  UPDATE menu_items SET 
    ingredients = ARRAY['bison patty', 'lettuce', 'tomato', 'red onion', 'pickles'],
    garnishes = ARRAY['ketchup', 'mustard', 'mayonnaise'],
    updated_at = NOW()
  WHERE tenant_id = t_id AND name IN ('Bison Burger', 'Bison Cheeseburger');

  -- Turkey Burger
  UPDATE menu_items SET 
    ingredients = ARRAY['turkey patty', 'char-crust seasoning', 'lettuce', 'tomato', 'red onion'],
    garnishes = ARRAY['mayonnaise'],
    updated_at = NOW()
  WHERE tenant_id = t_id AND name IN ('All Natural Turkey Burger', 'Turkey Burger');

  -- Grilled Chicken Club
  UPDATE menu_items SET 
    ingredients = ARRAY['grilled chicken breast', 'mustard mayo marinade', 'bacon', 'lettuce', 'tomato'],
    garnishes = ARRAY['mustard mayonnaise'],
    updated_at = NOW()
  WHERE tenant_id = t_id AND name IN ('Grilled Chicken Club', 'Chicken Club');

  -- Crispy Hot Honey Chicken Sandwich
  UPDATE menu_items SET 
    ingredients = ARRAY['crispy fried chicken breast', 'hot honey glaze', 'pickles', 'coleslaw'],
    garnishes = ARRAY['hot honey sauce'],
    updated_at = NOW()
  WHERE tenant_id = t_id AND name IN ('Crispy Hot Honey Chicken Sandwich', 'Hot Honey Chicken Sandwich');

  -- French Dip
  UPDATE menu_items SET 
    ingredients = ARRAY['sliced prime rib', 'swiss cheese'],
    garnishes = ARRAY['au jus', 'horseradish cream sauce'],
    updated_at = NOW()
  WHERE tenant_id = t_id AND name IN ('Roasted Prime Rib French Dip', 'French Dip', 'Prime Rib French Dip');

  -- Blackened Steak Sandwich
  UPDATE menu_items SET 
    ingredients = ARRAY['blackened new york strip steak', 'blackening spice', 'arugula', 'tomato'],
    garnishes = ARRAY['ancho mayo'],
    updated_at = NOW()
  WHERE tenant_id = t_id AND name IN ('Blackened New York Strip Steak Sandwich', 'Blackened Steak Sandwich', 'Steak Sandwich');

  -- Sliced Turkey Sandwich
  UPDATE menu_items SET 
    ingredients = ARRAY['sliced turkey breast', 'swiss cheese', 'lettuce', 'tomato'],
    garnishes = ARRAY['mayonnaise', 'mustard'],
    updated_at = NOW()
  WHERE tenant_id = t_id AND name IN ('Sliced Turkey Sandwich', 'Turkey Sandwich');

  -- Mediterranean Salmon
  UPDATE menu_items SET 
    ingredients = ARRAY['grilled salmon fillet', 'arugula', 'tomato', 'feta cheese', 'za''atar seasoning'],
    garnishes = ARRAY['yogurt drizzle', 'red wine vinaigrette'],
    updated_at = NOW()
  WHERE tenant_id = t_id AND name IN ('Open Faced Mediterranean Salmon', 'Mediterranean Salmon Sandwich', 'Mediterranean Salmon');

  -- Crab Cake Sandwich
  UPDATE menu_items SET 
    ingredients = ARRAY['crab cake', 'lettuce', 'tomato'],
    garnishes = ARRAY['mustard mayonnaise', 'lemon wedge'],
    updated_at = NOW()
  WHERE tenant_id = t_id AND name = 'Crab Cake Sandwich';

  RAISE NOTICE 'Sandwich ingredients updated';
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT '=== BREADS ===' as section;
SELECT name, allergens, array_length(ingredients, 1) as ingredient_count 
FROM breads 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
ORDER BY display_order;

SELECT '=== SANDWICHES WITH BREADS ===' as section;
SELECT mi.name, b.name as default_bread, mi.ingredients, mi.garnishes
FROM menu_items mi
LEFT JOIN breads b ON mi.default_bread_id = b.id
WHERE mi.tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
  AND mi.category = 'Sandwiches'
ORDER BY mi.name;
