/**
 * Generate Tenant Pack from current menu data
 * 
 * This script converts the existing menu-items.ts and specialDishModifications
 * into the new TenantPack JSON format.
 * 
 * Usage: npx tsx scripts/generateTenantPack.ts
 */

import { menuItems } from '../src/data/menu-items';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Types (matching packTypes.ts)
// ============================================================================

type RuleStatus = 'SAFE' | 'MODIFY' | 'UNSAFE' | 'UNKNOWN';

interface AllergenRule {
  status: RuleStatus;
  foundIngredients?: string[];
  substitutions?: string[];
  notes?: string;
}

interface SideOption {
  id: string;
  name: string;
}

interface CrustOption {
  id: string;
  name: string;
}

interface PackMenuItem {
  id: string;
  name: string;
  categoryId: string;
  ticketCode?: string;
  description?: string;
  isEntree?: boolean;
  requiresCrust?: boolean;
  sides?: SideOption[];
  crustOptions?: CrustOption[];
  allergenRules: Record<string, AllergenRule>;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  sortOrder?: number;
}

interface AllergenDef {
  id: string;
  name: string;
  icon?: string;
}

interface TenantPack {
  tenantId: string;
  conceptName: string;
  locationName: string;
  version: number;
  generatedAt: string;
  allergens: AllergenDef[];
  categories: Category[];
  items: PackMenuItem[];
}

// ============================================================================
// Category Mapping
// ============================================================================

const CATEGORY_MAP: Record<string, { id: string; name: string; sortOrder: number }> = {
  'Appetizers': { id: 'appetizers', name: 'Appetizers', sortOrder: 1 },
  'Salads': { id: 'salads', name: 'Salads', sortOrder: 2 },
  'Fresh Seafood': { id: 'fresh_seafood', name: 'Fresh Seafood', sortOrder: 3 },
  'Fresh Fish and Seafood': { id: 'fresh_seafood', name: 'Fresh Seafood', sortOrder: 3 },
  'Burgers and Sandwiches': { id: 'sandwiches', name: 'Burgers & Sandwiches', sortOrder: 4 },
  'Sandwiches': { id: 'sandwiches', name: 'Burgers & Sandwiches', sortOrder: 4 },
  'Steaks and Chops': { id: 'steaks', name: 'Steaks & Chops', sortOrder: 5 },
  'Prime Rib': { id: 'prime_rib', name: 'Prime Rib', sortOrder: 6 },
  'Chicken': { id: 'chicken', name: 'Chicken', sortOrder: 7 },
  'Ribs': { id: 'ribs', name: 'Ribs', sortOrder: 8 },
  'Nightly Specials': { id: 'nightly', name: 'Nightly Specials', sortOrder: 9 },
  'nightly': { id: 'nightly', name: 'Nightly Specials', sortOrder: 9 },
  'Sides': { id: 'sides', name: 'Sides', sortOrder: 10 },
  'Desserts': { id: 'desserts', name: 'Desserts', sortOrder: 11 },
  'Kids Menu': { id: 'kids', name: 'Kids Menu', sortOrder: 12 },
  'Brunch': { id: 'brunch', name: 'Brunch', sortOrder: 13 },
  'Specials': { id: 'specials', name: 'Specials', sortOrder: 14 },
  // Catch-alls for weird categories in the data
  'Pepper.': { id: 'salads', name: 'Salads', sortOrder: 2 },
  'Offer Fresh Ground Pepper.': { id: 'salads', name: 'Salads', sortOrder: 2 },
};

// ============================================================================
// Allergen Definitions
// ============================================================================

const ALLERGEN_DEFS: AllergenDef[] = [
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'shellfish', name: 'Shellfish', icon: '🦐' },
  { id: 'fish', name: 'Fish', icon: '🐟' },
  { id: 'egg', name: 'Egg', icon: '🥚' },
  { id: 'soy', name: 'Soy', icon: '🫘' },
  { id: 'peanuts', name: 'Peanuts', icon: '🥜' },
  { id: 'tree_nuts', name: 'Tree Nuts', icon: '🌰' },
  { id: 'sesame', name: 'Sesame', icon: '⚪' },
  { id: 'msg', name: 'MSG', icon: '🧂' },
  { id: 'onion_garlic', name: 'Onion & Garlic', icon: '🧄' },
  { id: 'tomato', name: 'Tomato', icon: '🍅' },
  { id: 'seed', name: 'Seeds', icon: '🌻' },
];

// ============================================================================
// Special Dish Modifications (from allergy-checker.ts)
// ============================================================================

interface SpecialModification {
  modifications: string[];
  canBeModified: boolean;
}

