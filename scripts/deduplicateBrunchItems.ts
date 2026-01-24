/**
 * Deduplicate brunch menu items
 * Merges 9 duplicate items into their canonical versions
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

interface MergeGroup {
  keep: string;
  remove: string[];
}

const MERGE_GROUPS: MergeGroup[] = [
  { keep: 'Side of Fresh Fruit', remove: ['Side of Fruit'] },
  { keep: 'Side of Bacon', remove: ['Bacon', 'Applewood Bacon'] },
  { keep: 'Side of Turkey Sausage', remove: ['Turkey Sausage'] },
  { keep: 'Side of Wheat Toast', remove: ['Wheat Toast'] },
  { keep: 'Breakfast Potatoes', remove: ['Breakfast Potatoes and Onions'] },
  { keep: 'Breakfast Burrito', remove: ['Turkey Sausage Breakfast Burrito', 'Turkey Sausage Burrito'] },
  { keep: 'Classic Three-Egg Omelet', remove: ['Build Your Own Omelet'] },
];

async function deduplicateBrunch() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔄 Deduplicating brunch items...\n');

  let totalRemoved = 0;

  for (const group of MERGE_GROUPS) {
    console.log(`\nProcessing: "${group.keep}"`);

    // Find items
    const { data: keepItem } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('tenant_id', TENANT_ID)
      .eq('name', group.keep)
      .maybeSingle();

    if (!keepItem) {
      console.log(`  ⚠️  "${group.keep}" not found, skipping`);
      continue;
    }

    for (const removeName of group.remove) {
      const { data: removeItem } = await supabase
        .from('menu_items')
        .select('id, name')
        .eq('tenant_id', TENANT_ID)
        .eq('name', removeName)
        .maybeSingle();

      if (!removeItem) {
        console.log(`  ℹ️  "${removeName}" already removed or doesn't exist`);
        continue;
      }

      console.log(`  Merging "${removeName}" → "${group.keep}"`);

      // Get allergen rules from item to be removed
      const { data: removeMods } = await supabase
        .from('allergen_modifications')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .eq('menu_item_id', removeItem.id);

      // Get existing rules on keep item
      const { data: keepMods } = await supabase
        .from('allergen_modifications')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .eq('menu_item_id', keepItem.id);

      // Merge allergen rules
      if (removeMods && removeMods.length > 0) {
        for (const mod of removeMods) {
          const existingMod = keepMods?.find(m => m.allergen === mod.allergen);

          if (existingMod) {
            console.log(`    ✓ ${mod.allergen}: already exists on "${group.keep}"`);
            await supabase.from('allergen_modifications').delete().eq('id', mod.id);
          } else {
            console.log(`    ⇒ ${mod.allergen}: moving to "${group.keep}"`);
            await supabase
              .from('allergen_modifications')
              .update({
                menu_item_id: keepItem.id,
                dish_name: keepItem.name,
              })
              .eq('id', mod.id);
          }
        }
      }

      // Delete the duplicate menu item
      const { error: deleteError } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', removeItem.id);

      if (deleteError) {
        console.error(`    ✗ Error deleting "${removeName}":`, deleteError);
      } else {
        console.log(`    ✓ Deleted "${removeName}"`);
        totalRemoved++;
      }
    }
  }

  // Summary
  const { data: finalBrunch } = await supabase
    .from('menu_items')
    .select('name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Brunch')
    .order('name');

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Deduplication complete!`);
  console.log(`   Items removed: ${totalRemoved}`);
  console.log(`\n📋 Final Brunch items (${finalBrunch?.length || 0}):\n`);
  finalBrunch?.forEach(item => console.log(`   - ${item.name}`));
  console.log('='.repeat(60));
}

deduplicateBrunch().catch(console.error);
