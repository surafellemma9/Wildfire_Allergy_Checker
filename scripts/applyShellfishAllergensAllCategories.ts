import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

interface ShellfishRule {
  itemName: string;
  category: string;
  status: 'safe' | 'modifiable';
  modifications: string[];
  notes: string;
}

const ALL_SHELLFISH_RULES: ShellfishRule[] = [
  // APPETIZERS
  {
    itemName: 'French Onion Soup',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Mediterranean Chicken Skewers',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Bison Meatballs',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Goat Cheese',
    category: 'Appetizers',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },

  // SALADS - All safe with specific dressings
  {
    itemName: 'Wildfire Chopped Salad',
    category: 'Salads',
    status: 'safe',
    modifications: ['ONLY BLUE CHEESE, OIL AND VINEGAR, BALSAMIC, WHITE BALSAMIC IN CRUETS'],
    notes: 'Safe with approved dressings only'
  },
  {
    itemName: 'Horseradish Crusted Salmon Salad',
    category: 'Salads',
    status: 'safe',
    modifications: ['ONLY BLUE CHEESE, OIL AND VINEGAR, BALSAMIC, WHITE BALSAMIC IN CRUETS'],
    notes: 'Safe with approved dressings only'
  },
  {
    itemName: 'Iceberg Wedge Salad',
    category: 'Salads',
    status: 'safe',
    modifications: ['ONLY BLUE CHEESE, OIL AND VINEGAR, BALSAMIC, WHITE BALSAMIC IN CRUETS'],
    notes: 'Safe with approved dressings only'
  },
  {
    itemName: 'Caesar Salad',
    category: 'Salads',
    status: 'safe',
    modifications: ['ONLY BLUE CHEESE, OIL AND VINEGAR, BALSAMIC, WHITE BALSAMIC IN CRUETS'],
    notes: 'Safe with approved dressings only'
  },

  // SANDWICHES - NO fries
  {
    itemName: 'Cedar Plank Roasted Salmon BLT',
    category: 'Sandwiches',
    status: 'modifiable',
    modifications: ['NO fries', 'Can sub other sides'],
    notes: 'Safe with side substitution'
  },
  {
    itemName: 'Wildfire Burger',
    category: 'Sandwiches',
    status: 'modifiable',
    modifications: ['NO fries', 'Can sub other sides'],
    notes: 'Safe with side substitution'
  },
  {
    itemName: 'Turkey Burger',
    category: 'Sandwiches',
    status: 'modifiable',
    modifications: ['NO fries', 'Can sub other sides'],
    notes: 'Safe with side substitution'
  },
  {
    itemName: 'Chicken Sandwich',
    category: 'Sandwiches',
    status: 'modifiable',
    modifications: ['NO fries', 'Can sub other sides'],
    notes: 'Safe with side substitution'
  },

  // FILETS
  {
    itemName: 'Petite Filet Mignon',
    category: 'Steaks',
    status: 'modifiable',
    modifications: ['NO steak butter'],
    notes: 'Safe without steak butter'
  },
  {
    itemName: 'Filet Mignon',
    category: 'Steaks',
    status: 'modifiable',
    modifications: ['NO steak butter'],
    notes: 'Safe without steak butter'
  },
  {
    itemName: 'Filet Medallion Duo',
    category: 'Steaks',
    status: 'modifiable',
    modifications: ['NO steak butter'],
    notes: 'Safe without steak butter'
  },
  {
    itemName: 'Filet Medallion Trio',
    category: 'Steaks',
    status: 'modifiable',
    modifications: ['NO steak butter'],
    notes: 'Safe without steak butter'
  },

  // STEAKS AND CHOPS
  {
    itemName: 'Bone-In Ribeye',
    category: 'Steaks',
    status: 'modifiable',
    modifications: ['NO steak butter'],
    notes: 'Safe without steak butter'
  },
  {
    itemName: 'New York Strip',
    category: 'Steaks',
    status: 'modifiable',
    modifications: ['NO steak butter'],
    notes: 'Safe without steak butter'
  },
  {
    itemName: 'Skirt Steak',
    category: 'Steaks',
    status: 'modifiable',
    modifications: ['NO marinade', 'NO char-crust'],
    notes: 'Safe without marinade and char-crust'
  },
  {
    itemName: 'Double Cut Pork Chop',
    category: 'Steaks',
    status: 'modifiable',
    modifications: ['NO steak butter'],
    notes: 'Safe without steak butter'
  },

  // PRIME RIB
  {
    itemName: 'Roasted Prime Rib of Beef',
    category: 'Steaks',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },

  // SEAFOOD
  {
    itemName: 'Cedar Plank Roasted Salmon',
    category: 'Seafood',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Macadamia Crusted Halibut',
    category: 'Seafood',
    status: 'modifiable',
    modifications: ['NO lemon butter sauce'],
    notes: 'Safe without lemon butter sauce'
  },

  // NIGHTLY SPECIALS
  {
    itemName: 'Wasabi Crusted Tuna',
    category: 'Nightly Specials',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Pork Shank',
    category: 'Nightly Specials',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },

  // CHICKEN AND BBQ
  {
    itemName: 'Chicken Brochettes',
    category: 'Chicken',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Barbequed Chicken',
    category: 'Chicken',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Baby Back Ribs',
    category: 'Chicken',
    status: 'modifiable',
    modifications: ['NO barbeque sauce'],
    notes: 'Safe without barbeque sauce'
  },

  // SIDES - All safe
  {
    itemName: 'Roasted Mushrooms',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Roasted Asparagus',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Mac and Cheese',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Loaded Baked Potato',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Baked Potato',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Creamed Spinach',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Garlic Mashed Potatoes',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'French Fries',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Broccolini',
    category: 'Sides',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },

  // DESSERTS - All safe
  {
    itemName: 'Ice Cream Sundae',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Key Lime Pie',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Creme Brulee',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Chocolate Layer Cake',
    category: 'Desserts',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },

  // KIDS MENU - NO fries
  {
    itemName: "Kid's Burger",
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries', 'Can sub other sides'],
    notes: 'Safe with side substitution'
  },
  {
    itemName: "Kid's Chicken Tenders",
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries', 'Can sub other sides'],
    notes: 'Safe with side substitution'
  },
  {
    itemName: "Kid's Grilled Chicken",
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries', 'Can sub other sides'],
    notes: 'Safe with side substitution'
  },
  {
    itemName: "Kid's Mac and Cheese",
    category: 'Kids Menu',
    status: 'modifiable',
    modifications: ['NO fries', 'Can sub other sides'],
    notes: 'Safe with side substitution'
  },

  // BRUNCH - All safe
  {
    itemName: 'Classic Breakfast',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Eggs Benedict',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Classic Three-Egg Omelet',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Wildfire Buttermilk Pancakes',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'French Toast',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Steak and Eggs',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Smoked Salmon Benedict',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Avocado Toast',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Avocado Toast and Eggs',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Avocado Toast with Sliced Tomatoes',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Breakfast Burrito',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Chicken and Waffles',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Breakfast Sandwich',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Belgian Waffle',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Skirt Steak and Eggs',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Southwestern Steak and Eggs',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Spinach and Kale Frittata',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Eggs Florentine',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Crab Cake Benedict',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Door County Cherry Pancakes',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Side of Bacon',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Side of Eggs',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Side of Fresh Fruit',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Side of Turkey Sausage',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Side of Wheat Toast',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Breakfast Potatoes',
    category: 'Brunch',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },

  // SPECIAL PARTY MENU - All safe
  {
    itemName: 'Tuscan Roasted Chicken',
    category: 'Party Menu',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
  {
    itemName: 'Herb Crusted Chicken',
    category: 'Party Menu',
    status: 'safe',
    modifications: [],
    notes: 'Safe for shellfish allergy'
  },
];

async function applyShellfishRules() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
    process.exit(1);
  }

  if (!TENANT_ID) {
    console.error('❌ Missing TENANT_ID environment variable');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🦐 Applying SHELLFISH allergen rules across ALL categories...\n');
  console.log(`Tenant ID: ${TENANT_ID}`);
  console.log(`Total rules to apply: ${ALL_SHELLFISH_RULES.length}\n`);

  // Get all menu items from database
  const { data: allItems, error: itemsError } = await supabase
    .from('menu_items')
    .select('id, name, category')
    .eq('tenant_id', TENANT_ID);

  if (itemsError) {
    console.error('❌ Error fetching menu items:', itemsError);
    process.exit(1);
  }

  console.log(`Found ${allItems?.length || 0} total menu items in database\n`);

  let safeCount = 0;
  let modifiableCount = 0;
  let notFoundCount = 0;

  for (const rule of ALL_SHELLFISH_RULES) {
    // Find menu item by name AND category
    const item = allItems?.find(
      i => i.name === rule.itemName && i.category === rule.category
    );

    if (!item) {
      console.log(`⚠️  "${rule.itemName}" (${rule.category}) not found in database`);
      notFoundCount++;
      continue;
    }

    // Delete existing shellfish rule if any
    const { error: deleteError } = await supabase
      .from('allergen_modifications')
      .delete()
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'shellfish');

    if (deleteError) {
      console.error(`❌ Error deleting existing rule for "${rule.itemName}":`, deleteError);
      continue;
    }

    // Insert new shellfish rule
    const { error: insertError } = await supabase
      .from('allergen_modifications')
      .insert({
        tenant_id: TENANT_ID,
        menu_item_id: item.id,
        dish_name: item.name,
        category: item.category,
        allergen: 'shellfish',
        status: rule.status,
        modifications: rule.modifications,
        notes: rule.notes,
      });

    if (insertError) {
      console.error(`❌ Error inserting rule for "${rule.itemName}":`, insertError);
      continue;
    }

    if (rule.status === 'safe') {
      safeCount++;
      console.log(`✓ ${rule.itemName} (${rule.category}) - SAFE`);
    } else {
      modifiableCount++;
      console.log(`✓ ${rule.itemName} (${rule.category}) - MODIFIABLE: ${rule.modifications.join(', ')}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ SHELLFISH allergen rules application complete!');
  console.log('='.repeat(80));
  console.log(`📊 Summary:`);
  console.log(`   Total rules processed: ${ALL_SHELLFISH_RULES.length}`);
  console.log(`   ✓ Safe items: ${safeCount}`);
  console.log(`   ⚠️  Modifiable items: ${modifiableCount}`);
  console.log(`   ❌ Not found in database: ${notFoundCount}`);
  console.log('='.repeat(80));
}

applyShellfishRules().catch(console.error);
