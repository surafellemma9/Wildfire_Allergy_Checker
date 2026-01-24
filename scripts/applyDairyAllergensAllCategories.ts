/**
 * Apply dairy allergen rules for ALL menu categories from official allergy sheet
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

interface DairyRule {
  itemName: string;
  category: string;
  status: 'safe' | 'modifiable';
  modifications: string[];
  notes: string;
}

// Rules from official dairy allergy sheet - ALL CATEGORIES
const ALL_DAIRY_RULES: DairyRule[] = [
  // APPETIZERS
  {
    itemName: 'Mediterranean Chicken Skewers',
    category: 'Appetizers',
    status: 'modifiable',
    modifications: ['NO yogurt sauce'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Shrimp Cocktail',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Crab Cakes',
    category: 'Appetizers',
    status: 'modifiable',
    modifications: ['NO mustard mayonnaise'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Bacon Wrapped Sea Scallop Skewers',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },

  // SALADS - Note: BALSAMIC VINAIGRETTE, CITRUS LIME VINAIGRETTE, AND LEMON HERB VINAIGRETTE only
  {
    itemName: 'Field Green Salad',
    category: 'Salads',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed. Use BALSAMIC VINAIGRETTE, CITRUS LIME VINAIGRETTE, or LEMON HERB VINAIGRETTE'
  },
  {
    itemName: 'Tuscan Kale Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO cheese', 'NO dressing'],
    notes: 'Can be made dairy-safe with listed modifications. Safe dressings: BALSAMIC VINAIGRETTE, CITRUS LIME VINAIGRETTE, LEMON HERB VINAIGRETTE'
  },
  {
    itemName: 'Greek Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO feta cheese', 'NO dressing'],
    notes: 'Can be made dairy-safe with listed modifications. Safe dressings: BALSAMIC VINAIGRETTE, CITRUS LIME VINAIGRETTE, LEMON HERB VINAIGRETTE'
  },
  {
    itemName: 'Steak & Blue Cheese Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO cheese', 'NO crispy onions', 'NO ranch dressing'],
    notes: 'Can be made dairy-safe with listed modifications. Safe dressings: BALSAMIC VINAIGRETTE, CITRUS LIME VINAIGRETTE, LEMON HERB VINAIGRETTE'
  },
  {
    itemName: 'Chopped Salad',
    category: 'Salads',
    status: 'modifiable',
    modifications: ['NO marinated chicken', 'NO blue cheese', 'NO tortillas'],
    notes: 'Can be made dairy-safe with listed modifications. Safe dressings: BALSAMIC VINAIGRETTE, CITRUS LIME VINAIGRETTE, LEMON HERB VINAIGRETTE'
  },

  // SANDWICHES - NO BUTTER ON BUNS/BREAD, MAY HAVE SESAME SEED OR MULTI-GRAIN BREAD
  // NO KID'S BUN, NO BUTTERY ONION BUN, NO GLUTEN FREE BUN, NO COLESLAW, NO FRIES
  {
    itemName: 'Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO butter on bun', 'NO KIDS BUN', 'NO BUTTERY ONION BUN', 'NO GLUTEN FREE BUN', 'NO COLESLAW', 'NO FRIES'],
    notes: 'Can be made dairy-safe with listed modifications. MAY HAVE SESAME SEED or MULTI-GRAIN BREAD'
  },
  {
    itemName: 'Bison Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO butter on bun', 'NO KIDS BUN', 'NO BUTTERY ONION BUN', 'NO GLUTEN FREE BUN', 'NO COLESLAW', 'NO FRIES'],
    notes: 'Can be made dairy-safe with listed modifications. MAY HAVE SESAME SEED or MULTI-GRAIN BREAD'
  },
  {
    itemName: 'Turkey Burger',
    category: 'Sandwiches: Prime Burgers',
    status: 'modifiable',
    modifications: ['NO cheese', 'NO butter on bun', 'NO KIDS BUN', 'NO BUTTERY ONION BUN', 'NO GLUTEN FREE BUN', 'NO COLESLAW', 'NO FRIES'],
    notes: 'Can be made dairy-safe with listed modifications. MAY HAVE SESAME SEED or MULTI-GRAIN BREAD'
  },
  {
    itemName: 'Chicken Club',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO mustard-mayo marinated chicken', 'SUB plain chicken', 'NO cheese on bun', 'NO butter on bun', 'NO KIDS BUN', 'NO BUTTERY ONION BUN', 'NO GLUTEN FREE BUN', 'NO COLESLAW', 'NO FRIES'],
    notes: 'Can be made dairy-safe with listed modifications. MAY HAVE SESAME SEED or MULTI-GRAIN BREAD'
  },
  {
    itemName: 'Mediterranean Salmon',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO yogurt sauce', 'NO butter on bread', 'NO red wine vinaigrette', 'NO KIDS BUN', 'NO BUTTERY ONION BUN', 'NO GLUTEN FREE BUN', 'NO COLESLAW', 'NO FRIES'],
    notes: 'Can be made dairy-safe with listed modifications. MAY HAVE SESAME SEED or MULTI-GRAIN BREAD'
  },
  {
    itemName: 'Crab Cake',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO butter on bun', 'NO KIDS BUN', 'NO BUTTERY ONION BUN', 'NO GLUTEN FREE BUN', 'NO COLESLAW', 'NO FRIES'],
    notes: 'Can be made dairy-safe with listed modifications. MAY HAVE SESAME SEED or MULTI-GRAIN BREAD'
  },
  {
    itemName: 'French Dip',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO butter on bread', 'NO horseradish cream sauce', 'NO KIDS BUN', 'NO BUTTERY ONION BUN', 'NO GLUTEN FREE BUN', 'NO COLESLAW', 'NO FRIES'],
    notes: 'Can be made dairy-safe with listed modifications. MAY HAVE SESAME SEED or MULTI-GRAIN BREAD'
  },
  {
    itemName: 'Turkey Sandwich',
    category: 'Sandwiches: Signatures',
    status: 'modifiable',
    modifications: ['NO cheese', 'NO butter on bread', 'NO KIDS BUN', 'NO BUTTERY ONION BUN', 'NO GLUTEN FREE BUN', 'NO COLESLAW', 'NO FRIES'],
    notes: 'Can be made dairy-safe with listed modifications. MAY HAVE SESAME SEED or MULTI-GRAIN BREAD'
  },

  // FILETS - NO CRUSTS (EXCEPT PEPPERCORN), NO STEAK BUTTER, NO GARLIC CROUTON, NO PRE-MARKING BUTTER
  {
    itemName: 'Tenderloin Tips',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO pre-marking butter'],
    notes: 'Can be made dairy-safe with listed modifications. NO CRUSTS except PEPPERCORN'
  },
  {
    itemName: 'Petite Filet',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO pre-marking butter', 'NO steak butter', 'NO garlic crouton'],
    notes: 'Can be made dairy-safe with listed modifications. NO CRUSTS except PEPPERCORN'
  },
  {
    itemName: 'Dinner Filet',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO pre-marking butter', 'NO steak butter', 'NO garlic crouton'],
    notes: 'Can be made dairy-safe with listed modifications. NO CRUSTS except PEPPERCORN'
  },

  // STEAK AND CHOPS
  {
    itemName: 'Pork Chops',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO mushroom crust', 'NO pre-marking butter'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Skirt Steak',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO pre-marking butter'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'New York Strip',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO pre-marking butter'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Porterhouse',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO pre-marking butter'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Ribeye',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO pre-marking butter'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Lamb Chops',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO steak butter', 'NO pre-marking butter'],
    notes: 'Can be made dairy-safe with listed modifications'
  },

  // PRIME RIB
  {
    itemName: 'Prime Rib',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO horseradish cream sauce'],
    notes: 'Can be made dairy-safe with listed modifications'
  },

  // STEAK ADD ONS
  {
    itemName: 'Shrimp Skewer',
    category: 'Steaks and Chops',
    status: 'modifiable',
    modifications: ['NO garlic butter'],
    notes: 'Can be made dairy-safe with listed modifications'
  },

  // FRESH FISH AND SEAFOOD
  {
    itemName: 'Salmon',
    category: 'Fresh Fish and Seafood',
    status: 'modifiable',
    modifications: ['NO mustard mayo'],
    notes: 'Can be made dairy-safe with listed modifications'
  },

  // NIGHTLY SPECIALS
  {
    itemName: 'Long Island Duck',
    category: 'Nightly Specials',
    status: 'modifiable',
    modifications: ['NO cherry glaze', 'NO wild rice'],
    notes: 'Can be made dairy-safe with listed modifications. Wednesday special'
  },

  // CHICKEN
  {
    itemName: 'Chicken Moreno',
    category: 'Chicken and Barbecue',
    status: 'modifiable',
    modifications: ['NO lemon parmesan vinaigrette', 'SUB lemon herb vinaigrette', 'NO parmesan'],
    notes: 'Can be made dairy-safe with listed modifications'
  },

  // SIDES
  {
    itemName: 'Broccoli',
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
    itemName: 'Baked Potato',
    category: 'Sides',
    status: 'modifiable',
    modifications: ['NO sour cream', 'NO butter'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Sweet Potato',
    category: 'Sides',
    status: 'modifiable',
    modifications: ['NO butter'],
    notes: 'Can be made dairy-safe with listed modifications'
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
    notes: 'Can be made dairy-safe with listed modifications'
  },

  // KID'S MENU
  {
    itemName: 'Burger',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO bun', 'SUB multi-grain or sesame seed bun', 'NO butter on bun/bread', 'NO cheese'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Cheeseburger',
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO bun', 'SUB multi-grain or sesame seed bun', 'NO butter on bun/bread', 'NO cheese'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: "Kid's Steak & Mashed Potatoes",
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO pre-marking butter', 'NO steak butter', 'NO mashed potatoes'],
    notes: 'Can be made dairy-safe with listed modifications'
  },

  // BRUNCH
  {
    itemName: 'Classic Breakfast',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO butter when cooking eggs', 'NO breakfast potatoes and onions', 'NO butter on toast'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Avocado Toast',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO butter on toast', 'NO cheese in eggs'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Avocado Toast with Sliced Tomatoes',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO butter on toast'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Southwestern Steak and Eggs',
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
    status: 'modifiable',
    modifications: ['NO butter when cooking eggs'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Side of Wheat Toast',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO butter'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
  {
    itemName: 'Kids Scramble',
    category: 'Brunch',
    status: 'modifiable',
    modifications: ['NO cheese'],
    notes: 'Can be made dairy-safe with listed modifications'
  },

  // SPECIAL PARTY MENU/HAPPY HOUR/VEGAN PLATE
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
    status: 'modifiable',
    modifications: ['NO garlic butter', 'NO tomato basil sauce', 'NO goat cheese', 'NO asiago', 'SUB tomato jam'],
    notes: 'Can be made dairy-safe with listed modifications'
  },
];

async function applyDairyRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔄 Applying dairy allergen rules to ALL categories...\n');

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
  for (const rule of ALL_DAIRY_RULES) {
    categories.add(rule.category);
    const item = allItems.find(i => i.name === rule.itemName && i.category === rule.category);

    if (!item) {
      console.log(`⚠️  "${rule.itemName}" (${rule.category}) not found in database`);
      notFoundCount++;
      continue;
    }

    // Delete existing dairy rule if any
    await supabase
      .from('allergen_modifications')
      .delete()
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'dairy');

    // Insert new rule
    const { error } = await supabase
      .from('allergen_modifications')
      .insert({
        tenant_id: TENANT_ID,
        menu_item_id: item.id,
        dish_name: item.name,
        category: item.category,
        allergen: 'dairy',
        status: rule.status,
        modifications: rule.modifications,
        notes: rule.notes,
      });

    if (error) {
      console.error(`✗ ${rule.itemName}: ${error.message}`);
    } else {
      const statusEmoji = rule.status === 'safe' ? '✅' : '⚠️';
      console.log(`${statusEmoji} ${rule.itemName} (${rule.category}): ${rule.status.toUpperCase()}`);
      if (rule.modifications.length > 0) {
        rule.modifications.slice(0, 2).forEach(mod => console.log(`     - ${mod}`));
        if (rule.modifications.length > 2) {
          console.log(`     - ... and ${rule.modifications.length - 2} more`);
        }
      }
      appliedCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Dairy allergen rules applied to ALL categories!');
  console.log(`   Items with dairy rules: ${appliedCount}`);
  console.log(`   Items not found: ${notFoundCount}`);
  console.log(`   Categories covered: ${Array.from(categories).sort().join(', ')}`);
  console.log('='.repeat(60));
  console.log('\n⚠️  IMPORTANT: Items NOT on the dairy allergy sheet are');
  console.log('   automatically marked as NOT SAFE by the checker.');
}

applyDairyRules().catch(console.error);
