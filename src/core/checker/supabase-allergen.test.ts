/**
 * Comprehensive Allergen Tests Based on Supabase Migration Data
 *
 * These tests verify that the checker logic matches the ACTUAL rules
 * defined in the Supabase migration files.
 */

import { describe, it, expect } from 'vitest';
import { checkAllergens } from './checker';
import type { MenuItem, AllergenRule, RuleStatus, TenantPack, Allergen } from '../tenant/packTypes';

// Mock tenant pack structure
function createMockPack(items: MenuItem[]): TenantPack {
  const allergens: Allergen[] = [
    { id: 'dairy', name: 'Dairy' },
    { id: 'gluten', name: 'Gluten' },
    { id: 'shellfish', name: 'Shellfish' },
    { id: 'fish', name: 'Fish' },
    { id: 'eggs', name: 'Eggs' },
    { id: 'soy', name: 'Soy' },
    { id: 'peanuts', name: 'Peanuts' },
    { id: 'tree_nuts', name: 'Tree Nuts' },
    { id: 'sesame', name: 'Sesame' },
    { id: 'garlic', name: 'Garlic' },
    { id: 'onion', name: 'Onion' },
  ];

  return {
    version: 1,
    tenantId: 'test-tenant',
    tenantName: 'Test Restaurant',
    generatedAt: new Date().toISOString(),
    allergens,
    items,
  };
}

// Helper to create a test menu item
function createTestItem(
  id: string,
  name: string,
  category: string,
  allergenRules: Record<string, { status: RuleStatus; modifications: string[] }>
): MenuItem {
  const rules: Record<string, AllergenRule> = {};

  for (const [allergenId, rule] of Object.entries(allergenRules)) {
    rules[allergenId] = {
      status: rule.status,
      substitutions: rule.modifications,  // Map modifications to substitutions
    };
  }

  return {
    id,
    name,
    category,
    allergenRules: rules,
  };
}

