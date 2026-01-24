-- ============================================================================
-- COMPLETE ONION ALLERGY MODIFICATIONS
-- If a dish is NOT on this list, it is NOT SAFE and NOT MODIFIABLE
-- ============================================================================

-- First, delete existing onion modifications for this tenant
DELETE FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND allergen = 'onion';

-- Insert all onion modifications
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES

-- APPETIZERS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'onion', 'modifiable', ARRAY['NO chicken jus']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'onion', 'modifiable', ARRAY['NO apricot dipping sauce', 'NO chives']),

-- SALADS (Only Caesar, Lemon Parmesan, Blue Cheese, Red Wine Vinaigrette dressings OK)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale and Spinach Salad', 'Salads', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'onion', 'modifiable', ARRAY['NO red onion']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'onion', 'modifiable', ARRAY['NO balsamic vinaigrette', 'NO scallions', 'NO crispy onions', 'NO ranch dressing']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'onion', 'modifiable', ARRAY['NO scallions', 'NO chicken', 'SUB plain chicken', 'NO tortillas', 'NO citrus dressing']),

-- SANDWICHES (NO fries, NO ketchup, NO buttery onion bun - all other bread OK)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'onion', 'modifiable', ARRAY['NO mustard mayo chicken', 'SUB plain chicken', 'NO mustard mayo']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'onion', 'modifiable', ARRAY['NO buttery onion bun', 'NO au jus']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Blackened New York Steak Sandwich', 'Sandwiches', 'onion', 'modifiable', ARRAY['NO blackening spice', 'NO buttery onion bun', 'NO ancho mayo']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'onion', 'safe', ARRAY[]::TEXT[]),

-- FILET MIGNON (Crusts OK: Blue Cheese, Horseradish, Peppercorn)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips', 'Filets', 'onion', 'modifiable', ARRAY['NO bourbon marinade', 'NO steak butter', 'NO au jus', 'NO roasted red onions']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Petite Filet Mignon/Filet Mignon', 'Filets', 'onion', 'modifiable', ARRAY['NO au jus', 'NO steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Horseradish Crusted Filet', 'Filets', 'onion', 'modifiable', ARRAY['NO au jus']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Medallion Duo/Filet Medallion Trio', 'Filets', 'onion', 'modifiable', ARRAY['NO au jus']),

-- STEAKS AND CHOPS (Crusts OK: Blue Cheese, Horseradish, Peppercorn)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Pork Chops', 'Steaks', 'onion', 'modifiable', ARRAY['NO mushroom crust', 'NO au jus']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roumanian Skirt Steak', 'Steaks', 'onion', 'modifiable', ARRAY['NO steak marinade', 'NO steak butter', 'NO au jus', 'NO red onions']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Strip Steak', 'Steaks', 'onion', 'modifiable', ARRAY['NO steak butter', 'NO au jus']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Porterhouse', 'Steaks', 'onion', 'modifiable', ARRAY['NO char crust', 'NO steak butter', 'NO au jus']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Ribeye', 'Steaks', 'onion', 'modifiable', ARRAY['NO char crust', 'NO steak butter', 'NO au jus']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lamb Porterhouse Chops', 'Steaks', 'onion', 'modifiable', ARRAY['NO char-crust', 'NO steak butter', 'NO au jus', 'NO mint chimichurri']),

-- PRIME RIB
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Prime Rib of Beef', 'Prime Rib', 'onion', 'modifiable', ARRAY['NO au jus']),

-- SEAFOOD
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'onion', 'modifiable', ARRAY['NO BBQ chicken spice']),

-- BARBECUE
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baby Back Ribs', 'BBQ', 'onion', 'modifiable', ARRAY['NO barbeque sauce']),

-- SIDES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mashed Potatoes', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Broccoli', 'Sides', 'onion', 'modifiable', ARRAY['NO lemon herb vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Creamed Spinach', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Au Gratin Potatoes', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Macaroni and Cheese', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Potato', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Loaded Baked Potato', 'Sides', 'onion', 'modifiable', ARRAY['NO scallions']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Asparagus', 'Sides', 'onion', 'modifiable', ARRAY['NO balsamic vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Applesauce', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Coleslaw', 'Sides', 'onion', 'safe', ARRAY[]::TEXT[]),

-- DESSERTS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chocolate Layer Cake', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Style Cheesecake', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Key Lime Pie', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chocolate Chip Cookie', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cherry Pie', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Seasonal Crisp', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Vanilla Ice Cream', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Hot Fudge Sundae', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Flourless Chocolate Cake', 'Desserts', 'onion', 'safe', ARRAY[]::TEXT[]),

-- KIDS MENU (NO ketchup)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'onion', 'modifiable', ARRAY['NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Cheeseburger', 'Kids', 'onion', 'modifiable', ARRAY['NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Grilled Cheese', 'Kids', 'onion', 'modifiable', ARRAY['NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Macaroni and Cheese', 'Kids', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Filet', 'Kids', 'onion', 'modifiable', ARRAY['NO steak butter', 'NO au jus']),

-- BRUNCH
('63c69ee3-0167-4799-8986-09df2824ab93', 'Classic Breakfast', 'Brunch', 'onion', 'modifiable', ARRAY['NO breakfast potatoes']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Sausage Breakfast Burrito', 'Brunch', 'onion', 'modifiable', ARRAY['NO pico de gallo', 'NO breakfast potatoes', 'NO ranchero sauce', 'NO guacamole']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Buttermilk Pancakes', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Door County Cherry Pancakes', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'French Toast', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Buttermilk Pancakes', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Chocolate Chip Pancakes', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids French Toast', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Scramble', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Wheat Toast', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Bacon', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Turkey Sausage', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Fresh Fruit', 'Brunch', 'onion', 'safe', ARRAY[]::TEXT[]),

-- SPECIAL PARTY MENU / HAPPY HOUR
('63c69ee3-0167-4799-8986-09df2824ab93', 'Fresh Mozzarella Flatbread', 'Special Party Items', 'onion', 'modifiable', ARRAY['NO tomato jam']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Pepperoni Flatbread', 'Special Party Items', 'onion', 'modifiable', ARRAY['NO tomato jam']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Harvest Grain Bowl', 'Special Party Items', 'onion', 'modifiable', ARRAY['NO chives', 'NO balsamic vinaigrette', 'NO lemon herb vinaigrette'])

ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE 
SET status = EXCLUDED.status, 
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

-- Verification query
SELECT 'Onion modifications loaded:' as status, count(*) as count 
FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND allergen = 'onion';
