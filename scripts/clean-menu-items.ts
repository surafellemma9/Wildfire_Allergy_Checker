import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MenuItem {
  id: string;
  dish_name: string;
  ticket_code: string;
  category: string;
  menu: string;
  description: string;
  ingredients: string[];
  allergy_raw: string;
  contains_dairy: string;
  contains_egg: string;
  contains_gluten: string;
  contains_shellfish: string;
  contains_fish: string;
  contains_soy: string;
  contains_nuts: string;
  contains_sesame: string;
  contains_msg: string;
  contains_peanuts: string;
  contains_tree_nuts: string;
  notes: string;
  mod_notes: string;
  cannot_be_made_safe_notes: string;
}

/**
 * Adjectives that help identify substitutions - these should be kept
 */
const SUBSTITUTION_ADJECTIVES = new Set([
  'caramelized',
  'hard-boiled',
  'hard boiled',
  'pasteurized',
  'sun-dried',
  'sun dried',
  'smoked',
  'crispy', // crispy onions helps identify substitution
  'grilled', // grilled onions helps identify substitution
  'roasted', // roasted garlic/onions helps identify substitution
  'fresh', // fresh berries helps identify substitution
  'dried',
  'raw',
  'cooked',
  'pickled',
  'fermented',
  'aged',
  'sharp',
  'mild',
  'extra virgin', // extra virgin olive oil
]);

/**
 * Words/phrases that are not ingredients
 */
const NON_INGREDIENT_PATTERNS = [
  /^(then|and|or|with|in|on|at|to|for|of|the|a|an|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|must|can|side|sides|ramekin|ramekins|cup|cups|bowl|bowls|portion|portions|lunch|dinner|available|request|only|equaling|about|total|each|pieces?|skewers?|choice|choices|drizzle|dollop|garnish|garnished|topped|served|tossed|wrapped|baked|fried|grilled|broiled|sliced|diced|chopped|roasted|skewered|marinated|seasoned|brushed|glazed|coated|heated|chilled|peeled|poached|simmered|boiled|steamed|seared|sautéed|scrambled|griddled|desired|temperature|medium|rare|well|done|golden|brown|oven|skillet|pan|spray|cooking|spray)$/i,
  /^(dinner|lunch|breakfast|brunch)\s+(portion|filet|filets|is|are|available)/i,
  /^(two|three|four|five|six|seven|eight|nine|ten)\s+(filets?|skewers?|pieces?|oz\.?|count)/i,
  /^(duo|trio)\s*=/i,
  /^on\s+(top\s+of\s+)?(a|an|the)\s+/i,
  /^with\s+(a|an|the)\s+(ramekin|side|drizzle|dollop)/i,
  /^then\s+/i,
  /^and\s+then\s+/i,
  /^served\s+with/i,
  /^garnished\s+with/i,
  /^topped\s+with/i,
  /^tossed\s+with/i,
  /^wrapped\s+in/i,
  /^baked\s+in/i,
  /^fried\s+in/i,
  /^roasted\s+in/i,
  /^grilled\s+to/i,
  /^broiled\s+to/i,
  /^cooked\s+to/i,
  /^to\s+(desired|medium|rare|well|done)/i,
  /^(oz\.?|count|pieces?|each|equaling|about|total)\s+/i,
  /^\d+\s*(oz\.?|count|pieces?|each)/i,
  /^\d+-\d+\s+/i, // number ranges
  /^cooking\s+spray$/i,
  /^guest\s+choice/i,
  /^crust\s+choices/i,
  /^dressing\s+choices/i,
];

/**
 * Clean a single ingredient string
 */
