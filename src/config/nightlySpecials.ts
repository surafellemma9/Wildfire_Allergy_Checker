/**
 * Nightly Specials Configuration
 *
 * Defines the accurate day→dish mappings for nightly specials.
 * Only these entries should appear in the Nightly Specials category.
 */

import { normalizeDishName } from '../utils/normalizeDishName';

/**
 * Valid nightly specials by day of week
 * Note: Tuesday and Wednesday have 2 entries each
 */
export const VALID_NIGHTLY_SPECIALS: Record<string, string[]> = {
  monday: [
    normalizeDishName('Southern Fried Chicken'),
  ],
  tuesday: [
    normalizeDishName('Long Island Duck'),
    normalizeDishName('Southern Fried Chicken'),
  ],
  wednesday: [
    normalizeDishName('Long Island Duck'),
    normalizeDishName('Spit Roasted Duck'),
  ],
  thursday: [
    normalizeDishName('Braised Short Ribs'),
  ],
  friday: [
    normalizeDishName('Filet Wellington'),
  ],
  saturday: [
    normalizeDishName('Filet Wellington'),
  ],
  sunday: [
    normalizeDishName('Roast Turkey'),
  ],
};

/**
 * All valid nightly special dishes (normalized, deduplicated)
 */
export const ALL_VALID_NIGHTLY_SPECIALS = new Set<string>(
  Object.values(VALID_NIGHTLY_SPECIALS).flat()
);

/**
 * Check if a dish is a valid nightly special
 *
 * @param dishName - The dish name to check
 * @returns true if this dish is in the valid nightly specials list
 */
export function isValidNightlySpecial(dishName: string): boolean {
  const normalized = normalizeDishName(dishName);
  return ALL_VALID_NIGHTLY_SPECIALS.has(normalized);
}

/**
 * Filter a list of items to only include valid nightly specials
 *
 * @param items - Array of items with name property
 * @returns Filtered array containing only valid nightly specials
 */
export function filterValidNightlySpecials<T extends { name: string }>(items: T[]): T[] {
  return items.filter(item => isValidNightlySpecial(item.name));
}
