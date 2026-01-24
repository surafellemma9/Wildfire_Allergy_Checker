/**
 * Apply garlic allergen rules for ALL menu categories from official allergy sheet
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

interface GarlicRule {
  itemName: string;
  category: string;
  status: 'safe' | 'modifiable';
  modifications: string[];
  notes: string;
}

// Rules from official garlic allergy sheet - ALL CATEGORIES
const ALL_GARLIC_RULES: GarlicRule[] = [
  // APPETIZERS
  {
    itemName: 'Shrimp Cocktail',
    category: 'Appetizers',
    status: 'modifiable',
    modifications: ['NO cocktail sauce'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Bacon Wrapped Sea Scallop Skewers',
    category: 'Appetizers',
    status: 'modifiable',
    modifications: ['NO apricot dipping sauce'],
    notes: 'Can be made garlic-safe with listed modifications'
  },

  // SALADS - ONLY BLUE CHEESE AND OIL AND VINEGAR CRUETS
  {
    itemName: 'Field Green Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. ONLY use BLUE CHEESE or OIL AND VINEGAR CRUETS'
  },
  {
    itemName: 'Tuscan Kale Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO lemon parmesan vinaigrette'],
    notes: 'Can be made garlic-safe with listed modifications. ONLY use BLUE CHEESE or OIL AND VINEGAR CRUETS'
  },
  {
    itemName: 'Greek Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO red wine vinaigrette'],
    notes: 'Can be made garlic-safe with listed modifications. ONLY use BLUE CHEESE or OIL AND VINEGAR CRUETS'
  },
  {
    itemName: 'Steak & Blue Cheese Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO marinade on steak', 'NO scallions', 'NO crispy onions', 'NO balsamic vinaigrette', 'NO ranch dressing'],
    notes: 'Can be made garlic-safe with listed modifications. ONLY use BLUE CHEESE or OIL AND VINEGAR CRUETS'
  },
  {
    itemName: 'Chopped Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO citrus vinaigrette', 'NO chicken', 'SUB plain chicken', 'NO tortillas'],
    notes: 'Can be made garlic-safe with listed modifications. ONLY use BLUE CHEESE or OIL AND VINEGAR CRUETS'
  },

  // SANDWICHES - NO FRIES
  {
    itemName: 'Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. NO FRIES'
  },
  {
    itemName: 'Cheeseburger',
    category: 'Sandwiches: Prime Burgers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. NO FRIES'
  },
  {
    itemName: 'Bison Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. NO FRIES'
  },
  {
    itemName: 'Bison Cheeseburger',
    category: 'Sandwiches: Prime Burgers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. NO FRIES'
  },
  {
    itemName: 'Chicken Club',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO mustard mayonnaise', 'NO marinated chicken', 'SUB plain chicken'],
    notes: 'Can be made garlic-safe with listed modifications. NO FRIES'
  },
  {
    itemName: 'Mediterranean Salmon',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO yogurt drizzle', 'NO red wine vinaigrette on arugula'],
    notes: 'Can be made garlic-safe with listed modifications. NO FRIES'
  },
  {
    itemName: 'Blackened Steak Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO blackening spice', 'NO ancho mayo'],
    notes: 'Can be made garlic-safe with listed modifications. NO FRIES'
  },
  {
    itemName: 'Turkey Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. NO FRIES'
  },

  // FILETS - ONLY BLUE CHEESE, HORSERADISH AND PEPPERCORN CRUSTS
  {
    itemName: 'Tenderloin Tips',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO au jus', 'NO roasted red onions'],
    notes: 'Can be made garlic-safe with listed modifications. ONLY BLUE CHEESE, HORSERADISH, PEPPERCORN CRUSTS'
  },
  {
    itemName: 'Petite Filet',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO garlic crouton', 'NO au jus'],
    notes: 'Can be made garlic-safe with listed modifications. ONLY BLUE CHEESE, HORSERADISH, PEPPERCORN CRUSTS'
  },
  {
    itemName: 'Filet',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO garlic crouton', 'NO au jus'],
    notes: 'Can be made garlic-safe with listed modifications. ONLY BLUE CHEESE, HORSERADISH, PEPPERCORN CRUSTS'
  },
  {
    itemName: 'Horseradish Crusted Filet',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO garlic crouton', 'NO au jus'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Filet Duo',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO au jus'],
    notes: 'Can be made garlic-safe with listed modifications. ONLY BLUE CHEESE, HORSERADISH, PEPPERCORN CRUSTS'
  },
  {
    itemName: 'Filet Trio',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO au jus'],
    notes: 'Can be made garlic-safe with listed modifications. ONLY BLUE CHEESE, HORSERADISH, PEPPERCORN CRUSTS'
  },

  // STEAKS AND CHOPS
  {
    itemName: 'Skirt Steak',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak marinade', 'NO steak butter', 'NO au jus', 'NO red onions'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'New York Strip',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO au jus'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Porterhouse',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO char-crust', 'NO steak butter', 'NO au jus'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Ribeye',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO char-crust', 'NO steak butter', 'NO au jus'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Lamb Chops',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO char-crust', 'NO steak butter', 'NO au jus', 'NO mint chimichurri'],
    notes: 'Can be made garlic-safe with listed modifications'
  },

  // FRESH FISH AND SEAFOOD
  {
    itemName: 'Salmon',
    category: 'Fresh Fish and Seafood',
    status: 'modifiable',
    modifications: ['NO BBQ chicken spice'],
    notes: 'Can be made garlic-safe with listed modifications'
  },

  // NIGHTLY SPECIALS
  {
    itemName: 'Long Island Duck',
    category: 'Nightly Specials',
    status: 'modifiable',
    modifications: ['NO wild rice', 'NO cherry sauce'],
    notes: 'Can be made garlic-safe with listed modifications. Wednesday special'
  },

  // SIDES
  {
    itemName: 'Mashed Potatoes',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Broccoli',
    category: 'Sides',
    status: 'modifiable',
    modifications: ['NO lemon herb vinaigrette'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Au Gratin Potatoes',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Creamed Spinach',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Roasted Vegetables',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Mac & Cheese',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Baked Potato',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Loaded Baked Potato',
    category: 'Sides',
    status: 'modifiable',
    modifications: ['NO scallions'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Roasted Asparagus',
    category: 'Sides',
    status: 'modifiable',
    modifications: ['NO balsamic vinaigrette'],
    notes: 'Can be made garlic-safe with listed modifications'
  },

  // DESSERTS - All safe
  {
    itemName: 'Chocolate Cake',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Cheesecake',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Key Lime Pie',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Cherry Pie',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Berries Crisp',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Chocolate Chip Cookie',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Ice Cream',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Kids Sundae',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Flourless Chocolate Cake',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // KID'S MENU
  {
    itemName: 'Burger',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Cheeseburger',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Grilled Cheese',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Mac & Cheese',
    category: 'Kids Menu',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Steak and Mashed Potatoes',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO au jus'],
    notes: 'Can be made garlic-safe with listed modifications'
  },

  // BRUNCH
  {
    itemName: 'Classic Breakfast',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Avocado Toast',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Avocado Toast with Sliced Tomatoes',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Spinach and Kale Frittata',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO balsamic vinaigrette'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Breakfast Burrito',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Buttermilk Pancakes',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Door County Cherry Pancakes',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'French Toast',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Kids Buttermilk Pancakes',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Kids Chocolate Chip Pancakes',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Kids French Toast',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Kids Scramble',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Side of Wheat Toast',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Side of Bacon',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Side of Turkey Sausage',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // SPECIAL PARTY MENU/VEGAN PLATE
  {
    itemName: 'Fresh Mozzarella',
    category: 'Party',
    status: 'modifiable',
    modifications: ['NO tomato jam', 'NO garlic puree'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Harvest Grain Bowl',
    category: 'Party',
    status: 'modifiable',
    modifications: ['NO balsamic', 'NO lemon herb vinaigrette', 'SUB oil and vinegar'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Roasted Vegetable Vegan Plate',
    category: 'Party',
    status: 'modifiable',
    modifications: ['NO balsamic', 'SUB oil and vinegar'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
  {
    itemName: 'Pasta and Roasted Vegetables',
    category: 'Party',
    status: 'modifiable',
    modifications: ['NO garlic butter', 'SUB plain butter', 'NO tomato basil sauce'],
    notes: 'Can be made garlic-safe with listed modifications'
  },
];

async function applyGarlicRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔄 Applying garlic allergen rules to ALL categories...\n');

  // Get all menu items
  const { data: allItems } = await supabase
    .from('menu_items')
    .select('id, name, category')
    .eq('tenant_id', TENANT_ID);

  if (!allItems) {
    console.error('❌ No menu items found');
    return;
  }

  let appliedCount = 0;
  let notFoundCount = 0;
  const categories = new Set<string>();

  // Apply rules for items ON the sheet
  for (const rule of ALL_GARLIC_RULES) {
    categories.add(rule.category);
    const item = allItems.find(i => i.name === rule.itemName && i.category === rule.category);

    if (!item) {
      console.log(`⚠️  "${rule.itemName}" (${rule.category}) not found in database`);
      notFoundCount++;
      continue;
    }

    // Delete existing garlic rule if any
    await supabase
      .from('allergen_modifications')
      .delete()
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'garlic');

    // Insert new rule
    const { error } = await supabase
      .from('allergen_modifications')
      .insert({
        tenant_id: TENANT_ID,
        menu_item_id: item.id,
        dish_name: item.name,
        category: item.category,
        allergen: 'garlic',
        status: rule.status,
        modifications: rule.modifications,
        notes: rule.notes,
      });

    if (error) {
      console.error(`✗ ${rule.itemName}: ${error.message}`);
    } else {
      const statusEmoji = rule.status === 'safe' ? '✅' : '⚠️';
      console.log(`${statusEmoji} ${rule.itemName} (${rule.category}): ${rule.status.toUpperCase()}`);
      appliedCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Garlic allergen rules applied to ALL categories!');
  console.log(`   Items with garlic rules: ${appliedCount}`);
  console.log(`   Items not found: ${notFoundCount}`);
  console.log(`   Categories covered: ${Array.from(categories).sort().join(', ')}`);
  console.log('='.repeat(60));
  console.log('\n⚠️  IMPORTANT: Items NOT on the garlic allergy sheet are');
  console.log('   automatically marked as NOT SAFE by the checker.');
}

applyGarlicRules().catch(console.error);
