-- ============================================================================
-- COMPLETE SOY ALLERGY MODIFICATIONS
-- If a dish is NOT on this list, it is NOT SAFE and NOT MODIFIABLE
-- Dressings OK: Citrus, Red Wine, Caesar, Lemon Herb, Lemon Parmesan, Balsamic
-- Sandwiches: MAY HAVE sesame seed bun, wheat bread, buttery onion bun, ciabatta
--             MUST CLEAN GRILL, NO fries, NO coleslaw
-- Steaks/Filets: MUST CLEAN GRILL/BROILER
-- ============================================================================

-- First, delete existing soy modifications for this tenant
DELETE FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND allergen = 'soy';

-- Insert all soy modifications
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES

-- APPETIZERS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp and Crab Bisque', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Meatballs', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'soy', 'modifiable', ARRAY['NO cocktail sauce']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'soy', 'modifiable', ARRAY['NO apricot dipping sauce']),

-- SALADS (Dressings OK: Citrus, Red Wine, Caesar, Lemon Herb, Lemon Parmesan, Balsamic)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Salad', 'Salads', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'soy', 'modifiable', ARRAY['NO croutons']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale and Spinach Salad', 'Salads', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'soy', 'modifiable', ARRAY['NO ranch dressing', 'NO crispy onions']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'soy', 'modifiable', ARRAY['NO tortillas', 'SUB gluten free tortillas']),

-- SANDWICHES (MUST CLEAN GRILL, NO fries, NO coleslaw)
-- MAY HAVE: sesame seed bun, wheat bread, buttery onion bun, ciabatta
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'soy', 'modifiable', ARRAY['MUST clean grill', 'NO fries', 'NO coleslaw']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'soy', 'modifiable', ARRAY['MUST clean grill', 'NO fries', 'NO coleslaw']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'soy', 'modifiable', ARRAY['NO red onions', 'NO char-crust', 'NO mayonnaise', 'MUST clean grill', 'NO fries', 'NO coleslaw']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'soy', 'modifiable', ARRAY['NO mustard mayonnaise', 'SUB plain chicken', 'MUST clean grill', 'NO fries', 'NO coleslaw']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'soy', 'modifiable', ARRAY['MUST clean grill', 'NO fries', 'NO coleslaw']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'soy', 'modifiable', ARRAY['NO horseradish cream sauce', 'MUST clean grill', 'NO fries', 'NO coleslaw']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Blackened New York Steak Sandwich', 'Sandwiches', 'soy', 'modifiable', ARRAY['NO ancho mayo', 'MUST clean grill', 'NO fries', 'NO coleslaw']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'soy', 'modifiable', ARRAY['MUST clean grill', 'NO fries', 'NO coleslaw']),

-- FILETS (MUST CLEAN GRILL/BROILER)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips', 'Filets', 'soy', 'modifiable', ARRAY['NO bourbon marinade', 'NO roasted red onions', 'MUST clean broiler']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Petite Filet Mignon/Filet Mignon', 'Filets', 'soy', 'modifiable', ARRAY['MUST clean broiler']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Medallion Duo/Filet Medallion Trio', 'Filets', 'soy', 'modifiable', ARRAY['NO horseradish crust', 'MUST clean broiler']),

-- STEAKS AND CHOPS (MUST CLEAN BROILER)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Pork Chops', 'Steaks', 'soy', 'modifiable', ARRAY['MUST clean broiler']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roumanian Skirt Steak', 'Steaks', 'soy', 'modifiable', ARRAY['NO roasted onions', 'NO steak marinade', 'MUST clean broiler']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Strip Steak', 'Steaks', 'soy', 'modifiable', ARRAY['MUST clean broiler']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Porterhouse', 'Steaks', 'soy', 'modifiable', ARRAY['NO char-crust', 'MUST clean broiler']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Ribeye', 'Steaks', 'soy', 'modifiable', ARRAY['NO char-crust', 'MUST clean broiler']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lamb Porterhouse Chops', 'Steaks', 'soy', 'modifiable', ARRAY['NO char-crust', 'MUST clean broiler']),

