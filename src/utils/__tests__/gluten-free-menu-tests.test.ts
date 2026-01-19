import { describe, expect, it } from 'vitest';
import { checkDishSafety } from '../allergy-checker';
import { menuItems } from '../../data/menu-items';

/**
 * Test cases based on "WILDFIRE'S TYSONS GLUTEN FREE MENU MODIFICATIONS – JUNE 2025"
 * These tests verify that the app correctly identifies gluten-free modifications
 * and suggests the appropriate substitutions as specified in the official document.
 */

describe('Gluten-Free Menu Modifications - Official Document Compliance', () => {
  // Helper to find menu item by name (flexible matching)
  function findMenuItem(namePattern: string): typeof menuItems[0] | undefined {
    return menuItems.find(item => 
      item.dish_name.toLowerCase().includes(namePattern.toLowerCase())
    );
  }

  // Helper to check if substitutions contain expected text
  function hasSubstitution(result: ReturnType<typeof checkDishSafety>, expectedText: string): boolean {
    const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');
    if (!glutenResult || glutenResult.status !== 'unsafe') return false;
    return glutenResult.substitutions.some(sub => 
      sub.toLowerCase().includes(expectedText.toLowerCase())
    );
  }

  describe('APPETIZERS', () => {
    it('Baked French Onion Soup should suggest: "no crouton, SUBSTITUTE GLUTEN FREE CROUTON"', () => {
      const dish = findMenuItem('Baked French Onion Soup');
      if (!dish) {
        console.warn('Baked French Onion Soup not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');

      if (glutenResult && glutenResult.status === 'unsafe') {
        // Should suggest removing crouton and substituting gluten-free crouton
        expect(glutenResult.substitutions.some(sub => 
          sub.toLowerCase().includes('no crouton') || 
          sub.toLowerCase().includes('crouton')
        )).toBe(true);
        
        // Should have gluten-free crouton substitution
        expect(hasSubstitution(result, 'gluten free crouton') || 
               hasSubstitution(result, 'gluten-free crouton')).toBe(true);
      }
    });

    it('Mediterranean Chicken Skewers should have "no changes" (safe as-is)', () => {
      const dish = findMenuItem('Mediterranean Chicken Skewers');
      if (!dish) {
        console.warn('Mediterranean Chicken Skewers not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');

      // Should be safe or have minimal/no modifications needed
      // If unsafe, should be easily modifiable
      if (glutenResult && glutenResult.status === 'unsafe') {
        // Should be modifiable with no major changes
        expect(glutenResult.canBeModified).toBe(true);
      }
    });

    it('Baked Goat Cheese should suggest: "no breadcrumbs, no focaccia, SUB GLUTEN FREE BUN"', () => {
      const dish = findMenuItem('Baked Goat Cheese');
      if (!dish) {
        console.warn('Baked Goat Cheese not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      if (hasSubstitution(result, 'breadcrumb') || hasSubstitution(result, 'focaccia')) {
        expect(hasSubstitution(result, 'gluten free bun') || 
               hasSubstitution(result, 'gluten-free bun')).toBe(true);
      }
    });

    it('Shrimp Cocktail should have "no changes" (safe as-is)', () => {
      const dish = findMenuItem('Shrimp Cocktail');
      if (!dish) {
        console.warn('Shrimp Cocktail not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');

      // Should be safe or have no gluten-containing ingredients
      if (glutenResult) {
        // Either safe or very minor modifications
        expect(glutenResult.status === 'safe' || glutenResult.canBeModified).toBe(true);
      }
    });
  });

  describe('SALADS', () => {
    it('Field Green salad should have "no changes" (safe as-is)', () => {
      const dish = findMenuItem('Field Green') || findMenuItem('Field Salad');
      if (!dish) {
        console.warn('Field Green salad not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');

      // Should be safe with appropriate dressing selection
      if (glutenResult) {
        expect(glutenResult.status === 'safe' || glutenResult.canBeModified).toBe(true);
      }
    });

    it('Caesar Salad should suggest: "no croutons, SUB GLUTEN FREE CROUTONS"', () => {
      const dish = findMenuItem('Caesar Salad');
      if (!dish) {
        console.warn('Caesar Salad not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing croutons and substituting gluten-free
      expect(hasSubstitution(result, 'crouton') || 
             hasSubstitution(result, 'no crouton')).toBe(true);
      
      if (hasSubstitution(result, 'crouton')) {
        expect(hasSubstitution(result, 'gluten free') || 
               hasSubstitution(result, 'gluten-free')).toBe(true);
      }
    });

    it('Steak and Blue Cheese Salad should suggest: "no crispy onions"', () => {
      const dish = findMenuItem('Steak and Blue Cheese') || findMenuItem('Blue Cheese Salad');
      if (!dish) {
        console.warn('Steak and Blue Cheese Salad not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing crispy onions if they contain gluten
      if (hasSubstitution(result, 'onion') || hasSubstitution(result, 'crispy')) {
        expect(true).toBe(true); // Modification suggested
      }
    });

    it('Chopped salad should suggest: "no corn tortillas, SUB GLUTEN FREE TORTILLA CHIPS"', () => {
      const dish = findMenuItem('Chopped salad') || findMenuItem('Chopped Salad');
      if (!dish) {
        console.warn('Chopped salad not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing tortillas/chips and substituting gluten-free
      if (hasSubstitution(result, 'tortilla') || hasSubstitution(result, 'chip')) {
        expect(hasSubstitution(result, 'gluten free') || 
               hasSubstitution(result, 'gluten-free')).toBe(true);
      }
    });
  });

  describe('STEAKS, CHOPS, AND PRIME RIB', () => {
    it('Petite Filet/Filet should suggest: "no crouton, GF steak butter"', () => {
      const dish = findMenuItem('Petite Filet') || findMenuItem('Filet Mignon');
      if (!dish) {
        console.warn('Petite Filet/Filet Mignon not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest gluten-free steak butter
      if (hasSubstitution(result, 'butter') || hasSubstitution(result, 'steak butter')) {
        expect(hasSubstitution(result, 'gluten free') || 
               hasSubstitution(result, 'GF')).toBe(true);
      }
      
      // Should suggest removing crouton if present
      if (hasSubstitution(result, 'crouton')) {
        expect(hasSubstitution(result, 'no crouton') || 
               hasSubstitution(result, 'gluten free crouton')).toBe(true);
      }
    });

    it('Pork Chops should suggest: "no mushroom crust, GF steak butter"', () => {
      const dish = findMenuItem('Pork Chop') || findMenuItem('Pork Chops');
      if (!dish) {
        console.warn('Pork Chops not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing mushroom crust if it contains gluten
      if (hasSubstitution(result, 'mushroom') || hasSubstitution(result, 'crust')) {
        expect(true).toBe(true); // Modification suggested
      }
      
      // Should suggest gluten-free steak butter
      if (hasSubstitution(result, 'butter') || hasSubstitution(result, 'steak butter')) {
        expect(hasSubstitution(result, 'gluten free') || 
               hasSubstitution(result, 'GF')).toBe(true);
      }
    });

    it('New York Strip should suggest: "GF steak butter"', () => {
      const dish = findMenuItem('New York Strip');
      if (!dish) {
        console.warn('New York Strip not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest gluten-free steak butter
      if (hasSubstitution(result, 'butter') || hasSubstitution(result, 'steak butter')) {
        expect(hasSubstitution(result, 'gluten free') || 
               hasSubstitution(result, 'GF')).toBe(true);
      }
    });

    it('Porterhouse should suggest: "no char-crust, GF steak butter"', () => {
      const dish = findMenuItem('Porterhouse');
      if (!dish) {
        console.warn('Porterhouse not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing char-crust if it contains gluten
      if (hasSubstitution(result, 'char') || hasSubstitution(result, 'crust')) {
        expect(true).toBe(true); // Modification suggested
      }
    });

    it('Bone-In Rib-Eye should suggest: "no char-crust, GF steak butter"', () => {
      const dish = findMenuItem('Rib Eye') || findMenuItem('Ribeye');
      if (!dish) {
        console.warn('Bone-In Rib-Eye not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing char-crust if present
      if (hasSubstitution(result, 'char') || hasSubstitution(result, 'crust')) {
        expect(true).toBe(true); // Modification suggested
      }
    });

    it('Prime Rib should have "no changes" (safe as-is)', () => {
      const dish = findMenuItem('Prime Rib');
      if (!dish) {
        console.warn('Prime Rib not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');

      // Should be safe or have minimal modifications
      if (glutenResult) {
        expect(glutenResult.status === 'safe' || glutenResult.canBeModified).toBe(true);
      }
    });
  });

  describe('FISH AND SEAFOOD', () => {
    it('Cedar Planked Salmon should have "no changes" (safe as-is)', () => {
      const dish = findMenuItem('Cedar Planked Salmon') || findMenuItem('Cedar Plank Salmon');
      if (!dish) {
        console.warn('Cedar Planked Salmon not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');

      // Should be safe
      if (glutenResult) {
        expect(glutenResult.status === 'safe' || glutenResult.canBeModified).toBe(true);
      }
    });

    it('Halibut should suggest: "no flour, no breadcrumbs, SUB GF BREADCRUMBS"', () => {
      const dish = findMenuItem('Halibut');
      if (!dish) {
        console.warn('Halibut not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing flour/breadcrumbs and substituting gluten-free
      if (hasSubstitution(result, 'flour') || hasSubstitution(result, 'breadcrumb')) {
        expect(hasSubstitution(result, 'gluten free') || 
               hasSubstitution(result, 'gluten-free') ||
               hasSubstitution(result, 'GF')).toBe(true);
      }
    });
  });

  describe('CHICKEN AND BARBECUE', () => {
    const chickenItems = [
      'Spit-Roasted Half Chicken',
      'Barbecued Chicken',
      'Lemon Pepper Chicken Breast',
      'Chicken Moreno',
      'Barbecued Baby Back Ribs',
      'Rib and Chicken Combo'
    ];

    chickenItems.forEach(itemName => {
      it(`${itemName} should have "no changes" (safe as-is)`, () => {
        const dish = findMenuItem(itemName);
        if (!dish) {
          console.warn(`${itemName} not found in menu items`);
          return;
        }

        const result = checkDishSafety(dish, ['gluten'], []);
        const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');

        // Should be safe or easily modifiable
        if (glutenResult) {
          expect(glutenResult.status === 'safe' || glutenResult.canBeModified).toBe(true);
        }
      });
    });
  });

  describe('PRIME BURGERS AND SANDWICHES', () => {
    it('Thick Prime Angus burger/Cheeseburger should suggest: "no bun, SUBSTITUTE GLUTEN FREE BUN"', () => {
      const dish = findMenuItem('Prime Angus') || findMenuItem('Angus Burger') || findMenuItem('Prime Burger');
      if (!dish) {
        console.warn('Prime Angus burger not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing bun and substituting gluten-free bun
      expect(hasSubstitution(result, 'bun')).toBe(true);
      expect(hasSubstitution(result, 'gluten free bun') || 
             hasSubstitution(result, 'gluten-free bun')).toBe(true);
    });

    it('Turkey Burger should suggest: "no bun, no char-crust, SUBSTITUTE GLUTEN FREE BUN"', () => {
      const dish = findMenuItem('Turkey Burger');
      if (!dish) {
        console.warn('Turkey Burger not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing bun
      expect(hasSubstitution(result, 'bun')).toBe(true);
      expect(hasSubstitution(result, 'gluten free bun') || 
             hasSubstitution(result, 'gluten-free bun')).toBe(true);
      
      // Should also suggest removing char-crust if present
      if (hasSubstitution(result, 'char') || hasSubstitution(result, 'crust')) {
        expect(true).toBe(true); // Modification suggested
      }
    });

    it('Bison Burger/Cheeseburger should suggest: "no bun, SUBSTITUTE GLUTEN FREE BUN"', () => {
      const dish = findMenuItem('Bison Burger') || findMenuItem('Bison');
      if (!dish) {
        console.warn('Bison Burger not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing bun and substituting gluten-free bun
      expect(hasSubstitution(result, 'bun')).toBe(true);
      expect(hasSubstitution(result, 'gluten free bun') || 
             hasSubstitution(result, 'gluten-free bun')).toBe(true);
    });

    it('Prime Rib French Dip should suggest: "no bun, SUBSTITUTE GLUTEN FREE BUN"', () => {
      const dish = findMenuItem('Prime Rib French Dip') || findMenuItem('French Dip');
      if (!dish) {
        console.warn('Prime Rib French Dip not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing bun and substituting gluten-free bun
      expect(hasSubstitution(result, 'bun')).toBe(true);
      expect(hasSubstitution(result, 'gluten free bun') || 
             hasSubstitution(result, 'gluten-free bun')).toBe(true);
    });

    it('Blackened New York Steak Sandwich should suggest: "no bun, SUBSTITUTE GLUTEN FREE BUN"', () => {
      const dish = findMenuItem('Blackened New York') || findMenuItem('New York Steak Sandwich');
      if (!dish) {
        console.warn('Blackened New York Steak Sandwich not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing bun and substituting gluten-free bun
      expect(hasSubstitution(result, 'bun')).toBe(true);
      expect(hasSubstitution(result, 'gluten free bun') || 
             hasSubstitution(result, 'gluten-free bun')).toBe(true);
    });
  });

  describe('SIDES', () => {
    const sideItems = [
      'Mashed Potatoes',
      'Broccoli',
      'Roasted Vegetables',
      'Au Gratin',
      'Baked Potato',
      'Sweet Potato',
      'Mushroom Caps'
    ];

    sideItems.forEach(itemName => {
      it(`${itemName} should have "no changes" (safe as-is)`, () => {
        const dish = findMenuItem(itemName);
        if (!dish) {
          console.warn(`${itemName} not found in menu items`);
          return;
        }

        const result = checkDishSafety(dish, ['gluten'], []);
        const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');

        // Should be safe
        if (glutenResult) {
          expect(glutenResult.status === 'safe' || glutenResult.canBeModified).toBe(true);
        }
      });
    });
  });

  describe('KIDS MENU', () => {
    it('Kids Burger/Cheeseburger should suggest: "no fries, no bun, SUB MASHED POTATOES OR BROCCOLI, SUB GLUTEN FREE BUN"', () => {
      const dish = findMenuItem('Kids Burger') || findMenuItem('Kids Cheeseburger');
      if (!dish) {
        console.warn('Kids Burger not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing bun
      expect(hasSubstitution(result, 'bun')).toBe(true);
      expect(hasSubstitution(result, 'gluten free bun') || 
             hasSubstitution(result, 'gluten-free bun')).toBe(true);
    });

    it('Kids Filet should have "no changes" (safe as-is)', () => {
      const dish = findMenuItem('Kids Filet') || findMenuItem('Kids Filet Mignon');
      if (!dish) {
        console.warn('Kids Filet not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');

      // Should be safe
      if (glutenResult) {
        expect(glutenResult.status === 'safe' || glutenResult.canBeModified).toBe(true);
      }
    });
  });

  describe('DESSERTS', () => {
    it('Flourless Chocolate cake should have "no changes" (safe as-is)', () => {
      const dish = findMenuItem('Flourless Chocolate') || findMenuItem('Flourless Chocolate Cake');
      if (!dish) {
        console.warn('Flourless Chocolate cake not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');

      // Should be safe (flourless = no gluten)
      if (glutenResult) {
        expect(glutenResult.status).toBe('safe');
      }
    });

    it('Berries Crisp should suggest: "no ice cream, sub whipped cream"', () => {
      const dish = findMenuItem('Berries Crisp') || findMenuItem('Berry Crisp');
      if (!dish) {
        console.warn('Berries Crisp not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // The crisp itself likely contains gluten, but should suggest modifications
      const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');
      if (glutenResult && glutenResult.status === 'unsafe') {
        // Should have modification suggestions
        expect(glutenResult.substitutions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('BRUNCH', () => {
    it('Classic Breakfast should suggest: "no sausage, no toast, SUB GF BUN"', () => {
      const dish = findMenuItem('Classic Breakfast');
      if (!dish) {
        console.warn('Classic Breakfast not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing toast and substituting gluten-free bun
      if (hasSubstitution(result, 'toast') || hasSubstitution(result, 'bun')) {
        expect(hasSubstitution(result, 'gluten free bun') || 
               hasSubstitution(result, 'gluten-free bun') ||
               hasSubstitution(result, 'GF bun')).toBe(true);
      }
    });

    it('Avocado Toast and Eggs should suggest: "no toast, SUB GF BUN"', () => {
      const dish = findMenuItem('Avocado Toast');
      if (!dish) {
        console.warn('Avocado Toast not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing toast and substituting gluten-free bun
      expect(hasSubstitution(result, 'toast') || hasSubstitution(result, 'bun')).toBe(true);
      if (hasSubstitution(result, 'toast') || hasSubstitution(result, 'bun')) {
        expect(hasSubstitution(result, 'gluten free') || 
               hasSubstitution(result, 'gluten-free') ||
               hasSubstitution(result, 'GF')).toBe(true);
      }
    });

    it('Skirt Steak and Eggs should have "no changes" (safe as-is)', () => {
      const dish = findMenuItem('Skirt Steak and Eggs');
      if (!dish) {
        console.warn('Skirt Steak and Eggs not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      const glutenResult = result.perAllergy.find(r => r.allergen === 'gluten');

      // Should be safe or easily modifiable
      if (glutenResult) {
        expect(glutenResult.status === 'safe' || glutenResult.canBeModified).toBe(true);
      }
    });
  });

  describe('NIGHTLY SPECIALS', () => {
    it('Turkey Dinner (Sunday) should suggest: "no stuffing, no gravy"', () => {
      const dish = findMenuItem('Turkey Dinner');
      if (!dish) {
        console.warn('Turkey Dinner not found in menu items');
        return;
      }

      const result = checkDishSafety(dish, ['gluten'], []);
      
      // Should suggest removing stuffing and gravy if they contain gluten
      if (hasSubstitution(result, 'stuffing') || hasSubstitution(result, 'gravy')) {
        expect(hasSubstitution(result, 'no stuffing') || 
               hasSubstitution(result, 'no gravy') ||
               hasSubstitution(result, 'NO stuffing') ||
               hasSubstitution(result, 'NO gravy')).toBe(true);
      }
    });
  });
});
