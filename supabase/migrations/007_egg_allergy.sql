-- ============================================================================
-- COMPLETE EGG ALLERGY MODIFICATIONS
-- If a dish is NOT on this list, it is NOT SAFE and NOT MODIFIABLE
-- Dressings OK: Balsamic, Citrus Lime, Lemon Parmesan, Red Wine, Lemon Herb
-- Sandwiches: NO sesame seed bun, NO kids bun, NO GF bun, NO coleslaw, NO fries
--             MAY HAVE: Multi-grain bread, Buttery onion bun
-- ============================================================================

-- First, delete existing egg modifications for this tenant
DELETE FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND allergen = 'eggs';

-- Insert all egg modifications
INSERT INTO allergen_modifications (tenant_id, dish_name, category, allergen, status, modifications) VALUES

-- APPETIZERS (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp and Crab Bisque', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked French Onion Soup', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mediterranean Chicken Skewers', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Goat Cheese', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Shrimp Cocktail', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bacon Wrapped Sea Scallop Skewers', 'Appetizers', 'eggs', 'safe', ARRAY[]::TEXT[]),

-- SALADS (Dressings OK: Balsamic, Citrus Lime, Lemon Parmesan, Red Wine, Lemon Herb)
-- NOTE: Caesar NOT listed = NOT SAFE (Caesar dressing has egg)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Field Salad', 'Salads', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Tuscan Kale and Spinach Salad', 'Salads', 'eggs', 'modifiable', ARRAY['NO egg']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Greek Salad', 'Salads', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Steak and Blue Cheese Salad', 'Salads', 'eggs', 'modifiable', ARRAY['NO ranch dressing', 'NO crispy onions']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Wildfire Chopped Salad', 'Salads', 'eggs', 'modifiable', ARRAY['NO tortillas', 'SUB GF tortillas']),

