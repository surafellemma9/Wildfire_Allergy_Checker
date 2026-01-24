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
  'Party': { id: 'party', name: 'Party', sortOrder: 15 },
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
  { id: 'onion', name: 'Onion', icon: '🧅' },
  { id: 'garlic', name: 'Garlic', icon: '🧄' },
];

// ============================================================================
// Comprehensive Allergen Modifications Database
// ============================================================================

type ModStatus = 'safe' | 'modifiable' | 'not_modifiable';

interface AllergenMod {
  status: ModStatus;
  modifications: string[];
}

// Master allergen modifications database
// Key: normalized dish name, Value: allergen -> modification rules
const ALLERGEN_MODIFICATIONS: Record<string, Record<string, AllergenMod>> = {
  // ========== APPETIZERS ==========
  'mediterranean chicken skewers': {
    dairy: { status: 'modifiable', modifications: ['NO yogurt sauce'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO chicken jus'] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'shrimp cocktail': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'not_modifiable', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'modifiable', modifications: ['NO cocktail sauce'] },
  },
  'crab cakes': {
    dairy: { status: 'modifiable', modifications: ['NO mustard mayonnaise'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'not_modifiable', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'bacon wrapped sea scallop skewers': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'not_modifiable', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO apricot dipping sauce', 'NO chives'] },
    garlic: { status: 'modifiable', modifications: ['NO apricot dipping sauce'] },
  },
  'baked goat cheese': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'modifiable', modifications: ['NO breadcrumbs', 'NO focaccia', 'SUB gluten free bun'] },
    soy: { status: 'modifiable', modifications: ['NO focaccia'] },
    egg: { status: 'safe', modifications: [] },
  },
  'baked french onion soup': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'modifiable', modifications: ['NO crouton', 'SUB gluten free crouton'] },
    soy: { status: 'modifiable', modifications: ['NO crouton'] },
    egg: { status: 'safe', modifications: [] },
  },

  // ========== SALADS ==========
  'field salad': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'caesar salad': {
    dairy: { status: 'modifiable', modifications: ['NO croutons'] },
    gluten: { status: 'modifiable', modifications: ['NO croutons', 'SUB gluten free croutons'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO croutons'] },
    egg: { status: 'modifiable', modifications: ['NO Caesar dressing', 'SUB oil and vinegar'] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'tuscan kale salad': {
    dairy: { status: 'modifiable', modifications: ['NO cheese', 'NO dressing'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    peanuts: { status: 'modifiable', modifications: ['NO walnuts'] },
    tree_nuts: { status: 'modifiable', modifications: ['NO walnuts'] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'modifiable', modifications: ['NO lemon parmesan vinaigrette'] },
  },
  'greek salad': {
    dairy: { status: 'modifiable', modifications: ['NO feta cheese', 'NO dressing'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO red onion'] },
    garlic: { status: 'modifiable', modifications: ['NO red wine vinaigrette'] },
  },
  'steak and blue cheese salad': {
    dairy: { status: 'modifiable', modifications: ['NO cheese', 'NO crispy onions', 'NO ranch dressing'] },
    gluten: { status: 'modifiable', modifications: ['NO crispy onions'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO crispy onions'] },
    egg: { status: 'safe', modifications: [] },
    peanuts: { status: 'modifiable', modifications: ['NO candied walnuts'] },
    tree_nuts: { status: 'modifiable', modifications: ['NO candied walnuts'] },
    onion: { status: 'modifiable', modifications: ['NO balsamic vinaigrette', 'NO scallions', 'NO crispy onions', 'NO ranch dressing'] },
    garlic: { status: 'modifiable', modifications: ['NO marinade on steak', 'NO scallions', 'NO crispy onions', 'NO balsamic vinaigrette', 'NO ranch dressing'] },
  },
  'wildfire chopped salad': {
    dairy: { status: 'modifiable', modifications: ['NO marinated chicken', 'NO blue cheese', 'NO tortillas'] },
    gluten: { status: 'modifiable', modifications: ['NO corn tortillas', 'SUB gluten free tortilla chips'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO crispy tortillas'] },
    egg: { status: 'modifiable', modifications: ['NO egg'] },
    onion: { status: 'modifiable', modifications: ['NO scallions', 'NO chicken', 'SUB plain chicken', 'NO tortillas', 'NO citrus dressing'] },
    garlic: { status: 'modifiable', modifications: ['NO citrus vinaigrette', 'NO chicken', 'SUB plain chicken', 'NO tortillas'] },
  },

  // ========== BURGERS & SANDWICHES ==========
  'thick prime angus burger': {
    dairy: { status: 'modifiable', modifications: ['NO butter on bun', 'NO coleslaw', 'NO fries'] },
    gluten: { status: 'modifiable', modifications: ['NO bun', 'SUB gluten free bun', 'NO fries'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO bun'] },
    egg: { status: 'modifiable', modifications: ['NO mayonnaise', 'NO bun'] },
    sesame: { status: 'modifiable', modifications: ['NO sesame seed bun', 'SUB multi grain bun or GF bun'] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'modifiable', modifications: ['NO fries'] },
  },
  'bison burger': {
    dairy: { status: 'modifiable', modifications: ['NO butter on bun', 'NO coleslaw', 'NO fries'] },
    gluten: { status: 'modifiable', modifications: ['NO bun', 'SUB gluten free bun'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO bun'] },
    egg: { status: 'modifiable', modifications: ['NO mayonnaise', 'NO bun'] },
    sesame: { status: 'modifiable', modifications: ['NO sesame seed bun', 'SUB multi grain bun or GF bun'] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'modifiable', modifications: ['NO fries'] },
  },
  'turkey burger': {
    dairy: { status: 'modifiable', modifications: ['NO cheese', 'NO butter on bun'] },
    gluten: { status: 'modifiable', modifications: ['NO bun', 'NO char-crust', 'SUB gluten free bun'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO bun'] },
    egg: { status: 'modifiable', modifications: ['NO bun'] },
    sesame: { status: 'modifiable', modifications: ['NO sesame seed bun', 'SUB multi grain bun or GF bun'] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'grilled chicken club': {
    dairy: { status: 'modifiable', modifications: ['SUB plain chicken', 'NO cheese', 'NO mustard mayonnaise', 'NO butter on bun'] },
    gluten: { status: 'modifiable', modifications: ['NO bun', 'SUB gluten free bun'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO bun'] },
    egg: { status: 'modifiable', modifications: ['SUB plain chicken', 'NO mustard mayonnaise', 'NO bun'] },
    sesame: { status: 'modifiable', modifications: ['NO sesame seed bun', 'SUB multi grain bun or GF bun'] },
    onion: { status: 'modifiable', modifications: ['NO mustard mayo chicken', 'SUB plain chicken', 'NO mustard mayo'] },
    garlic: { status: 'modifiable', modifications: ['NO mustard mayonnaise', 'NO marinated chicken', 'SUB plain chicken', 'NO fries'] },
  },
  'prime rib french dip': {
    dairy: { status: 'modifiable', modifications: ['NO butter on bread', 'NO horseradish cream sauce'] },
    gluten: { status: 'modifiable', modifications: ['NO bun', 'SUB gluten free bun'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO bun'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO buttery onion bun', 'NO au jus'] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'sliced turkey sandwich': {
    dairy: { status: 'modifiable', modifications: ['NO cheese', 'NO butter on bread'] },
    gluten: { status: 'modifiable', modifications: ['NO wheat bread', 'SUB gluten free bun'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO bread'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'modifiable', modifications: ['NO fries'] },
  },
  'open faced mediterranean salmon': {
    dairy: { status: 'modifiable', modifications: ['NO yogurt sauce', 'NO butter on bread'] },
    gluten: { status: 'modifiable', modifications: ['NO bun', 'SUB gluten free bun'] },
    fish: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO bread'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'modifiable', modifications: ['NO yogurt drizzle', 'NO red wine vinaigrette on arugula', 'NO fries'] },
  },
  'blackened new york steak sandwich': {
    dairy: { status: 'modifiable', modifications: ['NO butter on bun', 'NO ancho mayo'] },
    gluten: { status: 'modifiable', modifications: ['NO bun', 'SUB gluten free bun'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO bun'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO blackening spice', 'NO buttery onion bun', 'NO ancho mayo'] },
    garlic: { status: 'modifiable', modifications: ['NO blackening spice', 'NO ancho mayo', 'NO fries'] },
  },

  // ========== STEAKS & CHOPS ==========
  'basil haydens bourbon marinated tenderloin tips': {
    dairy: { status: 'modifiable', modifications: ['NO steak butter', 'NO pre-marking butter'] },
    gluten: { status: 'modifiable', modifications: ['GF steak butter'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO bourbon marinade', 'NO steak butter', 'NO au jus', 'NO roasted red onions'] },
    garlic: { status: 'modifiable', modifications: ['NO bourbon marinade', 'NO steak butter', 'NO au jus', 'NO roasted red onions'] },
  },
  'petite filet mignon': {
    dairy: { status: 'modifiable', modifications: ['NO pre-marking butter', 'NO steak butter', 'NO garlic crouton'] },
    gluten: { status: 'modifiable', modifications: ['NO crouton', 'GF steak butter'] },
    shellfish: { status: 'modifiable', modifications: ['NO Oscar style'] },
    soy: { status: 'modifiable', modifications: ['NO crouton'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO au jus', 'NO steak butter'] },
    garlic: { status: 'modifiable', modifications: ['NO steak butter', 'NO garlic crouton', 'NO au jus'] },
  },
  'filet mignon': {
    dairy: { status: 'modifiable', modifications: ['NO pre-marking butter', 'NO steak butter', 'NO garlic crouton'] },
    gluten: { status: 'modifiable', modifications: ['NO crouton', 'GF steak butter'] },
    shellfish: { status: 'modifiable', modifications: ['NO Oscar style'] },
    soy: { status: 'modifiable', modifications: ['NO crouton'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO au jus', 'NO steak butter'] },
    garlic: { status: 'modifiable', modifications: ['NO steak butter', 'NO garlic crouton', 'NO au jus'] },
  },
  'bone-in pork chops': {
    dairy: { status: 'modifiable', modifications: ['NO mushroom crust', 'NO steak butter'] },
    gluten: { status: 'modifiable', modifications: ['NO mushroom crust', 'GF steak butter'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO mushroom crust', 'NO au jus'] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'roumanian skirt steak': {
    dairy: { status: 'modifiable', modifications: ['NO steak butter', 'NO pre-marking butter'] },
    gluten: { status: 'modifiable', modifications: ['GF steak butter'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO steak marinade', 'NO steak butter', 'NO au jus', 'NO red onions'] },
    garlic: { status: 'modifiable', modifications: ['NO steak marinade', 'NO steak butter', 'NO au jus', 'NO red onions'] },
  },
  'new york strip steak': {
    dairy: { status: 'modifiable', modifications: ['NO steak butter', 'NO pre-marking butter'] },
    gluten: { status: 'modifiable', modifications: ['GF steak butter'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO steak butter', 'NO au jus'] },
    garlic: { status: 'modifiable', modifications: ['NO steak butter', 'NO au jus'] },
  },
  'porterhouse': {
    dairy: { status: 'modifiable', modifications: ['NO char-crust', 'NO steak butter', 'NO pre-marking butter'] },
    gluten: { status: 'modifiable', modifications: ['NO char-crust', 'GF steak butter'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO char crust', 'NO steak butter', 'NO au jus'] },
    garlic: { status: 'modifiable', modifications: ['NO char-crust', 'NO steak butter', 'NO au jus'] },
  },
  'bone-in ribeye': {
    dairy: { status: 'modifiable', modifications: ['NO char-crust', 'NO steak butter', 'NO pre-marking butter'] },
    gluten: { status: 'modifiable', modifications: ['NO char-crust', 'GF steak butter'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO char crust', 'NO steak butter', 'NO au jus'] },
    garlic: { status: 'modifiable', modifications: ['NO char-crust', 'NO steak butter', 'NO au jus'] },
  },
  'lamb porterhouse chops': {
    dairy: { status: 'modifiable', modifications: ['NO char-crust', 'NO steak butter', 'NO pre-marking butter'] },
    gluten: { status: 'modifiable', modifications: ['NO char-crust', 'GF steak butter'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO char-crust', 'NO steak butter', 'NO au jus', 'NO mint chimichurri'] },
    garlic: { status: 'modifiable', modifications: ['NO char-crust', 'NO steak butter', 'NO au jus', 'NO mint chimichurri'] },
  },
  'prime rib': {
    dairy: { status: 'modifiable', modifications: ['NO horseradish cream sauce'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO au jus'] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },

  // ========== SEAFOOD ==========
  'cedar planked salmon': {
    dairy: { status: 'modifiable', modifications: ['NO glaze'] },
    gluten: { status: 'safe', modifications: [] },
    fish: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO glaze'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO BBQ chicken spice'] },
    garlic: { status: 'modifiable', modifications: ['NO BBQ chicken spice'] },
  },
  'halibut': {
    dairy: { status: 'modifiable', modifications: ['NO crust', 'NO butter'] },
    gluten: { status: 'modifiable', modifications: ['NO flour', 'NO breadcrumbs', 'SUB GF breadcrumbs'] },
    fish: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'coconut shrimp': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'not_modifiable', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },

  // ========== CHICKEN & BBQ ==========
  'spit roasted half chicken': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'barbecue half chicken': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO BBQ sauce'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'lemon pepper chicken breast': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'chicken moreno': {
    dairy: { status: 'modifiable', modifications: ['NO goat cheese'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'baby back ribs': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO BBQ sauce'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO barbeque sauce'] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'rib and chicken combo': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO BBQ sauce'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },

  // ========== SIDES ==========
  'mashed potatoes': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'broccoli': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO lemon herb vinaigrette'] },
    garlic: { status: 'modifiable', modifications: ['NO lemon herb vinaigrette'] },
  },
  'roasted vegetables': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'au gratin potatoes': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'baked potato': {
    dairy: { status: 'modifiable', modifications: ['NO butter', 'NO sour cream'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'idaho baked potato': {
    dairy: { status: 'modifiable', modifications: ['NO sour cream', 'NO butter'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'sweet potato': {
    dairy: { status: 'modifiable', modifications: ['NO butter', 'NO sour cream'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'bbq rubbed sweet potato': {
    dairy: { status: 'modifiable', modifications: ['NO butter'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'mushroom caps': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'loaded baked potato': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO scallions'] },
    garlic: { status: 'modifiable', modifications: ['NO scallions'] },
  },
  'french fries': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'not_modifiable', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'mac and cheese': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'creamed spinach': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'coleslaw': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'applesauce': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },

  // ========== KIDS MENU ==========
  'kids burger': {
    dairy: { status: 'modifiable', modifications: ['NO fries', 'SUB mashed potatoes or broccoli', 'NO butter on bun', 'NO coleslaw'] },
    gluten: { status: 'modifiable', modifications: ['NO fries', 'NO bun', 'SUB mashed potatoes or broccoli', 'SUB gluten free bun'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO bun', 'NO fries'] },
    egg: { status: 'modifiable', modifications: ['NO bun'] },
    sesame: { status: 'modifiable', modifications: ['NO kids bun', 'SUB multi grain bun or GF bun'] },
    onion: { status: 'modifiable', modifications: ['NO fries'] },
    garlic: { status: 'modifiable', modifications: ['NO fries'] },
  },
  'kids cheeseburger': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'modifiable', modifications: ['NO fries', 'NO bun', 'SUB mashed potatoes or broccoli', 'SUB gluten free bun'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO bun', 'NO fries'] },
    egg: { status: 'modifiable', modifications: ['NO bun'] },
    onion: { status: 'modifiable', modifications: ['NO fries'] },
    garlic: { status: 'modifiable', modifications: ['NO fries'] },
  },
  'kids filet': {
    dairy: { status: 'modifiable', modifications: ['NO steak butter'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO steak butter', 'NO au jus'] },
    garlic: { status: 'modifiable', modifications: ['NO steak butter', 'NO au jus'] },
  },
  'kids grilled cheese': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'modifiable', modifications: ['NO bread', 'SUB gluten free bun'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO bread'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO fries'] },
    garlic: { status: 'modifiable', modifications: ['NO fries'] },
  },
  'kids macaroni and cheese': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },

  // ========== DESSERTS ==========
  'flourless chocolate cake': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    peanuts: { status: 'not_modifiable', modifications: [] },
    tree_nuts: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'seasonal crisp': {
    dairy: { status: 'modifiable', modifications: ['NO ice cream', 'SUB whipped cream'] },
    gluten: { status: 'modifiable', modifications: ['NO ice cream', 'SUB whipped cream'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'chocolate layer cake': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'new york style cheesecake': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'key lime pie': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },

  // ========== BRUNCH ==========
  'classic breakfast': {
    dairy: { status: 'modifiable', modifications: ['NO butter on toast'] },
    gluten: { status: 'modifiable', modifications: ['NO sausage', 'NO toast', 'SUB gluten free bun'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO toast'] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO breakfast potatoes'] },
    garlic: { status: 'safe', modifications: [] },
  },
  'avocado toast': {
    dairy: { status: 'safe', modifications: [] },
    gluten: { status: 'modifiable', modifications: ['NO toast', 'SUB gluten free bun'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO toast'] },
    egg: { status: 'modifiable', modifications: ['NO egg'] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'spinach and kale frittata': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'modifiable', modifications: ['NO balsamic vinaigrette'] },
  },
  'skirt steak and eggs': {
    dairy: { status: 'modifiable', modifications: ['NO pre-marking butter'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'modifiable', modifications: ['NO egg'] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'kids scramble': {
    dairy: { status: 'modifiable', modifications: ['NO cheese'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'turkey sausage breakfast burrito': {
    dairy: { status: 'modifiable', modifications: ['NO cheese', 'NO sour cream'] },
    gluten: { status: 'modifiable', modifications: ['NO tortilla'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'modifiable', modifications: ['NO pico de gallo', 'NO breakfast potatoes', 'NO ranchero sauce', 'NO guacamole'] },
    garlic: { status: 'safe', modifications: [] },
  },
  'buttermilk pancakes': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },
  'french toast': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'safe', modifications: [] },
    garlic: { status: 'safe', modifications: [] },
  },

  // ========== NIGHTLY SPECIALS ==========
  'southern fried chicken': {
    dairy: { status: 'modifiable', modifications: ['NO mashed potatoes'] },
    gluten: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'spit roasted half long island duck': {
    dairy: { status: 'modifiable', modifications: ['NO cherry glaze', 'NO wild rice'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO cherry glaze'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'modifiable', modifications: ['NO wild rice', 'NO cherry sauce'] },
  },
  'braised short ribs': {
    dairy: { status: 'modifiable', modifications: ['NO mashed potatoes'] },
    gluten: { status: 'safe', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'filet mignon wellington': {
    dairy: { status: 'not_modifiable', modifications: [] },
    gluten: { status: 'not_modifiable', modifications: [] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'safe', modifications: [] },
    egg: { status: 'not_modifiable', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
  'roast turkey': {
    dairy: { status: 'modifiable', modifications: ['NO gravy', 'NO mashed potatoes'] },
    gluten: { status: 'modifiable', modifications: ['NO stuffing', 'NO gravy'] },
    shellfish: { status: 'safe', modifications: [] },
    soy: { status: 'modifiable', modifications: ['NO gravy'] },
    egg: { status: 'safe', modifications: [] },
    onion: { status: 'not_modifiable', modifications: [] },
    garlic: { status: 'not_modifiable', modifications: [] },
  },
};

// Helper to normalize dish names for lookup
function normalizeDishName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Get allergen modifications for a dish
function getAllergenModsForDish(dishName: string): Record<string, AllergenMod> | null {
  const normalized = normalizeDishName(dishName);
  
  // Direct match
  if (ALLERGEN_MODIFICATIONS[normalized]) {
    return ALLERGEN_MODIFICATIONS[normalized];
  }
  
  // Partial match - find the best match
  for (const [key, mods] of Object.entries(ALLERGEN_MODIFICATIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return mods;
    }
  }
  
  return null;
}

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
  
  // Get comprehensive allergen modifications for this dish
  const dishMods = getAllergenModsForDish(item.dish_name);
  
  // Build rules for allergens with CSV fields
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
  ];
  
  for (const { field, id } of allergenFields) {
    const contains = item[field] === 'Y';
    const modRule = dishMods?.[id];
    
    if (modRule) {
      // We have specific modification rules for this allergen
      if (modRule.status === 'safe') {
        rules[id] = { status: 'SAFE' };
      } else if (modRule.status === 'not_modifiable') {
        rules[id] = {
          status: 'UNSAFE',
          notes: `Cannot be made safe for ${id} allergy`,
        };
      } else if (modRule.status === 'modifiable') {
        if (modRule.modifications.length === 0) {
          // Modifiable but no changes needed
          rules[id] = { status: 'SAFE' };
        } else {
          rules[id] = {
            status: 'MODIFY',
            substitutions: modRule.modifications,
          };
        }
      }
    } else if (contains) {
      // Contains allergen but no specific rules - mark as UNKNOWN
      rules[id] = {
        status: 'UNKNOWN',
        notes: 'Please verify modifications with chef',
      };
    } else {
      // Doesn't contain - safe
      rules[id] = { status: 'SAFE' };
    }
  }
  
  // Add onion and garlic rules (no CSV fields for these)
  const extraAllergens = ['onion', 'garlic'];
  for (const id of extraAllergens) {
    const modRule = dishMods?.[id];
    
    if (modRule) {
      if (modRule.status === 'safe') {
        rules[id] = { status: 'SAFE' };
      } else if (modRule.status === 'not_modifiable') {
        rules[id] = {
          status: 'UNSAFE',
          notes: `Cannot be made safe for ${id} allergy`,
        };
      } else if (modRule.status === 'modifiable') {
        if (modRule.modifications.length === 0) {
          rules[id] = { status: 'SAFE' };
        } else {
          rules[id] = {
            status: 'MODIFY',
            substitutions: modRule.modifications,
          };
        }
      }
    } else {
      // No specific rule - mark as UNKNOWN for onion/garlic
      rules[id] = {
        status: 'UNKNOWN',
        notes: 'Please verify modifications with chef',
      };
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
