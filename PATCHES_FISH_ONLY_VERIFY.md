# Code Patches: Fish-Only VERIFY Constraint Implementation

This document contains all code changes made to implement the Fish-only VERIFY constraint.

---

## PATCH 1: Core Checker Logic
**File**: `src/core/checker/checker.ts`
**Lines**: 227-241
**Purpose**: Enforce Fish-only VERIFY constraint at runtime

```diff
 /**
  * CORE SAFETY FUNCTION: Evaluate a dish for a specific allergen
  *
  * Returns exactly one of:
  * - SAFE: No modifications needed
  * - MODIFIABLE: Can be made safe with explicit modifications from allergy sheet
- * - VERIFY_WITH_KITCHEN: Requires manual kitchen verification
+ * - VERIFY_WITH_KITCHEN: Requires manual kitchen verification (FISH ONLY)
  * - NOT_SAFE_NOT_IN_SHEET: Not present in allergy sheet for this allergen
  * - UNSAFE: Cannot be made safe
  *
  * BUSINESS RULES:
  * 1. If dish not in allergen's sheet → NOT_SAFE_NOT_IN_SHEET
- * 2. If requires_verification flag set → VERIFY_WITH_KITCHEN
- * 3. Otherwise, use status from allergy sheet
- * 4. No inference across allergens allowed
+ * 2. VERIFY_WITH_KITCHEN is ONLY allowed for Fish allergen
+ *    - For non-fish allergens, VERIFY status is converted to NOT_SAFE_NOT_IN_SHEET
+ *    - Rationale: Fish preparation varies daily (fresh catch, cooking methods)
+ *    - All other allergens must have deterministic SAFE/MODIFIABLE/UNSAFE rules
+ * 3. Otherwise, use status from allergy sheet
+ * 4. No inference across allergens allowed
  */
 export function evaluateDishForAllergen(
   dish: MenuItem,
   allergenId: string
 ): RuleStatus {
   const rule = dish.allergenRules[allergenId];

   // RULE 1: Not in allergy sheet = NOT SAFE
   if (!rule) {
     return 'NOT_SAFE_NOT_IN_SHEET';
   }

-  // RULE 2: Return the status from the allergy sheet
-  // (verification flag already baked into status during pack generation)
+  // RULE 2: VERIFY_WITH_KITCHEN is ONLY allowed for Fish allergen
+  // For all other allergens, VERIFY must be converted to NOT_SAFE (safety-first)
+  if (rule.status === 'VERIFY_WITH_KITCHEN' && allergenId !== 'fish') {
+    return 'NOT_SAFE_NOT_IN_SHEET';
+  }
+
+  // RULE 3: Return the status from the allergy sheet
   return rule.status;
 }
```

**Impact**:
- Runtime enforcement of Fish-only constraint
- Non-fish VERIFY automatically converted to NOT_SAFE_NOT_IN_SHEET
- Defense-in-depth protection against bad data

---

## PATCH 2: Pack Generation Logic
**File**: `scripts/generatePackFromSupabase.ts`
**Lines**: 267-295
**Purpose**: Enforce Fish-only VERIFY constraint at data creation time

```diff
       if (mod) {
         // We have a linked rule for this allergen in the allergy sheet
         let status: string;

-        // SAFETY-FIRST RULE: Check verification flag first
+        // CRITICAL BUSINESS RULE: VERIFY_WITH_KITCHEN is ONLY allowed for Fish allergen
+        // For all other allergens, verification requirements are converted to NOT_SAFE
+        // Rationale: Fish varies daily (fresh catch, preparation), all other allergens must be deterministic
         if (mod.requires_verification) {
-          status = 'VERIFY_WITH_KITCHEN';
+          if (allergen.id === 'fish') {
+            status = 'VERIFY_WITH_KITCHEN';  // Fish is the ONLY allergen allowed to use VERIFY
+          } else {
+            // NON-FISH allergen requiring verification = NOT SAFE (cannot serve without deterministic rules)
+            status = 'NOT_SAFE_NOT_IN_SHEET';
+          }
         } else {
           // Apply standard status mapping
           switch (mod.status) {
             case 'safe':
               status = 'SAFE';
               break;
             case 'modifiable':
               status = 'MODIFIABLE';
               break;
             case 'not_modifiable':
               status = 'UNSAFE';
               break;
             default:
-              status = 'VERIFY_WITH_KITCHEN';  // Unknown DB status = verify
+              // Unknown DB status: only allow VERIFY for fish, otherwise NOT SAFE
+              status = (allergen.id === 'fish') ? 'VERIFY_WITH_KITCHEN' : 'NOT_SAFE_NOT_IN_SHEET';
           }
         }
```

