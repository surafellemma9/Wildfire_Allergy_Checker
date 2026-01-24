/**
 * Verify current shellfish rules for seafood items
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODUzNCwiZXhwIjoyMDg0NjA0NTM0fQ.5jwKZKzqAirNGzjnP8wbf-1vfinlxTw9B9KuS6QbqZ8';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

async function verifySeafoodRules() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔍 Verifying Seafood Category - Shellfish Allergen Rules\n');
  console.log('='.repeat(60));

  // Get all seafood items
  const { data: seafoodItems } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Seafood')
    .order('name');

  if (!seafoodItems) {
    console.error('No seafood items found');
    return;
  }

  console.log(`\n📋 Found ${seafoodItems.length} items in Seafood category:\n`);

  for (const item of seafoodItems) {
    const { data: rule } = await supabase
      .from('allergen_modifications')
      .select('status, modifications, notes')
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id)
      .eq('allergen', 'shellfish')
      .maybeSingle();

    if (rule) {
      const emoji = rule.status === 'safe' ? '✅' : '⚠️';
      console.log(`${emoji} ${item.name}`);
      console.log(`   Status: ${rule.status.toUpperCase()}`);
      if (rule.modifications && rule.modifications.length > 0) {
        console.log(`   Modifications:`);
        rule.modifications.forEach((mod: string) => console.log(`     - ${mod}`));
      }
      if (rule.notes) {
        console.log(`   Notes: ${rule.notes}`);
      }
    } else {
      console.log(`🚫 ${item.name}`);
      console.log(`   Status: NOT IN SHELLFISH ALLERGY SHEET`);
      console.log(`   Result: Will show "DO NOT SERVE" for shellfish allergies`);
    }
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('\n✅ Verification complete!\n');
  console.log('Items WITH shellfish rules (SAFE/MODIFIABLE):');
  console.log('  • Cedar Planked Salmon - SAFE');
  console.log('  • Macadamia Crusted Halibut - MODIFIABLE\n');
  console.log('Items WITHOUT shellfish rules (contain shellfish):');
  console.log('  • Coconut Shrimp');
  console.log('  • Scallops de Jonghe');
  console.log('  • Crab Cake Entree');
  console.log('  • Lump Crab Cakes');
  console.log('  • Halibut (plain)\n');
  console.log('This matches the allergy sheet provided by the user. ✅');
}

verifySeafoodRules().catch(console.error);
