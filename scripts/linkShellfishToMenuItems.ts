/**
 * Link shellfish allergen modifications to menu items by ID
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODUzNCwiZXhwIjoyMDg0NjA0NTM0fQ.5jwKZKzqAirNGzjnP8wbf-1vfinlxTw9B9KuS6QbqZ8';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

async function linkShellfishModifications() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('Linking shellfish modifications to menu items...\n');

  // Get all menu items
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID);

  if (menuError) {
    console.error('Error fetching menu items:', menuError);
    return;
  }

  console.log(`Found ${menuItems?.length || 0} menu items`);

  // Get all shellfish modifications without menu_item_id
  const { data: shellfishMods, error: modsError } = await supabase
    .from('allergen_modifications')
    .select('id, dish_name')
    .eq('tenant_id', TENANT_ID)
    .eq('allergen', 'shellfish')
    .is('menu_item_id', null);

  if (modsError) {
    console.error('Error fetching shellfish modifications:', modsError);
    return;
  }

  console.log(`Found ${shellfishMods?.length || 0} unlinked shellfish modifications\n`);

  // Create a map of normalized names to menu item IDs
  const nameToIdMap = new Map<string, string>();
  menuItems?.forEach(item => {
    const normalized = item.name.toLowerCase().trim();
    nameToIdMap.set(normalized, item.id);
  });

  let linkedCount = 0;
  let notFoundCount = 0;
  const notFound: string[] = [];

  // Link each modification
  for (const mod of shellfishMods || []) {
    const normalizedName = mod.dish_name.toLowerCase().trim();
    const menuItemId = nameToIdMap.get(normalizedName);

    if (menuItemId) {
      const { error: updateError } = await supabase
        .from('allergen_modifications')
        .update({ menu_item_id: menuItemId })
        .eq('id', mod.id);

      if (updateError) {
        console.error(`Error linking "${mod.dish_name}":`, updateError);
      } else {
        linkedCount++;
        console.log(`✓ Linked: ${mod.dish_name}`);
      }
    } else {
      notFoundCount++;
      notFound.push(mod.dish_name);
    }
  }

  console.log(`\n✓ Successfully linked ${linkedCount} shellfish modifications`);
  if (notFoundCount > 0) {
    console.log(`✗ Could not find menu items for ${notFoundCount} modifications:`);
    notFound.forEach(name => console.log(`  - ${name}`));
  }
}

linkShellfishModifications().catch(console.error);
