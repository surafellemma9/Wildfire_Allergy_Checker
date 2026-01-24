-- Fix gluten modifications with proper substitutions
-- Based on user-provided gluten allergy sheet

DO $$
DECLARE
  t_id UUID := '63c69ee3-0167-4799-8986-09df2824ab93';
BEGIN

-- Delete existing gluten records for this tenant and reinsert with correct data
DELETE FROM allergen_modifications WHERE tenant_id = t_id AND allergen = 'gluten';

-- APPETIZERS
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
(t_id, 'Baked French Onion Soup', 'Appetizers', 'gluten', 'modifiable', ARRAY['NO crouton', 'SUB gluten free crouton']),
(t_id, 'Mediterranean Chicken Skewers', 'Appetizers', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Baked Goat Cheese', 'Appetizers', 'gluten', 'modifiable', ARRAY['NO breadcrumbs', 'NO focaccia', 'SUB gluten free bun']),
(t_id, 'Shrimp Cocktail', 'Appetizers', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'gluten', 'safe', ARRAY[]::TEXT[]);

-- SALADS (Note: Ranch, Balsamic Vinaigrette, Caesar, Citrus Dressing, Red Wine Vinaigrette, Blue Cheese, or Oil and Vinegar only)
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
(t_id, 'Field Green Salad', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Caesar Salad', 'Salads', 'gluten', 'modifiable', ARRAY['NO croutons', 'SUB gluten free croutons']),
(t_id, 'Tuscan Kale Salad', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Greek Salad', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Steak & Blue Cheese Salad', 'Salads', 'gluten', 'modifiable', ARRAY['NO crispy onions']),
(t_id, 'Chopped Salad', 'Salads', 'gluten', 'modifiable', ARRAY['NO corn tortillas', 'SUB gluten free tortilla chips']),
(t_id, 'Salad with Grilled Chicken', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Salad with Salmon', 'Salads', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Salad with Steak', 'Salads', 'gluten', 'modifiable', ARRAY['GF steak butter']);

-- STEAKS, CHOPS, AND PRIME RIB
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
(t_id, 'Basil Hayden Tenderloin Tips', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['GF steak butter']),
(t_id, 'Petite Filet', 'Filets', 'gluten', 'modifiable', ARRAY['NO crouton', 'GF steak butter']),
(t_id, 'Filet Mignon', 'Filets', 'gluten', 'modifiable', ARRAY['NO crouton', 'GF steak butter']),
(t_id, 'Pork Chops', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['NO mushroom crust', 'GF steak butter']),
(t_id, 'Roumanian Skirt Steak', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['GF steak butter']),
(t_id, 'New York Strip', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['GF steak butter']),
(t_id, 'Porterhouse', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['NO char-crust', 'GF steak butter']),
(t_id, 'Bone-In Ribeye', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['NO char-crust', 'GF steak butter']),
(t_id, 'Lamb Porterhouse Chops', 'Steak and Chops', 'gluten', 'modifiable', ARRAY['NO char-crust', 'GF steak butter']),
(t_id, 'Prime Rib', 'Prime Rib', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Bearnaise Sauce', 'Steak Add Ons', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Shrimp Skewer', 'Steak Add Ons', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Oscar Style', 'Steak Add Ons', 'gluten', 'safe', ARRAY[]::TEXT[]);

-- FISH AND SEAFOOD
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
(t_id, 'Cedar Planked Salmon', 'Fresh Fish and Seafood', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Halibut', 'Fresh Fish and Seafood', 'gluten', 'modifiable', ARRAY['NO flour', 'NO breadcrumbs', 'SUB gluten free breadcrumbs']);

-- CHICKEN AND BARBECUE
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
(t_id, 'Spit-Roasted Half Chicken', 'Chicken and Barbecue', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Barbecued Chicken', 'Chicken and Barbecue', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Lemon Pepper Chicken Breast', 'Chicken and Barbecue', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Chicken Moreno', 'Chicken and Barbecue', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Barbecued Baby Back Ribs', 'Chicken and Barbecue', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Rib and Chicken Combo', 'Chicken and Barbecue', 'gluten', 'safe', ARRAY[]::TEXT[]);

-- PRIME BURGERS AND SANDWICHES (Note: NO FRENCH FRIES for gluten)
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
(t_id, 'Burger', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'NO fries', 'SUB gluten free bun'], 'May add: Yellow Cheddar, White Cheddar, Swiss, Blue Cheese, Fresh Mozzarella, American, or Swiss Gruyere'),
(t_id, 'Cheeseburger', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'NO fries', 'SUB gluten free bun'], 'May add: Yellow Cheddar, White Cheddar, Swiss, Blue Cheese, Fresh Mozzarella, American, or Swiss Gruyere'),
(t_id, 'Turkey Burger', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'NO char-crust', 'NO fries', 'SUB gluten free bun'], NULL),
(t_id, 'Bison Burger', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'NO fries', 'SUB gluten free bun'], NULL),
(t_id, 'Chicken Club', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'SUB gluten free bun'], NULL),
(t_id, 'French Dip', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'SUB gluten free bun'], NULL),
(t_id, 'Blackened New York Steak Sandwich', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'SUB gluten free bun'], NULL),
(t_id, 'Mediterranean Salmon Sandwich', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO bun', 'SUB gluten free bun'], NULL),
(t_id, 'Turkey Sandwich', 'Sandwiches', 'gluten', 'modifiable', ARRAY['NO wheat bread', 'SUB gluten free bun'], 'Lunch only');

-- SIDES
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
(t_id, 'Mashed Potatoes', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Broccoli with Lemon Vinaigrette', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Roasted Vegetables', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Au Gratin Potatoes', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Baked Potato', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Sweet Potato', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Mushroom Caps', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Loaded Baked Potato', 'Sides', 'gluten', 'safe', ARRAY[]::TEXT[]);

-- NIGHTLY SPECIALS
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
(t_id, 'Tuesday: Long Island Duck', 'Nightly Specials', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Sunday: Turkey Dinner', 'Nightly Specials', 'gluten', 'modifiable', ARRAY['NO stuffing', 'NO gravy']);

-- KIDS MENU
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes) VALUES
(t_id, 'Kids Burger', 'Kids Menu', 'gluten', 'modifiable', ARRAY['NO fries', 'NO bun', 'SUB mashed potatoes or broccoli', 'SUB gluten free bun'], 'May add: Yellow Cheddar, White Cheddar, Swiss, American, Blue Cheese, or Jalapeno Jack'),
(t_id, 'Kids Cheeseburger', 'Kids Menu', 'gluten', 'modifiable', ARRAY['NO fries', 'NO bun', 'SUB mashed potatoes or broccoli', 'SUB gluten free bun'], 'May add: Yellow Cheddar, White Cheddar, Swiss, American, Blue Cheese, or Jalapeno Jack'),
(t_id, 'Kids Filet', 'Kids Menu', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Kids Hot Fudge Sundae', 'Kids Menu', 'gluten', 'safe', ARRAY[]::TEXT[]);

-- DESSERTS
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
(t_id, 'Flourless Chocolate Cake', 'Desserts', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Berries Crisp', 'Desserts', 'gluten', 'modifiable', ARRAY['NO ice cream', 'SUB whipped cream']);

-- BRUNCH
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES
(t_id, 'Classic Breakfast', 'Brunch', 'gluten', 'modifiable', ARRAY['NO sausage', 'NO toast', 'SUB gluten free bun']),
(t_id, 'Avocado Toast and Eggs', 'Brunch', 'gluten', 'modifiable', ARRAY['NO toast', 'SUB gluten free bun']),
(t_id, 'Avocado Toast with Sliced Tomatoes', 'Brunch', 'gluten', 'modifiable', ARRAY['NO toast', 'SUB gluten free bun']),
(t_id, 'Spinach and Kale Frittata', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Skirt Steak and Eggs', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Kids Scramble', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Breakfast Potatoes and Onions', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Side of Bacon', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Side of Turkey Sausage', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Side of Fruit', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[]),
(t_id, 'Side of Eggs', 'Brunch', 'gluten', 'safe', ARRAY[]::TEXT[]);

END $$;
