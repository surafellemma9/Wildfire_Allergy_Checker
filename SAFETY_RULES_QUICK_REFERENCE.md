# Safety-First Kitchen Ticket Logic - Quick Reference

## Decision Tree

```
For each DISH + ALLERGEN combination:

┌─────────────────────────────────────┐
│ Is dish in allergen's allergy sheet? │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
      NO               YES
       │                │
       ▼                ▼
  ┌─────────┐     ┌──────────────────┐
  │NOT_SAFE │     │requires_verification?│
  │NOT_IN   │     └────┬─────────────┘
  │SHEET    │          │
  └─────────┘    ┌─────┴─────┐
                 │           │
                YES         NO
                 │           │
                 ▼           ▼
           ┌─────────┐  ┌──────────┐
           │ VERIFY  │  │ Database │
           │ WITH    │  │ Status:  │
           │KITCHEN  │  │          │
           └─────────┘  └────┬─────┘
                             │
                    ┌────────┼────────┐
                    │        │        │
                 'safe'  'modifiable' 'not_modifiable'
                    │        │        │
                    ▼        ▼        ▼
                 ┌────┐  ┌──────┐  ┌──────┐
                 │SAFE│  │MODIF-│  │UNSAFE│
                 │    │  │IABLE │  │      │
                 └────┘  └──────┘  └──────┘
```

---

## Status Matrix

| Status | Can Serve? | Modifications Required? | Kitchen Action |
|--------|-----------|------------------------|----------------|
| **SAFE** | ✅ YES | ❌ NO | Serve as-is |
| **MODIFIABLE** | ✅ YES | ✅ YES | Apply listed modifications |
| **VERIFY_WITH_KITCHEN** | ⚠️ MAYBE | ⚠️ ASK CHEF | Chef must verify first |
| **UNSAFE** | ❌ NO | ❌ N/A | Do NOT serve |
| **NOT_SAFE_NOT_IN_SHEET** | ❌ NO | ❌ N/A | Do NOT serve |

---

## Multi-Allergen Rules

When a guest has MULTIPLE allergens (e.g., Dairy + Shellfish):

### Rule: Most Restrictive Status Wins

**Priority Order (strictest → least strict):**
```
1. NOT_SAFE_NOT_IN_SHEET  ⟵ HIGHEST priority
2. UNSAFE
3. VERIFY_WITH_KITCHEN
4. MODIFIABLE
5. SAFE                    ⟵ LOWEST priority
```

### Examples:

**Example 1: Safe + Modifiable = Modifiable**
- Dairy: SAFE
- Gluten: MODIFIABLE (NO butter)
- **Result:** MODIFIABLE (apply gluten modifications)

**Example 2: Modifiable + Not in Sheet = Not in Sheet**
- Dairy: MODIFIABLE (NO cheese)
- Shellfish: NOT_SAFE_NOT_IN_SHEET
- **Result:** NOT_SAFE_NOT_IN_SHEET (do NOT serve)

**Example 3: Safe + Verify = Verify**
- Dairy: SAFE
- Gluten: VERIFY_WITH_KITCHEN
- **Result:** VERIFY_WITH_KITCHEN (chef must verify)

---

## Kitchen Ticket Examples

### ✅ SAFE - No Changes Needed
```
=== SHRIMP COCKTAIL ===
✓ SAFE - No changes needed
```
**Action:** Serve as-is, no modifications

---

### 🔧 MODIFIABLE - Apply Modifications
```
=== CHICKEN SKEWERS ===
• **NO yogurt sauce**
• **NO garlic marinade**
```
**Action:** Apply ALL listed modifications before serving

---

### ⚠️ VERIFY WITH KITCHEN
```
=== COMPLEX DISH ===
⚠️  VERIFY WITH THE KITCHEN
   Manual confirmation required before serving
   • Dairy: Recipe varies - verify with chef
```
**Action:** Chef MUST verify before serving

---

### 🚫 NOT SAFE - NOT IN ALLERGY SHEET
```
=== SALMON ===
🚫 NOT SAFE — NOT IN ALLERGY SHEET
   DO NOT SERVE - Cannot verify safety
   • Shellfish: Missing from allergy sheet
```
**Action:** **DO NOT SERVE** - Cannot confirm safety

---

### ✗ UNSAFE - Cannot Be Modified
```
=== BREADED ITEM ===
✗ NOT SAFE - Cannot be modified
   • Gluten: Cannot be made gluten-free
```
**Action:** **DO NOT SERVE** - Cannot be made safe

---

## Where Allergy Sheets Are Stored

### Database Table:
```
Table: allergen_modifications
Location: Supabase PostgreSQL
```

