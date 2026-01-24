-- ============================================================================
-- EASY SETUP: Creates tenant and loads ALL allergen data
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Create the tenant (if not exists)
INSERT INTO tenants (id, concept_name, location_name, status)
VALUES (
  '63c69ee3-0167-4799-8986-09df2824ab93',
  'Wildfire',
  'Tysons Corner',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create activation code (if not exists)
INSERT INTO activation_codes (tenant_id, code, max_activations, is_active)
VALUES (
  '63c69ee3-0167-4799-8986-09df2824ab93',
  'TNH56D',
  400,
  true
)
ON CONFLICT (code) DO UPDATE SET is_active = true, max_activations = 400;

-- Step 3: Clear old allergen data for this tenant
DELETE FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

-- Step 4: Insert ALL allergen modifications
-- Using the fixed tenant ID directly (no lookup needed)

-- ==========================================================================
-- DAIRY MODIFICATIONS
-- ==========================================================================
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'dairy', 'modifiable', ARRAY['NO yogurt sauce']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Crab Cakes', 'Appetizers', 'dairy', 'modifiable', ARRAY['NO mustard mayonnaise']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'dairy', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'dairy', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Green Salad', 'Salads', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale Salad', 'Salads', 'dairy', 'modifiable', ARRAY['NO cheese', 'NO dressing']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'dairy', 'modifiable', ARRAY['NO feta cheese', 'NO dressing']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'dairy', 'modifiable', ARRAY['NO cheese', 'NO crispy onions', 'NO ranch dressing']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'dairy', 'modifiable', ARRAY['NO marinated chicken', 'NO blue cheese', 'NO tortillas']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'dairy', 'modifiable', ARRAY['NO croutons']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'dairy', 'modifiable', ARRAY['NO butter on bun', 'NO coleslaw', 'NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'dairy', 'modifiable', ARRAY['NO butter on bun', 'NO coleslaw', 'NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'dairy', 'modifiable', ARRAY['NO cheese', 'NO butter on bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'dairy', 'modifiable', ARRAY['NO mustard-mayo chicken', 'SUB plain chicken', 'NO cheese', 'NO mustard mayonnaise', 'NO butter on bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'dairy', 'modifiable', ARRAY['NO yogurt sauce', 'NO butter on bread', 'NO red wine vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'dairy', 'modifiable', ARRAY['NO butter on bread', 'NO horseradish cream sauce']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'dairy', 'modifiable', ARRAY['NO cheese', 'NO butter on bread']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips', 'Steaks', 'dairy', 'modifiable', ARRAY['NO steak butter', 'NO pre-marking butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Petite Filet Mignon', 'Steaks', 'dairy', 'modifiable', ARRAY['NO pre-marking butter', 'NO steak butter', 'NO garlic crouton']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Mignon', 'Steaks', 'dairy', 'modifiable', ARRAY['NO pre-marking butter', 'NO steak butter', 'NO garlic crouton']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Pork Chops', 'Steaks', 'dairy', 'modifiable', ARRAY['NO mushroom crust', 'NO steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roumanian Skirt Steak', 'Steaks', 'dairy', 'modifiable', ARRAY['NO steak butter', 'NO pre-marking butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Strip Steak', 'Steaks', 'dairy', 'modifiable', ARRAY['NO steak butter', 'NO pre-marking butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Porterhouse', 'Steaks', 'dairy', 'modifiable', ARRAY['NO char-crust', 'NO steak butter', 'NO pre-marking butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Ribeye', 'Steaks', 'dairy', 'modifiable', ARRAY['NO char-crust', 'NO steak butter', 'NO pre-marking butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lamb Porterhouse Chops', 'Steaks', 'dairy', 'modifiable', ARRAY['NO char-crust', 'NO steak butter', 'NO pre-marking butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib', 'Steaks', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'dairy', 'modifiable', ARRAY['NO glaze']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Halibut', 'Seafood', 'dairy', 'modifiable', ARRAY['NO crust', 'NO butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spit Roasted Half Chicken', 'Chicken', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Barbecue Half Chicken', 'Chicken', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Pepper Chicken Breast', 'Chicken', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chicken Moreno', 'Chicken', 'dairy', 'modifiable', ARRAY['NO goat cheese']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baby Back Ribs', 'BBQ', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Rib and Chicken Combo', 'BBQ', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mashed Potatoes', 'Sides', 'dairy', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Broccoli', 'Sides', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetables', 'Sides', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Au Gratin Potatoes', 'Sides', 'dairy', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Potato', 'Sides', 'dairy', 'modifiable', ARRAY['NO butter', 'NO sour cream']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sweet Potato', 'Sides', 'dairy', 'modifiable', ARRAY['NO butter', 'NO sour cream']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mushroom Caps', 'Sides', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Loaded Baked Potato', 'Sides', 'dairy', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Monday & Tuesday: Southern Fried Chicken', 'Nightly Specials', 'dairy', 'modifiable', ARRAY['NO mashed potatoes']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wednesday: Spit Roasted Half Long Island Duck', 'Nightly Specials', 'dairy', 'modifiable', ARRAY['NO cherry glaze', 'NO wild rice']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thursday: Braised Short Ribs', 'Nightly Specials', 'dairy', 'modifiable', ARRAY['NO mashed potatoes']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Friday & Saturday: Filet Mignon Wellington', 'Nightly Specials', 'dairy', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sunday: Roast Turkey', 'Nightly Specials', 'dairy', 'modifiable', ARRAY['NO gravy', 'NO mashed potatoes']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'dairy', 'modifiable', ARRAY['NO fries', 'SUB mashed potatoes or broccoli', 'NO butter on bun', 'NO coleslaw']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Cheeseburger', 'Kids', 'dairy', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Filet', 'Kids', 'dairy', 'modifiable', ARRAY['NO steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Hot Fudge Sundae', 'Kids', 'dairy', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Classic Breakfast', 'Brunch', 'dairy', 'modifiable', ARRAY['NO butter on toast']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast', 'Brunch', 'dairy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spinach and Kale Frittata', 'Brunch', 'dairy', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Skirt Steak and Eggs', 'Brunch', 'dairy', 'modifiable', ARRAY['NO pre-marking butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Scramble', 'Brunch', 'dairy', 'modifiable', ARRAY['NO cheese']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Flourless Chocolate Cake', 'Desserts', 'dairy', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Seasonal Crisp', 'Desserts', 'dairy', 'modifiable', ARRAY['NO ice cream', 'SUB whipped cream'])
ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

-- ==========================================================================
-- GLUTEN MODIFICATIONS
-- ==========================================================================
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'gluten', 'modifiable', ARRAY['NO crouton', 'SUB gluten free crouton']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'gluten', 'modifiable', ARRAY['NO breadcrumbs', 'NO focaccia', 'SUB gluten free bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Green Salad', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'gluten', 'modifiable', ARRAY['NO croutons', 'SUB gluten free croutons']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale Salad', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'gluten', 'modifiable', ARRAY['NO crispy onions']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'gluten', 'modifiable', ARRAY['NO corn tortillas', 'SUB gluten free tortilla chips']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips', 'Steaks', 'gluten', 'modifiable', ARRAY['GF steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Petite Filet Mignon', 'Steaks', 'gluten', 'modifiable', ARRAY['NO crouton', 'GF steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Mignon', 'Steaks', 'gluten', 'modifiable', ARRAY['NO crouton', 'GF steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Pork Chops', 'Steaks', 'gluten', 'modifiable', ARRAY['NO mushroom crust', 'GF steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roumanian Skirt Steak', 'Steaks', 'gluten', 'modifiable', ARRAY['GF steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Strip Steak', 'Steaks', 'gluten', 'modifiable', ARRAY['GF steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Porterhouse', 'Steaks', 'gluten', 'modifiable', ARRAY['NO char-crust', 'GF steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Ribeye', 'Steaks', 'gluten', 'modifiable', ARRAY['NO char-crust', 'GF steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lamb Porterhouse Chops', 'Steaks', 'gluten', 'modifiable', ARRAY['NO char-crust', 'GF steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib', 'Steaks', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Halibut', 'Seafood', 'gluten', 'modifiable', ARRAY['NO flour', 'NO breadcrumbs', 'SUB GF breadcrumbs']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spit Roasted Half Chicken', 'Chicken', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Barbecue Half Chicken', 'Chicken', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Pepper Chicken Breast', 'Chicken', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chicken Moreno', 'Chicken', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baby Back Ribs', 'BBQ', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Rib and Chicken Combo', 'BBQ', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'SUB gluten free bun', 'NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'NO char-crust', 'SUB gluten free bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'SUB gluten free bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'SUB gluten free bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'SUB gluten free bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Blackened New York Steak Sandwich', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'SUB gluten free bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'SUB gluten free bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO wheat bread', 'SUB gluten free bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mashed Potatoes', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Broccoli', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetables', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Au Gratin Potatoes', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Potato', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sweet Potato', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mushroom Caps', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Loaded Baked Potato', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wednesday: Spit Roasted Half Long Island Duck', 'Nightly Specials', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sunday: Roast Turkey', 'Nightly Specials', 'gluten', 'modifiable', ARRAY['NO stuffing', 'NO gravy']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'gluten', 'modifiable', ARRAY['NO fries', 'NO bun', 'SUB mashed potatoes or broccoli', 'SUB gluten free bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Cheeseburger', 'Kids', 'gluten', 'modifiable', ARRAY['NO fries', 'NO bun', 'SUB mashed potatoes or broccoli', 'SUB gluten free bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Filet', 'Kids', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Hot Fudge Sundae', 'Kids', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Flourless Chocolate Cake', 'Desserts', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Seasonal Crisp', 'Desserts', 'gluten', 'modifiable', ARRAY['NO ice cream', 'SUB whipped cream']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Classic Breakfast', 'Brunch', 'gluten', 'modifiable', ARRAY['NO sausage', 'NO toast', 'SUB gluten free bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast', 'Brunch', 'gluten', 'modifiable', ARRAY['NO toast', 'SUB gluten free bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spinach and Kale Frittata', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Skirt Steak and Eggs', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Scramble', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[])
ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

-- ==========================================================================
-- SOY MODIFICATIONS  
-- ==========================================================================
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Crab Cakes', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'soy', 'modifiable', ARRAY['NO focaccia']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'soy', 'modifiable', ARRAY['NO crouton']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Green Salad', 'Salads', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale Salad', 'Salads', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'soy', 'modifiable', ARRAY['NO crispy onions']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'soy', 'modifiable', ARRAY['NO crispy tortillas']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'soy', 'modifiable', ARRAY['NO croutons']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips', 'Steaks', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Petite Filet Mignon', 'Steaks', 'soy', 'modifiable', ARRAY['NO crouton']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Mignon', 'Steaks', 'soy', 'modifiable', ARRAY['NO crouton']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Pork Chops', 'Steaks', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roumanian Skirt Steak', 'Steaks', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Strip Steak', 'Steaks', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Porterhouse', 'Steaks', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Ribeye', 'Steaks', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lamb Porterhouse Chops', 'Steaks', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib', 'Steaks', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'soy', 'modifiable', ARRAY['NO glaze']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Halibut', 'Seafood', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spit Roasted Half Chicken', 'Chicken', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Barbecue Half Chicken', 'Chicken', 'soy', 'modifiable', ARRAY['NO BBQ sauce']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Pepper Chicken Breast', 'Chicken', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chicken Moreno', 'Chicken', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baby Back Ribs', 'BBQ', 'soy', 'modifiable', ARRAY['NO BBQ sauce']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Rib and Chicken Combo', 'BBQ', 'soy', 'modifiable', ARRAY['NO BBQ sauce']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'soy', 'modifiable', ARRAY['NO bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'soy', 'modifiable', ARRAY['NO bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'soy', 'modifiable', ARRAY['NO bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'soy', 'modifiable', ARRAY['NO bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'soy', 'modifiable', ARRAY['NO bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'soy', 'modifiable', ARRAY['NO bread']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'soy', 'modifiable', ARRAY['NO bread']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mashed Potatoes', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Broccoli', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetables', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Au Gratin Potatoes', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Potato', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sweet Potato', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mushroom Caps', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Loaded Baked Potato', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wednesday: Spit Roasted Half Long Island Duck', 'Nightly Specials', 'soy', 'modifiable', ARRAY['NO cherry glaze']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sunday: Roast Turkey', 'Nightly Specials', 'soy', 'modifiable', ARRAY['NO gravy']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'soy', 'modifiable', ARRAY['NO bun', 'NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Cheeseburger', 'Kids', 'soy', 'modifiable', ARRAY['NO bun', 'NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Filet', 'Kids', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Hot Fudge Sundae', 'Kids', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Classic Breakfast', 'Brunch', 'soy', 'modifiable', ARRAY['NO toast']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast', 'Brunch', 'soy', 'modifiable', ARRAY['NO toast']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spinach and Kale Frittata', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Skirt Steak and Eggs', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Scramble', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[])
ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

-- ==========================================================================
-- SHELLFISH MODIFICATIONS
-- ==========================================================================
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'shellfish', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Crab Cakes', 'Appetizers', 'shellfish', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'shellfish', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Green Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips', 'Steaks', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Petite Filet Mignon', 'Steaks', 'shellfish', 'modifiable', ARRAY['NO Oscar style']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Mignon', 'Steaks', 'shellfish', 'modifiable', ARRAY['NO Oscar style']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Pork Chops', 'Steaks', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roumanian Skirt Steak', 'Steaks', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Strip Steak', 'Steaks', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Porterhouse', 'Steaks', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Ribeye', 'Steaks', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lamb Porterhouse Chops', 'Steaks', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib', 'Steaks', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Halibut', 'Seafood', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spit Roasted Half Chicken', 'Chicken', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Barbecue Half Chicken', 'Chicken', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Pepper Chicken Breast', 'Chicken', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chicken Moreno', 'Chicken', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baby Back Ribs', 'BBQ', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Rib and Chicken Combo', 'BBQ', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mashed Potatoes', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Broccoli', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetables', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Au Gratin Potatoes', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Potato', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sweet Potato', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mushroom Caps', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Loaded Baked Potato', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[])
ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

-- ==========================================================================
-- SESAME MODIFICATIONS
-- ==========================================================================
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Crab Cakes', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'sesame', 'modifiable', ARRAY['NO focaccia']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Green Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO sesame seed bun', 'SUB multi grain bun or GF bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO sesame seed bun', 'SUB multi grain bun or GF bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO sesame seed bun', 'SUB multi grain bun or GF bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO sesame seed bun', 'SUB multi grain bun or GF bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'sesame', 'modifiable', ARRAY['NO kids bun', 'SUB multi grain bun or GF bun'])
ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

-- ==========================================================================
-- GARLIC MODIFICATIONS
-- ==========================================================================
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'garlic', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'garlic', 'modifiable', ARRAY['NO yogurt sauce', 'NO herbs de provence']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'garlic', 'modifiable', ARRAY['NO tomato herb coulis']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Green Salad', 'Salads', 'garlic', 'modifiable', ARRAY['NO citrus dressing', 'NO ranch']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'garlic', 'modifiable', ARRAY['NO Caesar dressing', 'NO crouton']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale Salad', 'Salads', 'garlic', 'modifiable', ARRAY['NO kale dressing']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'garlic', 'modifiable', ARRAY['NO red wine vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'garlic', 'modifiable', ARRAY['NO ranch dressing', 'NO croutons']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'garlic', 'modifiable', ARRAY['NO marinated chicken', 'NO red wine vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Petite Filet Mignon', 'Steaks', 'garlic', 'modifiable', ARRAY['NO garlic crouton']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Mignon', 'Steaks', 'garlic', 'modifiable', ARRAY['NO garlic crouton']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO mayonnaise', 'NO pickles']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO pickles']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO mayonnaise', 'NO pickles']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO mustard mayo chicken', 'SUB plain chicken', 'NO pickles', 'NO mustard mayonnaise']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO yogurt sauce', 'NO red wine vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO horseradish cream sauce']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO pickles']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetables', 'Sides', 'garlic', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mushroom Caps', 'Sides', 'garlic', 'not_modifiable', ARRAY[]::TEXT[])
ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

-- ==========================================================================
-- ONION MODIFICATIONS
-- ==========================================================================
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'onion', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'onion', 'modifiable', ARRAY['NO yogurt sauce']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'onion', 'modifiable', ARRAY['NO tomato herb coulis']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Green Salad', 'Salads', 'onion', 'modifiable', ARRAY['NO citrus dressing', 'NO red wine vinaigrette', 'NO ranch']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale Salad', 'Salads', 'onion', 'modifiable', ARRAY['NO kale dressing', 'NO pickled onion']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'onion', 'modifiable', ARRAY['NO red onion', 'NO red wine vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'onion', 'modifiable', ARRAY['NO crispy onions', 'NO red onion', 'NO ranch dressing']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'onion', 'modifiable', ARRAY['NO marinated chicken', 'NO red wine vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'onion', 'modifiable', ARRAY['NO onion', 'NO pickles', 'NO coleslaw']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'onion', 'modifiable', ARRAY['NO onion', 'NO pickles']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'onion', 'modifiable', ARRAY['NO onion', 'NO pickles', 'NO coleslaw']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'onion', 'modifiable', ARRAY['NO pickles']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'onion', 'modifiable', ARRAY['NO pickled onion', 'NO yogurt sauce', 'NO red wine vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'onion', 'modifiable', ARRAY['NO caramelized onion']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'onion', 'modifiable', ARRAY['NO onion', 'NO pickles']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Pork Chops', 'Steaks', 'onion', 'modifiable', ARRAY['NO mushroom crust']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetables', 'Sides', 'onion', 'modifiable', ARRAY['NO onion']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mushroom Caps', 'Sides', 'onion', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Loaded Baked Potato', 'Sides', 'onion', 'modifiable', ARRAY['NO chives']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wednesday: Spit Roasted Half Long Island Duck', 'Nightly Specials', 'onion', 'modifiable', ARRAY['NO wild rice']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sunday: Roast Turkey', 'Nightly Specials', 'onion', 'modifiable', ARRAY['NO stuffing', 'NO gravy']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'onion', 'modifiable', ARRAY['NO onion', 'NO pickles', 'NO coleslaw']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Cheeseburger', 'Kids', 'onion', 'modifiable', ARRAY['NO onion', 'NO pickles', 'NO coleslaw'])
ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

-- ==========================================================================
-- EGG MODIFICATIONS
-- ==========================================================================
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Crab Cakes', 'Appetizers', 'eggs', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'eggs', 'modifiable', ARRAY['NO Caesar dressing', 'SUB oil and vinegar']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'eggs', 'modifiable', ARRAY['NO egg']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'eggs', 'modifiable', ARRAY['NO mayonnaise', 'NO bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'eggs', 'modifiable', ARRAY['NO bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'eggs', 'modifiable', ARRAY['NO mayonnaise', 'NO bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'eggs', 'modifiable', ARRAY['NO mustard mayo chicken', 'SUB plain chicken', 'NO mustard mayonnaise', 'NO bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'eggs', 'modifiable', ARRAY['NO bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Cheeseburger', 'Kids', 'eggs', 'modifiable', ARRAY['NO bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Classic Breakfast', 'Brunch', 'eggs', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast', 'Brunch', 'eggs', 'modifiable', ARRAY['NO egg']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spinach and Kale Frittata', 'Brunch', 'eggs', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Skirt Steak and Eggs', 'Brunch', 'eggs', 'modifiable', ARRAY['NO egg']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Scramble', 'Brunch', 'eggs', 'not_modifiable', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Flourless Chocolate Cake', 'Desserts', 'eggs', 'not_modifiable', ARRAY[]::TEXT[])
ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

-- ==========================================================================
-- PEANUT & TREE NUT MODIFICATIONS
-- ==========================================================================
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'peanuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'peanuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Crab Cakes', 'Appetizers', 'peanuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'peanuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'peanuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'peanuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Green Salad', 'Salads', 'peanuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'peanuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale Salad', 'Salads', 'peanuts', 'modifiable', ARRAY['NO walnuts']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'peanuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'peanuts', 'modifiable', ARRAY['NO candied walnuts']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'peanuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Flourless Chocolate Cake', 'Desserts', 'peanuts', 'not_modifiable', ARRAY[]::TEXT[])
ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

-- Same for tree_nuts
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'tree_nuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'tree_nuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Crab Cakes', 'Appetizers', 'tree_nuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'tree_nuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'tree_nuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'tree_nuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Green Salad', 'Salads', 'tree_nuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'tree_nuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale Salad', 'Salads', 'tree_nuts', 'modifiable', ARRAY['NO walnuts']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'tree_nuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'tree_nuts', 'modifiable', ARRAY['NO candied walnuts']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'tree_nuts', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Flourless Chocolate Cake', 'Desserts', 'tree_nuts', 'not_modifiable', ARRAY[]::TEXT[])
ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE SET status = EXCLUDED.status, modifications = EXCLUDED.modifications;

-- ==========================================================================
-- VERIFICATION QUERY - Run this to see counts per allergen
-- ==========================================================================
SELECT allergen, status, count(*) 
FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
GROUP BY allergen, status
ORDER BY allergen, status;
