/**
 * TenantPack Types
 * Defines the structure of the versioned data pack downloaded from Supabase
 */

// All allergen identifiers supported by the system
export type AllergenId =
  | 'dairy'
  | 'gluten'
  | 'shellfish'
  | 'fish'
  | 'egg'
  | 'soy'
  | 'peanuts'
  | 'tree_nuts'
  | 'sesame'
  | 'msg'
  | 'onion_garlic'
  | 'tomato'
  | 'seed'
  | 'custom';

// Rule status for allergen checks
// SAFETY-FIRST STATUS HIERARCHY (strictest to least strict):
// - NOT_SAFE_NOT_IN_SHEET: Dish not present in allergen sheet (NEVER safe to serve)
// - UNSAFE: Explicitly marked unsafe in allergen sheet (cannot be modified)
// - VERIFY_WITH_KITCHEN: Requires manual kitchen verification before serving
// - MODIFIABLE: Can be made safe with explicit modifications from allergen sheet
// - SAFE: Safe to serve as-is with no modifications
export type RuleStatus =
  | 'SAFE'
  | 'MODIFIABLE'
  | 'VERIFY_WITH_KITCHEN'
  | 'NOT_SAFE_NOT_IN_SHEET'
  | 'UNSAFE';

// Individual allergen rule for a menu item
export interface AllergenRule {
  status: RuleStatus;
  foundIngredients?: string[];
  substitutions?: string[];  // Only populated if status is MODIFIABLE
  notes?: string;
  requiresVerification?: boolean;  // Set to true if manual verification needed
}

// Side dish option for entrees
export interface SideOption {
  id: string;
  name: string;
}

// Crust option for steaks
export interface CrustOption {
  id: string;
  name: string;
}

// Dressing option for salads
export interface DressingOption {
  id: string;
  name: string;
  safeAlternatives?: string[];
  ingredients?: string[];  // Ingredients in the dressing for custom allergen search
  allergenRules?: Record<string, AllergenRule>;  // Allergen rules for this dressing
}

// Add-on option (for steaks)
export interface AddOnOption {
  id: string;
  name: string;
}

// Menu item definition
export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  ticketCode?: string;
  description?: string;

  // Flow triggers
  isEntree?: boolean;           // triggers side prompt in Step 3
  isSideOnly?: boolean;         // if true, hide from main grid (only show in side selection)
  requiresCrust?: boolean;      // triggers crust selection in Step 4
  requiresAddOns?: boolean;     // triggers add-on selection (for steaks)

  // Item-specific options
  sides?: SideOption[];
  crustOptions?: CrustOption[];
  dressingOptions?: DressingOption[];
  addOnOptions?: AddOnOption[];  // Multiple add-ons can be selected

  // Ingredients for custom allergen search
  ingredients?: string[];
  garnishes?: string[];

  // Allergen rules keyed by allergenId
  allergenRules: Record<string, AllergenRule>;
}

// Category definition
export interface Category {
  id: string;
  name: string;
  icon?: string;
  sortOrder?: number;
  needsReview?: boolean;  // Flag indicating category needs allergy review
}

// Allergen definition (for display)
export interface AllergenDef {
  id: string;
  name: string;
  icon?: string;
}

// Complete Tenant Pack structure
export interface TenantPack {
  tenantId: string;
  conceptName: string;
  locationName: string;
  version: number;
  generatedAt: string;

  // Configuration
  updateIntervalMs?: number;     // Optional: how often to check for updates (default: 6 hours)

  // Allergen definitions for UI display
  allergens: AllergenDef[];

  // Master list of all ingredients for autocomplete search
  allIngredients?: string[];
  allGarnishes?: string[];

  // Menu categories
  categories: Category[];

  // All menu items
  items: MenuItem[];

  // Performance optimizations (computed at runtime, not in JSON)
  _categoryIndex?: Map<string, MenuItem[]>;  // O(1) category lookup
}

// Cached pack with metadata
export interface CachedPack {
  pack: TenantPack;
  checksum: string;
  storedAt: string;
}

// Tenant context stored locally
export interface TenantContext {
  tenantId: string;
  conceptName: string;
  locationName: string;
  deviceToken: string;
}

// API response types
export interface ActivateResponse {
  tenant: {
    id: string;
    conceptName: string;
    locationName: string;
  };
  deviceToken: string;
  pack: {
    version: number;
    signedUrl: string;
    checksum: string;
  };
}

export interface GetLatestPackResponse {
  tenantId: string;
  version: number;
  signedUrl: string;
  checksum: string;
}

export interface ApiError {
  error: string;
  code: string;
}
