/**
 * Migration Script: Static Data → Supabase
 * 
 * This script generates SQL INSERT statements from the current static data
 * to populate the Supabase database.
 * 
 * Usage: npx ts-node scripts/migrate-to-supabase.ts > supabase/seed.sql
 */

import { menuItems } from '../src/data/menu-items';

// Current dairy modifications from allergy-checker.ts
const dairyModifications: Record<string, { modifications: string[], canBeModified: boolean }> = {
  // APPETIZERS
  'mediterranean_chicken_skewers': { modifications: ['NO yogurt sauce'], canBeModified: true },
  'shrimp_cocktail': { modifications: [], canBeModified: true },
  'oven_roasted_lump_crab_cakes': { modifications: ['NO mustard mayonnaise'], canBeModified: true },
  'applewood_smoked_bacon_wrapped_sea_scallops_skewers': { modifications: [], canBeModified: true },

  // SALADS
  'field_salad': { modifications: [], canBeModified: true },
  'tuscan_kale_and_spinach_salad': { modifications: ['NO cheese', 'NO dressing'], canBeModified: true },
  'greek_salad': { modifications: ['NO feta cheese', 'NO dressing'], canBeModified: true },
  'steak_and_blue_cheese_salad': { modifications: ['NO cheese', 'NO crispy onions', 'NO ranch dressing'], canBeModified: true },
  'wildfire_chopped_salad': { modifications: ['NO marinated chicken', 'NO blue cheese', 'NO tortillas'], canBeModified: true },
  'caesar_salad': { modifications: [], canBeModified: false },

  // SANDWICHES
  'add_roasted_wild_mushrooms_or_applewood_smoked_bacon_to_any_burger_for_2_00_each_thick_prime_angus_burger_cheeseburger': { modifications: ['NO butter on bun', 'NO coleslaw', 'NO fries'], canBeModified: true },
  'all_natural_turkey_burger': { modifications: ['NO cheese', 'NO butter on bun'], canBeModified: true },
  'grilled_chicken_club': { modifications: ['NO mustard-mayo marinated chicken (SUB plain chicken)', 'NO cheese', 'NO mustard mayonnaise', 'NO butter on bun'], canBeModified: true },
  'roasted_prime_rib_french_dip': { modifications: ['NO butter on bread', 'NO horseradish cream sauce'], canBeModified: true },
  'blackened_new_york_strip_steak_sandwich': { modifications: ['NO butter on bun'], canBeModified: true },
  'sliced_turkey_sandwich': { modifications: ['NO cheese', 'NO butter on bread'], canBeModified: true },

  // FILETS
  'center_cut_by_master_butchers_from_the_finest_midwestern_beef_tenderloin_basil_hayden_s_bourbon_marinated_tenderloin_tips': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  'petite_filet_mignon_filet_mignon': { modifications: ['NO pre-marking butter', 'NO steak butter', 'NO garlic crouton'], canBeModified: true },
  'horseradish_crusted_filet': { modifications: ['NO horseradish crust', 'NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  'filet_medallion_duo_filet_medallion_trio': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },

  // STEAKS AND CHOPS
  'tenderness_and_taste_brushed_with_our_seasoning_blend_and_broiled_over_glowing_embers_to_your_preferred_temperature_mushroom_crusted_fancy_pork_chops': { modifications: ['NO mushroom crust', 'NO pre-marking butter'], canBeModified: true },
  'roumanian_skirt_steak': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  'new_york_strip_steak': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  'porterhouse': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  'char_crust_bone_in_rib_eye': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  'broiled_lamb_porterhouse_chops': { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },

  // PRIME RIB
  'roasted_prime_rib': { modifications: ['NO horseradish cream sauce'], canBeModified: true },
  'roasted_prime_rib_of_beef': { modifications: ['NO horseradish cream sauce'], canBeModified: true },

  // SEAFOOD
  'cedar_planked_salmon': { modifications: ['NO glaze'], canBeModified: true },
  'lump_crab_cakes': { modifications: ['NO mustard mayo'], canBeModified: true },

  // NIGHTLY SPECIALS
  'wednesday_spit_roasted_half_long_island_duck': { modifications: ['NO cherry glaze', 'NO wild rice'], canBeModified: true },

  // SIDES
  'steamed_broccoli_with_lemon_vinaigrette': { modifications: [], canBeModified: true },
  'roasted_vegetables': { modifications: [], canBeModified: true },
  'idaho_baked_potato': { modifications: ['NO sour cream', 'NO butter'], canBeModified: true },
  'bbq_rubbed_sweet_potato': { modifications: ['NO butter'], canBeModified: true },
  'applesauce': { modifications: [], canBeModified: true },
  'red_skin_mashed_potatoes': { modifications: [], canBeModified: false },
  'creamed_spinach': { modifications: [], canBeModified: false },
  'au_gratin_potatoes': { modifications: [], canBeModified: false },
  'mac_and_cheese': { modifications: [], canBeModified: false },

  // DESSERTS
  'seasonal_berries_crisp': { modifications: ['NO oatmeal crumble', 'NO ice cream'], canBeModified: true },
  'jd_s_cheesecake': { modifications: [], canBeModified: false },
  'key_lime_pie': { modifications: [], canBeModified: false },

  // KID'S MENU
  'burger_cheeseburger_and_fries': { modifications: ['NO bun (SUB multi-grain or sesame seed bun)', 'NO butter on bun/bread', 'NO cheese'], canBeModified: true },
  'available_upon_request_kids_filet_mashed_potato': { modifications: ['NO pre-marking butter', 'NO steak butter', 'NO mashed potatoes'], canBeModified: true },
  'grilled_cheese_and_fries': { modifications: [], canBeModified: false },
  'macaroni_and_cheese': { modifications: [], canBeModified: false },

  // BRUNCH
  'classic_breakfast': { modifications: ['NO butter when cooking eggs', 'NO breakfast potatoes and onions', 'NO butter on toast'], canBeModified: true },
  'avocado_toast': { modifications: ['NO butter on toast', 'NO cheese in eggs'], canBeModified: true },
  'steak_and_eggs': { modifications: [], canBeModified: true },
  'eggs_benedict': { modifications: [], canBeModified: false },
  'wildfire_pancakes': { modifications: [], canBeModified: false },

  // SPECIAL MENU
  'roasted_vegetable_vegan_plate': { modifications: [], canBeModified: true },
  'pasta_and_roasted_vegetable_pasta': { modifications: ['NO garlic butter', 'NO tomato basil sauce', 'NO goat cheese', 'NO asiago', 'SUB tomato jam'], canBeModified: true },
};

// Helper to escape SQL strings
function escapeSql(str: string | null | undefined): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

// Helper to format array for PostgreSQL
function formatArray(arr: string[]): string {
  if (!arr || arr.length === 0) return "'{}'";
  const escaped = arr.map(s => s.replace(/'/g, "''").replace(/"/g, '\\"'));
  return `ARRAY[${escaped.map(s => `'${s}'`).join(', ')}]`;
}

// Generate SQL
function generateSQL() {
  console.log('-- Wildfire Allergy Checker - Data Migration');
  console.log('-- Generated: ' + new Date().toISOString());
  console.log('-- =============================================\n');

  // Insert menu items
  console.log('-- MENU ITEMS');
  console.log('-- -----------\n');
  
  for (const item of menuItems) {
    console.log(`INSERT INTO menu_items (id, dish_name, ticket_code, category, menu, description, ingredients, notes, mod_notes, cannot_be_made_safe_notes)`);
    console.log(`VALUES (`);
    console.log(`  ${escapeSql(item.id)},`);
    console.log(`  ${escapeSql(item.dish_name)},`);
    console.log(`  ${escapeSql(item.ticket_code)},`);
    console.log(`  ${escapeSql(item.category)},`);
    console.log(`  ${escapeSql(item.menu)},`);
    console.log(`  ${escapeSql(item.description)},`);
    console.log(`  ${formatArray(item.ingredients || [])},`);
    console.log(`  ${escapeSql(item.notes)},`);
    console.log(`  ${escapeSql(item.mod_notes)},`);
    console.log(`  ${escapeSql(item.cannot_be_made_safe_notes)}`);
    console.log(`) ON CONFLICT (id) DO UPDATE SET`);
    console.log(`  dish_name = EXCLUDED.dish_name,`);
    console.log(`  description = EXCLUDED.description,`);
    console.log(`  ingredients = EXCLUDED.ingredients;\n`);
  }

  // Insert dairy modifications
  console.log('\n-- DAIRY MODIFICATIONS');
  console.log('-- -------------------\n');
  
  for (const [dishId, mod] of Object.entries(dairyModifications)) {
    console.log(`INSERT INTO dairy_modifications (dish_id, modifications, can_be_modified)`);
    console.log(`VALUES (`);
    console.log(`  ${escapeSql(dishId)},`);
    console.log(`  ${formatArray(mod.modifications)},`);
    console.log(`  ${mod.canBeModified}`);
    console.log(`) ON CONFLICT (dish_id) DO UPDATE SET`);
    console.log(`  modifications = EXCLUDED.modifications,`);
    console.log(`  can_be_modified = EXCLUDED.can_be_modified;\n`);
  }
}

generateSQL();