**Impact**:
- Pack generation enforces constraint at data creation time
- Database records with `requires_verification=true` for non-fish allergens → NOT_SAFE_NOT_IN_SHEET
- Prevents invalid VERIFY statuses from entering JSON pack

---

## PATCH 3: Pack Validator (Legacy Status Migration)
**File**: `src/core/tenant/packValidator.ts`
**Lines**: 23-34, 122-134
**Purpose**: Migrate legacy status names to canonical format

```diff
 const STATUS_MAP: Record<string, RuleStatus> = {
-  // New format (correct)
+  // Canonical format (correct)
   'SAFE': 'SAFE',
-  'MODIFY': 'MODIFY',
-  'UNSAFE': 'UNSAFE',
-  'UNKNOWN': 'UNKNOWN',
-  // Legacy format (lowercase)
+  'MODIFIABLE': 'MODIFIABLE',
+  'VERIFY_WITH_KITCHEN': 'VERIFY_WITH_KITCHEN',
+  'NOT_SAFE_NOT_IN_SHEET': 'NOT_SAFE_NOT_IN_SHEET',
+  'UNSAFE': 'UNSAFE',
+
+  // Legacy format mappings
   'safe': 'SAFE',
-  'modifiable': 'MODIFY',
+  'modifiable': 'MODIFIABLE',
   'not_modifiable': 'UNSAFE',
-  'unknown': 'UNKNOWN',
+  'unknown': 'NOT_SAFE_NOT_IN_SHEET',
+
+  // Old incorrect formats (migrate to canonical)
+  'MODIFY': 'MODIFIABLE',
+  'UNKNOWN': 'NOT_SAFE_NOT_IN_SHEET',
 };
```

```diff
         // Migrate status
-        let status: RuleStatus = 'UNKNOWN';
+        let status: RuleStatus = 'NOT_SAFE_NOT_IN_SHEET';
         if (r.status && typeof r.status === 'string') {
           const mappedStatus = STATUS_MAP[r.status];
           if (mappedStatus) {
             if (r.status !== mappedStatus) {
               migrated = true;
             }
             status = mappedStatus;
           } else {
-            warnings.push(`${itemPrefix}.allergenRules.${allergenId}: Unknown status "${r.status}", defaulting to UNKNOWN`);
-            status = 'UNKNOWN';
+            warnings.push(`${itemPrefix}.allergenRules.${allergenId}: Unknown status "${r.status}", defaulting to NOT_SAFE_NOT_IN_SHEET`);
+            status = 'NOT_SAFE_NOT_IN_SHEET';
           }
         }
```

**Impact**:
- Runtime migration of legacy status names
- Ensures backward compatibility with old packs
- Defaults unknown statuses to safest option (NOT_SAFE_NOT_IN_SHEET)

---

## PATCH 4: Test Suite - Mock Data Updates
**File**: `src/core/checker/checker.test.ts`
**Lines**: 31-35, 78-116
**Purpose**: Add Fish allergen and test dishes for constraint validation

```diff
   allergens: [
     { id: 'dairy', name: 'Dairy', icon: '🥛' },
     { id: 'gluten', name: 'Gluten', icon: '🌾' },
     { id: 'shellfish', name: 'Shellfish', icon: '🦐' },
+    { id: 'fish', name: 'Fish', icon: '🐟' },
     { id: 'eggs', name: 'Eggs', icon: '🥚' },
   ],
```

```diff
-    // Test Case 3: Dish that requires verification
+    // Test Case 3: Dish that requires verification (FISH ONLY - business rule)
     {
-      id: 'complex_dish',
-      name: 'Complex Prepared Dish',
+      id: 'fish_special',
+      name: 'Fresh Catch of the Day',
       categoryId: 'entrees',
-      ticketCode: 'COMPLEX DISH',
+      ticketCode: 'FISH SPECIAL',
       allergenRules: {
-        dairy: {
+        fish: {
           status: 'VERIFY_WITH_KITCHEN',
           substitutions: [],
-          notes: 'Recipe varies - verify with chef',
+          notes: 'Daily fresh catch - preparation varies',
           requiresVerification: true,
         },
         gluten: {
           status: 'SAFE',
           substitutions: [],
           notes: null,
         },
       },
     },
+    // Test Case 3b: Dish with VERIFY for NON-FISH allergen (should be converted to NOT_SAFE)
+    {
+      id: 'complex_dairy_dish',
+      name: 'Complex Dairy Dish',
+      categoryId: 'entrees',
+      ticketCode: 'COMPLEX DAIRY',
+      allergenRules: {
+        dairy: {
+          status: 'VERIFY_WITH_KITCHEN',  // This will be converted to NOT_SAFE by checker
+          substitutions: [],
+          notes: 'Contains dairy - requires verification',
+          requiresVerification: true,
+        },
+        gluten: {
+          status: 'SAFE',
+          substitutions: [],
+          notes: null,
+        },
+      },
+    },
```

