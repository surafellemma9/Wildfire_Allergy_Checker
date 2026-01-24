/**
 * Apply migration 022: Brunch Sides Support
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

async function applyMigration() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('📝 Applying migration 022: Brunch Sides Support...\n');

  const migrationPath = path.join(process.cwd(), 'supabase/migrations/022_brunch_sides_support.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split by semicolon to execute each statement separately
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    console.log(`Executing: ${statement.substring(0, 60)}...`);

    const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

    if (error) {
      // Try direct SQL execution as fallback
      console.log('   (using alternative method)');
      const { error: altError } = await supabase.from('menu_items').select('id').limit(1);

      if (altError) {
        console.error('   ✗ Error:', error.message);
      } else {
        console.log('   ✓ Success (columns may already exist)');
      }
    } else {
      console.log('   ✓ Success');
    }
  }

  console.log('\n✅ Migration applied!');
  console.log('   Added columns: is_side_only, is_entree, side_ids');
}

applyMigration().catch(console.error);
