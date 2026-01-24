/**
 * Pack Validator Module
 * Runtime validation and schema migration for TenantPack
 */

import type { TenantPack, MenuItem, AllergenRule, RuleStatus } from './packTypes';

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  migrated: boolean;
}

// ============================================================================
// Status Mapping (for legacy pack migration)
// ============================================================================

const STATUS_MAP: Record<string, RuleStatus> = {
  // Canonical format (correct)
  'SAFE': 'SAFE',
  'MODIFIABLE': 'MODIFIABLE',
  'VERIFY_WITH_KITCHEN': 'VERIFY_WITH_KITCHEN',
  'NOT_SAFE_NOT_IN_SHEET': 'NOT_SAFE_NOT_IN_SHEET',
  'UNSAFE': 'UNSAFE',

  // Legacy format mappings
  'safe': 'SAFE',
  'modifiable': 'MODIFIABLE',
  'not_modifiable': 'UNSAFE',
  'unknown': 'NOT_SAFE_NOT_IN_SHEET',

  // Old incorrect formats (migrate to canonical)
  'MODIFY': 'MODIFIABLE',
  'UNKNOWN': 'NOT_SAFE_NOT_IN_SHEET',
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate and optionally migrate a TenantPack
 * Returns validation result with migrated pack if needed
 */
export function validateAndMigratePack(pack: unknown): {
  result: ValidationResult;
  pack: TenantPack | null;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  let migrated = false;

  // Basic type check
  if (!pack || typeof pack !== 'object') {
    return {
      result: { valid: false, errors: ['Pack is null or not an object'], warnings: [], migrated: false },
      pack: null,
    };
  }

  const p = pack as Record<string, unknown>;

  // Required top-level fields
  if (!p.tenantId || typeof p.tenantId !== 'string') {
    errors.push('Missing or invalid tenantId');
  }
  if (!p.version || typeof p.version !== 'number') {
    errors.push('Missing or invalid version');
  }
  if (!Array.isArray(p.items)) {
    errors.push('Missing or invalid items array');
    return {
      result: { valid: false, errors, warnings, migrated },
      pack: null,
    };
  }
  if (!Array.isArray(p.categories)) {
    errors.push('Missing or invalid categories array');
  }
  if (!Array.isArray(p.allergens)) {
    errors.push('Missing or invalid allergens array');
  }

  // Validate and migrate items
  const migratedItems: MenuItem[] = [];
  
  for (let i = 0; i < (p.items as unknown[]).length; i++) {
    const item = (p.items as unknown[])[i] as Record<string, unknown>;
    const itemPrefix = `items[${i}]`;

    // Required item fields
    if (!item.name || typeof item.name !== 'string') {
      errors.push(`${itemPrefix}: Missing or invalid name`);
      continue;
    }

    // Migrate category → categoryId
    let categoryId = item.categoryId as string | undefined;
    if (!categoryId && item.category && typeof item.category === 'string') {
      // Legacy: derive categoryId from category name
      categoryId = (item.category as string)
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      warnings.push(`${itemPrefix}: Migrated category "${item.category}" → categoryId "${categoryId}"`);
      migrated = true;
    }
    if (!categoryId) {
      errors.push(`${itemPrefix}: Missing categoryId and category`);
    }

    // Validate and migrate allergenRules
    const allergenRules: Record<string, AllergenRule> = {};
    const rawRules = item.allergenRules as Record<string, unknown> | undefined;
    
    if (rawRules && typeof rawRules === 'object') {
      for (const [allergenId, rule] of Object.entries(rawRules)) {
        if (!rule || typeof rule !== 'object') continue;
        
        const r = rule as Record<string, unknown>;
        
        // Migrate status
        let status: RuleStatus = 'NOT_SAFE_NOT_IN_SHEET';
        if (r.status && typeof r.status === 'string') {
          const mappedStatus = STATUS_MAP[r.status];
          if (mappedStatus) {
            if (r.status !== mappedStatus) {
              migrated = true;
            }
            status = mappedStatus;
          } else {
            warnings.push(`${itemPrefix}.allergenRules.${allergenId}: Unknown status "${r.status}", defaulting to NOT_SAFE_NOT_IN_SHEET`);
            status = 'NOT_SAFE_NOT_IN_SHEET';
          }
        }

        // Migrate modifications → substitutions
        let substitutions: string[] = [];
        if (Array.isArray(r.substitutions)) {
          substitutions = r.substitutions.filter((s): s is string => typeof s === 'string');
        } else if (Array.isArray(r.modifications)) {
          // Legacy field name
          substitutions = r.modifications.filter((s): s is string => typeof s === 'string');
          migrated = true;
        }

        allergenRules[allergenId] = {
          status,
          substitutions,
          notes: typeof r.notes === 'string' ? r.notes : undefined,
          foundIngredients: Array.isArray(r.foundIngredients) 
            ? r.foundIngredients.filter((s): s is string => typeof s === 'string')
            : undefined,
        };
      }
    }

    migratedItems.push({
      id: typeof item.id === 'string' ? item.id : `item-${i}`,
      name: item.name as string,
      categoryId: categoryId || 'uncategorized',
      ticketCode: typeof item.ticketCode === 'string' ? item.ticketCode : undefined,
      description: typeof item.description === 'string' ? item.description : undefined,
      isEntree: typeof item.isEntree === 'boolean' ? item.isEntree : undefined,
      requiresCrust: typeof item.requiresCrust === 'boolean' ? item.requiresCrust : undefined,
      sides: Array.isArray(item.sides) ? item.sides : undefined,
      crustOptions: Array.isArray(item.crustOptions) ? item.crustOptions : undefined,
      dressingOptions: Array.isArray(item.dressingOptions) ? item.dressingOptions : undefined,
      allergenRules,
    });
  }

  if (errors.length > 0) {
    return {
      result: { valid: false, errors, warnings, migrated },
      pack: null,
    };
  }

  // Build migrated pack
  const migratedPack: TenantPack = {
    tenantId: p.tenantId as string,
    conceptName: typeof p.conceptName === 'string' ? p.conceptName : 'Unknown',
    locationName: typeof p.locationName === 'string' ? p.locationName : 'Unknown',
    version: p.version as number,
    generatedAt: typeof p.generatedAt === 'string' ? p.generatedAt : new Date().toISOString(),
    updateIntervalMs: typeof p.updateIntervalMs === 'number' ? p.updateIntervalMs : undefined,
    allergens: Array.isArray(p.allergens) ? p.allergens : [],
    categories: Array.isArray(p.categories) ? p.categories : [],
    items: migratedItems,
  };

  // Build category index for O(1) lookups
  buildCategoryIndex(migratedPack);

  if (migrated) {
    console.warn('[PackValidator] Legacy pack detected and migrated:', warnings);
  }

  return {
    result: { valid: true, errors: [], warnings, migrated },
    pack: migratedPack,
  };
}

// ============================================================================
// Performance Optimization: Category Index
// ============================================================================

/**
 * Build category index for O(1) category lookups
 * This converts O(n) getItemsByCategory() to O(1)
 *
 * Before: Filtering 10,000 items for a category = 10,000 iterations
 * After: Direct Map lookup = 1 operation
 */
export function buildCategoryIndex(pack: TenantPack): void {
  const categoryIndex = new Map<string, MenuItem[]>();

  // Group items by categoryId
  for (const item of pack.items) {
    const existing = categoryIndex.get(item.categoryId) || [];
    existing.push(item);
    categoryIndex.set(item.categoryId, existing);
  }

  // Attach to pack (not serialized in JSON)
  pack._categoryIndex = categoryIndex;
}

/**
 * Get items by category using index (O(1) instead of O(n))
 */
export function getItemsByCategoryOptimized(
  pack: TenantPack,
  categoryId: string
): MenuItem[] {
  // Use index if available
  if (pack._categoryIndex) {
    return pack._categoryIndex.get(categoryId) || [];
  }

  // Fallback to linear search (should not happen if pack is validated)
  return pack.items.filter((item) => item.categoryId === categoryId);
}

// ============================================================================
// Smoke Check Function
// ============================================================================

export interface SmokeCheckResult {
  packVersion: number;
  packChecksum?: string;
  itemCount: number;
  categoryCount: number;
  allergenCount: number;
  sampleLookup: {
    dishName: string;
    allergen: string;
    found: boolean;
    result?: {
      status: string;
      substitutions: string[];
    };
  };
}

/**
 * Run a smoke check on the pack
 */
export function runSmokeCheck(pack: TenantPack, checksum?: string): SmokeCheckResult {
  // Sample lookup: Baked French Onion Soup + gluten
  const sampleDish = pack.items.find(i => i.name === 'Baked French Onion Soup');
  const glutenRule = sampleDish?.allergenRules?.gluten;

  return {
    packVersion: pack.version,
    packChecksum: checksum,
    itemCount: pack.items.length,
    categoryCount: pack.categories.length,
    allergenCount: pack.allergens.length,
    sampleLookup: {
      dishName: 'Baked French Onion Soup',
      allergen: 'gluten',
      found: !!sampleDish && !!glutenRule,
      result: glutenRule ? {
        status: glutenRule.status,
        substitutions: glutenRule.substitutions || [],
      } : undefined,
    },
  };
}

/**
 * Log pack debug info
 */
export function logPackDebugInfo(pack: TenantPack, checksum?: string, source?: string): void {
  const smokeCheck = runSmokeCheck(pack, checksum);
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📦 PACK DEBUG INFO');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Source:      ${source || 'unknown'}`);
  console.log(`Version:     ${smokeCheck.packVersion}`);
  console.log(`Checksum:    ${smokeCheck.packChecksum || 'not available'}`);
  console.log(`Items:       ${smokeCheck.itemCount}`);
  console.log(`Categories:  ${smokeCheck.categoryCount}`);
  console.log(`Allergens:   ${smokeCheck.allergenCount}`);
  console.log('───────────────────────────────────────────────────────────');
  console.log('🔍 Sample Lookup: "Baked French Onion Soup" + gluten');
  console.log(`   Found:        ${smokeCheck.sampleLookup.found}`);
  if (smokeCheck.sampleLookup.result) {
    console.log(`   Status:       ${smokeCheck.sampleLookup.result.status}`);
    console.log(`   Substitutions: ${JSON.stringify(smokeCheck.sampleLookup.result.substitutions)}`);
  }
  console.log('═══════════════════════════════════════════════════════════');
}
