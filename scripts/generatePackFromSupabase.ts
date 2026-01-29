/**
 * Generate Tenant Pack FROM SUPABASE DATABASE
 * 
 * This script:
 * 1. Fetches ALL menu items from Supabase database (menu_items table)
 * 2. Fetches allergen modifications JOINED by menu_item_id (not string matching!)
 * 3. Combines them: all dishes get included, allergen rules applied where linked
 * 4. Reports any missing links and generates detailed debug output
 * 
 * Usage: 
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx TENANT_ID=xxx npx tsx scripts/generatePackFromSupabase.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ESM-safe: Use process.cwd() to get project root
const PROJECT_ROOT = process.cwd();

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TENANT_ID = process.env.TENANT_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL - Your Supabase project URL');
  console.error('   SUPABASE_SERVICE_KEY - Your Supabase service role key');
  process.exit(1);
}

if (!TENANT_ID) {
  console.error('❌ Missing TENANT_ID environment variable');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

// Allergen definitions (standard across all tenants)
const ALLERGEN_DEFINITIONS = [
  { id: 'dairy', name: 'Dairy', icon: '🥛', description: 'Includes cheese and milk products. Does NOT include eggs or mayonnaise.' },
  { id: 'gluten', name: 'Gluten', icon: '🌾', description: 'Wheat, barley, rye, and related grains.' },
  { id: 'shellfish', name: 'Shellfish', icon: '🦐', description: 'Shrimp, crab, lobster, scallops, etc.' },
  { id: 'soy', name: 'Soy', icon: '🫘', description: 'Soybeans and soy-derived ingredients.' },
  { id: 'eggs', name: 'Eggs', icon: '🥚', description: 'Eggs and egg-derived ingredients.' },
  { id: 'peanuts', name: 'Peanuts', icon: '🥜', description: 'Peanuts and peanut-derived ingredients.' },
  { id: 'tree_nuts', name: 'Tree Nuts', icon: '🌰', description: 'Almonds, walnuts, pecans, etc.' },
  { id: 'sesame', name: 'Sesame', icon: '⚪', description: 'Sesame seeds and sesame oil.' },
  { id: 'garlic', name: 'Garlic', icon: '🧄', description: 'Garlic and garlic-derived ingredients.' },
  { id: 'onion', name: 'Onion', icon: '🧅', description: 'Onions and onion-derived ingredients.' },
];

// Salad protein add-on options with their allergen rules
const SALAD_PROTEIN_OPTIONS = [
  {
    id: 'protein_chicken',
    name: 'Grilled Chicken Breast',
    ticketCode: 'ADD CHICKEN',
    allergenRules: {
      dairy: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      gluten: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      shellfish: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      soy: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      eggs: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      peanuts: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      tree_nuts: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      sesame: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      garlic: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      onion: { status: 'MODIFIABLE', substitutions: ['NO marinade', 'SUB plain chicken'], notes: null, requiresVerification: false },
    }
  },
  {
    id: 'protein_salmon',
    name: 'Salmon',
    ticketCode: 'ADD SALMON',
    allergenRules: {
      dairy: { status: 'MODIFIABLE', substitutions: ['NO glaze'], notes: null, requiresVerification: false },
      gluten: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      shellfish: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      soy: { status: 'MODIFIABLE', substitutions: ['NO salmon glaze'], notes: null, requiresVerification: false },
      eggs: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      peanuts: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      tree_nuts: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      sesame: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      garlic: { status: 'MODIFIABLE', substitutions: ['NO BBQ chicken spice'], notes: null, requiresVerification: false },
      onion: { status: 'MODIFIABLE', substitutions: ['NO BBQ spice'], notes: null, requiresVerification: false },
    }
  },
  {
    id: 'protein_tenderloin',
    name: 'Tenderloin Tips',
    ticketCode: 'ADD TENDERLOIN',
    allergenRules: {
      dairy: { status: 'MODIFIABLE', substitutions: ['NO steak butter'], notes: null, requiresVerification: false },
      gluten: { status: 'MODIFIABLE', substitutions: ['GF steak butter'], notes: null, requiresVerification: false },
      shellfish: { status: 'MODIFIABLE', substitutions: ['NO steak butter'], notes: null, requiresVerification: false },
      soy: { status: 'MODIFIABLE', substitutions: ['NO marinade on steak'], notes: null, requiresVerification: false },
      eggs: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      peanuts: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      tree_nuts: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      sesame: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      garlic: { status: 'SAFE', substitutions: [], notes: null, requiresVerification: false },
      onion: { status: 'MODIFIABLE', substitutions: ['NO bourbon marinade'], notes: null, requiresVerification: false },
    }
  },
];

// Category display order and icons
const CATEGORY_CONFIG: Record<string, { icon: string; order: number }> = {
  'Appetizers': { icon: '🍤', order: 1 },
  'Salads': { icon: '🥗', order: 2 },
  'Salad Add-Ons': { icon: '🥗', order: 3 },
  'Filets': { icon: '🥩', order: 4 },
  'Steaks and Chops': { icon: '🥩', order: 5 },
  'Prime Rib': { icon: '🥩', order: 6 },
  'Fresh Fish and Seafood': { icon: '🐟', order: 7 },
  'Sandwiches: Prime Burgers': { icon: '🍔', order: 8 },
  'Sandwiches: Signatures': { icon: '🥪', order: 9 },
  'Sides': { icon: '🥔', order: 10 },
  'Nightly Specials': { icon: '⭐', order: 11 },
  'Special Party Items': { icon: '🎉', order: 12 },
  'Kids Menu': { icon: '👶', order: 13 },
  'Desserts': { icon: '🍰', order: 14 },
  'Brunch': { icon: '🍳', order: 15 },
};

// Items to move to a different category (name pattern -> new category)
const CATEGORY_OVERRIDES: Array<{ pattern: RegExp; newCategory: string }> = [
  { pattern: /^Salad with/i, newCategory: 'Salad Add-Ons' },
];

// Categories to exclude from the pack
const EXCLUDED_CATEGORIES = [
  'Chicken and Barbecue',
  'Kids Menu',
];

// Specific items to exclude (by name)
const EXCLUDED_ITEMS = [
  'Kids Filet',
];

interface DbMenuItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  display_order: number;
}

interface AllergenModification {
  id: string;
  menu_item_id: string | null;
  dish_name: string;
  category: string;
  allergen: string;
  status: 'safe' | 'modifiable' | 'not_modifiable';
  modifications: string[];
  notes: string | null;
  requires_verification?: boolean;  // Optional - column may not exist
}

// Convert category name to a slug ID
function categoryToId(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

async function generatePack() {
  console.log('🔄 Generating Tenant Pack from Supabase Database...\n');
  console.log('   Using ID-based joins (not string matching)\n');

  // 1. Get tenant info
  console.log('📋 Fetching tenant info...');
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, concept_name, location_name')
    .eq('id', TENANT_ID)
    .single();

  if (tenantError || !tenant) {
    console.error('❌ Tenant not found:', tenantError?.message);
    process.exit(1);
  }
  console.log(`   ✓ Tenant: ${tenant.concept_name} - ${tenant.location_name}`);

  // 2. Fetch ALL menu items
  console.log('📋 Fetching menu items...');
  const { data: dbMenuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('id, name, category, description, display_order, is_entree, is_side_only, side_ids, ticket_code, ingredients, garnishes')
    .eq('tenant_id', TENANT_ID)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (menuError) {
    console.error('❌ Error fetching menu items:', menuError.message);
    process.exit(1);
  }

  if (!dbMenuItems || dbMenuItems.length === 0) {
    console.error('❌ No menu items found in database!');
    process.exit(1);
  }
  console.log(`   ✓ ${dbMenuItems.length} menu items (before filtering)`);

  // Filter out excluded categories and specific items
  const filteredMenuItems = dbMenuItems
    .filter(item => !EXCLUDED_CATEGORIES.includes(item.category))
    .filter(item => !EXCLUDED_ITEMS.includes(item.name));
  console.log(`   ✓ ${filteredMenuItems.length} menu items (after excluding categories: ${EXCLUDED_CATEGORIES.join(', ')})`);
  if (EXCLUDED_ITEMS.length > 0) {
    console.log(`   ✓ Also excluded items: ${EXCLUDED_ITEMS.join(', ')}`);
  }

  // 3. Fetch allergen modifications WITH menu_item_id
  console.log('📋 Fetching allergen modifications...');
  const { data: modifications, error: modError } = await supabase
    .from('allergen_modifications')
    .select('id, menu_item_id, dish_name, category, allergen, status, modifications, notes')
    .eq('tenant_id', TENANT_ID);

  if (modError) {
    console.error('❌ Error fetching modifications:', modError.message);
    process.exit(1);
  }
  console.log(`   ✓ ${modifications?.length || 0} allergen rules total`);

  // 4. Analyze linking status
  const linkedMods = modifications?.filter(m => m.menu_item_id !== null) || [];
  const unlinkedMods = modifications?.filter(m => m.menu_item_id === null) || [];
  
  console.log(`   ✓ ${linkedMods.length} rules linked to menu items`);
  if (unlinkedMods.length > 0) {
    console.log(`   ⚠️ ${unlinkedMods.length} rules NOT linked (will be ignored)`);
  }

  // 5. Build lookup map: menu_item_id -> allergen -> modification
  const modLookup = new Map<string, Map<string, AllergenModification>>();
  for (const mod of linkedMods) {
    if (!mod.menu_item_id) continue;
    
    if (!modLookup.has(mod.menu_item_id)) {
      modLookup.set(mod.menu_item_id, new Map());
    }
    modLookup.get(mod.menu_item_id)!.set(mod.allergen, mod);
  }

  // Count menu items with rules
  const menuItemsWithRules = modLookup.size;
  const menuItemsWithoutRules = filteredMenuItems.length - menuItemsWithRules;

  console.log(`\n📊 Coverage Report:`);
  console.log(`   Menu items with allergen rules: ${menuItemsWithRules}`);
  console.log(`   Menu items WITHOUT rules: ${menuItemsWithoutRules} (will show as UNKNOWN)`);

  // 6. Build the TenantPack
  console.log('\n🔨 Building TenantPack...');

  const categorySet = new Set<string>();
  const itemsWithoutRules: string[] = [];

  // Get all steak add-ons for linking
  const steakAddOns = filteredMenuItems.filter(item => item.category === 'Steak Add-Ons');
  console.log(`   Found ${steakAddOns.length} steak add-ons`);

  const items = filteredMenuItems.map((menuItem, index) => {
    // Check for category overrides based on item name
    let effectiveCategory = menuItem.category;
    for (const override of CATEGORY_OVERRIDES) {
      if (override.pattern.test(menuItem.name)) {
        effectiveCategory = override.newCategory;
        break;
      }
    }
    
    categorySet.add(effectiveCategory);

    // Get allergen rules for this item BY ID
    const itemMods = modLookup.get(menuItem.id);
    const hasRules = itemMods && itemMods.size > 0;

    if (!hasRules) {
      itemsWithoutRules.push(menuItem.name);
    }

    // Build allergen rules
    const allergenRules: Record<string, any> = {};

    for (const allergen of ALLERGEN_DEFINITIONS) {
      const mod = itemMods?.get(allergen.id);

      if (mod) {
        // We have a linked rule for this allergen in the allergy sheet
        let status: string;

        // CRITICAL BUSINESS RULE: VERIFY_WITH_KITCHEN is ONLY allowed for Fish allergen
        // For all other allergens, verification requirements are converted to NOT_SAFE
        // Rationale: Fish varies daily (fresh catch, preparation), all other allergens must be deterministic
        if (mod.requires_verification) {
          if (allergen.id === 'fish') {
            status = 'VERIFY_WITH_KITCHEN';  // Fish is the ONLY allergen allowed to use VERIFY
          } else {
            // NON-FISH allergen requiring verification = NOT SAFE (cannot serve without deterministic rules)
            status = 'NOT_SAFE_NOT_IN_SHEET';
          }
        } else {
          // Apply standard status mapping
          switch (mod.status) {
            case 'safe':
              status = 'SAFE';
              break;
            case 'modifiable':
              status = 'MODIFIABLE';
              break;
            case 'not_modifiable':
              status = 'UNSAFE';
              break;
            default:
              // Unknown DB status: only allow VERIFY for fish, otherwise NOT SAFE
              status = (allergen.id === 'fish') ? 'VERIFY_WITH_KITCHEN' : 'NOT_SAFE_NOT_IN_SHEET';
          }
        }

        allergenRules[allergen.id] = {
          status,
          substitutions: mod.modifications || [],
          notes: mod.notes || null,
          requiresVerification: mod.requires_verification || false,
        };
      } else {
        // CRITICAL SAFETY RULE: No rule in allergy sheet = NOT SAFE
        // This dish was NOT reviewed for this allergen, so it CANNOT be served
        allergenRules[allergen.id] = {
          status: 'NOT_SAFE_NOT_IN_SHEET',
          substitutions: [],
          notes: 'NOT IN ALLERGY SHEET - Cannot verify safety',
          requiresVerification: false,
        };
      }
    }

    const categoryId = categoryToId(effectiveCategory);

    // Check if this is a steak/filet item that should have add-ons
    const isSteakOrFilet = effectiveCategory === 'Steaks & Filets';
    const isAddOn = effectiveCategory === 'Steak Add-Ons';
    const isSaladAddOn = effectiveCategory === 'Salad Add-Ons';

    const item: any = {
      id: menuItem.id,
      name: menuItem.name,
      ticketCode: menuItem.ticket_code || null,
      categoryId: categoryId,
      category: effectiveCategory,
      description: menuItem.description || null,
      displayOrder: index,
      allergenRules,
      // Ingredients for custom allergen search
      ingredients: menuItem.ingredients || [],
      garnishes: menuItem.garnishes || [],
      // Brunch-specific flags
      isEntree: menuItem.is_entree || undefined,
      isSideOnly: menuItem.is_side_only || undefined,
      // Debug info
      _hasRules: hasRules,
      _ruleCount: itemMods?.size || 0,
    };

    // Add protein options for salads (but not salad add-ons)
    if (effectiveCategory === 'Salads' && !isSaladAddOn) {
      item.proteinOptions = SALAD_PROTEIN_OPTIONS;
    }

    // Add add-on options for steaks & filets
    if (isSteakOrFilet && !isAddOn) {
      item.requiresAddOns = true;
      item.addOnOptions = steakAddOns.map(addon => ({
        id: addon.id,
        name: addon.name,
      }));
    }

    // Add sides array for brunch entrées
    if (menuItem.is_entree && menuItem.side_ids && menuItem.side_ids.length > 0) {
      item.sides = menuItem.side_ids
        .map((sideId: string) => {
          const sideItem = dbMenuItems.find(i => i.id === sideId);
          return sideItem ? { id: sideItem.id, name: sideItem.name } : null;
        })
        .filter((s: any) => s !== null);
    }

    return item;
  });

  // Sort items
  items.sort((a, b) => {
    const catOrderA = CATEGORY_CONFIG[a.category]?.order ?? 999;
    const catOrderB = CATEGORY_CONFIG[b.category]?.order ?? 999;
    if (catOrderA !== catOrderB) return catOrderA - catOrderB;
    return a.name.localeCompare(b.name);
  });

  items.forEach((item, index) => {
    item.displayOrder = index;
  });

  // Build categories with review flags
  const categories = Array.from(categorySet)
    .map((catName) => {
      const needsReview =
        catName.toLowerCase().includes('seafood') ||
        catName.toLowerCase().includes('chicken');

      return {
        id: categoryToId(catName),
        name: catName,
        icon: CATEGORY_CONFIG[catName]?.icon || '📋',
        displayOrder: CATEGORY_CONFIG[catName]?.order ?? 999,
        needsReview,
      };
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Build master list of all unique ingredients (for autocomplete)
  // ONLY EXCLUDE these specific allergens that have dedicated buttons
  // User can still search for dairy products, shellfish, gluten items, etc.
  const EXCLUDED_ALLERGEN_KEYWORDS = [
    // Onion (has dedicated button) - includes onion family
    'onion', 'onions', 'shallot', 'shallots', 'scallion', 'scallions', 'leek', 'leeks',
    'green onion', 'green onions', 'red onion', 'white onion', 'yellow onion', 'chive', 'chives',
    // Garlic (has dedicated button)
    'garlic',
    // Eggs (has dedicated button)
    'egg', 'eggs',
    // Sesame (has dedicated button)
    'sesame', 'sesame seeds', 'sesame oil', 'tahini',
    // Soy (has dedicated button)
    'soy', 'soy sauce', 'tofu', 'edamame', 'miso', 'tempeh', 'soybean', 'soya',
    // Peanuts (has dedicated button)
    'peanut', 'peanuts', 'peanut butter', 'peanut oil',
    // Tree Nuts (has dedicated button)
    'almond', 'almonds', 'walnut', 'walnuts', 'pecan', 'pecans', 'cashew', 'cashews',
    'pistachio', 'pistachios', 'hazelnut', 'hazelnuts', 'macadamia', 'pine nut', 'pine nuts',
    'tree nut', 'tree nuts',
  ];
  
  const isExcludedAllergen = (ingredient: string): boolean => {
    const lower = ingredient.toLowerCase();
    return EXCLUDED_ALLERGEN_KEYWORDS.some(keyword => 
      lower === keyword || lower.includes(keyword)
    );
  };

  const allIngredientsSet = new Set<string>();
  const allGarnishesSet = new Set<string>();
  for (const item of items) {
    for (const ing of (item.ingredients || [])) {
      const lowerIng = ing.toLowerCase();
      if (!isExcludedAllergen(lowerIng)) {
        allIngredientsSet.add(lowerIng);
      }
    }
    for (const gar of (item.garnishes || [])) {
      const lowerGar = gar.toLowerCase();
      if (!isExcludedAllergen(lowerGar)) {
        allGarnishesSet.add(lowerGar);
      }
    }
  }
  const allIngredients = Array.from(allIngredientsSet).sort();
  const allGarnishes = Array.from(allGarnishesSet).sort();
  console.log(`   Found ${allIngredients.length} unique ingredients, ${allGarnishes.length} unique garnishes (after excluding allergens)`);

  // Build final pack
  const pack = {
    tenantId: tenant.id,
    conceptName: tenant.concept_name,
    locationName: tenant.location_name,
    version: 1,
    generatedAt: new Date().toISOString(),
    allergens: ALLERGEN_DEFINITIONS,
    allIngredients,
    allGarnishes,
    categories: categories,
    items,
    stats: {
      totalItems: items.length,
      totalCategories: categories.length,
      totalLinkedRules: linkedMods.length,
      totalUnlinkedRules: unlinkedMods.length,
      itemsWithRules: menuItemsWithRules,
      itemsWithoutRules: menuItemsWithoutRules,
      allergensSupported: ALLERGEN_DEFINITIONS.length,
    },
  };

  // Write pack
  const outputDir = path.join(PROJECT_ROOT, 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const packJson = JSON.stringify(pack, null, 2);
  const outputPath = path.join(outputDir, 'tenant-pack-v1.json');
  fs.writeFileSync(outputPath, packJson);

  const checksum = crypto.createHash('sha256').update(packJson).digest('hex');
  fs.writeFileSync(path.join(outputDir, 'checksums.json'), JSON.stringify({ v1: checksum }, null, 2));

  // Summary
  console.log('\n✅ Pack generated successfully!');
  console.log('─'.repeat(55));
  console.log(`   Tenant:              ${tenant.concept_name} - ${tenant.location_name}`);
  console.log(`   Total Items:         ${pack.stats.totalItems}`);
  console.log(`   Categories:          ${pack.stats.totalCategories}`);
  console.log(`   Items WITH rules:    ${pack.stats.itemsWithRules}`);
  console.log(`   Items WITHOUT rules: ${pack.stats.itemsWithoutRules} (UNKNOWN)`);
  console.log(`   Linked allergen rules: ${pack.stats.totalLinkedRules}`);
  console.log(`   Unlinked rules (ignored): ${pack.stats.totalUnlinkedRules}`);
  console.log(`   Size:                ${(packJson.length / 1024).toFixed(2)} KB`);
  console.log(`   Checksum:            ${checksum.substring(0, 16)}...`);
  console.log('─'.repeat(55));

  // Show items per category
  console.log('\n📊 Items per category:');
  const itemsByCategory = new Map<string, number>();
  for (const item of items) {
    itemsByCategory.set(item.category, (itemsByCategory.get(item.category) || 0) + 1);
  }
  for (const cat of categories) {
    console.log(`   ${cat.icon} ${cat.name}: ${itemsByCategory.get(cat.name) || 0} items`);
  }

  // Report items without rules
  if (itemsWithoutRules.length > 0) {
    console.log('\n⚠️ Items WITHOUT allergen rules (will show "Verify with Chef"):');
    itemsWithoutRules.forEach(name => console.log(`   - ${name}`));
  }

  // Report unlinked rules
  if (unlinkedMods.length > 0) {
    const uniqueUnlinkedDishes = [...new Set(unlinkedMods.map(m => m.dish_name))];
    console.log('\n⚠️ Unlinked allergen rules (dish names not matching any menu item):');
    uniqueUnlinkedDishes.slice(0, 20).forEach(name => console.log(`   - ${name}`));
    if (uniqueUnlinkedDishes.length > 20) {
      console.log(`   ... and ${uniqueUnlinkedDishes.length - 20} more`);
    }
  }

  console.log('\n📤 Next: Run uploadPackToSupabase.ts to deploy');

  // Exit with error if coverage is too low
  const coveragePercent = (menuItemsWithRules / dbMenuItems.length) * 100;
  if (coveragePercent < 50) {
    console.log(`\n❌ WARNING: Only ${coveragePercent.toFixed(1)}% of menu items have allergen rules!`);
    console.log('   Run 015_name_mapping_and_link.sql to link rules to menu items.');
  }
}

generatePack().catch((err) => {
  console.error('❌ Error generating pack:', err);
  process.exit(1);
});
