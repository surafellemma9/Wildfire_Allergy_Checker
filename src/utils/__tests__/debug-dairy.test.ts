import { describe, it, expect } from 'vitest';
import { menuItems } from '../../data/menu-items';
import { checkDishSafety } from '../allergy-checker';

describe('Debug Dairy Tests', () => {
  it('Debug Mediterranean Chicken Skewers', () => {
    const dish = menuItems.find(d => d.dish_name.includes('Mediterranean Chicken Skewers'));
    expect(dish).toBeDefined();
    if (dish) {
      const result = checkDishSafety(dish, ['dairy'], []);
      console.log('=== Mediterranean Chicken Skewers ===');
      console.log('Status:', result.overallStatus);
      console.log('Dairy Result:', JSON.stringify(result.perAllergy.find(a => a.allergen === 'dairy'), null, 2));
    }
  });

  it('Debug Applewood Smoked Bacon Wrapped Sea Scallops', () => {
    const dish = menuItems.find(d => d.dish_name.includes('Applewood Smoked Bacon Wrapped Sea Scallops'));
    expect(dish).toBeDefined();
    if (dish) {
      const result = checkDishSafety(dish, ['dairy'], []);
      console.log('=== Applewood Smoked Bacon Wrapped Sea Scallops ===');
      console.log('Status:', result.overallStatus);
      console.log('Dish contains_dairy field:', dish.contains_dairy);
      console.log('Dairy Result:', JSON.stringify(result.perAllergy.find(a => a.allergen === 'dairy'), null, 2));
    }
  });

  it('Debug Caesar Salad', () => {
    const dish = menuItems.find(d => d.dish_name.includes('Caesar  Salad'));
    expect(dish).toBeDefined();
    if (dish) {
      const result = checkDishSafety(dish, ['dairy'], []);
      console.log('=== Caesar Salad ===');
      console.log('Status:', result.overallStatus);
      console.log('Dairy Result:', JSON.stringify(result.perAllergy.find(a => a.allergen === 'dairy'), null, 2));
    }
  });
  
  it('Debug Coconut Shrimp (shellfish)', () => {
    const dish = menuItems.find(d => d.dish_name === 'Coconut Shrimp');
    expect(dish).toBeDefined();
    if (dish) {
      console.log('=== Coconut Shrimp Debug ===');
      console.log('Dish name:', dish.dish_name);
      console.log('Dish name lowercase includes "shrimp":', dish.dish_name.toLowerCase().includes('shrimp'));
      const result = checkDishSafety(dish, ['shellfish'], []);
      console.log('Status:', result.overallStatus);
      console.log('Shellfish Result:', JSON.stringify(result.perAllergy.find(a => a.allergen === 'shellfish'), null, 2));
    }
  });
});
