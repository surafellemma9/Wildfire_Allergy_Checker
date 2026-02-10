/**
 * Substitution Allergen Mapping
 * 
 * Maps substitution options to the allergens they contain.
 * Used to filter out conflicting substitutions when multiple allergens are selected.
 * 
 * SAFETY: If a substitution is not listed here, it's assumed safe for all allergens.
 * When in doubt, add the mapping to be safe.
 * 
 * For multi-tenant scale (5000+ tenants):
 * - This config can be overridden per-tenant in the database
 * - Tenant-specific overrides take precedence over defaults
 * - Audit logging tracks all changes for compliance
 */

export interface SubstitutionAllergenMapping {
  /** Pattern to match in substitution text (case-insensitive) */
  pattern: string;
  /** Allergens this substitution contains */
  containsAllergens: string[];
  /** Human-readable reason for the mapping */
  reason: string;
}

/**
 * Default substitution allergen mappings
 * These are common across most restaurants
 * 
 * VERIFIED BREAD INGREDIENTS (from supplier specs):
 * - Multi-grain: gluten, sesame (flax, sunflower, sesame seeds)
 * - Onion Bread: gluten, egg, onion
 * - Kid's Bun (Brioche): gluten, egg, dairy (milk powder, butter)
 * - Sesame Seed Bun: gluten, egg (whole egg topping), sesame
 * - Gluten Free Bun: dairy (butter, milk), egg
 */
