# Fish-Only VERIFY Constraint

## Why VERIFY WITH THE KITCHEN Exists Only for Fish

### Executive Summary

In this allergy checking system, the `VERIFY_WITH_KITCHEN` status is **ONLY** allowed for the Fish allergen. All other allergens (Dairy, Gluten, Shellfish, Eggs, Soy, Peanuts, Tree Nuts, Sesame, Onion, Garlic) **MUST** have deterministic states:
- **SAFE**: No modifications needed
- **MODIFIABLE**: Can be made safe with explicit modifications from allergy sheet
- **UNSAFE**: Cannot be made safe
- **NOT_SAFE_NOT_IN_SHEET**: Dish not reviewed for this allergen (safest default)

Any attempt to use `VERIFY_WITH_KITCHEN` for non-fish allergens will be automatically converted to `NOT_SAFE_NOT_IN_SHEET` by the system.

---

## Business Rationale

### Why Fish is Special

**Fish preparation varies daily** due to:
1. **Fresh Catch Variability**: Daily catches change based on availability, season, and supplier
2. **Cooking Method Flexibility**: Grilling, pan-searing, baking methods may vary by chef preference or kitchen capacity
3. **Cross-Contamination Risk**: Fish preparation areas may handle multiple species with varying allergen profiles
4. **Recipe Adaptation**: Sauces and accompaniments may be modified based on daily specials

**Example**: A "Fresh Catch of the Day" might be salmon on Monday (safe with modifications), but swordfish on Tuesday (requires different handling). The kitchen staff must verify the specific fish and preparation method before serving.

### Why Other Allergens Are Deterministic

For all non-fish allergens, recipes and ingredients are **stable and knowable in advance**:

1. **Dairy**: Ingredient lists include explicit dairy products (cheese, milk, butter, cream)
   - ✅ Can create explicit rules: "NO cheese" or "SUB dairy-free butter"
   - ❌ No daily variability in dairy ingredients

2. **Gluten**: Breads, pasta, flour are consistent menu items
   - ✅ Can create explicit rules: "GF bread" or "NO croutons"
   - ❌ No reason to defer decision to kitchen

3. **Shellfish**: Menu items using shrimp, crab, scallops are pre-planned
   - ✅ Can create explicit rules: "NO shrimp" or "UNSAFE - contains shellfish stock"
   - ❌ Shellfish doesn't vary daily like fresh fish

4. **Eggs, Soy, Nuts, Sesame**: All ingredient-based allergens with stable recipes
   - ✅ Can be reviewed during allergy sheet creation
   - ❌ No valid reason to require kitchen verification at service time

---

## System Architecture

### Enforcement Points

The Fish-only constraint is enforced at **three levels**:

#### 1. **Pack Generation** (`scripts/generatePackFromSupabase.ts`)
```typescript
// Line 267-285
if (mod.requires_verification) {
  if (allergen.id === 'fish') {
    status = 'VERIFY_WITH_KITCHEN';  // Fish is the ONLY allergen allowed
  } else {
    // NON-FISH allergen requiring verification = NOT SAFE
    status = 'NOT_SAFE_NOT_IN_SHEET';
  }
}
```

**Rationale**: Prevent invalid VERIFY statuses from entering the data pack in the first place.

#### 2. **Runtime Checker** (`src/core/checker/checker.ts`)
```typescript
// evaluateDishForAllergen() - Line 227-241
if (rule.status === 'VERIFY_WITH_KITCHEN' && allergenId !== 'fish') {
  return 'NOT_SAFE_NOT_IN_SHEET';
}
```

**Rationale**: Defense-in-depth. Even if bad data enters the system (manual JSON editing, legacy data), the checker will convert it to NOT_SAFE.

#### 3. **Comprehensive Tests** (`src/core/checker/checker.test.ts`)
```typescript
// Test Suite 6: Fish-Only VERIFY Constraint
describe('Fish-Only VERIFY Constraint', () => {
  it('should ALLOW VERIFY_WITH_KITCHEN status for Fish allergen', ...)
  it('should REJECT VERIFY_WITH_KITCHEN for Dairy allergen', ...)
  it('should REJECT VERIFY_WITH_KITCHEN for Gluten allergen', ...)
  // ... tests for all allergens
});
```

**Rationale**: Regression protection. Any code change that breaks the constraint will fail CI.

---

## Safety Implications

### What Happens When Non-Fish Allergen Has VERIFY

