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

/**
 * Parse ingredients from dish description
 * Extracts individual ingredients from natural language descriptions
 */
function parseIngredients(description: string): string[] {
  if (!description || !description.trim()) return [];
  
  const ingredients: Set<string> = new Set();
  let text = description;
  
  // Remove common phrases that aren't ingredients (but keep the content after them)
  text = text.replace(/OFFER FRESH GROUND PEPPER/gi, '');
  text = text.replace(/We offer both a bowl and a cup of soup/gi, '');
  text = text.replace(/Served with choice of side/gi, '');
  text = text.replace(/Served with a side of/gi, '');
  text = text.replace(/Served with/gi, '');
  text = text.replace(/Garnished with/gi, '');
  text = text.replace(/Topped with/gi, '');
  text = text.replace(/Tossed with/gi, '');
  text = text.replace(/Marinated in/gi, '');
  text = text.replace(/Brushed with/gi, '');
  text = text.replace(/Seasoned with/gi, '');
  text = text.replace(/Glazed with/gi, '');
  text = text.replace(/Drizzled with/gi, '');
  text = text.replace(/Covered with/gi, '');
  text = text.replace(/Wrapped in/gi, '');
  text = text.replace(/Baked in/gi, '');
  text = text.replace(/Fried in/gi, '');
  text = text.replace(/Griddled until/gi, '');
  text = text.replace(/Grilled to/gi, '');
  text = text.replace(/Broiled to/gi, '');
  text = text.replace(/Cooked to/gi, '');
  text = text.replace(/Roasted in the oven/gi, '');
  text = text.replace(/with cooking spray/gi, '');
  text = text.replace(/equaling about \d+ or \d+ oz\.?/gi, '');
  text = text.replace(/\d+\s+scallops?\s+each/gi, '');
  text = text.replace(/Two skewers\s+of/gi, '');
  text = text.replace(/Add .* for an additional charge/gi, '');
  text = text.replace(/\.\s*Add .*$/gi, '');
  
  // Extract parenthetical information (these often contain ingredient lists)
  text = text.replace(/\([^)]*\)/g, (match) => {
    // Extract ingredients from parentheses
    const content = match.replace(/[()]/g, '').trim();
    // Split and add if it looks like an ingredient
    content.split(',').forEach(part => {
      const ingredient = part.trim().toLowerCase();
      if (ingredient && ingredient.length > 2 && !/^(oz|count|pieces?|each|equaling|about|total|Wisconsin|portion|portions|lunch|dinner|available|request)$/i.test(ingredient)) {
        const cleaned = part.trim();
        if (cleaned.length >= 2 && cleaned.length < 50) {
          ingredients.add(cleaned);
        }
      }
    });
    return '';
  });
  
  // Split on common separators
  const separators = [
    /,\s*(?![^()]*\))/g,  // Commas not inside parentheses
    /\s+and\s+/gi,
    /\.\s+/g,
    /\s+then\s+/gi,
    /\s+and\s+then\s+/gi,
  ];
  
  let parts = [text];
  for (const separator of separators) {
    const newParts: string[] = [];
    for (const part of parts) {
      newParts.push(...part.split(separator));
    }
    parts = newParts;
  }
  
  // Process each part
  for (let part of parts) {
    part = part.trim();
    if (!part || part.length < 2) continue;
    
    // Remove common non-ingredient words at the start
    part = part.replace(/^(a|an|the|some|two|three|four|five|six|seven|eight|nine|ten)\s+/i, '');
    part = part.replace(/^(mixture of|served|garnished|topped|drizzle of|drizzled|ramekin of|cup of|bowl of|side of|choice of|your choice of)\s+/i, '');
    
    // Remove quantity/measurement patterns (but keep the ingredient after)
    part = part.replace(/\d+\s*(oz\.?|count|pieces?|each|equaling|about|total|lb\.?|lbs\.?|g|kg)\s*/gi, '');
    part = part.replace(/^\d+\s+/g, '');
    part = part.replace(/\s+\d+\s*(oz\.?|count|pieces?|each)/gi, '');
    part = part.replace(/^\d+-\d+\s+/g, ''); // Remove ranges like "5-6 oz."
    
    // Remove preparation words but keep the ingredient
    part = part.replace(/\s+(marinated|seasoned|brushed|glazed|tossed|sliced|diced|chopped|minced|grated|shredded|crumbled|toasted|grilled|broiled|baked|fried|seared|roasted|sautéed|simmered|boiled|steamed|wrapped|skewered|poached|scrambled|fried|dipped|griddled)\s+/gi, ' ');
    
    // Remove phrases that are clearly not ingredients
    part = part.replace(/\s*(roasted|baked|fried|grilled|broiled|sliced|diced|chopped|wrapped|skewered)\s+in\s+the\s+(oven|skillet|pan)/gi, '');
    part = part.replace(/\s+with\s+cooking\s+spray/gi, '');
    part = part.replace(/\s+to\s+(desired|medium|rare|well|done)/gi, '');
    part = part.replace(/\s+skewered\.?$/gi, '');
    part = part.replace(/^skewers?\s+of/gi, '');
    
    // Clean up
    part = part.trim();
    part = part.replace(/\.$/, ''); // Remove trailing period
    part = part.replace(/\s+/g, ' '); // Normalize whitespace
    
    // Skip if it's too short or is a common non-ingredient word
    if (part.length < 2) continue;
    if (/^(then|and|or|with|in|on|at|to|for|of|the|a|an|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|must|can)$/i.test(part)) continue;
    if (/^(served|garnished|topped|drizzled|covered|wrapped|baked|fried|grilled|broiled|sliced|diced|chopped|roasted|skewered)$/i.test(part)) continue;
    if (/^(medium|rare|well|done|desired|temperature|choice|side|sides|ramekin|ramekins|cup|cups|bowl|bowls|portion|portions|lunch|dinner|available|request|only|equaling|about|total|each|pieces?)$/i.test(part)) continue;
    if (/^(roasted|baked|fried|grilled|broiled)\s+in\s+the/i.test(part)) continue;
    if (/^cooking\s+spray$/i.test(part)) continue;
    if (/^skewers?\s+of/i.test(part)) continue;
    if (part.length > 80) continue; // Skip very long phrases
    
    // Add if it looks like an ingredient
    if (part.length >= 2 && part.length < 80) {
      ingredients.add(part);
    }
  }
  
    // Also extract specific ingredient patterns
    const ingredientPatterns = [
      /\b(butter|cream|cheese|milk|yogurt|sour cream|whipping cream|heavy cream|buttermilk|parmesan|asiago|swiss|cheddar|mozzarella|feta|blue cheese|goat cheese|dairy|margarine|cream cheese|ricotta|white cheddar|yellow cheddar|jalapeno jack|half and half|whole milk|skim milk)\b/gi,
      /\b(egg|eggs|egg yolk|egg white|egg whites|pasteurized egg|hard-boiled egg|mayonnaise|mayo|béarnaise|hollandaise|aioli|custard|pudding|meringue|ranch|ranch dressing|egg batter)\b/gi,
      /\b(flour|bread|breadcrumb|breadcrumbs|crouton|croutons|pasta|noodle|noodles|wheat|barley|rye|semolina|couscous|bulgur|farro|spelt|bun|buns|flatbread|puff pastry|pie crust|graham cracker|graham crackers|macaroni|elbow macaroni|gluten|breading|batter|sesame seed bun|buttery onion bun|multi-grain bread|Japanese breadcrumbs|English muffin|English muffins|brioche bread|brioche|artisan bread|Belgian waffle|waffle|waffles|toast|tortilla|flour tortilla|hash browns|hash brown)\b/gi,
    /\b(shrimp|crab|lobster|scallop|scallops|oyster|oysters|clam|clams|mussel|mussels|crayfish|crawfish|prawn|prawns|langoustine|langoustines|shellfish|shell fish|lobster base|clam juice|shrimp poaching liquid)\b/gi,
    /\b(fish|salmon|tuna|cod|halibut|trout|bass|mackerel|sardine|sardines|anchovy|anchovies|anchovy paste|fish sauce|worcestershire|worcestershire sauce)\b/gi,
    /\b(soy|soybean|soybeans|soy sauce|tamari|miso|tofu|edamame|tempeh|soybean oil|soy lecithin|teriyaki|soy milk)\b/gi,
    /\b(peanut|peanuts|peanut butter|peanut oil|groundnut|groundnuts)\b/gi,
    /\b(almond|almonds|almond extract|walnut|walnuts|pecan|pecans|cashew|cashews|pistachio|pistachios|hazelnut|hazelnuts|macadamia|macadamia nut|macadamia nuts|brazil nut|brazil nuts|pine nut|pine nuts|pignoli|chestnut|chestnuts|nut|nuts|tree nut|tree nuts)\b/gi,
    /\b(sesame|sesame seed|sesame seeds|sesame oil|tahini|benne|benne seed|benne seeds|sesame seed bun)\b/gi,
    /\b(onion|onions|garlic|shallot|shallots|scallion|scallions|chive|chives|leek|leeks|onion powder|garlic powder|garlic puree|minced garlic|roasted garlic|garlic crouton|garlic croutons|onion soup|caramelized onions|red onion|white onion|yellow onion|green onion|spring onion|crispy onions|grilled onions|roasted onions|roasted red onions)\b/gi,
    /\b(tomato|tomatoes|tomato paste|tomato sauce|tomato jam|tomato basil|cherry tomato|cherry tomatoes|tomato wedges|tomato juice|sun-dried tomato|sun dried tomato|tomato puree)\b/gi,
      /\b(beef|chicken|turkey|pork|lamb|steak|filet|filet mignon|porterhouse|prime rib|tenderloin|strip|ribeye|sirloin|coulotte|new york strip|t-bone|cowboy|lamb chop|lamb porterhouse|ground beef|ground turkey|chicken breast|chicken stock|chicken jus|bacon|Canadian bacon|ham|sausage|smoked salmon|salmon)\b/gi,
    /\b(oil|house oil|olive oil|vegetable oil|canola oil|peanut oil|soybean oil|sesame oil)\b/gi,
    /\b(vinegar|balsamic vinaigrette|red wine vinegar|rice wine vinegar|white wine)\b/gi,
    /\b(salt|pepper|black pepper|white pepper|fresh ground pepper|blackening spice|char-crust|Wildfire 8 spice|Old Bay seasoning|seasoning|seasonings)\b/gi,
      /\b(sugar|brown sugar|dark brown sugar|honey|hot honey sauce|mustard|Dijon mustard|honey Dijon mustard|yellow mustard|maple syrup)\b/gi,
      /\b(lettuce|romaine|field greens|greens|arugula|spinach|kale|mixed greens)\b/gi,
      /\b(cucumber|cucumbers|tomato|tomatoes|avocado|mushroom|mushrooms|mushroom caps|peppers|red peppers|jalapeno|jalapenos|corn|carrots|celery|scallions|cherry tomatoes|fresh berries|berries|raspberries|strawberries|blackberries|blueberries)\b/gi,
      /\b(herbs|thyme|garlic|bay leaves|parsley|chives|cilantro|basil|oregano|rosemary|mint|mint chimichurri)\b/gi,
      /\b(sherry|bourbon|Basil Hayden's Bourbon|wine|white wine|red wine)\b/gi,
      /\b(au jus|horseradish|horseradish cream sauce|horseradish crust|ancho mayo|mustard mayonnaise|spicy mayo|coconut dipping sauce|ranch dressing|yogurt sauce|cocktail sauce|ketchup|barbecue sauce|BBQ sauce|salsa)\b/gi,
      /\b(asparagus|blanched asparagus|French fries|fresh-cut french fries|french fries|coleslaw|side|sides|red skin mashed potatoes|mashed potatoes|hash browns|hash brown)\b/gi,
      /\b(baking powder|baking soda|vanilla|vanilla extract|chocolate chips|whipped cream|hot fudge|capers)\b/gi,
  ];
  
  for (const pattern of ingredientPatterns) {
    const matches = description.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.trim();
        if (cleaned.length >= 2) {
          ingredients.add(cleaned);
        }
      });
    }
  }
  
  return Array.from(ingredients).sort();
}

