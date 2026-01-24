/**
 * Shellfish Allergy Integration Test
 * Tests real shellfish data from the tenant pack
 */

import { describe, it, expect } from 'vitest';
import { checkAllergens, type CheckerSelections } from './checker';
import packData from '../../../generated/tenant-pack-v1.json';
import type { TenantPack } from '../tenant/packTypes';

const pack = packData as TenantPack;

describe('Shellfish Allergy - Real Data Integration Tests', () => {
  // Helper to find item by name
  const findItem = (name: string) => {
    const item = pack.items.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (!item) throw new Error(`Item not found: ${name}`);
    return item;
  };

  describe('SAFE shellfish items', () => {
    it('should mark "Baked French Onion Soup" as SAFE for shellfish', () => {
      const item = findItem('Baked French Onion Soup');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('SAFE');
      expect(result.mainItem.status).toBe('SAFE');
      expect(result.mainItem.perAllergen[0].status).toBe('SAFE');
      expect(result.mainItem.perAllergen[0].substitutions).toHaveLength(0);
    });

    it('should mark "Mediterranean Chicken Skewers" as SAFE for shellfish', () => {
      const item = findItem('Mediterranean Chicken Skewers');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('SAFE');
      expect(result.ticketLines).toContain('✓ SAFE - No changes needed');
    });

    it('should mark "Cedar Planked Salmon" as SAFE for shellfish', () => {
      const item = findItem('Cedar Planked Salmon');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('SAFE');
      expect(result.mainItem.perAllergen[0].foundIngredients).toHaveLength(0);
    });

    it('should mark brunch items as SAFE for shellfish', () => {
      const item = findItem('Buttermilk Pancakes');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('SAFE');
    });

    it('should mark all desserts as SAFE for shellfish', () => {
      const desserts = [
        'Chocolate Layer Cake',
        'New York Style Cheesecake',
        'Key Lime Pie',
        'Vanilla Ice Cream'
      ];

      desserts.forEach(dessertName => {
        const item = findItem(dessertName);
        const selections: CheckerSelections = {
          allergenIds: ['shellfish'],
          itemId: item.id,
        };

        const result = checkAllergens(pack, selections);

        expect(result.overallStatus).toBe('SAFE');
        expect(result.mainItem.status).toBe('SAFE');
      });
    });
  });

  describe('MODIFIABLE shellfish items', () => {
    it('should mark "Steak and Blue Cheese Salad" as MODIFIABLE with "NO crispy onions"', () => {
      const item = findItem('Steak and Blue Cheese Salad');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO crispy onions');
      expect(result.ticketLines.some(line => line.includes('NO crispy onions'))).toBe(true);
    });

    it('should mark "Wildfire Chopped Salad" as MODIFIABLE with "NO tortillas"', () => {
      const item = findItem('Wildfire Chopped Salad');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO tortillas');
    });

    it('should mark burgers as MODIFIABLE with "NO fries"', () => {
      const item = findItem('Thick Prime Angus Burger');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO fries');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('CAN sub any other side');
    });

    it('should mark "Baby Back Ribs" as MODIFIABLE with "NO barbeque sauce"', () => {
      const item = findItem('Baby Back Ribs');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO barbeque sauce');
    });

    it('should mark "Macadamia Crusted Halibut" as MODIFIABLE with "NO lemon butter sauce"', () => {
      const item = findItem('Macadamia Crusted Halibut');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO lemon butter sauce');
    });

    it('should mark steaks as MODIFIABLE with "NO steak butter"', () => {
      const item = findItem('New York Strip Steak');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO steak butter');
    });
  });

  describe('Multi-allergen combinations with shellfish', () => {
    it('should handle shellfish + dairy correctly (both safe)', () => {
      const item = findItem('Cedar Planked Salmon');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish', 'dairy'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      const shellfishResult = result.mainItem.perAllergen.find(a => a.allergenId === 'shellfish');
      const dairyResult = result.mainItem.perAllergen.find(a => a.allergenId === 'dairy');

      expect(shellfishResult?.status).toBe('SAFE');
      expect(dairyResult).toBeDefined(); // Should have dairy data too
    });

    it('should handle shellfish + gluten with modifications', () => {
      const item = findItem('Wildfire Chopped Salad');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish', 'gluten'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      const shellfishResult = result.mainItem.perAllergen.find(a => a.allergenId === 'shellfish');
      const glutenResult = result.mainItem.perAllergen.find(a => a.allergenId === 'gluten');

      expect(shellfishResult?.status).toBe('MODIFIABLE');
      expect(shellfishResult?.substitutions).toContain('NO tortillas');
      expect(glutenResult).toBeDefined();
    });
  });

  describe('Coverage validation', () => {
    it('should have shellfish data for all items', () => {
      // Count items without shellfish rules
      const itemsWithoutShellfish = pack.items.filter(item =>
        !item.allergenRules || !item.allergenRules.shellfish
      );

      // UPDATED: We now expect NO items without shellfish rules
      expect(itemsWithoutShellfish.length).toBe(0);
    });

    it('should have at least 60 SAFE shellfish items', () => {
      const safeItems = pack.items.filter(item =>
        item.allergenRules?.shellfish?.status === 'SAFE'
      );

      expect(safeItems.length).toBeGreaterThanOrEqual(60);
    });

    it('should have at least 15 MODIFIABLE shellfish items', () => {
      const modifiableItems = pack.items.filter(item =>
        item.allergenRules?.shellfish?.status === 'MODIFIABLE'
      );

      expect(modifiableItems.length).toBeGreaterThanOrEqual(15);
    });

    it('should NOT have any UNSAFE shellfish items (shellfish items are either safe or modifiable)', () => {
      const unsafeItems = pack.items.filter(item =>
        item.allergenRules?.shellfish?.status === 'UNSAFE'
      );

      expect(unsafeItems.length).toBe(0);
    });
  });

  describe('Kitchen ticket format validation', () => {
    it('should format SAFE shellfish items correctly', () => {
      const item = findItem('Baked French Onion Soup');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.ticketLines).toContain('✓ SAFE - No changes needed');
      expect(result.ticketLines.some(line => line.includes('NOT SAFE'))).toBe(false);
    });

    it('should format MODIFIABLE shellfish items with bold modifications', () => {
      const item = findItem('Baby Back Ribs');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.ticketLines.some(line => line.includes('**NO barbeque sauce**'))).toBe(true);
    });

    it('should include item ticket code in kitchen output', () => {
      const item = findItem('Mediterranean Chicken Skewers');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      // Should have header with item name or code
      expect(result.ticketLines[0]).toContain('===');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle customer ordering burger without fries (shellfish allergy)', () => {
      const item = findItem('Bison Burger');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.canBeModified).toBe(true);
      expect(result.mainItem.perAllergen[0].substitutions).toEqual([
        'NO fries',
        'CAN sub any other side'
      ]);
    });

    it('should handle customer ordering steak without shellfish butter', () => {
      const item = findItem('Bone-In Ribeye');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO steak butter');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO char-crust');
    });

    it('should handle kids meal with shellfish allergy', () => {
      const item = findItem('Kids Burger');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO fries');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('CAN sub any other side');
    });

    it('should handle brunch order with shellfish allergy', () => {
      const item = findItem('Classic Breakfast');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('SAFE');
      expect(result.mainItem.canBeModified).toBe(true);
    });
  });
});
