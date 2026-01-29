/**
 * Allergy Checker Engine
 * Pure function that checks allergens against TenantPack data
 */

import type {
  TenantPack,
  MenuItem,
  RuleStatus,
} from '../tenant/packTypes';
import { isDishExcludedFromCategory } from '../../config/categoryExclusions';
import { filterValidNightlySpecials } from '../../config/nightlySpecials';

// ============================================================================
// Types
// ============================================================================

export interface CheckerSelections {
  allergenIds: string[];
  itemId: string;
  sideId?: string;
  crustId?: string;
  dressingId?: string;
  addOnIds?: string[];  // Multiple add-ons can be selected
  customAllergenText?: string;
  customIngredients?: string[];  // Specific ingredients to check for
}

export interface IngredientCheckResult {
  ingredient: string;
  foundIn: 'ingredients' | 'garnishes' | 'not_found';
  itemName: string;
}

export interface PerAllergenResult {
  allergenId: string;
  allergenName: string;
  status: RuleStatus;
  foundIngredients: string[];
  substitutions: string[];
  notes: string[];
}

export interface ItemCheckResult {
  itemId: string;
  itemName: string;
  ticketCode?: string;
  status: RuleStatus;
  canBeModified: boolean;
  perAllergen: PerAllergenResult[];
}

export interface CheckerResult {
  overallStatus: RuleStatus;
  mainItem: ItemCheckResult;
  sideItem?: ItemCheckResult;
  crustItem?: ItemCheckResult;
  dressingItem?: ItemCheckResult;
  addOnItems?: ItemCheckResult[];  // Multiple add-ons
  customAllergenWarning?: string;
  customIngredientResults?: IngredientCheckResult[];  // Results of custom ingredient checks
  ticketLines: string[];
}

// ============================================================================
// Main Checker Function
// ============================================================================

/**
 * Check allergens for selected items
 */
export function checkAllergens(
  pack: TenantPack,
  selections: CheckerSelections
): CheckerResult {
  const { allergenIds, itemId, sideId, crustId, dressingId, addOnIds, customAllergenText, customIngredients } = selections;

  // Find the main item
  const mainItem = pack.items.find((i) => i.id === itemId);
  if (!mainItem) {
    throw new Error(`Item not found: ${itemId}`);
  }

  // Check main item
  const mainResult = checkItem(pack, mainItem, allergenIds);

  // Check side if selected
  let sideResult: ItemCheckResult | undefined;
  if (sideId) {
    const sideItem = pack.items.find((i) => i.id === sideId);
    if (sideItem) {
      sideResult = checkItem(pack, sideItem, allergenIds);
    }
  }

  // Check crust if selected (look in item's crustOptions)
  let crustResult: ItemCheckResult | undefined;
  if (crustId && mainItem.crustOptions) {
    const crustOption = mainItem.crustOptions.find((c) => c.id === crustId);
    if (crustOption) {
      // Look for crust item in pack
      const crustItem = pack.items.find((i) => i.id === crustId);
      if (crustItem) {
        crustResult = checkItem(pack, crustItem, allergenIds);
      }
    }
  }

  // Check dressing if selected
  let dressingResult: ItemCheckResult | undefined;
  if (dressingId) {
    const dressingItem = pack.items.find((i) => i.id === dressingId);
    if (dressingItem) {
      dressingResult = checkItem(pack, dressingItem, allergenIds);
    }
  }

  // Check add-ons if selected (multiple can be selected)
  let addOnResults: ItemCheckResult[] | undefined;
  if (addOnIds && addOnIds.length > 0) {
    addOnResults = [];
    for (const addOnId of addOnIds) {
      const addOnItem = pack.items.find((i) => i.id === addOnId);
      if (addOnItem) {
        addOnResults.push(checkItem(pack, addOnItem, allergenIds));
      }
    }
  }

  // Handle custom allergen text (free-form)
  let customAllergenWarning: string | undefined;
  if (customAllergenText?.trim()) {
    customAllergenWarning = `Custom allergen "${customAllergenText}" detected. Please consult the chef - automatic checking is not available.`;
  }

  // Handle custom ingredient checks (searchable from master list)
  let customIngredientResults: IngredientCheckResult[] | undefined;
  if (customIngredients && customIngredients.length > 0) {
    customIngredientResults = [];
    
    // Check main item
    for (const ingredient of customIngredients) {
      const result = checkIngredientInItem(mainItem, ingredient);
      customIngredientResults.push(result);
    }
    
    // Check side if selected
    if (sideId) {
      const sideItem = pack.items.find((i) => i.id === sideId);
      if (sideItem) {
        for (const ingredient of customIngredients) {
          const result = checkIngredientInItem(sideItem, ingredient);
          if (result.foundIn !== 'not_found') {
            customIngredientResults.push(result);
          }
        }
      }
    }
  }

  // Calculate overall status
  const allResults = [
    mainResult,
    sideResult,
    crustResult,
    dressingResult,
    ...(addOnResults || []),
  ].filter(Boolean) as ItemCheckResult[];

  let overallStatus = determineOverallStatus(allResults, !!customAllergenText, customIngredientResults);

  // Generate ticket lines
  const ticketLines = generateTicketLines(mainResult, sideResult, crustResult, dressingResult, addOnResults, customAllergenWarning);

  return {
    overallStatus,
    mainItem: mainResult,
    sideItem: sideResult,
    crustItem: crustResult,
    dressingItem: dressingResult,
    addOnItems: addOnResults,
    customAllergenWarning,
    customIngredientResults,
    ticketLines,
  };
}

