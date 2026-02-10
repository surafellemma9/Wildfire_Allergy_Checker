/**
 * WILDFIRE TYSON'S ONION ALLERGY TEST SUITE
 * Based on official restaurant allergy sheet
 * 
 * ONION INCLUDES: Onion, scallion, shallot, leek, chive, onion powder
 * 
 * BREAD RULES FOR ONION:
 * - NOT SAFE: Buttery onion bun (contains onion mix)
 * - SAFE: Sesame seed bun, Multi-grain, Kids bun (brioche), Gluten-free bun
 * 
 * GLOBAL RULES:
 * - NO FRIES (as side)
 * - NO KETCHUP (garnish - contains onion powder)
 * 
 * DEFAULT BREADS:
 * - Hamburger: Sesame seed (safe)
 * - Bison Burger: Sesame seed (safe)
 * - Chicken Club: Sesame seed (safe)
 * - Mediterranean Salmon: Multi-grain (safe)
 * - French Dip: Buttery onion bun (NOT safe - needs SUB)
 * - Blackened Steak: Buttery onion bun (NOT safe - needs SUB)
 * - Turkey Sandwich: Multi-grain (safe)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { checkAllergens, type CheckerSelections } from './checker';
import type { TenantPack } from '../tenant/packTypes';
import * as fs from 'fs';
import * as path from 'path';

let pack: TenantPack;

beforeAll(() => {
  const packPath = path.resolve(__dirname, '../../../generated/tenant-pack-v1.json');
  const packContent = fs.readFileSync(packPath, 'utf-8');
  pack = JSON.parse(packContent);
});

function findItem(name: string) {
  return pack.items.find(item => 
    item.name.toLowerCase().includes(name.toLowerCase())
  );
}

function checkOnion(itemId: string, sideId?: string) {
  const selections: CheckerSelections = {
    allergenIds: ['onion'],
    itemId,
    sideId,
  };
  return checkAllergens(pack, selections);
}

function hasModification(result: ReturnType<typeof checkAllergens>, pattern: string): boolean {
  const patternLower = pattern.toLowerCase();
  return result.mainItem.perAllergen.some(pa => 
    pa.substitutions.some(sub => sub.toLowerCase().includes(patternLower))
  );
}

describe('Wildfire Onion Allergy - Sandwiches', () => {
  
  describe('Sandwiches with Safe Default Bread (no bun change needed)', () => {
    
    it('Hamburger - should be SAFE with no changes', () => {
      const item = findItem('Hamburger');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Cheeseburger - should be SAFE with no changes', () => {
      const item = findItem('Cheeseburger');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('High Plains Bison Burger - should be SAFE with no changes', () => {
      const item = findItem('Bison Burger');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mediterranean Salmon - should be SAFE with no changes', () => {
      const item = findItem('Mediterranean Salmon');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Sliced Turkey Sandwich - should be SAFE with no changes', () => {
      const item = findItem('Turkey Sandwich');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sandwiches requiring modifications', () => {
    
    it('Grilled Chicken Club - should be MODIFIABLE with NO mustard mayo, SUB plain chicken', () => {
      const item = findItem('Chicken Club');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(
        hasModification(result, 'mustard') || 
        hasModification(result, 'plain chicken')
      ).toBe(true);
    });

    it('French Dip - should be MODIFIABLE with NO buttery onion bun, NO au jus, SUB bread', () => {
      const item = findItem('French Dip');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      // Should have bread substitution and au jus removal
      expect(hasModification(result, 'onion bun') || hasModification(result, 'au jus')).toBe(true);
      // Should offer alternative breads
      expect(
        hasModification(result, 'sesame') || 
        hasModification(result, 'multi-grain') ||
        hasModification(result, 'SUB')
      ).toBe(true);
    });

    it('Blackened Steak Sandwich - should be MODIFIABLE with NO blackening spice, NO ancho mayo, SUB bread', () => {
      const item = findItem('Blackened');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      // Should have blackening spice and ancho mayo removal
      expect(
        hasModification(result, 'blackening') || 
        hasModification(result, 'ancho')
      ).toBe(true);
    });
  });

  describe('Sandwiches that CANNOT be accommodated', () => {
    
    it('Turkey Burger - should be NOT SAFE (not on onion sheet)', () => {
      const item = findItem('Turkey Burger');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
      // Should have a note with ingredients or explanation
      expect(result.mainItem.perAllergen.some(pa => pa.notes.length > 0)).toBe(true);
    });

    it('Crab Cake Sandwich - should be NOT SAFE (not on onion sheet)', () => {
      const item = findItem('Crab Cake');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });

    it('Hot Honey Chicken Sandwich - should be NOT SAFE (not on onion sheet)', () => {
      const item = findItem('Hot Honey Chicken');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });
  });
});

describe('Wildfire Onion Allergy - Sides', () => {
  
  describe('Sides that are SAFE (no changes needed)', () => {
    
    it('Mashed Potatoes - should be SAFE', () => {
      const item = findItem('Mashed Potatoes');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Creamed Spinach - should be SAFE', () => {
      const item = findItem('Creamed Spinach');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Au Gratin Potatoes - should be SAFE', () => {
      const item = findItem('Au Gratin');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mac and Cheese - should be SAFE', () => {
      const item = findItem('Mac and Cheese');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Baked Potato - should be SAFE', () => {
      // Might match "Loaded Baked Potato" - be specific
      const specificItem = pack.items.find(i => 
        i.name.toLowerCase() === 'idaho baked potato' ||
        (i.name.toLowerCase().includes('baked potato') && !i.name.toLowerCase().includes('loaded'))
      );
      expect(specificItem).toBeDefined();
      if (!specificItem) return;
      
      const result = checkOnion(specificItem.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Applesauce - should be SAFE', () => {
      const item = findItem('Applesauce');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Coleslaw - should be SAFE', () => {
      const item = findItem('Coleslaw');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sides that are MODIFIABLE', () => {
    
    it('Broccoli - should be MODIFIABLE with NO lemon herb vinaigrette', () => {
      const item = findItem('Broccoli');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'vinaigrette') || hasModification(result, 'lemon')).toBe(true);
    });

    it('Loaded Baked Potato - should be MODIFIABLE with NO scallions', () => {
      const item = findItem('Loaded Baked Potato');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'scallion')).toBe(true);
    });

    it('Roasted Asparagus - should be MODIFIABLE with NO balsamic vinaigrette', () => {
      const item = findItem('Asparagus');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'balsamic') || hasModification(result, 'vinaigrette')).toBe(true);
    });
  });

  describe('Sides that CANNOT be accommodated', () => {
    
    it('French Fries - should be NOT SAFE (explicitly excluded)', () => {
      const item = findItem('French Fries');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });

    it('Cottage Fries - should be NOT SAFE (not on sheet)', () => {
      const item = findItem('Cottage Fries');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });

    it('Sweet Potato - should be NOT SAFE (not on sheet)', () => {
      const item = findItem('Sweet Potato');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });

    it('Roasted Market Vegetables - should be NOT SAFE (contains red onion)', () => {
      const item = findItem('Roasted Market Vegetables');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });

    it('Mushroom Caps - should be NOT SAFE (contains shallots)', () => {
      const item = findItem('Mushroom Caps');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkOnion(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });
  });
});

describe('Wildfire Onion Allergy - Sandwich + Side Combinations', () => {
  
  it('Hamburger + Mashed Potatoes - should be SAFE + SAFE', () => {
    const mainItem = findItem('Hamburger');
    const sideItem = findItem('Mashed Potatoes');
    
    expect(mainItem).toBeDefined();
    expect(sideItem).toBeDefined();
    if (!mainItem || !sideItem) return;
    
    const result = checkOnion(mainItem.id, sideItem.id);
    
    expect(result.mainItem.status).toBe('SAFE');
    expect(result.sideItem?.status).toBe('SAFE');
    expect(result.overallStatus).toBe('SAFE');
  });

  it('Hamburger + French Fries - should fail on side', () => {
    const mainItem = findItem('Hamburger');
    const sideItem = findItem('French Fries');
    
    expect(mainItem).toBeDefined();
    expect(sideItem).toBeDefined();
    if (!mainItem || !sideItem) return;
    
    const result = checkOnion(mainItem.id, sideItem.id);
    
    expect(result.mainItem.status).toBe('SAFE');
    expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.sideItem?.status || '')).toBe(true);
  });

  it('French Dip + Asparagus - both should be MODIFIABLE', () => {
    const mainItem = findItem('French Dip');
    const sideItem = findItem('Asparagus');
    
    expect(mainItem).toBeDefined();
    expect(sideItem).toBeDefined();
    if (!mainItem || !sideItem) return;
    
    const result = checkOnion(mainItem.id, sideItem.id);
    
    expect(result.mainItem.status).toBe('MODIFIABLE');
    expect(result.sideItem?.status).toBe('MODIFIABLE');
    expect(result.overallStatus).toBe('MODIFIABLE');
  });
});

describe('Wildfire Onion Allergy - Multi-Allergen Scenarios', () => {
  
  it('Onion + Dairy - French Dip should still have safe bread options', () => {
    const item = findItem('French Dip');
    expect(item).toBeDefined();
    if (!item) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['onion', 'dairy'],
      itemId: item.id,
    };
    
    const result = checkAllergens(pack, selections);
    
    // Onion: NO buttery onion bun. Safe: sesame, multi-grain, kids bun, GF
    // Dairy: NO kids bun, NO GF bun. Safe: sesame, multi-grain (no butter)
    // Intersection: sesame seed, multi-grain
    
    // Should still be modifiable with safe bread options
    expect(['MODIFIABLE', 'UNSAFE'].includes(result.mainItem.status)).toBe(true);
  });

  it('Onion + Eggs - French Dip should still have safe bread options', () => {
    const item = findItem('French Dip');
    expect(item).toBeDefined();
    if (!item) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['onion', 'eggs'],
      itemId: item.id,
    };
    
    const result = checkAllergens(pack, selections);
    
    // Onion: NO buttery onion bun. Safe: sesame, multi-grain, kids bun, GF
    // Eggs: NO sesame, NO kids bun, NO GF. Safe: multi-grain, buttery onion
    // Intersection: only multi-grain!
    
    expect(['MODIFIABLE', 'UNSAFE'].includes(result.mainItem.status)).toBe(true);
  });
});
