/**
 * WILDFIRE TYSON'S GARLIC ALLERGY TEST SUITE
 * Based on official restaurant allergy sheet
 * 
 * GARLIC INCLUDES: Fresh garlic, garlic powder, garlic salt
 * 
 * SANDWICHES - SAFE (no changes):
 * - Hamburger, Cheeseburger, Bison Burger, Bison Cheeseburger, Turkey Sandwich
 * 
 * SANDWICHES - MODIFIABLE:
 * - Chicken Club – no mustard mayonnaise, no marinated chicken, sub plain chicken
 * - Mediterranean Salmon – no yogurt drizzle, no red wine vinaigrette on arugula
 * - Blackened Steak Sandwich – no blackening spice, no ancho mayo
 * 
 * SANDWICHES - CANNOT ACCOMMODATE:
 * - Turkey Burger (char-crust contains garlic)
 * - Crab Cake Sandwich (not on sheet)
 * - Hot Honey Chicken Sandwich (not on sheet)
 * - French Dip (not on sheet)
 * 
 * SIDES - SAFE:
 * - Mashed Potatoes, Au Gratin, Creamed Spinach, Roasted Vegetables, Mac & Cheese, 
 *   Baked Potato, Coleslaw
 * 
 * SIDES - MODIFIABLE:
 * - Broccoli (no lemon herb vinaigrette)
 * - Loaded Baked Potato (no scallions)
 * - Asparagus (no balsamic vinaigrette)
 * 
 * SIDES - CANNOT ACCOMMODATE:
 * - French Fries (not on sheet), Cottage Fries, Sweet Potato, Mushroom Caps, Applesauce
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

// Helper to check garlic allergy for a dish
function checkGarlic(itemId: string, sideId?: string) {
  const selections: CheckerSelections = {
    allergenIds: ['garlic'],
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

describe('Garlic Allergy - Official Allergy Sheet Verification', () => {
  
  describe('Sandwiches - Safe (No Changes Needed)', () => {
    
    it('Hamburger should be SAFE', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      const result = checkGarlic(hamburger!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Cheeseburger should be SAFE', () => {
      const cheeseburger = findItem('Cheeseburger');
      expect(cheeseburger).toBeDefined();
      
      const result = checkGarlic(cheeseburger!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Bison Burger should be SAFE', () => {
      const bisonBurger = findItem('High Plains Bison Burger');
      expect(bisonBurger).toBeDefined();
      
      const result = checkGarlic(bisonBurger!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Bison Cheeseburger should be SAFE', () => {
      const bisonCheeseburger = findItem('High Plains Bison Cheeseburger');
      expect(bisonCheeseburger).toBeDefined();
      
      const result = checkGarlic(bisonCheeseburger!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Turkey Sandwich should be SAFE', () => {
      const turkeySandwich = findItem('Sliced Turkey Sandwich');
      expect(turkeySandwich).toBeDefined();
      
      const result = checkGarlic(turkeySandwich!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sandwiches - Modifiable with Specific Modifications', () => {
    
    it('Grilled Chicken Club should be MODIFIABLE with NO mustard mayo, SUB plain chicken', () => {
      const chickenClub = findItem('Grilled Chicken Club');
      expect(chickenClub).toBeDefined();
      
      const result = checkGarlic(chickenClub!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'mustard mayo')).toBe(true);
      expect(hasModification(result, 'plain chicken')).toBe(true);
    });

    it('Mediterranean Salmon should be MODIFIABLE with NO yogurt drizzle, NO vinaigrette', () => {
      const salmon = findItem('Mediterranean Salmon');
      expect(salmon).toBeDefined();
      
      const result = checkGarlic(salmon!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'yogurt drizzle')).toBe(true);
      expect(hasModification(result, 'vinaigrette')).toBe(true);
    });

    it('Blackened Steak Sandwich should be MODIFIABLE with NO blackening spice, NO ancho mayo', () => {
      const steakSandwich = findItem('Blackened New York Strip');
      expect(steakSandwich).toBeDefined();
      
      const result = checkGarlic(steakSandwich!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'blackening spice')).toBe(true);
      expect(hasModification(result, 'ancho mayo')).toBe(true);
    });
  });

  describe('Sandwiches - Cannot Accommodate', () => {
    
    it('Turkey Burger should be UNSAFE (char-crust contains garlic)', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      
      const result = checkGarlic(turkeyBurger!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Crab Cake Sandwich should be UNSAFE (not on sheet)', () => {
      const crabCake = findItem('Crab Cake Sandwich');
      expect(crabCake).toBeDefined();
      
      const result = checkGarlic(crabCake!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Hot Honey Chicken Sandwich should be UNSAFE (not on sheet)', () => {
      const hotHoney = findItem('Crispy Hot Honey');
      expect(hotHoney).toBeDefined();
      
      const result = checkGarlic(hotHoney!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('French Dip should be UNSAFE (not on sheet)', () => {
      const frenchDip = findItem('French Dip');
      expect(frenchDip).toBeDefined();
      
      const result = checkGarlic(frenchDip!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });
  });

  describe('Sides - Safe (No Changes Needed)', () => {
    
    it('Mashed Potatoes should be SAFE', () => {
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkGarlic(mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Au Gratin Potatoes should be SAFE', () => {
      const auGratin = findItem('Au Gratin');
      expect(auGratin).toBeDefined();
      
      const result = checkGarlic(auGratin!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Creamed Spinach should be SAFE', () => {
      const creamedSpinach = findItem('Creamed Spinach');
      expect(creamedSpinach).toBeDefined();
      
      const result = checkGarlic(creamedSpinach!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Roasted Market Vegetables should be SAFE', () => {
      const vegetables = findItem('Roasted Market Vegetables');
      expect(vegetables).toBeDefined();
      
      const result = checkGarlic(vegetables!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mac and Cheese should be SAFE', () => {
      const macCheese = findItem('Mac and Cheese');
      expect(macCheese).toBeDefined();
      
      const result = checkGarlic(macCheese!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Baked Potato should be SAFE', () => {
      const bakedPotato = findItem('Idaho Baked Potato');
      expect(bakedPotato).toBeDefined();
      
      const result = checkGarlic(bakedPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Coleslaw should be SAFE', () => {
      const coleslaw = findItem('Coleslaw');
      expect(coleslaw).toBeDefined();
      
      const result = checkGarlic(coleslaw!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sides - Modifiable', () => {
    
    it('Broccoli should be MODIFIABLE with NO lemon herb vinaigrette', () => {
      const broccoli = findItem('Broccoli');
      expect(broccoli).toBeDefined();
      
      const result = checkGarlic(broccoli!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'lemon') || hasModification(result, 'vinaigrette')).toBe(true);
    });

    it('Loaded Baked Potato should be MODIFIABLE with NO scallions', () => {
      const loadedPotato = findItem('Loaded Baked Potato');
      expect(loadedPotato).toBeDefined();
      
      const result = checkGarlic(loadedPotato!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'scallions')).toBe(true);
    });

    it('Asparagus should be MODIFIABLE with NO balsamic vinaigrette', () => {
      const asparagus = findItem('Asparagus');
      expect(asparagus).toBeDefined();
      
      const result = checkGarlic(asparagus!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'balsamic') || hasModification(result, 'vinaigrette')).toBe(true);
    });
  });

  describe('Sides - Cannot Accommodate', () => {
    
    it('French Fries should be UNSAFE (not on sheet)', () => {
      const fries = findItem('French Fries');
      expect(fries).toBeDefined();
      
      const result = checkGarlic(fries!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Cottage Fries should be UNSAFE (ranch contains garlic)', () => {
      const cottageFries = findItem('Cottage Fries');
      expect(cottageFries).toBeDefined();
      
      const result = checkGarlic(cottageFries!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Sweet Potato should be UNSAFE (BBQ spice contains garlic)', () => {
      const sweetPotato = findItem('Sweet Potato');
      expect(sweetPotato).toBeDefined();
      
      const result = checkGarlic(sweetPotato!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Mushroom Caps should be UNSAFE (contains garlic)', () => {
      const mushrooms = findItem('Mushroom Caps');
      expect(mushrooms).toBeDefined();
      
      const result = checkGarlic(mushrooms!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Applesauce should be UNSAFE (not on sheet)', () => {
      const applesauce = findItem('Applesauce');
      expect(applesauce).toBeDefined();
      
      const result = checkGarlic(applesauce!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });
  });

  describe('Sandwich + Side Combinations', () => {
    
    it('Hamburger + Mashed Potatoes should both be SAFE', () => {
      const hamburger = findItem('Hamburger');
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(hamburger).toBeDefined();
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkGarlic(hamburger!.id, mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('SAFE');
    });

    it('Chicken Club + Broccoli should both be MODIFIABLE', () => {
      const chickenClub = findItem('Grilled Chicken Club');
      const broccoli = findItem('Broccoli');
      expect(chickenClub).toBeDefined();
      expect(broccoli).toBeDefined();
      
      const result = checkGarlic(chickenClub!.id, broccoli!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('MODIFIABLE');
      expect(result.overallStatus).toBe('MODIFIABLE');
    });

    it('Hamburger + French Fries should show burger safe, fries unsafe', () => {
      const hamburger = findItem('Hamburger');
      const fries = findItem('French Fries');
      expect(hamburger).toBeDefined();
      expect(fries).toBeDefined();
      
      const result = checkGarlic(hamburger!.id, fries!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
      expect(result.sideItem?.status).toBe('UNSAFE');
      expect(result.overallStatus).toBe('UNSAFE');
    });

    it('Turkey Burger + Safe Side should still be UNSAFE overall', () => {
      const turkeyBurger = findItem('Turkey Burger');
      const auGratin = findItem('Au Gratin');
      expect(turkeyBurger).toBeDefined();
      expect(auGratin).toBeDefined();
      
      const result = checkGarlic(turkeyBurger!.id, auGratin!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('UNSAFE');
    });
  });
});
