/**
 * Apply sesame allergen rules for ALL menu categories from official allergy sheet
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

interface SesameRule {
  itemName: string;
  category: string;
  status: 'safe' | 'modifiable';
  modifications: string[];
  notes: string;
}

// Rules from official sesame allergy sheet - ALL CATEGORIES
// Most items are SAFE - main restrictions are NO SESAME SEED BUN, MULTI-GRAIN BREAD, OR BUTTERY ONION BUN
const ALL_SESAME_RULES: SesameRule[] = [
  // APPETIZERS - Mostly safe
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
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Fried Calamari',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Crab Cakes',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Bacon Wrapped Sea Scallop Skewers',
    category: 'Appetizers',
    status: 'modifiable',
    modifications: ['NO apricot dipping sauce'],
    notes: 'Can be made sesame-safe with listed modifications'
  },

  // SALADS - All safe (ONLY BALSAMIC, CITRUS, RED WINE VINAIGRETTE, LEMON HERB VINAIGRETTE, LEMON PARMESAN VINAIGRETTE, BLUE CHEESE, AND RANCH DRESSINGS)
  {
    itemName: 'Field Green Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: BALSAMIC, CITRUS, RED WINE VINAIGRETTE, LEMON HERB, LEMON PARMESAN, BLUE CHEESE, RANCH'
  },
  {
    itemName: 'Caesar Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: BALSAMIC, CITRUS, RED WINE VINAIGRETTE, LEMON HERB, LEMON PARMESAN, BLUE CHEESE, RANCH'
  },
  {
    itemName: 'Tuscan Kale Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: BALSAMIC, CITRUS, RED WINE VINAIGRETTE, LEMON HERB, LEMON PARMESAN, BLUE CHEESE, RANCH'
  },
  {
    itemName: 'Greek Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: BALSAMIC, CITRUS, RED WINE VINAIGRETTE, LEMON HERB, LEMON PARMESAN, BLUE CHEESE, RANCH'
  },
  {
    itemName: 'Steak & Blue Cheese Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: BALSAMIC, CITRUS, RED WINE VINAIGRETTE, LEMON HERB, LEMON PARMESAN, BLUE CHEESE, RANCH'
  },
  {
    itemName: 'Chopped Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: BALSAMIC, CITRUS, RED WINE VINAIGRETTE, LEMON HERB, LEMON PARMESAN, BLUE CHEESE, RANCH'
  },

  // SANDWICHES - NO SESAME SEED BUN, MULTI-GRAIN BREAD, OR BUTTERY ONION BUN; CAN HAVE GLUTEN FREE BUN, KIDS BUN
  {
    itemName: 'Prime Angus Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO sesame seed bun'],
    notes: 'Can be made sesame-safe with listed modifications. CAN HAVE GLUTEN FREE BUN, KIDS BUN'
  },
  {
    itemName: 'Cheeseburger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO sesame seed bun'],
    notes: 'Can be made sesame-safe with listed modifications. CAN HAVE GLUTEN FREE BUN, KIDS BUN'
  },
  {
    itemName: 'Bison Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO sesame seed bun'],
    notes: 'Can be made sesame-safe with listed modifications. CAN HAVE GLUTEN FREE BUN, KIDS BUN'
  },
  {
    itemName: 'Bison Cheeseburger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO sesame seed bun'],
    notes: 'Can be made sesame-safe with listed modifications. CAN HAVE GLUTEN FREE BUN, KIDS BUN'
  },
  {
    itemName: 'Turkey Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO sesame seed bun'],
    notes: 'Can be made sesame-safe with listed modifications. CAN HAVE GLUTEN FREE BUN, KIDS BUN'
  },
  {
    itemName: 'Hot Honey Chicken Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO sesame seed bun'],
    notes: 'Can be made sesame-safe with listed modifications. CAN HAVE GLUTEN FREE BUN, KIDS BUN'
  },
  {
    itemName: 'Chicken Club',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO sesame seed bun'],
    notes: 'Can be made sesame-safe with listed modifications. CAN HAVE GLUTEN FREE BUN, KIDS BUN'
  },
  {
    itemName: 'Mediterranean Salmon',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO zaatar', 'NO multi-grain bread'],
    notes: 'Can be made sesame-safe with listed modifications. CAN HAVE GLUTEN FREE BUN, KIDS BUN'
  },
  {
    itemName: 'Crab Cake',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO sesame seed bun'],
    notes: 'Can be made sesame-safe with listed modifications. CAN HAVE GLUTEN FREE BUN, KIDS BUN'
  },
  {
    itemName: 'French Dip',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO buttery onion bun'],
    notes: 'Can be made sesame-safe with listed modifications. CAN HAVE GLUTEN FREE BUN, KIDS BUN'
  },
  {
    itemName: 'Blackened Steak Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO buttery onion bun'],
    notes: 'Can be made sesame-safe with listed modifications. CAN HAVE GLUTEN FREE BUN, KIDS BUN'
  },
  {
    itemName: 'Turkey Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO multi-grain bread'],
    notes: 'Can be made sesame-safe with listed modifications. CAN HAVE GLUTEN FREE BUN, KIDS BUN'
  },

  // FILETS - All safe
  {
    itemName: 'Basil Hayden Tenderloin Tips',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Petite Filet',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Filet',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Horseradish Crusted Filet',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Filet Duo',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Filet Trio',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // STEAKS AND CHOPS - All safe
  {
    itemName: 'Pork Chops',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Skirt Steak',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'New York Strip',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Porterhouse',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Ribeye',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Lamb Chops',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // STEAK ADD ONS - All safe
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

  // PRIME RIB - Safe
  {
    itemName: 'Prime Rib',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // FRESH FISH AND SEAFOOD - All safe
  {
    itemName: 'Coconut Shrimp',
    category: 'Fresh Fish and Seafood',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Salmon',
    category: 'Fresh Fish and Seafood',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Scallop De Jonghe',
    category: 'Fresh Fish and Seafood',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Crab Cakes',
    category: 'Fresh Fish and Seafood',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // NIGHTLY SPECIALS - All safe
  {
    itemName: 'Fried Chicken',
    category: 'Nightly Specials',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Monday special'
  },
  {
    itemName: 'Long Island Duck',
    category: 'Nightly Specials',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Wednesday special'
  },
  {
    itemName: 'Beer Braised Short Ribs',
    category: 'Nightly Specials',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Thursday special'
  },
  {
    itemName: 'Filet Wellington',
    category: 'Nightly Specials',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Friday/Saturday special'
  },
  {
    itemName: 'Roast Turkey',
    category: 'Nightly Specials',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Sunday special'
  },

  // CHICKEN - All safe
  {
    itemName: 'Herb Chicken',
    category: 'Chicken and Barbecue',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'BBQ Chicken',
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
  {
    itemName: 'Chicken Moreno',
    category: 'Chicken and Barbecue',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // BARBECUE - All safe
  {
    itemName: 'Baby Back Ribs',
    category: 'Chicken and Barbecue',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'BBQ Chicken and Baby Back Ribs',
    category: 'Chicken and Barbecue',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // SIDES - All safe
  {
    itemName: 'French Fries',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
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
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Sweet Potato',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Cottage Fries',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
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
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
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
  {
    itemName: 'Coleslaw',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
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
    itemName: 'Flourless Chocolate Cake',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // KID'S MENU - All safe
  {
    itemName: 'Chicken Fingers',
    category: 'Kids Menu',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Burger',
    category: 'Kids Menu',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Cheeseburger',
    category: 'Kids Menu',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Grilled Cheese',
    category: 'Kids Menu',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
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

  // BRUNCH - A few items need no multi-grain bread
  {
    itemName: 'Classic Breakfast',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO multi-grain bread'],
    notes: 'Can be made sesame-safe with listed modifications'
  },
  {
    itemName: 'Avocado Toast',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO multi-grain bread'],
    notes: 'Can be made sesame-safe with listed modifications'
  },
  {
    itemName: 'Avocado Toast with Sliced Tomatoes',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO multi-grain bread'],
    notes: 'Can be made sesame-safe with listed modifications'
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
    itemName: 'Crab Cake Benedict',
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
  {
    itemName: 'Side of Fresh Fruit',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Side of Eggs',
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

async function applySesameRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔄 Applying sesame allergen rules to ALL categories...\n');

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
  for (const rule of ALL_SESAME_RULES) {
    categories.add(rule.category);
    const item = allItems.find(i => i.name === rule.itemName && i.category === rule.category);

    if (!item) {
      console.log(`⚠️  "${rule.itemName}" (${rule.category}) not found in database`);
      notFoundCount++;
      continue;
    }

    // Delete existing sesame rule if any
    await supabase
      .from('allergen_modifications')
      .delete()
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'sesame');

    // Insert new rule
    const { error } = await supabase
      .from('allergen_modifications')
      .insert({
        tenant_id: TENANT_ID,
        menu_item_id: item.id,
        dish_name: item.name,
        category: item.category,
        allergen: 'sesame',
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
  console.log('✅ Sesame allergen rules applied to ALL categories!');
  console.log(`   Items with rules: ${appliedCount}`);
  console.log(`   SAFE items: ${safeCount}`);
  console.log(`   MODIFIABLE items: ${modifiableCount}`);
  console.log(`   Items not found: ${notFoundCount}`);
  console.log(`   Categories covered: ${Array.from(categories).sort().join(', ')}`);
  console.log('='.repeat(60));
  console.log('\n⚠️  IMPORTANT: Items NOT on the sesame allergy sheet are');
  console.log('   automatically marked as NOT SAFE by the checker.');
}

applySesameRules().catch(console.error);