function cleanIngredient(ingredient: string): string | null {
  if (!ingredient || typeof ingredient !== 'string') return null;
  
  let cleaned = ingredient.trim();
  
  // Fix common typos
  cleaned = cleaned.replace(/\s+s\s+easoning/gi, ' seasoning');
  cleaned = cleaned.replace(/\s+s\s+cheese/gi, ' cheese');
  cleaned = cleaned.replace(/\s+j\s+uice/gi, ' juice');
  cleaned = cleaned.replace(/\s+musta\s+rd/gi, ' mustard');
  cleaned = cleaned.replace(/\s+f\s+ilet/gi, ' filet');
  cleaned = cleaned.replace(/\s+t\s+hree/gi, ' three');
  cleaned = cleaned.replace(/\s+t\s+wo/gi, ' two');
  cleaned = cleaned.replace(/\s+P\s+armesan/gi, ' Parmesan');
  cleaned = cleaned.replace(/\s+v\s+inaigrette/gi, ' vinaigrette');
  cleaned = cleaned.replace(/\s+e\s+oil/gi, ' oil');
  cleaned = cleaned.replace(/\s+hous\s+e\s+oil/gi, ' house oil');
  cleaned = cleaned.replace(/\s+avoca\s+do/gi, ' avocado');
  cleaned = cleaned.replace(/\s+d\s+ill/gi, ' dill');
  cleaned = cleaned.replace(/\s+pepperoncini\s+/gi, ' pepperoncini');
  cleaned = cleaned.replace(/\s+FRESH\s+GROUND\s+PEPPER/gi, '');
  cleaned = cleaned.replace(/\s+-\s*Gulf\s+shrimp/gi, ' Gulf shrimp');
  
  // Remove trailing spaces
  cleaned = cleaned.replace(/\s+$/, '');
  
  // Skip if empty or too short
  if (cleaned.length < 2) return null;
  
  // Check if it matches non-ingredient patterns
  for (const pattern of NON_INGREDIENT_PATTERNS) {
    if (pattern.test(cleaned)) {
      return null;
    }
  }
  
  // Skip very long phrases (likely not ingredients)
  if (cleaned.length > 50) return null;
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  return cleaned;
}

/**
 * Check if an adjective should be kept (helps identify substitutions)
 */
function shouldKeepAdjective(ingredient: string): boolean {
  const lower = ingredient.toLowerCase();
  for (const adj of SUBSTITUTION_ADJECTIVES) {
    if (lower.includes(adj)) {
      return true;
    }
  }
  return false;
}

/**
 * Remove unnecessary adjectives from ingredient names
 */
