/**
 * Add shellfish rules for all filet items
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODUzNCwiZXhwIjoyMDg0NjA0NTM0fQ.5jwKZKzqAirNGzjnP8wbf-1vfinlxTw9B9KuS6QbqZ8';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

async function addFiletRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('Adding shellfish rules for filet items...\n');

  // Filet shellfish rules from the allergy sheet
  const filetRules: Record<string, { status: string; mods: string[] }> = {
    "basil hayden's bourbon marinated tenderloin tips": { status: 'modifiable', mods: ['NO steak butter', 'NO roasted onions'] },
    'petite filet mignon': { status: 'modifiable', mods: ['NO steak butter'] },
    'filet mignon': { status: 'modifiable', mods: ['NO steak butter'] },
    'horseradish crusted filet': { status: 'safe', mods: [] },
    'filet duo/trio': { status: 'safe', mods: [] },
    'filet trio/duo': { status: 'safe', mods: [] },
  };

  // Get all filet items
  const { data: items, error: fetchError } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .ilike('name', '%filet%');

  if (fetchError) {
    console.error('Error fetching filets:', fetchError);
    return;
  }

  console.log(`Found ${items?.length} filet items\n`);

  let added = 0;
  let updated = 0;

  for (const item of items || []) {
    const normalizedName = item.name.toLowerCase().trim();
    const rule = filetRules[normalizedName];

    if (!rule) {
      console.log(`⚠️  No shellfish rule for: "${item.name}"`);
      continue;
    }

    // Check if rule already exists
    const { data: existing } = await supabase
      .from('allergen_modifications')
      .select('id')
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'shellfish')
      .maybeSingle();

    if (existing) {
      // Update
      const { error: updateError } = await supabase
        .from('allergen_modifications')
        .update({
          status: rule.status,
          modifications: rule.mods,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error(`✗ Error updating "${item.name}":`, updateError);
      } else {
        console.log(`✓ Updated: "${item.name}" → ${rule.status} (${rule.mods.join(', ') || 'no changes'})`);
        updated++;
      }
    } else {
      // Create
      const { error: insertError } = await supabase
        .from('allergen_modifications')
        .insert({
          tenant_id: TENANT_ID,
          menu_item_id: item.id,
          dish_name: item.name,
          category: 'Filets',
          allergen: 'shellfish',
          status: rule.status,
          modifications: rule.mods,
        });

      if (insertError) {
        console.error(`✗ Error creating "${item.name}":`, insertError);
      } else {
        console.log(`✓ Created: "${item.name}" → ${rule.status} (${rule.mods.join(', ') || 'no changes'})`);
        added++;
      }
    }
  }

  console.log(`\n✅ Complete!`);
  console.log(`  Added: ${added}`);
  console.log(`  Updated: ${updated}`);
}

addFiletRules().catch(console.error);
