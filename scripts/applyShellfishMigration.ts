/**
 * Apply Shellfish Migration to Supabase
 * Inserts all shellfish allergen data from the migration file
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODUzNCwiZXhwIjoyMDg0NjA0NTM0fQ.5jwKZKzqAirNGzjnP8wbf-1vfinlxTw9B9KuS6QbqZ8';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

async function applyShellfishMigration() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('Applying shellfish migration to Supabase...\n');

  // First, delete existing shellfish modifications
  const { error: deleteError } = await supabase
    .from('allergen_modifications')
    .delete()
    .eq('tenant_id', TENANT_ID)
    .eq('allergen', 'shellfish');

  if (deleteError) {
    console.error('Error deleting old shellfish data:', deleteError);
  } else {
    console.log('✓ Deleted old shellfish modifications');
  }

  // All shellfish modifications from the migration file
  const shellfishMods = [
    // APPETIZERS
    { dish_name: 'Baked French Onion Soup', category: 'Appetizers', status: 'safe', modifications: [] },
    { dish_name: 'Mediterranean Chicken Skewers', category: 'Appetizers', status: 'safe', modifications: [] },
    { dish_name: 'Bison Meatballs', category: 'Appetizers', status: 'safe', modifications: [] },
    { dish_name: 'Baked Goat Cheese', category: 'Appetizers', status: 'safe', modifications: [] },

    // SALADS
    { dish_name: 'Field Salad', category: 'Salads', status: 'safe', modifications: [] },
    { dish_name: 'Tuscan Kale and Spinach Salad', category: 'Salads', status: 'safe', modifications: [] },
    { dish_name: 'Greek Salad', category: 'Salads', status: 'safe', modifications: [] },
    { dish_name: 'Steak and Blue Cheese Salad', category: 'Salads', status: 'modifiable', modifications: ['NO crispy onions'] },
    { dish_name: 'Wildfire Chopped Salad', category: 'Salads', status: 'modifiable', modifications: ['NO tortillas'] },

    // SANDWICHES
    { dish_name: 'Thick Prime Angus Burger', category: 'Sandwiches', status: 'modifiable', modifications: ['NO fries', 'CAN sub any other side'] },
    { dish_name: 'Bison Burger', category: 'Sandwiches', status: 'modifiable', modifications: ['NO fries', 'CAN sub any other side'] },
    { dish_name: 'Turkey Burger', category: 'Sandwiches', status: 'modifiable', modifications: ['NO red onions', 'NO char-crust', 'NO fries', 'CAN sub any other side'] },
    { dish_name: 'Grilled Chicken Club', category: 'Sandwiches', status: 'modifiable', modifications: ['NO mustard mayonnaise', 'NO marinated chicken', 'SUB plain chicken', 'NO fries', 'CAN sub any other side'] },
    { dish_name: 'Open Faced Mediterranean Salmon', category: 'Sandwiches', status: 'modifiable', modifications: ['NO fries', 'CAN sub any other side'] },
    { dish_name: 'Prime Rib French Dip', category: 'Sandwiches', status: 'modifiable', modifications: ['NO fries', 'CAN sub any other side'] },
    { dish_name: 'Blackened New York Steak Sandwich', category: 'Sandwiches', status: 'modifiable', modifications: ['NO fries', 'CAN sub any other side'] },
    { dish_name: 'Sliced Turkey Sandwich', category: 'Sandwiches', status: 'modifiable', modifications: ['NO fries', 'CAN sub any other side'] },

    // FILETS
    { dish_name: 'Basil Hayden\'s Bourbon Marinated Tenderloin Tips', category: 'Filets', status: 'modifiable', modifications: ['NO steak butter', 'NO roasted onions'] },
    { dish_name: 'Petite Filet Mignon/Filet Mignon', category: 'Filets', status: 'modifiable', modifications: ['NO steak butter'] },
    { dish_name: 'Horseradish Crusted Filet', category: 'Filets', status: 'safe', modifications: [] },
    { dish_name: 'Filet Medallion Duo/Filet Medallion Trio', category: 'Filets', status: 'safe', modifications: [] },

    // STEAKS AND CHOPS
    { dish_name: 'Bone-In Pork Chops', category: 'Steaks', status: 'safe', modifications: [] },
    { dish_name: 'Roumanian Skirt Steak', category: 'Steaks', status: 'modifiable', modifications: ['NO steak butter', 'NO red onions', 'NO steak marinade'] },
    { dish_name: 'New York Strip Steak', category: 'Steaks', status: 'modifiable', modifications: ['NO steak butter'] },
    { dish_name: 'Porterhouse', category: 'Steaks', status: 'modifiable', modifications: ['NO char-crust', 'NO steak butter'] },
    { dish_name: 'Bone-In Ribeye', category: 'Steaks', status: 'modifiable', modifications: ['NO char-crust', 'NO steak butter'] },
    { dish_name: 'Lamb Porterhouse Chops', category: 'Steaks', status: 'modifiable', modifications: ['NO char-crust', 'NO steak butter'] },

    // PRIME RIB
    { dish_name: 'Roasted Prime Rib of Beef', category: 'Prime Rib', status: 'safe', modifications: [] },

    // FRESH FISH AND SEAFOOD
    { dish_name: 'Cedar Planked Salmon', category: 'Seafood', status: 'safe', modifications: [] },
    { dish_name: 'Macadamia Crusted Halibut', category: 'Seafood', status: 'modifiable', modifications: ['NO lemon butter sauce'] },

    // NIGHTLY SPECIALS
    { dish_name: 'Long Island Duck', category: 'Specials', status: 'safe', modifications: [] },
    { dish_name: 'Beer Braised Short Ribs', category: 'Specials', status: 'safe', modifications: [] },
    { dish_name: 'Filet Mignon Wellington', category: 'Specials', status: 'safe', modifications: [] },
    { dish_name: 'Roast Turkey', category: 'Specials', status: 'safe', modifications: [] },

    // CHICKEN AND BARBECUE
    { dish_name: 'Baby Back Ribs', category: 'BBQ', status: 'modifiable', modifications: ['NO barbeque sauce'] },
    { dish_name: 'Chicken Moreno', category: 'Chicken', status: 'safe', modifications: [] },
    { dish_name: 'Spit-Roasted Rotisserie Chicken', category: 'Chicken', status: 'safe', modifications: [] },
    { dish_name: 'Lemon Pepper Chicken Breast', category: 'Chicken', status: 'safe', modifications: [] },

    // SIDES
    { dish_name: 'Mashed Potatoes', category: 'Sides', status: 'safe', modifications: [] },
    { dish_name: 'Broccoli', category: 'Sides', status: 'safe', modifications: [] },
    { dish_name: 'Creamed Spinach', category: 'Sides', status: 'safe', modifications: [] },
    { dish_name: 'Roasted Vegetables', category: 'Sides', status: 'safe', modifications: [] },
    { dish_name: 'Au Gratin Potatoes', category: 'Sides', status: 'safe', modifications: [] },
    { dish_name: 'Macaroni and Cheese', category: 'Sides', status: 'safe', modifications: [] },
    { dish_name: 'Baked Potato', category: 'Sides', status: 'safe', modifications: [] },
    { dish_name: 'Sweet Potato', category: 'Sides', status: 'safe', modifications: [] },
    { dish_name: 'Sauteed Mushroom Caps', category: 'Sides', status: 'safe', modifications: [] },
    { dish_name: 'Loaded Baked Potato', category: 'Sides', status: 'safe', modifications: [] },
    { dish_name: 'Roasted Asparagus', category: 'Sides', status: 'safe', modifications: [] },
    { dish_name: 'Applesauce', category: 'Sides', status: 'safe', modifications: [] },
    { dish_name: 'Coleslaw', category: 'Sides', status: 'safe', modifications: [] },

    // DESSERTS
    { dish_name: 'Chocolate Layer Cake', category: 'Desserts', status: 'safe', modifications: [] },
    { dish_name: 'New York Style Cheesecake', category: 'Desserts', status: 'safe', modifications: [] },
    { dish_name: 'Key Lime Pie', category: 'Desserts', status: 'safe', modifications: [] },
    { dish_name: 'Chocolate Chip Cookie', category: 'Desserts', status: 'safe', modifications: [] },
    { dish_name: 'Cherry Pie', category: 'Desserts', status: 'safe', modifications: [] },
    { dish_name: 'Seasonal Crisp', category: 'Desserts', status: 'safe', modifications: [] },
    { dish_name: 'Vanilla Ice Cream', category: 'Desserts', status: 'safe', modifications: [] },
    { dish_name: 'Kids Hot Fudge Sundae', category: 'Desserts', status: 'safe', modifications: [] },
    { dish_name: 'Flourless Chocolate Cake', category: 'Desserts', status: 'safe', modifications: [] },

    // KIDS MENU
    { dish_name: 'Kids Burger', category: 'Kids', status: 'modifiable', modifications: ['NO fries', 'CAN sub any other side'] },
    { dish_name: 'Kids Cheeseburger', category: 'Kids', status: 'modifiable', modifications: ['NO fries', 'CAN sub any other side'] },
    { dish_name: 'Kids Grilled Cheese', category: 'Kids', status: 'modifiable', modifications: ['NO fries', 'CAN sub any other side'] },
    { dish_name: 'Kids Macaroni and Cheese', category: 'Kids', status: 'safe', modifications: [] },
    { dish_name: 'Kids Filet', category: 'Kids', status: 'modifiable', modifications: ['NO steak butter'] },

    // BRUNCH
    { dish_name: 'Classic Breakfast', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Avocado Toast and Eggs', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Avocado Toast with Sliced Tomatoes', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Spinach and Kale Frittata', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Turkey Sausage Breakfast Burrito', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Southwestern Steak and Eggs', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Buttermilk Pancakes', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Door County Cherry Pancakes', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'French Toast', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Kids Buttermilk Pancakes', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Kids Chocolate Chip Pancakes', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Kids French Toast', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Kids Scramble', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Side of Wheat Toast', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Breakfast Potatoes', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Side of Bacon', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Side of Turkey Sausage', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Side of Fresh Fruit', category: 'Brunch', status: 'safe', modifications: [] },
    { dish_name: 'Side of Eggs', category: 'Brunch', status: 'safe', modifications: [] },

    // SPECIAL PARTY MENU
    { dish_name: 'Fresh Mozzarella Flatbread', category: 'Special Party Items', status: 'safe', modifications: [] },
    { dish_name: 'Mushroom and Goat Cheese Flatbread', category: 'Special Party Items', status: 'safe', modifications: [] },
    { dish_name: 'Grilled Pepperoni Flatbread', category: 'Special Party Items', status: 'safe', modifications: [] },
    { dish_name: 'Harvest Grain Bowl', category: 'Special Party Items', status: 'safe', modifications: [] },
    { dish_name: 'Roasted Vegetable Vegan Plate', category: 'Special Party Items', status: 'safe', modifications: [] },
    { dish_name: 'Pasta and Roasted Vegetables', category: 'Special Party Items', status: 'safe', modifications: [] },
  ];

  console.log(`Inserting ${shellfishMods.length} shellfish modifications...\n`);

  // Insert in batches of 50
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < shellfishMods.length; i += batchSize) {
    const batch = shellfishMods.slice(i, i + batchSize);
    const records = batch.map(mod => ({
      tenant_id: TENANT_ID,
      dish_name: mod.dish_name,
      category: mod.category,
      allergen: 'shellfish',
      status: mod.status,
      modifications: mod.modifications,
    }));

    const { error } = await supabase
      .from('allergen_modifications')
      .upsert(records, {
        onConflict: 'tenant_id,dish_name,allergen'
      });

    if (error) {
      console.error(`✗ Error inserting batch ${i / batchSize + 1}:`, error);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`✓ Inserted batch ${i / batchSize + 1} (${batch.length} records)`);
    }
  }

  console.log(`\n✓ Complete! Successfully inserted ${successCount} shellfish modifications`);
  if (errorCount > 0) {
    console.log(`✗ ${errorCount} errors encountered`);
  }

  // Verify
  const { data: verifyData } = await supabase
    .from('allergen_modifications')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .eq('allergen', 'shellfish');

  console.log(`\nVerification: ${verifyData?.length || 0} shellfish modifications in database`);
}

applyShellfishMigration().catch(console.error);
