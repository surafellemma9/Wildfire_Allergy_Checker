# Substitution Compatibility Resolver - Design Document

## Pipeline Trace

### Input
- **Selected Allergies**: e.g., `['eggs', 'gluten', 'sesame']`
- **Dish**: e.g., Hamburger with sesame seed bun

### Processing Stages

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. ALLERGEN DETECTION (per-allergen)                                        │
│    checkItem() → evaluateDishForAllergen() for each allergen                │
│    Output: PerAllergenResult[] with raw substitutions                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. PER-ALLERGEN FILTERING                                                   │
│    filterConflictingSubstitutions() checks each substitution against        │
│    ALL selected allergens (not just the current one)                        │
│    Output: Filtered substitutions per allergen                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. CONSOLIDATION PIPELINE                                                   │
│    consolidateModifications() collects ALL modifications across allergens   │
│    Step 3a: categorizeAllModifications() - groups by component type         │
│    Step 3b: resolveBreadOption() - picks SINGLE best bread option           │
│    Step 3c: Cross-validates ALL substitutions against ALL allergens         │
│    Output: ConsolidatedModifications with grouped, validated results        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. UI RENDERING                                                             │
│    TenantAllergyChecker.tsx → PreparationNotes component                    │
│    Renders: Bread (single), Removals (grouped), Substitutions, Preparation  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Where Bread/Bun Substitutions Are Produced

1. **Database**: `allergen_modifications` table has rules like:
   - Gluten: "NO bun, SUB gluten-free bun"
   - Sesame: "NO sesame seed bun, SUB gluten-free bun or kids bun"
   - Eggs: "NO sesame seed bun, SUB multi-grain or buttery onion bun"

2. **Per-Allergen Filtering** (`substitutionAllergens.ts`):
   - `checkSubstitutionConflict()` uses `SUBSTITUTION_ALLERGEN_MAPPINGS`
   - Bread allergen mappings:
     - Multi-grain: gluten, sesame
     - GF bun: dairy, eggs
     - Kids bun: gluten, eggs, dairy
     - Buttery onion: gluten, dairy, sesame
     - Sesame seed: gluten, eggs, sesame

3. **Bread Resolution** (`checker.ts:resolveBreadOption()`):
   - Collects all bread removals and substitutions
   - Validates each substitution against ALL selected allergens
   - Picks single best option (prefers GF bun, falls back to NO bread)

## The Bug

When multiple allergens are selected (e.g., eggs + gluten + sesame), the system could:
1. Show contradictory bread options from different allergens
2. Suggest a substitution that violates another selected allergen

### Example Bug Scenario

**Selection**: Hamburger + [eggs, gluten, sesame]

**Raw substitutions from database**:
- Gluten: "SUB gluten-free bun" (but GF has eggs!)
- Sesame: "SUB gluten-free bun or kids bun" (GF has eggs, kids has gluten+eggs!)
- Eggs: "SUB multi-grain or buttery onion bun" (multi-grain has gluten+sesame!)

**Expected behavior**: 
- ALL bread substitutions should be rejected
- Output: "NO bread/bun - no safe substitute available"

**Previous bug behavior**:
- Could show "SUB gluten-free bun" (violates eggs)
- Or show "SUB multi-grain" (violates gluten AND sesame)

## The Fix

The fix is in `resolveBreadOption()`:

1. **Cross-validate ALL substitutions** against ALL selected allergens
2. **Track rejected options** with clear reasons
3. **Derive fallback** when all options are unsafe:
   - If bread removals exist AND all substitutions rejected → "NO bread/bun"
   - If specific bread removal exists → "NO bread/bun (or ask for alternative)"

## Acceptance Criteria

- [ ] No suggested replacement is unsafe for ANY selected allergen
- [ ] No mutually-exclusive replacement instructions for bread/bun
- [ ] Single bread output (either safe substitution OR "NO bread")
- [ ] Clear reasons shown for rejected options
- [ ] Works for ANY dish, ANY allergen combination
