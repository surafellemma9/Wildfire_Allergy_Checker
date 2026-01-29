/**
 * Category Exclusions Configuration
 *
 * Defines which dishes should be excluded from specific categories.
 * All dish names are normalized for comparison (trim, collapse whitespace, lowercase).
 */

import { normalizeDishName } from '../utils/normalizeDishName';

/**
 * Map of category name (normalized) to array of excluded dish names (normalized)
 */
export const CATEGORY_EXCLUSIONS: Record<string, string[]> = {
  // Appetizers - remove these dishes
  'appetizers': [
    normalizeDishName('Sea scallops'),
  ],

  // Salads - remove these dishes
  'salads': [
    normalizeDishName('Steak and Blue Cheese Salad'),
    normalizeDishName('Tuscan Kale and Spinach Salad'),
    normalizeDishName('Wildfire Chopped Salad'),
  ],

  // Sides - remove these dishes (Baked Potato is added separately)
  'sides': [
    normalizeDishName('Broccoli with Lemon Vinaigrette'),
    normalizeDishName('Steamed Broccoli'),
  ],

  // Sandwiches - remove these dishes
  'sandwiches': [
    normalizeDishName('Grilled Chicken Club'),
    normalizeDishName('Blackened New York Steak Sandwich'),
    normalizeDishName('Open Faced Mediterranean Salmon'),
    normalizeDishName('Prime Rib French Dip'),
    normalizeDishName('Sliced Turkey Sandwich'),
    normalizeDishName('Thick Prime Angus Burger'),
  ],

  // Steaks & Filets - remove these dishes
  'steaks & filets': [
    normalizeDishName('Filet Mignon'),
  ],
  'steaks and filets': [
    normalizeDishName('Filet Mignon'),
  ],
  'steaks_filets': [
    normalizeDishName('Filet Mignon'),
  ],
};

/**
 * Check if a dish should be excluded from a category
 *
 * @param categoryName - The category name (will be normalized)
 * @param dishName - The dish name (will be normalized)
 * @returns true if the dish should be excluded from this category
 */
export function isDishExcludedFromCategory(categoryName: string, dishName: string): boolean {
  const normalizedCategory = normalizeDishName(categoryName);
  const normalizedDish = normalizeDishName(dishName);

  const exclusions = CATEGORY_EXCLUSIONS[normalizedCategory];
  if (!exclusions) return false;

  return exclusions.includes(normalizedDish);
}
