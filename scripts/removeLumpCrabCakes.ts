/**
 * Remove duplicate "Lump Crab Cakes" and keep "Crab Cake Entree"
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODUzNCwiZXhwIjoyMDg0NjA0NTM0fQ.5jwKZKzqAirNGzjnP8wbf-1vfinlxTw9B9KuS6QbqZ8';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

async function removeDuplicate() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('Removing duplicate crab cake item...\n');

  // Find both items
  const { data: keepItem } = await supabase
    .from('menu_items')
    .select('id, name, category')
    .eq('tenant_id', TENANT_ID)
    .eq('name', 'Crab Cake Entree')
    .maybeSingle();

  const { data: removeItem } = await supabase
    .from('menu_items')
    .select('id, name, category')
    .eq('tenant_id', TENANT_ID)
    .eq('name', 'Lump Crab Cakes')
    .maybeSingle();

  if (!keepItem) {
    console.log('⚠️  "Crab Cake Entree" not found in database');
    return;
  }

  if (!removeItem) {
    console.log('ℹ️  "Lump Crab Cakes" already removed or doesn\'t exist');
    return;
  }

  console.log(`Found both items:`);
  console.log(`  Keep: "${keepItem.name}" (${keepItem.category})`);
  console.log(`  Remove: "${removeItem.name}" (${removeItem.category})\n`);

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

  console.log(`Allergen rules:`);
  console.log(`  "Crab Cake Entree" has ${keepMods?.length || 0} rules`);
  console.log(`  "Lump Crab Cakes" has ${removeMods?.length || 0} rules\n`);

  // Merge allergen rules if needed
  if (removeMods && removeMods.length > 0) {
    console.log('Merging allergen rules...');
    for (const mod of removeMods) {
      const existingMod = keepMods?.find(m => m.allergen === mod.allergen);

      if (existingMod) {
        console.log(`  ✓ ${mod.allergen}: already exists on "Crab Cake Entree"`);
        // Delete the duplicate from removeItem
        await supabase
          .from('allergen_modifications')
          .delete()
          .eq('id', mod.id);
      } else {
        console.log(`  ⇒ ${mod.allergen}: moving to "Crab Cake Entree"`);
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
    console.log('');
  }

  // Delete the duplicate menu item
  const { error: deleteError } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', removeItem.id);

  if (deleteError) {
    console.error(`✗ Error deleting "Lump Crab Cakes":`, deleteError);
  } else {
    console.log(`✓ Deleted "Lump Crab Cakes"\n`);
  }

  // Show final seafood list
  const { data: finalSeafood } = await supabase
    .from('menu_items')
    .select('name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Seafood')
    .order('name');

  console.log('='.repeat(50));
  console.log('✅ Cleanup complete!');
  console.log(`\n📋 Final Seafood category (${finalSeafood?.length || 0} items):\n`);
  finalSeafood?.forEach(item => console.log(`   - ${item.name}`));
  console.log('='.repeat(50));
}

removeDuplicate().catch(console.error);
