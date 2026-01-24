/**
 * Fix shellfish rules for all steak menu items
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODUzNCwiZXhwIjoyMDg0NjA0NTM0fQ.5jwKZKzqAirNGzjnP8wbf-1vfinlxTw9B9KuS6QbqZ8';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

async function fixSteakRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('Fixing shellfish rules for steaks and chops...\n');

  // Get all relevant menu items
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .or('name.ilike.%ribeye%,name.ilike.%porterhouse%,name.ilike.%lamb%,name.ilike.%pork chop%,name.ilike.%strip%,name.ilike.%skirt%');

  if (menuError) {
    console.error('Error fetching menu items:', menuError);
    return;
  }

  console.log(`Found ${menuItems?.length} steak/chop menu items\n`);

  // Shellfish rules based on the allergy sheet
  const steakRules: Record<string, { status: string; mods: string[]; category: string }> = {
    'pork chops': { status: 'safe', mods: [], category: 'Steaks' },
    'bone-in pork chops': { status: 'safe', mods: [], category: 'Steaks' },
    'skirt steak': { status: 'modifiable', mods: ['NO steak butter', 'NO red onions', 'NO steak marinade'], category: 'Steaks' },
    'roumanian skirt steak': { status: 'modifiable', mods: ['NO steak butter', 'NO red onions', 'NO steak marinade'], category: 'Steaks' },
    'new york strip': { status: 'modifiable', mods: ['NO steak butter'], category: 'Steaks' },
    'new york strip steak': { status: 'modifiable', mods: ['NO steak butter'], category: 'Steaks' },
    'porterhouse': { status: 'modifiable', mods: ['NO char-crust', 'NO steak butter'], category: 'Steaks' },
    'ribeye': { status: 'modifiable', mods: ['NO char-crust', 'NO steak butter'], category: 'Steaks' },
    'bone-in ribeye': { status: 'modifiable', mods: ['NO char-crust', 'NO steak butter'], category: 'Steaks' },
    'lamb chops': { status: 'modifiable', mods: ['NO char-crust', 'NO steak butter'], category: 'Steaks' },
    'lamb porterhouse chops': { status: 'modifiable', mods: ['NO char-crust', 'NO steak butter'], category: 'Steaks' },
  };

  let updated = 0;
  let created = 0;

  for (const item of menuItems || []) {
    const normalizedName = item.name.toLowerCase().trim();
    const rule = steakRules[normalizedName];

    if (!rule) {
      console.log(`⚠️  No rule defined for: "${item.name}"`);
      continue;
    }

    // Check if modification already exists
    const { data: existing } = await supabase
      .from('allergen_modifications')
      .select('id')
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'shellfish')
      .single();

    if (existing) {
      // Update existing
      const { error: updateError } = await supabase
        .from('allergen_modifications')
        .update({
          status: rule.status,
          modifications: rule.mods,
          dish_name: item.name,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error(`✗ Error updating "${item.name}":`, updateError);
      } else {
        console.log(`✓ Updated: "${item.name}" → ${rule.status} (${rule.mods.join(', ') || 'no changes'})`);
        updated++;
      }
    } else {
      // Create new
      const { error: insertError } = await supabase
        .from('allergen_modifications')
        .insert({
          tenant_id: TENANT_ID,
          menu_item_id: item.id,
          dish_name: item.name,
          category: rule.category,
          allergen: 'shellfish',
          status: rule.status,
          modifications: rule.mods,
        });

      if (insertError) {
        console.error(`✗ Error creating "${item.name}":`, insertError);
      } else {
        console.log(`✓ Created: "${item.name}" → ${rule.status} (${rule.mods.join(', ') || 'no changes'})`);
        created++;
      }
    }
  }

  console.log(`\n✓ Complete!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Created: ${created}`);
}

fixSteakRules().catch(console.error);
