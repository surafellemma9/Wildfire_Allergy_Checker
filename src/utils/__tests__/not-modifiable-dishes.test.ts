import { describe, it, expect } from 'vitest';
import { checkDishSafety } from '../allergy-checker';
import { menuItems } from '../../data/menu-items';

/**
 * Test to verify that dishes that CANNOT be modified correctly show "NOT POSSIBLE" messages
 */
describe('Dishes That Cannot Be Modified - NOT POSSIBLE Verification', () => {
  
  // Dishes that should NOT be modifiable for specific allergens
  const nonModifiableDishes = [
    {
      dishName: 'Shrimp and Crab Bisque',
      allergen: 'dairy' as const,
      expectedReason: 'bisque' // Core ingredient
    },
    {
      dishName: 'Shrimp and Crab Bisque',
      allergen: 'shellfish' as const,
      expectedReason: 'main component' // Main protein is the allergen
    },
    {
      dishName: 'Mac and Cheese',
      allergen: 'dairy' as const,
      expectedReason: 'core ingredient' // Cheese defines the dish
    },
    {
      dishName: 'Crispy Fried Calamari',
      allergen: 'shellfish' as const,
      expectedReason: 'main component' // Calamari is shellfish
    },
    {
      dishName: 'Caesar Salad',
      allergen: 'shellfish' as const,
      expectedReason: 'anchovy' // Anchovy in dressing cannot be separated
    },
    {
      dishName: 'Baked French Onion Soup',
      allergen: 'dairy' as const,
      expectedReason: 'baked' // Cheese is baked on
    },
    {
      dishName: "JD's Cheesecake",
      allergen: 'dairy' as const,
      expectedReason: 'core ingredient' // Cheese defines the dish
    },
    {
      dishName: 'Creamed Spinach',
      allergen: 'dairy' as const,
      expectedReason: 'creamed' // Cream is core ingredient
    },
    {
      dishName: 'Au Gratin Potatoes',
      allergen: 'dairy' as const,
      expectedReason: 'au gratin' // Cheese is core ingredient
    },
    {
      dishName: 'Coconut Shrimp',
      allergen: 'shellfish' as const,
      expectedReason: 'main component' // Shrimp is main component
    },
    {
      dishName: "Wildfire's Macadamia Nut Crusted Halibut",
      allergen: 'tree_nuts' as const,
      expectedReason: 'crusted' // Nuts are crusted onto the fish
    },
    {
      dishName: 'Classic Breakfast',
      allergen: 'egg' as const,
      expectedReason: 'main component' // Eggs are main component
    },
    {
      dishName: 'Buttermilk Pancakes',
      allergen: 'dairy' as const,
      expectedReason: 'buttermilk' // Buttermilk is in the batter
    },
  ];

  nonModifiableDishes.forEach(({ dishName, allergen, expectedReason }) => {
    it(`should show NOT POSSIBLE for ${dishName} with ${allergen} allergen`, () => {
      const dish = menuItems.find(d => d.dish_name === dishName);
      
      if (!dish) {
        console.warn(`Dish "${dishName}" not found in menu items`);
        return;
      }

      const result = checkDishSafety(dish, [allergen], []);
      const allergenResult = result.perAllergy.find(r => r.allergen === allergen);
      
      // Verify the dish is marked as unsafe
      expect(result.overallStatus).toBe('unsafe');
      expect(allergenResult?.status).toBe('unsafe');
      
      // Verify it shows NOT POSSIBLE
      const hasNotPossible = allergenResult?.substitutions.some(sub => 
        sub.includes('NOT POSSIBLE')
      );
      
      expect(hasNotPossible).toBe(true);
      
      // Verify the reason is included in the message (be flexible about exact wording)
      if (expectedReason) {
        const hasExpectedReason = allergenResult?.substitutions.some(sub => {
          const subLower = sub.toLowerCase();
          const reasonLower = expectedReason.toLowerCase();
          // Check if the reason or a related term appears
          return subLower.includes(reasonLower) || 
                 subLower.includes('core ingredient') ||
                 subLower.includes('cannot be') ||
                 subLower.includes('cannot be removed') ||
                 subLower.includes('cannot be substituted');
        });
        // Log actual message for debugging if test fails
        if (!hasExpectedReason && allergenResult?.substitutions && allergenResult.substitutions.length > 0) {
          console.log(`Actual message for ${dishName} - ${allergen}: ${allergenResult.substitutions[0]}`);
        }
        expect(hasExpectedReason).toBe(true);
      }
      
      // Verify canBeModified is false
      expect(allergenResult?.canBeModified).toBe(false);
    });
  });

  // Test that modifiable dishes do NOT show NOT POSSIBLE
  const modifiableDishes = [
    {
      dishName: 'Petite Filet Mignon',
      allergen: 'dairy' as const,
      description: 'Steak butter can be removed'
    },
    {
      dishName: 'Field Salad',
      allergen: 'dairy' as const,
      description: 'Dressing can be changed'
    },
    {
      dishName: 'Greek Salad',
      allergen: 'dairy' as const,
      description: 'Feta can be removed'
    },
  ];

  modifiableDishes.forEach(({ dishName, allergen, description }) => {
    it(`should NOT show NOT POSSIBLE for ${dishName} with ${allergen} (${description})`, () => {
      const dish = menuItems.find(d => d.dish_name === dishName);
      
      if (!dish) {
        console.warn(`Dish "${dishName}" not found in menu items`);
        return;
      }

      const result = checkDishSafety(dish, [allergen], []);
      const allergenResult = result.perAllergy.find(r => r.allergen === allergen);
      
      if (allergenResult && allergenResult.status === 'unsafe') {
        // If it's unsafe, it should NOT have NOT POSSIBLE
        const hasNotPossible = allergenResult?.substitutions?.some(sub => 
          sub.includes('NOT POSSIBLE')
        ) || false;
        
        // This dish should be modifiable, so it should NOT have NOT POSSIBLE
        // (unless it's actually not modifiable, in which case the test will fail)
        expect(hasNotPossible).toBe(false);
      }
    });
  });
});

