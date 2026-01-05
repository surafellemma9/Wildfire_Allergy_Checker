import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CSVRow {
  [key: string]: string;
}

// Parse CSV (same as generate-menu-data.ts)
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

// Allergen ingredient patterns
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
  egg: [
    /\begg\w*\b/gi,
    /\bmayonnaise\b/gi,
    /\bmayo\b/gi,
    /\bbéarnaise\b/gi,
    /\bhollandaise\b/gi,
  ],
  dairy: [
    /\bbutter\b/gi,
    /\bcream\b/gi,
    /\bcheese\b/gi,
    /\bmilk\b/gi,
    /\byogurt\b/gi,
    /\bsour cream\b/gi,
    /\bwhipping cream\b/gi,
    /\bhalf and half\b/gi,
    /\bbuttermilk\b/gi,
    /\bparmesan\b/gi,
    /\basiago\b/gi,
    /\bswiss\b/gi,
    /\bcheddar\b/gi,
    /\bmozzarella\b/gi,
    /\bfeta\b/gi,
    /\bblue cheese\b/gi,
    /\bgoat cheese\b/gi,
  ],
};

function checkAllergenInDescription(description: string, allergen: keyof typeof allergenPatterns): boolean {
  const patterns = allergenPatterns[allergen];
  return patterns.some(pattern => pattern.test(description));
}

function validateRow(row: CSVRow): string[] {
  const issues: string[] = [];
  const description = (row.description || '').toLowerCase();
  
  if (!description || !row.dish_name || row.dish_name === 'ITEM') {
    return issues;
  }

  // Check gluten
  const hasGluten = checkAllergenInDescription(row.description || '', 'gluten');
  const markedGluten = row.contains_gluten === 'Y';
  if (hasGluten && !markedGluten) {
    issues.push(`GLUTEN: Description contains gluten ingredients but marked as N`);
  }

  // Check soy
  const hasSoy = checkAllergenInDescription(row.description || '', 'soy');
  const markedSoy = row.contains_soy === 'Y';
  if (hasSoy && !markedSoy) {
    issues.push(`SOY: Description contains soy ingredients but marked as N`);
  }

  // Check sesame
  const hasSesame = checkAllergenInDescription(row.description || '', 'sesame');
  const markedSesame = row.contains_sesame === 'Y';
  if (hasSesame && !markedSesame) {
    issues.push(`SESAME: Description contains sesame ingredients but marked as N`);
  }

  // Check fish (anchovy, etc.)
  const hasFish = checkAllergenInDescription(row.description || '', 'fish');
  const markedFish = row.contains_fish === 'Y';
  if (hasFish && !markedFish) {
    issues.push(`FISH: Description contains fish ingredients but marked as N`);
  }

  return issues;
}

const csvPath = path.join(__dirname, '..', 'wildfire_menu_allergens.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const rows = parseCSV(csvContent);

console.log('Validating allergen data...\n');
console.log(`Total menu items: ${rows.length}\n`);

const issues: Array<{ dish: string; issues: string[] }> = [];

rows.forEach((row, index) => {
  const dishIssues = validateRow(row);
  if (dishIssues.length > 0) {
    issues.push({
      dish: row.dish_name || `Row ${index + 2}`,
      issues: dishIssues,
    });
  }
});

if (issues.length === 0) {
  console.log('✅ No issues found!');
} else {
  console.log(`⚠️  Found ${issues.length} items with potential issues:\n`);
  issues.forEach(({ dish, issues: dishIssues }) => {
    console.log(`\n${dish}:`);
    dishIssues.forEach(issue => console.log(`  - ${issue}`));
  });
  
  console.log(`\n\nSummary:`);
  const glutenIssues = issues.filter(i => i.issues.some(iss => iss.startsWith('GLUTEN'))).length;
  const soyIssues = issues.filter(i => i.issues.some(iss => iss.startsWith('SOY'))).length;
  const sesameIssues = issues.filter(i => i.issues.some(iss => iss.startsWith('SESAME'))).length;
  const fishIssues = issues.filter(i => i.issues.some(iss => iss.startsWith('FISH'))).length;
  
  console.log(`  Gluten: ${glutenIssues} items`);
  console.log(`  Soy: ${soyIssues} items`);
  console.log(`  Sesame: ${sesameIssues} items`);
  console.log(`  Fish: ${fishIssues} items`);
}






