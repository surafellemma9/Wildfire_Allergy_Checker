-- ============================================================================
-- COMPLETE SESAME ALLERGY MODIFICATIONS
-- If a dish is NOT on this list, it is NOT SAFE and NOT MODIFIABLE
-- Sandwiches: NO sesame seed bun, NO multi-grain bread, NO buttery onion bun
--             CAN HAVE: Gluten free bun, Kids bun
-- ============================================================================

-- First, delete existing sesame modifications for this tenant
DELETE FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND allergen = 'sesame';

-- Insert all sesame modifications
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES

-- APPETIZERS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp and Crab Bisque', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Meatballs', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Crispy Calamari', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Oven Roasted Lump Crab Cakes', 'Appetizers', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'sesame', 'modifiable', ARRAY['NO apricot dipping sauce']),

-- SALADS (Dressings OK: Balsamic, Citrus, Red Wine, Lemon Herb, Lemon Parmesan, Blue Cheese, Ranch)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Caesar Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale and Spinach Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'sesame', 'safe', ARRAY[]::TEXT[]),

-- SANDWICHES (NO sesame seed bun, NO multi-grain, NO buttery onion. CAN HAVE: GF bun, Kids bun)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO sesame seed bun', 'CAN HAVE GF bun or kids bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO sesame seed bun', 'CAN HAVE GF bun or kids bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO sesame seed bun', 'CAN HAVE GF bun or kids bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Hot Honey Chicken Sandwich', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO sesame seed bun', 'CAN HAVE GF bun or kids bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO sesame seed bun', 'CAN HAVE GF bun or kids bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO za''atar', 'NO multi-grain bread', 'CAN HAVE GF bun or kids bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Crab Cake Sandwich', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO sesame seed bun', 'CAN HAVE GF bun or kids bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO buttery onion bun', 'CAN HAVE GF bun or kids bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Blackened New York Steak Sandwich', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO buttery onion bun', 'CAN HAVE GF bun or kids bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'sesame', 'modifiable', ARRAY['NO multi-grain bread', 'CAN HAVE GF bun or kids bun']),

-- FILETS (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips', 'Filets', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Petite Filet Mignon/Filet Mignon', 'Filets', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Horseradish Crusted Filet', 'Filets', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Medallion Duo/Filet Medallion Trio', 'Filets', 'sesame', 'safe', ARRAY[]::TEXT[]),

-- STEAKS AND CHOPS (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Pork Chops', 'Steaks', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roumanian Skirt Steak', 'Steaks', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Strip Steak', 'Steaks', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Porterhouse', 'Steaks', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Ribeye', 'Steaks', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lamb Porterhouse Chops', 'Steaks', 'sesame', 'safe', ARRAY[]::TEXT[]),

-- PRIME RIB (safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Prime Rib of Beef', 'Prime Rib', 'sesame', 'safe', ARRAY[]::TEXT[]),

-- FRESH FISH AND SEAFOOD (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Coconut Shrimp', 'Seafood', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Scallops de Jonghe', 'Seafood', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lump Crab Cakes', 'Seafood', 'sesame', 'safe', ARRAY[]::TEXT[]),

-- NIGHTLY SPECIALS (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Buttermilk Fried Chicken', 'Specials', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Long Island Duck', 'Specials', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Beer Braised Short Ribs', 'Specials', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Mignon Wellington', 'Specials', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roast Turkey', 'Specials', 'sesame', 'safe', ARRAY[]::TEXT[]),

-- CHICKEN (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spit-Roasted Rotisserie Chicken', 'Chicken', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Barbecued Half Chicken', 'Chicken', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Pepper Chicken Breast', 'Chicken', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chicken Moreno', 'Chicken', 'sesame', 'safe', ARRAY[]::TEXT[]),

-- BARBECUE (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baby Back Ribs', 'BBQ', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'BBQ Chicken and Ribs Combo', 'BBQ', 'sesame', 'safe', ARRAY[]::TEXT[]),

-- SIDES (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'French Fries', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mashed Potatoes', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Broccoli', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Creamed Spinach', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetables', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Au Gratin Potatoes', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Macaroni and Cheese', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Potato', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sweet Potato', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cottage Fries', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sauteed Mushroom Caps', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Loaded Baked Potato', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Asparagus', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Applesauce', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Coleslaw', 'Sides', 'sesame', 'safe', ARRAY[]::TEXT[]),

-- DESSERTS (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chocolate Layer Cake', 'Desserts', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Style Cheesecake', 'Desserts', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Key Lime Pie', 'Desserts', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chocolate Chip Cookie', 'Desserts', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cherry Pie', 'Desserts', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Seasonal Crisp', 'Desserts', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Vanilla Ice Cream', 'Desserts', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Hot Fudge Sundae', 'Desserts', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Flourless Chocolate Cake', 'Desserts', 'sesame', 'safe', ARRAY[]::TEXT[]),

-- KIDS MENU (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Chicken Fingers', 'Kids', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Cheeseburger', 'Kids', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Grilled Cheese', 'Kids', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Macaroni and Cheese', 'Kids', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Filet', 'Kids', 'sesame', 'safe', ARRAY[]::TEXT[]),

-- BRUNCH
('63c69ee3-0167-4799-8986-09df2824ab93', 'Classic Breakfast', 'Brunch', 'sesame', 'modifiable', ARRAY['NO multi-grain bread']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast and Eggs', 'Brunch', 'sesame', 'modifiable', ARRAY['NO multi-grain bread']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast with Sliced Tomatoes', 'Brunch', 'sesame', 'modifiable', ARRAY['NO multi-grain bread']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spinach and Kale Frittata', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Sausage Breakfast Burrito', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Southwestern Steak and Eggs', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Eggs Florentine', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Crab Cake Benedict', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Buttermilk Pancakes', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Door County Cherry Pancakes', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'French Toast', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Buttermilk Pancakes', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Chocolate Chip Pancakes', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids French Toast', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Scramble', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Breakfast Potatoes', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Bacon', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Turkey Sausage', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Fresh Fruit', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Eggs', 'Brunch', 'sesame', 'safe', ARRAY[]::TEXT[]),

-- SPECIAL PARTY MENU (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Fresh Mozzarella Flatbread', 'Special Party Items', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mushroom and Goat Cheese Flatbread', 'Special Party Items', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Pepperoni Flatbread', 'Special Party Items', 'sesame', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Harvest Grain Bowl', 'Special Party Items', 'sesame', 'safe', ARRAY[]::TEXT[])

ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE 
SET status = EXCLUDED.status, 
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

-- Verification
SELECT 'Sesame modifications loaded:' as status, count(*) as count 
FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND allergen = 'sesame';
