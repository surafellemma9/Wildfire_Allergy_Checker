import { describe, it, expect } from 'vitest';
import { menuItems } from '../menu-items';

describe('Menu Items Data', () => {
  it('should have menu items', () => {
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it('should have valid menu item structure', () => {
    menuItems.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('dish_name');
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('menu');
      expect(item).toHaveProperty('description');
      expect(typeof item.id).toBe('string');
      expect(typeof item.dish_name).toBe('string');
      expect(item.dish_name.length).toBeGreaterThan(0);
    });
  });

  it('should have New York Strip Steak', () => {
    const nyStrip = menuItems.find(item => 
      item.dish_name.toLowerCase().includes('new york strip') && 
      !item.dish_name.toLowerCase().includes('sandwich')
    );
    expect(nyStrip).toBeDefined();
    expect(nyStrip?.menu).toBe('D'); // Should be dinner only
  });

  it('should have Roasted Market Vegetables as a side', () => {
    const roastedVeg = menuItems.find(item => 
      item.dish_name.toLowerCase().includes('roasted market vegetables') ||
      (item.dish_name.toLowerCase().includes('roasted vegetables') && item.category === 'Sides')
    );
    expect(roastedVeg).toBeDefined();
    expect(roastedVeg?.category).toBe('Sides');
  });

  it('should have Classic Breakfast', () => {
    const classicBreakfast = menuItems.find(item => 
      item.dish_name.toLowerCase().includes('classic breakfast')
    );
    expect(classicBreakfast).toBeDefined();
    expect(classicBreakfast?.category).toBe('Brunch');
  });

  it('should have unique IDs', () => {
    const ids = menuItems.map(item => item.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have valid allergen flags', () => {
    menuItems.forEach((item) => {
      expect(typeof item.contains_dairy).toBe('boolean');
      expect(typeof item.contains_egg).toBe('boolean');
      expect(typeof item.contains_gluten).toBe('boolean');
      expect(typeof item.contains_shellfish).toBe('boolean');
      expect(typeof item.contains_fish).toBe('boolean');
      expect(typeof item.contains_soy).toBe('boolean');
      expect(typeof item.contains_nuts).toBe('boolean');
      expect(typeof item.contains_sesame).toBe('boolean');
      expect(typeof item.contains_msg).toBe('boolean');
      expect(typeof item.contains_peanuts).toBe('boolean');
      expect(typeof item.contains_tree_nuts).toBe('boolean');
    });
  });

  it('should have valid categories', () => {
    menuItems.forEach((item) => {
      // Allow glossary and other categories too
      expect(item.category).toBeDefined();
      expect(typeof item.category).toBe('string');
    });
  });

  it('should have valid menu values', () => {
    menuItems.forEach((item) => {
      expect(item.menu).toBeDefined();
      expect(typeof item.menu).toBe('string');
    });
  });
});