export const SUBSTITUTION_ALLERGEN_MAPPINGS: SubstitutionAllergenMapping[] = [
  // ============================================================================
  // BREAD/BUN SUBSTITUTIONS - Verified from supplier ingredient specs
  // ============================================================================
  
  // Multi-grain bread: gluten + sesame (has flax, sunflower, sesame seeds)
  {
    pattern: 'multi-grain',
    containsAllergens: ['gluten', 'sesame'],
    reason: 'Multi-grain bread contains wheat (gluten) and sesame seeds',
  },
  {
    pattern: 'multigrain',
    containsAllergens: ['gluten', 'sesame'],
    reason: 'Multi-grain bread contains wheat (gluten) and sesame seeds',
  },
  
  // BUTTERY ONION BUN (3D Bakery) - used for SANDWICHES
  // Contains: gluten, dairy (butter flavor), sesame (ground sesame seeds)
  // Does NOT contain: eggs
  {
    pattern: 'buttery onion bun',
    containsAllergens: ['gluten', 'dairy', 'sesame'],
    reason: 'Buttery onion bun contains wheat (gluten), butter flavor (dairy), and ground sesame seeds',
  },
  {
    pattern: 'onion bun',
    containsAllergens: ['gluten', 'dairy', 'sesame'],
    reason: 'Onion bun contains wheat (gluten), butter flavor (dairy), and ground sesame seeds',
  },
  
  // ONION BREAD - used for BISON MEATBALLS only
  // Contains: gluten, eggs
  // Does NOT contain: dairy, sesame
  {
    pattern: 'onion bread',
    containsAllergens: ['gluten', 'eggs'],
    reason: 'Onion bread (for meatballs) contains wheat (gluten) and eggs',
  },
  
  // Sesame seed bun: gluten + egg + sesame (NO dairy)
  {
    pattern: 'sesame seed bun',
    containsAllergens: ['gluten', 'eggs', 'sesame'],
    reason: 'Sesame seed bun contains wheat (gluten), whole egg topping, and sesame seeds',
  },
  {
    pattern: 'sesame bun',
    containsAllergens: ['gluten', 'eggs', 'sesame'],
    reason: 'Sesame bun contains wheat (gluten), egg, and sesame seeds',
  },
  
  // Kids bun (Brioche): gluten + egg + dairy (milk powder, butter)
  {
    pattern: 'kids bun',
    containsAllergens: ['gluten', 'eggs', 'dairy'],
    reason: 'Kids bun (brioche) contains wheat (gluten), eggs, and dairy (milk powder, butter)',
  },
  {
    pattern: 'brioche',
    containsAllergens: ['gluten', 'eggs', 'dairy'],
    reason: 'Brioche contains wheat (gluten), eggs, and dairy (milk powder, butter)',
  },
  
  // Gluten-free bun: dairy + egg (NO gluten, NO sesame, NO onion)
  {
    pattern: 'gluten free bun',
    containsAllergens: ['dairy', 'eggs'],
    reason: 'Gluten-free bun contains melted butter (dairy) and whole eggs',
  },
  {
    pattern: 'gluten-free bun',
    containsAllergens: ['dairy', 'eggs'],
    reason: 'Gluten-free bun contains melted butter (dairy) and whole eggs',
  },
  
  // Other bread types
  {
    pattern: 'wheat bread',
    containsAllergens: ['gluten'],
    reason: 'Wheat bread contains gluten',
  },
  {
    pattern: 'sourdough',
    containsAllergens: ['gluten'],
    reason: 'Sourdough contains gluten',
  },
  {
    pattern: 'ciabatta',
    containsAllergens: ['gluten'],
    reason: 'Ciabatta contains gluten',
  },
  {
    pattern: 'focaccia',
    containsAllergens: ['gluten'],
    reason: 'Focaccia contains gluten',
  },
  
  // Sauce/Dressing substitutions
  {
    pattern: 'ranch',
    containsAllergens: ['dairy', 'eggs'],
    reason: 'Ranch contains buttermilk (dairy) and mayonnaise (eggs)',
  },
  {
    pattern: 'blue cheese',
    containsAllergens: ['dairy'],
    reason: 'Blue cheese is a dairy product',
  },
  {
    pattern: 'caesar',
    containsAllergens: ['dairy', 'eggs', 'shellfish'],
    reason: 'Caesar contains parmesan (dairy), egg, and anchovy (shellfish)',
  },
  {
    pattern: 'mayo',
    containsAllergens: ['eggs', 'soy'],
    reason: 'Mayonnaise contains eggs and often soy oil',
  },
  {
    pattern: 'mayonnaise',
    containsAllergens: ['eggs', 'soy'],
    reason: 'Mayonnaise contains eggs and often soy oil',
  },
  {
    pattern: 'aioli',
    containsAllergens: ['eggs', 'garlic'],
    reason: 'Aioli contains eggs and garlic',
  },
  {
    pattern: 'tartar',
    containsAllergens: ['eggs', 'soy'],
    reason: 'Tartar sauce contains mayonnaise (eggs, soy)',
  },
  {
    pattern: 'cream sauce',
    containsAllergens: ['dairy'],
    reason: 'Cream sauce contains dairy',
  },
  {
    pattern: 'alfredo',
    containsAllergens: ['dairy', 'gluten'],
    reason: 'Alfredo contains cream (dairy) and often flour (gluten)',
  },
  {
    pattern: 'hollandaise',
    containsAllergens: ['dairy', 'eggs'],
    reason: 'Hollandaise contains butter (dairy) and eggs',
  },
  {
    pattern: 'béarnaise',
    containsAllergens: ['dairy', 'eggs'],
    reason: 'Béarnaise contains butter (dairy) and eggs',
  },
  {
    pattern: 'bearnaise',
    containsAllergens: ['dairy', 'eggs'],
    reason: 'Béarnaise contains butter (dairy) and eggs',
  },
  {
    pattern: 'pesto',
    containsAllergens: ['dairy', 'tree_nuts'],
    reason: 'Pesto contains parmesan (dairy) and pine nuts (tree nuts)',
  },
  {
    pattern: 'teriyaki',
    containsAllergens: ['soy', 'gluten'],
    reason: 'Teriyaki contains soy sauce (soy, gluten)',
  },
  {
    pattern: 'soy sauce',
    containsAllergens: ['soy', 'gluten'],
    reason: 'Soy sauce contains soy and wheat (gluten)',
  },
  {
    pattern: 'worcestershire',
    containsAllergens: ['shellfish', 'gluten', 'soy'],
    reason: 'Worcestershire contains anchovies (shellfish), may contain gluten and soy',
  },
  
  // Cheese substitutions
  {
    pattern: 'cheese',
    containsAllergens: ['dairy'],
    reason: 'Cheese is a dairy product',
  },
  {
    pattern: 'parmesan',
    containsAllergens: ['dairy'],
    reason: 'Parmesan is a dairy product',
  },
  {
    pattern: 'cheddar',
    containsAllergens: ['dairy'],
    reason: 'Cheddar is a dairy product',
  },
  {
    pattern: 'swiss',
    containsAllergens: ['dairy'],
    reason: 'Swiss cheese is a dairy product',
  },
  {
    pattern: 'mozzarella',
    containsAllergens: ['dairy'],
    reason: 'Mozzarella is a dairy product',
  },
  {
    pattern: 'gruyere',
    containsAllergens: ['dairy'],
    reason: 'Gruyere is a dairy product',
  },
  
  // Other substitutions
  {
    pattern: 'butter',
    containsAllergens: ['dairy'],
    reason: 'Butter is a dairy product',
  },
  {
    pattern: 'sour cream',
    containsAllergens: ['dairy'],
    reason: 'Sour cream is a dairy product',
  },
  {
    pattern: 'croutons',
    containsAllergens: ['gluten', 'dairy'],
    reason: 'Croutons contain bread (gluten) and often butter (dairy)',
  },
  {
    pattern: 'breadcrumb',
    containsAllergens: ['gluten'],
    reason: 'Breadcrumbs contain gluten',
  },
  {
    pattern: 'breading',
    containsAllergens: ['gluten', 'eggs'],
    reason: 'Breading contains flour (gluten) and often eggs',
  },
  {
    pattern: 'tempura',
    containsAllergens: ['gluten', 'eggs'],
    reason: 'Tempura batter contains flour (gluten) and eggs',
  },
  {
    pattern: 'panko',
    containsAllergens: ['gluten'],
    reason: 'Panko breadcrumbs contain gluten',
  },
  {
    pattern: 'fried',
    containsAllergens: ['gluten', 'soy'],
    reason: 'Fried items often use flour (gluten) and soy oil',
  },
  {
    pattern: 'scallion',
    containsAllergens: ['onion'],
    reason: 'Scallions are in the onion family',
  },
  {
    pattern: 'shallot',
    containsAllergens: ['onion'],
    reason: 'Shallots are in the onion family',
  },
  {
    pattern: 'leek',
    containsAllergens: ['onion'],
    reason: 'Leeks are in the onion family',
  },
  {
    pattern: 'chive',
    containsAllergens: ['onion'],
    reason: 'Chives are in the onion family',
  },
];

