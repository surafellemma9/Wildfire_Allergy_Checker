/**
 * Allergy Checker Engine
 * Pure function that checks allergens against TenantPack data
 */

import type {
  TenantPack,
  MenuItem,
  RuleStatus,
  DressingOption,
} from '../tenant/packTypes';
import { isDishExcludedFromCategory } from '../../config/categoryExclusions';
import { filterValidNightlySpecials } from '../../config/nightlySpecials';
import { filterConflictingSubstitutions, getConflictingSubstitutionsWithReasons, checkSubstitutionConflict } from '../../config/substitutionAllergens';

// ============================================================================
// Types
// ============================================================================

export interface CheckerSelections {
  allergenIds: string[];
  itemId: string;
  sideId?: string;
  crustId?: string;           // Single crust (legacy)
  crustIds?: string[];        // Multiple crusts (new - for steaks)
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
  /** Raw substitutions before cross-allergen filtering - used by consolidation pipeline */
  rawSubstitutions?: string[];
  notes: string[];
}

export interface ItemCheckResult {
  itemId: string;
  itemName: string;
  ticketCode?: string;
  status: RuleStatus;
  canBeModified: boolean;
  perAllergen: PerAllergenResult[];
  /** Consolidated modifications after deduplication and cross-validation */
  consolidated?: ConsolidatedModifications;
}

/**
 * Modification categories for component-based grouping
 */
export type ModificationCategory = 'bread' | 'sauce' | 'protein' | 'garnish' | 'seasoning' | 'preparation' | 'other';

/**
 * Bread resolution result - single best option or NO bun
 */
export interface BreadResolution {
  /** The selected bread option (e.g., "SUB gluten-free bun" or "NO bun") */
  selected: string | null;
  /** Why this was selected */
  reason: string;
  /** Bread options that were rejected */
  rejected: Array<{
    option: string;
    reason: string;
  }>;
}

/**
 * Consolidated modifications after pipeline processing
 * Component-based grouping for clear, actionable output
 */
export interface ConsolidatedModifications {
  /** Bread resolution - single best option */
  bread: BreadResolution;
  /** Grouped removals by category */
  removals: {
    sauce: string[];
    garnish: string[];
    seasoning: string[];
    other: string[];
  };
  /** Grouped substitutions by category (non-bread) */
  substitutions: {
    protein: string[];
    other: string[];
  };
  /** Preparation instructions (CLEAN grill, etc.) */
  preparation: string[];
  /** Combined notes, deduplicated */
  notes: string[];
  /** Whether any substitutions were filtered out */
  hadConflicts: boolean;
  
  // Legacy fields for backward compatibility during transition
  /** @deprecated Use grouped fields instead */
  _legacyRemovals?: string[];
  /** @deprecated Use grouped fields instead */
  _legacySubstitutions?: string[];
  /** @deprecated Use bread.rejected instead */
  _legacyRejectedSubstitutions?: Array<{
    substitution: string;
    reason: string;
  }>;
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
  const { allergenIds, itemId, sideId, crustId, crustIds, dressingId, addOnIds, customAllergenText, customIngredients } = selections;

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

  // Check crust(s) if selected - supports both single crustId and multiple crustIds
  let crustResult: ItemCheckResult | undefined;
  const effectiveCrustIds = crustIds && crustIds.length > 0 ? crustIds : (crustId ? [crustId] : []);
  if (effectiveCrustIds.length > 0 && mainItem.crustOptions) {
    // For multiple crusts, combine their results
    const crustResults: ItemCheckResult[] = [];
    for (const cId of effectiveCrustIds) {
      const crustOption = mainItem.crustOptions.find((c) => c.id === cId);
      if (crustOption) {
        const crustItem = pack.items.find((i) => i.id === cId);
        if (crustItem) {
          crustResults.push(checkItem(pack, crustItem, allergenIds));
        }
      }
    }
    // Combine multiple crust results into one
    if (crustResults.length === 1) {
      crustResult = crustResults[0];
    } else if (crustResults.length > 1) {
      // Merge multiple crust results - take worst status, combine all mods
      crustResult = mergeCrustResults(crustResults);
    }
  }

