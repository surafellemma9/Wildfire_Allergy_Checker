/**
 * Check steak menu item names and their shellfish rules
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODUzNCwiZXhwIjoyMDg0NjA0NTM0fQ.5jwKZKzqAirNGzjnP8wbf-1vfinlxTw9B9KuS6QbqZ8';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

async function checkSteakNames() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('Checking steak menu items...\n');

  // Get all menu items that might be steaks
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .ilike('name', '%steak%');

  if (menuError) {
    console.error('Error:', menuError);
    return;
  }

  console.log('Menu items with "steak" in name:');
  menuItems?.forEach(item => {
    console.log(`  - "${item.name}"`);
  });

  // Get shellfish modifications for steaks
  const { data: shellfishMods, error: modsError } = await supabase
    .from('allergen_modifications')
    .select('id, dish_name, menu_item_id, status, modifications')
    .eq('tenant_id', TENANT_ID)
    .eq('allergen', 'shellfish')
    .ilike('dish_name', '%steak%');

  if (modsError) {
    console.error('Error:', modsError);
    return;
  }

  console.log('\nShellfish modifications with "steak" in dish_name:');
  shellfishMods?.forEach(mod => {
    console.log(`  - "${mod.dish_name}"`);
    console.log(`    Status: ${mod.status}`);
    console.log(`    Mods: ${mod.modifications?.join(', ') || 'none'}`);
    console.log(`    Linked: ${mod.menu_item_id ? 'YES' : 'NO'}`);
  });

  // Check specific steaks from the allergy sheet
  const steakNames = [
    'New York Strip',
    'New York Strip Steak',
    'Porterhouse',
    'Bone-In Ribeye',
    'Ribeye',
    'Roumanian Skirt Steak',
    'Skirt Steak',
    'Lamb Porterhouse Chops',
    'Lamb Chops',
  ];

  console.log('\n\nChecking specific steak names:');
  for (const name of steakNames) {
    const menuItem = menuItems?.find(m => m.name.toLowerCase() === name.toLowerCase());
    const mod = shellfishMods?.find(m => m.dish_name.toLowerCase() === name.toLowerCase());

    console.log(`\n"${name}":`);
    console.log(`  In menu_items: ${menuItem ? 'YES - "' + menuItem.name + '"' : 'NO'}`);
    console.log(`  Has shellfish mod: ${mod ? 'YES' : 'NO'}`);
    if (mod && menuItem) {
      console.log(`  Linked: ${mod.menu_item_id ? 'YES' : 'NO'}`);
    }
  }
}

checkSteakNames().catch(console.error);
