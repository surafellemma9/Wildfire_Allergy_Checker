/**
 * Canonical Dish Name Normalization
 *
 * Single source of truth for comparing dish names across the codebase.
 * Used for category filtering, nightly specials matching, and test comparisons.
 */

/**
 * Normalize a dish name for comparison
 * - Trims whitespace
 * - Collapses internal whitespace to single spaces
 * - Converts to lowercase
 *
 * @param name - The dish name to normalize
 * @returns Normalized dish name
 */
export function normalizeDishName(name: string): string {
  if (!name) return '';

  return name
    .trim()                      // Remove leading/trailing whitespace
    .replace(/\s+/g, ' ')        // Collapse internal whitespace
    .toLowerCase();               // Case-insensitive
}

/**
 * Check if two dish names match after normalization
 *
 * @param name1 - First dish name
 * @param name2 - Second dish name
 * @returns true if names match after normalization
 */
export function dishNamesMatch(name1: string, name2: string): boolean {
  return normalizeDishName(name1) === normalizeDishName(name2);
}
