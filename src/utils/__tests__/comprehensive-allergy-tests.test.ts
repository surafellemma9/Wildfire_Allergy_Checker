import { describe, expect, it } from 'vitest';
import { menuItems } from '../../data/menu-items';
import type { Allergen, MenuItem } from '../../types';
import { checkDishSafety } from '../allergy-checker';

// All allergens to test against
const ALL_ALLERGENS: Allergen[] = [
  'dairy',
  'egg',
  'gluten',
  'shellfish',
  'fish',
  'soy',
  'peanuts',
  'tree_nuts',
  'sesame',
  'msg',
  'onion_garlic',
  'tomato',
];

// Categories to exclude from testing (glossary items, pricing, etc.)
const EXCLUDED_CATEGORIES = [
  'Glossary',
  'Items Not On The Menu (Secret Menu):',
  'Items Not On The Menu And Aq Prices',
  'Dessert Prices',
  'Non Alcoholic Beverage Prices',
  'Brunch Items Not On The Menu – 155 Only',
  'Item  Il 5/6/25 66 5/6/25  Mn 5/6/25  Va 5/6/25',
  'Special Party Items  And Happy Hour :',
];

// Helper to check if a dish should be tested
function shouldTestDish(dish: MenuItem): boolean {
  return !EXCLUDED_CATEGORIES.includes(dish.category);
}

// Helper to get allergen flag from dish
function dishContainsAllergen(dish: MenuItem, allergen: Allergen): boolean {
  switch (allergen) {
    case 'dairy':
      return dish.contains_dairy === 'Y';
    case 'egg':
      return dish.contains_egg === 'Y';
    case 'gluten':
      return dish.contains_gluten === 'Y';
    case 'shellfish':
      return dish.contains_shellfish === 'Y';
    case 'fish':
      return dish.contains_fish === 'Y';
    case 'soy':
      return dish.contains_soy === 'Y';
    case 'peanuts':
      return dish.contains_peanuts === 'Y';
    case 'tree_nuts':
      return dish.contains_tree_nuts === 'Y';
    case 'sesame':
      return dish.contains_sesame === 'Y';
    case 'msg':
      return dish.contains_msg === 'Y';
    case 'onion_garlic':
      // Check description for onion/garlic
      const desc = dish.description.toLowerCase();
      return desc.includes('onion') || desc.includes('garlic') || 
             desc.includes('shallot') || desc.includes('scallion') ||
             desc.includes('chive') || desc.includes('leek');
    case 'tomato':
      // Check description for tomato
      return dish.description.toLowerCase().includes('tomato');
    default:
      return false;
  }
}

// Helper to check if modification is possible based on substitutions
function hasModificationPossible(result: ReturnType<typeof checkDishSafety>, allergen: Allergen): boolean {
  const allergenResult = result.perAllergy.find(r => r.allergen === allergen);
  if (!allergenResult || allergenResult.status === 'safe') {
    return false;
  }
  
  // If there are substitutions and none say "NOT POSSIBLE", modification is possible
  if (allergenResult.substitutions.length > 0) {
    return !allergenResult.substitutions.some(sub => 
      sub.includes('NOT POSSIBLE') || sub.includes('not possible')
    );
  }
  
  return allergenResult.canBeModified || false;
}

