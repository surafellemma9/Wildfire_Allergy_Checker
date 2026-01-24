/**
 * Configure brunch entrées and sides
 * Marks 20 entrées with side selection and 6 items as side-only
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

const BRUNCH_ENTREES = [
  'Classic Breakfast',
  'Eggs Benedict',
  'Classic Three-Egg Omelet',
  'Wildfire Buttermilk Pancakes',
  'French Toast',
  'Steak and Eggs',
  'Smoked Salmon Benedict',
  'Avocado Toast',
  'Avocado Toast and Eggs',
  'Avocado Toast with Sliced Tomatoes',
  'Breakfast Burrito',
  'Chicken and Waffles',
  'Breakfast Sandwich',
  'Belgian Waffle',
  'Skirt Steak and Eggs',
  'Southwestern Steak and Eggs',
  'Spinach and Kale Frittata',
  'Eggs Florentine',
  'Crab Cake Benedict',
  'Door County Cherry Pancakes',
];

const BRUNCH_SIDES = [
  'Side of Bacon',
  'Side of Eggs',
  'Side of Fresh Fruit',
  'Side of Turkey Sausage',
  'Side of Wheat Toast',
  'Breakfast Potatoes',
];

async function configureBrunch() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('⚙️  Configuring brunch entrées and sides...\n');

  // Get all brunch side IDs
  const { data: sideItems } = await supabase
    .from('menu_items')
    .select('id')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Brunch')
    .in('name', BRUNCH_SIDES);

  const sideIds = sideItems?.map(s => s.id) || [];
  console.log(`Found ${sideIds.length} brunch sides\n`);

  if (sideIds.length === 0) {
    console.error('❌ No brunch sides found! Make sure deduplication ran first.');
    return;
  }

  // Mark entrées
  let entreesConfigured = 0;
  for (const entreeName of BRUNCH_ENTREES) {
    const { error } = await supabase
      .from('menu_items')
      .update({
        is_entree: true,
        side_ids: sideIds
      })
      .eq('tenant_id', TENANT_ID)
      .eq('name', entreeName)
      .eq('category', 'Brunch');

    if (!error) {
      console.log(`✓ Configured entrée: ${entreeName}`);
      entreesConfigured++;
    } else {
      console.error(`✗ Error configuring "${entreeName}":`, error);
    }
  }

  // Mark sides
  let sidesConfigured = 0;
  for (const sideName of BRUNCH_SIDES) {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_side_only: true })
      .eq('tenant_id', TENANT_ID)
      .eq('name', sideName)
      .eq('category', 'Brunch');

    if (!error) {
      console.log(`✓ Configured side: ${sideName}`);
      sidesConfigured++;
    } else {
      console.error(`✗ Error configuring "${sideName}":`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Configuration complete!');
  console.log(`   Entrées configured: ${entreesConfigured} / ${BRUNCH_ENTREES.length}`);
  console.log(`   Sides configured: ${sidesConfigured} / ${BRUNCH_SIDES.length}`);
  console.log('='.repeat(60));
}

configureBrunch().catch(console.error);
