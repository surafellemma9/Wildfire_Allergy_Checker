/**
 * Category Review Flags Configuration
 *
 * Defines which categories need allergy review.
 * Categories marked as needing review will have a flag set without changing
 * existing allergen logic or data.
 */

import { normalizeDishName } from '../utils/normalizeDishName';

/**
 * Set of category names (normalized) that need allergy review
 */
export const CATEGORIES_NEEDING_REVIEW = new Set([
  normalizeDishName('Seafood'),
  normalizeDishName('Chicken'),
]);

/**
 * Check if a category needs allergy review
 *
 * @param categoryName - The category name to check (will be normalized)
 * @returns true if the category needs allergy review
 */
export function categoryNeedsReview(categoryName: string): boolean {
  const normalized = normalizeDishName(categoryName);
  return CATEGORIES_NEEDING_REVIEW.has(normalized);
}
