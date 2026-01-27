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
 */
export const CATEGORY_EXCLUSIONS: Record<string, string[]> = {
  // Appetizers - remove these dishes
  'appetizers': [
    normalizeDishName('Sea scallops'),
    normalizeDishName('Applewood Smoked Bacon Wrapped Sea Scallops Skewers'), // Full name variant
    normalizeDishName('Oven Roasted Lump Crab Cakes'),
    normalizeDishName('Crispy Calmari'),
    normalizeDishName('Baked French Onion Soup'),
  ],

  // Salads - remove these dishes
  'salads': [
    normalizeDishName('Steak and Blue Cheese Salad'),
    normalizeDishName('Tuscan Kale and Spinach Salad'),
    normalizeDishName('Wildfire Chopped Salad'),
  ],

  // Sides - remove these dishes
  'sides': [
    normalizeDishName('Broccoli with Lemon Vinaigrette'),
    normalizeDishName('Steamed Broccoli'),
  ],

  // Sandwiches - remove these dishes (including all sandwich categories)
  'sandwiches': [
    normalizeDishName('Grilled Chicken Club'),
    normalizeDishName('Blackened New York Steak Sandwich'),
    normalizeDishName('Open Faced Mediterranean Salmon'),
    normalizeDishName('Prime Rib French Dip'),
    normalizeDishName('Roasted Prime Rib French Dip'), // Variant
    normalizeDishName('Sliced Turkey Sandwich'),
    normalizeDishName('Thick Prime Angus Burger'), // Also remove duplicates
  ],

  // Sandwiches: Prime Burgers - same exclusions as sandwiches
  'sandwiches: prime burgers': [
    normalizeDishName('Grilled Chicken Club'),
    normalizeDishName('Blackened New York Steak Sandwich'),
    normalizeDishName('Open Faced Mediterranean Salmon'),
    normalizeDishName('Prime Rib French Dip'),
    normalizeDishName('Roasted Prime Rib French Dip'),
    normalizeDishName('Sliced Turkey Sandwich'),
    normalizeDishName('Thick Prime Angus Burger'),
  ],

  // Sandwiches: Signatures - same exclusions as sandwiches
  'sandwiches: signatures': [
    normalizeDishName('Grilled Chicken Club'),
    normalizeDishName('Blackened New York Steak Sandwich'),
    normalizeDishName('Open Faced Mediterranean Salmon'),
    normalizeDishName('Prime Rib French Dip'),
    normalizeDishName('Roasted Prime Rib French Dip'),
    normalizeDishName('Sliced Turkey Sandwich'),
    normalizeDishName('Thick Prime Angus Burger'),
  ],

  // Steaks and Chops - remove these dishes
  'steaks and chops': [
    normalizeDishName('Filet Mignon'),
    normalizeDishName('Petite Filet Mignon'), // Variant
  ],

  // Steaks & Filets - alternative category name
  'steaks & filets': [
    normalizeDishName('Filet Mignon'),
    normalizeDishName('Petite Filet Mignon'),
  ],

  // Steaks - alternative category name
  'steaks': [
    normalizeDishName('Filet Mignon'),
    normalizeDishName('Petite Filet Mignon'),
  ],
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
