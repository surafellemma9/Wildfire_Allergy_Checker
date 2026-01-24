-- ============================================================================
-- COMPREHENSIVE ALLERGEN MODIFICATIONS
-- All allergen rules for Wildfire Tyson's Corner
-- Generated from official allergen sheets dated 6.19.25 - 6.26.25
-- ============================================================================

-- Drop and recreate for clean slate
DROP TABLE IF EXISTS allergen_modifications CASCADE;

CREATE TABLE allergen_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dish_name TEXT NOT NULL,
  category TEXT NOT NULL,
  allergen TEXT NOT NULL CHECK (allergen IN (
    'dairy', 'gluten', 'shellfish', 'fish', 'peanuts', 'tree_nuts',
    'soy', 'eggs', 'sesame', 'garlic', 'onion', 'garlic_onion'
  )),
  status TEXT NOT NULL CHECK (status IN ('safe', 'modifiable', 'not_modifiable')),
  modifications TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, dish_name, allergen)
);

CREATE INDEX idx_allergen_mods_tenant ON allergen_modifications(tenant_id);
CREATE INDEX idx_allergen_mods_allergen ON allergen_modifications(allergen);
CREATE INDEX idx_allergen_mods_dish ON allergen_modifications(dish_name);

ALTER TABLE allergen_modifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON allergen_modifications
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- INSERT ALL ALLERGEN MODIFICATIONS
-- ============================================================================

DO $$
DECLARE
  t_id UUID;