// Import the dairy modifications we've already defined
const DAIRY_MODIFICATIONS: Record<string, SpecialModification> = {
  // Appetizers
  'mediterranean_chicken_skewers': { modifications: ['NO yogurt sauce'], canBeModified: true },
  'shrimp_cocktail': { modifications: [], canBeModified: true },
  'oven_roasted_lump_crab_cakes': { modifications: ['NO mustard mayonnaise'], canBeModified: true },
  'applewood_smoked_bacon_wrapped_sea_scallops_skewers': { modifications: [], canBeModified: true },
  
  // Salads
  'field_salad': { modifications: [], canBeModified: true },
  'tuscan_kale_and_spinach_salad': { modifications: ['NO cheese', 'NO dressing'], canBeModified: true },
  'greek_salad': { modifications: ['NO feta cheese', 'NO dressing'], canBeModified: true },
  'steak_and_blue_cheese_salad': { modifications: ['NO cheese', 'NO crispy onions', 'NO ranch dressing'], canBeModified: true },
  'wildfire_chopped_salad': { modifications: ['NO marinated chicken', 'NO blue cheese', 'NO tortillas'], canBeModified: true },
  'caesar_salad': { modifications: [], canBeModified: false },
  
  // Sandwiches
  'thick_prime_angus_burger_cheeseburger': { modifications: ['NO butter on bun', 'NO coleslaw', 'NO fries'], canBeModified: true },
  'all_natural_turkey_burger': { modifications: ['NO cheese', 'NO butter on bun'], canBeModified: true },
  'grilled_chicken_club': { modifications: ['SUB plain chicken', 'NO cheese', 'NO mustard mayonnaise', 'NO butter on bun', 'NO coleslaw', 'NO fries'], canBeModified: true },
  'roasted_prime_rib_french_dip': { modifications: ['NO butter on bread', 'NO horseradish cream sauce', 'NO coleslaw', 'NO fries'], canBeModified: true },
  'sliced_turkey_sandwich': { modifications: ['NO cheese', 'NO butter on bread'], canBeModified: true },
  
  // Filets
  'basil_haydens_bourbon_marinated_tenderloin_tips': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  'petite_filet_mignon_filet_mignon': { modifications: ['NO pre-marking butter', 'NO steak butter', 'NO garlic crouton'], canBeModified: true },
  
  // Steaks and Chops
  'mushroom_crusted_fancy_pork_chops': { modifications: ['NO mushroom crust', 'NO pre-marking butter'], canBeModified: true },
  'roumanian_skirt_steak': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  'new_york_strip_steak': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  'porterhouse': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  'char_crust_bone_in_rib_eye': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  'broiled_lamb_porterhouse_chops': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  
  // Prime Rib
  'roasted_prime_rib_of_beef': { modifications: ['NO horseradish cream sauce'], canBeModified: true },
  
  // Seafood
  'cedar_planked_salmon': { modifications: ['NO glaze'], canBeModified: true },
  'lump_crab_cakes': { modifications: ['NO mustard mayonnaise'], canBeModified: true },
  
  // Nightly Specials
  'wednesday_spit_roasted_half_long_island_duck': { modifications: ['NO cherry glaze', 'NO wild rice'], canBeModified: true },
  
  // Chicken
  'spit_roasted_half_chicken': { modifications: ['NO lemon parmesan vinaigrette', 'SUB lemon herb vinaigrette', 'NO parmesan'], canBeModified: true },
  
  // Sides
  'steamed_broccoli_with_lemon_vinaigrette': { modifications: [], canBeModified: true },
  'roasted_market_vegetables': { modifications: [], canBeModified: true },
  'idaho_baked_potato': { modifications: ['NO sour cream', 'NO butter'], canBeModified: true },
  'bbq_rubbed_sweet_potato': { modifications: ['NO butter'], canBeModified: true },
  'applesauce': { modifications: [], canBeModified: true },
  
  // Desserts
  'seasonal_berries_crisp': { modifications: ['NO oatmeal crumble', 'NO ice cream'], canBeModified: true },
  
  // Kids
  'burger_cheeseburger_and_fries': { modifications: ['SUB multi-grain or sesame seed bun', 'NO butter on bun/bread', 'NO cheese'], canBeModified: true },
  'available_upon_request_kids_filet_mashed_potato': { modifications: ['NO pre-marking butter', 'NO steak butter', 'NO mashed potatoes'], canBeModified: true },
  
  // Brunch
  'classic_breakfast': { modifications: ['NO butter when cooking eggs', 'NO breakfast potatoes and onions', 'NO butter on toast'], canBeModified: true },
  'avocado_toast': { modifications: ['NO butter on toast', 'NO cheese in eggs'], canBeModified: true },
};