-- PRIME RIB
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Prime Rib of Beef', 'Prime Rib', 'soy', 'modifiable', ARRAY['NO horseradish cream sauce']),

-- SEAFOOD
('63c69ee3-0167-4799-8986-09df2824ab93', 'Coconut Shrimp', 'Seafood', 'soy', 'modifiable', ARRAY['NO coconut dipping sauce']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'soy', 'modifiable', ARRAY['NO glaze']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Scallops de Jonghe', 'Seafood', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Macadamia Crusted Halibut', 'Seafood', 'soy', 'safe', ARRAY[]::TEXT[]),

-- CHICKEN
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spit-Roasted Rotisserie Chicken', 'Chicken', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Pepper Chicken Breast', 'Chicken', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chicken Moreno', 'Chicken', 'soy', 'safe', ARRAY[]::TEXT[]),

-- NIGHTLY SPECIALS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Long Island Duck', 'Specials', 'soy', 'modifiable', ARRAY['NO wild rice']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roast Turkey', 'Specials', 'soy', 'modifiable', ARRAY['NO stuffing']),

-- SIDES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mashed Potatoes', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Broccoli', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Creamed Spinach', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetables', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Au Gratin Potatoes', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Macaroni and Cheese', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Potato', 'Sides', 'soy', 'modifiable', ARRAY['NO whipped butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sweet Potato', 'Sides', 'soy', 'modifiable', ARRAY['NO whipped butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sauteed Mushroom Caps', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Loaded Baked Potato', 'Sides', 'soy', 'modifiable', ARRAY['NO whipped butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Asparagus', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Applesauce', 'Sides', 'soy', 'safe', ARRAY[]::TEXT[]),

-- DESSERTS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Seasonal Crisp', 'Desserts', 'soy', 'modifiable', ARRAY['NO ice cream']),

-- KIDS MENU (MAY HAVE sesame seed bun, wheat bread, buttery onion bun, ciabatta)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'soy', 'modifiable', ARRAY['NO fries', 'NO kid''s bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Cheeseburger', 'Kids', 'soy', 'modifiable', ARRAY['NO fries', 'NO kid''s bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Grilled Cheese', 'Kids', 'soy', 'modifiable', ARRAY['NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Macaroni and Cheese', 'Kids', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Filet', 'Kids', 'soy', 'safe', ARRAY[]::TEXT[]),

-- BRUNCH
('63c69ee3-0167-4799-8986-09df2824ab93', 'Classic Breakfast', 'Brunch', 'soy', 'modifiable', ARRAY['NO whipped butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast and Eggs', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast with Sliced Tomatoes', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spinach and Kale Frittata', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Sausage Breakfast Burrito', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Southwestern Steak and Eggs', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Eggs Florentine', 'Brunch', 'soy', 'modifiable', ARRAY['NO English muffin']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Eggs Benedict', 'Brunch', 'soy', 'modifiable', ARRAY['NO English muffin']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Buttermilk Pancakes', 'Brunch', 'soy', 'modifiable', ARRAY['NO whipped butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Door County Cherry Pancakes', 'Brunch', 'soy', 'modifiable', ARRAY['NO whipped butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Buttermilk Pancakes', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Scramble', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Wheat Toast', 'Brunch', 'soy', 'modifiable', ARRAY['NO whipped butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Breakfast Potatoes', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Bacon', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Turkey Sausage', 'Brunch', 'soy', 'safe', ARRAY[]::TEXT[]),

-- SPECIAL PARTY MENU (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Fresh Mozzarella Flatbread', 'Special Party Items', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mushroom and Goat Cheese Flatbread', 'Special Party Items', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Pepperoni Flatbread', 'Special Party Items', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Harvest Grain Bowl', 'Special Party Items', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetable Vegan Plate', 'Special Party Items', 'soy', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Pasta and Roasted Vegetables', 'Special Party Items', 'soy', 'safe', ARRAY[]::TEXT[])

ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE 
SET status = EXCLUDED.status, 
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

-- Verification
SELECT 'Soy modifications loaded:' as status, count(*) as count 
FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND allergen = 'soy';
