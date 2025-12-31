import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CSVRow {
  [key: string]: string;
}

// Parse CSV
function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = j < line.length - 1 ? line[j + 1] : '';
      
      if (char === '"') {
        if (nextChar === '"' && inQuotes) {
          current += '"';
          j++;
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

    while (values.length < headers.length) {
      values.push('');
    }

    const row: CSVRow = {};
    headers.forEach((header, index) => {
      let value = (values[index] || '').trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      value = value.replace(/""/g, '"');
      row[header] = value;
    });
    rows.push(row);
  }

  return rows;
}

// Allergen patterns
const allergenPatterns = {
  gluten: [
    /\bflour\b/gi,
    /\bbread\b/gi,
    /\bbreadcrumb\w*\b/gi,
    /\bcrouton\w*\b/gi,
    /\bpasta\b/gi,
    /\bnoodle\w*\b/gi,
    /\bbun\w*\b/gi,
    /\bflatbread\b/gi,
    /\bpuff pastry\b/gi,
    /\bpie crust\b/gi,
    /\bgraham cracker\w*\b/gi,
    /\bmacaroni\b/gi,
    /\bbreading\b/gi,
    /\bbatter\b/gi,
    /\bcracker\w*\b/gi,
    /\bwheat\b/gi,
    /\bmulti-grain\b/gi,
    /\bmulti grain\b/gi,
  ],
  soy: [
    /\bsoy\b/gi,
    /\bsoybean\w*\b/gi,
    /\bsoy sauce\b/gi,
    /\btamari\b/gi,
    /\bmiso\b/gi,
    /\btofu\b/gi,
    /\bteriyaki\b/gi,
  ],
  sesame: [
    /\bsesame\b/gi,
    /\bsesame seed\w*\b/gi,
    /\bsesame oil\b/gi,
    /\bsesame seed bun\b/gi,
  ],
  fish: [
    /\banchovy\w*\b/gi,
    /\banchovy paste\b/gi,
    /\bfish sauce\b/gi,
    /\bworcestershire\b/gi,
  ],
};

function checkAllergenInDescription(description: string, allergen: keyof typeof allergenPatterns): boolean {
  const patterns = allergenPatterns[allergen];
  return patterns.some(pattern => pattern.test(description));
}

// Write CSV
function writeCSV(rows: CSVRow[], headers: string[]): string {
  const lines: string[] = [headers.join(',')];
  
  rows.forEach(row => {
    const values = headers.map(header => {
      let value = row[header] || '';
      // Escape values that contain commas, quotes, or newlines
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      return value;
    });
    lines.push(values.join(','));
  });
  
  return lines.join('\n');
}

const csvPath = path.join(__dirname, '..', 'wildfire_menu_allergens.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',').map((h) => h.trim());
const rows = parseCSV(csvContent);

console.log('Fixing allergen data...\n');

let fixedCount = 0;

rows.forEach((row, index) => {
  const description = row.description || '';
  if (!description || !row.dish_name || row.dish_name === 'ITEM') {
    return;
  }

  const fixes: string[] = [];

  // Fix gluten
  const hasGluten = checkAllergenInDescription(description, 'gluten');
  if (hasGluten && row.contains_gluten !== 'Y') {
    row.contains_gluten = 'Y';
    fixes.push('gluten');
    fixedCount++;
  }

  // Fix soy
  const hasSoy = checkAllergenInDescription(description, 'soy');
  if (hasSoy && row.contains_soy !== 'Y') {
    row.contains_soy = 'Y';
    fixes.push('soy');
    fixedCount++;
  }

  // Fix sesame
  const hasSesame = checkAllergenInDescription(description, 'sesame');
  if (hasSesame && row.contains_sesame !== 'Y') {
    row.contains_sesame = 'Y';
    fixes.push('sesame');
    fixedCount++;
  }

  // Fix fish
  const hasFish = checkAllergenInDescription(description, 'fish');
  if (hasFish && row.contains_fish !== 'Y') {
    row.contains_fish = 'Y';
    fixes.push('fish');
    fixedCount++;
  }

  if (fixes.length > 0) {
    console.log(`Fixed ${row.dish_name}: ${fixes.join(', ')}`);
  }
});

// Write updated CSV
const updatedCSV = writeCSV(rows, headers);
fs.writeFileSync(csvPath, updatedCSV, 'utf-8');

console.log(`\n✅ Fixed ${fixedCount} allergen flags in CSV file.`);
console.log('Run "npm run generate-menu-data" to update the menu items data.');




