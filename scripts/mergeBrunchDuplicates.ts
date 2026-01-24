/**
 * Merge additional brunch duplicates based on allergy sheet verification
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

async function mergeDuplicates() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔄 Merging additional brunch duplicates...\n');

  // Merge 1: Avocado Toast + Avocado Toast and Eggs → Avocado Toast
  console.log('1. Merging Avocado Toast variants...');
  const { data: avocadoToast } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .eq('name', 'Avocado Toast')
    .maybeSingle();

  const { data: avocadoToastEggs } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .eq('name', 'Avocado Toast and Eggs')
    .maybeSingle();

  if (avocadoToast && avocadoToastEggs) {
    // Move allergen rules
    const { data: eggsMods } = await supabase
      .from('allergen_modifications')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', avocadoToastEggs.id);

    const { data: toastMods } = await supabase
      .from('allergen_modifications')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', avocadoToast.id);

    if (eggsMods && eggsMods.length > 0) {
      for (const mod of eggsMods) {
        const existingMod = toastMods?.find(m => m.allergen === mod.allergen);
        if (existingMod) {
          console.log(`   ✓ ${mod.allergen}: already exists on "Avocado Toast"`);
          await supabase.from('allergen_modifications').delete().eq('id', mod.id);
        } else {
          console.log(`   ⇒ ${mod.allergen}: moving to "Avocado Toast"`);
          await supabase
            .from('allergen_modifications')
            .update({
              menu_item_id: avocadoToast.id,
              dish_name: avocadoToast.name,
            })
            .eq('id', mod.id);
        }
      }
    }

    // Delete duplicate
    await supabase.from('menu_items').delete().eq('id', avocadoToastEggs.id);
    console.log('   ✓ Deleted "Avocado Toast and Eggs"');
  } else {
    console.log('   ⚠️  Items not found or already merged');
  }

  // Merge 2: Skirt Steak and Eggs + Southwestern Steak and Eggs → Southwestern Steak and Eggs
  console.log('\n2. Merging Skirt Steak variants...');
  const { data: southwestern } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .eq('name', 'Southwestern Steak and Eggs')
    .maybeSingle();

  const { data: skirt } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .eq('name', 'Skirt Steak and Eggs')
    .maybeSingle();

  if (southwestern && skirt) {
    // Move allergen rules
    const { data: skirtMods } = await supabase
      .from('allergen_modifications')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', skirt.id);

    const { data: southwesternMods } = await supabase
      .from('allergen_modifications')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .eq('menu_item_id', southwestern.id);

    if (skirtMods && skirtMods.length > 0) {
      for (const mod of skirtMods) {
        const existingMod = southwesternMods?.find(m => m.allergen === mod.allergen);
        if (existingMod) {
          console.log(`   ✓ ${mod.allergen}: already exists on "Southwestern Steak and Eggs"`);
          await supabase.from('allergen_modifications').delete().eq('id', mod.id);
        } else {
          console.log(`   ⇒ ${mod.allergen}: moving to "Southwestern Steak and Eggs"`);
          await supabase
            .from('allergen_modifications')
            .update({
              menu_item_id: southwestern.id,
              dish_name: southwestern.name,
            })
            .eq('id', mod.id);
        }
      }
    }

    // Delete duplicate
    await supabase.from('menu_items').delete().eq('id', skirt.id);
    console.log('   ✓ Deleted "Skirt Steak and Eggs"');
  } else {
    console.log('   ⚠️  Items not found or already merged');
  }

  // Summary
  const { data: finalBrunch } = await supabase
    .from('menu_items')
    .select('name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Brunch')
    .order('name');

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Merge complete!`);
  console.log(`\n📋 Final Brunch items (${finalBrunch?.length || 0}):\n`);
  finalBrunch?.forEach(item => console.log(`   - ${item.name}`));
  console.log('='.repeat(60));
}

mergeDuplicates().catch(console.error);
