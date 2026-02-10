/**
 * WILDFIRE TYSON'S EGG ALLERGY TEST SUITE
 * Based on official restaurant allergy sheet
 * 
 * EGGS FOUND IN: Mayonnaise, some breads, batter, crab cakes
 * 
 * BREAD RULES FOR EGGS:
 * - NOT SAFE: Sesame seed bun, Kids bun (brioche), Gluten-free bun
 * - SAFE: Multi-grain bread, Buttery onion bun
 * 
 * GARNISH RULES:
 * - NO COLESLAW (contains mayo)
 * - NO FRIES
 * 
 * SANDWICHES - MODIFIABLE (with bread substitution):
 * - Hamburger/Cheeseburger – no bun, SUB multi-grain or buttery onion
 * - Bison Burger/Cheeseburger – no bun, SUB multi-grain or buttery onion
 * - Turkey Burger – no bun, no mayonnaise, SUB multi-grain or buttery onion
 * - Chicken Club – no bun, no mustard mayo, sub plain chicken, SUB multi-grain or buttery onion
 * - Mediterranean Salmon – no changes (already on multi-grain)
 * - French Dip – no changes (already on buttery onion)
 * - Blackened Steak – no bun, SUB multi-grain or buttery onion
 * - Turkey Sandwich – no changes (already on multi-grain)
 * 
 * SANDWICHES - CANNOT ACCOMMODATE:
 * - Crab Cake Sandwich (crab cake contains eggs)
 * - Hot Honey Chicken Sandwich (batter contains eggs)
 * 
 * SIDES - SAFE (11 items):
 * - Mashed Potatoes, Broccoli, Creamed Spinach, Roasted Vegetables, Au Gratin,
 *   Baked Potato, Sweet Potato, Mushroom Caps, Loaded Baked Potato, Asparagus, Applesauce
 * 
 * SIDES - CANNOT ACCOMMODATE:
 * - French Fries (NO FRIES rule), Coleslaw (NO COLESLAW rule)
 * - Cottage Fries, Mac and Cheese (not on sheet)
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

// Helper to check eggs allergy for a dish
function checkEggs(itemId: string, sideId?: string) {
  const selections: CheckerSelections = {
    allergenIds: ['eggs'],
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

describe('Eggs Allergy - Official Allergy Sheet Verification', () => {
  
  describe('Sandwiches - Modifiable with Bread Substitution', () => {
    
    it('Hamburger should be MODIFIABLE with bread substitution', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      const result = checkEggs(hamburger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'multi-grain') || hasModification(result, 'buttery onion')).toBe(true);
    });

    it('Cheeseburger should be MODIFIABLE with bread substitution', () => {
      const cheeseburger = findItem('Cheeseburger');
      expect(cheeseburger).toBeDefined();
      
      const result = checkEggs(cheeseburger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'multi-grain') || hasModification(result, 'buttery onion')).toBe(true);
    });

    it('Bison Burger should be MODIFIABLE with bread substitution', () => {
      const bisonBurger = findItem('High Plains Bison Burger');
      expect(bisonBurger).toBeDefined();
      
      const result = checkEggs(bisonBurger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'multi-grain') || hasModification(result, 'buttery onion')).toBe(true);
    });

    it('Bison Cheeseburger should be MODIFIABLE with bread substitution', () => {
      const bisonCheeseburger = findItem('High Plains Bison Cheeseburger');
      expect(bisonCheeseburger).toBeDefined();
      
      const result = checkEggs(bisonCheeseburger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'multi-grain') || hasModification(result, 'buttery onion')).toBe(true);
    });

    it('Turkey Burger should be MODIFIABLE with NO mayo and bread substitution', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      
      const result = checkEggs(turkeyBurger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'mayonnaise')).toBe(true);
      expect(hasModification(result, 'multi-grain') || hasModification(result, 'buttery onion')).toBe(true);
    });

    it('Chicken Club should be MODIFIABLE with NO mustard mayo, SUB plain chicken', () => {
      const chickenClub = findItem('Grilled Chicken Club');
      expect(chickenClub).toBeDefined();
      
      const result = checkEggs(chickenClub!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'mustard mayo')).toBe(true);
      expect(hasModification(result, 'plain chicken')).toBe(true);
    });

    it('Blackened Steak Sandwich should be MODIFIABLE with bread substitution', () => {
      const steakSandwich = findItem('Blackened New York Strip');
      expect(steakSandwich).toBeDefined();
      
      const result = checkEggs(steakSandwich!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'multi-grain') || hasModification(result, 'buttery onion') || hasModification(result, 'NO bun')).toBe(true);
    });
  });

  describe('Sandwiches - Already Safe (on safe bread)', () => {
    
    it('Mediterranean Salmon should be MODIFIABLE (already on multi-grain)', () => {
      const salmon = findItem('Mediterranean Salmon');
      expect(salmon).toBeDefined();
      
      const result = checkEggs(salmon!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
    });

    it('French Dip should be MODIFIABLE (already on buttery onion)', () => {
      const frenchDip = findItem('French Dip');
      expect(frenchDip).toBeDefined();
      
      const result = checkEggs(frenchDip!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
    });

    it('Turkey Sandwich should be MODIFIABLE (already on multi-grain)', () => {
      const turkeySandwich = findItem('Sliced Turkey Sandwich');
      expect(turkeySandwich).toBeDefined();
      
      const result = checkEggs(turkeySandwich!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
    });
  });

  describe('Sandwiches - Cannot Accommodate', () => {
    
    it('Crab Cake Sandwich should be UNSAFE (crab cake contains eggs)', () => {
      const crabCake = findItem('Crab Cake Sandwich');
      expect(crabCake).toBeDefined();
      
      const result = checkEggs(crabCake!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Hot Honey Chicken Sandwich should be UNSAFE (batter contains eggs)', () => {
      const hotHoney = findItem('Crispy Hot Honey');
      expect(hotHoney).toBeDefined();
      
      const result = checkEggs(hotHoney!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });
  });

  describe('Sides - Safe (No Changes Needed)', () => {
    
    it('Mashed Potatoes should be SAFE', () => {
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkEggs(mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Broccoli should be SAFE', () => {
      const broccoli = findItem('Broccoli');
      expect(broccoli).toBeDefined();
      
      const result = checkEggs(broccoli!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Creamed Spinach should be SAFE', () => {
      const creamedSpinach = findItem('Creamed Spinach');
      expect(creamedSpinach).toBeDefined();
      
      const result = checkEggs(creamedSpinach!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Roasted Market Vegetables should be SAFE', () => {
      const vegetables = findItem('Roasted Market Vegetables');
      expect(vegetables).toBeDefined();
      
      const result = checkEggs(vegetables!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Au Gratin Potatoes should be SAFE', () => {
      const auGratin = findItem('Au Gratin');
      expect(auGratin).toBeDefined();
      
      const result = checkEggs(auGratin!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Baked Potato should be SAFE', () => {
      const bakedPotato = findItem('Idaho Baked Potato');
      expect(bakedPotato).toBeDefined();
      
      const result = checkEggs(bakedPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Sweet Potato should be SAFE', () => {
      const sweetPotato = findItem('Sweet Potato');
      expect(sweetPotato).toBeDefined();
      
      const result = checkEggs(sweetPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mushroom Caps should be SAFE', () => {
      const mushrooms = findItem('Mushroom Caps');
      expect(mushrooms).toBeDefined();
      
      const result = checkEggs(mushrooms!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Loaded Baked Potato should be SAFE', () => {
      const loadedPotato = findItem('Loaded Baked Potato');
      expect(loadedPotato).toBeDefined();
      
      const result = checkEggs(loadedPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Asparagus should be SAFE', () => {
      const asparagus = findItem('Asparagus');
      expect(asparagus).toBeDefined();
      
      const result = checkEggs(asparagus!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Applesauce should be SAFE', () => {
      const applesauce = findItem('Applesauce');
      expect(applesauce).toBeDefined();
      
      const result = checkEggs(applesauce!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sides - Cannot Accommodate', () => {
    
    it('French Fries should be UNSAFE (NO FRIES rule)', () => {
      const fries = findItem('French Fries');
      expect(fries).toBeDefined();
      
      const result = checkEggs(fries!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Coleslaw should be UNSAFE (NO COLESLAW - mayo)', () => {
      const coleslaw = findItem('Coleslaw');
      expect(coleslaw).toBeDefined();
      
      const result = checkEggs(coleslaw!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Cottage Fries should be UNSAFE (not on sheet)', () => {
      const cottageFries = findItem('Cottage Fries');
      expect(cottageFries).toBeDefined();
      
      const result = checkEggs(cottageFries!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Mac and Cheese should be UNSAFE (not on sheet)', () => {
      const macCheese = findItem('Mac and Cheese');
      expect(macCheese).toBeDefined();
      
      const result = checkEggs(macCheese!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });
  });

  describe('Sandwich + Side Combinations', () => {
    
    it('Hamburger + Mashed Potatoes should both be accommodated', () => {
      const hamburger = findItem('Hamburger');
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(hamburger).toBeDefined();
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkEggs(hamburger!.id, mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('MODIFIABLE');
    });

    it('Turkey Burger + French Fries should show burger modifiable, fries unsafe', () => {
      const turkeyBurger = findItem('Turkey Burger');
      const fries = findItem('French Fries');
      expect(turkeyBurger).toBeDefined();
      expect(fries).toBeDefined();
      
      const result = checkEggs(turkeyBurger!.id, fries!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('UNSAFE');
      expect(result.overallStatus).toBe('UNSAFE');
    });

    it('Mediterranean Salmon + Sweet Potato should both be accommodated', () => {
      const salmon = findItem('Mediterranean Salmon');
      const sweetPotato = findItem('Sweet Potato');
      expect(salmon).toBeDefined();
      expect(sweetPotato).toBeDefined();
      
      const result = checkEggs(salmon!.id, sweetPotato!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('MODIFIABLE');
    });

    it('Crab Cake + Safe Side should still be UNSAFE overall', () => {
      const crabCake = findItem('Crab Cake Sandwich');
      const auGratin = findItem('Au Gratin');
      expect(crabCake).toBeDefined();
      expect(auGratin).toBeDefined();
      
      const result = checkEggs(crabCake!.id, auGratin!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('UNSAFE');
    });
  });

  describe('Bread Rules Verification', () => {
    
    it('Sandwiches with default sesame bun should offer multi-grain or buttery onion', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      const result = checkEggs(hamburger!.id);
      
      const hasSafeSubstitution = result.mainItem.perAllergen.some(p => 
        p.substitutions.some(s => 
          s.toLowerCase().includes('multi-grain') || s.toLowerCase().includes('buttery onion')
        )
      );
      expect(hasSafeSubstitution).toBe(true);
    });
  });
});