**OLD BEHAVIOR (DANGEROUS)**:
```
User selects: Dairy allergy
Dish: "Complex Prepared Item"
Status: VERIFY_WITH_KITCHEN
Kitchen Ticket: "⚠️ VERIFY WITH THE KITCHEN"
```
❌ **Problem**: Kitchen staff doesn't know what to verify, dish may contain dairy

**NEW BEHAVIOR (SAFE)**:
```
User selects: Dairy allergy
Dish: "Complex Prepared Item"
Status: NOT_SAFE_NOT_IN_SHEET (auto-converted)
Kitchen Ticket: "🚫 NOT SAFE — NOT IN ALLERGY SHEET"
```
✅ **Result**: Dish is blocked from service, guest is protected

### Safety-First Status Priority

When multiple allergens are selected, the system uses **worst-status-wins** logic:

```
Priority (most restrictive to least):
1. NOT_SAFE_NOT_IN_SHEET (missing from allergy sheet)
2. UNSAFE (explicitly cannot be made safe)
3. VERIFY_WITH_KITCHEN (Fish only - requires manual confirmation)
4. MODIFIABLE (can be made safe with modifications)
5. SAFE (no changes needed)
```

**Example**:
```
User selects: Fish + Dairy
Dish A: Fish = VERIFY, Dairy = SAFE → Overall: VERIFY (allowed)
Dish B: Fish = VERIFY, Dairy = MISSING → Overall: NOT_SAFE (most restrictive wins)
Dish C: Fish = SAFE, Dairy = VERIFY → Overall: NOT_SAFE (dairy VERIFY converted)
```

---

## How to Extend Allergy Sheets Safely

### For Fish Allergen (VERIFY Allowed)

If a fish dish requires verification, set the flag in the database:

```sql
UPDATE allergen_modifications
SET requires_verification = true
WHERE dish_name = 'Daily Fresh Catch'
  AND allergen = 'fish'
  AND tenant_id = 'your-tenant-id';
```

This will generate a pack with:
```json
{
  "allergenRules": {
    "fish": {
      "status": "VERIFY_WITH_KITCHEN",
      "notes": "Preparation varies by daily catch",
      "requiresVerification": true
    }
  }
}
```

Kitchen ticket will show:
```
⚠️  VERIFY WITH THE KITCHEN
Manual confirmation required before serving
• Fish: Preparation varies by daily catch
```

### For Non-Fish Allergens (VERIFY Not Allowed)

You **MUST** provide deterministic rules. If you don't know if a dish is safe:

❌ **WRONG** (will be rejected by system):
```sql
UPDATE allergen_modifications
SET requires_verification = true
WHERE dish_name = 'Caesar Salad'
  AND allergen = 'dairy';  -- Non-fish allergen
```

✅ **CORRECT** - Option 1 (Dish is unsafe):
```sql
UPDATE allergen_modifications
SET status = 'not_modifiable',
    notes = 'Contains dairy - cannot be modified'
WHERE dish_name = 'Caesar Salad'
  AND allergen = 'dairy';
```

✅ **CORRECT** - Option 2 (Dish can be modified):
```sql
UPDATE allergen_modifications
SET status = 'modifiable',
    modifications = ARRAY['NO parmesan', 'NO Caesar dressing', 'SUB oil and vinegar']
WHERE dish_name = 'Caesar Salad'
  AND allergen = 'dairy';
```

✅ **CORRECT** - Option 3 (Dish is safe as-is):
```sql
UPDATE allergen_modifications
SET status = 'safe',
    notes = 'No dairy ingredients'
WHERE dish_name = 'Caesar Salad'
  AND allergen = 'dairy';
```

### If You Genuinely Don't Know

If you **genuinely cannot determine** if a dish is safe for a non-fish allergen:

1. **DO NOT** add a rule to the `allergen_modifications` table
2. The system will automatically mark it as `NOT_SAFE_NOT_IN_SHEET`
3. Research the dish's ingredients and update the allergy sheet before serving
4. **Never serve a dish without complete allergen information**

---

## Testing the Constraint

### Run Tests
```bash
npm test -- src/core/checker/checker.test.ts
```

### Key Test Cases

1. **Fish can use VERIFY**:
   ```typescript
   expect(evaluateDishForAllergen(fishDish, 'fish')).toBe('VERIFY_WITH_KITCHEN');
   ```