// ============================================================================
// Entree Detection
// ============================================================================

const ENTREE_CATEGORIES = [
  'steaks', 'prime_rib', 'chicken', 'ribs', 'fresh_seafood', 'nightly'
];

const STEAK_KEYWORDS = ['filet', 'ribeye', 'strip', 'porterhouse', 'skirt steak'];

// Side options for entrees
const STANDARD_SIDES: SideOption[] = [
  { id: 'french_fries', name: 'French Fries' },
  { id: 'red_skin_mashed_potatoes', name: 'Red Skin Mashed Potatoes' },
  { id: 'steamed_broccoli_with_lemon_vinaigrette', name: 'Steamed Broccoli' },
  { id: 'creamed_spinach', name: 'Creamed Spinach' },
  { id: 'au_gratin_potatoes', name: 'Au Gratin Potatoes' },
  { id: 'idaho_baked_potato', name: 'Idaho Baked Potato' },
  { id: 'bbq_rubbed_sweet_potato', name: 'BBQ Rubbed Sweet Potato' },
  { id: 'mac_and_cheese', name: 'Mac and Cheese' },
  { id: 'roasted_mushroom_caps', name: 'Roasted Mushroom Caps' },
  { id: 'roasted_market_vegetables', name: 'Roasted Market Vegetables' },
  { id: 'applesauce', name: 'Applesauce' },
  { id: 'homemade_coleslaw', name: 'Homemade Coleslaw' },
];

// Crust options for steaks
const STEAK_CRUSTS: CrustOption[] = [
  { id: 'peppercorn_crust', name: 'Peppercorn Crust' },
  { id: 'horseradish_crust', name: 'Horseradish Crust' },
  { id: 'blue_cheese_crust', name: 'Blue Cheese Crust' },
  { id: 'parmesan_crust', name: 'Parmesan Crust' },
  { id: 'mushroom_crust', name: 'Mushroom Crust' },
  { id: 'garlic_crust', name: 'Garlic Crust' },
];

// ============================================================================
// Conversion Functions
// ============================================================================

function normalizeCategory(category: string): { id: string; name: string; sortOrder: number } {
  // Check for direct match
  if (CATEGORY_MAP[category]) {
    return CATEGORY_MAP[category];
  }
  
  // Check for partial matches
  const lowerCat = category.toLowerCase();
  
  if (lowerCat.includes('nightly') || lowerCat.includes('special')) {
    return CATEGORY_MAP['Nightly Specials'];
  }
  if (lowerCat.includes('salad')) {
    return CATEGORY_MAP['Salads'];
  }
  if (lowerCat.includes('appetizer')) {
    return CATEGORY_MAP['Appetizers'];
  }
  if (lowerCat.includes('seafood') || lowerCat.includes('fish')) {
    return CATEGORY_MAP['Fresh Seafood'];
  }
  if (lowerCat.includes('sandwich') || lowerCat.includes('burger')) {
    return CATEGORY_MAP['Sandwiches'];
  }
  if (lowerCat.includes('steak') || lowerCat.includes('chop')) {
    return CATEGORY_MAP['Steaks and Chops'];
  }
  if (lowerCat.includes('dessert')) {
    return CATEGORY_MAP['Desserts'];
  }
  if (lowerCat.includes('kid')) {
    return CATEGORY_MAP['Kids Menu'];
  }
  if (lowerCat.includes('brunch') || lowerCat.includes('breakfast')) {
    return CATEGORY_MAP['Brunch'];
  }
  if (lowerCat.includes('side')) {
    return CATEGORY_MAP['Sides'];
  }
  
  // Default to specials
  return { id: 'specials', name: 'Specials', sortOrder: 14 };
}

function isEntree(item: typeof menuItems[0], categoryId: string): boolean {
  return ENTREE_CATEGORIES.includes(categoryId);
}

function requiresCrust(item: typeof menuItems[0], categoryId: string): boolean {
  if (categoryId !== 'steaks') return false;
  const lowerName = item.dish_name.toLowerCase();
  return STEAK_KEYWORDS.some(keyword => lowerName.includes(keyword));
}

