import { describe, it, expect } from 'vitest';
import { menuItems } from '../../data/menu-items';
import { checkDishSafety } from '../allergy-checker';

// Mock function to trace what's happening
describe('Debug Shellfish Tests', () => {
  it('Trace Coconut Shrimp shellfish check', () => {
    const dish = menuItems.find(d => d.dish_name === 'Coconut Shrimp');
    expect(dish).toBeDefined();
    if (dish) {
      console.log('=== DETAILED DEBUG ===');
      console.log('Dish name:', dish.dish_name);
      console.log('Dish name lowercase:', dish.dish_name.toLowerCase());
      console.log('Includes "shrimp":', dish.dish_name.toLowerCase().includes('shrimp'));
      console.log('');
      console.log('Description:', dish.description);
      console.log('');
      console.log('Ingredients:', dish.ingredients);
      console.log('');
      console.log('contains_shellfish:', dish.contains_shellfish);
      console.log('cannot_be_made_safe_notes:', dish.cannot_be_made_safe_notes);
      console.log('');
      
      const result = checkDishSafety(dish, ['shellfish'], []);
      const shellfishResult = result.perAllergy.find(a => a.allergen === 'shellfish');
      
      console.log('=== RESULT ===');
      console.log('Overall Status:', result.overallStatus);
      console.log('canBeModified:', shellfishResult?.canBeModified);
      console.log('Substitutions:', shellfishResult?.substitutions);
      console.log('foundIngredients:', shellfishResult?.foundIngredients);
      
      // The test - Coconut Shrimp with shellfish should show NOT POSSIBLE
      // because shrimp IS the main protein
      expect(result.overallStatus).toBe('unsafe');
      expect(shellfishResult?.canBeModified).toBe(false);
    }
  });
});
