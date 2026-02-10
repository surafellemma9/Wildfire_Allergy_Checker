/**
 * WILDFIRE TYSON'S SHELLFISH ALLERGY TEST SUITE
 * Based on official restaurant allergy sheet
 * 
 * SHELLFISH INCLUDES: Crab, lobster, shrimp, crawfish, clams, mussels, oysters, scallops
 * NOTE: Fish (salmon, tuna) is NOT shellfish
 * 
 * KEY NOTES:
 * - NO FRIES (can sub any other side dish)
 * - Char-crust contains Worcestershire with shellfish
 * 
 * SANDWICHES - SAFE (no changes):
 * - Hamburger, Cheeseburger, Bison Burger, Bison Cheeseburger
 * - Mediterranean Salmon (fish, not shellfish)
 * - French Dip, Blackened Steak Sandwich, Turkey Sandwich
 * 
 * SANDWICHES - MODIFIABLE:
 * - Turkey Burger – no red onions, no char-crust
 * - Chicken Club – no mustard mayonnaise, no marinated chicken, sub plain chicken
 * 
 * SANDWICHES - CANNOT ACCOMMODATE:
 * - Crab Cake Sandwich (crab IS shellfish)
 * - Hot Honey Chicken Sandwich (not on sheet)
 * 
 * SIDES - ALL SAFE (no changes):
 * - Mashed Potatoes, Broccoli, Creamed Spinach, Roasted Vegetables, Au Gratin,
 *   Mac & Cheese, Baked Potato, Sweet Potato, Mushroom Caps, Loaded Baked Potato,
 *   Asparagus, Applesauce, Coleslaw
 * 
 * SIDES - CANNOT ACCOMMODATE:
 * - French Fries (explicitly NO FRIES), Cottage Fries (not on sheet)
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

// Helper to check shellfish allergy for a dish
function checkShellfish(itemId: string, sideId?: string) {
  const selections: CheckerSelections = {
    allergenIds: ['shellfish'],
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

describe('Shellfish Allergy - Official Allergy Sheet Verification', () => {
  
  describe('Sandwiches - Safe (No Changes Needed)', () => {
    
    it('Hamburger should be SAFE', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      const result = checkShellfish(hamburger!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Cheeseburger should be SAFE', () => {
      const cheeseburger = findItem('Cheeseburger');
      expect(cheeseburger).toBeDefined();
      
      const result = checkShellfish(cheeseburger!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Bison Burger should be SAFE', () => {
      const bisonBurger = findItem('High Plains Bison Burger');
      expect(bisonBurger).toBeDefined();
      
      const result = checkShellfish(bisonBurger!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Bison Cheeseburger should be SAFE', () => {
      const bisonCheeseburger = findItem('High Plains Bison Cheeseburger');
      expect(bisonCheeseburger).toBeDefined();
      
      const result = checkShellfish(bisonCheeseburger!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mediterranean Salmon should be SAFE (fish is not shellfish)', () => {
      const salmon = findItem('Mediterranean Salmon');
      expect(salmon).toBeDefined();
      
      const result = checkShellfish(salmon!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('French Dip should be SAFE', () => {
      const frenchDip = findItem('French Dip');
      expect(frenchDip).toBeDefined();
      
      const result = checkShellfish(frenchDip!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Blackened Steak Sandwich should be SAFE', () => {
      const steakSandwich = findItem('Blackened New York Strip');
      expect(steakSandwich).toBeDefined();
      
      const result = checkShellfish(steakSandwich!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Turkey Sandwich should be SAFE', () => {
      const turkeySandwich = findItem('Sliced Turkey Sandwich');
      expect(turkeySandwich).toBeDefined();
      
      const result = checkShellfish(turkeySandwich!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sandwiches - Modifiable', () => {
    
    it('Turkey Burger should be MODIFIABLE with NO red onions, NO char-crust', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      
      const result = checkShellfish(turkeyBurger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'red onions')).toBe(true);
      expect(hasModification(result, 'char-crust')).toBe(true);
    });

    it('Grilled Chicken Club should be MODIFIABLE with NO mustard mayo, SUB plain chicken', () => {
      const chickenClub = findItem('Grilled Chicken Club');
      expect(chickenClub).toBeDefined();
      
      const result = checkShellfish(chickenClub!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'mustard mayo')).toBe(true);
      expect(hasModification(result, 'plain chicken')).toBe(true);
    });
  });

  describe('Sandwiches - Cannot Accommodate', () => {
    
    it('Crab Cake Sandwich should be UNSAFE (crab IS shellfish)', () => {
      const crabCake = findItem('Crab Cake Sandwich');
      expect(crabCake).toBeDefined();
      
      const result = checkShellfish(crabCake!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Hot Honey Chicken Sandwich should be UNSAFE (not on sheet)', () => {
      const hotHoney = findItem('Crispy Hot Honey');
      expect(hotHoney).toBeDefined();
      
      const result = checkShellfish(hotHoney!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });
  });

  describe('Sides - All Safe (No Changes Needed)', () => {
    
    it('Mashed Potatoes should be SAFE', () => {
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkShellfish(mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Broccoli should be SAFE', () => {
      const broccoli = findItem('Broccoli');
      expect(broccoli).toBeDefined();
      
      const result = checkShellfish(broccoli!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Creamed Spinach should be SAFE', () => {
      const creamedSpinach = findItem('Creamed Spinach');
      expect(creamedSpinach).toBeDefined();
      
      const result = checkShellfish(creamedSpinach!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Roasted Market Vegetables should be SAFE', () => {
      const vegetables = findItem('Roasted Market Vegetables');
      expect(vegetables).toBeDefined();
      
      const result = checkShellfish(vegetables!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Au Gratin Potatoes should be SAFE', () => {
      const auGratin = findItem('Au Gratin');
      expect(auGratin).toBeDefined();
      
      const result = checkShellfish(auGratin!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mac and Cheese should be SAFE', () => {
      const macCheese = findItem('Mac and Cheese');
      expect(macCheese).toBeDefined();
      
      const result = checkShellfish(macCheese!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Baked Potato should be SAFE', () => {
      const bakedPotato = findItem('Idaho Baked Potato');
      expect(bakedPotato).toBeDefined();
      
      const result = checkShellfish(bakedPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Sweet Potato should be SAFE', () => {
      const sweetPotato = findItem('Sweet Potato');
      expect(sweetPotato).toBeDefined();
      
      const result = checkShellfish(sweetPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mushroom Caps should be SAFE', () => {
      const mushrooms = findItem('Mushroom Caps');
      expect(mushrooms).toBeDefined();
      
      const result = checkShellfish(mushrooms!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Loaded Baked Potato should be SAFE', () => {
      const loadedPotato = findItem('Loaded Baked Potato');
      expect(loadedPotato).toBeDefined();
      
      const result = checkShellfish(loadedPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Asparagus should be SAFE', () => {
      const asparagus = findItem('Asparagus');
      expect(asparagus).toBeDefined();
      
      const result = checkShellfish(asparagus!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Applesauce should be SAFE', () => {
      const applesauce = findItem('Applesauce');
      expect(applesauce).toBeDefined();
      
      const result = checkShellfish(applesauce!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Coleslaw should be SAFE', () => {
      const coleslaw = findItem('Coleslaw');
      expect(coleslaw).toBeDefined();
      
      const result = checkShellfish(coleslaw!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sides - Cannot Accommodate', () => {
    
    it('French Fries should be UNSAFE (NO FRIES rule)', () => {
      const fries = findItem('French Fries');
      expect(fries).toBeDefined();
      
      const result = checkShellfish(fries!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Cottage Fries should be UNSAFE (not on sheet)', () => {
      const cottageFries = findItem('Cottage Fries');
      expect(cottageFries).toBeDefined();
      
      const result = checkShellfish(cottageFries!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });
  });

  describe('Sandwich + Side Combinations', () => {
    
    it('Hamburger + Mashed Potatoes should both be SAFE', () => {
      const hamburger = findItem('Hamburger');
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(hamburger).toBeDefined();
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkShellfish(hamburger!.id, mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('SAFE');
    });

    it('Turkey Burger + Sweet Potato should show burger modifiable, side safe', () => {
      const turkeyBurger = findItem('Turkey Burger');
      const sweetPotato = findItem('Sweet Potato');
      expect(turkeyBurger).toBeDefined();
      expect(sweetPotato).toBeDefined();
      
      const result = checkShellfish(turkeyBurger!.id, sweetPotato!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('MODIFIABLE');
    });

    it('Cheeseburger + French Fries should show burger safe, fries unsafe', () => {
      const cheeseburger = findItem('Cheeseburger');
      const fries = findItem('French Fries');
      expect(cheeseburger).toBeDefined();
      expect(fries).toBeDefined();
      
      const result = checkShellfish(cheeseburger!.id, fries!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
      expect(result.sideItem?.status).toBe('UNSAFE');
      expect(result.overallStatus).toBe('UNSAFE');
    });

    it('Crab Cake + Safe Side should still be UNSAFE overall', () => {
      const crabCake = findItem('Crab Cake Sandwich');
      const auGratin = findItem('Au Gratin');
      expect(crabCake).toBeDefined();
      expect(auGratin).toBeDefined();
      
      const result = checkShellfish(crabCake!.id, auGratin!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('UNSAFE');
    });
  });

  describe('Char Crust Notes', () => {
    
    it('Turkey Burger should have char-crust modification for shellfish (Worcestershire)', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      
      const result = checkShellfish(turkeyBurger!.id);
      
      expect(hasModification(result, 'char-crust')).toBe(true);
    });
  });
});
