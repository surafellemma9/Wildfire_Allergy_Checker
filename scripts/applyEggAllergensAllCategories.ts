/**
 * Apply egg allergen rules for ALL menu categories from official allergy sheet
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

interface EggRule {
  itemName: string;
  category: string;
  status: 'safe' | 'modifiable';
  modifications: string[];
  notes: string;
}

// Rules from official egg allergy sheet - ALL CATEGORIES
const ALL_EGG_RULES: EggRule[] = [
  // APPETIZER
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
    itemName: 'Bacon Wrapped Sea Scallop Skewers',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // SALADS - BALSAMIC VINAIGRETTE, CITRUS LIME VINAIGRETTE, LEMON PARMESAN VINAIGRETTE, RED WINE VINAIGRETTE AND LEMON HERB VINAIGRETTE ONLY
  {
    itemName: 'Field Greens Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: BALSAMIC VINAIGRETTE, CITRUS LIME VINAIGRETTE, LEMON PARMESAN VINAIGRETTE, RED WINE VINAIGRETTE, LEMON HERB VINAIGRETTE'
  },
  {
    itemName: 'Tuscan Kale Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO egg'],
    notes: 'Can be made egg-safe with listed modifications. Safe dressings: BALSAMIC VINAIGRETTE, CITRUS LIME VINAIGRETTE, LEMON PARMESAN VINAIGRETTE, RED WINE VINAIGRETTE, LEMON HERB VINAIGRETTE'
  },
  {
    itemName: 'Greek Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Safe dressings: BALSAMIC VINAIGRETTE, CITRUS LIME VINAIGRETTE, LEMON PARMESAN VINAIGRETTE, RED WINE VINAIGRETTE, LEMON HERB VINAIGRETTE'
  },
  {
    itemName: 'Steak & Blue Cheese Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO ranch dressing', 'NO crispy onions'],
    notes: 'Can be made egg-safe with listed modifications. Safe dressings: BALSAMIC VINAIGRETTE, CITRUS LIME VINAIGRETTE, LEMON PARMESAN VINAIGRETTE, RED WINE VINAIGRETTE, LEMON HERB VINAIGRETTE'
  },
  {
    itemName: 'Chopped Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO tortillas', 'SUB GF tortillas'],
    notes: 'Can be made egg-safe with listed modifications. Safe dressings: BALSAMIC VINAIGRETTE, CITRUS LIME VINAIGRETTE, LEMON PARMESAN VINAIGRETTE, RED WINE VINAIGRETTE, LEMON HERB VINAIGRETTE'
  },

  // SANDWICHES - NO SESAME SEED, NO KIDS BUN, NO GF BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO COLESLAW AND NO FRIES
  {
    itemName: 'Angus Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO bun', 'except above'],
    notes: 'Can be made egg-safe with listed modifications. NO SESAME SEED, NO KIDS BUN, NO GF BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO COLESLAW AND NO FRIES'
  },
  {
    itemName: 'Cheeseburger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO bun', 'except above'],
    notes: 'Can be made egg-safe with listed modifications. NO SESAME SEED, NO KIDS BUN, NO GF BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO COLESLAW AND NO FRIES'
  },
  {
    itemName: 'Bison Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO bun', 'except above'],
    notes: 'Can be made egg-safe with listed modifications. NO SESAME SEED, NO KIDS BUN, NO GF BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO COLESLAW AND NO FRIES'
  },
  {
    itemName: 'Turkey Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO bun', 'NO mayonnaise', 'plus above'],
    notes: 'Can be made egg-safe with listed modifications. NO SESAME SEED, NO KIDS BUN, NO GF BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO COLESLAW AND NO FRIES'
  },
  {
    itemName: 'Chicken Club',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO bun', 'NO mustard mayonnaise', 'plus above'],
    notes: 'Can be made egg-safe with listed modifications. NO SESAME SEED, NO KIDS BUN, NO GF BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO COLESLAW AND NO FRIES'
  },
  {
    itemName: 'Mediterranean Salmon',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO other changes', 'except above'],
    notes: 'Can be made egg-safe with listed modifications. NO SESAME SEED, NO KIDS BUN, NO GF BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO COLESLAW AND NO FRIES'
  },
  {
    itemName: 'French Dip',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO other changes', 'except above'],
    notes: 'Can be made egg-safe with listed modifications. NO SESAME SEED, NO KIDS BUN, NO GF BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO COLESLAW AND NO FRIES'
  },
  {
    itemName: 'Blackened Steak Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO bun', 'plus above'],
    notes: 'Can be made egg-safe with listed modifications. NO SESAME SEED, NO KIDS BUN, NO GF BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO COLESLAW AND NO FRIES'
  },
  {
    itemName: 'Turkey Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO other changes', 'except above'],
    notes: 'Can be made egg-safe with listed modifications. NO SESAME SEED, NO KIDS BUN, NO GF BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO COLESLAW AND NO FRIES'
  },

  // FILETS
  {
    itemName: 'Tenderloin Tips',
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

  // STEAK AND CHOPS
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

  // STEAK ADD ONS
  {
    itemName: 'Shrimp Skewer',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // PRIME RIB
  {
    itemName: 'Prime Rib',
    category: 'Steaks and Chops',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // FRESH FISH AND SEAFOOD
  {
    itemName: 'Salmon',
    category: 'Fresh Fish and Seafood',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Scallops De Jonghe',
    category: 'Fresh Fish and Seafood',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // NIGHTLY SPECIALS
  {
    itemName: 'Spit Roasted Duck',
    category: 'Nightly Specials',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Wednesday special'
  },
  {
    itemName: 'Turkey Dinner',
    category: 'Nightly Specials',
    status: 'modifiable',
    modifications: ['NO stuffing'],
    notes: 'Can be made egg-safe with listed modifications. Sunday special'
  },

  // CHICKEN AND BARBECUE
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
  {
    itemName: 'Baby Back Ribs',
    category: 'Chicken and Barbecue',
    status: 'modifiable',
    modifications: ['NO coleslaw'],
    notes: 'Can be made egg-safe with listed modifications'
  },
  {
    itemName: 'Chicken and BBQ Rib Combo',
    category: 'Chicken and Barbecue',
    status: 'modifiable',
    modifications: ['NO coleslaw'],
    notes: 'Can be made egg-safe with listed modifications'
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
    modifications: ['NO oatmeal crumble', 'NO ice cream'],
    notes: 'Can be made egg-safe with listed modifications'
  },

  // KID'S MENU - NO SESAME SEED, NO KIDS BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO FRIES
  {
    itemName: 'Burger',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO bun', 'see above'],
    notes: 'Can be made egg-safe with listed modifications. NO SESAME SEED, NO KIDS BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO FRIES'
  },
  {
    itemName: 'Cheeseburger',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO bun', 'see above'],
    notes: 'Can be made egg-safe with listed modifications. NO SESAME SEED, NO KIDS BUN; MAY HAVE MULTI-GRAIN BREAD, BUTTERY ONION BUN; NO FRIES'
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
    itemName: 'Avocado Toast',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO eggs'],
    notes: 'Can be made egg-safe with listed modifications'
  },
  {
    itemName: 'Avocado Toast with Sliced Tomatoes',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Southwestern Steak and Eggs',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO eggs'],
    notes: 'Can be made egg-safe with listed modifications'
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

  // SPECIAL PARTY MENU/HAPPY HOUR/VEGAN PLATE
  {
    itemName: 'Mozzarella Pizza',
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
    itemName: 'Wild Mushroom Pizza',
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
];

async function applyEggRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔄 Applying egg allergen rules to ALL categories...\n');

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
  for (const rule of ALL_EGG_RULES) {
    categories.add(rule.category);
    const item = allItems.find(i => i.name === rule.itemName && i.category === rule.category);

    if (!item) {
      console.log(`⚠️  "${rule.itemName}" (${rule.category}) not found in database`);
      notFoundCount++;
      continue;
    }

    // Delete existing egg rule if any
    await supabase
      .from('allergen_modifications')
      .delete()
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'eggs');

    // Insert new rule
    const { error } = await supabase
      .from('allergen_modifications')
      .insert({
        tenant_id: TENANT_ID,
        menu_item_id: item.id,
        dish_name: item.name,
        category: item.category,
        allergen: 'eggs',
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
  console.log('✅ Egg allergen rules applied to ALL categories!');
  console.log(`   Items with egg rules: ${appliedCount}`);
  console.log(`   Items not found: ${notFoundCount}`);
  console.log(`   Categories covered: ${Array.from(categories).sort().join(', ')}`);
  console.log('='.repeat(60));
  console.log('\n⚠️  IMPORTANT: Items NOT on the egg allergy sheet are');
  console.log('   automatically marked as NOT SAFE by the checker.');
}

applyEggRules().catch(console.error);
