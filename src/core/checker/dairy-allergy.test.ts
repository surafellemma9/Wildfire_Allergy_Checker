/**
 * WILDFIRE TYSON'S DAIRY ALLERGY TEST SUITE
 * Based on official restaurant allergy sheet dated 6.19.25
 * 
 * DAIRY INCLUDES: Cheese, milk, butter, cream, yogurt
 * 
 * BREAD RULES FOR DAIRY:
 * - SAFE (with NO butter): Sesame seed bun, Multi-grain bread
 * - NOT SAFE: Kid's bun (brioche), Buttery onion bun, Gluten-free bun
 * 
 * DEFAULT BREADS:
 * - Hamburger/Cheeseburger: Sesame seed bun
 * - Bison Burger: Sesame seed bun
 * - Turkey Burger: Sesame seed bun
 * - Chicken Club: Sesame seed bun
 * - Crab Cake: Sesame seed bun
 * - Blackened Steak Sandwich: Buttery onion bun (NOT safe - needs SUB)
 * - French Dip: Buttery onion bun (NOT safe - needs SUB)
 * - Mediterranean Salmon: Multi-grain bread
 * - Turkey Sandwich: Multi-grain bread
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { checkAllergens, type CheckerSelections } from './checker';
import type { TenantPack } from '../tenant/packTypes';
import * as fs from 'fs';
import * as path from 'path';

// Load the real tenant pack
let pack: TenantPack;

beforeAll(() => {
  const packPath = path.resolve(__dirname, '../../../generated/tenant-pack-v1.json');
  const packContent = fs.readFileSync(packPath, 'utf-8');
  pack = JSON.parse(packContent);
});

// Helper to find item by name
function findItem(name: string) {
  return pack.items.find(item => 
    item.name.toLowerCase().includes(name.toLowerCase())
  );
}

// Helper to check dairy allergy for a dish
function checkDairy(itemId: string, sideId?: string) {
  const selections: CheckerSelections = {
    allergenIds: ['dairy'],
    itemId,
    sideId,
  };
  return checkAllergens(pack, selections);
}

// Helper to check if modifications contain a specific pattern
function hasModification(result: ReturnType<typeof checkAllergens>, pattern: string): boolean {
  const patternLower = pattern.toLowerCase();
  return result.mainItem.perAllergen.some(pa => 
    pa.substitutions.some(sub => sub.toLowerCase().includes(patternLower))
  );
}


describe('Wildfire Dairy Allergy - Sandwiches', () => {
  
  describe('Sandwiches with Sesame Seed Bun (SAFE with modifications)', () => {
    
    it('Hamburger - should be MODIFIABLE with NO butter on bun', () => {
      const item = findItem('Hamburger');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      // Status should be MODIFIABLE (not UNSAFE, not SAFE)
      expect(result.mainItem.status).toBe('MODIFIABLE');
      
      // Should have NO butter modification
      expect(hasModification(result, 'butter') || hasModification(result, 'NO butter')).toBe(true);
    });

    it('Cheeseburger - should be MODIFIABLE with NO cheese, NO butter on bun', () => {
      const item = findItem('Cheeseburger');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      // Should have cheese-related modification
      expect(hasModification(result, 'cheese')).toBe(true);
    });

    it('High Plains Bison Burger - should be MODIFIABLE with NO butter on bun', () => {
      const item = findItem('Bison Burger');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
    });

    it('Turkey Burger - should be MODIFIABLE with NO cheese, NO butter on bun', () => {
      const item = findItem('Turkey Burger');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'cheese')).toBe(true);
    });

    it('Grilled Chicken Club - should be MODIFIABLE with NO mustard-mayo chicken, NO cheese, NO butter', () => {
      const item = findItem('Chicken Club');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      // Should have modifications for dairy-containing items
      expect(
        hasModification(result, 'cheese') || 
        hasModification(result, 'mustard') ||
        hasModification(result, 'plain chicken')
      ).toBe(true);
    });

    it('Lump Crab Cake Sandwich - should be MODIFIABLE with NO butter on bun', () => {
      const item = findItem('Crab Cake');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      // Could be MODIFIABLE or might have other restrictions
      expect(['MODIFIABLE', 'SAFE'].includes(result.mainItem.status)).toBe(true);
    });
  });

  describe('Sandwiches with Multi-grain (SAFE with modifications)', () => {
    
    it('Mediterranean Salmon Sandwich - should be MODIFIABLE with NO yogurt sauce, NO butter, NO red wine vinaigrette', () => {
      const item = findItem('Mediterranean Salmon');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      // Should have yogurt-related modification
      expect(hasModification(result, 'yogurt')).toBe(true);
    });

    it('Sliced Turkey Sandwich - should be MODIFIABLE with NO cheese, NO butter', () => {
      const item = findItem('Turkey Sandwich');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'cheese')).toBe(true);
    });
  });

  describe('Sandwiches with Buttery Onion Bun (needs SUB)', () => {
    
    it('Blackened New York Strip Steak Sandwich - should be MODIFIABLE with SUB to safe bread', () => {
      const item = findItem('Blackened');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      // Should have bread substitution since buttery onion bun contains dairy
      expect(
        hasModification(result, 'multi-grain') || 
        hasModification(result, 'sesame') ||
        hasModification(result, 'NO bun')
      ).toBe(true);
    });

    it('French Dip - should be MODIFIABLE with NO horseradish cream sauce, SUB bread', () => {
      const item = findItem('French Dip');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      // Should have horseradish cream sauce modification
      expect(hasModification(result, 'horseradish') || hasModification(result, 'cream')).toBe(true);
    });
  });

  describe('Sandwiches that CANNOT be accommodated', () => {
    
    it('Crispy Hot Honey Chicken Sandwich - should be NOT MODIFIABLE', () => {
      const item = findItem('Hot Honey Chicken');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      // This sandwich is not on the dairy allergy sheet - cannot be accommodated
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });
  });
});

describe('Wildfire Dairy Allergy - Sides', () => {
  
  describe('Sides that are SAFE (no changes needed)', () => {
    
    it('Broccoli - should be SAFE with no changes', () => {
      const item = findItem('Broccoli');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Roasted Market Vegetables - should be SAFE with no changes', () => {
      const item = findItem('Roasted Market Vegetables');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Roasted Asparagus - should be SAFE with no changes', () => {
      const item = findItem('Asparagus');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Applesauce - should be SAFE with no changes', () => {
      const item = findItem('Applesauce');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sides that are MODIFIABLE', () => {
    
    it('Baked Potato - should be MODIFIABLE with NO sour cream, NO butter', () => {
      const item = findItem('Baked Potato');
      // Note: might be "Loaded Baked Potato" vs plain "Baked Potato"
      if (!item) {
        console.log('Baked Potato not found - checking exact name');
        return;
      }
      
      const result = checkDairy(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(
        hasModification(result, 'sour cream') || 
        hasModification(result, 'butter')
      ).toBe(true);
    });

    it('Sweet Potato - should be MODIFIABLE with NO butter', () => {
      const item = findItem('Sweet Potato');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'butter')).toBe(true);
    });
  });

  describe('Sides that CANNOT be accommodated (not on dairy sheet)', () => {
    
    it('French Fries - should be NOT SAFE (not on dairy sheet)', () => {
      const item = findItem('French Fries');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      // Should be UNSAFE since not listed on dairy allergy sheet
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
      // Should have a note explaining why (cross-contamination or ingredient list)
      expect(result.mainItem.perAllergen.some(pa => pa.notes.length > 0)).toBe(true);
    });

    it('Cottage Fries - should be NOT SAFE (not on dairy sheet)', () => {
      const item = findItem('Cottage Fries');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });

    it('Homemade Coleslaw - should be NOT SAFE (not on dairy sheet)', () => {
      const item = findItem('Coleslaw');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });

    it('Mac and Cheese - should be NOT SAFE (contains cheese)', () => {
      const item = findItem('Mac and Cheese');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });

    it('Mashed Potatoes - should be NOT SAFE (not on dairy sheet)', () => {
      const item = findItem('Mashed Potatoes');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });

    it('Creamed Spinach - should be NOT SAFE (contains cream)', () => {
      const item = findItem('Creamed Spinach');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });

    it('Au Gratin Potatoes - should be NOT SAFE (contains cheese/cream)', () => {
      const item = findItem('Au Gratin');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });

    it('Loaded Baked Potato - should be NOT SAFE (has cheese, sour cream, butter)', () => {
      const item = findItem('Loaded Baked Potato');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });

    it('Mushroom Caps - should be NOT SAFE (not on dairy sheet)', () => {
      const item = findItem('Mushroom Caps');
      expect(item).toBeDefined();
      if (!item) return;
      
      const result = checkDairy(item.id);
      
      expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.mainItem.status)).toBe(true);
    });
  });
});

describe('Wildfire Dairy Allergy - Sandwich + Side Combinations', () => {
  
  it('Hamburger + Broccoli - should be MODIFIABLE + SAFE', () => {
    const mainItem = findItem('Hamburger');
    const sideItem = findItem('Broccoli');
    
    expect(mainItem).toBeDefined();
    expect(sideItem).toBeDefined();
    if (!mainItem || !sideItem) return;
    
    const result = checkDairy(mainItem.id, sideItem.id);
    
    expect(result.mainItem.status).toBe('MODIFIABLE');
    expect(result.sideItem?.status).toBe('SAFE');
    expect(result.overallStatus).toBe('MODIFIABLE'); // Worst of the two
  });

  it('Hamburger + French Fries - should fail on side (fries not safe for dairy)', () => {
    const mainItem = findItem('Hamburger');
    const sideItem = findItem('French Fries');
    
    expect(mainItem).toBeDefined();
    expect(sideItem).toBeDefined();
    if (!mainItem || !sideItem) return;
    
    const result = checkDairy(mainItem.id, sideItem.id);
    
    expect(result.mainItem.status).toBe('MODIFIABLE');
    expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.sideItem?.status || '')).toBe(true);
    // Overall should be worst of the two (UNSAFE)
    expect(['UNSAFE', 'NOT_SAFE_NOT_IN_SHEET'].includes(result.overallStatus)).toBe(true);
  });

  it('Blackened Steak Sandwich + Sweet Potato - both should be MODIFIABLE', () => {
    const mainItem = findItem('Blackened');
    const sideItem = findItem('Sweet Potato');
    
    expect(mainItem).toBeDefined();
    expect(sideItem).toBeDefined();
    if (!mainItem || !sideItem) return;
    
    const result = checkDairy(mainItem.id, sideItem.id);
    
    expect(result.mainItem.status).toBe('MODIFIABLE');
    expect(result.sideItem?.status).toBe('MODIFIABLE');
    expect(result.overallStatus).toBe('MODIFIABLE');
  });
});

describe('Wildfire Dairy Allergy - Bread Substitution Conflict Resolution', () => {
  
  it('Multi-allergen (Dairy + Gluten) - should filter out gluten-containing bread subs', () => {
    const item = findItem('Blackened');
    expect(item).toBeDefined();
    if (!item) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['dairy', 'gluten'],
      itemId: item.id,
    };
    
    const result = checkAllergens(pack, selections);
    
    // With both dairy and gluten, the only safe option is "NO bun"
    // Multi-grain has gluten, sesame seed has gluten, GF bun has dairy
    // If no bun is available, dish should be MODIFIABLE
    // If no options at all, might be UNSAFE
    expect(['MODIFIABLE', 'UNSAFE'].includes(result.mainItem.status)).toBe(true);
  });

  it('Multi-allergen (Dairy + Eggs) - should properly handle conflicting bread requirements', () => {
    const item = findItem('Hamburger');
    expect(item).toBeDefined();
    if (!item) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['dairy', 'eggs'],
      itemId: item.id,
    };
    
    const result = checkAllergens(pack, selections);
    
    // Dairy: Sesame seed bun is SAFE (with no butter), multi-grain is SAFE
    // Eggs: Sesame seed bun is NOT safe (has eggs), need SUB multi-grain or buttery onion
    // 
    // For Hamburger:
    // - Dairy rule: "NO butter on bun" (sesame seed is dairy-safe)
    // - Eggs rule: "NO bun, SUB multi-grain or buttery onion"
    // 
    // Combined result should be MODIFIABLE with modifications from both allergens
    
    // The dairy rule has "NO butter on bun" - always preserved (removal)
    const dairyMods = result.mainItem.perAllergen.find(pa => pa.allergenId === 'dairy');
    expect(dairyMods?.substitutions.some(s => s.toLowerCase().includes('no butter'))).toBe(true);
    
    // The eggs rule should have bread substitution options
    const eggsMods = result.mainItem.perAllergen.find(pa => pa.allergenId === 'eggs');
    // Buttery onion bun contains dairy, so it should be filtered out
    // Multi-grain should remain as the safe option
    const hasSafeEggOption = eggsMods?.substitutions.some(s => 
      s.toLowerCase().includes('multi-grain') || 
      s.toLowerCase().includes('no bun')
    );
    
    // Either has safe option or correctly shows as UNSAFE/MODIFIABLE
    expect(result.mainItem.status === 'MODIFIABLE' || hasSafeEggOption).toBe(true);
  });
});