### Fields:
- `dish_name` - Menu item name
- `allergen` - Which allergen (dairy, gluten, shellfish, etc.)
- `status` - safe | modifiable | not_modifiable
- `modifications` - Array of kitchen instructions
- `requires_verification` - Boolean flag
- `notes` - Additional context

### Example Query:
```sql
SELECT dish_name, allergen, status, modifications
FROM allergen_modifications
WHERE allergen = 'dairy' AND status = 'modifiable';
```

---

## Modification Format Standards

### NO Modifications (Omit ingredient)
```
NO yogurt sauce
NO steak butter
NO garlic crouton
```
**Meaning:** Remove the ingredient entirely

### SUB Modifications (Substitute)
```
SUB gluten free crouton
SUB plain chicken
SUB dairy-free butter
```
**Meaning:** Replace with alternative

### GF Modifications (Gluten-Free version)
```
GF steak butter
GF seasoning
```
**Meaning:** Use the gluten-free version

---

## Critical Safety Rules

### ✅ DO:
- Use allergy sheets as single source of truth
- Apply ALL modifications for MODIFIABLE dishes
- Verify with chef for VERIFY_WITH_KITCHEN status
- Refuse to serve NOT_SAFE_NOT_IN_SHEET items
- When in doubt, ask chef to verify

### ❌ DON'T:
- Serve items marked NOT_SAFE_NOT_IN_SHEET
- Assume dairy rules apply to eggs
- Assume egg rules apply to shellfish
- Guess modifications not listed in allergy sheet
- Skip modifications to "save time"

---

## Common Scenarios

### Scenario 1: Guest has Dairy allergy, orders Chicken Skewers
1. Check: Is Chicken Skewers in Dairy allergy sheet? **YES**
2. Status: MODIFIABLE
3. Modifications: NO yogurt sauce
4. **Action:** Serve with NO yogurt sauce

---

### Scenario 2: Guest has Shellfish allergy, orders Salmon
1. Check: Is Salmon in Shellfish allergy sheet? **NO**
2. Status: NOT_SAFE_NOT_IN_SHEET
3. **Action:** **DO NOT SERVE** - Cannot verify safety

---

### Scenario 3: Guest has Dairy + Gluten allergies, orders Steak
1. Check Dairy: MODIFIABLE (NO butter)
2. Check Gluten: MODIFIABLE (GF seasoning)
3. Combined Status: MODIFIABLE
4. **Action:** Serve with NO butter AND GF seasoning

---

### Scenario 4: Guest has custom "nightshade" allergy
1. Custom allergens not in allergy sheets
2. Status: VERIFY_WITH_KITCHEN
3. **Action:** Chef must verify before serving

---

## File Locations (Developer Reference)

| What | Where |
|------|-------|
| Allergy Sheet Data | `/supabase/migrations/002_all_allergen_modifications.sql` |
| Decision Logic | `/src/core/checker/checker.ts` (line 211-241) |
| Kitchen Ticket Format | `/src/core/checker/checker.ts` (line 274-322) |
| Status Priority | `/src/core/checker/checker.ts` (line 194-209) |
| Tests | `/src/core/checker/checker.test.ts` |
| Type Definitions | `/src/core/tenant/packTypes.ts` |

---

## Testing

### Run All Tests:
```bash
npm test
```

### Test Specific File:
```bash
npm test src/core/checker/checker.test.ts
```

### Expected Result:
```
✓ 22 tests passed
```

---

## Questions?

### How do I add a new allergen rule?
1. Insert into `allergen_modifications` table in database
2. Run `generatePackFromSupabase.ts`
3. Run `uploadPackToSupabase.ts`
4. Regenerate app

### How do I mark a dish for verification?
```sql
UPDATE allergen_modifications
SET requires_verification = true
WHERE dish_name = 'Your Dish' AND allergen = 'dairy';
```

### What if a dish is missing from allergy sheet?
- System will automatically mark as `NOT_SAFE_NOT_IN_SHEET`
- Kitchen will see "DO NOT SERVE" message
- Add proper allergen rules to database to fix

### Can I override the safety rules?
- **NO** - Safety rules are non-negotiable
- If you need to serve an item, add proper allergen rules to database
- Never bypass the system

---

## Summary

**Golden Rule:** If it's not in the allergy sheet for that specific allergen, it's NOT SAFE to serve.

No exceptions. No guessing. No inference.

The system is designed to protect guests by being conservative:
- When in doubt → VERIFY WITH KITCHEN
- Not in sheet → DO NOT SERVE
- Multiple allergens → Use most restrictive rule

**Always prioritize guest safety over convenience.**