-- SANDWICHES (NO sesame seed bun, NO kids bun, NO GF bun, NO coleslaw, NO fries)
-- MAY HAVE: Multi-grain bread, Buttery onion bun
('63c69ee3-0167-4799-8986-09df2824ab93', 'Thick Prime Angus Burger', 'Sandwiches', 'eggs', 'modifiable', ARRAY['NO sesame seed bun', 'NO coleslaw', 'NO fries', 'MAY HAVE multigrain or buttery onion bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bison Burger', 'Sandwiches', 'eggs', 'modifiable', ARRAY['NO sesame seed bun', 'NO coleslaw', 'NO fries', 'MAY HAVE multigrain or buttery onion bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Turkey Burger', 'Sandwiches', 'eggs', 'modifiable', ARRAY['NO bun', 'NO mayonnaise', 'NO coleslaw', 'NO fries', 'MAY HAVE multigrain or buttery onion bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Chicken Club', 'Sandwiches', 'eggs', 'modifiable', ARRAY['NO bun', 'NO mustard mayonnaise', 'NO marinated chicken', 'SUB plain chicken', 'NO coleslaw', 'NO fries', 'MAY HAVE multigrain or buttery onion bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Open Faced Mediterranean Salmon', 'Sandwiches', 'eggs', 'modifiable', ARRAY['NO sesame seed bun', 'NO coleslaw', 'NO fries', 'MAY HAVE multigrain or buttery onion bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Prime Rib French Dip', 'Sandwiches', 'eggs', 'modifiable', ARRAY['NO sesame seed bun', 'NO coleslaw', 'NO fries', 'MAY HAVE multigrain or buttery onion bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Blackened New York Steak Sandwich', 'Sandwiches', 'eggs', 'modifiable', ARRAY['NO bun', 'NO coleslaw', 'NO fries', 'MAY HAVE multigrain or buttery onion bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sliced Turkey Sandwich', 'Sandwiches', 'eggs', 'modifiable', ARRAY['NO sesame seed bun', 'NO coleslaw', 'NO fries', 'MAY HAVE multigrain or buttery onion bun']),

-- FILETS (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Basil Hayden''s Bourbon Marinated Tenderloin Tips', 'Filets', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Petite Filet Mignon/Filet Mignon', 'Filets', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Horseradish Crusted Filet', 'Filets', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Filet Medallion Duo/Filet Medallion Trio', 'Filets', 'eggs', 'safe', ARRAY[]::TEXT[]),

-- STEAKS AND CHOPS (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Pork Chops', 'Steaks', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roumanian Skirt Steak', 'Steaks', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'New York Strip Steak', 'Steaks', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Porterhouse', 'Steaks', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Bone-In Ribeye', 'Steaks', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lamb Porterhouse Chops', 'Steaks', 'eggs', 'safe', ARRAY[]::TEXT[]),

-- PRIME RIB (safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Prime Rib of Beef', 'Prime Rib', 'eggs', 'safe', ARRAY[]::TEXT[]),

-- FRESH FISH AND SEAFOOD (safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Cedar Planked Salmon', 'Seafood', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Scallops de Jonghe', 'Seafood', 'eggs', 'safe', ARRAY[]::TEXT[]),

-- NIGHTLY SPECIALS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Long Island Duck', 'Specials', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roast Turkey', 'Specials', 'eggs', 'modifiable', ARRAY['NO stuffing']),

-- CHICKEN (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Spit-Roasted Rotisserie Chicken', 'Chicken', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Barbecued Half Chicken', 'Chicken', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Lemon Pepper Chicken Breast', 'Chicken', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Chicken Moreno', 'Chicken', 'eggs', 'safe', ARRAY[]::TEXT[]),

-- BARBECUE
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baby Back Ribs', 'BBQ', 'eggs', 'modifiable', ARRAY['NO coleslaw']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'BBQ Chicken and Ribs Combo', 'BBQ', 'eggs', 'modifiable', ARRAY['NO coleslaw']),

-- SIDES (all safe)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mashed Potatoes', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Broccoli', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Creamed Spinach', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Vegetables', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Au Gratin Potatoes', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Baked Potato', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sweet Potato', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Sauteed Mushroom Caps', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Loaded Baked Potato', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Roasted Asparagus', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Applesauce', 'Sides', 'eggs', 'safe', ARRAY[]::TEXT[]),

-- DESSERTS
('63c69ee3-0167-4799-8986-09df2824ab93', 'Seasonal Crisp', 'Desserts', 'eggs', 'modifiable', ARRAY['NO oatmeal crumble', 'NO ice cream']),

-- KIDS MENU (NO sesame seed bun, NO kids bun, NO fries)
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Burger', 'Kids', 'eggs', 'modifiable', ARRAY['NO bun', 'NO fries', 'MAY HAVE multigrain or buttery onion bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Cheeseburger', 'Kids', 'eggs', 'modifiable', ARRAY['NO bun', 'NO fries', 'MAY HAVE multigrain or buttery onion bun']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Kids Filet', 'Kids', 'eggs', 'safe', ARRAY[]::TEXT[]),

-- BRUNCH
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast and Eggs', 'Brunch', 'eggs', 'modifiable', ARRAY['NO eggs']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Avocado Toast with Sliced Tomatoes', 'Brunch', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Skirt Steak and Eggs', 'Brunch', 'eggs', 'modifiable', ARRAY['NO eggs']),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Breakfast Potatoes', 'Brunch', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Side of Bacon', 'Brunch', 'eggs', 'safe', ARRAY[]::TEXT[]),

-- SPECIAL PARTY MENU
('63c69ee3-0167-4799-8986-09df2824ab93', 'Fresh Mozzarella Flatbread', 'Special Party Items', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Grilled Pepperoni Flatbread', 'Special Party Items', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Mushroom and Goat Cheese Flatbread', 'Special Party Items', 'eggs', 'safe', ARRAY[]::TEXT[]),
('63c69ee3-0167-4799-8986-09df2824ab93', 'Harvest Grain Bowl', 'Special Party Items', 'eggs', 'safe', ARRAY[]::TEXT[])

ON CONFLICT (tenant_id, dish_name, allergen) DO UPDATE 
SET status = EXCLUDED.status, 
    modifications = EXCLUDED.modifications,
    updated_at = NOW();

-- Verification
SELECT 'Egg modifications loaded:' as status, count(*) as count 
FROM allergen_modifications 
WHERE tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93' 
AND allergen = 'eggs';
