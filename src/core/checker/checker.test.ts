/**
 * Comprehensive Unit Tests for Safety-First Kitchen Ticket Logic
 *
 * Tests the strict per-allergen evaluation rules:
 * 1. Dish present in allergen sheet and modifiable with explicit modifications
 * 2. Dish present and safe
 * 3. Dish present but requires verification
 * 4. Dish missing from allergen sheet → NOT_SAFE_NOT_IN_SHEET
 * 5. Multi-allergen: one allergen missing dish → NOT_SAFE_NOT_IN_SHEET overall
 * 6. Dish modifiable under allergen A but missing under allergen B → NOT_SAFE_NOT_IN_SHEET overall
 */

import { describe, it, expect } from 'vitest';
import {
  checkAllergens,
  evaluateDishForAllergen,
  type CheckerSelections,
} from './checker';
import type { TenantPack, MenuItem } from '../tenant/packTypes';

// ============================================================================
// Test Data Setup
// ============================================================================

const mockPack: TenantPack = {
  tenantId: 'test-tenant',
  conceptName: 'Test Restaurant',
  locationName: 'Test Location',
  version: 1,
  generatedAt: '2024-01-01T00:00:00Z',
  allergens: [
    { id: 'dairy', name: 'Dairy', icon: '🥛' },
    { id: 'gluten', name: 'Gluten', icon: '🌾' },
    { id: 'shellfish', name: 'Shellfish', icon: '🦐' },
    { id: 'fish', name: 'Fish', icon: '🐟' },
    { id: 'eggs', name: 'Eggs', icon: '🥚' },
  ],
  categories: [
    { id: 'appetizers', name: 'Appetizers', icon: '🍤', sortOrder: 1 },
    { id: 'entrees', name: 'Entrees', icon: '🥩', sortOrder: 2 },
  ],
  items: [
    // Test Case 1: Dish with MODIFIABLE status (has explicit modifications)
    {
      id: 'chicken_skewers',
      name: 'Mediterranean Chicken Skewers',
      categoryId: 'appetizers',
      ticketCode: 'CHICKEN SKEWERS',
      allergenRules: {
        dairy: {
          status: 'MODIFIABLE',
          substitutions: ['NO yogurt sauce'],
          notes: undefined,
        },
        gluten: {
          status: 'SAFE',
          substitutions: [],
          notes: undefined,
        },
      },
    },
    // Test Case 2: Dish that is SAFE for all allergens
    {
      id: 'shrimp_cocktail',
      name: 'Shrimp Cocktail',
      categoryId: 'appetizers',
      ticketCode: 'SHRIMP COCKTAIL',
      allergenRules: {
        dairy: {
          status: 'SAFE',
          substitutions: [],
          notes: undefined,
        },
        gluten: {
          status: 'SAFE',
          substitutions: [],
          notes: undefined,
        },
      },
    },
    // Test Case 3: Dish that requires verification (FISH ONLY - business rule)
    {
      id: 'fish_special',
      name: 'Fresh Catch of the Day',
      categoryId: 'entrees',
      ticketCode: 'FISH SPECIAL',
      allergenRules: {
        fish: {
          status: 'VERIFY_WITH_KITCHEN',
          substitutions: [],
          notes: 'Daily fresh catch - preparation varies',
          requiresVerification: true,
        },
        gluten: {
          status: 'SAFE',
          substitutions: [],
          notes: undefined,
        },
      },
    },
    // Test Case 3b: Dish with VERIFY for NON-FISH allergen (should be converted to NOT_SAFE)
    {
      id: 'complex_dairy_dish',
      name: 'Complex Dairy Dish',
      categoryId: 'entrees',
      ticketCode: 'COMPLEX DAIRY',
      allergenRules: {
        dairy: {
          status: 'VERIFY_WITH_KITCHEN',  // This will be converted to NOT_SAFE by checker
          substitutions: [],
          notes: 'Contains dairy - requires verification',
          requiresVerification: true,
        },
        gluten: {
          status: 'SAFE',
          substitutions: [],
          notes: undefined,
        },
      },
    },
    // Test Case 4: Dish UNSAFE for specific allergen
    {
      id: 'breaded_item',
      name: 'Breaded Fried Item',
      categoryId: 'appetizers',
      ticketCode: 'BREADED ITEM',
      allergenRules: {
        gluten: {
          status: 'UNSAFE',
          substitutions: [],
          notes: 'Cannot be made gluten-free',
        },
        dairy: {
          status: 'SAFE',
          substitutions: [],
          notes: undefined,
        },
      },
    },
    // Test Case 5: Dish missing from allergen sheet (NOT_SAFE_NOT_IN_SHEET)
    {
      id: 'salmon_dish',
      name: 'Grilled Salmon',
      categoryId: 'entrees',
      ticketCode: 'SALMON',
      allergenRules: {
        dairy: {
          status: 'MODIFIABLE',
          substitutions: ['NO butter'],
          notes: undefined,
        },
        // Note: shellfish rule is intentionally MISSING
        // to test NOT_SAFE_NOT_IN_SHEET behavior
      },
    },
    // Test Case 6: Dish modifiable for one allergen, missing for another
    {
      id: 'steak',
      name: 'Petite Filet',
      categoryId: 'entrees',
      ticketCode: 'FILET',
      allergenRules: {
        dairy: {
          status: 'MODIFIABLE',
          substitutions: ['NO steak butter'],
          notes: undefined,
        },
        gluten: {
          status: 'MODIFIABLE',
          substitutions: ['GF steak butter'],
          notes: undefined,
        },
        // eggs rule is intentionally MISSING
      },
    },
  ],
};

