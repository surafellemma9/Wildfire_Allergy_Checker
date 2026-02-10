/**
 * WILDFIRE TYSON'S SOY ALLERGY TEST SUITE
 * Based on official restaurant allergy sheet
 * 
 * SOY INCLUDES: Soy sauce, soybean oil, soy lecithin, tofu, edamame, miso
 * 
 * BREAD RULES FOR SOY:
 * - ALL breads are SAFE: Sesame seed bun, Multi-grain, Buttery onion bun, Kids bun (ciabatta)
 * 
 * KEY NOTES:
 * - MUST CLEAN GRILL for all sandwiches
 * - NO French Fries
 * - NO Coleslaw
 * - Char-crust contains hydrolyzed soy
 * - Mayonnaise contains soy
 * - Whipped butter contains soy
 * 
 * SANDWICHES - MODIFIABLE:
 * - Hamburger/Cheeseburger – CLEAN grill
 * - Bison Burger/Cheeseburger – CLEAN grill
 * - Turkey Burger – no red onions, no char-crust, no mayonnaise
 * - Chicken Club – no mustard mayonnaise, sub plain chicken
 * - Mediterranean Salmon – CLEAN grill
 * - French Dip – no horseradish cream sauce
 * - Blackened Steak Sandwich – no ancho mayo
 * - Turkey Sandwich – CLEAN grill
 * 
 * SANDWICHES - CANNOT ACCOMMODATE:
 * - Crab Cake Sandwich (tartar sauce contains soy)
 * - Hot Honey Chicken Sandwich (spicy mayo and batter contain soy)
 * 
 * SIDES - SAFE:
 * - Mashed Potatoes, Broccoli, Creamed Spinach, Roasted Vegetables, Au Gratin,
 *   Mac & Cheese, Mushroom Caps, Asparagus, Applesauce
 * 
 * SIDES - MODIFIABLE:
 * - Baked Potato (no whipped butter)
 * - Sweet Potato (no whipped butter)
 * - Loaded Baked Potato (no whipped butter)
 * 
 * SIDES - CANNOT ACCOMMODATE:
 * - French Fries (shared fryer), Coleslaw (mayonnaise), Cottage Fries (ranch)
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

// Helper to check soy allergy for a dish
function checkSoy(itemId: string, sideId?: string) {
  const selections: CheckerSelections = {
    allergenIds: ['soy'],
    itemId,
    sideId,
  };
  return checkAllergens(pack, selections);
}

// Helper to check multiple allergens
function checkMultiAllergens(itemId: string, allergenIds: string[], sideId?: string) {
  const selections: CheckerSelections = {
    allergenIds,
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

describe('Soy Allergy - Official Allergy Sheet Verification', () => {
  
  describe('Sandwiches - Modifiable (CLEAN grill)', () => {
    
    it('Hamburger should be MODIFIABLE with CLEAN grill', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      const result = checkSoy(hamburger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'clean grill')).toBe(true);
    });

    it('Cheeseburger should be MODIFIABLE with CLEAN grill', () => {
      const cheeseburger = findItem('Cheeseburger');
      expect(cheeseburger).toBeDefined();
      
      const result = checkSoy(cheeseburger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'clean grill')).toBe(true);
    });

    it('Bison Burger should be MODIFIABLE with CLEAN grill', () => {
      const bisonBurger = findItem('High Plains Bison Burger');
      expect(bisonBurger).toBeDefined();
      
      const result = checkSoy(bisonBurger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'clean grill')).toBe(true);
    });

    it('Bison Cheeseburger should be MODIFIABLE with CLEAN grill', () => {
      const bisonCheeseburger = findItem('High Plains Bison Cheeseburger');
      expect(bisonCheeseburger).toBeDefined();
      
      const result = checkSoy(bisonCheeseburger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'clean grill')).toBe(true);
    });

    it('Mediterranean Salmon should be MODIFIABLE', () => {
      const salmon = findItem('Mediterranean Salmon');
      expect(salmon).toBeDefined();
      
      const result = checkSoy(salmon!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
    });

    it('Turkey Sandwich should be MODIFIABLE', () => {
      const turkeySandwich = findItem('Sliced Turkey Sandwich');
      expect(turkeySandwich).toBeDefined();
      
      const result = checkSoy(turkeySandwich!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
    });
  });

  describe('Sandwiches - Modifiable with Specific Modifications', () => {
    
    it('Turkey Burger should be MODIFIABLE with NO red onions, NO char-crust, NO mayo', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      
      const result = checkSoy(turkeyBurger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'red onions')).toBe(true);
      expect(hasModification(result, 'char-crust')).toBe(true);
      expect(hasModification(result, 'mayonnaise')).toBe(true);
    });

    it('Grilled Chicken Club should be MODIFIABLE with NO mustard mayo, SUB plain chicken', () => {
      const chickenClub = findItem('Grilled Chicken Club');
      expect(chickenClub).toBeDefined();
      
      const result = checkSoy(chickenClub!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'mustard mayo')).toBe(true);
      expect(hasModification(result, 'plain chicken')).toBe(true);
    });

    it('French Dip should be MODIFIABLE with NO horseradish cream sauce', () => {
      const frenchDip = findItem('French Dip');
      expect(frenchDip).toBeDefined();
      
      const result = checkSoy(frenchDip!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'horseradish')).toBe(true);
    });

    it('Blackened Steak Sandwich should be MODIFIABLE with NO ancho mayo', () => {
      const steakSandwich = findItem('Blackened New York Strip');
      expect(steakSandwich).toBeDefined();
      
      const result = checkSoy(steakSandwich!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'ancho mayo')).toBe(true);
    });
  });

  describe('Sandwiches - Cannot Accommodate', () => {
    
    it('Crab Cake Sandwich should be UNSAFE (tartar sauce contains soy)', () => {
      const crabCake = findItem('Crab Cake Sandwich');
      expect(crabCake).toBeDefined();
      
      const result = checkSoy(crabCake!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Hot Honey Chicken Sandwich should be UNSAFE (spicy mayo and batter)', () => {
      const hotHoney = findItem('Crispy Hot Honey');
      expect(hotHoney).toBeDefined();
      
      const result = checkSoy(hotHoney!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });
  });

  describe('Sides - Safe (No Changes Needed)', () => {
    
    it('Mashed Potatoes should be SAFE', () => {
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkSoy(mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Steamed Broccoli should be SAFE', () => {
      const broccoli = findItem('Broccoli');
      expect(broccoli).toBeDefined();
      
      const result = checkSoy(broccoli!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Creamed Spinach should be SAFE', () => {
      const creamedSpinach = findItem('Creamed Spinach');
      expect(creamedSpinach).toBeDefined();
      
      const result = checkSoy(creamedSpinach!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Roasted Market Vegetables should be SAFE', () => {
      const vegetables = findItem('Roasted Market Vegetables');
      expect(vegetables).toBeDefined();
      
      const result = checkSoy(vegetables!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Au Gratin Potatoes should be SAFE', () => {
      const auGratin = findItem('Au Gratin');
      expect(auGratin).toBeDefined();
      
      const result = checkSoy(auGratin!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mac and Cheese should be SAFE', () => {
      const macCheese = findItem('Mac and Cheese');
      expect(macCheese).toBeDefined();
      
      const result = checkSoy(macCheese!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mushroom Caps should be SAFE', () => {
      const mushrooms = findItem('Mushroom Caps');
      expect(mushrooms).toBeDefined();
      
      const result = checkSoy(mushrooms!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Asparagus should be SAFE', () => {
      const asparagus = findItem('Asparagus');
      expect(asparagus).toBeDefined();
      
      const result = checkSoy(asparagus!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Applesauce should be SAFE', () => {
      const applesauce = findItem('Applesauce');
      expect(applesauce).toBeDefined();
      
      const result = checkSoy(applesauce!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sides - Modifiable (No Whipped Butter)', () => {
    
    it('Baked Potato should be MODIFIABLE with NO whipped butter', () => {
      const bakedPotato = findItem('Idaho Baked Potato');
      expect(bakedPotato).toBeDefined();
      
      const result = checkSoy(bakedPotato!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'whipped butter')).toBe(true);
    });

    it('Sweet Potato should be MODIFIABLE with NO whipped butter', () => {
      const sweetPotato = findItem('Sweet Potato');
      expect(sweetPotato).toBeDefined();
      
      const result = checkSoy(sweetPotato!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'whipped butter')).toBe(true);
    });

    it('Loaded Baked Potato should be MODIFIABLE with NO whipped butter', () => {
      const loadedPotato = findItem('Loaded Baked Potato');
      expect(loadedPotato).toBeDefined();
      
      const result = checkSoy(loadedPotato!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'whipped butter')).toBe(true);
    });
  });

  describe('Sides - Cannot Accommodate', () => {
    
    it('French Fries should be UNSAFE (shared fryer)', () => {
      const fries = findItem('French Fries');
      expect(fries).toBeDefined();
      
      const result = checkSoy(fries!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Coleslaw should be UNSAFE (mayonnaise contains soy)', () => {
      const coleslaw = findItem('Coleslaw');
      expect(coleslaw).toBeDefined();
      
      const result = checkSoy(coleslaw!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Cottage Fries should be UNSAFE (ranch contains mayo)', () => {
      const cottageFries = findItem('Cottage Fries');
      expect(cottageFries).toBeDefined();
      
      const result = checkSoy(cottageFries!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });
  });

  describe('Sandwich + Side Combinations', () => {
    
    it('Hamburger + Mashed Potatoes should both be accommodated', () => {
      const hamburger = findItem('Hamburger');
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(hamburger).toBeDefined();
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkSoy(hamburger!.id, mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('MODIFIABLE');
    });

    it('Turkey Burger + Baked Potato should both be modifiable', () => {
      const turkeyBurger = findItem('Turkey Burger');
      const bakedPotato = findItem('Idaho Baked Potato');
      expect(turkeyBurger).toBeDefined();
      expect(bakedPotato).toBeDefined();
      
      const result = checkSoy(turkeyBurger!.id, bakedPotato!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('MODIFIABLE');
      expect(result.overallStatus).toBe('MODIFIABLE');
    });

    it('Cheeseburger + French Fries should show burger modifiable, fries unsafe', () => {
      const cheeseburger = findItem('Cheeseburger');
      const fries = findItem('French Fries');
      expect(cheeseburger).toBeDefined();
      expect(fries).toBeDefined();
      
      const result = checkSoy(cheeseburger!.id, fries!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('UNSAFE');
      expect(result.overallStatus).toBe('UNSAFE');
    });

    it('Crab Cake + Safe Side should still be UNSAFE overall', () => {
      const crabCake = findItem('Crab Cake Sandwich');
      const auGratin = findItem('Au Gratin');
      expect(crabCake).toBeDefined();
      expect(auGratin).toBeDefined();
      
      const result = checkSoy(crabCake!.id, auGratin!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('UNSAFE');
    });
  });

  describe('Multi-Allergen Scenarios', () => {
    
    it('Soy + Gluten: Turkey Burger should have modifications for both', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      
      const result = checkMultiAllergens(turkeyBurger!.id, ['soy', 'gluten']);
      
      const soyResult = result.mainItem.perAllergen.find(p => p.allergenId === 'soy');
      const glutenResult = result.mainItem.perAllergen.find(p => p.allergenId === 'gluten');
      
      expect(soyResult?.status).toBe('MODIFIABLE');
      expect(glutenResult?.status).toBe('MODIFIABLE');
      
      // Both should mention char-crust
      const soyHasCharCrust = soyResult?.substitutions.some(s => s.toLowerCase().includes('char-crust'));
      const glutenHasCharCrust = glutenResult?.substitutions.some(s => s.toLowerCase().includes('char-crust'));
      
      expect(soyHasCharCrust || glutenHasCharCrust).toBe(true);
    });

    it('Soy + Dairy: Baked Potato needs NO whipped butter for soy', () => {
      const bakedPotato = findItem('Idaho Baked Potato');
      expect(bakedPotato).toBeDefined();
      
      const result = checkMultiAllergens(bakedPotato!.id, ['soy', 'dairy']);
      
      const soyResult = result.mainItem.perAllergen.find(p => p.allergenId === 'soy');
      
      expect(soyResult?.status).toBe('MODIFIABLE');
      expect(soyResult?.substitutions.some(s => s.toLowerCase().includes('whipped butter'))).toBe(true);
    });
  });
});
