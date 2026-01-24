-- ============================================================================
-- MENU ITEMS TABLE
-- Stores all menu items for each tenant
-- ============================================================================

-- Drop existing table if exists (for clean migration)
DROP TABLE IF EXISTS menu_items CASCADE;

-- Create the menu items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Which tenant this menu item belongs to
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  
  -- Price (optional, for display)
  price DECIMAL(10, 2),
  
  -- Dietary flags (quick reference)
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  
  -- Raw ingredients/allergens info (for reference)
  -- This is the "contains" list from the original menu
  raw_allergen_info TEXT,
  
  -- Whether this item is currently available
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Display order within category
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique item name per tenant
  UNIQUE(tenant_id, name)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant ON menu_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);

-- RLS Policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write
CREATE POLICY "Service role full access to menu_items"
  ON menu_items
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- CATEGORIES TABLE (for consistent category management)
-- ============================================================================

DROP TABLE IF EXISTS menu_categories CASCADE;

CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  icon TEXT, -- emoji or icon name
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_tenant ON menu_categories(tenant_id);

ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to menu_categories"
  ON menu_categories
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- INSERT WILDFIRE TYSON'S CORNER CATEGORIES
-- ============================================================================

DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants 
  WHERE concept_name = 'Wildfire' AND location_name = 'Tyson''s Corner'
  LIMIT 1;
  
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant not found. Run migration 001 first.';
  END IF;

  INSERT INTO menu_categories (tenant_id, name, display_order, icon) VALUES
  (v_tenant_id, 'Appetizers', 1, '🍤'),
  (v_tenant_id, 'Salads', 2, '🥗'),
  (v_tenant_id, 'Sandwiches', 3, '🍔'),
  (v_tenant_id, 'Filets', 4, '🥩'),
  (v_tenant_id, 'Steak and Chops', 5, '🥩'),
  (v_tenant_id, 'Prime Rib', 6, '🥩'),
  (v_tenant_id, 'Steak Add Ons', 7, '➕'),
  (v_tenant_id, 'Fresh Fish and Seafood', 8, '🐟'),
  (v_tenant_id, 'Nightly Specials', 9, '⭐'),
  (v_tenant_id, 'Chicken', 10, '🍗'),
  (v_tenant_id, 'Sides', 11, '🥔'),
  (v_tenant_id, 'Desserts', 12, '🍰'),
  (v_tenant_id, 'Kids Menu', 13, '👶'),
  (v_tenant_id, 'Beverages', 14, '🥤')
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    display_order = EXCLUDED.display_order,
    icon = EXCLUDED.icon;

  RAISE NOTICE 'Categories inserted for tenant %', v_tenant_id;
END $$;

