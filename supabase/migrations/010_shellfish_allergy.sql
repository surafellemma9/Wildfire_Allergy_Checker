-- ============================================================================
-- COMPLETE SHELLFISH ALLERGY MODIFICATIONS
-- If a dish is NOT on this list, it is NOT SAFE and NOT MODIFIABLE
-- Dressings OK: Balsamic, Red Wine, Ranch, Citrus, Lemon Herb, Blue Cheese, Lemon Parmesan
-- Sandwiches/Kids: NO fries, CAN sub any other side
-- ============================================================================

-- First, delete existing shellfish modifications for this tenant
DELETE FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND allergen = 'shellfish';

-- Insert all shellfish modifications
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES

-- APPETIZERS (safe items only - shrimp/crab/scallops NOT listed = NOT SAFE)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Meatballs', 'Appetizers', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'shellfish', 'safe', ARRAY[]::TEXT[]),

-- SALADS (Dressings OK: Balsamic, Red Wine, Ranch, Citrus, Lemon Herb, Blue Cheese, Lemon Parmesan)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale and Spinach Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'shellfish', 'modifiable', ARRAY['NO crispy onions']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'shellfish', 'modifiable', ARRAY['NO tortillas']),

-- SANDWICHES (NO fries, CAN sub any other side)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'shellfish', 'modifiable', ARRAY['NO fries', 'CAN sub any other side']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'shellfish', 'modifiable', ARRAY['NO fries', 'CAN sub any other side']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'shellfish', 'modifiable', ARRAY['NO red onions', 'NO char-crust', 'NO fries', 'CAN sub any other side']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'shellfish', 'modifiable', ARRAY['NO mustard mayonnaise', 'NO marinated chicken', 'SUB plain chicken', 'NO fries', 'CAN sub any other side']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'shellfish', 'modifiable', ARRAY['NO fries', 'CAN sub any other side']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'shellfish', 'modifiable', ARRAY['NO fries', 'CAN sub any other side']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Blackened New York Steak Sandwich', 'Sandwiches', 'shellfish', 'modifiable', ARRAY['NO fries', 'CAN sub any other side']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'shellfish', 'modifiable', ARRAY['NO fries', 'CAN sub any other side']),

-- FILETS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips', 'Filets', 'shellfish', 'modifiable', ARRAY['NO steak butter', 'NO roasted onions']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Petite Filet Mignon/Filet Mignon', 'Filets', 'shellfish', 'modifiable', ARRAY['NO steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Horseradish Crusted Filet', 'Filets', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Medallion Duo/Filet Medallion Trio', 'Filets', 'shellfish', 'safe', ARRAY[]::TEXT[]),

-- STEAKS AND CHOPS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Pork Chops', 'Steaks', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roumanian Skirt Steak', 'Steaks', 'shellfish', 'modifiable', ARRAY['NO steak butter', 'NO red onions', 'NO steak marinade']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Strip Steak', 'Steaks', 'shellfish', 'modifiable', ARRAY['NO steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Porterhouse', 'Steaks', 'shellfish', 'modifiable', ARRAY['NO char-crust', 'NO steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Ribeye', 'Steaks', 'shellfish', 'modifiable', ARRAY['NO char-crust', 'NO steak butter']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lamb Porterhouse Chops', 'Steaks', 'shellfish', 'modifiable', ARRAY['NO char-crust', 'NO steak butter']),

-- PRIME RIB
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Prime Rib of Beef', 'Prime Rib', 'shellfish', 'safe', ARRAY[]::TEXT[]),

-- FRESH FISH AND SEAFOOD (no shrimp/crab/scallops - they contain shellfish!)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Macadamia Crusted Halibut', 'Seafood', 'shellfish', 'modifiable', ARRAY['NO lemon butter sauce']),

-- NIGHTLY SPECIALS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Long Island Duck', 'Specials', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Beer Braised Short Ribs', 'Specials', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Mignon Wellington', 'Specials', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roast Turkey', 'Specials', 'shellfish', 'safe', ARRAY[]::TEXT[]),

-- CHICKEN AND BARBECUE
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baby Back Ribs', 'BBQ', 'shellfish', 'modifiable', ARRAY['NO barbeque sauce']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chicken Moreno', 'Chicken', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spit-Roasted Rotisserie Chicken', 'Chicken', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Pepper Chicken Breast', 'Chicken', 'shellfish', 'safe', ARRAY[]::TEXT[]),

-- SIDES (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mashed Potatoes', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Broccoli', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Creamed Spinach', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetables', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Au Gratin Potatoes', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Macaroni and Cheese', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Potato', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sweet Potato', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sauteed Mushroom Caps', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Loaded Baked Potato', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Asparagus', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Applesauce', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Coleslaw', 'Sides', 'shellfish', 'safe', ARRAY[]::TEXT[]),

-- DESSERTS (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chocolate Layer Cake', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Style Cheesecake', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Key Lime Pie', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chocolate Chip Cookie', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cherry Pie', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Seasonal Crisp', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Vanilla Ice Cream', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Hot Fudge Sundae', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Flourless Chocolate Cake', 'Desserts', 'shellfish', 'safe', ARRAY[]::TEXT[]),

-- KIDS MENU (NO fries, CAN sub any other side)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'shellfish', 'modifiable', ARRAY['NO fries', 'CAN sub any other side']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Cheeseburger', 'Kids', 'shellfish', 'modifiable', ARRAY['NO fries', 'CAN sub any other side']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Grilled Cheese', 'Kids', 'shellfish', 'modifiable', ARRAY['NO fries', 'CAN sub any other side']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Macaroni and Cheese', 'Kids', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Filet', 'Kids', 'shellfish', 'modifiable', ARRAY['NO steak butter']),

-- BRUNCH (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Classic Breakfast', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast and Eggs', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast with Sliced Tomatoes', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spinach and Kale Frittata', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Sausage Breakfast Burrito', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Southwestern Steak and Eggs', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Buttermilk Pancakes', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Door County Cherry Pancakes', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'French Toast', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Buttermilk Pancakes', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Chocolate Chip Pancakes', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids French Toast', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Scramble', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Wheat Toast', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Breakfast Potatoes', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Bacon', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Turkey Sausage', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Fresh Fruit', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Eggs', 'Brunch', 'shellfish', 'safe', ARRAY[]::TEXT[]),

-- SPECIAL PARTY MENU (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Fresh Mozzarella Flatbread', 'Special Party Items', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mushroom and Goat Cheese Flatbread', 'Special Party Items', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Pepperoni Flatbread', 'Special Party Items', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Harvest Grain Bowl', 'Special Party Items', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetable Vegan Plate', 'Special Party Items', 'shellfish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Pasta and Roasted Vegetables', 'Special Party Items', 'shellfish', 'safe', ARRAY[]::TEXT[])

ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE 
SET status = EXCLUDED.status, 
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

-- Verification
SELECT 'Shellfish modifications loaded:' as status, count(*) as count 
FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND allergen = 'shellfish';
