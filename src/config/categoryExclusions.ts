/**
 * Category Exclusion Configuration
 *
 * Centralized list of dishes that should be excluded from specific category outputs.
 * All dish names are stored in normalized form (lowercase, trimmed, collapsed whitespace).
 *
 * Use this configuration in category filtering logic to remove dishes from their
 * category listings without modifying the source data.
 */

import { normalizeDishName } from '../utils/normalizeDishName';

/**
 * Map of category names to arrays of excluded dish names (normalized)
 * 
 * NOTE: Exclusions disabled - app now shows exactly what's in Supabase database.
 * If you need to hide items, update the database directly (set is_active=false).
 */
export const CATEGORY_EXCLUSIONS: Record<string, string[]> = {
  // All exclusions removed - data comes directly from Supabase
};

/**
 * Check if a dish should be excluded from a specific category
 *
 * @param categoryName - The category name (will be normalized)
 * @param dishName - The dish name to check (will be normalized)
 * @returns true if the dish should be excluded from this category
 */
export function isDishExcludedFromCategory(categoryName: string, dishName: string): boolean {
  const normalizedCategory = normalizeDishName(categoryName);
  const normalizedDish = normalizeDishName(dishName);

  const exclusions = CATEGORY_EXCLUSIONS[normalizedCategory];
  if (!exclusions) return false;

  return exclusions.includes(normalizedDish);
}

/**
 * Filter a list of dishes to remove excluded ones for a specific category
 *
 * @param categoryName - The category name
 * @param dishes - Array of dishes (objects with dish_name property)
 * @returns Filtered array with exclusions removed
 */
export function filterExcludedDishes<T extends { dish_name: string }>(
  categoryName: string,
  dishes: T[]
): T[] {
  return dishes.filter(dish => !isDishExcludedFromCategory(categoryName, dish.dish_name));
}