// ============================================================================
// Test Suite 1: evaluateDishForAllergen() - Core Decision Function
// ============================================================================

describe('evaluateDishForAllergen - Core Safety Decision Function', () => {
  it('should return MODIFIABLE when dish has explicit modifications in allergy sheet', () => {
    const dish = mockPack.items[0]; // chicken_skewers
    const status = evaluateDishForAllergen(dish, 'dairy');
    expect(status).toBe('MODIFIABLE');
  });

  it('should return SAFE when dish is safe as-is', () => {
    const dish = mockPack.items[1]; // shrimp_cocktail
    const status = evaluateDishForAllergen(dish, 'dairy');
    expect(status).toBe('SAFE');
  });

  it('should return VERIFY_WITH_KITCHEN when dish requires manual verification (FISH ONLY)', () => {
    const dish = mockPack.items[2]; // fish_special
    const status = evaluateDishForAllergen(dish, 'fish');
    expect(status).toBe('VERIFY_WITH_KITCHEN');
  });

  it('should convert VERIFY_WITH_KITCHEN to NOT_SAFE_NOT_IN_SHEET for NON-FISH allergens', () => {
    const dish = mockPack.items[3]; // complex_dairy_dish with VERIFY status for dairy
    // CRITICAL: Non-fish allergens CANNOT use VERIFY status
    const status = evaluateDishForAllergen(dish, 'dairy');
    expect(status).toBe('NOT_SAFE_NOT_IN_SHEET');
  });

  it('should return UNSAFE when dish cannot be made safe', () => {
    const dish = mockPack.items[4]; // breaded_item
    const status = evaluateDishForAllergen(dish, 'gluten');
    expect(status).toBe('UNSAFE');
  });

  it('should return NOT_SAFE_NOT_IN_SHEET when dish is missing from allergy sheet', () => {
    const dish = mockPack.items[5]; // salmon_dish (has dairy rule but NO shellfish rule)
    const status = evaluateDishForAllergen(dish, 'shellfish');
    expect(status).toBe('NOT_SAFE_NOT_IN_SHEET');
  });

  it('should NOT infer across allergens - each allergen is independent', () => {
    const dish = mockPack.items[0]; // chicken_skewers
    // Has dairy rule but no eggs rule
    expect(evaluateDishForAllergen(dish, 'dairy')).toBe('MODIFIABLE');
    expect(evaluateDishForAllergen(dish, 'eggs')).toBe('NOT_SAFE_NOT_IN_SHEET');
  });
});

// ============================================================================
// Test Suite 2: Multi-Allergen Selection - Worst Status Wins
// ============================================================================

