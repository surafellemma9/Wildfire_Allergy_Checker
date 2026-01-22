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
export type RuleStatus = 'SAFE' | 'MODIFY' | 'UNSAFE' | 'UNKNOWN';

// Individual allergen rule for a menu item
export interface AllergenRule {
  status: RuleStatus;
  foundIngredients?: string[];
  substitutions?: string[];
  notes?: string;
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
  requiresCrust?: boolean;      // triggers crust selection in Step 4
  
  // Item-specific options
  sides?: SideOption[];
  crustOptions?: CrustOption[];
  dressingOptions?: DressingOption[];
  
  // Allergen rules keyed by allergenId
  allergenRules: Record<string, AllergenRule>;
}

// Category definition
export interface Category {
  id: string;
  name: string;
  icon?: string;
  sortOrder?: number;
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
  
  // Allergen definitions for UI display
  allergens: AllergenDef[];
  
  // Menu categories
  categories: Category[];
  
  // All menu items
  items: MenuItem[];
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
