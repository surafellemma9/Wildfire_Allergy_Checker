/**
 * WILDFIRE TYSON'S PEANUT ALLERGY TEST SUITE
 * Based on official restaurant allergy sheet
 * 
 * PEANUTS: No peanut-containing items in sandwiches or sides
 * 
 * ALL SANDWICHES - SAFE (12 items):
 * - Hamburger, Cheeseburger, Bison Burger, Bison Cheeseburger
 * - Turkey Burger, Hot Honey Chicken, Chicken Club
 * - Mediterranean Salmon, Crab Cake, French Dip
 * - Blackened Steak, Turkey Sandwich
 * 
 * ALL SIDES - SAFE (15 items):
 * - French Fries, Mashed Potatoes, Broccoli, Au Gratin, Creamed Spinach
 * - Roasted Vegetables, Mac & Cheese, Baked Potato, Sweet Potato
 * - Cottage Fries, Mushroom Caps, Loaded Baked Potato
 * - Asparagus, Applesauce, Coleslaw
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

// Helper to check peanuts allergy for a dish
function checkPeanuts(itemId: string, sideId?: string) {
  const selections: CheckerSelections = {
    allergenIds: ['peanuts'],
    itemId,
    sideId,
  };
  return checkAllergens(pack, selections);
}

describe('Peanuts Allergy - Official Allergy Sheet Verification', () => {
  
  describe('Sandwiches - All Safe', () => {
    
    it('Hamburger should be SAFE', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      const result = checkPeanuts(hamburger!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Cheeseburger should be SAFE', () => {
      const cheeseburger = findItem('Cheeseburger');
      expect(cheeseburger).toBeDefined();
      const result = checkPeanuts(cheeseburger!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Bison Burger should be SAFE', () => {
      const bisonBurger = findItem('High Plains Bison Burger');
      expect(bisonBurger).toBeDefined();
      const result = checkPeanuts(bisonBurger!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Bison Cheeseburger should be SAFE', () => {
      const bisonCheeseburger = findItem('High Plains Bison Cheeseburger');
      expect(bisonCheeseburger).toBeDefined();
      const result = checkPeanuts(bisonCheeseburger!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Turkey Burger should be SAFE', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      const result = checkPeanuts(turkeyBurger!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Hot Honey Chicken should be SAFE', () => {
      const hotHoney = findItem('Crispy Hot Honey');
      expect(hotHoney).toBeDefined();
      const result = checkPeanuts(hotHoney!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Chicken Club should be SAFE', () => {
      const chickenClub = findItem('Grilled Chicken Club');
      expect(chickenClub).toBeDefined();
      const result = checkPeanuts(chickenClub!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mediterranean Salmon should be SAFE', () => {
      const salmon = findItem('Mediterranean Salmon');
      expect(salmon).toBeDefined();
      const result = checkPeanuts(salmon!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Crab Cake Sandwich should be SAFE', () => {
      const crabCake = findItem('Crab Cake Sandwich');
      expect(crabCake).toBeDefined();
      const result = checkPeanuts(crabCake!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('French Dip should be SAFE', () => {
      const frenchDip = findItem('French Dip');
      expect(frenchDip).toBeDefined();
      const result = checkPeanuts(frenchDip!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Blackened Steak Sandwich should be SAFE', () => {
      const steakSandwich = findItem('Blackened New York Strip');
      expect(steakSandwich).toBeDefined();
      const result = checkPeanuts(steakSandwich!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Turkey Sandwich should be SAFE', () => {
      const turkeySandwich = findItem('Sliced Turkey Sandwich');
      expect(turkeySandwich).toBeDefined();
      const result = checkPeanuts(turkeySandwich!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sides - All Safe', () => {
    
    it('French Fries should be SAFE', () => {
      const fries = findItem('French Fries');
      expect(fries).toBeDefined();
      const result = checkPeanuts(fries!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mashed Potatoes should be SAFE', () => {
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(mashedPotatoes).toBeDefined();
      const result = checkPeanuts(mashedPotatoes!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Broccoli should be SAFE', () => {
      const broccoli = findItem('Broccoli');
      expect(broccoli).toBeDefined();
      const result = checkPeanuts(broccoli!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Au Gratin Potatoes should be SAFE', () => {
      const auGratin = findItem('Au Gratin');
      expect(auGratin).toBeDefined();
      const result = checkPeanuts(auGratin!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Creamed Spinach should be SAFE', () => {
      const creamedSpinach = findItem('Creamed Spinach');
      expect(creamedSpinach).toBeDefined();
      const result = checkPeanuts(creamedSpinach!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Roasted Market Vegetables should be SAFE', () => {
      const vegetables = findItem('Roasted Market Vegetables');
      expect(vegetables).toBeDefined();
      const result = checkPeanuts(vegetables!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mac and Cheese should be SAFE', () => {
      const macCheese = findItem('Mac and Cheese');
      expect(macCheese).toBeDefined();
      const result = checkPeanuts(macCheese!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Baked Potato should be SAFE', () => {
      const bakedPotato = findItem('Idaho Baked Potato');
      expect(bakedPotato).toBeDefined();
      const result = checkPeanuts(bakedPotato!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Sweet Potato should be SAFE', () => {
      const sweetPotato = findItem('Sweet Potato');
      expect(sweetPotato).toBeDefined();
      const result = checkPeanuts(sweetPotato!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Cottage Fries should be SAFE', () => {
      const cottageFries = findItem('Cottage Fries');
      expect(cottageFries).toBeDefined();
      const result = checkPeanuts(cottageFries!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mushroom Caps should be SAFE', () => {
      const mushrooms = findItem('Mushroom Caps');
      expect(mushrooms).toBeDefined();
      const result = checkPeanuts(mushrooms!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Loaded Baked Potato should be SAFE', () => {
      const loadedPotato = findItem('Loaded Baked Potato');
      expect(loadedPotato).toBeDefined();
      const result = checkPeanuts(loadedPotato!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Asparagus should be SAFE', () => {
      const asparagus = findItem('Asparagus');
      expect(asparagus).toBeDefined();
      const result = checkPeanuts(asparagus!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Applesauce should be SAFE', () => {
      const applesauce = findItem('Applesauce');
      expect(applesauce).toBeDefined();
      const result = checkPeanuts(applesauce!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Coleslaw should be SAFE', () => {
      const coleslaw = findItem('Coleslaw');
      expect(coleslaw).toBeDefined();
      const result = checkPeanuts(coleslaw!.id);
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sandwich + Side Combinations', () => {
    
    it('Hamburger + French Fries should both be SAFE', () => {
      const hamburger = findItem('Hamburger');
      const fries = findItem('French Fries');
      expect(hamburger).toBeDefined();
      expect(fries).toBeDefined();
      
      const result = checkPeanuts(hamburger!.id, fries!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('SAFE');
    });

    it('Turkey Burger + Mashed Potatoes should both be SAFE', () => {
      const turkeyBurger = findItem('Turkey Burger');
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(turkeyBurger).toBeDefined();
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkPeanuts(turkeyBurger!.id, mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('SAFE');
    });

    it('Crab Cake + Coleslaw should both be SAFE', () => {
      const crabCake = findItem('Crab Cake Sandwich');
      const coleslaw = findItem('Coleslaw');
      expect(crabCake).toBeDefined();
      expect(coleslaw).toBeDefined();
      
      const result = checkPeanuts(crabCake!.id, coleslaw!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('SAFE');
    });
  });
});
