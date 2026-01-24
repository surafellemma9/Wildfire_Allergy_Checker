/**
 * Consolidate Steaks, Steak and Chops, and Filets into one category
 * Merge duplicate filet items
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODUzNCwiZXhwIjoyMDg0NjA0NTM0fQ.5jwKZKzqAirNGzjnP8wbf-1vfinlxTw9B9KuS6QbqZ8';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

async function consolidate() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('Step 1: Consolidating categories into "steaks_and_filets"...\n');

  // Get all items in Filets, Steaks, and Steak and Chops categories
  const { data: items, error: fetchError } = await supabase
    .from('menu_items')
    .select('id, name, category')
    .eq('tenant_id', TENANT_ID)
    .or('category.ilike.%filet%,category.ilike.%steak%,category.ilike.%chop%');

  if (fetchError) {
    console.error('Error fetching items:', fetchError);
    return;
  }

  console.log(`Found ${items?.length} items to consolidate`);

  // Update all to use a single category
  const TARGET_CATEGORY = 'Steaks & Filets';

  for (const item of items || []) {
    if (item.category !== TARGET_CATEGORY) {
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ category: TARGET_CATEGORY })
        .eq('id', item.id);

      if (updateError) {
        console.error(`✗ Error updating "${item.name}":`, updateError);
      } else {
        console.log(`✓ Moved "${item.name}" from "${item.category}" to "${TARGET_CATEGORY}"`);
      }
    }
  }

  console.log('\n\nStep 2: Merging duplicate filets...\n');

  // Find duplicates to merge
  const duplicatePairs = [
    { keep: 'Petite Filet Mignon', remove: 'Petite Filet' },
    { keep: 'Filet Mignon', remove: 'Dinner Filet' },
    { keep: "Basil Hayden's Bourbon Marinated Tenderloin Tips", remove: 'Tenderloin Tips' },
  ];

  for (const pair of duplicatePairs) {
    // Find the items
    const { data: keepItem } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('tenant_id', TENANT_ID)
      .ilike('name', pair.keep)
      .single();

    const { data: removeItem } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('tenant_id', TENANT_ID)
      .ilike('name', pair.remove)
      .maybeSingle();

    if (!keepItem) {
      console.log(`⚠️  "${pair.keep}" not found, skipping merge`);
      continue;
    }

    if (!removeItem) {
      console.log(`⚠️  "${pair.remove}" not found, already merged or doesn't exist`);
      continue;
    }

    console.log(`\nMerging: "${removeItem.name}" → "${keepItem.name}"`);

    // Move allergen modifications from removeItem to keepItem
    const { data: mods } = await supabase
      .from('allergen_modifications')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', removeItem.id);

    if (mods && mods.length > 0) {
      console.log(`  Moving ${mods.length} allergen modifications...`);

      for (const mod of mods) {
        // Check if keepItem already has this allergen rule
        const { data: existingMod } = await supabase
          .from('allergen_modifications')
          .select('id')
          .eq('menu_item_id', keepItem.id)
          .eq('allergen', mod.allergen)
          .maybeSingle();

        if (existingMod) {
          console.log(`    ✓ ${mod.allergen}: already exists on "${keepItem.name}", deleting duplicate`);
          await supabase
            .from('allergen_modifications')
            .delete()
            .eq('id', mod.id);
        } else {
          console.log(`    ✓ ${mod.allergen}: moving to "${keepItem.name}"`);
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
      console.error(`  ✗ Error deleting "${removeItem.name}":`, deleteError);
    } else {
      console.log(`  ✓ Deleted duplicate "${removeItem.name}"`);
    }
  }

  console.log('\n✅ Consolidation complete!');
}

consolidate().catch(console.error);
