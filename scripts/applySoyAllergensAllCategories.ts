/**
 * Apply soy allergen rules for ALL menu categories from official allergy sheet
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

interface SoyRule {
  itemName: string;
  category: string;
  status: 'safe' | 'modifiable';
  modifications: string[];
  notes: string;
}

// Rules from official soy allergy sheet - ALL CATEGORIES
const ALL_SOY_RULES: SoyRule[] = [
  // APPETIZERS
  {
    itemName: 'Shrimp and Crab Bisque',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'French Onion Soup',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Mediterranean Chicken Skewers',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Bison Meatballs',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Goat Cheese',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Shrimp Cocktail',
    category: 'Appetizers',
    status: 'modifiable',
    modifications: ['NO cocktail sauce'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Bacon Wrapped Sea Scallop Skewers',
    category: 'Appetizers',
    status: 'modifiable',
    modifications: ['NO apricot dipping sauce'],
    notes: 'Can be made soy-safe with listed modifications'
  },

  // SALADS - CITRUS, RED WINE VINAIGRETTE, CAESAR, LEMON HERB, LEMON PARMESAN AND BALSAMIC VINAIGRETTE ONLY
  {
    itemName: 'Field Green Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: CITRUS, RED WINE VINAIGRETTE, CAESAR, LEMON HERB, LEMON PARMESAN, BALSAMIC VINAIGRETTE'
  },
  {
    itemName: 'Caesar Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO croutons'],
    notes: 'Can be made soy-safe with listed modifications. Safe dressings: CITRUS, RED WINE VINAIGRETTE, CAESAR, LEMON HERB, LEMON PARMESAN, BALSAMIC VINAIGRETTE'
  },
  {
    itemName: 'Tuscan Kale Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: CITRUS, RED WINE VINAIGRETTE, CAESAR, LEMON HERB, LEMON PARMESAN, BALSAMIC VINAIGRETTE'
  },
  {
    itemName: 'Greek Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: CITRUS, RED WINE VINAIGRETTE, CAESAR, LEMON HERB, LEMON PARMESAN, BALSAMIC VINAIGRETTE'
  },
  {
    itemName: 'Steak & Blue Cheese Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO ranch dressing', 'NO crispy onions'],
    notes: 'Can be made soy-safe with listed modifications. Safe dressings: CITRUS, RED WINE VINAIGRETTE, CAESAR, LEMON HERB, LEMON PARMESAN, BALSAMIC VINAIGRETTE'
  },
  {
    itemName: 'Chopped Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO tortillas', 'SUB gluten free tortillas'],
    notes: 'Can be made soy-safe with listed modifications. Safe dressings: CITRUS, RED WINE VINAIGRETTE, CAESAR, LEMON HERB, LEMON PARMESAN, BALSAMIC VINAIGRETTE'
  },

  // SANDWICHES - MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN AND CIABATTA; MUST CLEAN GRILL; NO FRENCH FRIES; NO COLE SLAW
  {
    itemName: 'Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN, CIABATTA. MUST CLEAN GRILL. NO FRENCH FRIES, NO COLE SLAW'
  },
  {
    itemName: 'Cheeseburger',
    category: 'Sandwiches: Prime Burgers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN, CIABATTA. MUST CLEAN GRILL. NO FRENCH FRIES, NO COLE SLAW'
  },
  {
    itemName: 'Bison Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN, CIABATTA. MUST CLEAN GRILL. NO FRENCH FRIES, NO COLE SLAW'
  },
  {
    itemName: 'Bison Cheeseburger',
    category: 'Sandwiches: Prime Burgers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN, CIABATTA. MUST CLEAN GRILL. NO FRENCH FRIES, NO COLE SLAW'
  },
  {
    itemName: 'Turkey Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO red onions', 'NO char-crust', 'NO mayonnaise', 'MUST CLEAN GRILL', 'NO FRIES', 'NO COLESLAW'],
    notes: 'Can be made soy-safe with listed modifications. MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN, CIABATTA'
  },
  {
    itemName: 'Chicken Club',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO mustard mayonnaise', 'SUB plain chicken', 'MUST CLEAN GRILL', 'NO FRIES', 'NO COLESLAW'],
    notes: 'Can be made soy-safe with listed modifications. MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN, CIABATTA'
  },
  {
    itemName: 'Mediterranean Salmon',
    category: 'Sandwiches: Signatures',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. MUST CLEAN GRILL. NO FRENCH FRIES, NO COLE SLAW. MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN, CIABATTA'
  },
  {
    itemName: 'French Dip',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO horseradish cream sauce', 'MUST CLEAN GRILL', 'NO FRIES', 'NO COLESLAW'],
    notes: 'Can be made soy-safe with listed modifications. MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN, CIABATTA'
  },
  {
    itemName: 'Blackened Steak Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO ancho mayo', 'MUST CLEAN GRILL', 'NO FRIES', 'NO COLESLAW'],
    notes: 'Can be made soy-safe with listed modifications. MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN, CIABATTA'
  },
  {
    itemName: 'Turkey Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. MUST CLEAN GRILL. NO FRENCH FRIES, NO COLE SLAW. MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN, CIABATTA'
  },

  // FILET MIGNON - MUST CLEAN GRILL/BROILER
  {
    itemName: 'Basil Hayden Tenderloin Tips',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO bourbon marinade', 'NO roasted red onions', 'MUST CLEAN GRILL/BROILER'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Petite Filet',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['MUST CLEAN GRILL/BROILER'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Filet',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['MUST CLEAN GRILL/BROILER'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Filet Duo',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO horseradish crust', 'MUST CLEAN GRILL/BROILER'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Filet Trio',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO horseradish crust', 'MUST CLEAN GRILL/BROILER'],
    notes: 'Can be made soy-safe with listed modifications'
  },

  // STEAKS AND CHOPS - MUST CLEAN BROILER
  {
    itemName: 'Pork Chops',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['MUST CLEAN BROILER'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Skirt Steak',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO roasted onions', 'NO steak marinade', 'MUST CLEAN BROILER'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'New York Strip',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['MUST CLEAN BROILER'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Porterhouse',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO char-crust', 'MUST CLEAN BROILER'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Ribeye',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO char-crust', 'MUST CLEAN BROILER'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Lamb Chops',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO char-crust', 'MUST CLEAN BROILER'],
    notes: 'Can be made soy-safe with listed modifications'
  },

  // STEAK ADD ONS
  {
    itemName: 'Béarnaise Sauce',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Shrimp Skewer',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Oscar Style',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // PRIME RIB
  {
    itemName: 'Prime Rib',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO horseradish cream sauce'],
    notes: 'Can be made soy-safe with listed modifications'
  },

  // SEAFOOD
  {
    itemName: 'Coconut Shrimp',
    category: 'Fresh Fish and Seafood',
    status: 'modifiable',
    modifications: ['NO coconut dipping sauce'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Salmon',
    category: 'Fresh Fish and Seafood',
    status: 'modifiable',
    modifications: ['NO glaze'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Scallops De Jonghe',
    category: 'Fresh Fish and Seafood',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Macadamia Halibut',
    category: 'Fresh Fish and Seafood',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // CHICKEN
  {
    itemName: 'Herb Chicken',
    category: 'Chicken and Barbecue',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Lemon Pepper Chicken',
    category: 'Chicken and Barbecue',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // NIGHTLY SPECIALS
  {
    itemName: 'Long Island Duck',
    category: 'Nightly Specials',
    status: 'modifiable',
    modifications: ['NO wild rice'],
    notes: 'Can be made soy-safe with listed modifications. Wednesday special'
  },
  {
    itemName: 'Turkey Dinner',
    category: 'Nightly Specials',
    status: 'modifiable',
    modifications: ['NO stuffing'],
    notes: 'Can be made soy-safe with listed modifications. Sunday special'
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
    itemName: 'Au Gratin Potatoes',
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
    status: 'modifiable',
    modifications: ['NO whipped butter'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Sweet Potato',
    category: 'Sides',
    status: 'modifiable',
    modifications: ['NO whipped butter'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Mushroom Caps',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Loaded Baked Potato',
    category: 'Sides',
    status: 'modifiable',
    modifications: ['NO whipped butter'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Roasted Asparagus',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Applesauce',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // DESSERTS
  {
    itemName: 'Berries Crisp',
    category: 'Desserts',
    status: 'modifiable',
    modifications: ['NO ice cream'],
    notes: 'Can be made soy-safe with listed modifications'
  },

  // KID'S MENU - MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN AND CIABATTA
  {
    itemName: 'Burger',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries', 'NO kids bun'],
    notes: 'Can be made soy-safe with listed modifications. MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN, CIABATTA'
  },
  {
    itemName: 'Cheeseburger',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries', 'NO kids bun'],
    notes: 'Can be made soy-safe with listed modifications. MAY HAVE SESAME SEED BUN, WHEAT BREAD, BUTTERY ONION BUN, CIABATTA'
  },
  {
    itemName: 'Grilled Cheese',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries'],
    notes: 'Can be made soy-safe with listed modifications'
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
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // BRUNCH
  {
    itemName: 'Classic Breakfast',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO whipped butter'],
    notes: 'Can be made soy-safe with listed modifications'
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
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Breakfast Burrito',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Southwestern Steak and Eggs',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Eggs Florentine',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Buttermilk Pancakes',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO whipped butter'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Door County Cherry Pancakes',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO whipped butter'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Kids Buttermilk Pancakes',
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
    status: 'modifiable',
    modifications: ['NO whipped butter'],
    notes: 'Can be made soy-safe with listed modifications'
  },
  {
    itemName: 'Breakfast Potatoes',
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

  // SPECIAL PARTY MENU/HAPPY HOUR/VEGAN PLATE - All safe
  {
    itemName: 'Fresh Mozzarella Pizza',
    category: 'Party',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Mushroom and Goat Cheese Flatbread',
    category: 'Party',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Grilled Pepperoni',
    category: 'Party',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Harvest Grain Bowl',
    category: 'Party',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Roasted Vegetable Vegan Plate',
    category: 'Party',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Pasta and Roasted Vegetables',
    category: 'Party',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
];

async function applySoyRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔄 Applying soy allergen rules to ALL categories...\n');

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
  let safeCount = 0;
  let modifiableCount = 0;
  const categories = new Set<string>();

  // Apply rules for items ON the sheet
  for (const rule of ALL_SOY_RULES) {
    categories.add(rule.category);
    const item = allItems.find(i => i.name === rule.itemName && i.category === rule.category);

    if (!item) {
      console.log(`⚠️  "${rule.itemName}" (${rule.category}) not found in database`);
      notFoundCount++;
      continue;
    }

    // Delete existing soy rule if any
    await supabase
      .from('allergen_modifications')
      .delete()
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'soy');

    // Insert new rule
    const { error } = await supabase
      .from('allergen_modifications')
      .insert({
        tenant_id: TENANT_ID,
        menu_item_id: item.id,
        dish_name: item.name,
        category: item.category,
        allergen: 'soy',
        status: rule.status,
        modifications: rule.modifications,
        notes: rule.notes,
      });

    if (error) {
      console.error(`✗ ${rule.itemName}: ${error.message}`);
    } else {
      const statusEmoji = rule.status === 'safe' ? '✅' : '⚠️';
      console.log(`${statusEmoji} ${rule.itemName} (${rule.category}): ${rule.status.toUpperCase()}`);

      if (rule.status === 'safe') {
        safeCount++;
      } else {
        modifiableCount++;
      }
      appliedCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Soy allergen rules applied to ALL categories!');
  console.log(`   Items with rules: ${appliedCount}`);
  console.log(`   SAFE items: ${safeCount}`);
  console.log(`   MODIFIABLE items: ${modifiableCount}`);
  console.log(`   Items not found: ${notFoundCount}`);
  console.log(`   Categories covered: ${Array.from(categories).sort().join(', ')}`);
  console.log('='.repeat(60));
  console.log('\n⚠️  IMPORTANT: Items NOT on the soy allergy sheet are');
  console.log('   automatically marked as NOT SAFE by the checker.');
}

applySoyRules().catch(console.error);