/**
 * Add standard ingredients for common dishes that aren't explicitly mentioned in descriptions
 */
function addStandardIngredients(dishName: string, description: string, existingIngredients: string[]): string[] {
  const ingredients = new Set(existingIngredients);
  const dishLower = dishName.toLowerCase();
  const descLower = description.toLowerCase();
  
  // Brunch dishes - add standard ingredients
  if (dishLower.includes('pancake') || dishLower.includes('buttermilk pancake')) {
    ingredients.add('flour');
    ingredients.add('eggs');
    ingredients.add('buttermilk');
    ingredients.add('baking powder');
    ingredients.add('baking soda');
    ingredients.add('salt');
    ingredients.add('sugar');
    ingredients.add('butter');
    ingredients.add('vanilla extract');
    if (descLower.includes('chocolate chip')) {
      ingredients.add('chocolate chips');
    }
  }
  
  if (dishLower.includes('waffle') || dishLower.includes('belgian waffle')) {
    ingredients.add('flour');
    ingredients.add('eggs');
    ingredients.add('milk');
    ingredients.add('butter');
    ingredients.add('baking powder');
    ingredients.add('salt');
    ingredients.add('sugar');
    ingredients.add('vanilla extract');
    if (descLower.includes('chocolate chip')) {
      ingredients.add('chocolate chips');
    }
    if (descLower.includes('whipped cream')) {
      ingredients.add('whipped cream');
    }
    if (descLower.includes('berries') || descLower.includes('berry')) {
      ingredients.add('fresh berries');
    }
  }
  
  if (dishLower.includes('french toast')) {
    ingredients.add('brioche bread');
    ingredients.add('eggs');
    ingredients.add('milk');
    ingredients.add('vanilla extract');
    ingredients.add('butter');
    ingredients.add('salt');
    if (descLower.includes('berries') || descLower.includes('berry')) {
      ingredients.add('fresh berries');
    }
  }
  
  if (dishLower.includes('omelet') || dishLower.includes('omelette')) {
    ingredients.add('eggs');
    ingredients.add('butter'); // for cooking
    ingredients.add('oil'); // for cooking
    // Fillings are already in description
  }
  
  if (dishLower.includes('eggs benedict') || dishLower.includes('benedict')) {
    ingredients.add('English muffins');
    ingredients.add('eggs');
    ingredients.add('hollandaise sauce');
    if (descLower.includes('canadian bacon')) {
      ingredients.add('Canadian bacon');
    }
    if (descLower.includes('smoked salmon')) {
      ingredients.add('smoked salmon');
      ingredients.add('capers');
    }
  }
  
  if (dishLower.includes('breakfast burrito')) {
    ingredients.add('flour tortilla');
    ingredients.add('eggs');
    ingredients.add('hash browns');
    ingredients.add('butter'); // for cooking eggs
    ingredients.add('oil'); // for cooking
  }
  
  if (dishLower.includes('breakfast sandwich')) {
    ingredients.add('English muffin');
    ingredients.add('eggs');
    ingredients.add('butter'); // for toasting
  }
  
  if (dishLower.includes('chicken and waffles') || (dishLower.includes('chicken') && descLower.includes('waffle'))) {
    ingredients.add('Belgian waffle');
    ingredients.add('fried chicken batter');
    ingredients.add('fried chicken flour');
    ingredients.add('buttermilk'); // for chicken
    ingredients.add('eggs'); // for batter
    ingredients.add('flour'); // for batter
    ingredients.add('butter'); // for waffle and serving
  }
  
  if (dishLower.includes('steak and eggs')) {
    ingredients.add('steak butter');
    ingredients.add('pre-mark butter');
    ingredients.add('butter'); // for cooking
    ingredients.add('eggs');
    if (descLower.includes('toast')) {
      ingredients.add('toast');
      ingredients.add('bread');
    }
  }
  
  if (dishLower.includes('avocado toast')) {
    ingredients.add('artisan bread');
    ingredients.add('avocado');
    ingredients.add('olive oil');
    if (descLower.includes('feta')) {
      ingredients.add('feta cheese');
    }
  }
  
  // Normalize ingredient names
  const normalized = Array.from(ingredients).map(ing => {
    // Fix common variations
    if (ing.toLowerCase() === 'english muffin' && !ingredients.has('English muffins')) {
      return 'English muffins';
    }
    return ing;
  });
  
  return Array.from(new Set(normalized)).sort();
}

function convertToMenuItem(row: CSVRow): any {
  const description = row.description || '';
  const parsedIngredients = parseIngredients(description);
  const ingredients = addStandardIngredients(row.dish_name || '', description, parsedIngredients);
  
  return {
    id: row.id || '',
    dish_name: row.dish_name || '',
    ticket_code: row.ticket_code || '',
    category: row.category || '',
    menu: row.menu || '',
    description: description,
    ingredients: ingredients,
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