/**
 * Check if a substitution contains any of the selected allergens
 * @param substitution - The substitution text (e.g., "SUB multi-grain bread")
 * @param selectedAllergens - Array of allergen IDs the user is allergic to
 * @returns Object with isConflicting flag and reasons
 */
export function checkSubstitutionConflict(
  substitution: string,
  selectedAllergens: string[]
): { isConflicting: boolean; conflictingAllergens: string[]; reasons: string[] } {
  const lowerSub = substitution.toLowerCase();
  const conflictingAllergens: string[] = [];
  const reasons: string[] = [];

  for (const mapping of SUBSTITUTION_ALLERGEN_MAPPINGS) {
    if (lowerSub.includes(mapping.pattern.toLowerCase())) {
      // Check if any of the allergens in this mapping are selected
      for (const containedAllergen of mapping.containsAllergens) {
        if (selectedAllergens.includes(containedAllergen)) {
          if (!conflictingAllergens.includes(containedAllergen)) {
            conflictingAllergens.push(containedAllergen);
            reasons.push(mapping.reason);
          }
        }
      }
    }
  }

  return {
    isConflicting: conflictingAllergens.length > 0,
    conflictingAllergens,
    reasons,
  };
}

/**
 * Filter out substitutions that conflict with selected allergens
 * @param substitutions - Array of substitution strings
 * @param selectedAllergens - Array of allergen IDs the user is allergic to
 * @returns Filtered array with only safe substitutions
 * 
 * IMPORTANT: "NO X" modifications (removals) are ALWAYS safe because they
 * remove ingredients rather than add them. Only "SUB X" (substitutions)
 * need to be checked for allergen conflicts.
 */
export function filterConflictingSubstitutions(
  substitutions: string[],
  selectedAllergens: string[]
): string[] {
  // #region agent log - Debug: Function entry
  console.log('[DEBUG-H3] filterConflictingSubstitutions called:', { substitutions, selectedAllergens });
  // #endregion
  
  return substitutions.filter(sub => {
    const lowerSub = sub.toLowerCase().trim();
    
    // "NO X" modifications are REMOVALS - always safe, never filter them out
    // Examples: "NO bun", "NO mayo", "NO ranch", "NO croutons"
    if (lowerSub.startsWith('no ')) {
      // #region agent log - Debug: Removal is always safe
      console.log('[DEBUG-H4] Removal modification - always safe:', { sub });
      // #endregion
      return true; // Keep this modification
    }
    
    // "SUB X" and other modifications need allergen conflict checking
    const conflict = checkSubstitutionConflict(sub, selectedAllergens);
    // #region agent log - Debug conflict detection
    console.log('[DEBUG-H4] Conflict check:', { sub, isConflicting: conflict.isConflicting, conflictingAllergens: conflict.conflictingAllergens, reasons: conflict.reasons });
    // #endregion
    return !conflict.isConflicting;
  });
}

/**
 * Get all conflicting substitutions with their reasons
 * Useful for displaying warnings to users
 * 
 * NOTE: "NO X" modifications (removals) are never considered conflicts
 */
export function getConflictingSubstitutionsWithReasons(
  substitutions: string[],
  selectedAllergens: string[]
): Array<{ substitution: string; conflictingAllergens: string[]; reasons: string[] }> {
  const conflicts: Array<{ substitution: string; conflictingAllergens: string[]; reasons: string[] }> = [];
  
  for (const sub of substitutions) {
    // "NO X" modifications are removals - never conflicts
    if (sub.toLowerCase().trim().startsWith('no ')) {
      continue;
    }
    
    const conflict = checkSubstitutionConflict(sub, selectedAllergens);
    if (conflict.isConflicting) {
      conflicts.push({
        substitution: sub,
        conflictingAllergens: conflict.conflictingAllergens,
        reasons: conflict.reasons,
      });
    }
  }
  
  return conflicts;
}
