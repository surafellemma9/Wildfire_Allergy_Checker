/**
 * Apply gluten allergen rules for ALL menu categories from official allergy sheet
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

interface GlutenRule {
  itemName: string;
  category: string;
  status: 'safe' | 'modifiable';
  modifications: string[];
  notes: string;
}

// Rules from official gluten allergy sheet - ALL CATEGORIES
const ALL_GLUTEN_RULES: GlutenRule[] = [
  // APPETIZERS
  {
    itemName: 'Baked French Onion Soup',
    category: 'Appetizers',
    status: 'modifiable',
    modifications: ['NO crouton', 'SUBSTITUTE GLUTEN FREE CROUTON'],
    notes: 'Can be made gluten-safe with gluten-free substitutions'
  },
  {
    itemName: 'Mediterranean Chicken Skewers',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Baked Goat Cheese',
    category: 'Appetizers',
    status: 'modifiable',
    modifications: ['NO breadcrumbs', 'NO focaccia', 'SUB GLUTEN FREE BUN'],
    notes: 'Can be made gluten-safe with gluten-free substitutions'
  },
  {
    itemName: 'Shrimp Cocktail',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Sea Scallops',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // SALADS - RANCH, BALSAMIC VINAIGRETTE, CAESAR, CITRUS DRESSING, RED WINE VINAIGRETTE, BLUE CHEESE, OR OIL AND VINEGAR CRUETS ONLY
  {
    itemName: 'Field Green salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: RANCH, BALSAMIC VINAIGRETTE, CAESAR, CITRUS, RED WINE VINAIGRETTE, BLUE CHEESE, OIL AND VINEGAR'
  },
  {
    itemName: 'Caesar Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO croutons', 'SUB GLUTEN FREE CROUTONS'],
    notes: 'Can be made gluten-safe with gluten-free substitutions. Safe dressings: RANCH, BALSAMIC VINAIGRETTE, CAESAR, CITRUS, RED WINE VINAIGRETTE, BLUE CHEESE, OIL AND VINEGAR'
  },
  {
    itemName: 'Kale and Spinach',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: RANCH, BALSAMIC VINAIGRETTE, CAESAR, CITRUS, RED WINE VINAIGRETTE, BLUE CHEESE, OIL AND VINEGAR'
  },
  {
    itemName: 'Greek Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: RANCH, BALSAMIC VINAIGRETTE, CAESAR, CITRUS, RED WINE VINAIGRETTE, BLUE CHEESE, OIL AND VINEGAR'
  },
  {
    itemName: 'Steak and Blue Cheese Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO crispy onions'],
    notes: 'Can be made gluten-safe with listed modifications. Safe dressings: RANCH, BALSAMIC VINAIGRETTE, CAESAR, CITRUS, RED WINE VINAIGRETTE, BLUE CHEESE, OIL AND VINEGAR'
  },
  {
    itemName: 'Chopped salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO corn tortillas', 'SUB GLUTEN FREE TORTILLA CHIPS'],
    notes: 'Can be made gluten-safe with gluten-free substitutions. Safe dressings: RANCH, BALSAMIC VINAIGRETTE, CAESAR, CITRUS, RED WINE VINAIGRETTE, BLUE CHEESE, OIL AND VINEGAR'
  },

  // STEAKS, CHOPS, AND PRIME RIB
  {
    itemName: 'Basil Hayden Tenderloin Tips',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['GF steak butter'],
    notes: 'Can be made gluten-safe with gluten-free steak butter'
  },
  {
    itemName: 'Petite Filet',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO crouton', 'GF steak butter'],
    notes: 'Can be made gluten-safe with gluten-free steak butter'
  },
  {
    itemName: 'Filet',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO crouton', 'GF steak butter'],
    notes: 'Can be made gluten-safe with gluten-free steak butter'
  },
  {
    itemName: 'Pork Chops',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO mushroom crust', 'GF steak butter'],
    notes: 'Can be made gluten-safe with gluten-free steak butter'
  },
  {
    itemName: 'Roumanian Skirt Steak',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['GF steak butter'],
    notes: 'Can be made gluten-safe with gluten-free steak butter'
  },
  {
    itemName: 'New York',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['GF steak butter'],
    notes: 'Can be made gluten-safe with gluten-free steak butter'
  },
  {
    itemName: 'Porterhouse',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['GF steak butter'],
    notes: 'Can be made gluten-safe with gluten-free steak butter'
  },
  {
    itemName: 'Bone-In Rib-Eye',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO char-crust', 'GF steak butter'],
    notes: 'Can be made gluten-safe with gluten-free steak butter'
  },
  {
    itemName: 'Lamb Porterhouse Chops',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO char-crust', 'GF steak butter'],
    notes: 'Can be made gluten-safe with gluten-free steak butter'
  },
  {
    itemName: 'Prime Rib',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // FISH AND SEAFOOD
  {
    itemName: 'Cedar Planked Salmon',
    category: 'Fresh Fish and Seafood',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Halibut',
    category: 'Fresh Fish and Seafood',
    status: 'modifiable',
    modifications: ['NO flour', 'NO breadcrumbs', 'SUB GF BREADCRUMBS'],
    notes: 'Can be made gluten-safe with gluten-free breadcrumbs. SEASONAL'
  },

  // CHICKEN AND BARBECUE
  {
    itemName: 'Spit-Roasted Half Chicken',
    category: 'Chicken and Barbecue',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Barbecued Chicken',
    category: 'Chicken and Barbecue',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Lemon Pepper Chicken Breast',
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
  {
    itemName: 'Barbecued Baby Back Ribs',
    category: 'Chicken and Barbecue',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Rib and Chicken Combo',
    category: 'Chicken and Barbecue',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // PRIME BURGERS AND SANDWICHES - NO FRENCH FRIES
  {
    itemName: 'Thick Prime Angus burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO bun', 'SUBSTITUTE GLUTEN FREE BUN'],
    notes: 'Can be made gluten-safe with gluten-free bun. NO FRENCH FRIES. May add cheeses: YELLOW CHEDDAR, WHITE CHEDDAR, SWISS, BLUE CHEESE, FRESH MOZZARELLA, AMERICAN, SWISS GRUYERE'
  },
  {
    itemName: 'Cheeseburger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO bun', 'SUBSTITUTE GLUTEN FREE BUN'],
    notes: 'Can be made gluten-safe with gluten-free bun. NO FRENCH FRIES. May add cheeses: YELLOW CHEDDAR, WHITE CHEDDAR, SWISS, BLUE CHEESE, FRESH MOZZARELLA, AMERICAN, SWISS GRUYERE'
  },
  {
    itemName: 'Turkey Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO bun', 'NO char-crust', 'SUBSTITUTE GLUTEN FREE BUN'],
    notes: 'Can be made gluten-safe with gluten-free bun. NO FRENCH FRIES'
  },
  {
    itemName: 'Bison Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO bun', 'SUBSTITUTE GLUTEN FREE BUN'],
    notes: 'Can be made gluten-safe with gluten-free bun. NO FRENCH FRIES. May add cheeses: YELLOW CHEDDAR, WHITE CHEDDAR, SWISS, BLUE CHEESE, FRESH MOZZARELLA, AMERICAN, SWISS GRUYERE'
  },
  {
    itemName: 'Chicken Club',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO bun', 'SUBSTITUTE GLUTEN FREE BUN'],
    notes: 'Can be made gluten-safe with gluten-free bun. NO FRENCH FRIES'
  },
  {
    itemName: 'Prime Rib French Dip',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO bun', 'SUBSTITUTE GLUTEN FREE BUN'],
    notes: 'Can be made gluten-safe with gluten-free bun. NO FRENCH FRIES'
  },
  {
    itemName: 'Blackened New York Steak Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO bun', 'SUBSTITUTE GLUTEN FREE BUN'],
    notes: 'Can be made gluten-safe with gluten-free bun. NO FRENCH FRIES'
  },
  {
    itemName: 'Open Faced Mediterranean Salmon',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO bun', 'SUBSTITUTE GLUTEN FREE BUN'],
    notes: 'Can be made gluten-safe with gluten-free bun. NO FRENCH FRIES'
  },
  {
    itemName: 'Sliced Turkey sandwich',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO wheat bread', 'SUBSTITUTE GLUTEN FREE BUN'],
    notes: 'Can be made gluten-safe with gluten-free bun. NO FRENCH FRIES. Lunch only'
  },

  // SIDES
  {
    itemName: 'Mashed potatoes',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Broccoli with lemon vinaigrette',
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
    itemName: 'Au gratin potato',
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

  // NIGHTLY SPECIALS
  {
    itemName: 'Long Island Duck',
    category: 'Nightly Specials',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Tuesday special'
  },
  {
    itemName: 'Turkey Dinner',
    category: 'Nightly Specials',
    status: 'modifiable',
    modifications: ['NO stuffing', 'NO gravy'],
    notes: 'Can be made gluten-safe with listed modifications. Sunday special'
  },

  // KIDS MENU
  {
    itemName: 'Kids Burger',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries', 'NO bun', 'SUB MASHED POTATOES OR BROCCOLI', 'SUB GLUTEN FREE BUN'],
    notes: 'Can be made gluten-safe with gluten-free bun. May add cheeses: YELLOW CHEDDAR, WHITE CHEDDAR, SWISS, AMERICAN, BLUE CHEESE, JALAPENO JACK CHEESE'
  },
  {
    itemName: 'Kids Cheeseburger',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries', 'NO bun', 'SUB MASHED POTATOES OR BROCCOLI', 'SUB GLUTEN FREE BUN'],
    notes: 'Can be made gluten-safe with gluten-free bun. May add cheeses: YELLOW CHEDDAR, WHITE CHEDDAR, SWISS, AMERICAN, BLUE CHEESE, JALAPENO JACK CHEESE'
  },
  {
    itemName: 'Kids Filet',
    category: 'Kids Menu',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // DESSERTS
  {
    itemName: 'Flourless Chocolate cake',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Berries Crisp',
    category: 'Desserts',
    status: 'modifiable',
    modifications: ['NO ice cream', 'SUB whipped cream'],
    notes: 'Can be made gluten-safe with listed modifications'
  },

  // BRUNCH
  {
    itemName: 'Classic Breakfast',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO sausage', 'NO toast', 'SUB GF BUN'],
    notes: 'Can be made gluten-safe with gluten-free substitutions'
  },
  {
    itemName: 'Avocado Toast',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO toast', 'SUB GF BUN'],
    notes: 'Can be made gluten-safe with gluten-free substitutions'
  },
  {
    itemName: 'Avocado Toast with Sliced Tomatoes',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO toast', 'SUB GF BUN'],
    notes: 'Can be made gluten-safe with gluten-free substitutions'
  },
  {
    itemName: 'Spinach and Kale Frittata',
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
];

async function applyGlutenRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔄 Applying gluten allergen rules to ALL categories...\n');

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
  for (const rule of ALL_GLUTEN_RULES) {
    categories.add(rule.category);
    const item = allItems.find(i => i.name === rule.itemName && i.category === rule.category);

    if (!item) {
      console.log(`⚠️  "${rule.itemName}" (${rule.category}) not found in database`);
      notFoundCount++;
      continue;
    }

    // Delete existing gluten rule if any
    await supabase
      .from('allergen_modifications')
      .delete()
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'gluten');

    // Insert new rule
    const { error } = await supabase
      .from('allergen_modifications')
      .insert({
        tenant_id: TENANT_ID,
        menu_item_id: item.id,
        dish_name: item.name,
        category: item.category,
        allergen: 'gluten',
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
  console.log('✅ Gluten allergen rules applied to ALL categories!');
  console.log(`   Items with gluten rules: ${appliedCount}`);
  console.log(`   Items not found: ${notFoundCount}`);
  console.log(`   Categories covered: ${Array.from(categories).sort().join(', ')}`);
  console.log('='.repeat(60));
  console.log('\n⚠️  IMPORTANT: Items NOT on the gluten allergy sheet are');
  console.log('   automatically marked as NOT SAFE by the checker.');
}

applyGlutenRules().catch(console.error);
