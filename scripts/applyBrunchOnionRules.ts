/**
 * Apply onion allergen rules for brunch items from official allergy sheet
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

interface OnionRule {
  itemName: string;
  status: 'safe' | 'modifiable';
  modifications: string[];
  notes: string;
}

// Rules from official onion allergy sheet - BRUNCH section only
const BRUNCH_ONION_RULES: OnionRule[] = [
  {
    itemName: 'Classic Breakfast',
    status: 'modifiable',
    modifications: ['NO breakfast potatoes'],
    notes: 'Can be made onion-safe with listed modifications'
  },
  {
    itemName: 'Breakfast Burrito',
    status: 'modifiable',
    modifications: ['NO pico de gallo', 'NO breakfast potatoes', 'NO ranchero sauce', 'NO guacamole'],
    notes: 'Can be made onion-safe with listed modifications'
  },
  {
    itemName: 'Buttermilk Pancakes',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Door County Cherry Pancakes',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'French Toast',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Kids Buttermilk Pancakes',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Kids Chocolate Chip Pancakes',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Kids French Toast',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Side of Bacon',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Side of Turkey Sausage',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Side of Fresh Fruit',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Kids Scramble',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Side of Wheat Toast',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  }
];

async function applyOnionRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔄 Applying onion allergen rules for brunch...\n');

  // Get all brunch items
  const { data: brunchItems } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Brunch');

  if (!brunchItems) {
    console.error('❌ No brunch items found');
    return;
  }

  let appliedCount = 0;
  let notSafeCount = 0;

  console.log('Processing items from onion sheet:\n');

  // Apply rules for items ON the sheet
  for (const rule of BRUNCH_ONION_RULES) {
    const item = brunchItems.find(i => i.name === rule.itemName);

    if (!item) {
      console.log(`⚠️  "${rule.itemName}" not found in database`);
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
        category: 'Brunch',
        allergen: 'onion',
        status: rule.status,
        modifications: rule.modifications,
        notes: rule.notes,
      });

    if (error) {
      console.error(`✗ ${rule.itemName}: ${error.message}`);
    } else {
      const statusEmoji = rule.status === 'safe' ? '✅' : '⚠️';
      console.log(`${statusEmoji} ${rule.itemName}: ${rule.status.toUpperCase()}`);
      if (rule.modifications.length > 0) {
        rule.modifications.forEach(mod => console.log(`     - ${mod}`));
      }
      appliedCount++;
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log('Processing items NOT on onion sheet (marking as NOT SAFE):\n');

  // Mark items NOT on sheet as NOT SAFE
  const itemsOnSheet = BRUNCH_ONION_RULES.map(r => r.itemName);
  const itemsNotOnSheet = brunchItems.filter(item => !itemsOnSheet.includes(item.name));

  for (const item of itemsNotOnSheet) {
    // Delete existing onion rule if any
    await supabase
      .from('allergen_modifications')
      .delete()
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'onion');

    // Don't insert a NOT_SAFE rule - absence from sheet means NOT SAFE
    // The checker will automatically mark it as NOT_SAFE_NOT_IN_SHEET
    console.log(`🚫 ${item.name}: NOT IN SHEET (cannot be made onion-safe)`);
    notSafeCount++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Onion rules applied!');
  console.log(`   Items with onion rules: ${appliedCount}`);
  console.log(`   Items NOT in onion sheet: ${notSafeCount}`);
  console.log('='.repeat(60));
}

applyOnionRules().catch(console.error);
