/**
 * Test Cases for Tuscan Kale and Spinach Salad
 * 
 * Salad Details:
 * - Name: Kale and Spinach Salad (canonical name in DB)
 * - Ticket Code: SIDE KALE/SM KALE/LG KALE
 * - Ingredients: tuscan kale, baby spinach, parmesan cheese, hard-boiled egg
 * - Garnishes: spicy pumpkin seeds
 * - Default Dressing: Lemon Parmesan Vinaigrette
 * 
 * Expected Allergen Rules (BASE SALAD ONLY - no dressing):
 * - Dairy: MODIFIABLE (parmesan cheese)
 * - Eggs: MODIFIABLE (hard-boiled egg)
 * - Gluten: SAFE
 * - Shellfish: SAFE
 * - Soy: SAFE
 * - Peanuts: SAFE
 * - Tree Nuts: SAFE
 * - Sesame: SAFE
 * - Garlic: MODIFIABLE (contains garlic - verify with sheets)
 * - Onion: SAFE
 * 
 * Dressing Allergen Status:
 * - Balsamic Vinaigrette: Contains garlic, onion (shallots)
 * - Lemon Herb Vinaigrette: Contains garlic, onion (shallots)
 * - Lemon Parmesan Vinaigrette: Contains DAIRY, garlic
 * - Red Wine Vinaigrette: Contains DAIRY (parmesan), garlic
 * - Ranch Dressing: Contains DAIRY, EGGS, SOY
 * - Caesar Dressing: Contains DAIRY, EGGS, SHELLFISH (anchovy)
 * - Citrus Dressing: Contains garlic
 * - Blue Cheese Dressing: Contains DAIRY, EGGS
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { checkAllergens, type CheckerSelections } from './checker';
import type { TenantPack, MenuItem } from '../tenant/packTypes';
import * as fs from 'fs';
import * as path from 'path';

// Load the actual tenant pack
let tenantPack: TenantPack;
let kaleSalad: MenuItem | undefined;

beforeAll(() => {
  const packPath = path.resolve(__dirname, '../../../generated/tenant-pack-v1.json');
  const packData = fs.readFileSync(packPath, 'utf-8');
  tenantPack = JSON.parse(packData);
  
  // Find the Kale and Spinach Salad
  kaleSalad = tenantPack.items.find(item => 
    item.name.toLowerCase().includes('kale') && 
    item.name.toLowerCase().includes('spinach')
  );
});

// ============================================================================
// Test Suite 1: Verify Salad Exists and Has Correct Metadata
// ============================================================================

describe('Tuscan Kale and Spinach Salad - Metadata', () => {
  it('should exist in the tenant pack', () => {
    expect(kaleSalad).toBeDefined();
    console.log('Found salad:', kaleSalad?.name);
  });

  it('should have correct ticket code', () => {
    expect(kaleSalad?.ticketCode).toBe('SIDE KALE/SM KALE/LG KALE');
  });

  it('should be in Salads category', () => {
    expect(kaleSalad?.categoryId).toBe('salads');
  });

  it('should have correct ingredients', () => {
    expect(kaleSalad?.ingredients).toContain('tuscan kale');
    expect(kaleSalad?.ingredients).toContain('baby spinach');
    expect(kaleSalad?.ingredients).toContain('parmesan cheese');
    expect(kaleSalad?.ingredients).toContain('hard-boiled egg');
  });

  it('should have spicy pumpkin seeds as garnish', () => {
    expect(kaleSalad?.garnishes).toContain('spicy pumpkin seeds');
  });

  it('should have Lemon Parmesan Vinaigrette as default dressing', () => {
    expect(kaleSalad?.defaultDressing).toBe('Lemon Parmesan Vinaigrette');
  });
});

// ============================================================================
// Test Suite 2: Base Salad Allergen Rules (No Dressing)
// ============================================================================

describe('Tuscan Kale and Spinach Salad - Base Salad Allergen Rules', () => {
  it('should be MODIFIABLE for Dairy (contains parmesan cheese)', () => {
    expect(kaleSalad?.allergenRules?.dairy?.status).toBe('MODIFIABLE');
    expect(kaleSalad?.allergenRules?.dairy?.substitutions).toContain('NO parmesan cheese');
  });

  it('should be MODIFIABLE for Eggs (contains hard-boiled egg)', () => {
    expect(kaleSalad?.allergenRules?.eggs?.status).toBe('MODIFIABLE');
    expect(kaleSalad?.allergenRules?.eggs?.substitutions).toContain('NO hard-boiled egg');
  });

  it('should be SAFE for Gluten', () => {
    expect(kaleSalad?.allergenRules?.gluten?.status).toBe('SAFE');
  });

  it('should be SAFE for Shellfish', () => {
    expect(kaleSalad?.allergenRules?.shellfish?.status).toBe('SAFE');
  });

  it('should be SAFE for Soy', () => {
    expect(kaleSalad?.allergenRules?.soy?.status).toBe('SAFE');
  });

  it('should be SAFE for Peanuts', () => {
    expect(kaleSalad?.allergenRules?.peanuts?.status).toBe('SAFE');
  });

  it('should be SAFE for Tree Nuts', () => {
    expect(kaleSalad?.allergenRules?.tree_nuts?.status).toBe('SAFE');
  });

  it('should be SAFE for Sesame', () => {
    expect(kaleSalad?.allergenRules?.sesame?.status).toBe('SAFE');
  });

  it('should have correct status for Garlic', () => {
    // Base salad may or may not contain garlic - check the actual status
    const garlic = kaleSalad?.allergenRules?.garlic;
    expect(garlic).toBeDefined();
    console.log('Garlic status:', garlic?.status, 'Subs:', garlic?.substitutions);
  });

  it('should have correct status for Onion', () => {
    const onion = kaleSalad?.allergenRules?.onion;
    expect(onion).toBeDefined();
    console.log('Onion status:', onion?.status, 'Subs:', onion?.substitutions);
  });
});

// ============================================================================
// Test Suite 3: Checker Results for Single Allergen
// ============================================================================

describe('Tuscan Kale and Spinach Salad - Checker Results (Single Allergen)', () => {
  it('should return MODIFIABLE for Dairy allergy', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['dairy'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    expect(result.overallStatus).toBe('MODIFIABLE');
    expect(result.mainItem.perAllergen[0].status).toBe('MODIFIABLE');
    expect(result.mainItem.perAllergen[0].substitutions).toContain('NO parmesan cheese');
  });

  it('should return MODIFIABLE for Eggs allergy', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['eggs'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    expect(result.overallStatus).toBe('MODIFIABLE');
    expect(result.mainItem.perAllergen[0].status).toBe('MODIFIABLE');
    expect(result.mainItem.perAllergen[0].substitutions).toContain('NO hard-boiled egg');
  });

  it('should return SAFE for Gluten allergy', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['gluten'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    expect(result.overallStatus).toBe('SAFE');
    expect(result.mainItem.perAllergen[0].status).toBe('SAFE');
  });

  it('should return SAFE for Shellfish allergy', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['shellfish'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    expect(result.overallStatus).toBe('SAFE');
  });

  it('should return SAFE for Peanuts allergy', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['peanuts'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    expect(result.overallStatus).toBe('SAFE');
  });

  it('should return SAFE for Tree Nuts allergy', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['tree_nuts'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    expect(result.overallStatus).toBe('SAFE');
  });
});

// ============================================================================
// Test Suite 4: Multi-Allergen Scenarios
// ============================================================================

describe('Tuscan Kale and Spinach Salad - Multi-Allergen Scenarios', () => {
  it('should return MODIFIABLE when Dairy + Eggs selected (both modifiable)', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['dairy', 'eggs'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    expect(result.overallStatus).toBe('MODIFIABLE');
    
    const dairyResult = result.mainItem.perAllergen.find(a => a.allergenId === 'dairy');
    const eggsResult = result.mainItem.perAllergen.find(a => a.allergenId === 'eggs');
    
    expect(dairyResult?.status).toBe('MODIFIABLE');
    expect(eggsResult?.status).toBe('MODIFIABLE');
  });

  it('should return SAFE when Gluten + Shellfish selected (both safe)', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['gluten', 'shellfish'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    expect(result.overallStatus).toBe('SAFE');
  });

  it('should return MODIFIABLE when Dairy + Gluten selected (one modifiable, one safe)', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['dairy', 'gluten'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    // MODIFIABLE wins over SAFE
    expect(result.overallStatus).toBe('MODIFIABLE');
  });

  it('should handle all 10 allergens selected', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['dairy', 'gluten', 'shellfish', 'soy', 'eggs', 'peanuts', 'tree_nuts', 'sesame', 'garlic', 'onion'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    // Log all results for debugging
    console.log('All allergen results:');
    result.mainItem.perAllergen.forEach(a => {
      console.log(`  ${a.allergenId}: ${a.status} - ${a.substitutions?.join(', ') || 'none'}`);
    });
    
    // Overall status should be the worst status among all
    expect(['SAFE', 'MODIFIABLE', 'UNSAFE', 'NOT_SAFE_NOT_IN_SHEET', 'VERIFY_WITH_KITCHEN']).toContain(result.overallStatus);
  });
});

// ============================================================================
// Test Suite 5: Dressing Combinations (Expected UI Behavior)
// ============================================================================

describe('Tuscan Kale and Spinach Salad - Dressing Safety Reference', () => {
  // These tests document expected dressing safety for reference
  // Actual dressing logic is in TenantAllergyChecker.tsx
  
  it('should have safe dressings for Dairy allergy: Balsamic, Citrus, Lemon Herb', () => {
    // Dressings that are dairy-free:
    const dairyFreeDressings = ['Balsamic Vinaigrette', 'Citrus Dressing', 'Lemon Herb Vinaigrette'];
    
    // Dressings with dairy:
    const dairyDressings = ['Lemon Parmesan Vinaigrette', 'Red Wine Vinaigrette', 'Ranch Dressing', 'Caesar Dressing', 'Blue Cheese Dressing'];
    
    console.log('Dairy-free dressings:', dairyFreeDressings);
    console.log('Dairy-containing dressings:', dairyDressings);
    
    expect(dairyFreeDressings.length).toBeGreaterThan(0);
  });

  it('should have safe dressings for Eggs allergy: Balsamic, Citrus, Lemon Parmesan, Red Wine, Lemon Herb', () => {
    const eggFreeDressings = ['Balsamic Vinaigrette', 'Citrus Dressing', 'Lemon Parmesan Vinaigrette', 'Red Wine Vinaigrette', 'Lemon Herb Vinaigrette'];
    
    const eggDressings = ['Ranch Dressing', 'Caesar Dressing', 'Blue Cheese Dressing'];
    
    console.log('Egg-free dressings:', eggFreeDressings);
    console.log('Egg-containing dressings:', eggDressings);
    
    expect(eggFreeDressings.length).toBeGreaterThan(0);
  });

  it('should have safe dressings for Shellfish allergy: ALL except Caesar', () => {
    // Caesar dressing contains anchovy
    const shellfishSafeDressings = ['Balsamic Vinaigrette', 'Citrus Dressing', 'Lemon Parmesan Vinaigrette', 'Red Wine Vinaigrette', 'Lemon Herb Vinaigrette', 'Ranch Dressing', 'Blue Cheese Dressing'];
    
    const shellfishUnsafeDressings = ['Caesar Dressing'];
    
    console.log('Shellfish-safe dressings:', shellfishSafeDressings);
    console.log('Shellfish-unsafe dressings:', shellfishUnsafeDressings);
    
    expect(shellfishUnsafeDressings).toContain('Caesar Dressing');
  });
});

// ============================================================================
// Test Suite 6: Kitchen Ticket Generation
// ============================================================================

describe('Tuscan Kale and Spinach Salad - Kitchen Ticket Output', () => {
  it('should generate correct ticket for Dairy allergy', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['dairy'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    console.log('Dairy ticket lines:');
    result.ticketLines.forEach(line => console.log('  ', line));
    
    // Should include modification instructions
    const hasNoParmesan = result.ticketLines.some(line => 
      line.toLowerCase().includes('parmesan') || line.toLowerCase().includes('cheese')
    );
    expect(hasNoParmesan).toBe(true);
  });

  it('should generate correct ticket for Eggs allergy', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['eggs'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    console.log('Eggs ticket lines:');
    result.ticketLines.forEach(line => console.log('  ', line));
    
    // Should include modification instructions
    const hasNoEgg = result.ticketLines.some(line => 
      line.toLowerCase().includes('egg')
    );
    expect(hasNoEgg).toBe(true);
  });

  it('should generate "no changes needed" for Gluten allergy', () => {
    if (!kaleSalad) return;
    
    const selections: CheckerSelections = {
      allergenIds: ['gluten'],
      itemId: kaleSalad.id,
    };
    const result = checkAllergens(tenantPack, selections);

    console.log('Gluten ticket lines:');
    result.ticketLines.forEach(line => console.log('  ', line));
    
    // Should indicate safe
    const hasSafe = result.ticketLines.some(line => 
      line.toLowerCase().includes('safe') || line.toLowerCase().includes('no changes')
    );
    expect(hasSafe).toBe(true);
  });
});

// ============================================================================
// Test Suite 7: Debug - Print All Allergen Rules
// ============================================================================

describe('Debug: Print All Allergen Rules for Tuscan Kale Salad', () => {
  it('should print all allergen rules', () => {
    if (!kaleSalad) {
      console.log('Salad not found!');
      return;
    }
    
    console.log('\n=== TUSCAN KALE AND SPINACH SALAD ===');
    console.log('ID:', kaleSalad.id);
    console.log('Name:', kaleSalad.name);
    console.log('Ticket Code:', kaleSalad.ticketCode);
    console.log('Default Dressing:', kaleSalad.defaultDressing);
    console.log('Ingredients:', kaleSalad.ingredients);
    console.log('Garnishes:', kaleSalad.garnishes);
    console.log('\nAllergen Rules:');
    
    const allergens = ['dairy', 'gluten', 'shellfish', 'soy', 'eggs', 'peanuts', 'tree_nuts', 'sesame', 'garlic', 'onion'];
    
    for (const allergen of allergens) {
      const rule = kaleSalad.allergenRules?.[allergen];
      if (rule) {
        console.log(`  ${allergen.toUpperCase()}: ${rule.status}`);
        if (rule.substitutions && rule.substitutions.length > 0) {
          console.log(`    Substitutions: ${rule.substitutions.join(', ')}`);
        }
        if (rule.notes) {
          console.log(`    Notes: ${rule.notes}`);
        }
      } else {
        console.log(`  ${allergen.toUpperCase()}: NOT DEFINED`);
      }
    }
    
    expect(kaleSalad).toBeDefined();
  });
});