describe('checkAllergens - Multi-Allergen Selection Logic', () => {
  it('should return MODIFIABLE when single allergen selected and dish is modifiable', () => {
    const selections: CheckerSelections = {
      allergenIds: ['dairy'],
      itemId: 'chicken_skewers',
    };
    const result = checkAllergens(mockPack, selections);

    expect(result.overallStatus).toBe('MODIFIABLE');
    expect(result.mainItem.status).toBe('MODIFIABLE');
    expect(result.mainItem.perAllergen).toHaveLength(1);
    expect(result.mainItem.perAllergen[0].substitutions).toEqual(['NO yogurt sauce']);
  });

  it('should return SAFE when dish is safe for all selected allergens', () => {
    const selections: CheckerSelections = {
      allergenIds: ['dairy', 'gluten'],
      itemId: 'shrimp_cocktail',
    };
    const result = checkAllergens(mockPack, selections);

    expect(result.overallStatus).toBe('SAFE');
    expect(result.mainItem.status).toBe('SAFE');
  });

  it('should return NOT_SAFE_NOT_IN_SHEET when ANY allergen is missing from sheet', () => {
    const selections: CheckerSelections = {
      allergenIds: ['dairy', 'shellfish'], // dairy exists, shellfish does NOT
      itemId: 'salmon_dish',
    };
    const result = checkAllergens(mockPack, selections);

    // Overall status should be NOT_SAFE_NOT_IN_SHEET (worst status wins)
    expect(result.overallStatus).toBe('NOT_SAFE_NOT_IN_SHEET');
    expect(result.mainItem.status).toBe('NOT_SAFE_NOT_IN_SHEET');

    // Check individual allergen results
    const dairyResult = result.mainItem.perAllergen.find((a) => a.allergenId === 'dairy');
    const shellfishResult = result.mainItem.perAllergen.find((a) => a.allergenId === 'shellfish');

    expect(dairyResult?.status).toBe('MODIFIABLE');
    expect(shellfishResult?.status).toBe('NOT_SAFE_NOT_IN_SHEET');
  });

  it('should return NOT_SAFE_NOT_IN_SHEET over MODIFIABLE in multi-allergen selection', () => {
    const selections: CheckerSelections = {
      allergenIds: ['dairy', 'gluten', 'eggs'], // dairy+gluten modifiable, eggs MISSING
      itemId: 'steak',
    };
    const result = checkAllergens(mockPack, selections);

    expect(result.overallStatus).toBe('NOT_SAFE_NOT_IN_SHEET');
    expect(result.mainItem.canBeModified).toBe(false);
  });

  it('should return UNSAFE over MODIFIABLE when one allergen is unsafe', () => {
    const selections: CheckerSelections = {
      allergenIds: ['dairy', 'gluten'], // dairy safe, gluten unsafe
      itemId: 'breaded_item',
    };
    const result = checkAllergens(mockPack, selections);

    expect(result.overallStatus).toBe('UNSAFE');
    expect(result.mainItem.canBeModified).toBe(false);
  });

  it('should return VERIFY_WITH_KITCHEN over MODIFIABLE when FISH allergen needs verification', () => {
    const selections: CheckerSelections = {
      allergenIds: ['fish', 'gluten'], // fish needs verification, gluten safe
      itemId: 'fish_special',
    };
    const result = checkAllergens(mockPack, selections);

    expect(result.overallStatus).toBe('VERIFY_WITH_KITCHEN');
    expect(result.mainItem.canBeModified).toBe(false);
  });

  it('should return NOT_SAFE when NON-FISH allergen has VERIFY status (constraint enforcement)', () => {
    const selections: CheckerSelections = {
      allergenIds: ['dairy'], // dairy has VERIFY status but is NOT fish
      itemId: 'complex_dairy_dish',
    };
    const result = checkAllergens(mockPack, selections);

    // CRITICAL: Non-fish allergens with VERIFY status are converted to NOT_SAFE
    expect(result.overallStatus).toBe('NOT_SAFE_NOT_IN_SHEET');
    expect(result.mainItem.status).toBe('NOT_SAFE_NOT_IN_SHEET');
  });
});

// ============================================================================
// Test Suite 3: Kitchen Ticket Output Formatting
// ============================================================================