function buildAllergenRules(item: typeof menuItems[0]): Record<string, AllergenRule> {
  const rules: Record<string, AllergenRule> = {};
  const itemId = item.id;
  
  // Get dairy modifications if available
  const dairyMods = DAIRY_MODIFICATIONS[itemId];
  
  // Build rules for each allergen
  const allergenFields: Array<{ field: keyof typeof item; id: string }> = [
    { field: 'contains_dairy', id: 'dairy' },
    { field: 'contains_egg', id: 'egg' },
    { field: 'contains_gluten', id: 'gluten' },
    { field: 'contains_shellfish', id: 'shellfish' },
    { field: 'contains_fish', id: 'fish' },
    { field: 'contains_soy', id: 'soy' },
    { field: 'contains_peanuts', id: 'peanuts' },
    { field: 'contains_tree_nuts', id: 'tree_nuts' },
    { field: 'contains_sesame', id: 'sesame' },
    { field: 'contains_msg', id: 'msg' },
  ];
  
  for (const { field, id } of allergenFields) {
    const contains = item[field] === 'Y';
    
    if (id === 'dairy' && dairyMods) {
      // Use specific dairy modifications
      if (dairyMods.modifications.length === 0 && dairyMods.canBeModified) {
        // No changes needed
        rules[id] = { status: 'SAFE' };
      } else if (!dairyMods.canBeModified) {
        // Cannot be modified
        rules[id] = {
          status: 'UNSAFE',
          notes: 'This dish cannot be modified for dairy allergies',
        };
      } else {
        // Has modifications
        rules[id] = {
          status: 'MODIFY',
          substitutions: dairyMods.modifications,
        };
      }
    } else if (contains) {
      // Contains allergen - mark as UNKNOWN since we don't have specific rules
      rules[id] = {
        status: 'UNKNOWN',
        notes: 'Please verify modifications with chef',
      };
    } else {
      // Doesn't contain - safe
      rules[id] = { status: 'SAFE' };
    }
  }
  
  return rules;
}

function convertMenuItem(item: typeof menuItems[0]): PackMenuItem | null {
  // Skip sauce/dressing definitions that aren't real menu items
  if (item.category === '' || item.dish_name.includes(':') && item.dish_name.length > 100) {
    return null;
  }
  
  const categoryInfo = normalizeCategory(item.category);
  const isEntreeItem = isEntree(item, categoryInfo.id);
  const needsCrust = requiresCrust(item, categoryInfo.id);
  
  const packItem: PackMenuItem = {
    id: item.id,
    name: item.dish_name,
    categoryId: categoryInfo.id,
    ticketCode: item.ticket_code || undefined,
    description: item.description || undefined,
    allergenRules: buildAllergenRules(item),
  };
  
  if (isEntreeItem) {
    packItem.isEntree = true;
    packItem.sides = STANDARD_SIDES;
  }
  
  if (needsCrust) {
    packItem.requiresCrust = true;
    packItem.crustOptions = STEAK_CRUSTS;
  }
  
  return packItem;
}

// ============================================================================
// Main Generation
// ============================================================================

async function generatePack(): Promise<void> {
  console.log('Generating Tenant Pack...\n');
  
  // Collect unique categories
  const categorySet = new Map<string, Category>();
  const items: PackMenuItem[] = [];
  
  for (const item of menuItems) {
    const packItem = convertMenuItem(item);
    if (packItem) {
      items.push(packItem);
      
      const catInfo = normalizeCategory(item.category);
      if (!categorySet.has(catInfo.id)) {
        categorySet.set(catInfo.id, {
          id: catInfo.id,
          name: catInfo.name,
          sortOrder: catInfo.sortOrder,
        });
      }
    }
  }
  
  // Sort categories by sortOrder
  const categories = Array.from(categorySet.values()).sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
  
  // Build the pack
  const pack: TenantPack = {
    tenantId: 'wildfire_tysons', // Will be replaced when uploaded
    conceptName: 'Wildfire',
    locationName: "Tyson's Corner",
    version: 1,
    generatedAt: new Date().toISOString(),
    allergens: ALLERGEN_DEFS,
    categories,
    items,
  };
  
  // Output stats
  console.log(`Categories: ${categories.length}`);
  console.log(`Items: ${items.length}`);
  console.log(`\nCategories:`);
  for (const cat of categories) {
    const count = items.filter(i => i.categoryId === cat.id).length;
    console.log(`  - ${cat.name}: ${count} items`);
  }
  
  // Write to file
  const outputDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const packJson = JSON.stringify(pack, null, 2);
  const outputPath = path.join(outputDir, 'tenant-pack-v1.json');
  fs.writeFileSync(outputPath, packJson);
  
  // Calculate checksum
  const checksum = crypto.createHash('sha256').update(packJson).digest('hex');
  
  console.log(`\nPack written to: ${outputPath}`);
  console.log(`Checksum: ${checksum}`);
  console.log(`Size: ${(packJson.length / 1024).toFixed(2)} KB`);
  
  // Also write a checksums file
  const checksumPath = path.join(outputDir, 'checksums.json');
  fs.writeFileSync(checksumPath, JSON.stringify({
    'v1': checksum,
  }, null, 2));
  
  console.log('\nDone!');
}

// Run
generatePack().catch(console.error);
