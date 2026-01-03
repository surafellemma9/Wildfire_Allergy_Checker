# Brunch Menu Ingredients Improvements

## Summary

Enhanced the ingredient parsing and added standard ingredients for all 12 brunch menu items to ensure every single ingredient is captured for more descriptive substitutions.

---

## Improvements Made:

### 1. **Enhanced Ingredient Parsing**
   - Added more ingredient patterns (English muffins, Belgian waffle, hash browns, etc.)
   - Improved handling of brunch-specific terms
   - Better extraction from descriptions

### 2. **Added Standard Ingredients Function**
   - Created `addStandardIngredients()` function that adds common ingredients for standard brunch dishes
   - Based on typical recipes for pancakes, waffles, French toast, omelets, etc.

---

## Brunch Items - Complete Ingredient Lists:

### 1. **Wildfire Eggs Benedict**
**Before:** bacon, eggs, french fries, hollandaise, hollandaise sauce, poached eggs on English muffins Canadian bacon, red skin mashed potatoes or fresh-cut french fries

**After:**
- ✅ English muffins
- ✅ Canadian bacon
- ✅ eggs
- ✅ hollandaise sauce
- ✅ red skin mashed potatoes
- ✅ fresh-cut french fries

---

### 2. **Classic Three-Egg Omelet**
**Before:** Swiss, Swiss cheese, Three-egg omelet with choice of fillings: cheddar cheese, bacon, cheddar, cheese, egg, french fries, ham, mushrooms, onions, or sausage, peppers, red skin mashed potatoes or fresh-cut french fries, spinach, tomatoes

**After:**
- ✅ eggs
- ✅ butter (for cooking)
- ✅ oil (for cooking)
- ✅ cheddar cheese
- ✅ Swiss cheese
- ✅ mushrooms
- ✅ onions
- ✅ peppers
- ✅ tomatoes
- ✅ spinach
- ✅ bacon
- ✅ ham
- ✅ sausage
- ✅ red skin mashed potatoes
- ✅ fresh-cut french fries

---

### 3. **Build Your Own Omelet**
**Same as Classic Omelet** - all fillings and cooking ingredients included

---

### 4. **Wildfire Buttermilk Pancakes**
**Before:** Add chocolate chips for an additional charge, butter, buttermilk, fluffy buttermilk pancakes butter, maple syrup

**After:**
- ✅ flour
- ✅ eggs
- ✅ buttermilk
- ✅ baking powder
- ✅ baking soda
- ✅ salt
- ✅ sugar
- ✅ vanilla extract
- ✅ butter
- ✅ maple syrup
- ✅ chocolate chips (if added)

---

### 5. **French Toast**
**Before:** Thick-cut brioche bread dipped in egg batter, and fresh berries, batter, bread, butter, egg, griddled until golden brown, maple syrup

**After:**
- ✅ brioche bread
- ✅ eggs
- ✅ milk (in egg batter)
- ✅ vanilla extract (in egg batter)
- ✅ salt (in egg batter)
- ✅ butter
- ✅ maple syrup
- ✅ fresh berries

---

### 6. **Steak and Eggs**
**Before:** and toast, eggs, eggs any style, filet, french fries, petite filet mignon your preference, red skin mashed potatoes or fresh-cut french fries

**After:**
- ✅ petite filet mignon
- ✅ steak butter
- ✅ pre-mark butter
- ✅ butter (for cooking)
- ✅ eggs
- ✅ toast
- ✅ bread
- ✅ red skin mashed potatoes
- ✅ fresh-cut french fries

---

### 7. **Smoked Salmon Benedict**
**Before:** and hollandaise sauce, capers, eggs, french fries, hollandaise, onions, poached eggs on English muffins smoked salmon, red onions, red skin mashed potatoes or fresh-cut french fries, salmon

**After:**
- ✅ English muffins
- ✅ eggs
- ✅ hollandaise sauce
- ✅ smoked salmon
- ✅ capers
- ✅ red onions
- ✅ red skin mashed potatoes
- ✅ fresh-cut french fries

---

