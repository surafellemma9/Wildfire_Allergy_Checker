/**
 * Test all steaks have correct shellfish allergen rules
 */
import { describe, it, expect } from 'vitest';
import { checkAllergens, type CheckerSelections } from './checker';
import packData from '../../../generated/tenant-pack-v1.json';
import type { TenantPack } from '../tenant/packTypes';

const pack = packData as unknown as TenantPack;

describe('Steaks and Chops - Shellfish Allergy Rules', () => {
  const findItem = (name: string) => {
    const item = pack.items.find(i => i.name === name);
    if (!item) throw new Error(`Item not found: ${name}`);
    return item;
  };

  describe('Pork Chops - SAFE', () => {
    it('should mark "Bone-In Pork Chops" as SAFE for shellfish', () => {
      const item = findItem('Bone-In Pork Chops');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('SAFE');
      expect(result.mainItem.status).toBe('SAFE');
      expect(result.mainItem.perAllergen[0].substitutions).toHaveLength(0);
    });

    it('should mark "Pork Chops" as SAFE for shellfish', () => {
      const item = findItem('Pork Chops');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('SAFE');
    });
  });

  describe('Skirt Steak - MODIFIABLE', () => {
    it('should mark "Roumanian Skirt Steak" as MODIFIABLE with correct modifications', () => {
      const item = findItem('Roumanian Skirt Steak');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toEqual([
        'NO steak butter',
        'NO red onions',
        'NO steak marinade',
      ]);
    });

    it('should mark "Skirt Steak" as MODIFIABLE with correct modifications', () => {
      const item = findItem('Skirt Steak');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO steak butter');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO red onions');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO steak marinade');
    });
  });

  describe('New York Strip - MODIFIABLE', () => {
    it('should mark "New York Strip Steak" as MODIFIABLE with "NO steak butter"', () => {
      const item = findItem('New York Strip Steak');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toEqual(['NO steak butter']);
    });

    it('should mark "New York Strip" as MODIFIABLE with "NO steak butter"', () => {
      const item = findItem('New York Strip');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toEqual(['NO steak butter']);
    });
  });

  describe('Porterhouse - MODIFIABLE', () => {
    it('should mark "Porterhouse" as MODIFIABLE with correct modifications', () => {
      const item = findItem('Porterhouse');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO char-crust');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO steak butter');
    });
  });

  describe('Ribeye - MODIFIABLE', () => {
    it('should mark "Bone-In Ribeye" as MODIFIABLE with correct modifications', () => {
      const item = findItem('Bone-In Ribeye');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO char-crust');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO steak butter');
    });

    it('should mark "Ribeye" as MODIFIABLE with correct modifications', () => {
      const item = findItem('Ribeye');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO char-crust');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO steak butter');
    });
  });

  describe('Lamb Chops - MODIFIABLE', () => {
    it('should mark "Lamb Porterhouse Chops" as MODIFIABLE with correct modifications', () => {
      const item = findItem('Lamb Porterhouse Chops');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO char-crust');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO steak butter');
    });

    it('should mark "Lamb Chops" as MODIFIABLE with correct modifications', () => {
      const item = findItem('Lamb Chops');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO char-crust');
      expect(result.mainItem.perAllergen[0].substitutions).toContain('NO steak butter');
    });
  });

  describe('Kitchen ticket formatting', () => {
    it('should format New York Strip modifications in ticket', () => {
      const item = findItem('New York Strip');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.ticketLines.some(line => line.includes('**NO steak butter**'))).toBe(true);
      expect(result.mainItem.canBeModified).toBe(true);
    });

    it('should format Ribeye modifications in ticket', () => {
      const item = findItem('Ribeye');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.ticketLines.some(line => line.includes('**NO char-crust**'))).toBe(true);
      expect(result.ticketLines.some(line => line.includes('**NO steak butter**'))).toBe(true);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle customer ordering New York Strip with shellfish allergy', () => {
      const item = findItem('New York Strip');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      expect(result.overallStatus).toBe('MODIFIABLE');
      expect(result.mainItem.canBeModified).toBe(true);
      expect(result.mainItem.perAllergen[0].substitutions).toEqual(['NO steak butter']);

      // Should NOT show "NOT IN ALLERGY SHEET"
      expect(result.ticketLines.some(line => line.includes('NOT IN ALLERGY SHEET'))).toBe(false);
    });

    it('should handle multiple allergens including shellfish for steak', () => {
      const item = findItem('New York Strip');
      const selections: CheckerSelections = {
        allergenIds: ['shellfish', 'dairy'],
        itemId: item.id,
      };

      const result = checkAllergens(pack, selections);

      const shellfishResult = result.mainItem.perAllergen.find(a => a.allergenId === 'shellfish');
      expect(shellfishResult?.status).toBe('MODIFIABLE');
      expect(shellfishResult?.substitutions).toContain('NO steak butter');
    });
  });
});
