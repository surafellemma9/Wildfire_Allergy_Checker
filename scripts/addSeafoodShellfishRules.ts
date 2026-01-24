/**
 * Add shellfish allergen rules for all seafood items
 * Based on Fresh Fish and Seafood allergy sheet
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODUzNCwiZXhwIjoyMDg0NjA0NTM0fQ.5jwKZKzqAirNGzjnP8wbf-1vfinlxTw9B9KuS6QbqZ8';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

interface SeafoodRule {
  name: string;
  status: 'safe' | 'modifiable' | 'unsafe';
  modifications?: string[];
  notes?: string;
}

// Rules from the shellfish allergy sheet
const seafoodRules: SeafoodRule[] = [
  {
    name: 'Cedar Planked Salmon',
    status: 'safe',
    notes: 'No changes needed'
  },
  {
    name: 'Macadamia Crusted Halibut',
    status: 'modifiable',
    modifications: ['NO lemon butter sauce'],
    notes: 'Can be made safe without lemon butter sauce'
  },
  {
    name: 'Coconut Shrimp',
    status: 'unsafe',
    notes: 'Contains shrimp - cannot be modified for shellfish allergy'
  },
  {
    name: 'Scallops de Jonghe',
    status: 'unsafe',
    notes: 'Contains scallops - cannot be modified for shellfish allergy'
  },
  {
    name: 'Crab Cake Entree',
    status: 'unsafe',
    notes: 'Contains crab - cannot be modified for shellfish allergy'
  },
  {
    name: 'Lump Crab Cakes',
    status: 'unsafe',
    notes: 'Contains crab - cannot be modified for shellfish allergy'
  },
  {
    name: 'Halibut',
    status: 'unsafe',
    notes: 'Contains shellfish ingredients - cannot be modified'
  }
];

async function addSeafoodShellfishRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('Adding shellfish allergen rules for seafood items...\n');

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const rule of seafoodRules) {
    console.log(`\nProcessing: ${rule.name}`);

    // Find the menu item
    const { data: menuItem, error: itemError } = await supabase
      .from('menu_items')
      .select('id, name, category')
      .eq('tenant_id', TENANT_ID)
      .eq('name', rule.name)
      .maybeSingle();

    if (itemError) {
      console.error(`  ✗ Error finding item:`, itemError);
      continue;
    }

    if (!menuItem) {
      console.log(`  ⚠️  Item not found in database`);
      skippedCount++;
      continue;
    }

    console.log(`  Found: ${menuItem.name} (category: ${menuItem.category})`);

    // Check if shellfish rule already exists
    const { data: existingRule, error: checkError } = await supabase
      .from('allergen_modifications')
      .select('id')
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', menuItem.id)
      .eq('allergen', 'shellfish')
      .maybeSingle();

    if (checkError) {
      console.error(`  ✗ Error checking existing rule:`, checkError);
      continue;
    }

    const ruleData = {
      tenant_id: TENANT_ID,
      menu_item_id: menuItem.id,
      dish_name: menuItem.name,
      allergen: 'shellfish',
      category: menuItem.category,
      status: rule.status,
      modifications: rule.modifications || [],
      notes: rule.notes || '',
    };

    if (existingRule) {
      // Update existing rule
      const { error: updateError } = await supabase
        .from('allergen_modifications')
        .update(ruleData)
        .eq('id', existingRule.id);

      if (updateError) {
        console.error(`  ✗ Error updating rule:`, updateError);
      } else {
        console.log(`  ✓ Updated shellfish rule: ${rule.status.toUpperCase()}`);
        if (rule.modifications) {
          rule.modifications.forEach(mod => console.log(`    - ${mod}`));
        }
        updatedCount++;
      }
    } else {
      // Insert new rule
      const { error: insertError } = await supabase
        .from('allergen_modifications')
        .insert([ruleData]);

      if (insertError) {
        console.error(`  ✗ Error inserting rule:`, insertError);
      } else {
        console.log(`  ✓ Added shellfish rule: ${rule.status.toUpperCase()}`);
        if (rule.modifications) {
          rule.modifications.forEach(mod => console.log(`    - ${mod}`));
        }
        addedCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Shellfish rules update complete!');
  console.log(`   Added: ${addedCount} new rules`);
  console.log(`   Updated: ${updatedCount} existing rules`);
  console.log(`   Skipped: ${skippedCount} (not found)`);
  console.log('='.repeat(50));

  // Verify final state
  console.log('\n📋 Final Seafood Shellfish Rules:\n');

  const { data: finalItems } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Seafood')
    .order('name');

  if (finalItems) {
    for (const item of finalItems) {
      const { data: rule } = await supabase
        .from('allergen_modifications')
        .select('status, modifications')
        .eq('tenant_id', TENANT_ID)
        .eq('menu_item_id', item.id)
        .eq('allergen', 'shellfish')
        .maybeSingle();

      if (rule) {
        const statusEmoji = rule.status === 'safe' ? '✓' :
                           rule.status === 'modifiable' ? '⚠️' : '✗';
        console.log(`${statusEmoji} ${item.name}: ${rule.status.toUpperCase()}`);
        if (rule.modifications && rule.modifications.length > 0) {
          rule.modifications.forEach((mod: string) => console.log(`     - ${mod}`));
        }
      } else {
        console.log(`❌ ${item.name}: NO SHELLFISH RULE`);
      }
    }
  }
}

addSeafoodShellfishRules().catch(console.error);
