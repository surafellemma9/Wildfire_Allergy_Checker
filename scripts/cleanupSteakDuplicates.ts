/**
 * Clean up duplicate steak items - keep simpler names without adjectives
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODUzNCwiZXhwIjoyMDg0NjA0NTM0fQ.5jwKZKzqAirNGzjnP8wbf-1vfinlxTw9B9KuS6QbqZ8';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

async function cleanupDuplicates() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('Cleaning up duplicate steak items...\n');

  // Define duplicates: keep simpler name, remove the one with adjectives
  const duplicatePairs = [
    { keep: 'Pork Chops', remove: 'Bone-In Pork Chops' },
    { keep: 'Ribeye', remove: 'Bone-In Ribeye' },
    { keep: 'Lamb Chops', remove: 'Lamb Porterhouse Chops' },
    { keep: 'Filet Duo/Trio', remove: 'Filet Trio/Duo' },
    { keep: 'New York Strip', remove: 'New York Strip Steak' },
    { keep: 'Skirt Steak', remove: 'Roumanian Skirt Steak' },
  ];

  let mergedCount = 0;

  for (const pair of duplicatePairs) {
    console.log(`\nProcessing: "${pair.remove}" → "${pair.keep}"`);

    // Find both items
    const { data: keepItem } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('tenant_id', TENANT_ID)
      .eq('name', pair.keep)
      .maybeSingle();

    const { data: removeItem } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('tenant_id', TENANT_ID)
      .eq('name', pair.remove)
      .maybeSingle();

    if (!keepItem) {
      console.log(`  ⚠️  "${pair.keep}" not found in database`);
      continue;
    }

    if (!removeItem) {
      console.log(`  ℹ️  "${pair.remove}" already removed or doesn't exist`);
      continue;
    }

    console.log(`  Found both items`);

    // Get allergen rules from both items
    const { data: keepMods } = await supabase
      .from('allergen_modifications')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', keepItem.id);

    const { data: removeMods } = await supabase
      .from('allergen_modifications')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', removeItem.id);

    console.log(`  "${pair.keep}" has ${keepMods?.length || 0} allergen rules`);
    console.log(`  "${pair.remove}" has ${removeMods?.length || 0} allergen rules`);

    // Merge allergen rules from removeItem to keepItem
    if (removeMods && removeMods.length > 0) {
      for (const mod of removeMods) {
        // Check if keepItem already has this allergen rule
        const existingMod = keepMods?.find(m => m.allergen === mod.allergen);

        if (existingMod) {
          console.log(`    ✓ ${mod.allergen}: already exists on "${pair.keep}"`);
          // Delete the duplicate from removeItem
          await supabase
            .from('allergen_modifications')
            .delete()
            .eq('id', mod.id);
        } else {
          console.log(`    ⇒ ${mod.allergen}: moving to "${pair.keep}"`);
          // Move the rule to keepItem
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
      console.error(`  ✗ Error deleting "${pair.remove}":`, deleteError);
    } else {
      console.log(`  ✓ Deleted "${pair.remove}"`);
      mergedCount++;
    }
  }

  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Merged and removed: ${mergedCount} duplicate items`);

  // Show final steak list
  const { data: finalSteaks } = await supabase
    .from('menu_items')
    .select('name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Steaks & Filets')
    .order('name');

  console.log(`\n📋 Final Steaks & Filets (${finalSteaks?.length || 0} items):`);
  finalSteaks?.forEach(item => console.log(`   - ${item.name}`));
}

cleanupDuplicates().catch(console.error);
