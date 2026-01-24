/**
 * Consolidate "Fresh Fish and Seafood" into "Seafood" category
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODUzNCwiZXhwIjoyMDg0NjA0NTM0fQ.5jwKZKzqAirNGzjnP8wbf-1vfinlxTw9B9KuS6QbqZ8';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

async function consolidateSeafood() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('Consolidating seafood categories...\n');

  // Get all items in both categories
  const { data: allSeafoodItems, error: fetchError } = await supabase
    .from('menu_items')
    .select('id, name, category')
    .eq('tenant_id', TENANT_ID)
    .or('category.eq.Fresh Fish and Seafood,category.eq.Seafood');

  if (fetchError) {
    console.error('Error fetching items:', fetchError);
    return;
  }

  console.log(`Found ${allSeafoodItems?.length} total seafood items\n`);

  const freshFishItems = allSeafoodItems?.filter(i => i.category === 'Fresh Fish and Seafood') || [];
  const seafoodItems = allSeafoodItems?.filter(i => i.category === 'Seafood') || [];

  console.log('Fresh Fish and Seafood category:', freshFishItems.length, 'items');
  freshFishItems.forEach(item => console.log('  -', item.name));

  console.log('\nSeafood category:', seafoodItems.length, 'items');
  seafoodItems.forEach(item => console.log('  -', item.name));

  // Check for duplicates between the two categories
  console.log('\nChecking for duplicates...');
  const duplicates: Array<{ freshFish: any; seafood: any }> = [];

  for (const freshItem of freshFishItems) {
    const duplicate = seafoodItems.find(s =>
      s.name.toLowerCase().trim() === freshItem.name.toLowerCase().trim() ||
      s.name.toLowerCase().includes(freshItem.name.toLowerCase()) ||
      freshItem.name.toLowerCase().includes(s.name.toLowerCase())
    );

    if (duplicate) {
      duplicates.push({ freshFish: freshItem, seafood: duplicate });
      console.log(`  Found: "${freshItem.name}" in Fresh Fish AND "${duplicate.name}" in Seafood`);
    }
  }

  // Handle duplicates
  if (duplicates.length > 0) {
    console.log('\nMerging duplicates...');

    for (const dup of duplicates) {
      console.log(`\nMerging "${dup.freshFish.name}" into "${dup.seafood.name}"`);

      // Get allergen rules from both
      const { data: freshMods } = await supabase
        .from('allergen_modifications')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .eq('menu_item_id', dup.freshFish.id);

      const { data: seafoodMods } = await supabase
        .from('allergen_modifications')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .eq('menu_item_id', dup.seafood.id);

      console.log(`  Fresh Fish item has ${freshMods?.length || 0} rules`);
      console.log(`  Seafood item has ${seafoodMods?.length || 0} rules`);

      // Move allergen rules from Fresh Fish to Seafood (if Seafood doesn't have them)
      if (freshMods && freshMods.length > 0) {
        for (const mod of freshMods) {
          const existingMod = seafoodMods?.find(m => m.allergen === mod.allergen);

          if (existingMod) {
            console.log(`    ✓ ${mod.allergen}: already exists on Seafood item`);
            await supabase.from('allergen_modifications').delete().eq('id', mod.id);
          } else {
            console.log(`    ⇒ ${mod.allergen}: moving to Seafood item`);
            await supabase
              .from('allergen_modifications')
              .update({
                menu_item_id: dup.seafood.id,
                dish_name: dup.seafood.name,
              })
              .eq('id', mod.id);
          }
        }
      }

      // Delete the Fresh Fish item
      await supabase.from('menu_items').delete().eq('id', dup.freshFish.id);
      console.log(`  ✓ Deleted "${dup.freshFish.name}" from Fresh Fish category`);
    }
  }

  // Move remaining Fresh Fish items to Seafood
  console.log('\nMoving remaining Fresh Fish items to Seafood category...');

  const remainingFreshFish = freshFishItems.filter(item =>
    !duplicates.some(dup => dup.freshFish.id === item.id)
  );

  for (const item of remainingFreshFish) {
    const { error: updateError } = await supabase
      .from('menu_items')
      .update({ category: 'Seafood' })
      .eq('id', item.id);

    if (updateError) {
      console.error(`  ✗ Error moving "${item.name}":`, updateError);
    } else {
      console.log(`  ✓ Moved "${item.name}" to Seafood`);
    }
  }

  // Final count
  const { data: finalSeafood } = await supabase
    .from('menu_items')
    .select('name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Seafood')
    .order('name');

  console.log(`\n✅ Consolidation complete!`);
  console.log(`\n📋 Final Seafood category (${finalSeafood?.length || 0} items):`);
  finalSeafood?.forEach(item => console.log(`   - ${item.name}`));
}

consolidateSeafood().catch(console.error);