describe('Kitchen Ticket Generation', () => {
  it('should format SAFE status with checkmark', () => {
    const selections: CheckerSelections = {
      allergenIds: ['dairy'],
      itemId: 'shrimp_cocktail',
    };
    const result = checkAllergens(mockPack, selections);

    expect(result.ticketLines).toContain('✓ SAFE - No changes needed');
  });

  it('should format MODIFIABLE status with bold modifications', () => {
    const selections: CheckerSelections = {
      allergenIds: ['dairy'],
      itemId: 'chicken_skewers',
    };
    const result = checkAllergens(mockPack, selections);

    const hasModification = result.ticketLines.some((line) =>
      line.includes('**NO yogurt sauce**')
    );
    expect(hasModification).toBe(true);
  });

  it('should format NOT_SAFE_NOT_IN_SHEET with prominent warning', () => {
    const selections: CheckerSelections = {
      allergenIds: ['shellfish'],
      itemId: 'salmon_dish',
    };
    const result = checkAllergens(mockPack, selections);

    const hasWarning = result.ticketLines.some((line) =>
      line.includes('NOT SAFE — NOT IN ALLERGY SHEET')
    );
    const hasDoNotServe = result.ticketLines.some((line) =>
      line.includes('DO NOT SERVE')
    );
    expect(hasWarning).toBe(true);
    expect(hasDoNotServe).toBe(true);
  });

  it('should format VERIFY_WITH_KITCHEN with verification message (FISH ONLY)', () => {
    const selections: CheckerSelections = {
      allergenIds: ['fish'],
      itemId: 'fish_special',
    };
    const result = checkAllergens(mockPack, selections);

    const hasVerifyMessage = result.ticketLines.some((line) =>
      line.includes('VERIFY WITH THE KITCHEN')
    );
    expect(hasVerifyMessage).toBe(true);
  });

  it('should format UNSAFE with clear unsafe message', () => {
    const selections: CheckerSelections = {
      allergenIds: ['gluten'],
      itemId: 'breaded_item',
    };
    const result = checkAllergens(mockPack, selections);

    const hasUnsafeMessage = result.ticketLines.some((line) =>
      line.includes('NOT SAFE - Cannot be modified')
    );
    expect(hasUnsafeMessage).toBe(true);
  });
});

// ============================================================================
// Test Suite 4: Edge Cases and Safety Validations
// ============================================================================

describe('Edge Cases and Safety Validations', () => {
  it('should handle empty allergen selection', () => {
    const selections: CheckerSelections = {
      allergenIds: [],
      itemId: 'chicken_skewers',
    };
    const result = checkAllergens(mockPack, selections);

    expect(result.overallStatus).toBe('SAFE');
    expect(result.mainItem.perAllergen).toHaveLength(0);
  });

  it('should handle custom allergen with warning', () => {
    const selections: CheckerSelections = {
      allergenIds: ['dairy'],
      itemId: 'chicken_skewers',
      customAllergenText: 'nightshades',
    };
    const result = checkAllergens(mockPack, selections);

    expect(result.customAllergenWarning).toBeDefined();
    expect(result.customAllergenWarning).toContain('nightshades');
    // Custom allergens can't be verified against sheets, so must verify with kitchen
    expect(result.overallStatus).toBe('VERIFY_WITH_KITCHEN');
    expect(result.customAllergenWarning).toBeDefined();
  });

  it('should never suggest modifications for NOT_SAFE_NOT_IN_SHEET items', () => {
    const selections: CheckerSelections = {
      allergenIds: ['shellfish'],
      itemId: 'salmon_dish',
    };
    const result = checkAllergens(mockPack, selections);

    // Should have NO modifications suggested
    const shellfishResult = result.mainItem.perAllergen.find(
      (a) => a.allergenId === 'shellfish'
    );
    expect(shellfishResult?.substitutions).toEqual([]);
    expect(shellfishResult?.status).toBe('NOT_SAFE_NOT_IN_SHEET');
  });

  it('should maintain separation between allergen rules (no cross-contamination)', () => {
    const selections: CheckerSelections = {
      allergenIds: ['dairy', 'gluten'],
      itemId: 'steak',
    };
    const result = checkAllergens(mockPack, selections);

    const dairyResult = result.mainItem.perAllergen.find((a) => a.allergenId === 'dairy');
    const glutenResult = result.mainItem.perAllergen.find((a) => a.allergenId === 'gluten');

    // Each allergen should have its own modifications
    expect(dairyResult?.substitutions).toEqual(['NO steak butter']);
    expect(glutenResult?.substitutions).toEqual(['GF steak butter']);

    // Modifications should not be shared across allergens
    expect(dairyResult?.substitutions).not.toContain('GF steak butter');
    expect(glutenResult?.substitutions).not.toContain('NO steak butter');
  });
});

