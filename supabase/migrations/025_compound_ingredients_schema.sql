-- ============================================================================
-- COMPOUND INGREDIENTS SCHEMA
-- Stores detailed breakdown of sauces, marinades, seasonings, and other
-- compound ingredients used in dishes
-- ============================================================================

-- ============================================================================
-- 1. COMPOUND_INGREDIENTS TABLE
-- Stores breakdown of complex ingredients (sauces, marinades, seasonings, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS compound_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sauce', 'marinade', 'seasoning', 'dressing', 'spread', 'glaze', 'coating', 'mix', 'other')),
  ingredients TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_compound_ingredients_tenant ON compound_ingredients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compound_ingredients_category ON compound_ingredients(category);
ALTER TABLE compound_ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to compound_ingredients" ON compound_ingredients;
CREATE POLICY "Service role full access to compound_ingredients"
  ON compound_ingredients FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 2. INSERT COMPOUND INGREDIENTS FOR WILDFIRE TYSON'S CORNER
-- Based on official allergy sheets and ingredient books
-- ============================================================================
INSERT INTO compound_ingredients (tenant_id, name, category, ingredients, allergens, notes) VALUES

-- ============================================================================
-- SEASONINGS & SPICE BLENDS
-- ============================================================================
('63c69ee3-0167-4799-8986-09df2824ab93', 'Char-Crust Seasoning (Peppercorn & Garlic)',
  'seasoning',
  ARRAY['garlic', 'peppercorns', 'sugar', 'spices', 'onion', 'caramel color', 'Worcestershire powder', 'paprika', 'hydrolyzed soy', 'corn protein', 'wheat flour'],
  ARRAY['gluten', 'shellfish', 'soy'],
  'Used on Turkey Burger. Contains shellfish from Worcestershire.'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Blackening Spice',
  'seasoning',
  ARRAY['paprika', 'garlic powder', 'onion powder', 'black pepper', 'white pepper', 'cayenne pepper', 'dried thyme', 'dried oregano', 'salt'],
  ARRAY['garlic', 'onion'],
  'Used on Blackened Steak Sandwich, Blackened Salmon'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Za''atar Seasoning',
  'seasoning',
  ARRAY['dried thyme', 'sumac', 'sesame seeds', 'dried oregano', 'dried marjoram', 'salt'],
  ARRAY['sesame'],
  'Used on Mediterranean Salmon'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Old Bay Seasoning',
  'seasoning',
  ARRAY['celery salt', 'paprika', 'black pepper', 'red pepper', 'dry mustard', 'mace', 'cinnamon', 'cloves', 'allspice', 'nutmeg', 'cardamom', 'ginger'],
  ARRAY[]::TEXT[],
  'Used in various seafood dishes and dressings'),

-- ============================================================================
-- SAUCES & SPREADS
-- ============================================================================
('63c69ee3-0167-4799-8986-09df2824ab93', 'Ancho Mayo',
  'sauce',
  ARRAY['mayonnaise', 'ancho chili powder', 'lime juice', 'garlic', 'cumin', 'salt'],
  ARRAY['eggs', 'soy', 'garlic'],
  'Used on Blackened Steak Sandwich. Mayo contains eggs and soy.'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Mustard Mayonnaise',
  'sauce',
  ARRAY['mayonnaise', 'Dijon mustard', 'whole grain mustard', 'lemon juice', 'salt', 'pepper'],
  ARRAY['eggs', 'soy'],
  'Used on Chicken Club, Crab Cake Sandwich. Mayo contains eggs and soy.'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Horseradish Cream Sauce',
  'sauce',
  ARRAY['sour cream', 'prepared horseradish', 'heavy cream', 'lemon juice', 'salt', 'white pepper'],
  ARRAY['dairy', 'soy'],
  'Used with French Dip'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Au Jus',
  'sauce',
  ARRAY['beef broth', 'beef drippings', 'onion', 'garlic', 'thyme', 'bay leaf', 'black pepper', 'salt'],
  ARRAY['onion', 'garlic'],
  'Served with French Dip'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Yogurt Drizzle',
  'sauce',
  ARRAY['Greek yogurt', 'lemon juice', 'garlic', 'dill', 'salt', 'olive oil'],
  ARRAY['dairy', 'garlic'],
  'Used on Mediterranean Salmon'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Hot Honey Glaze',
  'glaze',
  ARRAY['honey', 'hot sauce', 'butter', 'cayenne pepper', 'garlic powder'],
  ARRAY['dairy'],
  'Used on Hot Honey Chicken Sandwich'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Apricot Dipping Sauce',
  'sauce',
  ARRAY['apricot jam', 'rice vinegar', 'sambal chili paste', 'garlic', 'ginger', 'cilantro', 'toasted sesame seeds', 'sesame oil', 'San J Tamari', 'scallions'],
  ARRAY['soy', 'sesame'],
  'Served with coconut shrimp and other appetizers'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak Butter',
  'spread',
  ARRAY['balsamic vinegar reduction', 'Worcestershire sauce', 'sugar', 'butter', 'salt', 'pepper'],
  ARRAY['dairy', 'shellfish'],
  'Whipped compound butter for steaks. Shellfish from Worcestershire sauce.'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Garlic Crouton',
  'other',
  ARRAY['Parisian Baguette bread', 'garlic butter'],
  ARRAY['gluten', 'dairy'],
  'Also called onion soup crouton. Served with filet mignon.'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Cocktail Sauce',
  'sauce',
  ARRAY['ketchup', 'prepared horseradish', 'lemon juice', 'Worcestershire sauce', 'hot sauce', 'salt'],
  ARRAY['shellfish'],
  'Served with shrimp, seafood. Worcestershire contains shellfish.'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Tartar Sauce',
  'sauce',
  ARRAY['mayonnaise', 'sweet pickle relish', 'capers', 'lemon juice', 'dill', 'onion', 'salt', 'pepper'],
  ARRAY['eggs', 'soy', 'onion'],
  'Served with fish dishes'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Ketchup',
  'sauce',
  ARRAY['tomato concentrate', 'distilled vinegar', 'high fructose corn syrup', 'corn syrup', 'salt', 'onion powder', 'spices'],
  ARRAY['onion'],
  'Standard condiment'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Yellow Mustard',
  'sauce',
  ARRAY['distilled vinegar', 'water', 'mustard seed', 'salt', 'turmeric', 'paprika', 'garlic powder'],
  ARRAY['garlic'],
  'Standard condiment'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Dijon Mustard',
  'sauce',
  ARRAY['white wine', 'mustard seeds', 'water', 'salt', 'citric acid', 'tartaric acid'],
  ARRAY[]::TEXT[],
  'Used in dressings and sauces'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Mayonnaise',
  'spread',
  ARRAY['soybean oil', 'whole eggs', 'egg yolks', 'distilled vinegar', 'water', 'salt', 'sugar', 'lemon juice concentrate'],
  ARRAY['eggs', 'soy'],
  'Base for many sauces'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Whipped Butter',
  'spread',
  ARRAY['cream', 'salt'],
  ARRAY['dairy'],
  'Served with baked potatoes, bread'),

-- ============================================================================
-- MARINADES
-- ============================================================================
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mustard Mayo Marinade (Chicken)',
  'marinade',
  ARRAY['mayonnaise', 'Dijon mustard', 'lemon juice', 'garlic', 'herbs', 'salt', 'pepper'],
  ARRAY['eggs', 'soy', 'garlic'],
  'Used to marinate Chicken Club chicken breast'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Herb Chicken Marinade',
  'marinade',
  ARRAY['olive oil', 'lemon juice', 'lemon zest', 'garlic', 'rosemary', 'thyme', 'oregano', 'salt', 'black pepper'],
  ARRAY['garlic'],
  'Used for grilled chicken dishes'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Al Pastor Marinade',
  'marinade',
  ARRAY['dried chilies (guajillo, ancho)', 'pineapple juice', 'achiote paste', 'garlic', 'cumin', 'oregano', 'vinegar', 'orange juice', 'salt'],
  ARRAY['garlic'],
  'Used in Citrus Dressing'),

