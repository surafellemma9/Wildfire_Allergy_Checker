/**
 * Verify brunch configuration after deduplication and setup
 * Checks for duplicates, proper entrée/side configuration, and data integrity
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

async function verifyBrunch() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔍 Verifying brunch configuration...\n');

  let hasErrors = false;

  // 1. Check for duplicates
  console.log('1️⃣ Checking for duplicate items...');
  const { data: brunchItems } = await supabase
    .from('menu_items')
    .select('name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Brunch');

  const names = brunchItems?.map(i => i.name) || [];
  const duplicates = names.filter((name, idx) => names.indexOf(name) !== idx);

  if (duplicates.length > 0) {
    console.error('   ❌ Found duplicates:', duplicates);
    hasErrors = true;
  } else {
    console.log('   ✓ No duplicates found');
  }

  // 2. Check entrées have sides configured
  console.log('\n2️⃣ Checking entrée configuration...');
  const { data: entrees } = await supabase
    .from('menu_items')
    .select('name, side_ids')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Brunch')
    .eq('is_entree', true);

  const entreesWithoutSides = entrees?.filter(e => !e.side_ids || e.side_ids.length === 0) || [];
  if (entreesWithoutSides.length > 0) {
    console.warn('   ⚠️  Entrées without sides:', entreesWithoutSides.map(e => e.name));
    hasErrors = true;
  } else {
    console.log(`   ✓ All ${entrees?.length} entrées have sides configured`);
  }

  // 3. Check sides marked correctly
  console.log('\n3️⃣ Checking side configuration...');
  const { data: sides } = await supabase
    .from('menu_items')
    .select('name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Brunch')
    .eq('is_side_only', true);

  console.log(`   ✓ ${sides?.length} sides marked as side-only`);
  sides?.forEach(side => console.log(`      - ${side.name}`));

  // 4. Check for items that are neither entrée nor side
  console.log('\n4️⃣ Checking for orphaned items...');
  const { data: orphans } = await supabase
    .from('menu_items')
    .select('name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Brunch')
    .is('is_entree', null)
    .is('is_side_only', null);

  if (orphans && orphans.length > 0) {
    console.warn('   ⚠️  Items that are neither entrée nor side:');
    orphans.forEach(item => console.log(`      - ${item.name}`));
  } else {
    console.log('   ✓ No orphaned items');
  }

  // 5. Verify allergen coverage
  console.log('\n5️⃣ Checking allergen rule coverage...');
  const { data: allBrunchItems } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Brunch');

  let itemsWithoutRules = 0;
  for (const item of allBrunchItems || []) {
    const { data: rules } = await supabase
      .from('allergen_modifications')
      .select('id')
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', item.id);

    if (!rules || rules.length === 0) {
      console.warn(`      ⚠️  No allergen rules: ${item.name}`);
      itemsWithoutRules++;
    }
  }

  if (itemsWithoutRules === 0) {
    console.log('   ✓ All items have allergen rules');
  } else {
    console.warn(`   ⚠️  ${itemsWithoutRules} items without allergen rules`);
  }

  // 6. Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Total brunch items: ${brunchItems?.length}`);
  console.log(`   Entrées: ${entrees?.length}`);
  console.log(`   Sides: ${sides?.length}`);
  console.log(`   Expected: ~26 items (20 entrées + 6 sides)`);

  if (!hasErrors) {
    console.log('\n✅ Verification complete - no critical errors!');
  } else {
    console.log('\n⚠️  Verification complete with warnings/errors');
  }
  console.log('='.repeat(60));
}

verifyBrunch().catch(console.error);
