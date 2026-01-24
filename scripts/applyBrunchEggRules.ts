/**
 * Apply egg allergen rules for brunch items from official allergy sheet
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

interface EggRule {
  itemName: string;
  status: 'safe' | 'modifiable';
  modifications: string[];
  notes: string;
}

// Rules from official egg allergy sheet - BRUNCH section only
const BRUNCH_EGG_RULES: EggRule[] = [
  {
    itemName: 'Avocado Toast',
    status: 'modifiable',
    modifications: ['NO eggs'],
    notes: 'Can be made egg-safe with listed modifications'
  },
  {
    itemName: 'Avocado Toast with Sliced Tomatoes',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Southwestern Steak and Eggs',
    status: 'modifiable',
    modifications: ['NO eggs'],
    notes: 'Can be made egg-safe with listed modifications'
  },
  {
    itemName: 'Breakfast Potatoes',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  },
  {
    itemName: 'Side of Bacon',
    status: 'safe',
    modifications: [],
    notes: 'No changes needed'
  }
];

async function applyEggRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔄 Applying egg allergen rules for brunch...\n');

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

  console.log('Processing items from egg sheet:\n');

  // Apply rules for items ON the sheet
  for (const rule of BRUNCH_EGG_RULES) {
    const item = brunchItems.find(i => i.name === rule.itemName);

    if (!item) {
      console.log(`⚠️  "${rule.itemName}" not found in database`);
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
        category: 'Brunch',
        allergen: 'eggs',
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
  console.log('Processing items NOT on egg sheet (marking as NOT SAFE):\n');

  // Mark items NOT on sheet as NOT SAFE
  const itemsOnSheet = BRUNCH_EGG_RULES.map(r => r.itemName);
  const itemsNotOnSheet = brunchItems.filter(item => !itemsOnSheet.includes(item.name));

  for (const item of itemsNotOnSheet) {
    // Delete existing egg rule if any
    await supabase
      .from('allergen_modifications')
      .delete()
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'eggs');

    // Don't insert a NOT_SAFE rule - absence from sheet means NOT SAFE
    // The checker will automatically mark it as NOT_SAFE_NOT_IN_SHEET
    console.log(`🚫 ${item.name}: NOT IN SHEET (cannot be made egg-safe)`);
    notSafeCount++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Egg rules applied!');
  console.log(`   Items with egg rules: ${appliedCount}`);
  console.log(`   Items NOT in egg sheet: ${notSafeCount}`);
  console.log('='.repeat(60));
}

applyEggRules().catch(console.error);