-- ============================================================================
-- COATINGS & BATTERS
-- ============================================================================
('63c69ee3-0167-4799-8986-09df2824ab93', 'Buttermilk Breading (Fried Chicken)',
  'coating',
  ARRAY['buttermilk', 'all-purpose flour', 'cornstarch', 'salt', 'black pepper', 'paprika', 'garlic powder', 'onion powder', 'cayenne pepper'],
  ARRAY['dairy', 'gluten', 'garlic', 'onion'],
  'Used for Crispy Hot Honey Chicken'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Calamari Breading',
  'coating',
  ARRAY['buttermilk', 'all-purpose flour', 'cornmeal', 'salt', 'pepper', 'paprika'],
  ARRAY['dairy', 'gluten'],
  'Used for Crispy Calamari'),

-- ============================================================================
-- MIXES & BASES
-- ============================================================================
('63c69ee3-0167-4799-8986-09df2824ab93', 'Hidden Valley Ranch Dry Mix',
  'mix',
  ARRAY['maltodextrin', 'buttermilk', 'salt', 'monosodium glutamate', 'dried garlic', 'dried onion', 'lactic acid', 'calcium lactate', 'spices', 'citric acid', 'less than 2% calcium stearate'],
  ARRAY['dairy', 'garlic', 'onion'],
  'Base for Ranch Dressing'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Onion Mix (for Buttery Onion Bun)',
  'mix',
  ARRAY['dried onions', 'poppy seeds', 'sugar', 'olive oil'],
  ARRAY['onion'],
  'Topping for Buttery Onion Bun'),