function removeUnnecessaryAdjectives(ingredient: string): string {
  // Keep adjectives that help identify substitutions
  if (shouldKeepAdjective(ingredient)) {
    return ingredient;
  }
  
  let cleaned = ingredient;
  
  // Remove common unnecessary adjectives at the start
  cleaned = cleaned.replace(/^(fresh|chopped|sliced|diced|minced|grated|shredded|crumbled|toasted|whole|large|small|medium|big|tiny|thick|thin|soft|hard|smooth|rough|sweet|sour|bitter|spicy|mild|hot|cold|warm|cool|dry|wet|sticky|smooth|rough|tender|tough|juicy|dry|moist|flaky|dense|light|heavy|rich|lean|fatty|lean|extra|super|premium|quality|fine|coarse|ground|whole|powdered|granulated|liquid|solid|frozen|fresh|dried|canned|jarred|bottled|packaged|organic|natural|artificial|synthetic|pure|mixed|blended|combined|separated|whole|partial|complete|full|empty|new|old|young|mature|ripe|unripe|raw|cooked|uncooked|prepared|unprepared|processed|unprocessed|refined|unrefined|filtered|unfiltered|pasteurized|unpasteurized|homogenized|unhomogenized|sterilized|unsterilized|preserved|unpreserved|fermented|unfermented|aged|unaged|smoked|unsmoked|cured|uncured|salted|unsalted|sweetened|unsweetened|flavored|unflavored|seasoned|unseasoned|marinated|unmarinated|brined|unbrined|pickled|unpickled|dried|undried|dehydrated|rehydrated|frozen|thawed|chilled|warmed|heated|cooled|room temperature|warm|cold|hot|boiling|simmering|steaming|roasting|baking|grilling|broiling|frying|sautéing|searing|braising|stewing|poaching|steaming|boiling|simmering|roasting|baking|grilling|broiling|frying|sautéing|searing|braising|stewing|poaching)\s+/i, '');
  
  // Remove common unnecessary adjectives in the middle (be more careful here)
  // Only remove if it's clearly not helping identify the ingredient
  cleaned = cleaned.replace(/\s+(fresh|chopped|sliced|diced|minced|grated|shredded|crumbled|toasted)\s+/gi, ' ');
  
  // Normalize whitespace again
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Clean and deduplicate ingredients array
 */
function cleanIngredients(ingredients: string[]): string[] {
  const cleaned = new Set<string>();
  const normalized = new Map<string, string>(); // normalized -> original
  
  for (const ing of ingredients) {
    const cleanedIng = cleanIngredient(ing);
    if (!cleanedIng) continue;
    
    // Remove unnecessary adjectives (unless they help identify substitutions)
    const withoutAdj = removeUnnecessaryAdjectives(cleanedIng);
    
    // Normalize for comparison (lowercase, remove extra spaces)
    const normalizedKey = withoutAdj.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Skip if we already have this (normalized)
    if (normalized.has(normalizedKey)) {
      // Keep the version with helpful adjectives if it exists
      const existing = normalized.get(normalizedKey)!;
      if (shouldKeepAdjective(cleanedIng) && !shouldKeepAdjective(existing)) {
        normalized.set(normalizedKey, cleanedIng);
        cleaned.delete(existing);
        cleaned.add(cleanedIng);
      }
      continue;
    }
    
    // Check for similar ingredients (plural/singular, etc.)
    let isDuplicate = false;
    for (const [normKey, orig] of normalized.entries()) {
      // Check if one is plural/singular of the other
      if (normalizedKey === normKey + 's' || normKey === normalizedKey + 's') {
        // Keep the more specific one or the one with helpful adjectives
        if (shouldKeepAdjective(cleanedIng) && !shouldKeepAdjective(orig)) {
          normalized.delete(normKey);
          cleaned.delete(orig);
          normalized.set(normalizedKey, cleanedIng);
          cleaned.add(cleanedIng);
        }
        isDuplicate = true;
        break;
      }
      // Check if they're very similar (e.g., "cheese" vs "cheese s")
      if (Math.abs(normalizedKey.length - normKey.length) <= 2 && 
          (normalizedKey.includes(normKey) || normKey.includes(normalizedKey))) {
        // Keep the more complete version
        if (cleanedIng.length > orig.length || shouldKeepAdjective(cleanedIng)) {
          normalized.delete(normKey);
          cleaned.delete(orig);
          normalized.set(normalizedKey, cleanedIng);
          cleaned.add(cleanedIng);
        }
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      normalized.set(normalizedKey, cleanedIng);
      cleaned.add(cleanedIng);
    }
  }
  
  // Sort ingredients alphabetically
  return Array.from(cleaned).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

/**
 * Main function to clean the menu items file
 */
function main() {
  const filePath = path.join(__dirname, '..', 'src', 'data', 'menu-items.ts');
  
  // Read the file
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract the JSON array from the file
  // Find the menuItems array
  const arrayMatch = content.match(/export const menuItems: MenuItem\[\] = (\[[\s\S]*\]) as MenuItem\[\];/);
  if (!arrayMatch) {
    console.error('Could not find menuItems array in file');
    process.exit(1);
  }
  
  // Parse the JSON
  const menuItems: MenuItem[] = JSON.parse(arrayMatch[1]);
  
  console.log(`Processing ${menuItems.length} menu items...`);
  
  // Clean each menu item's ingredients
  let totalBefore = 0;
  let totalAfter = 0;
  
  for (const item of menuItems) {
    totalBefore += item.ingredients.length;
    item.ingredients = cleanIngredients(item.ingredients);
    totalAfter += item.ingredients.length;
  }
  
  console.log(`Reduced ingredients from ${totalBefore} to ${totalAfter} (removed ${totalBefore - totalAfter} items)`);
  
  // Write back to file
  const output = `// This file is auto-generated from wildfire_menu_allergens.csv
// Run: npm run generate-menu-data
// NOTE: This file has been cleaned to remove unnecessary adjectives and duplicates

import type { MenuItem } from '../types';

export const menuItems: MenuItem[] = ${JSON.stringify(menuItems, null, 2)} as MenuItem[];
`;
  
  fs.writeFileSync(filePath, output, 'utf-8');
  console.log(`Cleaned file written to ${filePath}`);
}

main();