// ============================================================================
// Test Suite 5: Status Priority Order Validation
// ============================================================================

describe('Status Priority Order', () => {
  it('should enforce correct priority: NOT_SAFE_NOT_IN_SHEET > UNSAFE > VERIFY > MODIFIABLE > SAFE', () => {
    // Create a test item with all status types
    const testItem: MenuItem = {
      id: 'test_priority',
      name: 'Priority Test Item',
      categoryId: 'test',
      allergenRules: {
        safe_allergen: { status: 'SAFE', substitutions: [] },
        modifiable_allergen: { status: 'MODIFIABLE', substitutions: ['MOD'] },
        fish: { status: 'VERIFY_WITH_KITCHEN', substitutions: [] },  // VERIFY only allowed for fish
        unsafe_allergen: { status: 'UNSAFE', substitutions: [] },
        // missing_allergen will be NOT_SAFE_NOT_IN_SHEET
      },
    };

    // Test each priority level
    expect(evaluateDishForAllergen(testItem, 'safe_allergen')).toBe('SAFE');
    expect(evaluateDishForAllergen(testItem, 'modifiable_allergen')).toBe('MODIFIABLE');
    expect(evaluateDishForAllergen(testItem, 'fish')).toBe('VERIFY_WITH_KITCHEN');  // Fish can use VERIFY
    expect(evaluateDishForAllergen(testItem, 'unsafe_allergen')).toBe('UNSAFE');
    expect(evaluateDishForAllergen(testItem, 'missing_allergen')).toBe('NOT_SAFE_NOT_IN_SHEET');
  });
});

// ============================================================================
// Test Suite 6: FISH-ONLY VERIFY CONSTRAINT (CRITICAL BUSINESS RULE)
// ============================================================================