-- ============================================================================
-- VINAIGRETTES & DRESSINGS (detailed breakdown)
-- These supplement the dressings table with more detail
-- ============================================================================
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Herb Vinaigrette',
  'dressing',
  ARRAY['lemon juice', 'red wine vinegar', 'water', 'lemon zest', 'shallots', 'garlic', 'salt', 'pepper', 'Old Bay seasoning', 'sugar', 'Dijon mustard', 'house oil', 'extra virgin olive oil', 'fresh thyme', 'fresh basil'],
  ARRAY['garlic', 'onion'],
  'Contains shallots (onion family)'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Balsamic Vinaigrette',
  'dressing',
  ARRAY['house oil', 'balsamic vinegar', 'white balsamic vinegar', 'sugar', 'shallots', 'garlic', 'Dijon mustard', 'salt', 'pepper'],
  ARRAY['garlic', 'onion'],
  'Contains shallots (onion family)'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Red Wine Vinaigrette',
  'dressing',
  ARRAY['red wine vinegar', 'sugar', 'salt', 'pepper', 'oregano', 'thyme', 'basil', 'garlic puree', 'red chilies', 'parmesan cheese', 'house oil'],
  ARRAY['dairy', 'garlic'],
  'Contains parmesan'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Dressing',
  'dressing',
  ARRAY['anchovy', 'garlic', 'lemon juice', 'Dijon mustard', 'Asiago cheese', 'pasteurized egg yolk', 'red wine vinegar', 'house oil', 'salt', 'pepper'],
  ARRAY['shellfish', 'dairy', 'eggs', 'garlic'],
  'Contains anchovy (classified as shellfish allergen)'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Blue Cheese Dressing',
  'dressing',
  ARRAY['mayonnaise', 'buttermilk', 'salt', 'pepper', 'blue cheese crumbles', 'Tabasco sauce'],
  ARRAY['dairy', 'eggs', 'soy'],
  'Mayo contains eggs and soy'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Ranch Dressing',
  'dressing',
  ARRAY['buttermilk', 'mayonnaise', 'Hidden Valley Ranch dry mix'],
  ARRAY['dairy', 'eggs', 'soy', 'garlic', 'onion'],
  'See Hidden Valley Ranch Dry Mix for full breakdown'),

('63c69ee3-0167-4799-8986-09df2824ab93', 'Citrus Dressing',
  'dressing',
  ARRAY['dry mustard', 'sugar', 'garlic', 'lime juice', 'red wine vinegar', 'oregano', 'chilies', 'al pastor marinade', 'kosher salt', 'house oil'],
  ARRAY['garlic', 'onion'],
  'Contains al pastor marinade which has garlic')

ON CONFLICT (tenant_id, name) DO UPDATE SET
  category = EXCLUDED.category,
  ingredients = EXCLUDED.ingredients,
  allergens = EXCLUDED.allergens,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT '=== COMPOUND INGREDIENTS BY CATEGORY ===' as section;
SELECT category, COUNT(*) as count 
FROM compound_ingredients 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
GROUP BY category
ORDER BY count DESC;

SELECT '=== SAMPLE: SEASONINGS ===' as section;
SELECT name, ingredients, allergens
FROM compound_ingredients 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
  AND category = 'seasoning'
ORDER BY name;

SELECT '=== SAMPLE: SAUCES ===' as section;
SELECT name, ingredients, allergens
FROM compound_ingredients 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
  AND category = 'sauce'
ORDER BY name;