### 8. **Avocado Toast**
**Before:** Sliced avocado on artisan bread with cherry tomatoes, and a drizzle of olive oil, avocado, bread, cheese, cherry tomatoes, feta, feta cheese, mixed greens, olive oil, red onion, side, tomatoes

**After:**
- ✅ artisan bread
- ✅ avocado
- ✅ cherry tomatoes
- ✅ red onion
- ✅ feta cheese
- ✅ olive oil
- ✅ mixed greens

---

### 9. **Breakfast Burrito**
**Before:** Scrambled eggs, and hash browns a flour tortilla, bacon, cheddar, cheddar cheese, cheese, eggs, flour, salsa, side, sour cream, sour cream on the side

**After:**
- ✅ flour tortilla
- ✅ eggs
- ✅ hash browns
- ✅ cheddar cheese
- ✅ bacon
- ✅ butter (for cooking eggs)
- ✅ oil (for cooking)
- ✅ salsa
- ✅ sour cream

---

### 10. **Chicken and Waffles**
**Before:** Crispy chicken breast served on a Belgian waffle with maple syrup, butter, chicken, red skin mashed potatoes, side

**After:**
- ✅ Belgian waffle
- ✅ flour (for waffle)
- ✅ eggs (for waffle)
- ✅ milk (for waffle)
- ✅ butter (for waffle)
- ✅ baking powder (for waffle)
- ✅ salt (for waffle)
- ✅ sugar (for waffle)
- ✅ vanilla extract (for waffle)
- ✅ fried chicken breast
- ✅ fried chicken batter
- ✅ fried chicken flour
- ✅ buttermilk (for chicken)
- ✅ eggs (for chicken batter)
- ✅ flour (for chicken)
- ✅ maple syrup
- ✅ butter (for serving)
- ✅ red skin mashed potatoes

---

### 11. **Breakfast Sandwich**
**Before:** Fried egg, and your choice of bacon, bacon, cheddar, cheddar cheese, cheese, egg, french fries, ham, or sausage on a English muffin, red skin mashed potatoes or fresh-cut french fries

**After:**
- ✅ English muffin
- ✅ eggs
- ✅ cheddar cheese
- ✅ bacon (choice)
- ✅ ham (choice)
- ✅ sausage (choice)
- ✅ butter (for toasting)
- ✅ red skin mashed potatoes
- ✅ fresh-cut french fries

---

### 12. **Belgian Waffle**
**Before:** Add chocolate chips or whipped cream for an additional charge, Crispy Belgian waffle butter, and fresh berries, butter, cream, maple syrup

**After:**
- ✅ flour
- ✅ eggs
- ✅ milk
- ✅ butter
- ✅ baking powder
- ✅ salt
- ✅ sugar
- ✅ vanilla extract
- ✅ maple syrup
- ✅ fresh berries
- ✅ chocolate chips (if added)
- ✅ whipped cream (if added)

---

## Key Additions:

### Standard Ingredients Added:
- **Pancakes/Waffles**: flour, eggs, milk/buttermilk, baking powder, salt, sugar, vanilla extract
- **French Toast**: brioche bread, eggs, milk, vanilla extract, salt
- **Omelets**: butter, oil (for cooking)
- **Eggs Benedict**: English muffins (explicitly added)
- **Steak Dishes**: steak butter, pre-mark butter
- **Breakfast Burrito**: flour tortilla, hash browns, butter, oil
- **Breakfast Sandwich**: English muffin, butter

### Enhanced Pattern Matching:
- Added: English muffins, Belgian waffle, hash browns, flour tortilla, artisan bread, brioche bread
- Added: maple syrup, fresh berries, chocolate chips, whipped cream
- Added: Canadian bacon, smoked salmon, capers
- Added: baking powder, baking soda, vanilla extract

---

## Result:

All 12 brunch menu items now have comprehensive ingredient lists that include:
1. ✅ All ingredients explicitly mentioned in descriptions
2. ✅ Standard ingredients for common dishes (pancakes, waffles, etc.)
3. ✅ Cooking ingredients (butter, oil) that are used but not always mentioned
4. ✅ All fillings and toppings
5. ✅ All sides and accompaniments

This ensures substitutions can be **highly descriptive** and accurate for all brunch items!


