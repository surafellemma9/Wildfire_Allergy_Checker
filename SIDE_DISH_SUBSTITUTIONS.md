# Side Dish Substitutions Review

## All 11 Side Dishes (Lunch, Brunch & Dinner)

### 1. Fresh-Cut French Fries
**Allergens:** Shellfish (cross-contamination)
**Menu:** L & D

**Expected Substitutions:**
- **Shellfish:** "NO [shellfish ingredient]" (if any)
- **Custom (ketchup):** "NO ketchup" (served on the side - can be removed)

**Ingredients:** potatoes, ketchup (on side), salt, pepper

---

### 2. Red Skin Mashed Potatoes
**Allergens:** Dairy
**Menu:** L & D

**Expected Substitutions:**
- **Dairy:** "NO butter (use oil)" and "NO half and half (use non-dairy alternative)" and "NO whipping cream (use non-dairy alternative)"

**Ingredients:** red skin potatoes, Idaho russet potatoes, butter, half and half, whipping cream, salt, pepper

**Note:** This is a prepared side, but ingredients can be modified

---

### 3. Steamed Broccoli with Lemon Vinaigrette
**Allergens:** None listed (but vinaigrette may contain allergens)
**Menu:** L & D

**Expected Substitutions:**
- **Dairy (if vinaigrette has dairy):** "NO lemon herb vinaigrette (contains: [dairy ingredients])"
- **Onion/Garlic:** "NO lemon herb vinaigrette (contains: garlic)"

**Ingredients:** broccoli, lemon herb vinaigrette

---

### 4. Creamed Spinach
**Allergens:** Dairy, Gluten
**Menu:** L & D

**Expected Substitutions:**
- **Dairy:** "NO creamed spinach (contains: cream, butter)" OR "NO cream (use non-dairy alternative)" and "NO butter (use oil)"
- **Gluten:** "NO flour (use gluten-free alternative)"

**Ingredients:** spinach, cream, butter, flour, nutmeg, salt, pepper

**Note:** This is a prepared mixture, but can be modified

---

### 5. Au Gratin Potatoes
**Allergens:** Dairy
**Menu:** L & D

**Expected Substitutions:**
- **Dairy:** "NO au gratin potatoes (contains: cream, white cheddar cheese)" OR "NO cream (use non-dairy alternative)" and "NO white cheddar cheese"

**Ingredients:** potatoes, cream, white cheddar cheese, salt, pepper

**Note:** This is baked, but can be modified

---

### 6. Idaho Baked Potato
**Allergens:** Dairy (toppings on side)
**Menu:** L & D

**Expected Substitutions:**
- **Dairy:** "NO sour cream" and "NO butter (use oil)" (both available on the side - can be omitted)

**Ingredients:** Idaho potato, house oil, salt, pepper, sour cream (on side), butter (on side)

**Note:** Toppings are optional and on the side

---

### 7. BBQ Rubbed Sweet Potato
**Allergens:** Dairy (toppings on side)
**Menu:** L & D

**Expected Substitutions:**
- **Dairy:** "NO butter (use oil)" (available on the side - can be omitted)
- **Soy (if BBQ chicken spice contains soy):** Check spice blend

**Ingredients:** sweet potato, BBQ chicken spice, house oil, butter (on side), brown sugar (on side)

**Note:** Toppings are optional and on the side

---

### 8. Mac and Cheese
**Allergens:** Dairy, Gluten
**Menu:** L & D

**Expected Substitutions:**
- **Dairy:** "NO elbow macaroni (contains: [dairy check])" OR "NO whipping cream (use non-dairy alternative)" and "NO whole milk" and "NO yellow cheese spread" and "NO cheddar cheese slices"
- **Gluten:** "NO elbow macaroni (use gluten-free alternative)"

**Ingredients:** elbow macaroni, whipping cream, whole milk, yellow cheese spread, cheddar cheese slices

**Note:** This is baked, but can be modified

---

### 9. Roasted Mushroom Caps
**Allergens:** Dairy
**Menu:** L & D

**Expected Substitutions:**
- **Dairy:** "NO butter (use oil)"
- **Onion/Garlic:** "NO garlic" and "NO shallots"

**Ingredients:** mushroom caps, garlic, shallots, white wine, fresh thyme, chicken stock, butter

---

### 10. Applesauce
**Allergens:** None listed
**Menu:** L & D

**Expected Substitutions:**
- **Custom allergens:** Check individual ingredients

**Ingredients:** apples, corn syrup, cinnamon, sugar, fresh lemon juice

**Note:** Simple ingredients, likely pre-prepared

---

### 11. Homemade Coleslaw
**Allergens:** Egg, Dairy
**Menu:** L & D

**Expected Substitutions:**
- **Egg:** "NO coleslaw dressing (contains: mayonnaise)"
- **Dairy:** Check if coleslaw dressing contains dairy

**Ingredients:** cabbage, carrots, coleslaw dressing

**Note:** Pre-mixed, but can be modified

---

## Key Improvements Made:

1. ✅ Added composite ingredients:
   - `coleslaw dressing` - mayonnaise-based
   - `elbow macaroni` - gluten-containing pasta
   - `half and half` - dairy
   - `whipping cream` - dairy
   - `white cheddar cheese` - dairy
   - `yellow cheese spread` - dairy
   - `creamed spinach` - composite side dish
   - `au gratin potatoes` - composite side dish

2. ✅ Enhanced dairy detection:
   - Now checks for more specific dairy terms first (whipping cream, half and half, white cheddar cheese, etc.)
   - Uses most descriptive names from dish.ingredients

3. ✅ Enhanced gluten detection:
   - Added pasta/macaroni detection
   - Shows descriptive names like "NO elbow macaroni" instead of generic "NO pasta"

4. ✅ Side dish handling:
   - Items "on the side" are correctly identified as modifiable
   - Pre-prepared sides show appropriate messages
   - Composite side dishes show full ingredient breakdown




