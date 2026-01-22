/**
 * Modifications Cache
 * 
 * Pre-loads allergen modifications from Supabase and provides
 * synchronous access for the allergy checker.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Allergen } from '../types';

type SpecialModification = {
  modifications: string[];
  canBeModified: boolean;
};

// Cache structure: allergen -> dishId -> modification
const modificationsCache: Map<Allergen, Map<string, SpecialModification>> = new Map();
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

// Map allergen type to table name
const allergenToTable: Record<Allergen, string> = {
  dairy: 'dairy_modifications',
  gluten: 'gluten_modifications',
  shellfish: 'shellfish_modifications',
  fish: 'fish_modifications',
  egg: 'egg_modifications',
  soy: 'soy_modifications',
  peanuts: 'peanut_modifications',
  tree_nuts: 'tree_nut_modifications',
  sesame: 'sesame_modifications',
  msg: 'msg_modifications',
  onion_garlic: 'onion_garlic_modifications',
  tomato: 'tomato_modifications',
  seed: 'seed_modifications',
};

/**
 * Load modifications for a single allergen from Supabase
 */
async function loadAllergenModifications(allergen: Allergen): Promise<Map<string, SpecialModification>> {
  const modMap = new Map<string, SpecialModification>();
  
  if (!isSupabaseConfigured() || !supabase) {
    return modMap;
  }

  const tableName = allergenToTable[allergen];
  if (!tableName) {
    return modMap;
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('dish_id, modifications, can_be_modified');

    if (error) {
      console.error(`[ModCache] Error loading ${allergen}:`, error);
      return modMap;
    }

    // Cast data since Supabase types are dynamic for variable table names
    for (const row of (data as Record<string, unknown>[] || [])) {
      modMap.set(row.dish_id as string, {
        modifications: (row.modifications as string[]) || [],
        canBeModified: row.can_be_modified as boolean,
      });
    }

    console.log(`[ModCache] Loaded ${modMap.size} ${allergen} modifications`);
  } catch (err) {
    console.error(`[ModCache] Error:`, err);
  }

  return modMap;
}

/**
 * Load all allergen modifications from Supabase
 */
export async function loadAllModifications(): Promise<void> {
  // Return existing promise if already loading
  if (loadPromise) {
    return loadPromise;
  }

  // Skip if already loaded
  if (isLoaded) {
    return;
  }

  loadPromise = (async () => {
    if (!isSupabaseConfigured()) {
      console.log('[ModCache] Supabase not configured, using static fallback');
      isLoaded = true;
      return;
    }

    console.log('[ModCache] Loading modifications from Supabase...');
    const startTime = performance.now();

    const allergens: Allergen[] = [
      'dairy', 'gluten', 'shellfish', 'fish', 'egg', 'soy',
      'peanuts', 'tree_nuts', 'sesame', 'msg', 'onion_garlic', 'tomato', 'seed'
    ];

    // Load all allergens in parallel
    const results = await Promise.all(
      allergens.map(async (allergen) => {
        const mods = await loadAllergenModifications(allergen);
        return { allergen, mods };
      })
    );

    // Store in cache
    for (const { allergen, mods } of results) {
      modificationsCache.set(allergen, mods);
    }

    const loadTime = performance.now() - startTime;
    console.log(`[ModCache] Loaded all modifications in ${loadTime.toFixed(2)}ms`);
    isLoaded = true;
    loadPromise = null;
  })();

  return loadPromise;
}

/**
 * Get modification for a specific dish and allergen (synchronous)
 * Returns null if not found in cache
 */
export function getCachedModification(dishId: string, allergen: Allergen): SpecialModification | null {
  const allergenCache = modificationsCache.get(allergen);
  if (!allergenCache) {
    return null;
  }
  return allergenCache.get(dishId) || null;
}

/**
 * Check if modifications have been loaded from database
 */
export function isModificationsCacheLoaded(): boolean {
  return isLoaded;
}

/**
 * Check if we have database modifications (vs static fallback)
 */
export function hasDbModifications(): boolean {
  return isLoaded && modificationsCache.size > 0 && isSupabaseConfigured();
}

/**
 * Clear the cache (useful for refresh)
 */
export function clearModificationsCache(): void {
  modificationsCache.clear();
  isLoaded = false;
  loadPromise = null;
}

/**
 * Get count of cached modifications for debugging
 */
export function getCacheStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const [allergen, mods] of modificationsCache) {
    stats[allergen] = mods.size;
  }
  return stats;
}
