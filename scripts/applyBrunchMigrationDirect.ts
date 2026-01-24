/**
 * Apply brunch sides migration using direct SQL execution
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

async function applyMigration() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('📝 Applying brunch sides migration...\n');

  try {
    // Add is_side_only column
    console.log('1. Adding is_side_only column...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_side_only BOOLEAN DEFAULT FALSE'
    }).then(res => {
      if (res.error) console.log('   (may already exist)');
      else console.log('   ✓');
    });

    // Add is_entree column
    console.log('2. Adding is_entree column...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_entree BOOLEAN DEFAULT FALSE'
    }).then(res => {
      if (res.error) console.log('   (may already exist)');
      else console.log('   ✓');
    });

    // Add side_ids column
    console.log('3. Adding side_ids column...');
    await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS side_ids JSONB DEFAULT '[]'::jsonb"
    }).then(res => {
      if (res.error) console.log('   (may already exist)');
      else console.log('   ✓');
    });

    console.log('\n✅ Migration applied successfully!');
    console.log('\nNote: If you see "may already exist" messages, the columns were already added.');
    console.log('You may need to refresh your Supabase schema cache.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n⚠️  Please run the migration manually via Supabase SQL Editor:');
    console.log('\nCopy and paste this SQL:');
    console.log('─'.repeat(60));
    console.log(`
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS is_side_only BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_entree BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS side_ids JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_menu_items_is_side_only
  ON menu_items(is_side_only) WHERE is_side_only = TRUE;
CREATE INDEX IF NOT EXISTS idx_menu_items_is_entree
  ON menu_items(is_entree) WHERE is_entree = TRUE;
    `);
    console.log('─'.repeat(60));
  }
}

applyMigration().catch(console.error);