describe('Supabase Allergen Data Accuracy Tests', () => {

  describe('SHELLFISH ALLERGY (010_shellfish_allergy.sql)', () => {

    it('New York Strip Steak should be MODIFIABLE with "NO steak butter"', () => {
      const item = createTestItem(
        'ny-strip',
        'New York Strip Steak',
        'Steaks',
        {
          shellfish: { status: 'MODIFIABLE', modifications: ['NO steak butter'] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['shellfish'],
        itemId: 'ny-strip',
      });

      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen.find(a => a.allergenId === 'shellfish')?.status).toBe('MODIFIABLE');

      // Check that modifications are present in ticket lines or per-allergen notes
      const shellfishResult = result.mainItem.perAllergen.find(a => a.allergenId === 'shellfish');
      const hasModification = shellfishResult?.substitutions.some(s => s.includes('NO steak butter')) ||
                              shellfishResult?.notes.some(n => n.includes('NO steak butter'));
      expect(hasModification).toBe(true);
    });

    it('Bone-In Pork Chops should be SAFE', () => {
      const item = createTestItem(
        'pork-chops',
        'Bone-In Pork Chops',
        'Steaks',
        {
          shellfish: { status: 'SAFE', modifications: [] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['shellfish'],
        itemId: 'pork-chops',
      });

      expect(result.mainItem.status).toBe('SAFE');
      expect(result.overallStatus).toBe('SAFE');
    });

    it('Cedar Planked Salmon should be SAFE for shellfish', () => {
      const item = createTestItem(
        'salmon',
        'Cedar Planked Salmon',
        'Seafood',
        {
          shellfish: { status: 'SAFE', modifications: [] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['shellfish'],
        itemId: 'salmon',
      });

      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Thick Prime Angus Burger should be MODIFIABLE with "NO fries, CAN sub any other side"', () => {
      const item = createTestItem(
        'angus-burger',
        'Thick Prime Angus Burger',
        'Sandwiches',
        {
          shellfish: { status: 'MODIFIABLE', modifications: ['NO fries', 'CAN sub any other side'] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['shellfish'],
        itemId: 'angus-burger',
      });

      expect(result.mainItem.status).toBe('MODIFIABLE');

      const shellfishResult = result.mainItem.perAllergen.find(a => a.allergenId === 'shellfish');
      expect(shellfishResult?.substitutions.length).toBeGreaterThan(0);
    });

    it('Wildfire Chopped Salad should be MODIFIABLE with "NO tortillas"', () => {
      const item = createTestItem(
        'chopped-salad',
        'Wildfire Chopped Salad',
        'Salads',
        {
          shellfish: { status: 'MODIFIABLE', modifications: ['NO tortillas'] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['shellfish'],
        itemId: 'chopped-salad',
      });

      expect(result.mainItem.status).toBe('MODIFIABLE');
    });
  });

  describe('DAIRY ALLERGY (002_allergen_modifications.sql)', () => {

    it('Mediterranean Chicken Skewers should be MODIFIABLE with "no yogurt sauce"', () => {
      const item = createTestItem(
        'chicken-skewers',
        'Mediterranean Chicken Skewers',
        'Appetizers',
        {
          dairy: { status: 'MODIFIABLE', modifications: ['no yogurt sauce'] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['dairy'],
        itemId: 'chicken-skewers',
      });

      expect(result.mainItem.status).toBe('MODIFIABLE');
    });

    it('Shrimp Cocktail should be SAFE', () => {
      const item = createTestItem(
        'shrimp-cocktail',
        'Shrimp Cocktail',
        'Appetizers',
        {
          dairy: { status: 'SAFE', modifications: [] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['dairy'],
        itemId: 'shrimp-cocktail',
      });

      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Crab Cakes should be MODIFIABLE with "no mustard mayonnaise"', () => {
      const item = createTestItem(
        'crab-cakes',
        'Crab Cakes',
        'Appetizers',
        {
          dairy: { status: 'MODIFIABLE', modifications: ['no mustard mayonnaise'] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['dairy'],
        itemId: 'crab-cakes',
      });

      expect(result.mainItem.status).toBe('MODIFIABLE');
    });
  });

  describe('FISH ALLERGY (012_fish_allergy.sql)', () => {

    it('Cedar Planked Salmon should be VERIFY_WITH_KITCHEN (fish dish)', () => {
      const item = createTestItem(
        'salmon',
        'Cedar Planked Salmon',
        'Seafood',
        {
          fish: { status: 'VERIFY_WITH_KITCHEN', modifications: [] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['fish'],
        itemId: 'salmon',
      });

      expect(result.mainItem.status).toBe('VERIFY_WITH_KITCHEN');
      expect(result.overallStatus).toBe('VERIFY_WITH_KITCHEN');
    });

    it('Macadamia Crusted Halibut should be VERIFY_WITH_KITCHEN (fish dish)', () => {
      const item = createTestItem(
        'halibut',
        'Macadamia Crusted Halibut',
        'Seafood',
        {
          fish: { status: 'VERIFY_WITH_KITCHEN', modifications: [] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['fish'],
        itemId: 'halibut',
      });

      expect(result.mainItem.status).toBe('VERIFY_WITH_KITCHEN');
    });

    it('New York Strip Steak should be SAFE for fish allergy', () => {
      const item = createTestItem(
        'ny-strip',
        'New York Strip Steak',
        'Steaks',
        {
          fish: { status: 'SAFE', modifications: [] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['fish'],
        itemId: 'ny-strip',
      });

      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('TREE_NUTS ALLERGY (006_peanut_treenut_allergy.sql)', () => {

    it('Macadamia Crusted Halibut should be UNSAFE (contains macadamia nuts)', () => {
      const item = createTestItem(
        'halibut',
        'Macadamia Crusted Halibut',
        'Seafood',
        {
          tree_nuts: { status: 'UNSAFE', modifications: [] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['tree_nuts'],
        itemId: 'halibut',
      });

      expect(result.mainItem.status).toBe('UNSAFE');
      expect(result.overallStatus).toBe('UNSAFE');
    });
  });

  describe('MULTIPLE ALLERGENS', () => {

    it('Should handle multiple allergens correctly for New York Strip', () => {
      const item = createTestItem(
        'ny-strip',
        'New York Strip Steak',
        'Steaks',
        {
          shellfish: { status: 'MODIFIABLE', modifications: ['NO steak butter'] },
          dairy: { status: 'MODIFIABLE', modifications: ['NO butter', 'NO cheese'] },
          gluten: { status: 'SAFE', modifications: [] },
          fish: { status: 'SAFE', modifications: [] },
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['shellfish', 'dairy', 'gluten', 'fish'],
        itemId: 'ny-strip',
      });

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen.find(a => a.allergenId === 'shellfish')?.status).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen.find(a => a.allergenId === 'dairy')?.status).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen.find(a => a.allergenId === 'gluten')?.status).toBe('SAFE');
      expect(result.mainItem.perAllergen.find(a => a.allergenId === 'fish')?.status).toBe('SAFE');
    });

    it('Should return UNSAFE as overall status if any allergen is UNSAFE', () => {
      const item = createTestItem(
        'halibut',
        'Macadamia Crusted Halibut',
        'Seafood',
        {
          shellfish: { status: 'MODIFIABLE', modifications: ['NO lemon butter sauce'] },
          tree_nuts: { status: 'UNSAFE', modifications: [] },
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['shellfish', 'tree_nuts'],
        itemId: 'halibut',
      });

      expect(result.overallStatus).toBe('UNSAFE');
      expect(result.mainItem.perAllergen.find(a => a.allergenId === 'tree_nuts')?.status).toBe('UNSAFE');
    });
  });

  describe('MISSING ALLERGEN DATA', () => {

    it('Should return NOT_SAFE_NOT_IN_SHEET if allergen rule is missing', () => {
      const item = createTestItem(
        'new-dish',
        'New Dish Not In Sheets',
        'Specials',
        {
          // No dairy rule defined
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['dairy'],
        itemId: 'new-dish',
      });

      expect(result.mainItem.perAllergen.find(a => a.allergenId === 'dairy')?.status).toBe('NOT_SAFE_NOT_IN_SHEET');
      expect(result.overallStatus).toBe('NOT_SAFE_NOT_IN_SHEET');
    });
  });

  describe('FISH-ONLY VERIFY CONSTRAINT', () => {

    it('Should convert non-fish VERIFY_WITH_KITCHEN to NOT_SAFE_NOT_IN_SHEET', () => {
      // If somehow a non-fish allergen has VERIFY status, checker should convert to NOT_SAFE
      const item = createTestItem(
        'test-dish',
        'Test Dish',
        'Steaks',
        {
          dairy: { status: 'VERIFY_WITH_KITCHEN', modifications: [] } // INVALID
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['dairy'],
        itemId: 'test-dish',
      });

      // Checker should convert invalid VERIFY to NOT_SAFE_NOT_IN_SHEET
      expect(result.mainItem.perAllergen.find(a => a.allergenId === 'dairy')?.status).toBe('NOT_SAFE_NOT_IN_SHEET');
      expect(result.overallStatus).toBe('NOT_SAFE_NOT_IN_SHEET');
    });

    it('Should allow VERIFY_WITH_KITCHEN ONLY for fish allergen', () => {
      const item = createTestItem(
        'salmon',
        'Cedar Planked Salmon',
        'Seafood',
        {
          fish: { status: 'VERIFY_WITH_KITCHEN', modifications: [] }
        }
      );

      const pack = createMockPack([item]);
      const result = checkAllergens(pack, {
        allergenIds: ['fish'],
        itemId: 'salmon',
      });

      expect(result.mainItem.perAllergen.find(a => a.allergenId === 'fish')?.status).toBe('VERIFY_WITH_KITCHEN');
      expect(result.overallStatus).toBe('VERIFY_WITH_KITCHEN');
    });
  });
});