describe('Fish-Only VERIFY Constraint', () => {
  it('should ALLOW VERIFY_WITH_KITCHEN status for Fish allergen', () => {
    const fishDish: MenuItem = {
      id: 'daily_catch',
      name: 'Daily Fresh Catch',
      categoryId: 'seafood',
      allergenRules: {
        fish: {
          status: 'VERIFY_WITH_KITCHEN',
          substitutions: [],
          notes: 'Preparation varies by daily catch',
          requiresVerification: true,
        },
      },
    };

    const status = evaluateDishForAllergen(fishDish, 'fish');
    expect(status).toBe('VERIFY_WITH_KITCHEN');
  });

  it('should REJECT VERIFY_WITH_KITCHEN for Dairy allergen', () => {
    const dairyDish: MenuItem = {
      id: 'dairy_item',
      name: 'Dairy Item',
      categoryId: 'appetizers',
      allergenRules: {
        dairy: {
          status: 'VERIFY_WITH_KITCHEN',  // This should be converted to NOT_SAFE
          substitutions: [],
          notes: 'Contains dairy',
          requiresVerification: true,
        },
      },
    };

    const status = evaluateDishForAllergen(dairyDish, 'dairy');
    expect(status).toBe('NOT_SAFE_NOT_IN_SHEET');  // Converted by checker
  });

  it('should REJECT VERIFY_WITH_KITCHEN for Gluten allergen', () => {
    const glutenDish: MenuItem = {
      id: 'gluten_item',
      name: 'Gluten Item',
      categoryId: 'appetizers',
      allergenRules: {
        gluten: {
          status: 'VERIFY_WITH_KITCHEN',
          substitutions: [],
        },
      },
    };

    const status = evaluateDishForAllergen(glutenDish, 'gluten');
    expect(status).toBe('NOT_SAFE_NOT_IN_SHEET');
  });

  it('should REJECT VERIFY_WITH_KITCHEN for Shellfish allergen', () => {
    const shellfishDish: MenuItem = {
      id: 'shellfish_item',
      name: 'Shellfish Item',
      categoryId: 'seafood',
      allergenRules: {
        shellfish: {
          status: 'VERIFY_WITH_KITCHEN',
          substitutions: [],
        },
      },
    };

    const status = evaluateDishForAllergen(shellfishDish, 'shellfish');
    expect(status).toBe('NOT_SAFE_NOT_IN_SHEET');
  });

  it('should REJECT VERIFY_WITH_KITCHEN for Eggs allergen', () => {
    const eggDish: MenuItem = {
      id: 'egg_item',
      name: 'Egg Item',
      categoryId: 'brunch',
      allergenRules: {
        eggs: {
          status: 'VERIFY_WITH_KITCHEN',
          substitutions: [],
        },
      },
    };

    const status = evaluateDishForAllergen(eggDish, 'eggs');
    expect(status).toBe('NOT_SAFE_NOT_IN_SHEET');
  });

  it('should show NOT_SAFE ticket output for non-fish VERIFY (regression test)', () => {
    // This test proves that dishes which previously would have shown VERIFY
    // for non-fish allergens now show NOT_SAFE instead
    const selections: CheckerSelections = {
      allergenIds: ['dairy'],
      itemId: 'complex_dairy_dish',  // Has VERIFY status for dairy in mock data
    };
    const result = checkAllergens(mockPack, selections);

    // Should show NOT SAFE message, NOT verify message
    const hasNotSafe = result.ticketLines.some((line) =>
      line.includes('NOT SAFE — NOT IN ALLERGY SHEET')
    );
    const hasVerify = result.ticketLines.some((line) =>
      line.includes('VERIFY WITH THE KITCHEN')
    );

    expect(hasNotSafe).toBe(true);
    expect(hasVerify).toBe(false);
    expect(result.overallStatus).toBe('NOT_SAFE_NOT_IN_SHEET');
  });

  it('should handle multi-allergen with Fish VERIFY + other allergens correctly', () => {
    // When Fish has VERIFY and other allergens are SAFE, overall should be VERIFY
    const selections: CheckerSelections = {
      allergenIds: ['fish', 'gluten'],
      itemId: 'fish_special',
    };
    const result = checkAllergens(mockPack, selections);

    expect(result.overallStatus).toBe('VERIFY_WITH_KITCHEN');

    const fishResult = result.mainItem.perAllergen.find((a) => a.allergenId === 'fish');
    const glutenResult = result.mainItem.perAllergen.find((a) => a.allergenId === 'gluten');

    expect(fishResult?.status).toBe('VERIFY_WITH_KITCHEN');  // Fish allowed
    expect(glutenResult?.status).toBe('SAFE');
  });

  it('should handle multi-allergen with Fish VERIFY + NOT_SAFE_NOT_IN_SHEET correctly', () => {
    // When one allergen is NOT_SAFE_NOT_IN_SHEET, it should override VERIFY (worst status wins)
    const testDish: MenuItem = {
      id: 'test_fish_incomplete',
      name: 'Fish with Incomplete Rules',
      categoryId: 'seafood',
      allergenRules: {
        fish: {
          status: 'VERIFY_WITH_KITCHEN',
          substitutions: [],
        },
        // dairy is missing - will be NOT_SAFE_NOT_IN_SHEET
      },
    };

    // Add to mock pack temporarily for test
    const testPack = { ...mockPack, items: [...mockPack.items, testDish] };

    const selections: CheckerSelections = {
      allergenIds: ['fish', 'dairy'],  // fish has VERIFY, dairy is MISSING
      itemId: 'test_fish_incomplete',
    };
    const result = checkAllergens(testPack, selections);

    // NOT_SAFE_NOT_IN_SHEET should win over VERIFY
    expect(result.overallStatus).toBe('NOT_SAFE_NOT_IN_SHEET');
  });

  it('should produce deterministic results for all non-fish allergens (no VERIFY allowed)', () => {
    // List all non-fish allergens that must NEVER use VERIFY
    const nonFishAllergens = ['dairy', 'gluten', 'shellfish', 'eggs'];

    const testDish: MenuItem = {
      id: 'test_all_verify',
      name: 'Test All Allergens',
      categoryId: 'test',
      allergenRules: {
        dairy: { status: 'VERIFY_WITH_KITCHEN', substitutions: [] },
        gluten: { status: 'VERIFY_WITH_KITCHEN', substitutions: [] },
        shellfish: { status: 'VERIFY_WITH_KITCHEN', substitutions: [] },
        eggs: { status: 'VERIFY_WITH_KITCHEN', substitutions: [] },
      },
    };

    // All non-fish allergens should convert VERIFY to NOT_SAFE
    for (const allergen of nonFishAllergens) {
      const status = evaluateDishForAllergen(testDish, allergen);
      expect(status).toBe('NOT_SAFE_NOT_IN_SHEET');
    }
  });
});
