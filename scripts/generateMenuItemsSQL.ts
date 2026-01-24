/**
 * Generate SQL to populate menu_items table from menu-items.ts
 */

import { menuItems } from '../src/data/menu-items';
import * as fs from 'fs';
import * as path from 'path';

const TENANT_ID = '63c69ee3-0167-4799-8986-09df2824ab93';

// Bad categories to filter out
const BAD_CATEGORIES = [
  'Glossary',
  'Salad Station', 
  'Food Allergens Menu',
  'Pepper.',
  'Sauces:',
  'Salads:  Caesar',
  'Salads: Field Green',
  'Salads: Tuscan Kale And Spinach',
  'Salads: Greek',
  'Salads: Steak And Blue Cheese',
  'Salads: Wildfire Chopped',
  'All Bbq Dishes Must Be Accompanied By A Bone Bowl',
  'Ground Pepper .',
  'Items Not On The Menu (Secret Menu):',
  'Offer Fresh Ground Pepper.',
];

// Category remapping for consistency
const CATEGORY_FIXES: Record<string, string> = {
  'Appetizer': 'Appetizers',
  "Kid's Menu": 'Kids Menu',
  'Kids Menu': 'Kids Menu',
  'Steaks And Chops': 'Steaks and Chops',
  'Filet Mignon': 'Filets',
  'Sandwiches': 'Sandwiches: Prime Burgers',
  'Lunch Sandwiches': 'Sandwiches: Signatures',
  'Fresh Seafood': 'Fresh Fish and Seafood',
  'Fresh Fish And Seafood': 'Fresh Fish and Seafood',
  'Chicken And Barbecue': 'Chicken and Barbecue',
  'Nightly Specials': 'Nightly Specials',
  'Special Party Items': 'Special Party Items',
  'Special Party Items  And Happy Hour :': 'Special Party Items',
  'Roasted Prime Rib  Of Beef Au Jus': 'Prime Rib',
};

// Escape single quotes for SQL
function escapeSQL(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// Filter valid items
const validItems = menuItems.filter((item: any) => {
  // Skip bad categories
  if (BAD_CATEGORIES.includes(item.category)) return false;
  // Skip price headers
  if (item.dish_name === 'ITEM') return false;
  // Skip ingredient definitions (all caps with colons)
  if (item.dish_name.includes(':') && item.dish_name === item.dish_name.toUpperCase()) return false;
  return true;
});

console.log(`Found ${validItems.length} valid menu items`);

// Build SQL
let sql = `-- ============================================================================
-- MENU ITEMS DATA
-- Generated from menu-items.ts
-- Run this AFTER 003_menu_items_table.sql
-- ============================================================================

-- Clear existing menu items for this tenant
DELETE FROM menu_items WHERE tenant_id = '${TENANT_ID}';

-- Insert all menu items
INSERT INTO menu_items (tenant_id, name, category, description, display_order) VALUES
`;

const values: string[] = [];

validItems.forEach((item: any, index: number) => {
  const name = escapeSQL(item.dish_name);
  const rawCategory = item.category;
  const category = escapeSQL(CATEGORY_FIXES[rawCategory] || rawCategory);
  const description = escapeSQL(item.description?.substring(0, 500) || '');
  
  values.push(`('${TENANT_ID}', '${name}', '${category}', '${description}', ${index})`);
});

sql += values.join(',\n');
sql += `

ON CONFLICT (tenant_id, name) DO UPDATE 
SET category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- Verification
SELECT 'Menu items loaded:' as status, count(*) as count 
FROM menu_items 
WHERE tenant_id = '${TENANT_ID}';

-- Show categories
SELECT category, count(*) as items 
FROM menu_items 
WHERE tenant_id = '${TENANT_ID}'
GROUP BY category 
ORDER BY category;
`;

// Write to file
const outPath = path.join(process.cwd(), 'supabase/migrations/012_menu_items_data.sql');
fs.writeFileSync(outPath, sql);
console.log(`\n✅ SQL written to: ${outPath}`);

// Show categories found
const categories = [...new Set(validItems.map((i: any) => CATEGORY_FIXES[i.category] || i.category))];
console.log(`\nCategories (${categories.length}):`);
categories.sort().forEach(c => console.log(`  - ${c}`));