  // Check dressing if selected (dressings are in mainItem.dressingOptions, not pack.items)
  let dressingResult: ItemCheckResult | undefined;
  let selectedDressing: DressingOption | undefined = undefined;
  if (dressingId && mainItem.dressingOptions) {
    selectedDressing = mainItem.dressingOptions.find((d) => d.id === dressingId);
    if (selectedDressing) {
      dressingResult = checkDressingItem(pack, selectedDressing, allergenIds);
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
  // Check ALL items (main, side, dressing) and report where ingredient is found
  let customIngredientResults: IngredientCheckResult[] | undefined;
  if (customIngredients && customIngredients.length > 0) {
    customIngredientResults = [];
    
    for (const ingredient of customIngredients) {
      let found = false;
      
      // Check main item
      const mainResult = checkIngredientInItem(mainItem, ingredient);
      if (mainResult.foundIn !== 'not_found') {
        customIngredientResults.push(mainResult);
        found = true;
      }
      
      // Check side if selected
      if (sideId) {
        const sideItem = pack.items.find((i) => i.id === sideId);
        if (sideItem) {
          const sideResult = checkIngredientInItem(sideItem, ingredient);
          if (sideResult.foundIn !== 'not_found') {
            customIngredientResults.push(sideResult);
            found = true;
          }
        }
      }
      
      // Check dressing if selected
      if (selectedDressing && selectedDressing.ingredients) {
        const dressingResult = checkIngredientInDressing(selectedDressing, ingredient);
        if (dressingResult.foundIn !== 'not_found') {
          customIngredientResults.push(dressingResult);
          found = true;
        }
      }
      
      // Only add "not found" if ingredient wasn't found in ANY item
      if (!found) {
        customIngredientResults.push({
          ingredient,
          foundIn: 'not_found',
          itemName: mainItem.name,
        });
      }
    }
  }

  // ============================================================================
  // CONSOLIDATION PIPELINE: Apply to all results
  // This deduplicates modifications and cross-validates substitutions
  // ============================================================================
  
  // Apply consolidation pipeline to main result
  const consolidatedMain = applyConsolidationPipeline(mainResult, allergenIds);
  
  // Apply to side if exists
  let consolidatedSide: ItemCheckResult | undefined;
  if (sideResult) {
    consolidatedSide = applyConsolidationPipeline(sideResult, allergenIds);
  }
  
  // Apply to crust if exists
  let consolidatedCrust: ItemCheckResult | undefined;
  if (crustResult) {
    consolidatedCrust = applyConsolidationPipeline(crustResult, allergenIds);
  }
  
  // Apply to dressing if exists
  let consolidatedDressing: ItemCheckResult | undefined;
  if (dressingResult) {
    consolidatedDressing = applyConsolidationPipeline(dressingResult, allergenIds);
  }
  
  // Apply to add-ons if exist
  let consolidatedAddOns: ItemCheckResult[] | undefined;
  if (addOnResults && addOnResults.length > 0) {
    consolidatedAddOns = addOnResults.map(r => applyConsolidationPipeline(r, allergenIds));
  }

  // Calculate overall status using consolidated results
  const allResults = [
    consolidatedMain,
    consolidatedSide,
    consolidatedCrust,
    consolidatedDressing,
    ...(consolidatedAddOns || []),
  ].filter(Boolean) as ItemCheckResult[];

  let overallStatus = determineOverallStatus(allResults, !!customAllergenText, customIngredientResults);

  // Generate ticket lines using consolidated results
  const ticketLines = generateTicketLines(consolidatedMain, consolidatedSide, consolidatedCrust, consolidatedDressing, consolidatedAddOns, customAllergenWarning);

  return {
    overallStatus,
    mainItem: consolidatedMain,
    sideItem: consolidatedSide,
    crustItem: consolidatedCrust,
    dressingItem: consolidatedDressing,
    addOnItems: consolidatedAddOns,
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

/**
 * Check if a specific ingredient is in a dressing's ingredients
 */
function checkIngredientInDressing(dressing: DressingOption, ingredient: string): IngredientCheckResult {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Check ingredients array
  const ingredients: string[] = dressing.ingredients || [];
  if (ingredients.some(ing => ing.toLowerCase().includes(lowerIngredient) || lowerIngredient.includes(ing.toLowerCase()))) {
    return {
      ingredient,
      foundIn: 'ingredients',
      itemName: dressing.name,
    };
  }
  
  return {
    ingredient,
    foundIn: 'not_found',
    itemName: dressing.name,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Merge multiple crust results into one combined result
 * Takes the worst status and combines all modifications
 */
function mergeCrustResults(results: ItemCheckResult[]): ItemCheckResult {
  if (results.length === 0) {
    throw new Error('Cannot merge empty results array');
  }
  if (results.length === 1) {
    return results[0];
  }

  // Determine worst status
  const statusPriority: Record<string, number> = {
    'UNSAFE': 0,
    'NOT_SAFE_NOT_IN_SHEET': 1,
    'VERIFY_WITH_KITCHEN': 2,
    'MODIFIABLE': 3,
    'SAFE': 4,
  };

  let worstStatus = results[0].status;
  for (const result of results) {
    if ((statusPriority[result.status] ?? 5) < (statusPriority[worstStatus] ?? 5)) {
      worstStatus = result.status;
    }
  }

  // Combine item names and IDs
  const combinedName = results.map(r => r.itemName).join(' + ');
  const combinedId = results.map(r => r.itemId).join('+');
  
  // Combine per-allergen results
  const combinedPerAllergen: PerAllergenResult[] = [];
  const allergenMap = new Map<string, PerAllergenResult>();
  
  for (const result of results) {
    for (const pa of result.perAllergen) {
      const existing = allergenMap.get(pa.allergenId);
      if (existing) {
        // Merge: take worst status, combine substitutions and notes
        if ((statusPriority[pa.status] ?? 5) < (statusPriority[existing.status] ?? 5)) {
          existing.status = pa.status;
        }
        existing.substitutions = [...new Set([...existing.substitutions, ...pa.substitutions])];
        existing.notes = [...new Set([...existing.notes, ...pa.notes])];
        existing.foundIngredients = [...new Set([...existing.foundIngredients, ...pa.foundIngredients])];
      } else {
        allergenMap.set(pa.allergenId, { 
          ...pa, 
          substitutions: [...pa.substitutions],
          notes: [...pa.notes],
          foundIngredients: [...pa.foundIngredients],
        });
      }
    }
  }
  
  for (const pa of allergenMap.values()) {
    combinedPerAllergen.push(pa);
  }

  return {
    itemId: combinedId,
    itemName: combinedName,
    ticketCode: results.map(r => r.ticketCode).filter(Boolean).join(' + ') || undefined,
    status: worstStatus,
    canBeModified: worstStatus === 'MODIFIABLE' || worstStatus === 'SAFE',
    perAllergen: combinedPerAllergen,
  };
}

/**
 * Check a single item against selected allergens
 * Uses strict per-allergen safety rules from allergy sheets
 */
function checkItem(
  pack: TenantPack,
  item: MenuItem,
  allergenIds: string[]
): ItemCheckResult {
  // #region agent log - Debug: Verify checkItem is called
  console.log('[DEBUG-CHECKITEM] checkItem called:', { itemName: item.name, allergenIds });
  // #endregion
  
  const perAllergen: PerAllergenResult[] = [];
  let itemStatus: RuleStatus = 'SAFE';
  let canBeModified = true;

  for (const allergenId of allergenIds) {
    const allergenDef = pack.allergens.find((a) => a.id === allergenId);

    // Use the deterministic evaluation function
    const status = evaluateDishForAllergen(item, allergenId);
    const rule = item.allergenRules[allergenId];

    // Get substitutions and filter out any that conflict with OTHER selected allergens
    // This prevents showing "SUB multi-grain bun" when user has both egg AND gluten allergies
    const rawSubstitutions = rule?.substitutions || [];
    
    // #region agent log - Debug: Log BEFORE filtering
    if (rawSubstitutions.length > 0) {
      console.log('[DEBUG-H1] BEFORE filter:', { itemName: item.name, allergenId, allergenIds, rawSubstitutions });
    }
    // #endregion
    
    const filteredSubstitutions = filterConflictingSubstitutions(rawSubstitutions, allergenIds);
    
    // #region agent log - Debug: Log AFTER filtering
    if (rawSubstitutions.length > 0) {
      console.log('[DEBUG-H2] AFTER filter:', { itemName: item.name, allergenId, rawCount: rawSubstitutions.length, filteredCount: filteredSubstitutions.length, filteredSubstitutions });
    }
    // #endregion

    // Build notes array
    const notes: string[] = rule?.notes ? [rule.notes] : [];
    
    // Check if substitutions were filtered out due to conflicts with other allergens
    // If a dish was MODIFIABLE but all substitutions are now invalid, it becomes UNSAFE
    let effectiveStatus = status;
    if (status === 'MODIFIABLE' && rawSubstitutions.length > 0 && filteredSubstitutions.length === 0) {
      // All substitutions were filtered out - dish cannot be safely modified
      effectiveStatus = 'UNSAFE';
      
      // Get detailed reasons for why substitutions were rejected
      const conflicts = getConflictingSubstitutionsWithReasons(rawSubstitutions, allergenIds);
      if (conflicts.length > 0) {
        // Build a descriptive message
        const conflictDetails = conflicts.map(c => {
          const allergenNames = c.conflictingAllergens.join(', ');
          return `"${c.substitution}" contains ${allergenNames}`;
        }).join('; ');
        notes.push(`No safe substitution available: ${conflictDetails}`);
      } else {
        notes.push('No safe substitution available for your allergy combination');
      }
    }

    // Build result for this allergen
    perAllergen.push({
      allergenId,
      allergenName: allergenDef?.name || allergenId,
      status: effectiveStatus,
      foundIngredients: rule?.foundIngredients || [],
      substitutions: filteredSubstitutions,
      rawSubstitutions, // Include raw subs for consolidation pipeline
      notes,
    });

    // Update overall item status (worst status wins)
    itemStatus = worstStatus(itemStatus, effectiveStatus);

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
 * Check a dressing option against selected allergens
 * Dressings have their own allergenRules structure
 */
function checkDressingItem(
  pack: TenantPack,
  dressing: DressingOption,
  allergenIds: string[]
): ItemCheckResult {
  const perAllergen: PerAllergenResult[] = [];
  let itemStatus: RuleStatus = 'SAFE';
  let canBeModified = true;

  for (const allergenId of allergenIds) {
    const allergenDef = pack.allergens.find((a) => a.id === allergenId);
    
    // Get the dressing's allergen rule
    const rule = dressing.allergenRules?.[allergenId];
    
    // If no rule, assume VERIFY_WITH_KITCHEN (safest approach)
    let status: RuleStatus = rule?.status || 'VERIFY_WITH_KITCHEN';

    // Get substitutions and filter out any that conflict with OTHER selected allergens
    const rawSubstitutions = rule?.substitutions || [];
    const filteredSubstitutions = filterConflictingSubstitutions(rawSubstitutions, allergenIds);

    // Build notes array
    const notes: string[] = rule?.notes ? [rule.notes] : [];
    
    // Check if substitutions were filtered out due to conflicts with other allergens
    let effectiveStatus = status;
    if (status === 'MODIFIABLE' && rawSubstitutions.length > 0 && filteredSubstitutions.length === 0) {
      effectiveStatus = 'UNSAFE';
      const conflicts = getConflictingSubstitutionsWithReasons(rawSubstitutions, allergenIds);
      if (conflicts.length > 0) {
        const conflictDetails = conflicts.map(c => {
          const allergenNames = c.conflictingAllergens.join(', ');
          return `"${c.substitution}" contains ${allergenNames}`;
        }).join('; ');
        notes.push(`No safe substitution available: ${conflictDetails}`);
      } else {
        notes.push('No safe substitution available for your allergy combination');
      }
    }

    perAllergen.push({
      allergenId,
      allergenName: allergenDef?.name || allergenId,
      status: effectiveStatus,
      foundIngredients: [],
      substitutions: filteredSubstitutions,
      rawSubstitutions, // Include raw subs for consolidation pipeline
      notes,
    });

    // Update overall item status (worst status wins)
    itemStatus = worstStatus(itemStatus, effectiveStatus);

    // Determine if item can be modified
    if (status !== 'SAFE' && status !== 'MODIFIABLE') {
      canBeModified = false;
    }
  }

  return {
    itemId: dressing.id,
    itemName: dressing.name,
    ticketCode: undefined,
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
 * Uses consolidated modifications when available for clean, deduplicated output
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
    
    // Use consolidated notes if available (cleaner output)
    if (result.consolidated && result.consolidated.notes.length > 0) {
      for (const note of result.consolidated.notes) {
        lines.push(`   • ${note}`);
      }
      // Show rejected bread options if any
      if (result.consolidated.bread.rejected.length > 0) {
        for (const rejected of result.consolidated.bread.rejected) {
          lines.push(`   • "${rejected.option}" not safe: ${rejected.reason}`);
        }
      }
    } else {
      // Fallback to per-allergen notes
      for (const pa of result.perAllergen) {
        if (pa.status === 'UNSAFE') {
          lines.push(`   • ${pa.allergenName}: ${pa.notes.join(', ') || 'Contains allergen'}`);
        }
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

  // MODIFIABLE - Use consolidated modifications for clean, deduplicated output
  if (result.status === 'MODIFIABLE') {
    if (result.consolidated) {
      // Use component-based consolidated output
      
      // 1. BREAD (single best option)
      if (result.consolidated.bread.selected) {
        lines.push(`• **${result.consolidated.bread.selected}**`);
      }
      
      // 2. REMOVALS (grouped by category, but flat for ticket)
      const allRemovals = [
        ...result.consolidated.removals.sauce,
        ...result.consolidated.removals.garnish,
        ...result.consolidated.removals.seasoning,
        ...result.consolidated.removals.other,
      ];
      for (const removal of allRemovals) {
        lines.push(`• **${removal}**`);
      }
      
      // 3. SUBSTITUTIONS (protein + other)
      for (const sub of result.consolidated.substitutions.protein) {
        lines.push(`• **${sub}**`);
      }
      for (const sub of result.consolidated.substitutions.other) {
        lines.push(`• **${sub}**`);
      }
      
      // 4. PREPARATION instructions
      for (const prep of result.consolidated.preparation) {
        lines.push(`• **${prep}**`);
      }
      
      // Show warning if some bread options were rejected
      if (result.consolidated.bread.rejected.length > 0) {
        lines.push('');
        lines.push('   ⚠️ Some bread options not available due to your allergies:');
        for (const rejected of result.consolidated.bread.rejected) {
          lines.push(`   • "${rejected.option}" contains ${rejected.reason.replace('Contains ', '')}`);
        }
      }
    } else {
      // Fallback to per-allergen output (legacy path)
      for (const pa of result.perAllergen) {
        if (pa.status === 'MODIFIABLE' && pa.substitutions.length > 0) {
          for (const sub of pa.substitutions) {
            if (sub.startsWith('NO ') || sub.startsWith('SUB ')) {
              lines.push(`• **${sub}**`);
            } else {
              lines.push(`• ${sub}`);
            }
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
// Consolidation Pipeline
// ============================================================================

/**
 * CONSOLIDATION PIPELINE
 * 
 * Processes raw per-allergen results through a pipeline that:
 * 1. Collects all modifications across all allergens
 * 2. Deduplicates (exact matches + semantic equivalents)
 * 3. Cross-validates substitutions against ALL selected allergens
 * 4. Determines final safe options
 * 5. Returns consolidated, clean output
 * 
 * This solves two problems:
 * - Repetition: Same modification appearing multiple times
 * - Cross-allergen conflicts: e.g., "SUB multi-grain" shown for sesame allergy
 *   but multi-grain contains gluten (if gluten is also selected)
 */
/**
 * COMPONENT-BASED CONSOLIDATION PIPELINE
 * 
 * Processes modifications through these steps:
 * 1. Collect all modifications from all allergens
 * 2. Categorize each modification (bread, sauce, protein, etc.)
 * 3. Process BREAD separately - find single best option
 * 4. Group other modifications by category
 * 5. Deduplicate within each category
 * 6. Return clean, grouped output
 */
export function consolidateModifications(
  perAllergen: PerAllergenResult[],
  allSelectedAllergens: string[]
): ConsolidatedModifications {
  // Step 1: Collect all modifications across all allergens
  // Use FILTERED substitutions for display (already validated)
  const allModifications: string[] = [];
  // Use RAW substitutions for bread resolution (needs to track rejections)
  const allRawModifications: string[] = [];
  const allNotes: string[] = [];

  for (const result of perAllergen) {
    // Collect filtered substitutions (for non-bread display)
    for (const sub of result.substitutions) {
      allModifications.push(sub);
    }
    // Collect raw substitutions (for bread resolution with rejection tracking)
    if (result.rawSubstitutions) {
      for (const sub of result.rawSubstitutions) {
        allRawModifications.push(sub);
      }
    } else {
      // Fallback to filtered if raw not available
      for (const sub of result.substitutions) {
        allRawModifications.push(sub);
      }
    }
    for (const note of result.notes) {
      if (note && note.trim()) {
        allNotes.push(note);
      }
    }
  }

  // Step 2: Categorize modifications
  // Use FILTERED for non-bread items (already safe)
  const categorized = categorizeAllModifications(allModifications);
  // Use RAW for bread resolution (to track rejections properly)
  const categorizedRaw = categorizeAllModifications(allRawModifications);

  // #region DEBUG - Bread resolution tracing
  console.log('[DEBUG-BREAD] Raw modifications collected:', allRawModifications);
  console.log('[DEBUG-BREAD] Categorized raw bread:', categorizedRaw.bread);
  // #endregion

  // Step 3: Process BREAD separately using RAW substitutions
  // This allows bread resolution to cross-validate and track rejections
  const breadResolution = resolveBreadOption(
    categorizedRaw.bread.removals,
    categorizedRaw.bread.substitutions,
    allSelectedAllergens
  );
  
  // #region DEBUG - Bread resolution result
  console.log('[DEBUG-BREAD] Bread resolution result:', breadResolution);
  // #endregion

  // Step 4: Process non-bread modifications
  // Deduplicate within each category
  const sauceRemovals = deduplicateModifications(categorized.sauce.removals);
  const garnishRemovals = deduplicateModifications(categorized.garnish.removals);
  const seasoningRemovals = deduplicateModifications(categorized.seasoning.removals);
  const otherRemovals = deduplicateModifications(categorized.other.removals);

  // Process protein substitutions
  const proteinSubs = deduplicateModifications(categorized.protein.substitutions);
  const safeProteinSubs: string[] = [];
  for (const sub of proteinSubs) {
    const conflict = checkSubstitutionConflict(sub, allSelectedAllergens);
    if (!conflict.isConflicting) {
      safeProteinSubs.push(sub);
    }
  }

  // Process other substitutions (non-bread, non-protein)
  const otherSubs = deduplicateModifications(categorized.other.substitutions);
  const safeOtherSubs: string[] = [];
  for (const sub of otherSubs) {
    const conflict = checkSubstitutionConflict(sub, allSelectedAllergens);
    if (!conflict.isConflicting) {
      safeOtherSubs.push(sub);
    }
  }

  // Step 5: Process preparation instructions
  const preparation = deduplicateModifications(categorized.preparation);

  // Step 6: Deduplicate notes
  const uniqueNotes = deduplicateNotes(allNotes);

  // Build legacy fields for backward compatibility
  const legacyRemovals = [
    ...sauceRemovals,
    ...garnishRemovals,
    ...seasoningRemovals,
    ...otherRemovals,
  ];
  if (breadResolution.selected?.toLowerCase().startsWith('no ')) {
    legacyRemovals.push(breadResolution.selected);
  }

  const legacySubstitutions = [...safeProteinSubs, ...safeOtherSubs];
  if (breadResolution.selected && !breadResolution.selected.toLowerCase().startsWith('no ')) {
    legacySubstitutions.push(breadResolution.selected);
  }

  return {
    bread: breadResolution,
    removals: {
      sauce: sauceRemovals,
      garnish: garnishRemovals,
      seasoning: seasoningRemovals,
      other: otherRemovals,
    },
    substitutions: {
      protein: safeProteinSubs,
      other: safeOtherSubs,
    },
    preparation,
    notes: uniqueNotes,
    hadConflicts: breadResolution.rejected.length > 0,
    // Legacy fields
    _legacyRemovals: legacyRemovals,
    _legacySubstitutions: legacySubstitutions,
    _legacyRejectedSubstitutions: breadResolution.rejected.map(r => ({
      substitution: r.option,
      reason: r.reason,
    })),
  };
}

/**
 * Categorize a single modification based on keywords
 * 
 * IMPORTANT: Order matters! 
 * - BREAD must be checked FIRST because bread names like "buttery onion bun" 
 *   contain words that would match other categories (butter → garnish)
 * - Exception: "butter on bread/bun" is a garnish removal, not bread
 */
function categorizeModification(mod: string): { category: ModificationCategory; isRemoval: boolean } {
  const lower = mod.toLowerCase().trim();
  const isRemoval = lower.startsWith('no ');
  
  // BREAD - Check FIRST for bun/bread substitutions
  // BUT exclude "butter on bread" style modifications (those are garnish)
  const hasBunOrBread = lower.includes('bun') || lower.includes('bread');
  const isButterOnBread = lower.includes('butter on') || lower.includes('butter for');
  
  if (hasBunOrBread && !isButterOnBread) {
    return { category: 'bread', isRemoval };
  }
  
  // GARNISH - Toppings/additions that can be removed
  // Exception: "steak butter" is a preparation/protein item, not a garnish
  const isStakeButter = lower.includes('steak butter');
  if (!isStakeButter && (lower.includes('cheese') || lower.includes('scallion') ||
      lower.includes('lettuce') || lower.includes('tomato') || lower.includes('pickle') ||
      lower.includes('bacon') || lower.includes('coleslaw') || lower.includes('butter'))) {
    return { category: 'garnish', isRemoval };
  }
  
  // STEAK BUTTER - Goes to "other" for substitutions or removal
  if (isStakeButter) {
    return { category: 'other', isRemoval };
  }
  
  // SAUCE
  if (lower.includes('mayo') || lower.includes('sauce') || lower.includes('aioli') ||
      lower.includes('dressing') || lower.includes('vinaigrette') || lower.includes('drizzle') ||
      lower.includes('cream') || lower.includes('au jus') || lower.includes('horseradish') ||
      lower.includes('ketchup') || lower.includes('mustard')) {
    return { category: 'sauce', isRemoval };
  }
  
  // SEASONING - Spices and rubs
  if (lower.includes('crust') || lower.includes('spice') || lower.includes('blacken') ||
      lower.includes('seasoning') || lower.includes('rub') || lower.includes('za\'atar')) {
    return { category: 'seasoning', isRemoval };
  }
  
  // PREPARATION - Kitchen instructions
  if (lower.includes('clean') || lower.includes('grill') || lower.includes('fresh') ||
      lower.includes('separate')) {
    return { category: 'preparation', isRemoval: false };
  }
  
  // PROTEIN - Protein substitutions
  if (lower.includes('chicken') || lower.includes('plain ') || lower.includes('marinated')) {
    return { category: 'protein', isRemoval };
  }
  
  // Handle "onion" separately - only if it's NOT part of a bun name
  // "buttery onion bun" should be bread, but "NO onion" should be garnish
  if (lower.includes('onion') && !hasBunOrBread) {
    return { category: 'garnish', isRemoval };
  }
  
  // OTHER bread patterns (ciabatta, sourdough, focaccia, gf)
  if (lower.includes('ciabatta') || lower.includes('sourdough') || 
      lower.includes('focaccia') || lower.includes('gf ')) {
    return { category: 'bread', isRemoval };
  }
  
  return { category: 'other', isRemoval };
}

/**
 * Categorize all modifications into groups
 */
function categorizeAllModifications(modifications: string[]): {
  bread: { removals: string[]; substitutions: string[] };
  sauce: { removals: string[]; substitutions: string[] };
  protein: { removals: string[]; substitutions: string[] };
  garnish: { removals: string[]; substitutions: string[] };
  seasoning: { removals: string[]; substitutions: string[] };
  preparation: string[];
  other: { removals: string[]; substitutions: string[] };
} {
  const result = {
    bread: { removals: [] as string[], substitutions: [] as string[] },
    sauce: { removals: [] as string[], substitutions: [] as string[] },
    protein: { removals: [] as string[], substitutions: [] as string[] },
    garnish: { removals: [] as string[], substitutions: [] as string[] },
    seasoning: { removals: [] as string[], substitutions: [] as string[] },
    preparation: [] as string[],
    other: { removals: [] as string[], substitutions: [] as string[] },
  };

  for (const mod of modifications) {
    const { category, isRemoval } = categorizeModification(mod);
    
    if (category === 'preparation') {
      result.preparation.push(mod);
    } else if (isRemoval) {
      result[category].removals.push(mod);
    } else {
      result[category].substitutions.push(mod);
    }
  }

  return result;
}

/**
 * BREAD RESOLUTION: Find the single best bread option
 * 
 * Priority:
 * 1. If a safe SUB option exists, use it (prefer GF bun for most cases)
 * 2. If no safe SUB but bread removals exist (NO wheat bread, NO multi-grain), show "NO bread"
 * 3. Track all rejected options with reasons
 */
function resolveBreadOption(
  breadRemovals: string[],
  breadSubstitutions: string[],
  allSelectedAllergens: string[]
): BreadResolution {
  const rejected: Array<{ option: string; reason: string }> = [];
  
  // Deduplicate bread options first
  const uniqueRemovals = deduplicateModifications(breadRemovals);
  const uniqueSubstitutions = deduplicateModifications(breadSubstitutions);

  // Check each bread substitution against all allergens
  const safeSubstitutions: string[] = [];
  
  for (const sub of uniqueSubstitutions) {
    const conflict = checkSubstitutionConflict(sub, allSelectedAllergens);
    
    if (conflict.isConflicting) {
      rejected.push({
        option: sub,
        reason: `Contains ${conflict.conflictingAllergens.join(', ')}`,
      });
    } else {
      safeSubstitutions.push(sub);
    }
  }

  // Decision logic
  if (safeSubstitutions.length > 0) {
    // Prefer GF bun if available (most universally safe)
    const gfOption = safeSubstitutions.find(s => 
      s.toLowerCase().includes('gluten free') || 
      s.toLowerCase().includes('gluten-free') ||
      s.toLowerCase().includes('gf ')
    );
    
    return {
      selected: gfOption || safeSubstitutions[0],
      reason: 'Safe bread option available',
      rejected,
    };
  }

  // No safe substitution - check for explicit "NO bun/bread" removal
  const noBreadOption = uniqueRemovals.find(r => {
    const lower = r.toLowerCase();
    return lower.includes('no bun') || lower === 'no bread';
  });
  
  if (noBreadOption) {
    return {
      selected: noBreadOption,
      reason: rejected.length > 0 
        ? 'No safe bread substitution available'
        : 'Bread removal requested',
      rejected,
    };
  }

  // If we have bread removals (like "NO wheat bread", "NO multi-grain bread") 
  // but all substitutions were rejected, we need to derive "NO bread/bun"
  if (uniqueRemovals.length > 0 && rejected.length > 0) {
    return {
      selected: 'NO bread/bun',
      reason: 'All bread options contain allergens - serve without bread',
      rejected,
    };
  }

  // If we have bread removals but no substitutions at all (data just says remove specific bread)
  if (uniqueRemovals.length > 0 && uniqueSubstitutions.length === 0) {
    // Check if the removal is for a specific bread type (implies need to change/remove)
    const hasSpecificBreadRemoval = uniqueRemovals.some(r => {
      const lower = r.toLowerCase();
      return lower.includes('wheat') || lower.includes('multi-grain') || 
             lower.includes('sesame') || lower.includes('onion');
    });
    
    if (hasSpecificBreadRemoval) {
      return {
        selected: 'NO bread/bun (or ask for alternative)',
        reason: 'Default bread is not safe',
        rejected,
      };
    }
  }

  // No bread modifications at all
  return {
    selected: null,
    reason: 'No bread modifications needed',
    rejected,
  };
}

/**
 * Deduplicate modifications using exact match and semantic equivalence
 * Examples of semantic equivalents:
 * - "NO mayo" = "NO mayonnaise"
 * - "NO bun" (appears twice from different allergens)
 */
function deduplicateModifications(modifications: string[]): string[] {
  const seen = new Map<string, string>(); // normalized -> original
  
  // Semantic equivalents mapping (key -> canonical form)
  // Order matters: check longer patterns first
  const semanticPairs: Array<[string, string]> = [
    ['mayonnaise', 'mayo'],        // mayonnaise -> mayo (canonical)
    ['gluten-free bun', 'gf bun'], // normalize to shorter form
    ['gluten free bun', 'gf bun'],
    ['sub gf bun', 'sub gf bun'],
  ];
  
  for (const mod of modifications) {
    // Normalize: lowercase, trim
    let normalized = mod.toLowerCase().trim();
    
    // Apply semantic equivalents - replace longer forms with canonical short forms
    for (const [longer, canonical] of semanticPairs) {
      if (normalized.includes(longer)) {
        normalized = normalized.replace(longer, canonical);
      }
    }
    
    // Only keep first occurrence (preserves original casing)
    if (!seen.has(normalized)) {
      seen.set(normalized, mod);
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Deduplicate notes, removing exact duplicates and near-duplicates
 */
function deduplicateNotes(notes: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  
  for (const note of notes) {
    // Normalize for comparison
    const normalized = note.toLowerCase().trim();
    
    // Skip if we've seen this or very similar
    if (seen.has(normalized)) continue;
    
    // Skip generic notes that add no value when more specific ones exist
    if (normalized.includes('no safe substitution') && 
        result.some(r => r.toLowerCase().includes('contains'))) {
      continue;
    }
    
    seen.add(normalized);
    result.push(note);
  }
  
  return result;
}

/**
 * Apply consolidation pipeline to an ItemCheckResult
 * Updates the result in place with consolidated modifications
 */
function applyConsolidationPipeline(
  result: ItemCheckResult,
  allSelectedAllergens: string[]
): ItemCheckResult {
  // Run consolidation pipeline
  const consolidated = consolidateModifications(result.perAllergen, allSelectedAllergens);
  
  // Check if consolidation changed the effective status
  // If item was MODIFIABLE but all substitutions were rejected (no safe options), it becomes UNSAFE
  let effectiveStatus = result.status;
  
  if (result.status === 'MODIFIABLE') {
    // Check if we have any safe options left
    // - Bread: either a selected option (SUB or NO) means we have an option
    // - Removals: any removal in any category is safe
    // - Substitutions: any safe substitution is available
    const hasBreadOption = consolidated.bread.selected !== null;
    const hasRemovals = 
      consolidated.removals.sauce.length > 0 ||
      consolidated.removals.garnish.length > 0 ||
      consolidated.removals.seasoning.length > 0 ||
      consolidated.removals.other.length > 0;
    const hasSubstitutions = 
      consolidated.substitutions.protein.length > 0 ||
      consolidated.substitutions.other.length > 0;
    const hasPreparation = consolidated.preparation.length > 0;
    
    const hasSafeOptions = hasBreadOption || hasRemovals || hasSubstitutions || hasPreparation;
    
    if (!hasSafeOptions && consolidated.hadConflicts) {
      // All options were filtered out - item cannot be safely modified
      effectiveStatus = 'UNSAFE';
      
      // Add explanation note for rejected bread options
      if (consolidated.bread.rejected.length > 0) {
        const reasons = consolidated.bread.rejected
          .map(r => `"${r.option}" - ${r.reason}`)
          .join('; ');
        consolidated.notes.push(`Cannot accommodate: ${reasons}`);
      }
    }
  }
  
  return {
    ...result,
    status: effectiveStatus,
    consolidated,
  };
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
  let items: MenuItem[] = [];

  // Use O(1) index if available (built during pack validation)
  if (pack._categoryIndex) {
    items = pack._categoryIndex.get(categoryId) || [];
    // #region agent log - H3: Log items from category index before filtering
    if (categoryId === 'salads') {
      console.log('[DEBUG-H3] Index items before filter:', {categoryId,indexCount:items.length,indexItems:items.map(i=>({name:i.name,isSideOnly:i.isSideOnly})),hasKale:items.some(i=>i.name?.toLowerCase().includes('kale'))});
    }
    // #endregion
    // Filter out side-only items from main menu grid
    items = items.filter(item => !item.isSideOnly);
  } else {
    // #region agent log - H4: Log fallback path usage
    if (categoryId === 'salads') {
      const allSalads = pack.items.filter(i => i.categoryId === categoryId || (i as any).category?.toLowerCase() === 'salads');
      console.log('[DEBUG-H4] Using fallback filter:', {categoryId,allSaladsInPack:allSalads.map(i=>({name:i.name,categoryId:i.categoryId,isSideOnly:i.isSideOnly})),hasKale:allSalads.some(i=>i.name?.toLowerCase().includes('kale'))});
    }
    // #endregion
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

  // Find the category name for filtering
  const category = pack.categories?.find(c => c.id === categoryId);
  const categoryName = category?.name || categoryId;

  // #region agent log - H5: Log items before exclusion filter
  if (categoryId === 'salads') {
    console.log('[DEBUG-H5] Items before exclusion filter:', {categoryId,itemCount:items.length,itemNames:items.map(i=>i.name),hasKale:items.some(i=>i.name?.toLowerCase().includes('kale'))});
  }
  // #endregion

  // Apply category exclusion filters
  items = items.filter(item => {
    return !isDishExcludedFromCategory(categoryName, item.name);
  });

  // #region agent log - H5b: Log items after exclusion filter
  if (categoryId === 'salads') {
    console.log('[DEBUG-H5b] Items after exclusion filter:', {categoryId,itemCount:items.length,itemNames:items.map(i=>i.name),hasKale:items.some(i=>i.name?.toLowerCase().includes('kale'))});
  }
  // #endregion

  // Special handling for Nightly Specials category - filter to only valid specials
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