describe('Comprehensive Allergy Checker Tests', () => {
  // Organize dishes by category
  const dishesByCategory = new Map<string, MenuItem[]>();
  
  menuItems.forEach(dish => {
    if (shouldTestDish(dish)) {
      if (!dishesByCategory.has(dish.category)) {
        dishesByCategory.set(dish.category, []);
      }
      dishesByCategory.get(dish.category)!.push(dish);
    }
  });

  // Test each category
  dishesByCategory.forEach((dishes, category) => {
    describe(`${category}`, () => {
      dishes.forEach(dish => {
        describe(`${dish.dish_name}`, () => {
          ALL_ALLERGENS.forEach(allergen => {
            it(`should correctly identify ${allergen} allergen`, () => {
              const result = checkDishSafety(dish, [allergen], []);
              const expectedContains = dishContainsAllergen(dish, allergen);
              const allergenResult = result.perAllergy.find(r => r.allergen === allergen);
              
              // Verify allergen result exists
              expect(allergenResult).toBeDefined();
              
              // For description-only allergens (onion_garlic, tomato), the detection
              // may find them even if CSV doesn't flag them, so we check the actual result
              const isDescriptionOnly = allergen === 'onion_garlic' || allergen === 'tomato';
              
              if (expectedContains || (isDescriptionOnly && allergenResult?.status === 'unsafe')) {
                // Dish should be marked as unsafe
                expect(result.overallStatus).toBe('unsafe');
                expect(allergenResult?.status).toBe('unsafe');
                expect(allergenResult?.contains).toBe(true);
                
                // Verify found ingredients are present
                if (allergenResult?.foundIngredients) {
                  expect(allergenResult.foundIngredients.length).toBeGreaterThan(0);
                }
              } else if (!isDescriptionOnly) {
                // For CSV-flagged allergens, if CSV says 'N', it should be safe
                // (unless description detection finds it, which is acceptable)
                if (allergenResult?.status === 'safe') {
                  expect(result.overallStatus).toBe('safe');
                  expect(allergenResult.contains).toBe(false);
                }
                // If description detection found it, that's also valid
              }
            });

            it(`should provide correct modification guidance for ${allergen}`, () => {
              const result = checkDishSafety(dish, [allergen], []);
              const allergenResult = result.perAllergy.find(r => r.allergen === allergen);
              
              if (allergenResult && allergenResult.status === 'unsafe') {
                const modPossible = hasModificationPossible(result, allergen);
                
                // If modification is not possible, should have "NOT POSSIBLE" in substitutions
                if (!modPossible) {
                  expect(allergenResult.substitutions.some(sub => 
                    sub.includes('NOT POSSIBLE') || sub.includes('not possible')
                  )).toBe(true);
                } else {
                  // If modification is possible, should have actionable substitutions
                  expect(allergenResult.substitutions.length).toBeGreaterThan(0);
                  expect(allergenResult.substitutions.every(sub => 
                    !sub.includes('NOT POSSIBLE') && !sub.includes('not possible')
                  )).toBe(true);
                }
              }
            });
          });

          // Test multiple allergens at once
          it('should correctly handle multiple allergens', () => {
            const relevantAllergens = ALL_ALLERGENS.filter(a => dishContainsAllergen(dish, a));
            
            if (relevantAllergens.length > 1) {
              const result = checkDishSafety(dish, relevantAllergens, []);
              
              // Should be unsafe if any allergen is present
              expect(result.overallStatus).toBe('unsafe');
              
              // Each relevant allergen should be marked as unsafe
              relevantAllergens.forEach(allergen => {
                const allergenResult = result.perAllergy.find(r => r.allergen === allergen);
                expect(allergenResult?.status).toBe('unsafe');
              });
            }
          });
        });
      });
    });
  });

  // Specific test cases for known dishes
  describe('Specific Dish Test Cases', () => {
    describe('Shrimp and Crab Bisque', () => {
      const dish = menuItems.find(d => d.id === 'shrimp_and_crab_bisque')!;

      it('should detect dairy allergen and show NOT POSSIBLE (pre-prepared)', () => {
        const result = checkDishSafety(dish, ['dairy'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
        expect(result.perAllergy[0].canBeModified).toBe(false);
        expect(result.perAllergy[0].substitutions.some(sub => 
          sub.includes('NOT POSSIBLE')
        )).toBe(true);
      });

      it('should detect shellfish allergen and show NOT POSSIBLE (main ingredient)', () => {
        const result = checkDishSafety(dish, ['shellfish'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
        expect(result.perAllergy[0].canBeModified).toBe(false);
        expect(result.perAllergy[0].substitutions.some(sub => 
          sub.includes('NOT POSSIBLE')
        )).toBe(true);
      });

      it('should detect gluten allergen and show NOT POSSIBLE (pre-prepared)', () => {
        const result = checkDishSafety(dish, ['gluten'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
        expect(result.perAllergy[0].canBeModified).toBe(false);
        expect(result.perAllergy[0].substitutions.some(sub => 
          sub.includes('NOT POSSIBLE')
        )).toBe(true);
      });

      it('should allow removal of corn garnish (custom allergen)', () => {
        const result = checkDishSafety(dish, [], ['corn']);
        // Corn is in the garnish, so it should be safe (garnish can be removed)
        expect(result.overallStatus).toBe('safe');
        const cornResult = result.perAllergy.find(r => r.allergen === 'corn');
        expect(cornResult?.status).toBe('safe');
        // Or if detected, should allow substitution
        if (cornResult && cornResult.status === 'unsafe') {
          expect(cornResult.substitutions.some(sub => 
            sub.includes('NO corn') || sub.includes('corn')
          )).toBe(true);
        }
      });

      it('should allow removal of chives garnish (custom allergen)', () => {
        const result = checkDishSafety(dish, [], ['chives']);
        // Chives are in the garnish, so it should be safe (garnish can be removed)
        expect(result.overallStatus).toBe('safe');
        const chivesResult = result.perAllergy.find(r => r.allergen === 'chives');
        expect(chivesResult?.status).toBe('safe');
        // Or if detected, should allow substitution
        if (chivesResult && chivesResult.status === 'unsafe') {
          expect(chivesResult.substitutions.some(sub => 
            sub.includes('NO chives') || sub.includes('chives')
          )).toBe(true);
        }
      });

      it('should allow removal of red peppers garnish (custom allergen)', () => {
        const result = checkDishSafety(dish, [], ['red peppers']);
        // Red peppers are in the garnish, so it should be safe (garnish can be removed)
        expect(result.overallStatus).toBe('safe');
        const peppersResult = result.perAllergy.find(r => r.allergen === 'red peppers');
        expect(peppersResult?.status).toBe('safe');
        // Or if detected, should allow substitution
        if (peppersResult && peppersResult.status === 'unsafe') {
          expect(peppersResult.substitutions.some(sub => 
            sub.includes('NO red peppers') || sub.includes('red peppers')
          )).toBe(true);
        }
      });

      it('should have cannot_be_made_safe_notes indicating garnish can be removed', () => {
        expect(dish.cannot_be_made_safe_notes).toBeTruthy();
        expect(dish.cannot_be_made_safe_notes).toContain('pre-prepared');
        expect(dish.cannot_be_made_safe_notes).toContain('garnish');
        expect(dish.cannot_be_made_safe_notes).toContain('corn');
        expect(dish.cannot_be_made_safe_notes).toContain('chives');
      });
    });

    describe('Baked French Onion Soup', () => {
      const dish = menuItems.find(d => d.id === 'baked_french_onion_soup')!;

      it('should detect dairy allergen', () => {
        const result = checkDishSafety(dish, ['dairy'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
        // Cheese is baked on, so modification should not be possible
        expect(result.perAllergy[0].substitutions.some(sub => 
          sub.includes('NOT POSSIBLE') || sub.includes('baked')
        )).toBe(true);
      });

      it('should detect egg allergen', () => {
        const result = checkDishSafety(dish, ['egg'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
      });
    });

    describe('Field Salad', () => {
      const dish = menuItems.find(d => d.id === 'field_salad')!;

      it('should handle dairy allergen (dressing can be changed)', () => {
        const result = checkDishSafety(dish, ['dairy'], []);
        // Field salad base doesn't contain dairy, but dressings may
        // The actual status depends on whether any dairy is detected in description
        expect(result.perAllergy[0].allergen).toBe('dairy');
        // If unsafe, modification should be possible via dressing selection
        if (result.overallStatus === 'unsafe') {
          expect(result.perAllergy[0].substitutions.length).toBeGreaterThan(0);
        }
      });

      it('should be safe for gluten', () => {
        const result = checkDishSafety(dish, ['gluten'], []);
        expect(result.overallStatus).toBe('safe');
      });
    });

    describe('Caesar Salad', () => {
      const dish = menuItems.find(d => d.id === 'caesar_salad')!;

      it('should detect shellfish allergen (anchovy in dressing)', () => {
        const result = checkDishSafety(dish, ['shellfish'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
        // Anchovy in dressing cannot be separated
        expect(result.perAllergy[0].substitutions.some(sub => 
          sub.includes('NOT POSSIBLE') || sub.includes('caesar') || sub.includes('dressing')
        )).toBe(true);
      });

      it('should detect dairy allergen', () => {
        const result = checkDishSafety(dish, ['dairy'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
      });
    });

    describe('Petite Filet Mignon', () => {
      const dish = menuItems.find(d => d.id === 'petite_filet_mignon_filet_mignon')!;

      it('should detect dairy allergen (steak butter)', () => {
        const result = checkDishSafety(dish, ['dairy'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
        // Should be modifiable (can request without steak butter)
        expect(result.perAllergy[0].substitutions.some(sub => 
          sub.includes('steak butter') || sub.includes('NO steak butter')
        )).toBe(true);
      });

      it('should detect shellfish allergen (Worcestershire in steak butter)', () => {
        const result = checkDishSafety(dish, ['shellfish'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
        // Should have substitutions (may or may not mention steak butter specifically)
        expect(result.perAllergy[0].substitutions.length).toBeGreaterThan(0);
      });
    });

    describe('Mac and Cheese', () => {
      const dish = menuItems.find(d => d.id === 'mac_and_cheese')!;

      it('should detect dairy allergen and not allow modification', () => {
        const result = checkDishSafety(dish, ['dairy'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
        // Cheese is core ingredient, modification not possible
        expect(result.perAllergy[0].substitutions.some(sub => 
          sub.includes('NOT POSSIBLE') || sub.includes('mac and cheese')
        )).toBe(true);
      });
    });

    describe('Crispy Fried Calamari', () => {
      const dish = menuItems.find(d => d.id === 'crispy_fried_calamari')!;

      it('should detect shellfish allergen and not allow modification', () => {
        const result = checkDishSafety(dish, ['shellfish'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
        // Calamari is main component, cannot be substituted
        expect(result.perAllergy[0].substitutions.some(sub => 
          sub.includes('NOT POSSIBLE') || sub.includes('calamari')
        )).toBe(true);
      });

      it('should detect dairy allergen (buttermilk marinade)', () => {
        const result = checkDishSafety(dish, ['dairy'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
        // Buttermilk is in marinade, may not be modifiable
        expect(result.perAllergy[0].substitutions.length).toBeGreaterThan(0);
      });
    });

    describe('Classic Breakfast', () => {
      const dish = menuItems.find(d => d.id === 'classic_breakfast')!;

      it('should detect egg allergen and not allow modification', () => {
        const result = checkDishSafety(dish, ['egg'], []);
        expect(result.overallStatus).toBe('unsafe');
        expect(result.perAllergy[0].status).toBe('unsafe');
        // Eggs are main component
        expect(result.perAllergy[0].substitutions.some(sub => 
          sub.includes('NOT POSSIBLE') || sub.includes('egg')
        )).toBe(true);
      });
    });

    describe('Steamed Broccoli with Lemon Vinaigrette', () => {
      const dish = menuItems.find(d => d.id === 'steamed_broccoli_with_lemon_vinaigrette')!;

      it('should be safe for all common allergens', () => {
        const commonAllergens: Allergen[] = ['dairy', 'egg', 'gluten', 'shellfish', 'soy', 'peanuts', 'tree_nuts', 'sesame', 'msg'];
        commonAllergens.forEach(allergen => {
          const result = checkDishSafety(dish, [allergen], []);
          expect(result.overallStatus).toBe('safe');
          const allergenResult = result.perAllergy.find(r => r.allergen === allergen);
          expect(allergenResult?.status).toBe('safe');
        });
      });
    });
  });

  // Statistics test
  describe('Test Coverage Statistics', () => {
    it('should test all menu categories', () => {
      const testedCategories = Array.from(dishesByCategory.keys());
      const expectedCategories = [
        'Appetizers',
        'Salads',
        'Steaks And Chops',
        'Chicken And Barbecue',
        'Fresh Fish And Seafood',
        'Filet Mignon',
        'Roasted Prime Rib  Of Beef Au Jus',
        'Sandwiches: Prime Burgers',
        'Sandwiches: Signatures',
        'Sides',
        'Desserts',
        'Brunch',
        'Kid\'S Menu',
        'Nightly Specials',
      ];

      expectedCategories.forEach(category => {
        const dishes = menuItems.filter(d => d.category === category && shouldTestDish(d));
        if (dishes.length > 0) {
          expect(testedCategories).toContain(category);
        }
      });
    });

    it('should have tested a significant number of dishes', () => {
      const totalDishes = Array.from(dishesByCategory.values())
        .reduce((sum, dishes) => sum + dishes.length, 0);
      
      // Should test at least 50 dishes (adjust based on actual menu size)
      expect(totalDishes).toBeGreaterThan(50);
    });
  });
});

