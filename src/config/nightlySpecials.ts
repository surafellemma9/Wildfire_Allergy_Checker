/**
 * Nightly Specials Configuration
 *
 * Defines which dishes are valid nightly specials for each day of the week.
 * Only dishes matching these normalized names will be included in nightly specials output.
 *
 * This replaces the previous inaccurate nightly specials configuration.
 */

import { normalizeDishName } from '../utils/normalizeDishName';

/**
 * Valid nightly specials by day of week
 * Key: day name (lowercase)
 * Value: array of normalized dish names that are valid for that day
 */
export const VALID_NIGHTLY_SPECIALS: Record<string, string[]> = {
  monday: [
    normalizeDishName('Southern Fried Chicken'),
    normalizeDishName('Monday & Tuesday: Southern Fried Chicken'), // Data format variant
  ],

  tuesday: [
    normalizeDishName('Long Island Duck'),
    normalizeDishName('Southern Fried Chicken'),
    normalizeDishName('Monday & Tuesday: Southern Fried Chicken'), // Data format variant
    normalizeDishName('Wednesday: Spit Roasted Half Long Island Duck'), // May appear as Tuesday variant
  ],

  wednesday: [
    normalizeDishName('Long Island Duck'),
    normalizeDishName('Spit Roasted Duck'),
    normalizeDishName('Wednesday: Spit Roasted Half Long Island Duck'), // Data format variant
  ],

  thursday: [
    normalizeDishName('Braised Short Ribs'),
    normalizeDishName('Beer Braised Short Ribs'),
    normalizeDishName('Thursday: Beer Braised Short Ribs'), // Data format variant
  ],

  friday: [
    normalizeDishName('Filet Wellington'),
    normalizeDishName('Filet Mignon Wellington'),
    normalizeDishName('Friday & Saturday: Filet Mignon Wellington'), // Data format variant
  ],

  saturday: [
    normalizeDishName('Filet Wellington'),
    normalizeDishName('Filet Mignon Wellington'),
    normalizeDishName('Friday & Saturday: Filet Mignon Wellington'), // Data format variant
  ],

  sunday: [
    normalizeDishName('Roast Turkey'),
    normalizeDishName('Spit Roasted Turkey Dinner'),
    normalizeDishName('Sunday: Spit Roasted Turkey Dinner'), // Data format variant
  ],
};

/**
 * Get the day of week from a dish name (e.g., "Monday & Tuesday: Southern Fried Chicken" -> ["monday", "tuesday"])
 *
 * @param dishName - The dish name to parse
 * @returns Array of day names (lowercase) extracted from the dish name, or empty array if none found
 */
export function extractDaysFromDishName(dishName: string): string[] {
  const normalized = normalizeDishName(dishName);
  const days: string[] = [];

  const dayPatterns = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  for (const day of dayPatterns) {
    if (normalized.includes(day)) {
      days.push(day);
    }
  }

  return days;
}

/**
 * Check if a dish is a valid nightly special for any day
 *
 * @param dishName - The dish name to check
 * @returns true if the dish is a valid nightly special for at least one day
 */
export function isValidNightlySpecial(dishName: string): boolean {
  const normalized = normalizeDishName(dishName);

  // Check all days
  for (const daySpecials of Object.values(VALID_NIGHTLY_SPECIALS)) {
    if (daySpecials.includes(normalized)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a dish is a valid nightly special for a specific day
 *
 * @param dishName - The dish name to check
 * @param day - The day name (will be normalized to lowercase)
 * @returns true if the dish is valid for that specific day
 */
export function isValidNightlySpecialForDay(dishName: string, day: string): boolean {
  const normalizedDay = day.toLowerCase().trim();
  const normalizedDish = normalizeDishName(dishName);

  const daySpecials = VALID_NIGHTLY_SPECIALS[normalizedDay];
  if (!daySpecials) return false;

  return daySpecials.includes(normalizedDish);
}

/**
 * Filter nightly specials to only include valid dishes per the configuration
 *
 * @param dishes - Array of dishes from the "Nightly Specials" category
 * @returns Filtered array containing only valid nightly specials
 */
export function filterValidNightlySpecials<T extends { dish_name: string }>(dishes: T[]): T[] {
  return dishes.filter(dish => isValidNightlySpecial(dish.dish_name));
}
