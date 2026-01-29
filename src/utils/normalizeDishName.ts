/**
 * Centralized dish name normalization utility
 * Used throughout the codebase for consistent dish name matching
 */

/**
 * Normalize a dish name for comparison purposes
 * - Trims leading/trailing whitespace
 * - Collapses internal whitespace to single space
 * - Converts to lowercase
 *
 * @param name - The dish name to normalize
 * @returns The normalized dish name
 */
export function normalizeDishName(name: string): string {
  if (!name) return '';

  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Check if two dish names match after normalization
 *
 * @param name1 - First dish name
 * @param name2 - Second dish name
 * @returns true if the normalized names match
 */
export function dishNamesMatch(name1: string, name2: string): boolean {
  return normalizeDishName(name1) === normalizeDishName(name2);
}

/**
 * Check if a dish name contains a substring (case-insensitive, normalized)
 *
 * @param dishName - The dish name to search in
 * @param searchTerm - The term to search for
 * @returns true if the normalized dish name contains the search term
 */
export function dishNameContains(dishName: string, searchTerm: string): boolean {
  return normalizeDishName(dishName).includes(normalizeDishName(searchTerm));
}
