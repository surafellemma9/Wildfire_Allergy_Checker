/**
 * WILDFIRE TYSON'S SESAME ALLERGY TEST SUITE
 * Based on official restaurant allergy sheet
 * 
 * SESAME INCLUDES: Sesame seeds, sesame oil, tahini, za'atar (contains sesame)
 * 
 * BREAD RULES FOR SESAME:
 * - NOT SAFE: Sesame seed bun, Multi-grain bread, Buttery onion bun
 * - SAFE: Gluten free bun, Kids bun
 * 
 * SANDWICHES - ALL MODIFIABLE:
 * - Hamburger/Cheeseburger – no sesame seed bun, SUB GF or kids bun
 * - Bison Burger/Cheeseburger – no sesame seed bun, SUB GF or kids bun
 * - Turkey Burger – no sesame seed bun, SUB GF or kids bun
 * - Hot Honey Chicken – no sesame seed bun, SUB GF or kids bun
 * - Chicken Club – no sesame seed bun, SUB GF or kids bun
 * - Mediterranean Salmon – no za'atar, no multi-grain, SUB GF or kids bun
 * - Crab Cake – no sesame seed bun, SUB GF or kids bun
 * - French Dip – no buttery onion bun, SUB GF or kids bun
 * - Blackened Steak – no buttery onion bun, SUB GF or kids bun
 * - Turkey Sandwich – no multi-grain bread, SUB GF or kids bun
 * 
 * SIDES - ALL SAFE (15 items):
 * - French Fries, Mashed Potatoes, Broccoli, Creamed Spinach, Roasted Vegetables,
 *   Au Gratin, Mac & Cheese, Baked Potato, Sweet Potato, Cottage Fries,
 *   Mushroom Caps, Loaded Baked Potato, Asparagus, Applesauce, Coleslaw
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

// Helper to check sesame allergy for a dish
function checkSesame(itemId: string, sideId?: string) {
  const selections: CheckerSelections = {
    allergenIds: ['sesame'],
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

describe('Sesame Allergy - Official Allergy Sheet Verification', () => {
  
  describe('Sandwiches - All Modifiable with Bread Substitutions', () => {
    
    it('Hamburger should be MODIFIABLE with NO sesame seed bun', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      const result = checkSesame(hamburger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'sesame seed bun')).toBe(true);
      expect(hasModification(result, 'gluten free') || hasModification(result, 'kids bun')).toBe(true);
    });

    it('Cheeseburger should be MODIFIABLE with NO sesame seed bun', () => {
      const cheeseburger = findItem('Cheeseburger');
      expect(cheeseburger).toBeDefined();
      
      const result = checkSesame(cheeseburger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'sesame seed bun')).toBe(true);
    });

    it('Bison Burger should be MODIFIABLE with NO sesame seed bun', () => {
      const bisonBurger = findItem('High Plains Bison Burger');
      expect(bisonBurger).toBeDefined();
      
      const result = checkSesame(bisonBurger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'sesame seed bun')).toBe(true);
    });

    it('Bison Cheeseburger should be MODIFIABLE with NO sesame seed bun', () => {
      const bisonCheeseburger = findItem('High Plains Bison Cheeseburger');
      expect(bisonCheeseburger).toBeDefined();
      
      const result = checkSesame(bisonCheeseburger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'sesame seed bun')).toBe(true);
    });

    it('Turkey Burger should be MODIFIABLE with NO sesame seed bun', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      
      const result = checkSesame(turkeyBurger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'sesame seed bun')).toBe(true);
    });

    it('Hot Honey Chicken should be MODIFIABLE with NO sesame seed bun', () => {
      const hotHoney = findItem('Crispy Hot Honey');
      expect(hotHoney).toBeDefined();
      
      const result = checkSesame(hotHoney!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'sesame seed bun')).toBe(true);
    });

    it('Chicken Club should be MODIFIABLE with NO sesame seed bun', () => {
      const chickenClub = findItem('Grilled Chicken Club');
      expect(chickenClub).toBeDefined();
      
      const result = checkSesame(chickenClub!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'sesame seed bun')).toBe(true);
    });

    it('Mediterranean Salmon should be MODIFIABLE with NO za\'atar, NO multi-grain', () => {
      const salmon = findItem('Mediterranean Salmon');
      expect(salmon).toBeDefined();
      
      const result = checkSesame(salmon!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'zaatar') || hasModification(result, 'za\'atar')).toBe(true);
      expect(hasModification(result, 'multi-grain')).toBe(true);
    });

    it('Crab Cake Sandwich should be MODIFIABLE with NO sesame seed bun', () => {
      const crabCake = findItem('Crab Cake Sandwich');
      expect(crabCake).toBeDefined();
      
      const result = checkSesame(crabCake!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'sesame seed bun')).toBe(true);
    });

    it('French Dip should be MODIFIABLE with NO buttery onion bun', () => {
      const frenchDip = findItem('French Dip');
      expect(frenchDip).toBeDefined();
      
      const result = checkSesame(frenchDip!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'buttery onion bun')).toBe(true);
    });

    it('Blackened Steak Sandwich should be MODIFIABLE with NO buttery onion bun', () => {
      const steakSandwich = findItem('Blackened New York Strip');
      expect(steakSandwich).toBeDefined();
      
      const result = checkSesame(steakSandwich!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'buttery onion bun')).toBe(true);
    });

    it('Turkey Sandwich should be MODIFIABLE with NO multi-grain bread', () => {
      const turkeySandwich = findItem('Sliced Turkey Sandwich');
      expect(turkeySandwich).toBeDefined();
      
      const result = checkSesame(turkeySandwich!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'multi-grain')).toBe(true);
    });
  });

  describe('Sides - All Safe (No Changes Needed)', () => {
    
    it('French Fries should be SAFE', () => {
      const fries = findItem('French Fries');
      expect(fries).toBeDefined();
      
      const result = checkSesame(fries!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mashed Potatoes should be SAFE', () => {
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkSesame(mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Broccoli should be SAFE', () => {
      const broccoli = findItem('Broccoli');
      expect(broccoli).toBeDefined();
      
      const result = checkSesame(broccoli!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Creamed Spinach should be SAFE', () => {
      const creamedSpinach = findItem('Creamed Spinach');
      expect(creamedSpinach).toBeDefined();
      
      const result = checkSesame(creamedSpinach!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Roasted Market Vegetables should be SAFE', () => {
      const vegetables = findItem('Roasted Market Vegetables');
      expect(vegetables).toBeDefined();
      
      const result = checkSesame(vegetables!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Au Gratin Potatoes should be SAFE', () => {
      const auGratin = findItem('Au Gratin');
      expect(auGratin).toBeDefined();
      
      const result = checkSesame(auGratin!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mac and Cheese should be SAFE', () => {
      const macCheese = findItem('Mac and Cheese');
      expect(macCheese).toBeDefined();
      
      const result = checkSesame(macCheese!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Baked Potato should be SAFE', () => {
      const bakedPotato = findItem('Idaho Baked Potato');
      expect(bakedPotato).toBeDefined();
      
      const result = checkSesame(bakedPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Sweet Potato should be SAFE', () => {
      const sweetPotato = findItem('Sweet Potato');
      expect(sweetPotato).toBeDefined();
      
      const result = checkSesame(sweetPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Cottage Fries should be SAFE', () => {
      const cottageFries = findItem('Cottage Fries');
      expect(cottageFries).toBeDefined();
      
      const result = checkSesame(cottageFries!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mushroom Caps should be SAFE', () => {
      const mushrooms = findItem('Mushroom Caps');
      expect(mushrooms).toBeDefined();
      
      const result = checkSesame(mushrooms!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Loaded Baked Potato should be SAFE', () => {
      const loadedPotato = findItem('Loaded Baked Potato');
      expect(loadedPotato).toBeDefined();
      
      const result = checkSesame(loadedPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Asparagus should be SAFE', () => {
      const asparagus = findItem('Asparagus');
      expect(asparagus).toBeDefined();
      
      const result = checkSesame(asparagus!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Applesauce should be SAFE', () => {
      const applesauce = findItem('Applesauce');
      expect(applesauce).toBeDefined();
      
      const result = checkSesame(applesauce!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Coleslaw should be SAFE', () => {
      const coleslaw = findItem('Coleslaw');
      expect(coleslaw).toBeDefined();
      
      const result = checkSesame(coleslaw!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sandwich + Side Combinations', () => {
    
    it('Hamburger + French Fries should both be accommodated', () => {
      const hamburger = findItem('Hamburger');
      const fries = findItem('French Fries');
      expect(hamburger).toBeDefined();
      expect(fries).toBeDefined();
      
      const result = checkSesame(hamburger!.id, fries!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('MODIFIABLE');
    });

    it('Mediterranean Salmon + Mashed Potatoes should both be accommodated', () => {
      const salmon = findItem('Mediterranean Salmon');
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(salmon).toBeDefined();
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkSesame(salmon!.id, mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('MODIFIABLE');
    });

    it('Blackened Steak + Sweet Potato should both be accommodated', () => {
      const steakSandwich = findItem('Blackened New York Strip');
      const sweetPotato = findItem('Sweet Potato');
      expect(steakSandwich).toBeDefined();
      expect(sweetPotato).toBeDefined();
      
      const result = checkSesame(steakSandwich!.id, sweetPotato!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('MODIFIABLE');
    });
  });

  describe('Bread Substitution Rules', () => {
    
    it('All modifiable sandwiches should offer GF bun or kids bun as substitution', () => {
      const sandwiches = pack.items.filter(item => item.category === 'Sandwiches');
      
      sandwiches.forEach(sandwich => {
        const result = checkSesame(sandwich.id);
        
        if (result.mainItem.status === 'MODIFIABLE') {
          const hasSafeSubstitution = result.mainItem.perAllergen.some(p => 
            p.substitutions.some(s => 
              s.toLowerCase().includes('gluten free') || s.toLowerCase().includes('kids bun')
            )
          );
          expect(hasSafeSubstitution).toBe(true);
        }
      });
    });
  });
});
