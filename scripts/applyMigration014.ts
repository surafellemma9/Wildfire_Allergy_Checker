/**
 * Apply Migration 014: Add menu_item_id column to allergen_modifications
 * This enables proper foreign key linking instead of string-based matching
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

async function applyMigration() {
  console.log('🔄 Applying Migration 014: Adding menu_item_id column...\n');

  try {
    // Step 1: Add menu_item_id column
    console.log('Step 1: Adding menu_item_id column...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE allergen_modifications
        ADD COLUMN IF NOT EXISTS menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE;

        CREATE INDEX IF NOT EXISTS idx_allergen_mods_menu_item
        ON allergen_modifications(menu_item_id);
      `
    });

    if (alterError) {
      console.error('❌ Error adding column:', alterError.message);
      console.log('\n📋 Please run this SQL manually in Supabase Dashboard:');
      console.log('   Go to: https://app.supabase.com/project/YOUR_PROJECT/sql');
      console.log('\n   Run this SQL:');
      console.log(`
ALTER TABLE allergen_modifications
ADD COLUMN IF NOT EXISTS menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_allergen_mods_menu_item
ON allergen_modifications(menu_item_id);

-- Backfill menu_item_id using exact name matches
UPDATE allergen_modifications am
SET menu_item_id = mi.id
FROM menu_items mi
WHERE am.tenant_id = mi.tenant_id
  AND LOWER(TRIM(am.dish_name)) = LOWER(TRIM(mi.name))
  AND am.menu_item_id IS NULL;

-- Show results
SELECT
  'Linked rules' as status,
  COUNT(*) as count
FROM allergen_modifications
WHERE menu_item_id IS NOT NULL
  AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';

SELECT
  'Unlinked rules' as status,
  COUNT(*) as count
FROM allergen_modifications
WHERE menu_item_id IS NULL
  AND tenant_id = '63c69ee3-0167-4799-8986-09df2824ab93';
      `);
      process.exit(1);
    }

    console.log('✓ Column added successfully');

    // Step 2: Backfill menu_item_id
    console.log('\nStep 2: Backfilling menu_item_id using name matches...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE allergen_modifications am
        SET menu_item_id = mi.id
        FROM menu_items mi
        WHERE am.tenant_id = mi.tenant_id
          AND LOWER(TRIM(am.dish_name)) = LOWER(TRIM(mi.name))
          AND am.menu_item_id IS NULL;
      `
    });

    if (updateError) {
      console.error('❌ Error backfilling:', updateError.message);
      process.exit(1);
    }

    console.log('✓ Backfilled successfully');

    // Step 3: Show results
    console.log('\nStep 3: Checking results...');
    const { data: linkedCount } = await supabase
      .from('allergen_modifications')
      .select('id', { count: 'exact', head: true })
      .not('menu_item_id', 'is', null)
      .eq('tenant_id', '63c69ee3-0167-4799-8986-09df2824ab93');

    const { data: unlinkedCount } = await supabase
      .from('allergen_modifications')
      .select('id', { count: 'exact', head: true })
      .is('menu_item_id', null)
      .eq('tenant_id', '63c69ee3-0167-4799-8986-09df2824ab93');

    console.log(`\n✅ Migration 014 applied successfully!`);
    console.log(`   Linked rules: ${linkedCount}`);
    console.log(`   Unlinked rules: ${unlinkedCount}`);

    if (unlinkedCount && unlinkedCount > 0) {
      console.log('\n⚠️  Some rules remain unlinked (dish names don\'t match menu items)');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

applyMigration();
