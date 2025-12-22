import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CSVRow {
  [key: string]: string;
}

function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Handle CSV with quoted fields that may contain commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = j < line.length - 1 ? line[j + 1] : '';
      
      if (char === '"') {
        // Check for escaped quote (double quote)
        if (nextChar === '"' && inQuotes) {
          current += '"';
          j++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    // Ensure we have enough values (pad with empty strings if needed)
    while (values.length < headers.length) {
      values.push('');
    }

    const row: CSVRow = {};
    headers.forEach((header, index) => {
      // Remove surrounding quotes if present
      let value = (values[index] || '').trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      // Replace escaped quotes
      value = value.replace(/""/g, '"');
      row[header] = value;
    });
    rows.push(row);
  }

  return rows;
}

function convertToMenuItem(row: CSVRow): any {
  return {
    id: row.id || '',
    dish_name: row.dish_name || '',
    ticket_code: row.ticket_code || '',
    category: row.category || '',
    menu: row.menu || '',
    description: row.description || '',
    allergy_raw: row.allergy_raw || '',
    contains_dairy: row.contains_dairy === 'Y' ? 'Y' : row.contains_dairy === 'N' ? 'N' : null,
    contains_egg: row.contains_egg === 'Y' ? 'Y' : row.contains_egg === 'N' ? 'N' : null,
    contains_gluten: row.contains_gluten === 'Y' ? 'Y' : row.contains_gluten === 'N' ? 'N' : null,
    contains_shellfish: row.contains_shellfish === 'Y' ? 'Y' : row.contains_shellfish === 'N' ? 'N' : null,
    contains_fish: row.contains_fish === 'Y' ? 'Y' : row.contains_fish === 'N' ? 'N' : null,
    contains_soy: row.contains_soy === 'Y' ? 'Y' : row.contains_soy === 'N' ? 'N' : null,
    contains_nuts: row.contains_nuts === 'Y' ? 'Y' : row.contains_nuts === 'N' ? 'N' : null,
    contains_sesame: row.contains_sesame === 'Y' ? 'Y' : row.contains_sesame === 'N' ? 'N' : null,
    contains_msg: row.contains_msg === 'Y' ? 'Y' : row.contains_msg === 'N' ? 'N' : null,
    contains_peanuts: row.contains_peanuts === 'Y' ? 'Y' : row.contains_peanuts === 'N' ? 'N' : null,
    contains_tree_nuts: row.contains_tree_nuts === 'Y' ? 'Y' : row.contains_tree_nuts === 'N' ? 'N' : null,
    notes: row.notes || '',
    mod_notes: row.mod_notes || '',
    cannot_be_made_safe_notes: row.cannot_be_made_safe_notes || '',
  };
}

const csvPath = path.join(__dirname, '..', 'wildfire_menu_allergens.csv');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'menu-items.ts');

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const rows = parseCSV(csvContent);
const menuItems = rows.map(convertToMenuItem).filter((item) => item.id && item.dish_name);

const output = `// This file is auto-generated from wildfire_menu_allergens.csv
// Run: npm run generate-menu-data

import type { MenuItem } from '../types';

export const menuItems: MenuItem[] = ${JSON.stringify(menuItems, null, 2)} as MenuItem[];
`;

// Ensure the output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, output, 'utf-8');
console.log(`Generated ${menuItems.length} menu items in ${outputPath}`);

