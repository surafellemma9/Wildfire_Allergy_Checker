/**
 * Menu Data Service
 * 
 * Fetches menu items and allergen modifications from Supabase.
 * Falls back to static data if Supabase is not configured.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { AllergenType, AllergenModification } from '../lib/database.types';
import { allergenToTable } from '../lib/database.types';
import type { MenuItem } from '../types';

// Cache for menu items and modifications
let menuItemsCache: MenuItem[] | null = null;
let modificationsCache: Map<AllergenType, Map<string, AllergenModification>> = new Map();

/**
 * Fetch all menu items from Supabase
 */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  // Return cached data if available
  if (menuItemsCache) {
    return menuItemsCache;
  }

  // If Supabase is not configured, fall back to static data
  if (!isSupabaseConfigured() || !supabase) {
    console.log('[MenuService] Supabase not configured, using static data');
    const { menuItems } = await import('../data/menu-items');
    menuItemsCache = menuItems;
    return menuItems;
  }

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('[MenuService] Error fetching menu items:', error);
      // Fall back to static data
      const { menuItems } = await import('../data/menu-items');
      menuItemsCache = menuItems;
      return menuItems;
    }

    // Transform to MenuItem type
    // Cast data to any[] since Supabase types are dynamic
    const items: MenuItem[] = (data as Record<string, unknown>[]).map(item => ({
      id: item.id as string,
      dish_name: item.dish_name as string,
      ticket_code: (item.ticket_code as string) || '',
      category: item.category as string,
      menu: item.menu as string,
      description: item.description as string,
      ingredients: (item.ingredients as string[]) || [],
      notes: (item.notes as string) || '',
      mod_notes: (item.mod_notes as string) || '',
      cannot_be_made_safe_notes: (item.cannot_be_made_safe_notes as string) || '',
      // Legacy fields for compatibility
      allergy_raw: '',
      contains_dairy: 'N',
      contains_egg: 'N',
      contains_gluten: 'N',
      contains_shellfish: 'N',
      contains_fish: 'N',
      contains_soy: 'N',
      contains_nuts: 'N',
      contains_peanuts: 'N',
      contains_tree_nuts: 'N',
      contains_sesame: 'N',
      contains_msg: 'N',
    }));

    menuItemsCache = items;
    console.log(`[MenuService] Loaded ${items.length} menu items from Supabase`);
    return items;
  } catch (err) {
    console.error('[MenuService] Error:', err);
    // Fall back to static data
    const { menuItems } = await import('../data/menu-items');
    menuItemsCache = menuItems;
    return menuItems;
  }
}

/**
 * Fetch allergen modifications for a specific allergen
 */
export async function fetchAllergenModifications(
  allergen: AllergenType
): Promise<Map<string, AllergenModification>> {
  // Return cached data if available
  if (modificationsCache.has(allergen)) {
    return modificationsCache.get(allergen)!;
  }

  const tableName = allergenToTable[allergen];
  if (!tableName) {
    console.warn(`[MenuService] Unknown allergen: ${allergen}`);
    return new Map();
  }

  // If Supabase is not configured, return empty map (use static fallback)
  if (!isSupabaseConfigured() || !supabase) {
    return new Map();
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`[MenuService] Error fetching ${allergen} modifications:`, error);
      return new Map();
    }

    const modMap = new Map<string, AllergenModification>();
    // Cast data since Supabase types are dynamic for variable table names
    for (const mod of (data as Record<string, unknown>[])) {
      modMap.set(mod.dish_id as string, {
        id: mod.id as string,
        dish_id: mod.dish_id as string,
        modifications: (mod.modifications as string[]) || [],
        can_be_modified: mod.can_be_modified as boolean,
        notes: mod.notes as string | null,
      });
    }

    modificationsCache.set(allergen, modMap);
    console.log(`[MenuService] Loaded ${modMap.size} ${allergen} modifications from Supabase`);
    return modMap;
  } catch (err) {
    console.error(`[MenuService] Error fetching ${allergen} modifications:`, err);
    return new Map();
  }
}

/**
 * Get modification for a specific dish and allergen
 */
export async function getDishModification(
  dishId: string,
  allergen: AllergenType
): Promise<AllergenModification | null> {
  const modifications = await fetchAllergenModifications(allergen);
  return modifications.get(dishId) || null;
}

/**
 * Fetch all modifications for all allergens
 */
export async function fetchAllModifications(): Promise<Map<AllergenType, Map<string, AllergenModification>>> {
  const allergens: AllergenType[] = [
    'dairy', 'gluten', 'shellfish', 'fish', 'egg', 'soy',
    'peanuts', 'tree_nuts', 'sesame', 'msg', 'onion_garlic', 'tomato', 'seed'
  ];

  await Promise.all(allergens.map(a => fetchAllergenModifications(a)));
  return modificationsCache;
}

/**
 * Clear all caches (useful for refreshing data)
 */
export function clearCache() {
  menuItemsCache = null;
  modificationsCache.clear();
}

/**
 * Check if we're using Supabase or static data
 */
export function isUsingSupabase(): boolean {
  return isSupabaseConfigured();
}