-- ============================================================================
-- SAMPLE MENU ITEMS (You'll want to import the full menu)
-- This is just a few examples to show the structure
-- ============================================================================

DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants 
  WHERE concept_name = 'Wildfire' AND location_name = 'Tyson''s Corner'
  LIMIT 1;

  -- APPETIZERS
  INSERT INTO menu_items (tenant_id, name, category, description, raw_allergen_info, display_order) VALUES
  (v_tenant_id, 'Mediterranean Chicken Skewers', 'Appetizers', 'Grilled chicken skewers with yogurt sauce', 'Contains: Dairy (yogurt sauce)', 1),
  (v_tenant_id, 'Shrimp Cocktail', 'Appetizers', 'Chilled shrimp with cocktail sauce', 'Contains: Shellfish', 2),
  (v_tenant_id, 'Crab Cakes', 'Appetizers', 'Pan-seared crab cakes with mustard mayo', 'Contains: Shellfish, Eggs (mayo)', 3),
  (v_tenant_id, 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'Scallops wrapped in bacon', 'Contains: Shellfish, Pork', 4)
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    raw_allergen_info = EXCLUDED.raw_allergen_info,
    display_order = EXCLUDED.display_order;

  -- SALADS
  INSERT INTO menu_items (tenant_id, name, category, description, raw_allergen_info, display_order) VALUES
  (v_tenant_id, 'Field Green Salad', 'Salads', 'Mixed greens with vinaigrette', 'Dairy-free vinaigrettes available', 1),
  (v_tenant_id, 'Tuscan Kale Salad', 'Salads', 'Kale with cheese and dressing', 'Contains: Dairy (cheese, dressing)', 2),
  (v_tenant_id, 'Greek Salad', 'Salads', 'Traditional Greek salad with feta', 'Contains: Dairy (feta cheese)', 3),
  (v_tenant_id, 'Steak & Blue Cheese Salad', 'Salads', 'Grilled steak with blue cheese', 'Contains: Dairy (blue cheese, ranch)', 4),
  (v_tenant_id, 'Chopped Salad', 'Salads', 'Chopped vegetables with chicken and cheese', 'Contains: Dairy (blue cheese)', 5),
  (v_tenant_id, 'Caesar Salad', 'Salads', 'Romaine with Caesar dressing', 'Contains: Dairy (parmesan), Eggs, Fish (anchovies)', 6)
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    raw_allergen_info = EXCLUDED.raw_allergen_info,
    display_order = EXCLUDED.display_order;

  -- FILETS
  INSERT INTO menu_items (tenant_id, name, category, description, raw_allergen_info, display_order) VALUES
  (v_tenant_id, 'Tenderloin Tips', 'Filets', 'Sautéed tenderloin tips', 'Contains: Dairy (butter)', 1),
  (v_tenant_id, 'Petite Filet', 'Filets', '8oz filet mignon', 'Contains: Dairy (butter, garlic crouton)', 2),
  (v_tenant_id, 'Dinner Filet', 'Filets', '12oz filet mignon', 'Contains: Dairy (butter, garlic crouton)', 3)
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    raw_allergen_info = EXCLUDED.raw_allergen_info,
    display_order = EXCLUDED.display_order;

  -- STEAK AND CHOPS
  INSERT INTO menu_items (tenant_id, name, category, description, raw_allergen_info, display_order) VALUES
  (v_tenant_id, 'Pork Chops', 'Steak and Chops', 'Grilled pork chops with mushroom crust', 'Contains: Dairy (butter, mushroom crust)', 1),
  (v_tenant_id, 'Skirt Steak', 'Steak and Chops', 'Grilled skirt steak', 'Contains: Dairy (steak butter)', 2),
  (v_tenant_id, 'New York Strip', 'Steak and Chops', 'Classic NY strip steak', 'Contains: Dairy (steak butter)', 3),
  (v_tenant_id, 'Porterhouse', 'Steak and Chops', 'Large porterhouse steak', 'Contains: Dairy (steak butter)', 4),
  (v_tenant_id, 'Ribeye', 'Steak and Chops', 'Bone-in ribeye', 'Contains: Dairy (steak butter)', 5),
  (v_tenant_id, 'Lamb Chops', 'Steak and Chops', 'Grilled lamb chops', 'Contains: Dairy (steak butter)', 6)
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    raw_allergen_info = EXCLUDED.raw_allergen_info,
    display_order = EXCLUDED.display_order;

  -- PRIME RIB
  INSERT INTO menu_items (tenant_id, name, category, description, raw_allergen_info, display_order) VALUES
  (v_tenant_id, 'Prime Rib', 'Prime Rib', 'Slow-roasted prime rib', 'Contains: Dairy (horseradish cream sauce)', 1)
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    raw_allergen_info = EXCLUDED.raw_allergen_info,
    display_order = EXCLUDED.display_order;

  -- CHICKEN
  INSERT INTO menu_items (tenant_id, name, category, description, raw_allergen_info, display_order) VALUES
  (v_tenant_id, 'Chicken Moreno', 'Chicken', 'Grilled chicken with lemon parmesan vinaigrette', 'Contains: Dairy (parmesan, vinaigrette)', 1)
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    raw_allergen_info = EXCLUDED.raw_allergen_info,
    display_order = EXCLUDED.display_order;

  -- FRESH FISH AND SEAFOOD
  INSERT INTO menu_items (tenant_id, name, category, description, raw_allergen_info, display_order) VALUES
  (v_tenant_id, 'Salmon', 'Fresh Fish and Seafood', 'Grilled Atlantic salmon', 'Contains: Fish, Dairy (glaze)', 1),
  (v_tenant_id, 'Crab Cake Entree', 'Fresh Fish and Seafood', 'Pan-seared crab cakes', 'Contains: Shellfish, Eggs (mayo)', 2)
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    raw_allergen_info = EXCLUDED.raw_allergen_info,
    display_order = EXCLUDED.display_order;

  -- NIGHTLY SPECIALS
  INSERT INTO menu_items (tenant_id, name, category, description, raw_allergen_info, display_order) VALUES
  (v_tenant_id, 'Wednesday: Long Island Duck', 'Nightly Specials', 'Roasted half duck with cherry glaze', 'Contains: Dairy (wild rice has butter)', 1)
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    raw_allergen_info = EXCLUDED.raw_allergen_info,
    display_order = EXCLUDED.display_order;

  -- SIDES
  INSERT INTO menu_items (tenant_id, name, category, description, raw_allergen_info, display_order) VALUES
  (v_tenant_id, 'Broccoli', 'Sides', 'Steamed broccoli', 'Dairy-free', 1),
  (v_tenant_id, 'Roasted Vegetables', 'Sides', 'Seasonal roasted vegetables', 'Dairy-free', 2),
  (v_tenant_id, 'Baked Potato', 'Sides', 'Baked potato with toppings', 'Contains: Dairy (sour cream, butter)', 3),
  (v_tenant_id, 'Sweet Potato', 'Sides', 'Roasted sweet potato', 'Contains: Dairy (butter)', 4),
  (v_tenant_id, 'Roasted Asparagus', 'Sides', 'Roasted asparagus spears', 'Dairy-free', 5),
  (v_tenant_id, 'Applesauce', 'Sides', 'House-made applesauce', 'Dairy-free', 6),
  (v_tenant_id, 'Mashed Potatoes', 'Sides', 'Creamy mashed potatoes', 'Contains: Dairy (butter, cream)', 7)
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    raw_allergen_info = EXCLUDED.raw_allergen_info,
    display_order = EXCLUDED.display_order;

  -- DESSERTS
  INSERT INTO menu_items (tenant_id, name, category, description, raw_allergen_info, display_order) VALUES
  (v_tenant_id, 'Berries Crisp', 'Desserts', 'Warm berry crisp with oatmeal crumble', 'Contains: Dairy (ice cream), Gluten (oatmeal)', 1)
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    raw_allergen_info = EXCLUDED.raw_allergen_info,
    display_order = EXCLUDED.display_order;

  -- KIDS MENU
  INSERT INTO menu_items (tenant_id, name, category, description, raw_allergen_info, display_order) VALUES
  (v_tenant_id, 'Kid''s Burger', 'Kids Menu', 'Kids burger with fries', 'Contains: Dairy (butter on bun), Gluten', 1),
  (v_tenant_id, 'Kid''s Cheeseburger', 'Kids Menu', 'Kids cheeseburger with fries', 'Contains: Dairy (cheese, butter), Gluten', 2),
  (v_tenant_id, 'Kid''s Steak & Mashed Potatoes', 'Kids Menu', 'Grilled steak with mashed potatoes', 'Contains: Dairy (butter, mashed potatoes)', 3)
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    raw_allergen_info = EXCLUDED.raw_allergen_info,
    display_order = EXCLUDED.display_order;

  -- SANDWICHES
  INSERT INTO menu_items (tenant_id, name, category, description, raw_allergen_info, display_order) VALUES
  (v_tenant_id, 'Burger', 'Sandwiches', 'Classic burger', 'Contains: Dairy (butter on bun), Gluten', 1),
  (v_tenant_id, 'Bison Burger', 'Sandwiches', 'Bison burger', 'Contains: Dairy (butter on bun), Gluten', 2),
  (v_tenant_id, 'Turkey Burger', 'Sandwiches', 'Turkey burger with cheese', 'Contains: Dairy (cheese, butter), Gluten', 3),
  (v_tenant_id, 'Chicken Club', 'Sandwiches', 'Chicken club sandwich', 'Contains: Dairy (mayo, cheese, butter), Gluten', 4),
  (v_tenant_id, 'Mediterranean Salmon Sandwich', 'Sandwiches', 'Salmon sandwich with yogurt sauce', 'Contains: Fish, Dairy (yogurt sauce, butter), Gluten', 5),
  (v_tenant_id, 'Crab Cake Sandwich', 'Sandwiches', 'Crab cake on a bun', 'Contains: Shellfish, Dairy (butter), Gluten', 6),
  (v_tenant_id, 'French Dip', 'Sandwiches', 'Roast beef French dip', 'Contains: Dairy (horseradish cream, butter), Gluten', 7),
  (v_tenant_id, 'Turkey Sandwich', 'Sandwiches', 'Turkey sandwich with cheese', 'Contains: Dairy (cheese, butter), Gluten', 8)
  ON CONFLICT (tenant_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    raw_allergen_info = EXCLUDED.raw_allergen_info,
    display_order = EXCLUDED.display_order;

  RAISE NOTICE 'Menu items inserted for tenant %', v_tenant_id;
END $$;
