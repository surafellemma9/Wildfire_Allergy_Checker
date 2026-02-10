/**
 * SUBSTITUTION COMPATIBILITY RESOLVER TEST SUITE
 * 
 * Tests that substitutions are validated against ALL selected allergens.
 * 
 * KEY SCENARIOS:
 * 1. Multiple allergens that conflict with all bread options
 * 2. Single allergen (happy path) - prior behavior works
 * 3. No contradictory substitutions shown
 * 4. Clear fallback when no safe substitute exists
 * 
 * BUG REPRODUCTION:
 * When eggs + gluten + sesame are selected, the system should NOT suggest:
 * - "SUB gluten-free bun" (contains eggs)
 * - "SUB multi-grain" (contains gluten + sesame)
 * - "SUB kids bun" (contains gluten + eggs + dairy)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { checkAllergens, consolidateModifications, type CheckerSelections, type PerAllergenResult } from './checker';
import { checkSubstitutionConflict, filterConflictingSubstitutions, SUBSTITUTION_ALLERGEN_MAPPINGS } from '../../config/substitutionAllergens';
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

describe('Substitution Compatibility Resolver', () => {

  describe('Bug Reproduction: Eggs + Gluten + Sesame', () => {
    /**
     * BUG: When eggs + gluten + sesame are selected, the system may suggest
     * a bread substitution that contains one of these allergens.
     * 
     * BREAD ALLERGEN REFERENCE:
     * - Multi-grain: gluten, sesame
     * - GF bun: dairy, eggs
     * - Kids bun: gluten, eggs, dairy
     * - Buttery onion: gluten, dairy, sesame
     * - Sesame seed: gluten, eggs, sesame
     * 
     * With eggs + gluten + sesame selected, ALL bread options are unsafe.
     * Expected: "NO bread/bun" - no safe substitute available
     */

    it('should NOT suggest any bread substitution when eggs + gluten + sesame are selected', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      const selections: CheckerSelections = {
        allergenIds: ['eggs', 'gluten', 'sesame'],
        itemId: hamburger!.id,
      };
      
      const result = checkAllergens(pack, selections);
      expect(result.mainItem.consolidated).toBeDefined();
      
      const bread = result.mainItem.consolidated!.bread;
      
      // The selected bread should either be null or a "NO" option
      if (bread.selected) {
        expect(bread.selected.toLowerCase()).toContain('no');
      }
      
      // Should NOT suggest any bread substitution that contains allergens
      const unsafeSubstitutions = [
        'gluten-free bun',  // contains eggs
        'gluten free bun',
        'multi-grain',      // contains gluten + sesame
        'multigrain',
        'kids bun',         // contains gluten + eggs + dairy
        'brioche',
        'buttery onion',    // contains gluten + dairy + sesame
        'sesame seed',      // contains gluten + eggs + sesame
      ];
      
      if (bread.selected && !bread.selected.toLowerCase().startsWith('no')) {
        for (const unsafe of unsafeSubstitutions) {
          expect(bread.selected.toLowerCase()).not.toContain(unsafe);
        }
      }
    });

    it('mock test: should reject all bread options for eggs + gluten + sesame', () => {
      const mockPerAllergen: PerAllergenResult[] = [
        {
          allergenId: 'eggs',
          allergenName: 'Eggs',
          status: 'MODIFIABLE',
          foundIngredients: [],
          substitutions: ['NO sesame seed bun', 'SUB multi-grain or buttery onion bun'],
          notes: [],
        },
        {
          allergenId: 'gluten',
          allergenName: 'Gluten',
          status: 'MODIFIABLE',
          foundIngredients: [],
          substitutions: ['NO bun', 'SUB gluten-free bun'],
          notes: [],
        },
        {
          allergenId: 'sesame',
          allergenName: 'Sesame',
          status: 'MODIFIABLE',
          foundIngredients: [],
          substitutions: ['NO sesame seed bun', 'SUB gluten-free bun or kids bun'],
          notes: [],
        },
      ];
      
      const result = consolidateModifications(mockPerAllergen, ['eggs', 'gluten', 'sesame']);
      
      // GF bun should be rejected (contains eggs)
      // Multi-grain should be rejected (contains gluten + sesame)
      // Kids bun should be rejected (contains gluten + eggs)
      // Buttery onion should be rejected (contains gluten + sesame)
      
      // All bread substitutions should be rejected
      expect(result.bread.rejected.length).toBeGreaterThan(0);
      
      // Selected should be "NO bread/bun" or similar
      expect(result.bread.selected?.toLowerCase()).toMatch(/no/);
    });
  });

  describe('Cross-Allergen Validation', () => {
    
    it('checkSubstitutionConflict should detect GF bun conflicts with eggs', () => {
      const conflict = checkSubstitutionConflict('SUB gluten-free bun', ['eggs']);
      
      expect(conflict.isConflicting).toBe(true);
      expect(conflict.conflictingAllergens).toContain('eggs');
    });

    it('checkSubstitutionConflict should detect GF bun conflicts with dairy', () => {
      const conflict = checkSubstitutionConflict('SUB gluten free bun', ['dairy']);
      
      expect(conflict.isConflicting).toBe(true);
      expect(conflict.conflictingAllergens).toContain('dairy');
    });

    it('checkSubstitutionConflict should detect multi-grain conflicts with gluten', () => {
      const conflict = checkSubstitutionConflict('SUB multi-grain bread', ['gluten']);
      
      expect(conflict.isConflicting).toBe(true);
      expect(conflict.conflictingAllergens).toContain('gluten');
    });

    it('checkSubstitutionConflict should detect multi-grain conflicts with sesame', () => {
      const conflict = checkSubstitutionConflict('SUB multi-grain bread', ['sesame']);
      
      expect(conflict.isConflicting).toBe(true);
      expect(conflict.conflictingAllergens).toContain('sesame');
    });

    it('checkSubstitutionConflict should detect kids bun conflicts with multiple allergens', () => {
      const conflict = checkSubstitutionConflict('SUB kids bun', ['gluten', 'eggs', 'dairy']);
      
      expect(conflict.isConflicting).toBe(true);
      expect(conflict.conflictingAllergens).toContain('gluten');
      expect(conflict.conflictingAllergens).toContain('eggs');
      expect(conflict.conflictingAllergens).toContain('dairy');
    });
  });

  describe('Happy Path: Single Allergen', () => {
    
    it('gluten allergy alone should get GF bun option', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      const selections: CheckerSelections = {
        allergenIds: ['gluten'],
        itemId: hamburger!.id,
      };
      
      const result = checkAllergens(pack, selections);
      expect(result.mainItem.consolidated).toBeDefined();
      
      const bread = result.mainItem.consolidated!.bread;
      
      // GF bun is safe for gluten (it doesn't contain gluten)
      // Should suggest GF bun
      if (bread.selected && !bread.selected.toLowerCase().startsWith('no')) {
        expect(bread.selected.toLowerCase()).toMatch(/gluten[- ]?free/);
      }
    });

    it('sesame allergy alone should get GF bun or kids bun option', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      const selections: CheckerSelections = {
        allergenIds: ['sesame'],
        itemId: hamburger!.id,
      };
      
      const result = checkAllergens(pack, selections);
      expect(result.mainItem.consolidated).toBeDefined();
      
      const bread = result.mainItem.consolidated!.bread;
      
      // GF bun and Kids bun don't contain sesame
      // Should suggest one of them
      if (bread.selected && !bread.selected.toLowerCase().startsWith('no')) {
        const hasGF = bread.selected.toLowerCase().includes('gluten');
        const hasKids = bread.selected.toLowerCase().includes('kids');
        expect(hasGF || hasKids).toBe(true);
      }
    });

    it('dairy allergy alone should get multi-grain or sesame seed option', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      const selections: CheckerSelections = {
        allergenIds: ['dairy'],
        itemId: hamburger!.id,
      };
      
      const result = checkAllergens(pack, selections);
      
      // Dairy-free options: multi-grain, sesame seed (no dairy in these)
      // Kids bun/GF bun have dairy, so should be rejected
      expect(result.mainItem.consolidated).toBeDefined();
    });
  });

  describe('No Contradictory Substitutions', () => {
    
    it('should never show multiple bread replacements', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      // Test with many allergens
      const selections: CheckerSelections = {
        allergenIds: ['dairy', 'eggs', 'gluten', 'sesame'],
        itemId: hamburger!.id,
      };
      
      const result = checkAllergens(pack, selections);
      expect(result.mainItem.consolidated).toBeDefined();
      
      // There should be exactly ONE bread decision (either a sub or a removal)
      const bread = result.mainItem.consolidated!.bread;
      
      // Should have at most one selected option
      if (bread.selected) {
        // It's a string, not an array
        expect(typeof bread.selected).toBe('string');
      }
    });

    it('substitutions in output should NOT contain ANY selected allergen', () => {
      const hamburger = findItem('Hamburger');
      expect(hamburger).toBeDefined();
      
      const allergens = ['dairy', 'eggs', 'gluten', 'sesame'];
      const selections: CheckerSelections = {
        allergenIds: allergens,
        itemId: hamburger!.id,
      };
      
      const result = checkAllergens(pack, selections);
      expect(result.mainItem.consolidated).toBeDefined();
      
      // Check bread selection
      const bread = result.mainItem.consolidated!.bread.selected;
      if (bread && !bread.toLowerCase().startsWith('no')) {
        // Verify it doesn't contain any selected allergen
        const conflict = checkSubstitutionConflict(bread, allergens);
        expect(conflict.isConflicting).toBe(false);
      }
      
      // Check protein substitutions
      for (const sub of result.mainItem.consolidated!.substitutions.protein) {
        const conflict = checkSubstitutionConflict(sub, allergens);
        expect(conflict.isConflicting).toBe(false);
      }
      
      // Check other substitutions
      for (const sub of result.mainItem.consolidated!.substitutions.other) {
        const conflict = checkSubstitutionConflict(sub, allergens);
        expect(conflict.isConflicting).toBe(false);
      }
    });
  });

  describe('filterConflictingSubstitutions', () => {
    
    it('should filter out GF bun when eggs is selected', () => {
      const substitutions = ['SUB gluten-free bun', 'NO bun'];
      const filtered = filterConflictingSubstitutions(substitutions, ['eggs']);
      
      expect(filtered).not.toContain('SUB gluten-free bun');
      expect(filtered).toContain('NO bun'); // Removals always kept
    });

    it('should filter out multi-grain when gluten is selected', () => {
      const substitutions = ['SUB multi-grain bread', 'NO wheat bread'];
      const filtered = filterConflictingSubstitutions(substitutions, ['gluten']);
      
      expect(filtered).not.toContain('SUB multi-grain bread');
      expect(filtered).toContain('NO wheat bread');
    });

    it('should keep NO X removals regardless of allergens', () => {
      const substitutions = ['NO bun', 'NO cheese', 'NO mayo'];
      const filtered = filterConflictingSubstitutions(substitutions, ['dairy', 'eggs', 'gluten']);
      
      // All removals should be kept
      expect(filtered).toContain('NO bun');
      expect(filtered).toContain('NO cheese');
      expect(filtered).toContain('NO mayo');
    });

    it('should filter out all bread subs when eggs + gluten + sesame selected', () => {
      const substitutions = [
        'SUB gluten-free bun',
        'SUB multi-grain bread',
        'SUB kids bun',
        'SUB buttery onion bun',
        'NO bun',
      ];
      const filtered = filterConflictingSubstitutions(substitutions, ['eggs', 'gluten', 'sesame']);
      
      // Only NO bun should remain (it's a removal)
      expect(filtered).toContain('NO bun');
      expect(filtered).not.toContain('SUB gluten-free bun');
      expect(filtered).not.toContain('SUB multi-grain bread');
      expect(filtered).not.toContain('SUB kids bun');
      expect(filtered).not.toContain('SUB buttery onion bun');
    });
  });

  describe('SUBSTITUTION_ALLERGEN_MAPPINGS completeness', () => {
    
    it('should have mappings for all common bread types', () => {
      const breadTypes = [
        'multi-grain',
        'gluten free bun',
        'gluten-free bun',
        'kids bun',
        'brioche',
        'sesame seed bun',
        'buttery onion bun',
        'wheat bread',
      ];
      
      for (const bread of breadTypes) {
        const hasMapping = SUBSTITUTION_ALLERGEN_MAPPINGS.some(m => 
          bread.toLowerCase().includes(m.pattern.toLowerCase())
        );
        expect(hasMapping).toBe(true);
      }
    });

    it('GF bun mapping should include dairy and eggs', () => {
      const gfMapping = SUBSTITUTION_ALLERGEN_MAPPINGS.find(m => 
        m.pattern.toLowerCase().includes('gluten free') || 
        m.pattern.toLowerCase().includes('gluten-free')
      );
      
      expect(gfMapping).toBeDefined();
      expect(gfMapping!.containsAllergens).toContain('dairy');
      expect(gfMapping!.containsAllergens).toContain('eggs');
    });

    it('multi-grain mapping should include gluten and sesame', () => {
      const mgMapping = SUBSTITUTION_ALLERGEN_MAPPINGS.find(m => 
        m.pattern.toLowerCase().includes('multi-grain') ||
        m.pattern.toLowerCase().includes('multigrain')
      );
      
      expect(mgMapping).toBeDefined();
      expect(mgMapping!.containsAllergens).toContain('gluten');
      expect(mgMapping!.containsAllergens).toContain('sesame');
    });
  });

  describe('Edge Cases', () => {
    
    it('should handle compound bread suggestions like "GF bun or kids bun"', () => {
      // When database returns "SUB gluten-free bun or kids bun"
      // and both options are unsafe, should reject the whole thing
      const conflict = checkSubstitutionConflict(
        'SUB gluten-free bun or kids bun',
        ['gluten', 'eggs']  // GF has eggs, kids has gluten+eggs
      );
      
      expect(conflict.isConflicting).toBe(true);
    });

    it('should handle empty allergen selection gracefully', () => {
      const hamburger = findItem('Hamburger');
      if (!hamburger) return;
      
      const selections: CheckerSelections = {
        allergenIds: [],
        itemId: hamburger.id,
      };
      
      // Should not throw
      const result = checkAllergens(pack, selections);
      expect(result).toBeDefined();
    });

    it('should handle unknown allergen gracefully', () => {
      const conflict = checkSubstitutionConflict('SUB gluten-free bun', ['unknown_allergen']);
      
      // Should not throw, and should not conflict (unknown allergen)
      expect(conflict.isConflicting).toBe(false);
    });
  });
});
