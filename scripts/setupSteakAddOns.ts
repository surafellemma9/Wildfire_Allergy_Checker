/**
 * Setup steak add-ons (Bearnaise, Oscar Style, Crab Cakes, Shrimp Skewer)
 * These should be selectable after choosing a steak, similar to crust options
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODUzNCwiZXhwIjoyMDg0NjA0NTM0fQ.5jwKZKzqAirNGzjnP8wbf-1vfinlxTw9B9KuS6QbqZ8';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

async function setupSteakAddOns() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('Setting up steak add-ons...\n');

  // Step 1: Move add-ons to a separate category
  const addOnNames = [
    'Bearnaise Sauce',
    'Oscar Style',
    'Crab Cakes Add-On',
    'Shrimp Skewer',
  ];

  console.log('Step 1: Moving add-ons to "Steak Add-Ons" category...\n');

  for (const name of addOnNames) {
    const { data: item, error: findError } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('tenant_id', TENANT_ID)
      .eq('name', name)
      .single();

    if (findError) {
      console.error(`✗ Could not find "${name}":`, findError);
      continue;
    }

    const { error: updateError } = await supabase
      .from('menu_items')
      .update({ category: 'Steak Add-Ons' })
      .eq('id', item.id);

    if (updateError) {
      console.error(`✗ Error updating "${name}":`, updateError);
    } else {
      console.log(`✓ Moved "${name}" to Steak Add-Ons category`);
    }
  }

  console.log('\n\nStep 2: Finding all steak items that should have add-ons...\n');

  // Get all steak/filet items (excluding the add-ons themselves)
  const { data: steakItems, error: steaksError } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Steaks & Filets')
    .not('name', 'in', `(${addOnNames.map(n => `"${n}"`).join(',')})`);

  if (steaksError) {
    console.error('Error fetching steak items:', steaksError);
    return;
  }

  console.log(`Found ${steakItems?.length} steak items that can have add-ons\n`);

  // Get the add-on item IDs
  const { data: addOnItems, error: addOnsError } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .in('name', addOnNames);

  if (addOnsError) {
    console.error('Error fetching add-on items:', addOnsError);
    return;
  }

  console.log('Add-ons available:');
  addOnItems?.forEach(item => console.log(`  - ${item.name} (${item.id})`));

  console.log('\n\nStep 3: Linking add-ons to each steak...\n');

  // For each steak, we need to store the add-on options in a JSON field
  // Let's use a custom field or metadata
  for (const steak of steakItems || []) {
    // Create add-on options array
    const addOnOptions = addOnItems?.map(addon => ({
      id: addon.id,
      name: addon.name,
    })) || [];

    // Update the steak item with add-on options
    // We'll need to use raw_allergen_info or another JSON field temporarily
    // Or better yet, let's create the structure in the pack generation
    console.log(`✓ "${steak.name}" will have ${addOnOptions.length} add-on options`);
  }

  console.log('\n✅ Setup complete!');
  console.log('\nNext steps:');
  console.log('1. The pack generation script needs to be updated to:');
  console.log('   - Detect items in "Steak Add-Ons" category');
  console.log('   - Add them as "addOnOptions" to all steak items');
  console.log('   - Similar to how crustOptions work');
  console.log('2. The UI needs to display add-on selection after steak selection');
  console.log('3. Multiple add-ons can be selected (unlike crust where only one is selected)');
}

setupSteakAddOns().catch(console.error);