BEGIN
  SELECT id INTO t_id FROM tenants WHERE concept_name = 'Wildfire' LIMIT 1;
  
  IF t_id IS NULL THEN
    INSERT INTO tenants (concept_name, location_name, status)
    VALUES ('Wildfire', 'Tyson''s Corner', 'active')
    RETURNING id INTO t_id;
  END IF;

  -- ==========================================================================
  -- DAIRY MODIFICATIONS
  -- *This includes cheese and milk products*
  -- *This does NOT include eggs or mayonnaise*
  -- ==========================================================================

  -- APPETIZERS - Dairy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Mediterranean Chicken Skewers', 'Appetizers', 'dairy', 'modifiable', ARRAY['no yogurt sauce']),
  (t_id, 'Shrimp Cocktail', 'Appetizers', 'dairy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Crab Cakes', 'Appetizers', 'dairy', 'modifiable', ARRAY['no mustard mayonnaise']),
  (t_id, 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'dairy', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SALADS - Dairy (Balsamic, Citrus Lime, Lemon Herb vinaigrettes are dairy-free)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Field Green Salad', 'Salads', 'dairy', 'safe', ARRAY[]::TEXT[], 'Use balsamic, citrus lime, or lemon herb vinaigrette'),
  (t_id, 'Tuscan Kale Salad', 'Salads', 'dairy', 'modifiable', ARRAY['no cheese', 'no dressing'], NULL),
  (t_id, 'Greek Salad', 'Salads', 'dairy', 'modifiable', ARRAY['no feta cheese', 'no dressing'], NULL),
  (t_id, 'Steak & Blue Cheese Salad', 'Salads', 'dairy', 'modifiable', ARRAY['no cheese', 'no crispy onions', 'no ranch dressing'], NULL),
  (t_id, 'Chopped Salad', 'Salads', 'dairy', 'modifiable', ARRAY['no marinated chicken', 'no blue cheese', 'no tortillas'], NULL),
  (t_id, 'Caesar Salad', 'Salads', 'dairy', 'modifiable', ARRAY['no croutons'], NULL),
  (t_id, 'Salad with Grilled Chicken', 'Salads', 'dairy', 'safe', ARRAY[]::TEXT[], 'Protein add-on'),
  (t_id, 'Salad with Salmon', 'Salads', 'dairy', 'modifiable', ARRAY['no glaze'], 'Protein add-on'),
  (t_id, 'Salad with Steak', 'Salads', 'dairy', 'modifiable', ARRAY['no steak butter'], 'Protein add-on')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- SANDWICHES - Dairy (NO BUTTER ON BUNS, NO KID'S BUN, NO BUTTERY ONION BUN, NO GF BUN, NO COLESLAW, NO FRIES)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Burger', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no butter on bun', 'no coleslaw', 'no fries'], 'May use sesame seed or multi-grain bun'),
  (t_id, 'Bison Burger', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no butter on bun', 'no coleslaw', 'no fries'], 'May use sesame seed or multi-grain bun'),
  (t_id, 'Turkey Burger', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no cheese', 'no butter on bun'], NULL),
  (t_id, 'Chicken Club', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no mustard-mayo marinated chicken', 'sub plain chicken', 'no cheese', 'no mustard mayonnaise', 'no butter on bun'], NULL),
  (t_id, 'Mediterranean Salmon Sandwich', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no yogurt sauce', 'no butter on bread', 'no red wine vinaigrette'], NULL),
  (t_id, 'Crab Cake Sandwich', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no butter on bun'], NULL),
  (t_id, 'French Dip', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no butter on bread', 'no horseradish cream sauce'], NULL),
  (t_id, 'Turkey Sandwich', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no cheese', 'no butter on bread'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- FILETS - Dairy (NO CRUSTS except peppercorn, NO STEAK BUTTER, NO GARLIC CROUTON, NO PRE-MARKING BUTTER)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Tenderloin Tips', 'Filets', 'dairy', 'modifiable', ARRAY['no steak butter', 'no pre-marking butter']),
  (t_id, 'Petite Filet', 'Filets', 'dairy', 'modifiable', ARRAY['no pre-marking butter', 'no steak butter', 'no garlic crouton']),
  (t_id, 'Dinner Filet', 'Filets', 'dairy', 'modifiable', ARRAY['no pre-marking butter', 'no steak butter', 'no garlic crouton'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- STEAK AND CHOPS - Dairy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Pork Chops', 'Steak and Chops', 'dairy', 'modifiable', ARRAY['no mushroom crust', 'no pre-marking butter']),
  (t_id, 'Skirt Steak', 'Steak and Chops', 'dairy', 'modifiable', ARRAY['no steak butter', 'no pre-marking butter']),
  (t_id, 'New York Strip', 'Steak and Chops', 'dairy', 'modifiable', ARRAY['no steak butter', 'no pre-marking butter']),
  (t_id, 'Porterhouse', 'Steak and Chops', 'dairy', 'modifiable', ARRAY['no steak butter', 'no pre-marking butter']),
  (t_id, 'Ribeye', 'Steak and Chops', 'dairy', 'modifiable', ARRAY['no steak butter', 'no pre-marking butter']),
  (t_id, 'Lamb Chops', 'Steak and Chops', 'dairy', 'modifiable', ARRAY['no steak butter', 'no pre-marking butter'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- PRIME RIB - Dairy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Prime Rib', 'Prime Rib', 'dairy', 'modifiable', ARRAY['no horseradish cream sauce'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- STEAK ADD ONS - Dairy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Shrimp Skewer', 'Steak Add Ons', 'dairy', 'modifiable', ARRAY['no garlic butter']),
  (t_id, 'Crab Cakes Add-On', 'Steak Add Ons', 'dairy', 'modifiable', ARRAY['no mustard mayonnaise'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- FRESH FISH AND SEAFOOD - Dairy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Salmon', 'Fresh Fish and Seafood', 'dairy', 'modifiable', ARRAY['no glaze']),
  (t_id, 'Crab Cake Entree', 'Fresh Fish and Seafood', 'dairy', 'modifiable', ARRAY['no mustard mayo'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- NIGHTLY SPECIALS - Dairy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Monday: Southern Fried Chicken', 'Nightly Specials', 'dairy', 'not_modifiable', ARRAY[]::TEXT[]),
  (t_id, 'Tuesday: Southern Fried Chicken', 'Nightly Specials', 'dairy', 'not_modifiable', ARRAY[]::TEXT[]),
  (t_id, 'Wednesday: Long Island Duck', 'Nightly Specials', 'dairy', 'modifiable', ARRAY['no cherry glaze', 'no wild rice'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- CHICKEN - Dairy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Chicken Moreno', 'Chicken', 'dairy', 'modifiable', ARRAY['no lemon parmesan vinaigrette', 'sub lemon herb vinaigrette', 'no parmesan'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SIDES - Dairy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Broccoli', 'Sides', 'dairy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Roasted Vegetables', 'Sides', 'dairy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Baked Potato', 'Sides', 'dairy', 'modifiable', ARRAY['no sour cream', 'no butter']),
  (t_id, 'Sweet Potato', 'Sides', 'dairy', 'modifiable', ARRAY['no butter']),
  (t_id, 'Roasted Asparagus', 'Sides', 'dairy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Applesauce', 'Sides', 'dairy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Mashed Potatoes', 'Sides', 'dairy', 'not_modifiable', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- DESSERTS - Dairy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Berries Crisp', 'Desserts', 'dairy', 'modifiable', ARRAY['no oatmeal crumble', 'no ice cream'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- KIDS MENU - Dairy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Kids Burger', 'Kids Menu', 'dairy', 'modifiable', ARRAY['sub multi-grain or sesame seed bun', 'no butter on bun', 'no cheese'], 'No kids bun for dairy'),
  (t_id, 'Kids Cheeseburger', 'Kids Menu', 'dairy', 'modifiable', ARRAY['sub multi-grain or sesame seed bun', 'no butter on bun', 'no cheese'], 'No kids bun for dairy'),
  (t_id, 'Kids Steak & Mashed Potatoes', 'Kids Menu', 'dairy', 'modifiable', ARRAY['no pre-marking butter', 'no steak butter', 'no mashed potatoes'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- ==========================================================================
  -- SOY MODIFICATIONS
  -- *This includes soy sauce and soybean oil*
  -- ==========================================================================

  -- APPETIZERS - Soy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Shrimp and Crab Bisque', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'French Onion Soup', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Mediterranean Chicken Skewers', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Bison Meatballs', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Goat Cheese', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Shrimp Cocktail', 'Appetizers', 'soy', 'modifiable', ARRAY['no cocktail sauce']),
  (t_id, 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'soy', 'modifiable', ARRAY['no apricot dipping sauce'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SALADS - Soy (Citrus, Red Wine, Caesar, Lemon Herb, Lemon Parmesan, Balsamic vinaigrette only)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Field Green Salad', 'Salads', 'soy', 'safe', ARRAY[]::TEXT[], 'Use approved dressings'),
  (t_id, 'Caesar Salad', 'Salads', 'soy', 'modifiable', ARRAY['no croutons'], NULL),
  (t_id, 'Tuscan Kale Salad', 'Salads', 'soy', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Greek Salad', 'Salads', 'soy', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Steak & Blue Cheese Salad', 'Salads', 'soy', 'modifiable', ARRAY['no ranch dressing', 'no crispy onions'], NULL),
  (t_id, 'Chopped Salad', 'Salads', 'soy', 'modifiable', ARRAY['no tortillas', 'sub gluten free tortillas'], NULL),
  (t_id, 'Salad with Grilled Chicken', 'Salads', 'soy', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Salad with Salmon', 'Salads', 'soy', 'modifiable', ARRAY['no salmon glaze'], NULL),
  (t_id, 'Salad with Steak', 'Salads', 'soy', 'modifiable', ARRAY['no marinade on steak'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- SANDWICHES - Soy (May have sesame seed bun, wheat bread, buttery onion bun, ciabatta. MUST CLEAN GRILL. NO FRIES, NO COLESLAW)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Burger', 'Sandwiches', 'soy', 'modifiable', ARRAY['no fries', 'no coleslaw'], 'Must clean grill'),
  (t_id, 'Bison Burger', 'Sandwiches', 'soy', 'modifiable', ARRAY['no fries', 'no coleslaw'], 'Must clean grill'),
  (t_id, 'Turkey Burger', 'Sandwiches', 'soy', 'modifiable', ARRAY['no red onions', 'no char-crust', 'no mayonnaise', 'no fries', 'no coleslaw'], NULL),
  (t_id, 'Chicken Club', 'Sandwiches', 'soy', 'modifiable', ARRAY['no mustard mayonnaise', 'sub plain chicken', 'no fries', 'no coleslaw'], NULL),
  (t_id, 'Mediterranean Salmon Sandwich', 'Sandwiches', 'soy', 'modifiable', ARRAY['no fries', 'no coleslaw'], NULL),
  (t_id, 'French Dip', 'Sandwiches', 'soy', 'modifiable', ARRAY['no horseradish cream sauce', 'no fries', 'no coleslaw'], NULL),
  (t_id, 'Blackened Steak Sandwich', 'Sandwiches', 'soy', 'modifiable', ARRAY['no ancho mayo', 'no fries', 'no coleslaw'], NULL),
  (t_id, 'Turkey Sandwich', 'Sandwiches', 'soy', 'modifiable', ARRAY['no fries', 'no coleslaw'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- FILETS - Soy (MUST CLEAN GRILL/BROILER)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Tenderloin Tips', 'Filets', 'soy', 'modifiable', ARRAY['no bourbon marinade', 'no roasted red onions'], 'Must clean grill/broiler'),
  (t_id, 'Petite Filet', 'Filets', 'soy', 'safe', ARRAY[]::TEXT[], 'Must clean grill/broiler'),
  (t_id, 'Dinner Filet', 'Filets', 'soy', 'safe', ARRAY[]::TEXT[], 'Must clean grill/broiler'),
  (t_id, 'Filet Duo/Trio', 'Filets', 'soy', 'modifiable', ARRAY['no horseradish crust'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- STEAKS AND CHOPS - Soy (MUST CLEAN BROILER)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Pork Chops', 'Steak and Chops', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Skirt Steak', 'Steak and Chops', 'soy', 'modifiable', ARRAY['no roasted onions', 'no steak marinade']),
  (t_id, 'New York Strip', 'Steak and Chops', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Porterhouse', 'Steak and Chops', 'soy', 'modifiable', ARRAY['no char-crust']),
  (t_id, 'Ribeye', 'Steak and Chops', 'soy', 'modifiable', ARRAY['no char-crust']),
  (t_id, 'Lamb Chops', 'Steak and Chops', 'soy', 'modifiable', ARRAY['no char-crust'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- STEAK ADD ONS - Soy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Bearnaise Sauce', 'Steak Add Ons', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Shrimp Skewer', 'Steak Add Ons', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Oscar Style', 'Steak Add Ons', 'soy', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- PRIME RIB - Soy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Prime Rib', 'Prime Rib', 'soy', 'modifiable', ARRAY['no horseradish cream sauce'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SEAFOOD - Soy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Coconut Shrimp', 'Fresh Fish and Seafood', 'soy', 'modifiable', ARRAY['no coconut dipping sauce']),
  (t_id, 'Salmon', 'Fresh Fish and Seafood', 'soy', 'modifiable', ARRAY['no glaze']),
  (t_id, 'Scallops De Jonghe', 'Fresh Fish and Seafood', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Macadamia Halibut', 'Fresh Fish and Seafood', 'soy', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- CHICKEN - Soy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Herb Chicken', 'Chicken', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Lemon Pepper Chicken', 'Chicken', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Chicken Moreno', 'Chicken', 'soy', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- NIGHTLY SPECIALS - Soy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Wednesday: Long Island Duck', 'Nightly Specials', 'soy', 'modifiable', ARRAY['no wild rice']),
  (t_id, 'Sunday: Turkey Dinner', 'Nightly Specials', 'soy', 'modifiable', ARRAY['no stuffing'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SIDES - Soy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Mashed Potatoes', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Broccoli', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Creamed Spinach', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Roasted Vegetables', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Au Gratin Potatoes', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Mac & Cheese', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Baked Potato', 'Sides', 'soy', 'modifiable', ARRAY['no whipped butter']),
  (t_id, 'Sweet Potato', 'Sides', 'soy', 'modifiable', ARRAY['no whipped butter']),
  (t_id, 'Mushroom Caps', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Loaded Baked Potato', 'Sides', 'soy', 'modifiable', ARRAY['no whipped butter']),
  (t_id, 'Roasted Asparagus', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Applesauce', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- DESSERTS - Soy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Berries Crisp', 'Desserts', 'soy', 'modifiable', ARRAY['no ice cream'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- KIDS MENU - Soy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Kids Burger', 'Kids Menu', 'soy', 'modifiable', ARRAY['no fries', 'no kids bun'], 'May use sesame seed, wheat bread, buttery onion, ciabatta'),
  (t_id, 'Kids Grilled Cheese', 'Kids Menu', 'soy', 'modifiable', ARRAY['no fries'], NULL),
  (t_id, 'Kids Mac & Cheese', 'Kids Menu', 'soy', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Kids Steak & Mashed Potatoes', 'Kids Menu', 'soy', 'safe', ARRAY[]::TEXT[], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- BRUNCH - Soy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Classic Breakfast', 'Brunch', 'soy', 'modifiable', ARRAY['no whipped butter']),
  (t_id, 'Avocado Toast', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Avocado Toast with Sliced Tomatoes', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Spinach and Kale Frittata', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Breakfast Burrito', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Southwestern Steak and Eggs', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Eggs Florentine', 'Brunch', 'soy', 'modifiable', ARRAY['no English muffin']),
  (t_id, 'Eggs Benedict', 'Brunch', 'soy', 'modifiable', ARRAY['no English muffin']),
  (t_id, 'Buttermilk Pancakes', 'Brunch', 'soy', 'modifiable', ARRAY['no whipped butter']),
  (t_id, 'Door County Cherry Pancakes', 'Brunch', 'soy', 'modifiable', ARRAY['no whipped butter']),
  (t_id, 'Kids Buttermilk Pancakes', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Kids Scramble', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Wheat Toast', 'Brunch', 'soy', 'modifiable', ARRAY['no whipped butter']),
  (t_id, 'Breakfast Potatoes and Onions', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Bacon', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Turkey Sausage', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SPECIAL PARTY MENU - Soy
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Fresh Mozzarella Pizza', 'Special Party Menu', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Mushroom and Goat Cheese Flatbread', 'Special Party Menu', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Grilled Pepperoni', 'Special Party Menu', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Harvest Grain Bowl', 'Special Party Menu', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Roasted Vegetable Vegan Plate', 'Special Party Menu', 'soy', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Pasta and Roasted Vegetables', 'Special Party Menu', 'soy', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- ==========================================================================
  -- SHELLFISH MODIFICATIONS
  -- ==========================================================================

  -- APPETIZERS - Shellfish
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'French Onion Soup', 'Appetizers', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Mediterranean Chicken Skewers', 'Appetizers', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Bison Meatballs', 'Appetizers', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Goat Cheese', 'Appetizers', 'shellfish', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SALADS - Shellfish (Balsamic, Red Wine, Ranch, Citrus, Lemon Herb, Blue Cheese, Lemon Parmesan dressings OK)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Field Green Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Tuscan Kale Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Greek Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Steak & Blue Cheese Salad', 'Salads', 'shellfish', 'modifiable', ARRAY['no crispy onions']),
  (t_id, 'Chopped Salad', 'Salads', 'shellfish', 'modifiable', ARRAY['no tortillas']),
  (t_id, 'Salad with Grilled Chicken', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Salad with Salmon', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Salad with Steak', 'Salads', 'shellfish', 'modifiable', ARRAY['no steak butter'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SANDWICHES - Shellfish (NO FRIES, CAN SUB ANY OTHER SIDE)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Burger', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[], 'No fries, sub any other side'),
  (t_id, 'Bison Burger', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[], 'No fries, sub any other side'),
  (t_id, 'Turkey Burger', 'Sandwiches', 'shellfish', 'modifiable', ARRAY['no red onions', 'no char-crust'], NULL),
  (t_id, 'Chicken Club', 'Sandwiches', 'shellfish', 'modifiable', ARRAY['no mustard mayonnaise', 'no marinated chicken', 'sub plain chicken'], NULL),
  (t_id, 'Mediterranean Salmon Sandwich', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'French Dip', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Blackened Steak Sandwich', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Turkey Sandwich', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- FILETS - Shellfish
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Tenderloin Tips', 'Filets', 'shellfish', 'modifiable', ARRAY['no steak butter', 'no roasted onions']),
  (t_id, 'Petite Filet', 'Filets', 'shellfish', 'modifiable', ARRAY['no steak butter']),
  (t_id, 'Horseradish Crusted Filet', 'Filets', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Filet Duo/Trio', 'Filets', 'shellfish', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- STEAKS AND CHOPS - Shellfish
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Pork Chops', 'Steak and Chops', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Skirt Steak', 'Steak and Chops', 'shellfish', 'modifiable', ARRAY['no steak butter', 'no red onions', 'no steak marinade']),
  (t_id, 'New York Strip', 'Steak and Chops', 'shellfish', 'modifiable', ARRAY['no steak butter']),
  (t_id, 'Porterhouse', 'Steak and Chops', 'shellfish', 'modifiable', ARRAY['no char-crust', 'no steak butter']),
  (t_id, 'Ribeye', 'Steak and Chops', 'shellfish', 'modifiable', ARRAY['no char-crust', 'no steak butter']),
  (t_id, 'Lamb Chops', 'Steak and Chops', 'shellfish', 'modifiable', ARRAY['no char-crust', 'no steak butter'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- PRIME RIB - Shellfish
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Prime Rib', 'Prime Rib', 'shellfish', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- FRESH FISH AND SEAFOOD - Shellfish
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Salmon', 'Fresh Fish and Seafood', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Macadamia Halibut', 'Fresh Fish and Seafood', 'shellfish', 'modifiable', ARRAY['no lemon butter sauce'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- NIGHTLY SPECIALS - Shellfish
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Wednesday: Long Island Duck', 'Nightly Specials', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Thursday: Beer Braised Short Ribs', 'Nightly Specials', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Friday: Filet Wellington', 'Nightly Specials', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Saturday: Filet Wellington', 'Nightly Specials', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Sunday: Turkey Dinner', 'Nightly Specials', 'shellfish', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- CHICKEN AND BARBECUE - Shellfish
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Baby Back Ribs', 'Chicken and Barbecue', 'shellfish', 'modifiable', ARRAY['no barbeque sauce']),
  (t_id, 'Chicken Moreno', 'Chicken', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Herb Chicken', 'Chicken', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Lemon Pepper Chicken', 'Chicken', 'shellfish', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SIDES - Shellfish (all safe)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Mashed Potatoes', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Broccoli', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Creamed Spinach', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Roasted Vegetables', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Au Gratin Potatoes', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Mac & Cheese', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Baked Potato', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Sweet Potato', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Mushroom Caps', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Loaded Baked Potato', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Roasted Asparagus', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Applesauce', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Coleslaw', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- DESSERTS - Shellfish (all safe)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Chocolate Cake', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Cheesecake', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Key Lime Pie', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Chocolate Chip Cookie', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Cherry Pie', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Berries Crisp', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Ice Cream', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Kids Sundae', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Flourless Chocolate Cake', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- KIDS MENU - Shellfish (NO FRIES, CAN SUB)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Kids Burger', 'Kids Menu', 'shellfish', 'modifiable', ARRAY['no fries']),
  (t_id, 'Kids Grilled Cheese', 'Kids Menu', 'shellfish', 'modifiable', ARRAY['no fries']),
  (t_id, 'Kids Mac & Cheese', 'Kids Menu', 'shellfish', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Kids Steak & Mashed Potatoes', 'Kids Menu', 'shellfish', 'modifiable', ARRAY['no steak butter'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- ==========================================================================
  -- GLUTEN MODIFICATIONS (Gluten-Free)
  -- ==========================================================================

  -- APPETIZERS - Gluten
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'French Onion Soup', 'Appetizers', 'gluten', 'modifiable', ARRAY['no crouton'], 'Sub gluten-free crouton'),
  (t_id, 'Mediterranean Chicken Skewers', 'Appetizers', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Goat Cheese', 'Appetizers', 'gluten', 'modifiable', ARRAY['no breadcrumbs', 'no focaccia'], 'Sub GF bun'),
  (t_id, 'Shrimp Cocktail', 'Appetizers', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Sea Scallops', 'Appetizers', 'gluten', 'safe', ARRAY[]::TEXT[], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- SALADS - Gluten (Ranch, Balsamic, Caesar, Citrus, Red Wine, Blue Cheese, Oil & Vinegar OK)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Field Green Salad', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Caesar Salad', 'Salads', 'gluten', 'modifiable', ARRAY['no croutons'], 'Sub GF croutons'),
  (t_id, 'Kale and Spinach Salad', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Greek Salad', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Steak & Blue Cheese Salad', 'Salads', 'gluten', 'modifiable', ARRAY['no crispy onions'], NULL),
  (t_id, 'Chopped Salad', 'Salads', 'gluten', 'modifiable', ARRAY['no corn tortillas'], 'Sub GF tortilla chips'),
  (t_id, 'Salad with Grilled Chicken', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Salad with Salmon', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Salad with Tenderloin Tip', 'Salads', 'gluten', 'modifiable', ARRAY['GF steak butter'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- STEAKS, CHOPS, AND PRIME RIB - Gluten
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Tenderloin Tips', 'Filets', 'gluten', 'modifiable', ARRAY['GF steak butter'], NULL),
  (t_id, 'Petite Filet', 'Filets', 'gluten', 'modifiable', ARRAY['no crouton', 'GF steak butter'], NULL),
  (t_id, 'Pork Chops', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['no mushroom crust', 'GF steak butter'], NULL),
  (t_id, 'Skirt Steak', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['GF steak butter'], NULL),
  (t_id, 'New York Strip', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['GF steak butter'], NULL),
  (t_id, 'Porterhouse', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['no char-crust', 'GF steak butter'], NULL),
  (t_id, 'Ribeye', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['no char-crust', 'GF steak butter'], NULL),
  (t_id, 'Lamb Chops', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['no char-crust', 'GF steak butter'], NULL),
  (t_id, 'Prime Rib', 'Prime Rib', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Bearnaise Sauce', 'Steak Add Ons', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Shrimp Skewer', 'Steak Add Ons', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Oscar Style', 'Steak Add Ons', 'gluten', 'safe', ARRAY[]::TEXT[], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- FISH AND SEAFOOD - Gluten
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Cedar Planked Salmon', 'Fresh Fish and Seafood', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Halibut', 'Fresh Fish and Seafood', 'gluten', 'modifiable', ARRAY['no flour', 'no breadcrumbs'], 'Sub GF breadcrumbs, seasonal')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- CHICKEN AND BARBECUE - Gluten
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Spit-Roasted Half Chicken', 'Chicken and Barbecue', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Barbecued Chicken', 'Chicken and Barbecue', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Lemon Pepper Chicken Breast', 'Chicken and Barbecue', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Chicken Moreno', 'Chicken', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Barbecued Baby Back Ribs', 'Chicken and Barbecue', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Rib and Chicken Combo', 'Chicken and Barbecue', 'gluten', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- PRIME BURGERS AND SANDWICHES - Gluten (NO FRENCH FRIES, may add cheese)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Burger', 'Sandwiches', 'gluten', 'modifiable', ARRAY['no bun'], 'Sub gluten-free bun'),
  (t_id, 'Turkey Burger', 'Sandwiches', 'gluten', 'modifiable', ARRAY['no bun', 'no char-crust'], 'Sub gluten-free bun'),
  (t_id, 'Bison Burger', 'Sandwiches', 'gluten', 'modifiable', ARRAY['no bun'], 'Sub gluten-free bun'),
  (t_id, 'Grilled Chicken Club', 'Sandwiches', 'gluten', 'modifiable', ARRAY['no bun'], 'Sub gluten-free bun'),
  (t_id, 'Prime Rib French Dip', 'Sandwiches', 'gluten', 'modifiable', ARRAY['no bun'], 'Sub gluten-free bun'),
  (t_id, 'Blackened New York Steak Sandwich', 'Sandwiches', 'gluten', 'modifiable', ARRAY['no bun'], 'Sub gluten-free bun'),
  (t_id, 'Open Faced Mediterranean Salmon', 'Sandwiches', 'gluten', 'modifiable', ARRAY['no bun'], 'Sub gluten-free bun'),
  (t_id, 'Turkey Sandwich', 'Sandwiches', 'gluten', 'modifiable', ARRAY['no wheat bread'], 'Sub GF bun (lunch only)')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- SIDES - Gluten
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Mashed Potatoes', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Broccoli with Lemon Vinaigrette', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Roasted Vegetables', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Au Gratin Potatoes', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Baked Potato', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Sweet Potato', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Mushroom Caps', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Loaded Baked Potato', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- NIGHTLY SPECIALS - Gluten
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Tuesday: Long Island Duck', 'Nightly Specials', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Sunday: Turkey Dinner', 'Nightly Specials', 'gluten', 'modifiable', ARRAY['no stuffing', 'no gravy'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- KIDS MENU - Gluten
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Kids Burger', 'Kids Menu', 'gluten', 'modifiable', ARRAY['no fries', 'no bun'], 'Sub mashed potatoes or broccoli, sub GF bun'),
  (t_id, 'Kids Cheeseburger', 'Kids Menu', 'gluten', 'modifiable', ARRAY['no fries', 'no bun'], 'Sub mashed potatoes or broccoli, sub GF bun, may add cheese'),
  (t_id, 'Kids Filet', 'Kids Menu', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Kids Hot Fudge Sundae', 'Kids Menu', 'gluten', 'safe', ARRAY[]::TEXT[], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- DESSERTS - Gluten
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Flourless Chocolate Cake', 'Desserts', 'gluten', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Berries Crisp', 'Desserts', 'gluten', 'modifiable', ARRAY['no ice cream', 'sub whipped cream'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- BRUNCH - Gluten
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Classic Breakfast', 'Brunch', 'gluten', 'modifiable', ARRAY['no sausage', 'no toast'], 'Sub GF bun'),
  (t_id, 'Avocado Toast', 'Brunch', 'gluten', 'modifiable', ARRAY['no toast'], 'Sub GF bun'),
  (t_id, 'Avocado Toast with Sliced Tomatoes', 'Brunch', 'gluten', 'modifiable', ARRAY['no toast'], 'Sub GF bun'),
  (t_id, 'Spinach and Kale Frittata', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Skirt Steak and Eggs', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Kids Scramble', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Breakfast Potatoes and Onions', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Side of Bacon', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Side of Turkey Sausage', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Side of Fruit', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Side of Eggs', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- ==========================================================================
  -- EGG MODIFICATIONS
  -- *This includes mayonnaise*
  -- ==========================================================================

  -- APPETIZERS - Egg
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Shrimp and Crab Bisque', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'French Onion Soup', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Mediterranean Chicken Skewers', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Goat Cheese', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Shrimp Cocktail', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SALADS - Egg (Balsamic, Citrus Lime, Lemon Parmesan, Red Wine, Lemon Herb vinaigrette only)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Field Green Salad', 'Salads', 'eggs', 'safe', ARRAY[]::TEXT[], 'Use approved dressings'),
  (t_id, 'Tuscan Kale Salad', 'Salads', 'eggs', 'modifiable', ARRAY['no egg'], NULL),
  (t_id, 'Greek Salad', 'Salads', 'eggs', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Steak & Blue Cheese Salad', 'Salads', 'eggs', 'modifiable', ARRAY['no ranch dressing', 'no crispy onions'], NULL),
  (t_id, 'Chopped Salad', 'Salads', 'eggs', 'modifiable', ARRAY['no tortillas', 'sub GF tortillas'], NULL),
  (t_id, 'Salad with Grilled Chicken', 'Salads', 'eggs', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Salad with Salmon', 'Salads', 'eggs', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Salad with Steak', 'Salads', 'eggs', 'safe', ARRAY[]::TEXT[], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- SANDWICHES - Egg (NO SESAME SEED, NO KIDS BUN, NO GF BUN; May have multi-grain, buttery onion bun; NO COLESLAW, NO FRIES)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Burger', 'Sandwiches', 'eggs', 'modifiable', ARRAY['no bun', 'no fries', 'no coleslaw'], 'May use multi-grain or buttery onion bun'),
  (t_id, 'Bison Burger', 'Sandwiches', 'eggs', 'modifiable', ARRAY['no bun', 'no fries', 'no coleslaw'], 'May use multi-grain or buttery onion bun'),
  (t_id, 'Turkey Burger', 'Sandwiches', 'eggs', 'modifiable', ARRAY['no bun', 'no mayonnaise', 'no fries', 'no coleslaw'], NULL),
  (t_id, 'Chicken Club', 'Sandwiches', 'eggs', 'modifiable', ARRAY['no bun', 'no mustard mayonnaise', 'no marinated chicken', 'sub plain chicken', 'no fries', 'no coleslaw'], NULL),
  (t_id, 'Mediterranean Salmon Sandwich', 'Sandwiches', 'eggs', 'modifiable', ARRAY['no other changes', 'no fries', 'no coleslaw'], NULL),
  (t_id, 'French Dip', 'Sandwiches', 'eggs', 'modifiable', ARRAY['no other changes', 'no fries', 'no coleslaw'], NULL),
  (t_id, 'Blackened Steak Sandwich', 'Sandwiches', 'eggs', 'modifiable', ARRAY['no bun', 'no fries', 'no coleslaw'], NULL),
  (t_id, 'Turkey Sandwich', 'Sandwiches', 'eggs', 'modifiable', ARRAY['no other changes', 'no fries', 'no coleslaw'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- FILETS - Egg
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Tenderloin Tips', 'Filets', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Petite Filet', 'Filets', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Horseradish Crusted Filet', 'Filets', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Filet Duo/Trio', 'Filets', 'eggs', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- STEAKS AND CHOPS - Egg (all safe)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Pork Chops', 'Steak and Chops', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Skirt Steak', 'Steak and Chops', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'New York Strip', 'Steak and Chops', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Porterhouse', 'Steak and Chops', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Ribeye', 'Steak and Chops', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Lamb Chops', 'Steak and Chops', 'eggs', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- STEAK ADD ONS - Egg
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Shrimp Skewer', 'Steak Add Ons', 'eggs', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- PRIME RIB - Egg
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Prime Rib', 'Prime Rib', 'eggs', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- FRESH FISH AND SEAFOOD - Egg
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Salmon', 'Fresh Fish and Seafood', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Scallops De Jonghe', 'Fresh Fish and Seafood', 'eggs', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- NIGHTLY SPECIALS - Egg
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Wednesday: Spit Roasted Duck', 'Nightly Specials', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Sunday: Turkey Dinner', 'Nightly Specials', 'eggs', 'modifiable', ARRAY['no stuffing'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- CHICKEN AND BARBECUE - Egg
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Herb Chicken', 'Chicken', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'BBQ Chicken', 'Chicken', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Lemon Pepper Chicken', 'Chicken', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Chicken Moreno', 'Chicken', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Baby Back Ribs', 'Chicken and Barbecue', 'eggs', 'modifiable', ARRAY['no coleslaw']),
  (t_id, 'Chicken and BBQ Rib Combo', 'Chicken and Barbecue', 'eggs', 'modifiable', ARRAY['no coleslaw'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SIDES - Egg (all safe)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Mashed Potatoes', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Broccoli', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Creamed Spinach', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Roasted Vegetables', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Au Gratin Potatoes', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Baked Potato', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Sweet Potato', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Mushroom Caps', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Loaded Baked Potato', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Roasted Asparagus', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Applesauce', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- DESSERTS - Egg
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Berries Crisp', 'Desserts', 'eggs', 'modifiable', ARRAY['no oatmeal crumble', 'no ice cream'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- KIDS MENU - Egg (NO SESAME SEED, NO KIDS BUN; May have multi-grain, buttery onion; NO FRIES)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Kids Burger', 'Kids Menu', 'eggs', 'modifiable', ARRAY['no bun', 'no fries'], 'May use multi-grain or buttery onion bun'),
  (t_id, 'Kids Steak & Mashed Potatoes', 'Kids Menu', 'eggs', 'safe', ARRAY[]::TEXT[], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- BRUNCH - Egg
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Avocado Toast', 'Brunch', 'eggs', 'modifiable', ARRAY['no eggs']),
  (t_id, 'Avocado Toast with Sliced Tomatoes', 'Brunch', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Skirt Steak and Eggs', 'Brunch', 'eggs', 'modifiable', ARRAY['no eggs']),
  (t_id, 'Breakfast Potatoes and Onions', 'Brunch', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Applewood Bacon', 'Brunch', 'eggs', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SPECIAL PARTY MENU - Egg
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Mozzarella Pizza', 'Special Party Menu', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Grilled Pepperoni', 'Special Party Menu', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Wild Mushroom Pizza', 'Special Party Menu', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Harvest Grain Bowl', 'Special Party Menu', 'eggs', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Roasted Vegetable Vegan Plate', 'Special Party Menu', 'eggs', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- ==========================================================================
  -- PEANUT & TREE NUT MODIFICATIONS (Combined)
  -- ==========================================================================

  -- Most items are safe for peanut/tree nut - only listing items with modifications
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  -- Tree Nuts
  (t_id, 'Cheesecake', 'Desserts', 'tree_nuts', 'modifiable', ARRAY['no cherry sauce']),
  (t_id, 'Chocolate Chip Cookie', 'Desserts', 'tree_nuts', 'modifiable', ARRAY['no ice cream']),
  (t_id, 'Berries Crisp', 'Desserts', 'tree_nuts', 'modifiable', ARRAY['no ice cream', 'sub whipped cream']),
  -- Peanuts (most items safe, similar rules)
  (t_id, 'Cheesecake', 'Desserts', 'peanuts', 'modifiable', ARRAY['no cherry sauce']),
  (t_id, 'Chocolate Chip Cookie', 'Desserts', 'peanuts', 'modifiable', ARRAY['no ice cream']),
  (t_id, 'Berries Crisp', 'Desserts', 'peanuts', 'modifiable', ARRAY['no ice cream', 'sub whipped cream'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- ==========================================================================
  -- SESAME MODIFICATIONS
  -- ==========================================================================

  -- APPETIZERS - Sesame (all safe)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Shrimp and Crab Bisque', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'French Onion Soup', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Mediterranean Chicken Skewers', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Bison Meatballs', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Goat Cheese', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Shrimp Cocktail', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Fried Calamari', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Crab Cakes', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'sesame', 'modifiable', ARRAY['no apricot dipping sauce'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SALADS - Sesame (Balsamic, Citrus, Red Wine, Lemon Herb, Lemon Parmesan, Blue Cheese, Ranch OK)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Field Green Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Caesar Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Tuscan Kale Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Greek Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Steak & Blue Cheese Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Chopped Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Salad with Grilled Chicken', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Salad with Salmon', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Salad with Steak', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SANDWICHES - Sesame (NO SESAME SEED BUN, MULTI-GRAIN BREAD, OR BUTTERY ONION BUN; can have GF bun, kids bun)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Burger', 'Sandwiches', 'sesame', 'modifiable', ARRAY['no sesame seed bun'], 'Can use GF bun or kids bun'),
  (t_id, 'Bison Burger', 'Sandwiches', 'sesame', 'modifiable', ARRAY['no sesame seed bun'], 'Can use GF bun or kids bun'),
  (t_id, 'Turkey Burger', 'Sandwiches', 'sesame', 'modifiable', ARRAY['no sesame seed bun'], NULL),
  (t_id, 'Hot Honey Chicken Sandwich', 'Sandwiches', 'sesame', 'modifiable', ARRAY['no sesame seed bun'], NULL),
  (t_id, 'Chicken Club', 'Sandwiches', 'sesame', 'modifiable', ARRAY['no sesame seed bun'], NULL),
  (t_id, 'Mediterranean Salmon Sandwich', 'Sandwiches', 'sesame', 'modifiable', ARRAY['no za''atar', 'no multi-grain bread'], NULL),
  (t_id, 'Crab Cake Sandwich', 'Sandwiches', 'sesame', 'modifiable', ARRAY['no sesame seed bun'], NULL),
  (t_id, 'French Dip', 'Sandwiches', 'sesame', 'modifiable', ARRAY['no buttery onion bun'], NULL),
  (t_id, 'Blackened Steak Sandwich', 'Sandwiches', 'sesame', 'modifiable', ARRAY['no buttery onion bun'], NULL),
  (t_id, 'Turkey Sandwich', 'Sandwiches', 'sesame', 'modifiable', ARRAY['no multi-grain bread'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- FILETS - Sesame (all safe)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Tenderloin Tips', 'Filets', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Petite Filet', 'Filets', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Horseradish Crusted Filet', 'Filets', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Filet Duo/Trio', 'Filets', 'sesame', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- STEAKS AND CHOPS - Sesame (all safe)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Pork Chops', 'Steak and Chops', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Skirt Steak', 'Steak and Chops', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'New York Strip', 'Steak and Chops', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Porterhouse', 'Steak and Chops', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Ribeye', 'Steak and Chops', 'sesame', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Lamb Chops', 'Steak and Chops', 'sesame', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- PRIME RIB - Sesame
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Prime Rib', 'Prime Rib', 'sesame', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- ==========================================================================
  -- GARLIC MODIFICATIONS
  -- *This does NOT include shallots*
  -- ==========================================================================

  -- APPETIZERS - Garlic
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Shrimp Cocktail', 'Appetizers', 'garlic', 'modifiable', ARRAY['no cocktail sauce']),
  (t_id, 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'garlic', 'modifiable', ARRAY['no apricot dipping sauce'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SALADS - Garlic (ONLY Blue Cheese and Oil and Vinegar cruets)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Field Green Salad', 'Salads', 'garlic', 'safe', ARRAY[]::TEXT[], 'Only blue cheese or oil/vinegar'),
  (t_id, 'Tuscan Kale Salad', 'Salads', 'garlic', 'modifiable', ARRAY['no lemon parmesan vinaigrette'], NULL),
  (t_id, 'Greek Salad', 'Salads', 'garlic', 'modifiable', ARRAY['no red wine vinaigrette'], NULL),
  (t_id, 'Steak & Blue Cheese Salad', 'Salads', 'garlic', 'modifiable', ARRAY['no marinade on steak', 'no scallions', 'no crispy onions', 'no balsamic vinaigrette', 'no ranch dressing'], NULL),
  (t_id, 'Chopped Salad', 'Salads', 'garlic', 'modifiable', ARRAY['no citrus vinaigrette', 'no chicken', 'sub plain chicken', 'no tortillas'], NULL),
  (t_id, 'Salad with Grilled Chicken', 'Salads', 'garlic', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Salad with Salmon', 'Salads', 'garlic', 'modifiable', ARRAY['no BBQ chicken spice'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- SANDWICHES - Garlic (NO FRIES)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Burger', 'Sandwiches', 'garlic', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Bison Burger', 'Sandwiches', 'garlic', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Chicken Club', 'Sandwiches', 'garlic', 'modifiable', ARRAY['no mustard mayonnaise', 'no marinated chicken', 'sub plain chicken']),
  (t_id, 'Mediterranean Salmon Sandwich', 'Sandwiches', 'garlic', 'modifiable', ARRAY['no yogurt drizzle', 'no red wine vinaigrette on arugula']),
  (t_id, 'Blackened Steak Sandwich', 'Sandwiches', 'garlic', 'modifiable', ARRAY['no blackening spice', 'no ancho mayo']),
  (t_id, 'Turkey Sandwich', 'Sandwiches', 'garlic', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- FILETS - Garlic (ONLY BLUE CHEESE, HORSERADISH AND PEPPERCORN CRUSTS)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Tenderloin Tips', 'Filets', 'garlic', 'modifiable', ARRAY['no bourbon marinade', 'no steak butter', 'no au jus', 'no roasted red onions'], 'Only blue cheese, horseradish, peppercorn crusts'),
  (t_id, 'Petite Filet', 'Filets', 'garlic', 'modifiable', ARRAY['no steak butter', 'no garlic crouton', 'no au jus'], NULL),
  (t_id, 'Horseradish Crusted Filet', 'Filets', 'garlic', 'modifiable', ARRAY['no garlic crouton', 'no au jus'], NULL),
  (t_id, 'Filet Duo/Trio', 'Filets', 'garlic', 'modifiable', ARRAY['no au jus'], 'Only blue cheese, horseradish, peppercorn crusts')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- STEAKS AND CHOPS - Garlic
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Skirt Steak', 'Steak and Chops', 'garlic', 'modifiable', ARRAY['no steak marinade', 'no steak butter', 'no au jus', 'no red onions']),
  (t_id, 'New York Strip', 'Steak and Chops', 'garlic', 'modifiable', ARRAY['no steak butter', 'no au jus']),
  (t_id, 'Porterhouse', 'Steak and Chops', 'garlic', 'modifiable', ARRAY['no char-crust', 'no steak butter', 'no au jus']),
  (t_id, 'Ribeye', 'Steak and Chops', 'garlic', 'modifiable', ARRAY['no char-crust', 'no steak butter', 'no au jus']),
  (t_id, 'Lamb Chops', 'Steak and Chops', 'garlic', 'modifiable', ARRAY['no char-crust', 'no steak butter', 'no au jus', 'no mint chimichurri'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- FRESH FISH AND SEAFOOD - Garlic
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Salmon', 'Fresh Fish and Seafood', 'garlic', 'modifiable', ARRAY['no BBQ chicken spice'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- NIGHTLY SPECIALS - Garlic
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Wednesday: Long Island Duck', 'Nightly Specials', 'garlic', 'modifiable', ARRAY['no wild rice', 'no cherry sauce'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- ==========================================================================
  -- ONION MODIFICATIONS
  -- *This includes scallions, chives, and shallots*
  -- ==========================================================================

  -- APPETIZERS - Onion
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Mediterranean Chicken Skewers', 'Appetizers', 'onion', 'modifiable', ARRAY['no chicken jus']),
  (t_id, 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'onion', 'modifiable', ARRAY['no apricot dipping sauce', 'no chives'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SALADS - Onion (ONLY Caesar, Lemon Parmesan, Blue Cheese, and Red Wine vinaigrette)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Caesar Salad', 'Salads', 'onion', 'safe', ARRAY[]::TEXT[], 'Use approved dressings'),
  (t_id, 'Tuscan Kale Salad', 'Salads', 'onion', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Greek Salad', 'Salads', 'onion', 'modifiable', ARRAY['no red onion'], NULL),
  (t_id, 'Steak & Blue Cheese Salad', 'Salads', 'onion', 'modifiable', ARRAY['no balsamic vinaigrette', 'no scallions', 'no crispy onions', 'no ranch dressing'], NULL),
  (t_id, 'Chopped Salad', 'Salads', 'onion', 'modifiable', ARRAY['no scallions', 'no chicken', 'sub plain chicken', 'no tortillas', 'no citrus dressing'], NULL),
  (t_id, 'Salad with Grilled Chicken', 'Salads', 'onion', 'modifiable', ARRAY['no marinade', 'sub plain chicken'], NULL),
  (t_id, 'Salad with Salmon', 'Salads', 'onion', 'modifiable', ARRAY['no BBQ spice'], NULL),
  (t_id, 'Salad with Steak', 'Salads', 'onion', 'modifiable', ARRAY['no bourbon marinade'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- SANDWICHES - Onion (NO FRIES, NO KETCHUP, NO BUTTERY ONION BUN, all other bread OK)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Burger', 'Sandwiches', 'onion', 'safe', ARRAY[]::TEXT[], 'No fries, no ketchup'),
  (t_id, 'Bison Burger', 'Sandwiches', 'onion', 'safe', ARRAY[]::TEXT[], 'No fries, no ketchup'),
  (t_id, 'Chicken Club', 'Sandwiches', 'onion', 'modifiable', ARRAY['no mustard mayo marinade chicken', 'sub plain chicken', 'no mustard mayo'], NULL),
  (t_id, 'Mediterranean Salmon Sandwich', 'Sandwiches', 'onion', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'French Dip', 'Sandwiches', 'onion', 'modifiable', ARRAY['no buttery onion bun', 'no au jus'], NULL),
  (t_id, 'Blackened Steak Sandwich', 'Sandwiches', 'onion', 'modifiable', ARRAY['no blackening spice', 'no buttery onion bun', 'no ancho mayo'], NULL),
  (t_id, 'Turkey Sandwich', 'Sandwiches', 'onion', 'safe', ARRAY[]::TEXT[], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- FILET MIGNON - Onion (CRUSTS: Blue Cheese, Horseradish, Peppercorn)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Tenderloin Tips', 'Filets', 'onion', 'modifiable', ARRAY['no bourbon marinade', 'no steak butter', 'no au jus', 'no roasted red onions'], 'Blue cheese, horseradish, peppercorn crusts only'),
  (t_id, 'Petite Filet', 'Filets', 'onion', 'modifiable', ARRAY['no au jus', 'no steak butter'], NULL),
  (t_id, 'Horseradish Crusted Filet', 'Filets', 'onion', 'modifiable', ARRAY['no au jus'], NULL),
  (t_id, 'Filet Trio/Duo', 'Filets', 'onion', 'modifiable', ARRAY['no au jus'], 'See above crusts')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- STEAK AND CHOPS - Onion
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Pork Chops', 'Steak and Chops', 'onion', 'modifiable', ARRAY['no mushroom crust', 'no au jus']),
  (t_id, 'Skirt Steak', 'Steak and Chops', 'onion', 'modifiable', ARRAY['no steak marinade', 'no steak butter', 'no au jus', 'no red onions']),
  (t_id, 'New York Strip', 'Steak and Chops', 'onion', 'modifiable', ARRAY['no steak butter', 'no au jus']),
  (t_id, 'Porterhouse', 'Steak and Chops', 'onion', 'modifiable', ARRAY['no char crust', 'no steak butter', 'no au jus']),
  (t_id, 'Ribeye', 'Steak and Chops', 'onion', 'modifiable', ARRAY['no char crust', 'no steak butter', 'no au jus']),
  (t_id, 'Lamb Chops', 'Steak and Chops', 'onion', 'modifiable', ARRAY['no char-crust', 'no steak butter', 'no au jus', 'no mint chimichurri'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- PRIME RIB - Onion
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Prime Rib', 'Prime Rib', 'onion', 'modifiable', ARRAY['no au jus'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SEAFOOD - Onion
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Salmon', 'Fresh Fish and Seafood', 'onion', 'modifiable', ARRAY['no BBQ chicken spice'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- BARBECUE - Onion
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Baby Back Ribs', 'Chicken and Barbecue', 'onion', 'modifiable', ARRAY['no barbeque sauce'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SIDES - Onion
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Mashed Potatoes', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Steamed Broccoli', 'Sides', 'onion', 'modifiable', ARRAY['no lemon herb vinaigrette']),
  (t_id, 'Creamed Spinach', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Au Gratin Potatoes', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Mac & Cheese', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Baked Potato', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Loaded Baked Potato', 'Sides', 'onion', 'modifiable', ARRAY['no scallions']),
  (t_id, 'Roasted Asparagus', 'Sides', 'onion', 'modifiable', ARRAY['no balsamic vinaigrette']),
  (t_id, 'Applesauce', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Coleslaw', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- DESSERTS - Onion (all safe)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Chocolate Cake', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Cheesecake', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Key Lime Pie', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Chocolate Chip Cookie', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Cherry Pie', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Berries Crisp', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Ice Cream', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Kids Sundae', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Flourless Chocolate Cake', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- KIDS MENU - Onion (NO KETCHUP)
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (t_id, 'Kids Burger', 'Kids Menu', 'onion', 'modifiable', ARRAY['no fries'], 'No ketchup'),
  (t_id, 'Kids Grilled Cheese', 'Kids Menu', 'onion', 'modifiable', ARRAY['no fries'], 'No ketchup'),
  (t_id, 'Kids Mac & Cheese', 'Kids Menu', 'onion', 'safe', ARRAY[]::TEXT[], NULL),
  (t_id, 'Kids Steak & Mashed Potatoes', 'Kids Menu', 'onion', 'modifiable', ARRAY['no steak butter', 'no au jus'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications, notes = EXCLUDED.notes;

  -- BRUNCH - Onion
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Classic Breakfast', 'Brunch', 'onion', 'modifiable', ARRAY['no breakfast potatoes']),
  (t_id, 'Turkey Sausage Burrito', 'Brunch', 'onion', 'modifiable', ARRAY['no pico de gallo', 'no breakfast potatoes', 'no ranchero sauce', 'no guacamole']),
  (t_id, 'Buttermilk Pancakes', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Door County Cherry Pancakes', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'French Toast', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Kids Buttermilk Pancakes', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Kids Chocolate Chip Pancakes', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Kids French Toast', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Kids Scramble', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Side of Wheat Toast', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Side of Bacon', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Side of Turkey Sausage', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
  (t_id, 'Side of Fresh Fruit', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  -- SPECIAL PARTY MENU - Onion
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (t_id, 'Fresh Mozzarella', 'Special Party Menu', 'onion', 'modifiable', ARRAY['no tomato jam']),
  (t_id, 'Grilled Pepperoni', 'Special Party Menu', 'onion', 'modifiable', ARRAY['no tomato jam']),
  (t_id, 'Harvest Grain Bowl', 'Special Party Menu', 'onion', 'modifiable', ARRAY['no chives', 'no balsamic vinaigrette', 'no lemon herb vinaigrette']),
  (t_id, 'Roasted Vegetable Vegan Plate', 'Special Party Menu', 'onion', 'modifiable', ARRAY['no balsamic']),
  (t_id, 'Pasta and Roasted Vegetables', 'Special Party Menu', 'onion', 'modifiable', ARRAY['no garlic butter', 'sub plain butter', 'no tomato basil sauce'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

  RAISE NOTICE 'All allergen modifications inserted successfully for tenant %', t_id;
END $$;

-- ============================================================================
-- SUMMARY QUERY
-- Run this after migration to see counts per allergen
-- ============================================================================
-- SELECT allergen, status, count(*) 
-- FROM allergen_modifications 
-- GROUP BY allergen, status 
-- ORDER BY allergen, status;
