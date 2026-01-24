-- ============================================================================
-- ALLERGEN MODIFICATIONS TABLE
-- Stores official modification rules for each dish + allergen combination
-- ============================================================================
-- 
-- Logic:
--   - If a dish IS in this table with status 'safe' → No changes needed
--   - If a dish IS in this table with status 'modifiable' → Apply the modifications
--   - If a dish is NOT in this table → Assume NOT MODIFIABLE (safety first)
--
-- ============================================================================

-- Drop existing table if exists (for clean migration)
DROP TABLE IF EXISTS allergen_modifications CASCADE;

-- Create the allergen modifications table
CREATE TABLE allergen_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Which tenant this applies to (for multi-tenant support)
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- The dish name (should match menu item names)
  dish_name TEXT NOT NULL,
  
  -- Category for organization (appetizers, salads, sandwiches, etc.)
  category TEXT NOT NULL,
  
  -- Which allergen this rule is for
  allergen TEXT NOT NULL CHECK (allergen IN (
    'dairy', 'gluten', 'shellfish', 'fish', 'peanuts', 
    'tree_nuts', 'soy', 'eggs', 'sesame', 'onion_garlic', 
    'nightshade', 'fodmap', 'alcohol'
  )),
  
  -- Status of this dish for this allergen
  status TEXT NOT NULL CHECK (status IN ('safe', 'modifiable', 'not_modifiable')),
  
  -- Array of modifications needed (empty if 'safe' or 'not_modifiable')
  -- Example: ["no butter", "no cheese", "sub olive oil"]
  modifications TEXT[] DEFAULT '{}',
  
  -- Optional notes (e.g., "also applies to kids menu version")
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique dish + allergen per tenant
  UNIQUE(tenant_id, dish_name, allergen)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_allergen_mods_tenant ON allergen_modifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_allergen_mods_allergen ON allergen_modifications(allergen);
CREATE INDEX IF NOT EXISTS idx_allergen_mods_dish ON allergen_modifications(dish_name);
CREATE INDEX IF NOT EXISTS idx_allergen_mods_category ON allergen_modifications(category);

-- RLS Policies
ALTER TABLE allergen_modifications ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (Edge Functions use service role)
CREATE POLICY "Service role full access to allergen_modifications"
  ON allergen_modifications
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- INSERT DAIRY MODIFICATIONS FOR WILDFIRE TYSON'S CORNER
-- ============================================================================

-- First, get the tenant ID for Wildfire Tyson's Corner
-- We'll use a DO block to insert with the correct tenant_id

DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Get tenant ID (assuming it exists from previous migration)
  SELECT id INTO v_tenant_id FROM tenants 
  WHERE concept_name = 'Wildfire' AND location_name = 'Tyson''s Corner'
  LIMIT 1;
  
  -- If tenant doesn't exist, create it
  IF v_tenant_id IS NULL THEN
    INSERT INTO tenants (concept_name, location_name, status)
    VALUES ('Wildfire', 'Tyson''s Corner', 'active')
    RETURNING id INTO v_tenant_id;
  END IF;

  -- ========================================
  -- APPETIZERS
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (v_tenant_id, 'Mediterranean Chicken Skewers', 'Appetizers', 'dairy', 'modifiable', ARRAY['no yogurt sauce']),
  (v_tenant_id, 'Shrimp Cocktail', 'Appetizers', 'dairy', 'safe', ARRAY[]::TEXT[]),
  (v_tenant_id, 'Crab Cakes', 'Appetizers', 'dairy', 'modifiable', ARRAY['no mustard mayonnaise']),
  (v_tenant_id, 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'dairy', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

  -- ========================================
  -- SALADS
  -- Note: Balsamic, Citrus Lime, and Lemon Herb vinaigrettes are dairy-free
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (v_tenant_id, 'Field Green Salad', 'Salads', 'dairy', 'safe', ARRAY[]::TEXT[], 'Use balsamic, citrus lime, or lemon herb vinaigrette'),
  (v_tenant_id, 'Tuscan Kale Salad', 'Salads', 'dairy', 'modifiable', ARRAY['no cheese', 'no dressing'], NULL),
  (v_tenant_id, 'Greek Salad', 'Salads', 'dairy', 'modifiable', ARRAY['no feta cheese', 'no dressing'], NULL),
  (v_tenant_id, 'Steak & Blue Cheese Salad', 'Salads', 'dairy', 'modifiable', ARRAY['no cheese', 'no crispy onions', 'no ranch dressing'], NULL),
  (v_tenant_id, 'Chopped Salad', 'Salads', 'dairy', 'modifiable', ARRAY['no marinated chicken', 'no blue cheese', 'no tortillas'], NULL),
  -- Salad protein add-ons
  (v_tenant_id, 'Salad with Grilled Chicken', 'Salads', 'dairy', 'safe', ARRAY[]::TEXT[], 'Protein add-on'),
  (v_tenant_id, 'Salad with Salmon', 'Salads', 'dairy', 'modifiable', ARRAY['no glaze'], 'Protein add-on'),
  (v_tenant_id, 'Salad with Steak', 'Salads', 'dairy', 'modifiable', ARRAY['no steak butter'], 'Protein add-on')
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    notes = EXCLUDED.notes,
    updated_at = NOW();

  -- ========================================
  -- SANDWICHES
  -- General rules: NO BUTTER ON BUNS/BREAD, NO KID'S BUN, NO BUTTERY ONION BUN, 
  -- NO GLUTEN FREE BUN, NO COLESLAW, NO FRIES
  -- May use: sesame seed bun, multi-grain bread
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (v_tenant_id, 'Burger', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no butter on bun', 'no coleslaw', 'no fries'], 'May use sesame seed or multi-grain bun'),
  (v_tenant_id, 'Bison Burger', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no butter on bun', 'no coleslaw', 'no fries'], 'May use sesame seed or multi-grain bun'),
  (v_tenant_id, 'Turkey Burger', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no cheese', 'no butter on bun'], NULL),
  (v_tenant_id, 'Chicken Club', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no mustard-mayo marinated chicken', 'sub plain chicken', 'no cheese', 'no mustard mayonnaise', 'no butter on bun', 'no coleslaw', 'no fries'], NULL),
  (v_tenant_id, 'Mediterranean Salmon Sandwich', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no yogurt sauce', 'no butter on bread', 'no red wine vinaigrette', 'no coleslaw', 'no fries'], NULL),
  (v_tenant_id, 'Crab Cake Sandwich', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no butter on bun'], NULL),
  (v_tenant_id, 'French Dip', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no butter on bread', 'no horseradish cream sauce', 'no coleslaw', 'no fries'], NULL),
  (v_tenant_id, 'Turkey Sandwich', 'Sandwiches', 'dairy', 'modifiable', ARRAY['no cheese', 'no butter on bread'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    notes = EXCLUDED.notes,
    updated_at = NOW();

  -- ========================================
  -- FILETS
  -- General rules: NO CRUSTS (except peppercorn), NO STEAK BUTTER, 
  -- NO GARLIC CROUTON, NO PRE-MARKING BUTTER
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (v_tenant_id, 'Tenderloin Tips', 'Filets', 'dairy', 'modifiable', ARRAY['no steak butter', 'no pre-marking butter']),
  (v_tenant_id, 'Petite Filet', 'Filets', 'dairy', 'modifiable', ARRAY['no pre-marking butter', 'no steak butter', 'no garlic crouton']),
  (v_tenant_id, 'Dinner Filet', 'Filets', 'dairy', 'modifiable', ARRAY['no pre-marking butter', 'no steak butter', 'no garlic crouton'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

  -- ========================================
  -- STEAK AND CHOPS
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (v_tenant_id, 'Pork Chops', 'Steak and Chops', 'dairy', 'modifiable', ARRAY['no mushroom crust', 'no pre-marking butter']),
  (v_tenant_id, 'Skirt Steak', 'Steak and Chops', 'dairy', 'modifiable', ARRAY['no steak butter', 'no pre-marking butter']),
  (v_tenant_id, 'New York Strip', 'Steak and Chops', 'dairy', 'modifiable', ARRAY['no steak butter', 'no pre-marking butter']),
  (v_tenant_id, 'Porterhouse', 'Steak and Chops', 'dairy', 'modifiable', ARRAY['no steak butter', 'no pre-marking butter']),
  (v_tenant_id, 'Ribeye', 'Steak and Chops', 'dairy', 'modifiable', ARRAY['no steak butter', 'no pre-marking butter']),
  (v_tenant_id, 'Lamb Chops', 'Steak and Chops', 'dairy', 'modifiable', ARRAY['no steak butter', 'no pre-marking butter'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

  -- ========================================
  -- PRIME RIB
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (v_tenant_id, 'Prime Rib', 'Prime Rib', 'dairy', 'modifiable', ARRAY['no horseradish cream sauce'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

  -- ========================================
  -- STEAK ADD ONS
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (v_tenant_id, 'Shrimp Skewer Add-On', 'Steak Add Ons', 'dairy', 'modifiable', ARRAY['no garlic butter']),
  (v_tenant_id, 'Crab Cakes Add-On', 'Steak Add Ons', 'dairy', 'modifiable', ARRAY['no mustard mayonnaise'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

  -- ========================================
  -- FRESH FISH AND SEAFOOD
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (v_tenant_id, 'Salmon', 'Fresh Fish and Seafood', 'dairy', 'modifiable', ARRAY['no glaze']),
  (v_tenant_id, 'Crab Cake Entree', 'Fresh Fish and Seafood', 'dairy', 'modifiable', ARRAY['no mustard mayo'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

  -- ========================================
  -- NIGHTLY SPECIALS
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (v_tenant_id, 'Wednesday: Long Island Duck', 'Nightly Specials', 'dairy', 'modifiable', ARRAY['no cherry glaze', 'no wild rice'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

  -- ========================================
  -- CHICKEN
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (v_tenant_id, 'Chicken Moreno', 'Chicken', 'dairy', 'modifiable', ARRAY['no lemon parmesan vinaigrette', 'sub lemon herb vinaigrette', 'no parmesan'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

  -- ========================================
  -- SIDES
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (v_tenant_id, 'Broccoli', 'Sides', 'dairy', 'safe', ARRAY[]::TEXT[]),
  (v_tenant_id, 'Roasted Vegetables', 'Sides', 'dairy', 'safe', ARRAY[]::TEXT[]),
  (v_tenant_id, 'Baked Potato', 'Sides', 'dairy', 'modifiable', ARRAY['no sour cream', 'no butter']),
  (v_tenant_id, 'Sweet Potato', 'Sides', 'dairy', 'modifiable', ARRAY['no butter']),
  (v_tenant_id, 'Roasted Asparagus', 'Sides', 'dairy', 'safe', ARRAY[]::TEXT[]),
  (v_tenant_id, 'Applesauce', 'Sides', 'dairy', 'safe', ARRAY[]::TEXT[])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

  -- ========================================
  -- DESSERTS
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
  (v_tenant_id, 'Berries Crisp', 'Desserts', 'dairy', 'modifiable', ARRAY['no oatmeal crumble', 'no ice cream'])
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

  -- ========================================
  -- KID'S MENU
  -- ========================================
  INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
  (v_tenant_id, 'Kid''s Burger', 'Kids Menu', 'dairy', 'modifiable', ARRAY['no bun', 'sub multi-grain or sesame seed bun', 'no butter on bun', 'no cheese'], 'No kid''s bun available for dairy allergy'),
  (v_tenant_id, 'Kid''s Cheeseburger', 'Kids Menu', 'dairy', 'modifiable', ARRAY['no bun', 'sub multi-grain or sesame seed bun', 'no butter on bun', 'no cheese'], 'No kid''s bun available for dairy allergy'),
  (v_tenant_id, 'Kid''s Steak & Mashed Potatoes', 'Kids Menu', 'dairy', 'modifiable', ARRAY['no pre-marking butter', 'no steak butter', 'no mashed potatoes'], NULL)
  ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET
    status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    notes = EXCLUDED.notes,
    updated_at = NOW();

  RAISE NOTICE 'Inserted dairy modifications for tenant %', v_tenant_id;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the data was inserted correctly:
-- SELECT category, dish_name, status, modifications FROM allergen_modifications 
-- WHERE allergen = 'dairy' ORDER BY category, dish_name;