**Impact**:
- Test data now includes Fish allergen
- Valid test case: Fish with VERIFY status
- Invalid test case: Dairy with VERIFY status (proves constraint enforcement)

---

## PATCH 5: Test Suite - New Tests for Fish-Only Constraint
**File**: `src/core/checker/checker.test.ts`
**Lines**: 449-615 (NEW)
**Purpose**: Comprehensive tests for Fish-only VERIFY constraint

```typescript
// ============================================================================
// Test Suite 6: FISH-ONLY VERIFY CONSTRAINT (CRITICAL BUSINESS RULE)
// ============================================================================

describe('Fish-Only VERIFY Constraint', () => {
  it('should ALLOW VERIFY_WITH_KITCHEN status for Fish allergen', () => {
    const fishDish: MenuItem = {
      id: 'daily_catch',
      name: 'Daily Fresh Catch',
      categoryId: 'seafood',
      allergenRules: {
        fish: {
          status: 'VERIFY_WITH_KITCHEN',
          substitutions: [],
          notes: 'Preparation varies by daily catch',
          requiresVerification: true,
        },
      },
    };

    const status = evaluateDishForAllergen(fishDish, 'fish');
    expect(status).toBe('VERIFY_WITH_KITCHEN');
  });

  it('should REJECT VERIFY_WITH_KITCHEN for Dairy allergen', () => {
    const dairyDish: MenuItem = {
      id: 'dairy_item',
      name: 'Dairy Item',
      categoryId: 'appetizers',
      allergenRules: {
        dairy: {
          status: 'VERIFY_WITH_KITCHEN',  // This should be converted to NOT_SAFE
          substitutions: [],
          notes: 'Contains dairy',
          requiresVerification: true,
        },
      },
    };

    const status = evaluateDishForAllergen(dairyDish, 'dairy');
    expect(status).toBe('NOT_SAFE_NOT_IN_SHEET');  // Converted by checker
  });

  it('should REJECT VERIFY_WITH_KITCHEN for Gluten allergen', () => { ... });
  it('should REJECT VERIFY_WITH_KITCHEN for Shellfish allergen', () => { ... });
  it('should REJECT VERIFY_WITH_KITCHEN for Eggs allergen', () => { ... });

  it('should show NOT_SAFE ticket output for non-fish VERIFY (regression test)', () => {
    // This test proves that dishes which previously would have shown VERIFY
    // for non-fish allergens now show NOT_SAFE instead
    const selections: CheckerSelections = {
      allergenIds: ['dairy'],
      itemId: 'complex_dairy_dish',  // Has VERIFY status for dairy in mock data
    };
    const result = checkAllergens(mockPack, selections);

    // Should show NOT SAFE message, NOT verify message
    const hasNotSafe = result.ticketLines.some((line) =>
      line.includes('NOT SAFE — NOT IN ALLERGY SHEET')
    );
    const hasVerify = result.ticketLines.some((line) =>
      line.includes('VERIFY WITH THE KITCHEN')
    );

    expect(hasNotSafe).toBe(true);
    expect(hasVerify).toBe(false);
    expect(result.overallStatus).toBe('NOT_SAFE_NOT_IN_SHEET');
  });

  it('should handle multi-allergen with Fish VERIFY + other allergens correctly', () => { ... });
  it('should handle multi-allergen with Fish VERIFY + NOT_SAFE_NOT_IN_SHEET correctly', () => { ... });

  it('should produce deterministic results for all non-fish allergens (no VERIFY allowed)', () => {
    // List all non-fish allergens that must NEVER use VERIFY
    const nonFishAllergens = ['dairy', 'gluten', 'shellfish', 'eggs'];

    const testDish: MenuItem = {
      id: 'test_all_verify',
      name: 'Test All Allergens',
      categoryId: 'test',
      allergenRules: {
        dairy: { status: 'VERIFY_WITH_KITCHEN', substitutions: [] },
        gluten: { status: 'VERIFY_WITH_KITCHEN', substitutions: [] },
        shellfish: { status: 'VERIFY_WITH_KITCHEN', substitutions: [] },
        eggs: { status: 'VERIFY_WITH_KITCHEN', substitutions: [] },
      },
    };

    // All non-fish allergens should convert VERIFY to NOT_SAFE
    for (const allergen of nonFishAllergens) {
      const status = evaluateDishForAllergen(testDish, allergen);
      expect(status).toBe('NOT_SAFE_NOT_IN_SHEET');
    }
  });
});
```

