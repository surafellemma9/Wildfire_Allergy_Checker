/**
 * Configure brunch entrées and sides using direct SQL
 * Bypasses PostgREST API to avoid schema cache issues
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const TENANT_ID = process.env.TENANT_ID || '63c69ee3-0167-4799-8986-09df2824ab93';

const BRUNCH_ENTREES = [
  'Classic Breakfast',
  'Eggs Benedict',
  'Buttermilk Pancakes', // Updated name
  'French Toast',
  'Smoked Salmon Benedict',
  'Avocado Toast',
  'Avocado Toast and Eggs',
  'Avocado Toast with Sliced Tomatoes',
  'Breakfast Burrito',
  'Skirt Steak and Eggs',
  'Southwestern Steak and Eggs',
  'Spinach and Kale Frittata',
  'Eggs Florentine',
  'Crab Cake Benedict',
  'Door County Cherry Pancakes',
  'Kids Buttermilk Pancakes',
  'Kids Chocolate Chip Pancakes',
  'Kids French Toast',
  'Kids Scramble',
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

  console.log('⚙️  Configuring brunch entrées and sides (using direct SQL)...\n');

  // Get side IDs first
  const { data: sideItems } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', TENANT_ID)
    .eq('category', 'Brunch')
    .in('name', BRUNCH_SIDES);

  const sideIds = sideItems?.map(s => s.id) || [];
  const sideIdsJson = JSON.stringify(sideIds);

  console.log(`Found ${sideIds.length} brunch sides\n`);

  if (sideIds.length === 0) {
    console.error('❌ No brunch sides found!');
    return;
  }

  // Configure entrées using raw SQL
  console.log('Configuring entrées...');
  for (const entreeName of BRUNCH_ENTREES) {
    const sql = `
      UPDATE menu_items
      SET is_entree = true,
          side_ids = '${sideIdsJson}'::jsonb
      WHERE tenant_id = '${TENANT_ID}'
        AND name = '${entreeName.replace(/'/g, "''")}'
        AND category = 'Brunch'
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.log(`   ✗ ${entreeName}: ${error.message}`);
    } else {
      console.log(`   ✓ ${entreeName}`);
    }
  }

  // Configure sides using raw SQL
  console.log('\nConfiguring sides...');
  for (const sideName of BRUNCH_SIDES) {
    const sql = `
      UPDATE menu_items
      SET is_side_only = true
      WHERE tenant_id = '${TENANT_ID}'
        AND name = '${sideName.replace(/'/g, "''")}'
        AND category = 'Brunch'
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.log(`   ✗ ${sideName}: ${error.message}`);
    } else {
      console.log(`   ✓ ${sideName}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Configuration complete!');
  console.log('='.repeat(60));
}

configureBrunch().catch(console.error);