/**
 * Check if a specific ingredient is in an item's ingredients or garnishes
 */
function checkIngredientInItem(item: MenuItem, ingredient: string): IngredientCheckResult {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Check ingredients array
  const ingredients: string[] = item.ingredients || [];
  if (ingredients.some(ing => ing.toLowerCase() === lowerIngredient)) {
    return {
      ingredient,
      foundIn: 'ingredients',
      itemName: item.name,
    };
  }
  
  // Check garnishes array
  const garnishes: string[] = item.garnishes || [];
  if (garnishes.some(gar => gar.toLowerCase() === lowerIngredient)) {
    return {
      ingredient,
      foundIn: 'garnishes',
      itemName: item.name,
    };
  }
  
  return {
    ingredient,
    foundIn: 'not_found',
    itemName: item.name,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check a single item against selected allergens
 * Uses strict per-allergen safety rules from allergy sheets
 */
function checkItem(
  pack: TenantPack,
  item: MenuItem,
  allergenIds: string[]
): ItemCheckResult {
  const perAllergen: PerAllergenResult[] = [];
  let itemStatus: RuleStatus = 'SAFE';
  let canBeModified = true;

  for (const allergenId of allergenIds) {
    const allergenDef = pack.allergens.find((a) => a.id === allergenId);

    // Use the deterministic evaluation function
    const status = evaluateDishForAllergen(item, allergenId);
    const rule = item.allergenRules[allergenId];

    // Build result for this allergen
    perAllergen.push({
      allergenId,
      allergenName: allergenDef?.name || allergenId,
      status,
      foundIngredients: rule?.foundIngredients || [],
      substitutions: rule?.substitutions || [],
      notes: rule?.notes ? [rule.notes] : [],
    });

    // Update overall item status (worst status wins)
    itemStatus = worstStatus(itemStatus, status);

    // Determine if item can be modified
    // Can only modify if ALL allergens are either SAFE or MODIFIABLE
    if (status !== 'SAFE' && status !== 'MODIFIABLE') {
      canBeModified = false;
    }
  }

  return {
    itemId: item.id,
    itemName: item.name,
    ticketCode: item.ticketCode,
    status: itemStatus,
    canBeModified,
    perAllergen,
  };
}

/**
 * SAFETY-FIRST PRIORITY: Determine the worst status
 * Priority order (most restrictive to least restrictive):
 * NOT_SAFE_NOT_IN_SHEET > UNSAFE > VERIFY_WITH_KITCHEN > MODIFIABLE > SAFE
 *
 * Rationale:
 * - NOT_SAFE_NOT_IN_SHEET: Dish not in allergy sheet = cannot verify safety
 * - UNSAFE: Explicitly cannot be made safe
 * - VERIFY_WITH_KITCHEN: Needs manual confirmation before serving
 * - MODIFIABLE: Can be made safe with modifications
 * - SAFE: Safe as-is
 */
function worstStatus(current: RuleStatus, next: RuleStatus): RuleStatus {
  const priority: Record<RuleStatus, number> = {
    SAFE: 0,
    MODIFIABLE: 1,
    VERIFY_WITH_KITCHEN: 2,
    UNSAFE: 3,
    NOT_SAFE_NOT_IN_SHEET: 4,  // HIGHEST priority = most restrictive
  };

  return priority[next] > priority[current] ? next : current;
}

/**
 * CORE SAFETY FUNCTION: Evaluate a dish for a specific allergen
 *
 * Returns exactly one of:
 * - SAFE: No modifications needed
 * - MODIFIABLE: Can be made safe with explicit modifications from allergy sheet
 * - VERIFY_WITH_KITCHEN: Requires manual kitchen verification (FISH ONLY)
 * - NOT_SAFE_NOT_IN_SHEET: Not present in allergy sheet for this allergen
 * - UNSAFE: Cannot be made safe
 *
 * BUSINESS RULES:
 * 1. If dish not in allergen's sheet → NOT_SAFE_NOT_IN_SHEET
 * 2. VERIFY_WITH_KITCHEN is ONLY allowed for Fish allergen
 *    - For non-fish allergens, VERIFY status is converted to NOT_SAFE_NOT_IN_SHEET
 *    - Rationale: Fish preparation varies daily (fresh catch, cooking methods)
 *    - All other allergens must have deterministic SAFE/MODIFIABLE/UNSAFE rules
 * 3. Otherwise, use status from allergy sheet
 * 4. No inference across allergens allowed
 */
export function evaluateDishForAllergen(
  dish: MenuItem,
  allergenId: string
): RuleStatus {
  const rule = dish.allergenRules[allergenId];

  // RULE 1: Not in allergy sheet = NOT SAFE
  if (!rule) {
    return 'NOT_SAFE_NOT_IN_SHEET';
  }

  // RULE 2: VERIFY_WITH_KITCHEN is ONLY allowed for Fish allergen
  // For all other allergens, VERIFY must be converted to NOT_SAFE (safety-first)
  if (rule.status === 'VERIFY_WITH_KITCHEN' && allergenId !== 'fish') {
    return 'NOT_SAFE_NOT_IN_SHEET';
  }

  // RULE 3: Return the status from the allergy sheet
  return rule.status;
}

/**
 * Determine overall status from all checked items
 * SAFETY RULE: Custom allergens require kitchen verification since they're not in our sheets
 */
function determineOverallStatus(
  results: ItemCheckResult[],
  hasCustomAllergen: boolean,
  customIngredientResults?: IngredientCheckResult[]
): RuleStatus {
  // Check custom ingredients - ingredients = UNSAFE, garnishes only = MODIFIABLE
  if (customIngredientResults && customIngredientResults.length > 0) {
    const hasIngredientMatch = customIngredientResults.some(r => r.foundIn === 'ingredients');
    const hasGarnishMatch = customIngredientResults.some(r => r.foundIn === 'garnishes');
    
    if (hasIngredientMatch) {
      return 'UNSAFE';
    }
    if (hasGarnishMatch) {
      return 'MODIFIABLE';
    }
  }

  // Custom allergens (free text) can't be verified against allergy sheets
  // Must verify with kitchen before serving
  if (hasCustomAllergen) {
    return 'VERIFY_WITH_KITCHEN';
  }

  let overall: RuleStatus = 'SAFE';

  for (const result of results) {
    overall = worstStatus(overall, result.status);
  }

  return overall;
}

/**
 * Generate ticket lines for kitchen display
 */
function generateTicketLines(
  mainResult: ItemCheckResult,
  sideResult?: ItemCheckResult,
  crustResult?: ItemCheckResult,
  dressingResult?: ItemCheckResult,
  addOnResults?: ItemCheckResult[],
  customWarning?: string
): string[] {
  const lines: string[] = [];

  // Add main item
  lines.push(`=== ${mainResult.ticketCode || mainResult.itemName.toUpperCase()} ===`);
  lines.push(...formatItemLines(mainResult));

  // Add side
  if (sideResult) {
    lines.push('');
    lines.push(`--- SIDE: ${sideResult.itemName} ---`);
    lines.push(...formatItemLines(sideResult));
  }

  // Add crust
  if (crustResult) {
    lines.push('');
    lines.push(`--- CRUST: ${crustResult.itemName} ---`);
    lines.push(...formatItemLines(crustResult));
  }

  // Add dressing
  if (dressingResult) {
    lines.push('');
    lines.push(`--- DRESSING: ${dressingResult.itemName} ---`);
    lines.push(...formatItemLines(dressingResult));
  }

  // Add add-ons
  if (addOnResults && addOnResults.length > 0) {
    lines.push('');
    lines.push(`--- ADD-ONS ---`);
    for (const addOnResult of addOnResults) {
      lines.push(`• ${addOnResult.itemName}:`);
      lines.push(...formatItemLines(addOnResult).map(line => '  ' + line));
    }
  }

  // Add custom allergen warning
  if (customWarning) {
    lines.push('');
    lines.push('⚠️ ' + customWarning);
  }

  return lines;
}

/**
 * Format lines for a single item result with safety-first messaging
 */
function formatItemLines(result: ItemCheckResult): string[] {
  const lines: string[] = [];

  // SAFE - No modifications needed
  if (result.status === 'SAFE') {
    lines.push('✓ SAFE - No changes needed');
    return lines;
  }

  // NOT_SAFE_NOT_IN_SHEET - Most critical: not in allergy sheet
  if (result.status === 'NOT_SAFE_NOT_IN_SHEET') {
    lines.push('🚫 NOT SAFE — NOT IN ALLERGY SHEET');
    lines.push('   DO NOT SERVE - Cannot verify safety');
    for (const pa of result.perAllergen) {
      if (pa.status === 'NOT_SAFE_NOT_IN_SHEET') {
        lines.push(`   • ${pa.allergenName}: Missing from allergy sheet`);
      }
    }
    return lines;
  }

  // UNSAFE - Explicitly cannot be made safe
  if (result.status === 'UNSAFE') {
    lines.push('✗ NOT SAFE - Cannot be modified');
    for (const pa of result.perAllergen) {
      if (pa.status === 'UNSAFE') {
        lines.push(`   • ${pa.allergenName}: ${pa.notes.join(', ') || 'Contains allergen'}`);
      }
    }
    return lines;
  }

  // VERIFY_WITH_KITCHEN - Requires manual verification
  if (result.status === 'VERIFY_WITH_KITCHEN') {
    lines.push('⚠️  VERIFY WITH THE KITCHEN');
    lines.push('   Manual confirmation required before serving');
    for (const pa of result.perAllergen) {
      if (pa.status === 'VERIFY_WITH_KITCHEN') {
        lines.push(`   • ${pa.allergenName}: ${pa.notes.join(', ') || 'Requires verification'}`);
      }
    }
    return lines;
  }

  // MODIFIABLE - List all required modifications
  if (result.status === 'MODIFIABLE') {
    for (const pa of result.perAllergen) {
      if (pa.status === 'MODIFIABLE' && pa.substitutions.length > 0) {
        for (const sub of pa.substitutions) {
          // Bold formatting for NO/SUB (critical modifications)
          if (sub.startsWith('NO ') || sub.startsWith('SUB ')) {
            lines.push(`• **${sub}**`);
          } else {
            lines.push(`• ${sub}`);
          }
        }
      }
    }

    // If no modifications listed but marked as modifiable, show warning
    if (lines.length === 0) {
      lines.push('⚠️  VERIFY WITH THE KITCHEN');
      lines.push('   Marked as modifiable but no modifications specified');
    }
  }

  return lines;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get all items in a category
 * Uses O(1) index lookup if available, otherwise falls back to O(n) filter
 *
 * Performance:
 * - With index (pack._categoryIndex): O(1) - instant lookup
 * - Without index (fallback): O(n) - linear search through all items
 */
export function getItemsByCategory(
  pack: TenantPack,
  categoryId: string
): MenuItem[] {
  let items: MenuItem[];

  // Use O(1) index if available (built during pack validation)
  if (pack._categoryIndex) {
    items = pack._categoryIndex.get(categoryId) || [];
    // Filter out side-only items from main menu grid
    items = items.filter(item => !item.isSideOnly);
  } else {
    // Fallback to O(n) filter (legacy packs or invalid state)
    items = pack.items.filter((item) => {
      // Filter out side-only items
      if (item.isSideOnly) return false;

      // Primary: match by categoryId
      if (item.categoryId === categoryId) {
        return true;
      }

      // Fallback: if item has legacy 'category' field (name), derive ID and match
      const legacyCategory = (item as unknown as { category?: string }).category;
      if (legacyCategory) {
        const derivedId = legacyCategory
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        if (derivedId === categoryId) {
          console.warn(`[getItemsByCategory] Item "${item.name}" uses legacy category field`);
          return true;
        }
      }

      return false;
    });
  }

  // Apply category exclusion filters
  const category = pack.categories?.find(c => c.id === categoryId);
  const categoryName = category?.name || categoryId;
  items = items.filter(item => {
    return !isDishExcludedFromCategory(categoryName, item.name);
  });

  // Special handling for Nightly Specials category
  const isNightlySpecials = categoryName.toLowerCase().includes('nightly') ||
                            categoryId.toLowerCase().includes('nightly');
  if (isNightlySpecials) {
    items = filterValidNightlySpecials(items as any[]) as MenuItem[];
  }

  return items;
}

/**
 * Search items by name, excluding side-only items
 */
export function searchItems(pack: TenantPack, query: string): MenuItem[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  return pack.items.filter((item) =>
    !item.isSideOnly &&  // Filter out side-only items from search
    item.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get sides for an entree
 */
export function getSidesForItem(pack: TenantPack, item: MenuItem): MenuItem[] {
  if (!item.isEntree || !item.sides) {
    return [];
  }

  // Find matching side items in pack
  return item.sides
    .map((side) => pack.items.find((i) => i.id === side.id))
    .filter(Boolean) as MenuItem[];
}

/**
 * Check if an item requires crust selection
 */
export function requiresCrustSelection(item: MenuItem): boolean {
  return item.requiresCrust === true && (item.crustOptions?.length ?? 0) > 0;
}
