/**
 * Test script to check shellfish allergy data in Supabase
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyhnughuucoiolcuetrw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5aG51Z2h1dWNvaW9sY3VldHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjg1MzQsImV4cCI6MjA4NDYwNDUzNH0.ZA1gIp4euqZ7cs7ljhOqKBFBAQWefipJRyNjEHHyqFU';
const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

async function testShellfishData() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('Testing shellfish allergy data in Supabase...\n');

  // Count total shellfish modifications
  const { data: allMods, error: countError } = await supabase
    .from('allergen_modifications')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .eq('allergen', 'shellfish');

  if (countError) {
    console.error('Error fetching shellfish data:', countError);
    return;
  }

  console.log(`Total shellfish modifications in database: ${allMods?.length || 0}`);

  // Group by status
  const statusCounts: Record<string, number> = {};
  allMods?.forEach(mod => {
    statusCounts[mod.status] = (statusCounts[mod.status] || 0) + 1;
  });

  console.log('\nStatus distribution:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  // Show sample safe items
  console.log('\nSample SAFE shellfish items:');
  allMods?.filter(m => m.status === 'safe').slice(0, 5).forEach(mod => {
    console.log(`  - ${mod.dish_name}`);
  });

  // Show sample modifiable items
  console.log('\nSample MODIFIABLE shellfish items:');
  allMods?.filter(m => m.status === 'modifiable').slice(0, 5).forEach(mod => {
    console.log(`  - ${mod.dish_name}: ${mod.modifications?.join(', ') || 'none'}`);
  });

  // Check menu items table
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('name, id')
    .eq('tenant_id', TENANT_ID);

  if (menuError) {
    console.error('\nError fetching menu items:', menuError);
    return;
  }

  console.log(`\nTotal menu items in database: ${menuItems?.length || 0}`);

  // Find items in menu_items but NOT in shellfish modifications
  const modDishNames = new Set(allMods?.map(m => m.dish_name.toLowerCase()) || []);
  const missingItems = menuItems?.filter(item =>
    !modDishNames.has(item.name.toLowerCase())
  ) || [];

  console.log(`\nItems WITHOUT shellfish modifications: ${missingItems.length}`);
  console.log('\nSample items missing shellfish data:');
  missingItems.slice(0, 10).forEach(item => {
    console.log(`  - ${item.name} (ID: ${item.id})`);
  });
}

testShellfishData().catch(console.error);
