-- ============================================================================
-- COMPLETE FISH ALLERGY MODIFICATIONS
-- If a dish is NOT on this list, it is NOT SAFE and NOT MODIFIABLE
--
-- FISH ALLERGY SPECIAL RULE:
-- - Actual fish dishes (salmon, halibut, etc.) use requires_verification=true
--   because preparation varies daily (fresh catch, cooking methods)
-- - All non-fish dishes are marked as 'safe'
-- ============================================================================

-- First, delete existing fish modifications for this tenant
DELETE FROM allergen_modifications
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
AND allergen = 'fish';

-- Insert all fish modifications
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications, notes, requires_verification) VALUES

-- ============================================================================
-- FISH DISHES - Require Kitchen Verification (Daily Catch Variability)
-- ============================================================================

-- Fresh Fish and Seafood
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'fish', 'modifiable', ARRAY[]::TEXT[], 'Daily preparation varies - verify fish type and cooking method', true),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Macadamia Crusted Halibut', 'Seafood', 'fish', 'modifiable', ARRAY[]::TEXT[], 'Daily preparation varies - verify fish type and cooking method', true),

-- Sandwiches with fish
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'fish', 'modifiable', ARRAY[]::TEXT[], 'Verify salmon preparation', true),

-- Salad protein add-ons with fish
('63c69ee3-0167-4799-8986-09df2824ab93', 'Salad with Salmon', 'Salads', 'fish', 'modifiable', ARRAY[]::TEXT[], 'Verify salmon preparation', true),

-- ============================================================================
-- NON-FISH DISHES - All Safe for Fish Allergy
-- ============================================================================

-- APPETIZERS (all safe - no fish)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp and Crab Bisque', 'Appetizers', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Meatballs', 'Appetizers', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Crab Cakes', 'Appetizers', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'fish', 'safe', ARRAY[]::TEXT[]),

-- SALADS (all safe - no fish unless added as protein)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Salad', 'Salads', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale and Spinach Salad', 'Salads', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Salad with Grilled Chicken', 'Salads', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Salad with Steak', 'Salads', 'fish', 'safe', ARRAY[]::TEXT[]),

-- SANDWICHES (all safe except salmon sandwich listed above)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Crab Cake Sandwich', 'Sandwiches', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Blackened New York Steak Sandwich', 'Sandwiches', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'fish', 'safe', ARRAY[]::TEXT[]),

-- FILETS (all safe - no fish)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips', 'Filets', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Petite Filet Mignon/Filet Mignon', 'Filets', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Horseradish Crusted Filet', 'Filets', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Medallion Duo/Filet Medallion Trio', 'Filets', 'fish', 'safe', ARRAY[]::TEXT[]),

-- STEAKS AND CHOPS (all safe - no fish)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Pork Chops', 'Steaks', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roumanian Skirt Steak', 'Steaks', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Strip Steak', 'Steaks', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Porterhouse', 'Steaks', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Ribeye', 'Steaks', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lamb Porterhouse Chops', 'Steaks', 'fish', 'safe', ARRAY[]::TEXT[]),

-- PRIME RIB (safe - no fish)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Prime Rib of Beef', 'Prime Rib', 'fish', 'safe', ARRAY[]::TEXT[]),

-- NIGHTLY SPECIALS (all safe - no fish)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Long Island Duck', 'Specials', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Beer Braised Short Ribs', 'Specials', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Mignon Wellington', 'Specials', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roast Turkey', 'Specials', 'fish', 'safe', ARRAY[]::TEXT[]),

-- CHICKEN AND BARBECUE (all safe - no fish)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baby Back Ribs', 'BBQ', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chicken Moreno', 'Chicken', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spit-Roasted Rotisserie Chicken', 'Chicken', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Pepper Chicken Breast', 'Chicken', 'fish', 'safe', ARRAY[]::TEXT[]),

-- SIDES (all safe - no fish)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mashed Potatoes', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Broccoli', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Creamed Spinach', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetables', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Au Gratin Potatoes', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Macaroni and Cheese', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Potato', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sweet Potato', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sauteed Mushroom Caps', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Loaded Baked Potato', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Asparagus', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Applesauce', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Coleslaw', 'Sides', 'fish', 'safe', ARRAY[]::TEXT[]),

-- DESSERTS (all safe - no fish)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chocolate Layer Cake', 'Desserts', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Style Cheesecake', 'Desserts', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Key Lime Pie', 'Desserts', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chocolate Chip Cookie', 'Desserts', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cherry Pie', 'Desserts', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Seasonal Crisp', 'Desserts', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Vanilla Ice Cream', 'Desserts', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Hot Fudge Sundae', 'Desserts', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Flourless Chocolate Cake', 'Desserts', 'fish', 'safe', ARRAY[]::TEXT[]),

-- KIDS MENU (all safe - no fish)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Cheeseburger', 'Kids', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Grilled Cheese', 'Kids', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Macaroni and Cheese', 'Kids', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Filet', 'Kids', 'fish', 'safe', ARRAY[]::TEXT[]),

-- BRUNCH (all safe - no fish)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Classic Breakfast', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast and Eggs', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast with Sliced Tomatoes', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spinach and Kale Frittata', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Sausage Breakfast Burrito', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Southwestern Steak and Eggs', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Buttermilk Pancakes', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Door County Cherry Pancakes', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'French Toast', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Buttermilk Pancakes', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Chocolate Chip Pancakes', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids French Toast', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Scramble', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Wheat Toast', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Breakfast Potatoes', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Bacon', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Turkey Sausage', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Fresh Fruit', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Eggs', 'Brunch', 'fish', 'safe', ARRAY[]::TEXT[]),

-- SPECIAL PARTY MENU (all safe - no fish)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Fresh Mozzarella Flatbread', 'Special Party Items', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mushroom and Goat Cheese Flatbread', 'Special Party Items', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Pepperoni Flatbread', 'Special Party Items', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Harvest Grain Bowl', 'Special Party Items', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetable Vegan Plate', 'Special Party Items', 'fish', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Pasta and Roasted Vegetables', 'Special Party Items', 'fish', 'safe', ARRAY[]::TEXT[])

ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE
SET status = EXCLUDED.status,
    modifications = EXCLUDED.modifications,
    notes = EXCLUDED.notes,
    requires_verification = EXCLUDED.requires_verification,
    updated_at = NOW();

-- Verification
SELECT 'Fish modifications loaded:' as status, count(*) as count
FROM allergen_modifications
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
AND allergen = 'fish';

-- Count fish dishes with verification requirement
SELECT 'Fish dishes requiring verification:' as status, count(*) as count
FROM allergen_modifications
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93'
AND allergen = 'fish'
AND requires_verification = true;