2. **Non-fish cannot use VERIFY**:
   ```typescript
   expect(evaluateDishForAllergen(dairyDish, 'dairy')).toBe('NOT_SAFE_NOT_IN_SHEET');
   ```

3. **Regression test** (proves old behavior changed):
   ```typescript
   // Dish that previously would have shown VERIFY for dairy
   expect(result.overallStatus).toBe('NOT_SAFE_NOT_IN_SHEET');
   ```

---

## Database Schema Reference

### Table: `allergen_modifications`

```sql
CREATE TABLE allergen_modifications (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  menu_item_id UUID REFERENCES menu_items(id),  -- ID-based link (not string matching)
  dish_name TEXT,
  category TEXT,
  allergen TEXT,
  status TEXT CHECK (status IN ('safe', 'modifiable', 'not_modifiable')),
  modifications TEXT[],
  notes TEXT,
  requires_verification BOOLEAN DEFAULT FALSE  -- Only used for 'fish' allergen
);
```

### Constraint Validation

The system does **NOT** enforce the Fish-only constraint at the database level (no CHECK constraint). This allows flexibility for data entry and migration. Instead, the constraint is enforced at:
- Pack generation time (converts invalid VERIFY to NOT_SAFE)
- Runtime evaluation (double-checks and converts)
- Test time (prevents regression)

---

## Migration Guide

If you have existing data with `requires_verification=true` for non-fish allergens:

### Step 1: Identify Affected Records
```sql
SELECT id, dish_name, allergen, status, notes
FROM allergen_modifications
WHERE requires_verification = true
  AND allergen != 'fish';
```

### Step 2: Update Each Record

For each record, decide:
- If dish is **unsafe**: Set `status = 'not_modifiable'`
- If dish is **modifiable**: Set `status = 'modifiable'` and add explicit modifications
- If dish is **safe**: Set `status = 'safe'`
- If **unknown**: Delete the record (will become NOT_SAFE_NOT_IN_SHEET)

```sql
-- Example: Convert VERIFY to deterministic status
UPDATE allergen_modifications
SET requires_verification = false,
    status = 'modifiable',
    modifications = ARRAY['NO butter', 'SUB olive oil']
WHERE id = 'record-id';
```

### Step 3: Regenerate Pack
```bash
SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx TENANT_ID=xxx \
  npx tsx scripts/generatePackFromSupabase.ts
```

### Step 4: Verify
```bash
npm test -- src/core/checker/checker.test.ts
```

---

## Troubleshooting

### Issue: "Why is my dish showing NOT_SAFE when I marked it as VERIFY?"

**Cause**: You attempted to use VERIFY for a non-fish allergen.

**Solution**: Update the allergen rule with a deterministic status:
1. Review the dish ingredients
2. Determine if it's SAFE, MODIFIABLE, or UNSAFE
3. Update the database with explicit rules
4. Regenerate the pack

### Issue: "Can I disable this constraint temporarily?"

**Answer**: **NO**. This is a critical safety feature. Disabling it would:
- Violate the product requirement (Fish-only VERIFY)
- Create ambiguous kitchen tickets
- Risk serving allergens to sensitive guests
- Fail CI tests

If you need flexibility, use the `NOT_SAFE_NOT_IN_SHEET` status (safest default) until you can research and add proper rules.

---

## Summary

| Allergen | VERIFY Allowed? | Rationale |
|----------|----------------|-----------|
| Fish | ✅ YES | Daily variability in catch and preparation |
| Dairy | ❌ NO | Deterministic ingredients |
| Gluten | ❌ NO | Deterministic ingredients |
| Shellfish | ❌ NO | Pre-planned menu items (not daily variable like fish) |
| Eggs | ❌ NO | Deterministic ingredients |
| Soy | ❌ NO | Deterministic ingredients |
| Peanuts | ❌ NO | Deterministic ingredients |
| Tree Nuts | ❌ NO | Deterministic ingredients |
| Sesame | ❌ NO | Deterministic ingredients |
| Onion | ❌ NO | Deterministic ingredients |
| Garlic | ❌ NO | Deterministic ingredients |
| MSG | ❌ NO | Deterministic ingredients |
| Tomato | ❌ NO | Deterministic ingredients |
| Seed | ❌ NO | Deterministic ingredients |

**Key Principle**: If you can know the answer in advance (by reviewing recipes), you MUST provide a deterministic rule. VERIFY is only for situations where the answer cannot be known until service time (Fish only).
