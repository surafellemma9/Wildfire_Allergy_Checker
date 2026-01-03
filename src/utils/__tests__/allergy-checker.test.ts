import { describe, it, expect } from 'vitest';
import { checkDishSafety } from '../allergy-checker';
import type { MenuItem, Allergen } from '../../types';

// Helper function to create a test menu item
function createMenuItem(overrides: Partial<MenuItem>): MenuItem {
  return {
    id: 'test-item',
    dish_name: 'Test Dish',
    ticket_code: 'TEST',
    category: 'Test Category',
    menu: 'L & D',
    description: '',
    ingredients: [],
    allergy_raw: '',
    contains_dairy: 'N',
    contains_egg: 'N',
    contains_gluten: 'N',
    contains_shellfish: 'N',
    contains_fish: 'N',
    contains_soy: 'N',
    contains_nuts: 'N',
    contains_sesame: 'N',
    contains_msg: 'N',
    contains_peanuts: 'N',
    contains_tree_nuts: 'N',
    notes: '',
    mod_notes: '',
    cannot_be_made_safe_notes: '',
    ...overrides,
  };
}

describe('checkDishSafety', () => {
  describe('Dairy Detection', () => {
    it('should detect dairy in butter', () => {
      const dish = createMenuItem({
        description: 'Dish with butter and herbs',
        contains_dairy: 'Y',
      });
      const result = checkDishSafety(dish, ['dairy'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].status).toBe('unsafe');
      expect(result.perAllergy[0].allergen).toBe('dairy');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('butter')
      )).toBe(true);
    });

    it('should detect dairy in cheese', () => {
      const dish = createMenuItem({
        description: 'Dish with cheddar cheese and parmesan',
        contains_dairy: 'Y',
      });
      const result = checkDishSafety(dish, ['dairy'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('cheese')
      )).toBe(true);
    });

    it('should detect dairy in cream', () => {
      const dish = createMenuItem({
        description: 'Dish with whipping cream and heavy cream',
        contains_dairy: 'Y',
      });
      const result = checkDishSafety(dish, ['dairy'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('cream')
      )).toBe(true);
    });

    it('should detect dairy in composite ingredients like ranch dressing', () => {
      const dish = createMenuItem({
        description: 'Salad with ranch dressing',
        contains_dairy: 'Y',
      });
      const result = checkDishSafety(dish, ['dairy'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('ranch')
      )).toBe(true);
    });

    it('should return safe when no dairy is present', () => {
      const dish = createMenuItem({
        description: 'Grilled chicken with vegetables',
      });
      const result = checkDishSafety(dish, ['dairy'], []);
      
      expect(result.overallStatus).toBe('safe');
      expect(result.perAllergy[0].status).toBe('safe');
    });
  });

  describe('Egg Detection', () => {
    it('should detect eggs in description', () => {
      const dish = createMenuItem({
        description: 'Dish with eggs and flour',
        contains_egg: 'Y',
      });
      const result = checkDishSafety(dish, ['egg'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('egg')
      )).toBe(true);
    });

    it('should detect egg in mayonnaise', () => {
      const dish = createMenuItem({
        description: 'Sandwich with mayonnaise',
        contains_egg: 'Y',
      });
      const result = checkDishSafety(dish, ['egg'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('mayonnaise')
      )).toBe(true);
    });
  });

  describe('Gluten Detection', () => {
    it('should detect gluten in bread', () => {
      const dish = createMenuItem({
        description: 'Sandwich on multi-grain bread',
        contains_gluten: 'Y',
      });
      const result = checkDishSafety(dish, ['gluten'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('bread')
      )).toBe(true);
    });

    it('should detect gluten in flour', () => {
      const dish = createMenuItem({
        description: 'Dish with seasoned flour',
        contains_gluten: 'Y',
      });
      const result = checkDishSafety(dish, ['gluten'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('flour')
      )).toBe(true);
    });
  });

  describe('Shellfish Detection', () => {
    it('should detect shellfish in shrimp', () => {
      const dish = createMenuItem({
        description: 'Dish with shrimp and crab',
        contains_shellfish: 'Y',
      });
      const result = checkDishSafety(dish, ['shellfish'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('shrimp') || ing.toLowerCase().includes('crab')
      )).toBe(true);
    });

    it('should detect shellfish in lobster base', () => {
      const dish = createMenuItem({
        description: 'Soup with lobster base',
        contains_shellfish: 'Y',
      });
      const result = checkDishSafety(dish, ['shellfish'], []);
      
      expect(result.overallStatus).toBe('unsafe');
    });
  });

  describe('Peanuts Detection', () => {
    it('should detect peanuts', () => {
      const dish = createMenuItem({
        description: 'Dish with peanuts and peanut butter',
        contains_peanuts: 'Y',
      });
      const result = checkDishSafety(dish, ['peanuts'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('peanut')
      )).toBe(true);
    });

    it('should NOT detect peanuts in steak butter', () => {
      const dish = createMenuItem({
        description: 'Steak topped with steak butter',
      });
      const result = checkDishSafety(dish, ['peanuts'], []);
      
      // Steak butter should not contain peanuts
      expect(result.overallStatus).toBe('safe');
      expect(result.perAllergy[0].status).toBe('safe');
    });
  });

  describe('Tree Nuts Detection', () => {
    it('should detect tree nuts', () => {
      const dish = createMenuItem({
        description: 'Dish with almonds and walnuts',
        contains_tree_nuts: 'Y',
      });
      const result = checkDishSafety(dish, ['tree_nuts'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('almond') || ing.toLowerCase().includes('walnut')
      )).toBe(true);
    });

    it('should detect macadamia nuts', () => {
      const dish = createMenuItem({
        description: 'Halibut with macadamia nut crust',
        contains_tree_nuts: 'Y',
      });
      const result = checkDishSafety(dish, ['tree_nuts'], []);
      
      expect(result.overallStatus).toBe('unsafe');
    });
  });

  describe('Soy Detection', () => {
    it('should detect soy sauce', () => {
      const dish = createMenuItem({
        description: 'Dish marinated in soy sauce',
        contains_soy: 'Y',
      });
      const result = checkDishSafety(dish, ['soy'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('soy')
      )).toBe(true);
    });

    it('should detect tamari', () => {
      const dish = createMenuItem({
        description: 'Dish with tamari sauce',
        contains_soy: 'Y',
      });
      const result = checkDishSafety(dish, ['soy'], []);
      
      expect(result.overallStatus).toBe('unsafe');
    });
  });

  describe('Onion/Garlic Detection', () => {
    it('should detect onion and garlic', () => {
      const dish = createMenuItem({
        description: 'Dish with onions and garlic',
      });
      const result = checkDishSafety(dish, ['onion_garlic'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].foundIngredients?.some(ing => 
        ing.toLowerCase().includes('onion') || ing.toLowerCase().includes('garlic')
      )).toBe(true);
    });
  });

  describe('Multiple Allergens', () => {
    it('should detect multiple allergens', () => {
      const dish = createMenuItem({
        description: 'Dish with butter, eggs, and bread',
        contains_dairy: 'Y',
        contains_egg: 'Y',
        contains_gluten: 'Y',
      });
      const result = checkDishSafety(dish, ['dairy', 'egg', 'gluten'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy.length).toBe(3);
      expect(result.perAllergy.every(item => item.status === 'unsafe')).toBe(true);
    });

    it('should handle mix of safe and unsafe allergens', () => {
      const dish = createMenuItem({
        description: 'Grilled chicken with vegetables',
      });
      const result = checkDishSafety(dish, ['dairy', 'peanuts'], []);
      
      expect(result.overallStatus).toBe('safe');
      expect(result.perAllergy.every(item => item.status === 'safe')).toBe(true);
    });
  });

  describe('Custom Allergens', () => {
    it('should detect custom allergens', () => {
      const dish = createMenuItem({
        description: 'Dish with cilantro and lime',
      });
      const result = checkDishSafety(dish, [], ['cilantro']);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].allergen).toBe('cilantro');
      expect(result.perAllergy[0].foundIngredients).toContain('cilantro');
    });

    it('should handle multiple custom allergens', () => {
      const dish = createMenuItem({
        description: 'Dish with cilantro and basil',
      });
      const result = checkDishSafety(dish, [], ['cilantro', 'basil']);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy.length).toBe(2);
    });
  });

  describe('Substitution Generation', () => {
    it('should generate substitutions for unsafe dishes', () => {
      const dish = createMenuItem({
        description: 'Steak with butter',
        contains_dairy: 'Y',
        category: 'Steaks And Chops',
      });
      const result = checkDishSafety(dish, ['dairy'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      expect(result.perAllergy[0].substitutions.length).toBeGreaterThan(0);
      expect(result.perAllergy[0].substitutions[0]).toContain('NO');
    });

    it('should not generate substitutions for safe dishes', () => {
      const dish = createMenuItem({
        description: 'Grilled chicken',
      });
      const result = checkDishSafety(dish, ['dairy'], []);
      
      expect(result.overallStatus).toBe('safe');
      expect(result.perAllergy[0].substitutions.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty description', () => {
      const dish = createMenuItem({
        description: '',
      });
      const result = checkDishSafety(dish, ['dairy'], []);
      
      expect(result.overallStatus).toBe('safe');
    });

    it('should handle no allergens selected', () => {
      const dish = createMenuItem({
        description: 'Any dish',
      });
      const result = checkDishSafety(dish, [], []);
      
      expect(result.perAllergy.length).toBe(0);
    });

    it('should handle case-insensitive matching', () => {
      const dish = createMenuItem({
        description: 'Dish with BUTTER and Cheese',
        contains_dairy: 'Y',
      });
      const result = checkDishSafety(dish, ['dairy'], []);
      
      expect(result.overallStatus).toBe('unsafe');
    });

    it('should handle word boundaries correctly', () => {
      // "butter" should not match "buttermilk" as a whole word
      const dish = createMenuItem({
        description: 'Dish with buttermilk',
        contains_dairy: 'Y',
      });
      const result = checkDishSafety(dish, ['dairy'], []);
      
      // buttermilk should still be detected as dairy
      expect(result.overallStatus).toBe('unsafe');
    });
  });

  describe('Composite Ingredients', () => {
    it('should detect allergens in composite ingredients', () => {
      const dish = createMenuItem({
        description: 'Dish with steak butter',
        contains_dairy: 'Y',
        category: 'Steaks And Chops',
      });
      const result = checkDishSafety(dish, ['dairy'], []);
      
      // Steak butter contains butter (dairy)
      expect(result.overallStatus).toBe('unsafe');
    });

    it('should detect allergens in sauces', () => {
      const dish = createMenuItem({
        description: 'Dish with hollandaise sauce',
        contains_dairy: 'Y',
        contains_egg: 'Y',
        ingredients: ['hollandaise sauce'],
      } as any);
      const result = checkDishSafety(dish, ['dairy', 'egg'], []);
      
      expect(result.overallStatus).toBe('unsafe');
      // Hollandaise contains both dairy and egg
      expect(result.perAllergy.filter(item => item.status === 'unsafe').length).toBeGreaterThan(0);
    });
  });
});

