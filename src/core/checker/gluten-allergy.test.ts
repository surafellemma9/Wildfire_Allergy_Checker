/**
 * WILDFIRE TYSON'S GLUTEN ALLERGY TEST SUITE
 * Based on official restaurant allergy sheet
 * 
 * GLUTEN INCLUDES: Wheat, barley, rye, oats (unless certified GF)
 * 
 * BREAD RULES FOR GLUTEN:
 * - ONLY SAFE: Gluten-Free Bun
 * - NOT SAFE: Sesame seed bun, Multi-grain bread, Buttery onion bun, Kid's bun (brioche)
 * 
 * CHAR CRUST INGREDIENTS (NOT SAFE):
 * garlic, peppercorns, sugar, spices, onion, caramel color, Worcestershire powder,
 * paprika, hydrolyzed soy, corn protein, wheat flour
 * ALLERGY ALERT: gluten, shellfish, soy
 * 
 * SANDWICHES - MODIFIABLE (GF bun or no bun):
 * - Hamburger/Cheeseburger - NO bun, SUB GF bun
 * - Bison Burger/Cheeseburger - NO bun, SUB GF bun
 * - Turkey Burger - NO bun, NO char-crust, SUB GF bun
 * - Grilled Chicken Club - NO bun, SUB GF bun
 * - Prime Rib French Dip - NO bun, SUB GF bun
 * - Blackened Steak Sandwich - NO bun, SUB GF bun
 * - Mediterranean Salmon - NO bread, SUB GF bun
 * - Turkey Sandwich - NO wheat bread, SUB GF bun
 * 
 * SANDWICHES - CANNOT ACCOMMODATE:
 * - Crab Cake Sandwich - Contains breadcrumbs
 * - Hot Honey Chicken Sandwich - Fried batter
 * 
 * SIDES - SAFE:
 * - Mashed Potatoes, Broccoli, Roasted Vegetables, Au Gratin, Baked Potato, Sweet Potato, Mushroom Caps, Loaded Baked Potato
 * 
 * SIDES - CANNOT ACCOMMODATE:
 * - French Fries (shared fryer), Cottage Fries, Creamed Spinach, Mac and Cheese,
 *   Applesauce, Coleslaw, Asparagus (not on sheet)
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

// Helper to check gluten allergy for a dish
function checkGluten(itemId: string, sideId?: string) {
  const selections: CheckerSelections = {
    allergenIds: ['gluten'],
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

// Helper to check if notes contain a specific pattern
function hasNote(result: ReturnType<typeof checkAllergens>, pattern: string): boolean {
  const patternLower = pattern.toLowerCase();
  return result.mainItem.perAllergen.some(pa => 
    pa.notes.some(note => note.toLowerCase().includes(patternLower))
  );
}

describe('Gluten Allergy - Official Allergy Sheet Verification', () => {
  
  describe('Sandwiches - Safe with Modifications', () => {
    
    it('Hamburger should be MODIFIABLE with GF bun option', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      const result = checkGluten(hamburger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'gluten free bun') || hasModification(result, 'NO bun')).toBe(true);
    });

    it('Cheeseburger should be MODIFIABLE with GF bun option', () => {
      const cheeseburger = findItem('Cheeseburger');
      expect(cheeseburger).toBeDefined();
      
      const result = checkGluten(cheeseburger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'gluten free bun') || hasModification(result, 'NO bun')).toBe(true);
    });

    it('Bison Burger should be MODIFIABLE with GF bun option', () => {
      const bisonBurger = findItem('High Plains Bison Burger');
      expect(bisonBurger).toBeDefined();
      
      const result = checkGluten(bisonBurger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'gluten free bun') || hasModification(result, 'NO bun')).toBe(true);
    });

    it('Bison Cheeseburger should be MODIFIABLE with GF bun option', () => {
      const bisonCheeseburger = findItem('High Plains Bison Cheeseburger');
      expect(bisonCheeseburger).toBeDefined();
      
      const result = checkGluten(bisonCheeseburger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'gluten free bun') || hasModification(result, 'NO bun')).toBe(true);
    });

    it('Turkey Burger should be MODIFIABLE with NO char-crust and GF bun', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      
      const result = checkGluten(turkeyBurger!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'char-crust')).toBe(true);
      expect(hasModification(result, 'gluten free bun') || hasModification(result, 'NO bun')).toBe(true);
    });

    it('Grilled Chicken Club should be MODIFIABLE with GF bun option', () => {
      const chickenClub = findItem('Grilled Chicken Club');
      expect(chickenClub).toBeDefined();
      
      const result = checkGluten(chickenClub!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'gluten free bun') || hasModification(result, 'NO bun')).toBe(true);
    });

    it('Prime Rib French Dip should be MODIFIABLE with GF bun option', () => {
      const frenchDip = findItem('French Dip');
      expect(frenchDip).toBeDefined();
      
      const result = checkGluten(frenchDip!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'gluten free bun') || hasModification(result, 'NO bun')).toBe(true);
    });

    it('Blackened Steak Sandwich should be MODIFIABLE with GF bun option', () => {
      const steakSandwich = findItem('Blackened New York Strip');
      expect(steakSandwich).toBeDefined();
      
      const result = checkGluten(steakSandwich!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'gluten free bun') || hasModification(result, 'NO bun')).toBe(true);
    });

    it('Mediterranean Salmon Sandwich should be MODIFIABLE with GF bun option', () => {
      const salmon = findItem('Mediterranean Salmon');
      expect(salmon).toBeDefined();
      
      const result = checkGluten(salmon!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'gluten free bun') || hasModification(result, 'NO bread')).toBe(true);
    });

    it('Sliced Turkey Sandwich should be MODIFIABLE with GF bun option', () => {
      const turkeySandwich = findItem('Sliced Turkey Sandwich');
      expect(turkeySandwich).toBeDefined();
      
      const result = checkGluten(turkeySandwich!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(hasModification(result, 'gluten free bun') || hasModification(result, 'wheat bread')).toBe(true);
    });
  });

  describe('Sandwiches - Cannot Accommodate', () => {
    
    it('Crab Cake Sandwich should be UNSAFE (contains breadcrumbs)', () => {
      const crabCake = findItem('Crab Cake Sandwich');
      expect(crabCake).toBeDefined();
      
      const result = checkGluten(crabCake!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Hot Honey Chicken Sandwich should be UNSAFE (fried batter)', () => {
      const hotHoney = findItem('Crispy Hot Honey');
      expect(hotHoney).toBeDefined();
      
      const result = checkGluten(hotHoney!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });
  });

  describe('Sides - Safe (No Changes Needed)', () => {
    
    it('Mashed Potatoes should be SAFE', () => {
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkGluten(mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Steamed Broccoli should be SAFE', () => {
      const broccoli = findItem('Broccoli');
      expect(broccoli).toBeDefined();
      
      const result = checkGluten(broccoli!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Roasted Market Vegetables should be SAFE', () => {
      const vegetables = findItem('Roasted Market Vegetables');
      expect(vegetables).toBeDefined();
      
      const result = checkGluten(vegetables!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Au Gratin Potatoes should be SAFE', () => {
      const auGratin = findItem('Au Gratin');
      expect(auGratin).toBeDefined();
      
      const result = checkGluten(auGratin!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Baked Potato should be SAFE', () => {
      const bakedPotato = findItem('Idaho Baked Potato');
      expect(bakedPotato).toBeDefined();
      
      const result = checkGluten(bakedPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Sweet Potato should be SAFE', () => {
      const sweetPotato = findItem('Sweet Potato');
      expect(sweetPotato).toBeDefined();
      
      const result = checkGluten(sweetPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Mushroom Caps should be SAFE', () => {
      const mushrooms = findItem('Mushroom Caps');
      expect(mushrooms).toBeDefined();
      
      const result = checkGluten(mushrooms!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });

    it('Loaded Baked Potato should be SAFE', () => {
      const loadedPotato = findItem('Loaded Baked Potato');
      expect(loadedPotato).toBeDefined();
      
      const result = checkGluten(loadedPotato!.id);
      
      expect(result.mainItem.status).toBe('SAFE');
    });
  });

  describe('Sides - Cannot Accommodate', () => {
    
    it('French Fries should be UNSAFE (shared fryer cross-contamination)', () => {
      const fries = findItem('French Fries');
      expect(fries).toBeDefined();
      
      const result = checkGluten(fries!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Cottage Fries should be UNSAFE', () => {
      const cottageFries = findItem('Cottage Fries');
      expect(cottageFries).toBeDefined();
      
      const result = checkGluten(cottageFries!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Creamed Spinach should be UNSAFE (contains flour)', () => {
      const creamedSpinach = findItem('Creamed Spinach');
      expect(creamedSpinach).toBeDefined();
      
      const result = checkGluten(creamedSpinach!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Mac and Cheese should be UNSAFE (elbow macaroni)', () => {
      const macCheese = findItem('Mac and Cheese');
      expect(macCheese).toBeDefined();
      
      const result = checkGluten(macCheese!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Applesauce should be UNSAFE (not listed on sheet)', () => {
      const applesauce = findItem('Applesauce');
      expect(applesauce).toBeDefined();
      
      const result = checkGluten(applesauce!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Coleslaw should be UNSAFE (not listed on sheet)', () => {
      const coleslaw = findItem('Coleslaw');
      expect(coleslaw).toBeDefined();
      
      const result = checkGluten(coleslaw!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });

    it('Asparagus should be UNSAFE (not listed on sheet)', () => {
      const asparagus = findItem('Asparagus');
      expect(asparagus).toBeDefined();
      
      const result = checkGluten(asparagus!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
    });
  });

  describe('Sandwich + Side Combinations', () => {
    
    it('Cheeseburger + Mashed Potatoes should both be accommodated', () => {
      const cheeseburger = findItem('Cheeseburger');
      const mashedPotatoes = findItem('Mashed Potatoes');
      expect(cheeseburger).toBeDefined();
      expect(mashedPotatoes).toBeDefined();
      
      const result = checkGluten(cheeseburger!.id, mashedPotatoes!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('SAFE');
      // Overall should be MODIFIABLE (worst of the two)
      expect(result.overallStatus).toBe('MODIFIABLE');
    });

    it('Turkey Burger + French Fries should show burger modifiable, fries unsafe', () => {
      const turkeyBurger = findItem('Turkey Burger');
      const fries = findItem('French Fries');
      expect(turkeyBurger).toBeDefined();
      expect(fries).toBeDefined();
      
      const result = checkGluten(turkeyBurger!.id, fries!.id);
      
      expect(result.mainItem.status).toBe('MODIFIABLE');
      expect(result.sideItem?.status).toBe('UNSAFE');
      expect(result.overallStatus).toBe('UNSAFE');
    });

    it('Crab Cake Sandwich + Safe Side should still be UNSAFE overall', () => {
      const crabCake = findItem('Crab Cake Sandwich');
      const auGratin = findItem('Au Gratin');
      expect(crabCake).toBeDefined();
      expect(auGratin).toBeDefined();
      
      const result = checkGluten(crabCake!.id, auGratin!.id);
      
      expect(result.mainItem.status).toBe('UNSAFE');
      expect(result.sideItem?.status).toBe('SAFE');
      expect(result.overallStatus).toBe('UNSAFE');
    });
  });

  describe('Multi-Allergen Scenarios', () => {
    
    it('Gluten + Dairy: Cheeseburger should still be modifiable (GF bun + no cheese)', () => {
      const cheeseburger = findItem('Cheeseburger');
      expect(cheeseburger).toBeDefined();
      
      const result = checkMultiAllergens(cheeseburger!.id, ['gluten', 'dairy']);
      
      // Should have modifications for both allergens
      const glutenResult = result.mainItem.perAllergen.find(p => p.allergenId === 'gluten');
      const dairyResult = result.mainItem.perAllergen.find(p => p.allergenId === 'dairy');
      
      expect(glutenResult?.status).toBe('MODIFIABLE');
      expect(dairyResult?.status).toBe('MODIFIABLE');
    });

    it('Gluten + Eggs: Turkey Burger should be modifiable (GF bun has eggs but NO bun option)', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      
      const result = checkMultiAllergens(turkeyBurger!.id, ['gluten', 'eggs']);
      
      // GF bun contains eggs, but NO bun is always available
      const glutenResult = result.mainItem.perAllergen.find(p => p.allergenId === 'gluten');
      
      // Gluten should be modifiable with SUB GF bun or NO bun
      expect(glutenResult?.status).toBe('MODIFIABLE');
    });

    it('Gluten + Shellfish: Turkey Burger needs NO char-crust for both', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      
      const result = checkMultiAllergens(turkeyBurger!.id, ['gluten', 'shellfish']);
      
      // Both should require NO char-crust
      const glutenResult = result.mainItem.perAllergen.find(p => p.allergenId === 'gluten');
      const shellfishResult = result.mainItem.perAllergen.find(p => p.allergenId === 'shellfish');
      
      expect(glutenResult?.status).toBe('MODIFIABLE');
      expect(shellfishResult?.status).toBe('MODIFIABLE');
      
      // Both should mention char-crust in substitutions
      const glutenHasCharCrust = glutenResult?.substitutions.some(s => s.toLowerCase().includes('char-crust'));
      const shellfishHasCharCrust = shellfishResult?.substitutions.some(s => s.toLowerCase().includes('char-crust'));
      
      expect(glutenHasCharCrust || shellfishHasCharCrust).toBe(true);
    });

    it('Gluten + Soy: Turkey Burger needs NO char-crust for both', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      
      const result = checkMultiAllergens(turkeyBurger!.id, ['gluten', 'soy']);
      
      // Both should require NO char-crust
      const glutenResult = result.mainItem.perAllergen.find(p => p.allergenId === 'gluten');
      const soyResult = result.mainItem.perAllergen.find(p => p.allergenId === 'soy');
      
      expect(glutenResult?.status).toBe('MODIFIABLE');
      expect(soyResult?.status).toBe('MODIFIABLE');
    });
  });

  describe('Char Crust Allergen Notes', () => {
    
    it('Turkey Burger gluten rule should have NO char-crust modification', () => {
      const turkeyBurger = findItem('Turkey Burger');
      expect(turkeyBurger).toBeDefined();
      
      const result = checkGluten(turkeyBurger!.id);
      
      // Check that char-crust is mentioned in modifications
      expect(hasModification(result, 'char-crust')).toBe(true);
    });
  });

  describe('Bread Rules Verification', () => {
    
    it('Modifiable sandwiches should offer GF bun or NO bun (not other breads)', () => {
      const sandwiches = pack.items.filter(item => item.category === 'Sandwiches');
      
      const modifiableSandwiches = sandwiches.filter(sandwich => {
        const result = checkGluten(sandwich.id);
        return result.mainItem.status === 'MODIFIABLE';
      });
      
      modifiableSandwiches.forEach(sandwich => {
        const result = checkGluten(sandwich.id);
        
        const hasGFOption = result.mainItem.perAllergen.some(p => 
          p.substitutions.some(s => 
            s.toLowerCase().includes('gluten free') || 
            s.toLowerCase().includes('no bun') || 
            s.toLowerCase().includes('no bread')
          )
        );
        expect(hasGFOption).toBe(true);
        
        // Should NOT suggest regular breads as substitutions (only removals)
        const suggestsRegularBread = result.mainItem.perAllergen.some(p =>
          p.substitutions.some(s => {
            const lower = s.toLowerCase();
            // Only flag if it's suggesting a regular bread (not removing it)
            return (
              (lower.includes('sesame') && lower.includes('sub')) ||
              (lower.includes('multi-grain') && lower.includes('sub')) ||
              (lower.includes('buttery onion') && lower.includes('sub')) ||
              (lower.includes('kids bun') && lower.includes('sub'))
            );
          })
        );
        expect(suggestsRegularBread).toBe(false);
      });
    });
  });
});
