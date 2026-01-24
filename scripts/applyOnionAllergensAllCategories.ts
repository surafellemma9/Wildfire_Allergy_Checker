/**
 * Apply onion allergen rules for ALL menu categories from official allergy sheet
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

interface OnionRule {
  itemName: string;
  category: string;
  status: 'safe' | 'modifiable';
  modifications: string[];
  notes: string;
}

// Rules from official onion allergy sheet - ALL CATEGORIES
const ALL_ONION_RULES: OnionRule[] = [
  // APPETIZERS
  {
    itemName: 'Mediterranean Chicken Skewers',
    category: 'Appetizers',
    status: 'modifiable',
    modifications: ['NO chicken jus'],
    notes: 'Can be made onion-safe with listed modifications'
  },
  {
    itemName: 'Bacon Wrapped Sea Scallop Skewers',
    category: 'Appetizers',
    status: 'modifiable',
    modifications: ['NO apricot dipping sauce', 'NO chives'],
    notes: 'Can be made onion-safe with listed modifications'
  },

  // SALADS - ONLY CAESAR, LEMON PARMESAN VINAIGRETTE, BLUE CHEESE, AND RED WINE VINAIGRETTE
  {
    itemName: 'Caesar',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. ONLY use CAESAR, LEMON PARMESAN VINAIGRETTE, BLUE CHEESE, or RED WINE VINAIGRETTE'
  },
  {
    itemName: 'Tuscan Kale Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. ONLY use CAESAR, LEMON PARMESAN VINAIGRETTE, BLUE CHEESE, or RED WINE VINAIGRETTE'
  },
  {
    itemName: 'Greek Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO red onion'],
    notes: 'Can be made onion-safe with listed modifications. ONLY use CAESAR, LEMON PARMESAN VINAIGRETTE, BLUE CHEESE, or RED WINE VINAIGRETTE'
  },
  {
    itemName: 'Steak & Blue Cheese Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO balsamic vinaigrette', 'NO scallions', 'NO crispy onions', 'NO ranch dressing'],
    notes: 'Can be made onion-safe with listed modifications. ONLY use CAESAR, LEMON PARMESAN VINAIGRETTE, BLUE CHEESE, or RED WINE VINAIGRETTE'
  },
  {
    itemName: 'Chopped Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO scallions', 'NO chicken', 'SUB plain chicken', 'NO tortillas', 'NO citrus dressing'],
    notes: 'Can be made onion-safe with listed modifications. ONLY use CAESAR, LEMON PARMESAN VINAIGRETTE, BLUE CHEESE, or RED WINE VINAIGRETTE'
  },

  // SANDWICHES - NO FRIES, NO KETCHUP, NO BUTTERY ONION BUN (all other bread OK)
  {
    itemName: 'Black Angus Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. NO FRIES, NO KETCHUP, NO BUTTERY ONION BUN'
  },
  {
    itemName: 'Cheeseburger',
    category: 'Sandwiches: Prime Burgers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. NO FRIES, NO KETCHUP, NO BUTTERY ONION BUN'
  },
  {
    itemName: 'Bison Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. NO FRIES, NO KETCHUP, NO BUTTERY ONION BUN'
  },
  {
    itemName: 'Chicken Club',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO mustard mayo marinade chicken', 'SUB plain chicken', 'NO mustard mayo'],
    notes: 'Can be made onion-safe with listed modifications. NO FRIES, NO KETCHUP, NO BUTTERY ONION BUN'
  },
  {
    itemName: 'Mediterranean Salmon',
    category: 'Sandwiches: Signatures',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. NO FRIES, NO KETCHUP, NO BUTTERY ONION BUN'
  },
  {
    itemName: 'French Dip',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO buttery onion bun', 'NO au jus'],
    notes: 'Can be made onion-safe with listed modifications. NO FRIES, NO KETCHUP'
  },
  {
    itemName: 'Blackened Steak Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO bun', 'NO ancho mayo'],
    notes: 'Can be made onion-safe with listed modifications. NO FRIES, NO KETCHUP, NO BUTTERY ONION BUN'
  },
  {
    itemName: 'Turkey Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. NO FRIES, NO KETCHUP, NO BUTTERY ONION BUN'
  },

  // FILET MIGNON - CRUSTS: BLUE CHEESE, HORSERADISH, PEPPERCORN
  {
    itemName: 'Tenderloin Tips',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO bourbon marinade', 'NO steak butter', 'NO au jus', 'NO roasted red onions'],
    notes: 'Can be made onion-safe with listed modifications. Safe crusts: BLUE CHEESE, HORSERADISH, PEPPERCORN'
  },
  {
    itemName: 'Petite Filet',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO au jus', 'NO steak butter'],
    notes: 'Can be made onion-safe with listed modifications. Safe crusts: BLUE CHEESE, HORSERADISH, PEPPERCORN'
  },
  {
    itemName: 'Dinner Filet',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO au jus', 'NO steak butter'],
    notes: 'Can be made onion-safe with listed modifications. Safe crusts: BLUE CHEESE, HORSERADISH, PEPPERCORN'
  },
  {
    itemName: 'Horseradish Crusted Filet',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO au jus'],
    notes: 'Can be made onion-safe with listed modifications'
  },
  {
    itemName: 'Filet Trio',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO au jus'],
    notes: 'Can be made onion-safe with listed modifications. Safe crusts: BLUE CHEESE, HORSERADISH, PEPPERCORN'
  },
  {
    itemName: 'Filet Duo',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO au jus'],
    notes: 'Can be made onion-safe with listed modifications. Safe crusts: BLUE CHEESE, HORSERADISH, PEPPERCORN'
  },

  // STEAK AND CHOPS - CRUSTS: BLUE CHEESE, HORSERADISH, PEPPERCORN
  {
    itemName: 'Pork Chops',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO mushroom crust', 'NO au jus'],
    notes: 'Can be made onion-safe with listed modifications. Safe crusts: BLUE CHEESE, HORSERADISH, PEPPERCORN'
  },
  {
    itemName: 'Skirt Steak',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak marinade', 'NO steak butter', 'NO au jus', 'NO red onions'],
    notes: 'Can be made onion-safe with listed modifications. Safe crusts: BLUE CHEESE, HORSERADISH, PEPPERCORN'
  },
  {
    itemName: 'New York Strip',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO au jus'],
    notes: 'Can be made onion-safe with listed modifications. Safe crusts: BLUE CHEESE, HORSERADISH, PEPPERCORN'
  },
  {
    itemName: 'Porterhouse',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO char crust', 'NO steak butter', 'NO au jus'],
    notes: 'Can be made onion-safe with listed modifications. Safe crusts: BLUE CHEESE, HORSERADISH, PEPPERCORN'
  },
  {
    itemName: 'Ribeye',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO char crust', 'NO steak butter', 'NO au jus'],
    notes: 'Can be made onion-safe with listed modifications. Safe crusts: BLUE CHEESE, HORSERADISH, PEPPERCORN'
  },
  {
    itemName: 'Lamb Chops',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO char-crust', 'NO steak butter', 'NO au jus', 'NO mint chimichurri'],
    notes: 'Can be made onion-safe with listed modifications. Safe crusts: BLUE CHEESE, HORSERADISH, PEPPERCORN'
  },

  // PRIME RIB
  {
    itemName: 'Prime Rib',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO au jus'],
    notes: 'Can be made onion-safe with listed modifications'
  },

  // SEAFOOD
  {
    itemName: 'Salmon',
    category: 'Fresh Fish and Seafood',
    status: 'modifiable',
    modifications: ['NO BBQ chicken spice'],
    notes: 'Can be made onion-safe with listed modifications'
  },

  // BARBEQUE
  {
    itemName: 'Baby Back Ribs',
    category: 'Chicken and Barbecue',
    status: 'modifiable',
    modifications: ['NO barbeque sauce'],
    notes: 'Can be made onion-safe with listed modifications'
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
    itemName: 'Steamed Broccoli',
    category: 'Sides',
    status: 'modifiable',
    modifications: ['NO lemon herb vinaigrette'],
    notes: 'Can be made onion-safe with listed modifications'
  },
  {
    itemName: 'Creamed Spinach',
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
    notes: 'Can be made onion-safe with listed modifications'
  },
  {
    itemName: 'Roasted Asparagus',
    category: 'Sides',
    status: 'modifiable',
    modifications: ['NO balsamic vinaigrette'],
    notes: 'Can be made onion-safe with listed modifications'
  },
  {
    itemName: 'Applesauce',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Coleslaw',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // DESSERTS
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
    itemName: 'Chocolate Chip Cookie',
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
  {
    itemName: 'Birthday Dessert',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // KID'S MENU - NO KETCHUP
  {
    itemName: 'Hamburger',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries'],
    notes: 'Can be made onion-safe with listed modifications. NO KETCHUP'
  },
  {
    itemName: 'Cheeseburger',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries'],
    notes: 'Can be made onion-safe with listed modifications. NO KETCHUP'
  },
  {
    itemName: 'Grilled Cheese',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries'],
    notes: 'Can be made onion-safe with listed modifications. NO KETCHUP'
  },
  {
    itemName: 'Mac & Cheese',
    category: 'Kids Menu',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. NO KETCHUP'
  },
  {
    itemName: 'Steak and Mashed Potato',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO au jus'],
    notes: 'Can be made onion-safe with listed modifications. NO KETCHUP'
  },

  // BRUNCH
  {
    itemName: 'Classic Breakfast',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO breakfast potatoes'],
    notes: 'Can be made onion-safe with listed modifications'
  },
  {
    itemName: 'Breakfast Burrito',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO pico de gallo', 'NO breakfast potatoes', 'NO ranchero sauce', 'NO guacamole'],
    notes: 'Can be made onion-safe with listed modifications'
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
  {
    itemName: 'Side of Fresh Fruit',
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

  // SPECIAL PARTY MENU/HAPPY HOUR/VEGAN PLATE
  {
    itemName: 'Fresh Mozzarella',
    category: 'Party',
    status: 'modifiable',
    modifications: ['NO tomato jam'],
    notes: 'Can be made onion-safe with listed modifications'
  },
  {
    itemName: 'Grilled Pepperoni',
    category: 'Party',
    status: 'modifiable',
    modifications: ['NO tomato jam'],
    notes: 'Can be made onion-safe with listed modifications'
  },
  {
    itemName: 'Harvest Grain Bowl',
    category: 'Party',
    status: 'modifiable',
    modifications: ['NO chives', 'NO balsamic vinaigrette', 'NO lemon herb vinaigrette'],
    notes: 'Can be made onion-safe with listed modifications'
  },
  {
    itemName: 'Roasted Vegetable Vegan Plate',
    category: 'Party',
    status: 'modifiable',
    modifications: ['NO balsamic'],
    notes: 'Can be made onion-safe with listed modifications'
  },
  {
    itemName: 'Pasta and Roasted Vegetables',
    category: 'Party',
    status: 'modifiable',
    modifications: ['NO garlic butter', 'SUB plain butter', 'NO tomato basil sauce'],
    notes: 'Can be made onion-safe with listed modifications'
  },
];

async function applyOnionRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔄 Applying onion allergen rules to ALL categories...\n');

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
  for (const rule of ALL_ONION_RULES) {
    categories.add(rule.category);
    const item = allItems.find(i => i.name === rule.itemName && i.category === rule.category);

    if (!item) {
      console.log(`⚠️  "${rule.itemName}" (${rule.category}) not found in database`);
      notFoundCount++;
      continue;
    }

    // Delete existing onion rule if any
    await supabase
      .from('allergen_modifications')
      .delete()
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'onion');

    // Insert new rule
    const { error } = await supabase
      .from('allergen_modifications')
      .insert({
        tenant_id: TENANT_ID,
        menu_item_id: item.id,
        dish_name: item.name,
        category: item.category,
        allergen: 'onion',
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
  console.log('✅ Onion allergen rules applied to ALL categories!');
  console.log(`   Items with onion rules: ${appliedCount}`);
  console.log(`   Items not found: ${notFoundCount}`);
  console.log(`   Categories covered: ${Array.from(categories).sort().join(', ')}`);
  console.log('='.repeat(60));
  console.log('\n⚠️  IMPORTANT: Items NOT on the onion allergy sheet are');
  console.log('   automatically marked as NOT SAFE by the checker.');
}

applyOnionRules().catch(console.error);
