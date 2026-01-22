-- Wildfire Allergy Checker Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- =====================
-- MENU ITEMS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  dish_name TEXT NOT NULL,
  ticket_code TEXT,
  category TEXT NOT NULL,
  menu TEXT NOT NULL DEFAULT 'D',
  description TEXT NOT NULL DEFAULT '',
  ingredients TEXT[] DEFAULT '{}',
  notes TEXT,
  mod_notes TEXT,
  cannot_be_made_safe_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster category lookups
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- =====================
-- ALLERGEN MODIFICATION TABLES
-- One table per allergen for easy management
-- =====================

-- DAIRY MODIFICATIONS
CREATE TABLE IF NOT EXISTS dairy_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- GLUTEN MODIFICATIONS
CREATE TABLE IF NOT EXISTS gluten_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- SHELLFISH MODIFICATIONS
CREATE TABLE IF NOT EXISTS shellfish_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- FISH MODIFICATIONS
CREATE TABLE IF NOT EXISTS fish_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- EGG MODIFICATIONS
CREATE TABLE IF NOT EXISTS egg_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- SOY MODIFICATIONS
CREATE TABLE IF NOT EXISTS soy_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- PEANUT MODIFICATIONS
CREATE TABLE IF NOT EXISTS peanut_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- TREE NUT MODIFICATIONS
CREATE TABLE IF NOT EXISTS tree_nut_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- SESAME MODIFICATIONS
CREATE TABLE IF NOT EXISTS sesame_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- MSG MODIFICATIONS
CREATE TABLE IF NOT EXISTS msg_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- ONION/GARLIC MODIFICATIONS
CREATE TABLE IF NOT EXISTS onion_garlic_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- TOMATO MODIFICATIONS
CREATE TABLE IF NOT EXISTS tomato_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- SEED MODIFICATIONS
CREATE TABLE IF NOT EXISTS seed_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifications TEXT[] DEFAULT '{}',
  can_be_modified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id)
);

-- =====================
-- COMPOSITE INGREDIENTS TABLE
-- For sauces, dressings, etc. that contain multiple ingredients
-- =====================
CREATE TABLE IF NOT EXISTS composite_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sub_ingredients TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ROW LEVEL SECURITY (RLS)
-- Enable read access for anonymous users
-- =====================

-- Enable RLS on all tables
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gluten_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shellfish_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fish_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE soy_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE peanut_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_nut_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesame_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE msg_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE onion_garlic_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tomato_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE composite_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dairy_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON gluten_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON shellfish_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON fish_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON egg_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON soy_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON peanut_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON tree_nut_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON sesame_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON msg_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON onion_garlic_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON tomato_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON seed_modifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON composite_ingredients FOR SELECT USING (true);

-- =====================
-- UPDATED_AT TRIGGER
-- Automatically update the updated_at timestamp
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dairy_modifications_updated_at BEFORE UPDATE ON dairy_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gluten_modifications_updated_at BEFORE UPDATE ON gluten_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shellfish_modifications_updated_at BEFORE UPDATE ON shellfish_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fish_modifications_updated_at BEFORE UPDATE ON fish_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_egg_modifications_updated_at BEFORE UPDATE ON egg_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_soy_modifications_updated_at BEFORE UPDATE ON soy_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_peanut_modifications_updated_at BEFORE UPDATE ON peanut_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tree_nut_modifications_updated_at BEFORE UPDATE ON tree_nut_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sesame_modifications_updated_at BEFORE UPDATE ON sesame_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_msg_modifications_updated_at BEFORE UPDATE ON msg_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onion_garlic_modifications_updated_at BEFORE UPDATE ON onion_garlic_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tomato_modifications_updated_at BEFORE UPDATE ON tomato_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seed_modifications_updated_at BEFORE UPDATE ON seed_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_composite_ingredients_updated_at BEFORE UPDATE ON composite_ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
