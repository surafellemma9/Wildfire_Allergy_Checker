-- ============================================================================
-- COMPLETE GARLIC ALLERGY MODIFICATIONS
-- If a dish is NOT on this list, it is NOT SAFE and NOT MODIFIABLE
-- Dressings OK: ONLY Blue Cheese and Oil and Vinegar cruets
-- Filet/Steak crusts OK: ONLY Blue Cheese, Horseradish, Peppercorn
-- Sandwiches: NO fries
-- ============================================================================

-- First, delete existing garlic modifications for this tenant
DELETE FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND allergen = 'garlic';

-- Insert all garlic modifications
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES

-- APPETIZERS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'garlic', 'modifiable', ARRAY['NO cocktail sauce']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'garlic', 'modifiable', ARRAY['NO apricot dipping sauce']),

-- SALADS (Dressings OK: ONLY Blue Cheese and Oil and Vinegar cruets)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Salad', 'Salads', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale and Spinach Salad', 'Salads', 'garlic', 'modifiable', ARRAY['NO lemon parmesan vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'garlic', 'modifiable', ARRAY['NO red wine vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'garlic', 'modifiable', ARRAY['NO marinade on steak', 'NO scallions', 'NO crispy onions', 'NO balsamic vinaigrette', 'NO ranch dressing']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'garlic', 'modifiable', ARRAY['NO citrus vinaigrette', 'NO chicken', 'SUB plain chicken', 'NO tortillas']),

-- SANDWICHES (NO fries)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO mustard mayonnaise', 'NO marinated chicken', 'SUB plain chicken', 'NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO yogurt drizzle', 'NO red wine vinaigrette on arugula', 'NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Blackened New York Steak Sandwich', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO blackening spice', 'NO ancho mayo', 'NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'garlic', 'modifiable', ARRAY['NO fries']),

-- FILETS (Crusts OK: ONLY Blue Cheese, Horseradish, Peppercorn)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips', 'Filets', 'garlic', 'modifiable', ARRAY['NO bourbon marinade', 'NO steak butter', 'NO au jus', 'NO roasted red onions']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Petite Filet Mignon/Filet Mignon', 'Filets', 'garlic', 'modifiable', ARRAY['NO steak butter', 'NO garlic crouton', 'NO au jus']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Horseradish Crusted Filet', 'Filets', 'garlic', 'modifiable', ARRAY['NO garlic crouton', 'NO au jus']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Medallion Duo/Filet Medallion Trio', 'Filets', 'garlic', 'modifiable', ARRAY['ONLY blue cheese, horseradish or peppercorn crusts', 'NO au jus']),

-- STEAKS AND CHOPS (Crusts OK: Blue Cheese, Horseradish, Peppercorn)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roumanian Skirt Steak', 'Steaks', 'garlic', 'modifiable', ARRAY['NO steak marinade', 'NO steak butter', 'NO au jus', 'NO red onions']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Strip Steak', 'Steaks', 'garlic', 'modifiable', ARRAY['NO steak butter', 'NO au jus']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Porterhouse', 'Steaks', 'garlic', 'modifiable', ARRAY['NO char-crust', 'NO steak butter', 'NO au jus']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Ribeye', 'Steaks', 'garlic', 'modifiable', ARRAY['NO char-crust', 'NO steak butter', 'NO au jus']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lamb Porterhouse Chops', 'Steaks', 'garlic', 'modifiable', ARRAY['NO char-crust', 'NO steak butter', 'NO au jus', 'NO mint chimichurri']),

-- FRESH FISH AND SEAFOOD
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'garlic', 'modifiable', ARRAY['NO BBQ chicken spice']),

-- NIGHTLY SPECIALS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Long Island Duck', 'Specials', 'garlic', 'modifiable', ARRAY['NO wild rice', 'NO cherry sauce']),

-- SIDES
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mashed Potatoes', 'Sides', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Broccoli', 'Sides', 'garlic', 'modifiable', ARRAY['NO lemon herb vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Au Gratin Potatoes', 'Sides', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Creamed Spinach', 'Sides', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetables', 'Sides', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Macaroni and Cheese', 'Sides', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Potato', 'Sides', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Loaded Baked Potato', 'Sides', 'garlic', 'modifiable', ARRAY['NO scallions']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Asparagus', 'Sides', 'garlic', 'modifiable', ARRAY['NO balsamic vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Coleslaw', 'Sides', 'garlic', 'safe', ARRAY[]::TEXT[]),

-- DESSERTS (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chocolate Layer Cake', 'Desserts', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Style Cheesecake', 'Desserts', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Key Lime Pie', 'Desserts', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cherry Pie', 'Desserts', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Seasonal Crisp', 'Desserts', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chocolate Chip Cookie', 'Desserts', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Vanilla Ice Cream', 'Desserts', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Hot Fudge Sundae', 'Desserts', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Flourless Chocolate Cake', 'Desserts', 'garlic', 'safe', ARRAY[]::TEXT[]),

-- KIDS MENU
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'garlic', 'modifiable', ARRAY['NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Cheeseburger', 'Kids', 'garlic', 'modifiable', ARRAY['NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Grilled Cheese', 'Kids', 'garlic', 'modifiable', ARRAY['NO fries']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Macaroni and Cheese', 'Kids', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Filet', 'Kids', 'garlic', 'modifiable', ARRAY['NO steak butter', 'NO au jus']),

-- BRUNCH (mostly safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Classic Breakfast', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast and Eggs', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast with Sliced Tomatoes', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spinach and Kale Frittata', 'Brunch', 'garlic', 'modifiable', ARRAY['NO balsamic vinaigrette']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Sausage Breakfast Burrito', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Buttermilk Pancakes', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Door County Cherry Pancakes', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'French Toast', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Buttermilk Pancakes', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Chocolate Chip Pancakes', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids French Toast', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Scramble', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Wheat Toast', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Bacon', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Turkey Sausage', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Fresh Fruit', 'Brunch', 'garlic', 'safe', ARRAY[]::TEXT[]),

-- SPECIAL PARTY MENU
('63c69ee3-0167-4799-8986-09df2824ab93', 'Fresh Mozzarella Flatbread', 'Special Party Items', 'garlic', 'modifiable', ARRAY['NO tomato jam', 'NO garlic puree']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Harvest Grain Bowl', 'Special Party Items', 'garlic', 'modifiable', ARRAY['NO balsamic', 'NO lemon herb vinaigrette', 'SUB oil and vinegar']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetable Vegan Plate', 'Special Party Items', 'garlic', 'modifiable', ARRAY['NO balsamic', 'SUB oil and vinegar']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Pasta and Roasted Vegetables', 'Special Party Items', 'garlic', 'modifiable', ARRAY['NO garlic butter', 'SUB plain butter', 'NO tomato basil sauce'])

ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE 
SET status = EXCLUDED.status, 
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

-- Verification
SELECT 'Garlic modifications loaded:' as status, count(*) as count 
FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND allergen = 'garlic';
