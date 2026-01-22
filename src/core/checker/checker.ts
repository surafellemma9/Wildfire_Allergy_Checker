/**
 * Allergy Checker Engine
 * Pure function that checks allergens against TenantPack data
 */

import type {
  TenantPack,
  MenuItem,
  RuleStatus,
} from '../tenant/packTypes';

// ============================================================================
// Types
// ============================================================================

export interface CheckerSelections {
  allergenIds: string[];
  itemId: string;
  sideId?: string;
  crustId?: string;
  dressingId?: string;
  customAllergenText?: string;
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
  customAllergenWarning?: string;
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
  const { allergenIds, itemId, sideId, crustId, dressingId, customAllergenText } = selections;

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

  // Handle custom allergen
  let customAllergenWarning: string | undefined;
  if (customAllergenText?.trim()) {
    customAllergenWarning = `Custom allergen "${customAllergenText}" detected. Please consult the chef - automatic checking is not available.`;
  }

  // Calculate overall status
  const allResults = [mainResult, sideResult, crustResult, dressingResult].filter(
    Boolean
  ) as ItemCheckResult[];
  
  let overallStatus = determineOverallStatus(allResults, !!customAllergenText);

  // Generate ticket lines
  const ticketLines = generateTicketLines(mainResult, sideResult, crustResult, dressingResult, customAllergenWarning);

  return {
    overallStatus,
    mainItem: mainResult,
    sideItem: sideResult,
    crustItem: crustResult,
    dressingItem: dressingResult,
    customAllergenWarning,
    ticketLines,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check a single item against selected allergens
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
    const rule = item.allergenRules[allergenId];

    if (!rule) {
      // No rule defined - treat as UNKNOWN
      perAllergen.push({
        allergenId,
        allergenName: allergenDef?.name || allergenId,
        status: 'UNKNOWN',
        foundIngredients: [],
        substitutions: [],
        notes: ['This dish has not been verified for this allergen. Please consult a manager.'],
      });
      itemStatus = worstStatus(itemStatus, 'UNKNOWN');
      canBeModified = false;
    } else {
      perAllergen.push({
        allergenId,
        allergenName: allergenDef?.name || allergenId,
        status: rule.status,
        foundIngredients: rule.foundIngredients || [],
        substitutions: rule.substitutions || [],
        notes: rule.notes ? [rule.notes] : [],
      });

      itemStatus = worstStatus(itemStatus, rule.status);

      // Can't modify if UNSAFE
      if (rule.status === 'UNSAFE') {
        canBeModified = false;
      }
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
 * Determine the worst status (priority: UNSAFE > UNKNOWN > MODIFY > SAFE)
 */
function worstStatus(current: RuleStatus, next: RuleStatus): RuleStatus {
  const priority: Record<RuleStatus, number> = {
    SAFE: 0,
    MODIFY: 1,
    UNKNOWN: 2,
    UNSAFE: 3,
  };

  return priority[next] > priority[current] ? next : current;
}

/**
 * Determine overall status from all checked items
 */
function determineOverallStatus(
  results: ItemCheckResult[],
  hasCustomAllergen: boolean
): RuleStatus {
  if (hasCustomAllergen) {
    return 'UNKNOWN';
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

  // Add custom allergen warning
  if (customWarning) {
    lines.push('');
    lines.push('⚠️ ' + customWarning);
  }

  return lines;
}

/**
 * Format lines for a single item result
 */
function formatItemLines(result: ItemCheckResult): string[] {
  const lines: string[] = [];

  // If completely safe, indicate no changes
  if (result.status === 'SAFE') {
    lines.push('✓ No changes needed');
    return lines;
  }

  // If unsafe/unknown, indicate cannot serve
  if (result.status === 'UNSAFE') {
    lines.push('✗ NOT SAFE - Cannot be modified');
    for (const pa of result.perAllergen) {
      if (pa.status === 'UNSAFE') {
        lines.push(`  • ${pa.allergenName}: ${pa.notes.join(', ') || 'Contains allergen'}`);
      }
    }
    return lines;
  }

  if (result.status === 'UNKNOWN') {
    lines.push('? UNKNOWN - Verify with chef');
    for (const pa of result.perAllergen) {
      if (pa.status === 'UNKNOWN') {
        lines.push(`  • ${pa.allergenName}: ${pa.notes.join(', ')}`);
      }
    }
    return lines;
  }

  // MODIFY - list all modifications
  for (const pa of result.perAllergen) {
    if (pa.status === 'MODIFY' && pa.substitutions.length > 0) {
      for (const sub of pa.substitutions) {
        // Bold formatting for NO/SUB
        if (sub.startsWith('NO ') || sub.startsWith('SUB ')) {
          lines.push(`• **${sub}**`);
        } else {
          lines.push(`• ${sub}`);
        }
      }
    }
  }

  return lines;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get all items in a category
 */
export function getItemsByCategory(
  pack: TenantPack,
  categoryId: string
): MenuItem[] {
  return pack.items.filter((item) => item.categoryId === categoryId);
}

/**
 * Search items by name
 */
export function searchItems(pack: TenantPack, query: string): MenuItem[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  return pack.items.filter((item) =>
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