**Test Results**: ✅ **33/33 tests pass**

---

## NEW UTILITIES CREATED

### 1. `scripts/verifyFishOnlyConstraint.ts`
**Purpose**: Audit tenant packs for Fish-only VERIFY constraint compliance

**Usage**:
```bash
npx tsx scripts/verifyFishOnlyConstraint.ts [path-to-pack.json]
```

**Exit codes**:
- 0 = Pack is valid (constraint met)
- 1 = Pack is invalid (violations found)

**Output**:
```
✅ PACK IS VALID
   Fish-Only VERIFY constraint is satisfied
   All non-fish allergens have deterministic states
```

### 2. `scripts/migratePackStatuses.ts`
**Purpose**: Migrate legacy status names to canonical format

**Usage**:
```bash
npx tsx scripts/migratePackStatuses.ts [input.json] [output.json]
```

**Migrations**:
- `'MODIFY'` → `'MODIFIABLE'`
- `'UNKNOWN'` → `'NOT_SAFE_NOT_IN_SHEET'`
- Lowercase variants → Uppercase canonical

**Result**: Successfully migrated 319 statuses in production pack

---

## VERIFICATION RESULTS

### Pre-Migration Status
```
❌ PACK IS INVALID
   319 constraint violation(s) found
   Errors: Invalid status "MODIFY" and "UNKNOWN"
```

### Post-Migration Status
```
✅ PACK IS VALID
   Fish-Only VERIFY constraint is satisfied
   All non-fish allergens have deterministic states

Statistics:
   Total allergen rules: 1,122
   VERIFY_WITH_KITCHEN statuses: 0
     - Fish (valid): 0
     - Non-fish (INVALID): 0
```

### Test Suite Status
```
✅ 33/33 tests pass
   Test Files  1 passed (1)
   Tests  33 passed (33)
```

---

## SUMMARY OF CHANGES

| File | Lines Changed | Purpose |
|------|--------------|---------|
| `src/core/checker/checker.ts` | 15 | Runtime Fish-only enforcement |
| `scripts/generatePackFromSupabase.ts` | 28 | Pack generation constraint enforcement |
| `src/core/tenant/packValidator.ts` | 20 | Legacy status migration |
| `src/core/checker/checker.test.ts` | 250+ | Comprehensive test coverage |
| `scripts/verifyFishOnlyConstraint.ts` | 200+ (NEW) | Audit utility |
| `scripts/migratePackStatuses.ts` | 150+ (NEW) | Migration utility |

**Total**: ~660+ lines of code added/modified

---

## DEPLOYMENT CHECKLIST

✅ **Code Changes**
- [x] Core checker logic updated
- [x] Pack generation logic updated
- [x] Pack validator updated
- [x] All tests passing (33/33)

✅ **Utilities**
- [x] Verification script created
- [x] Migration script created
- [x] Both scripts tested successfully

✅ **Documentation**
- [x] FISH_ONLY_VERIFY_CONSTRAINT.md (comprehensive guide)
- [x] IMPLEMENTATION_FISH_ONLY_VERIFY.md (implementation summary)
- [x] PATCHES_FISH_ONLY_VERIFY.md (this file)

✅ **Data Migration**
- [x] Production pack migrated (319 statuses)
- [x] Checksum updated
- [x] Verification passed

✅ **Safety Validation**
- [x] Zero non-fish VERIFY statuses in production pack
- [x] All non-fish allergens have deterministic states
- [x] Fish allergen can still use VERIFY (business requirement)

---

## READY FOR PRODUCTION ✅

All requirements met. System enforces Fish-only VERIFY constraint at three levels:
1. **Pack generation** (data creation time)
2. **Runtime checker** (defense-in-depth)
3. **Tests** (regression protection)
