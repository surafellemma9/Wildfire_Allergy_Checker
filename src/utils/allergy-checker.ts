import type { Allergen, AllergyCheckResult, MenuItem } from '../types';

// Knowledge base of composite ingredients (sauces, condiments, etc.) and their sub-ingredients
const compositeIngredients: Record<string, string[]> = {
  // Dairy-based
  'buttermilk': ['milk', 'cultured milk', 'lactic acid'],
  'ranch dressing': ['mayonnaise', 'buttermilk', 'sour cream', 'garlic', 'onion', 'dill', 'parsley', 'chives', 'salt', 'pepper'],
  'ranch': ['mayonnaise', 'buttermilk', 'sour cream', 'garlic', 'onion', 'dill', 'parsley', 'chives', 'salt', 'pepper'],
  'yogurt sauce': ['yogurt', 'garlic', 'lemon juice', 'salt', 'pepper', 'dill'],
  'horseradish cream sauce': ['horseradish', 'sour cream', 'mayonnaise', 'lemon juice', 'salt', 'pepper'],
  'béarnaise': ['butter', 'egg yolk', 'white wine vinegar', 'shallots', 'tarragon', 'chervil', 'pepper'],
  'hollandaise': ['butter', 'egg yolk', 'lemon juice', 'salt', 'cayenne pepper'],
  'aioli': ['mayonnaise', 'garlic', 'lemon juice', 'olive oil'],
  'ancho mayo': ['mayonnaise', 'ancho chili', 'lime juice', 'garlic'],
  'spicy mayo': ['mayonnaise', 'sriracha', 'lime juice', 'garlic'],
  'mustard mayonnaise': ['mayonnaise', 'mustard', 'dijon mustard'],
  
  // Sauces
  'cocktail sauce': ['ketchup', 'horseradish', 'lemon juice', 'worcestershire sauce', 'hot sauce', 'salt', 'pepper'],
  'apricot dipping sauce': ['apricot preserves', 'soy sauce', 'rice wine vinegar', 'ginger', 'garlic'],
  'coconut dipping sauce': ['coconut milk', 'dark brown sugar', 'rice wine vinegar', 'tamari', 'ginger', 'chili paste'],
  'barbecue sauce': ['ketchup', 'brown sugar', 'vinegar', 'worcestershire sauce', 'mustard', 'garlic', 'onion'],
  'bbq sauce': ['ketchup', 'brown sugar', 'vinegar', 'worcestershire sauce', 'mustard', 'garlic', 'onion'],
  'hot honey sauce': ['honey', 'hot sauce', 'butter', 'vinegar'],
  'balsamic vinaigrette': ['balsamic vinegar', 'olive oil', 'dijon mustard', 'garlic', 'salt', 'pepper'],
  'lemon herb vinaigrette': ['lemon juice', 'olive oil', 'herbs', 'garlic', 'salt', 'pepper'],
  'lemon parmesan vinaigrette': ['lemon juice', 'olive oil', 'parmesan cheese', 'garlic', 'salt', 'pepper'],
  'red wine vinaigrette': ['red wine vinegar', 'olive oil', 'dijon mustard', 'garlic', 'salt', 'pepper'],
  'caesar dressing': ['anchovy', 'garlic', 'lemon juice', 'dijon mustard', 'asiago cheese', 'pasteurized egg yolk', 'red wine vinegar', 'house oil', 'salt', 'pepper'],
  'tomato basil sauce': ['tomato', 'basil', 'garlic', 'olive oil', 'salt', 'pepper'],
  'au jus': ['beef stock', 'onion', 'garlic', 'worcestershire sauce', 'salt', 'pepper'],
  'mint chimichurri': ['mint', 'parsley', 'garlic', 'olive oil', 'red wine vinegar', 'salt', 'pepper'],
  'mushroom gravy': ['mushrooms', 'butter', 'flour', 'chicken stock', 'whipping cream', 'heavy cream', 'onion', 'garlic', 'salt', 'pepper'],
  
  // Marinades
  'mediterranean marinade': ['olive oil', 'lemon juice', 'garlic', 'oregano', 'thyme', 'rosemary', 'salt', 'pepper'],
  'steak marinade': ['soy sauce', 'worcestershire sauce', 'garlic', 'onion', 'olive oil', 'black pepper'],
  'bourbon marinade': ['bourbon', 'soy sauce', 'brown sugar', 'garlic', 'ginger', 'worcestershire sauce'],
  'basil hayden\'s bourbon': ['bourbon'],
  
  // Spice blends
  'wildfire 8 spice': ['salt', 'pepper', 'garlic', 'onion', 'paprika', 'cayenne', 'other spices'],
  'blackening spice': ['paprika', 'cayenne', 'garlic powder', 'onion powder', 'thyme', 'oregano', 'salt', 'pepper'],
  'char-crust': ['spices', 'salt', 'pepper', 'garlic', 'onion'],
  'old bay seasoning': ['celery salt', 'paprika', 'black pepper', 'cayenne', 'mustard', 'ginger', 'allspice', 'bay leaf'],
  
  // Other composite ingredients
  'coleslaw': ['cabbage', 'carrots', 'mayonnaise', 'vinegar', 'sugar', 'salt', 'pepper'],
  'coleslaw dressing': ['mayonnaise', 'vinegar', 'sugar', 'salt', 'pepper', 'celery seed'],
  'garlic crouton': ['bread', 'garlic', 'butter', 'salt', 'pepper'],
  'garlic croutons': ['bread', 'garlic', 'butter', 'salt', 'pepper'],
  'seasoned flour': ['flour', 'salt', 'pepper', 'spices'],
  'saltine crackers': ['flour', 'salt', 'baking soda'],
  'elbow macaroni': ['wheat', 'flour', 'water', 'eggs'],
  'half and half': ['milk', 'cream'],
  'whipping cream': ['cream', 'milk'],
  'white cheddar cheese': ['milk', 'cheese', 'cultures', 'enzymes', 'salt'],
  'yellow cheese spread': ['milk', 'cheese', 'cultures', 'enzymes', 'salt', 'annatto'],
  'creamed spinach': ['spinach', 'cream', 'butter', 'flour', 'nutmeg', 'salt', 'pepper'],
  'au gratin potatoes': ['potatoes', 'cream', 'white cheddar cheese', 'butter', 'salt', 'pepper'],
  'garlic butter': ['butter', 'garlic', 'parsley'],
  'steak butter': ['butter', 'herbs', 'garlic', 'salt', 'pepper'],
  'pre-mark butter': ['butter', 'herbs', 'garlic'],
  'premark butter': ['butter', 'herbs', 'garlic'],
  'horseradish crust': ['horseradish', 'breadcrumbs', 'parmesan', 'butter'],
  'peppercorn crust': ['black peppercorns', 'breadcrumbs', 'butter'],
  'parmesan crust': ['parmesan cheese', 'breadcrumbs', 'butter'],
  'mushroom crust': ['mushrooms', 'breadcrumbs', 'butter', 'garlic'],
  'garlic crust': ['garlic', 'breadcrumbs', 'butter', 'parsley'],
  'blue cheese crust': ['blue cheese', 'breadcrumbs', 'butter'],
  'coconut crumbs': ['coconut', 'garlic butter', 'parsley', 'japanese breadcrumbs'],
  'japanese breadcrumbs': ['breadcrumbs', 'panko'],
  'breadcrumbs': ['bread', 'flour'],
  'breading': ['flour', 'egg', 'breadcrumbs'],
  'batter': ['flour', 'egg', 'milk', 'baking powder'],
  'fried chicken batter': ['flour', 'egg', 'buttermilk', 'spices'],
  'fried chicken flour': ['flour', 'spices', 'salt', 'pepper'],
  
  // Stocks and bases
  'chicken stock': ['chicken', 'onion', 'carrot', 'celery', 'garlic', 'herbs', 'salt', 'pepper'],
  'chicken jus': ['chicken stock', 'chicken drippings', 'onion', 'garlic'],
  'lobster base': ['lobster', 'shellfish', 'salt', 'spices'],
  'shrimp poaching liquid': ['shrimp', 'shellfish', 'water', 'salt'],
  'clam juice': ['clams', 'shellfish', 'water', 'salt'],
  
  // Other
  'ketchup': ['tomato', 'vinegar', 'sugar', 'salt', 'spices'],
  'mustard': ['mustard seeds', 'vinegar', 'salt', 'spices'],
  'dijon mustard': ['mustard seeds', 'white wine', 'vinegar', 'salt'],
  'honey dijon mustard': ['honey', 'dijon mustard', 'mustard seeds', 'vinegar'],
  'yellow mustard': ['mustard seeds', 'vinegar', 'turmeric', 'salt'],
  'worcestershire sauce': ['vinegar', 'molasses', 'anchovy', 'tamari', 'onion', 'garlic', 'spices'],
  'tamari': ['soybeans', 'water', 'salt'],
  'soy sauce': ['soybeans', 'wheat', 'water', 'salt'],
  'teriyaki': ['soy sauce', 'sugar', 'mirin', 'sake', 'ginger', 'garlic'],
  'bread and butter pickles': ['cucumbers', 'vinegar', 'sugar', 'salt', 'spices', 'turmeric'],
  'bubbies bread and butter pickles': ['cucumbers', 'vinegar', 'sugar', 'salt', 'spices', 'turmeric'],
  'roasted onions': ['onions', 'oil', 'salt', 'pepper'],
  'roasted red onions': ['red onions', 'oil', 'salt', 'pepper'],
  'crispy onions': ['onions', 'flour', 'salt', 'spices'],
  'sesame seed bun': ['wheat flour', 'sesame seeds', 'water', 'yeast', 'salt', 'sugar'],
  'american cheese': ['milk', 'cheese', 'cultures', 'enzymes', 'salt'],
  'jalapeno jack': ['milk', 'cheese', 'jalapeno peppers', 'cultures', 'enzymes', 'salt'],
  'swiss cheese': ['milk', 'cheese', 'cultures', 'enzymes', 'salt'],
  'lemon butter sauce': ['butter', 'lemon juice', 'salt', 'pepper'],
  'tomato jam': ['tomatoes', 'sugar', 'vinegar', 'salt', 'spices'],
  'cranberry sauce': ['cranberries', 'sugar', 'water', 'salt'],
  'cranberry lemon butter': ['cranberry sauce', 'lemon butter sauce', 'butter', 'lemon juice'],
  'cornbread crumbs': ['cornmeal', 'flour', 'butter', 'salt', 'baking powder'],
  'garlic breadcrumbs': ['breadcrumbs', 'garlic', 'butter', 'parsley', 'salt', 'pepper'],
  'herb chicken marinade': ['cayenne pepper', 'oregano', 'thyme', 'tarragon', 'curry powder', 'rosemary', 'garlic', 'salt', 'pepper', 'bay leaves', 'olive oil', 'dried onions', 'chicken stock', 'butter', 'dijon mustard'],
  'bbq chicken spice': ['spices', 'salt', 'pepper', 'garlic', 'onion', 'paprika', 'cayenne'],
  'bbq rib spice': ['spices', 'salt', 'pepper', 'garlic', 'onion', 'paprika', 'cayenne', 'brown sugar'],
  'buttermilk biscuit': ['flour', 'buttermilk', 'butter', 'baking powder', 'salt'],
  'cherry sauce': ['honey', 'shallots', 'orange juice', 'orange zest', 'thyme', 'balsamic vinegar', 'cherry juice', 'duck stock', 'cherries', 'cornstarch', 'butter', 'pepper'],
  'wild rice': ['long grain rice', 'brown rice', 'sweet brown rice', 'wehani rice', 'black japonica rice', 'wild rice pieces', 'onions', 'garlic', 'thyme', 'butter', 'house oil', 'salt', 'pepper', 'vegetable stock', 'red peppers', 'corn', 'peas', 'scallions', 'garlic butter'],
  'chicken juice': ['chicken stock', 'chicken drippings', 'onion', 'garlic'],
  'english muffin': ['wheat flour', 'water', 'yeast', 'salt', 'sugar', 'cornmeal'],
  'english muffins': ['wheat flour', 'water', 'yeast', 'salt', 'sugar', 'cornmeal'],
  'brioche bread': ['wheat flour', 'eggs', 'butter', 'milk', 'yeast', 'salt', 'sugar'],
  'buttermilk pancakes': ['flour', 'buttermilk', 'eggs', 'baking powder', 'salt', 'sugar', 'butter'],
  'egg batter': ['eggs', 'milk', 'flour', 'salt', 'pepper'],
  'reduced braising liquid': ['beef stock', 'chicken stock', 'cornstarch', 'butter', 'onion', 'garlic', 'carrots', 'celery'],
  'roasted root vegetables': ['turnips', 'parsnips', 'carrots', 'shallots', 'garlic', 'thyme', 'rosemary', 'salt', 'pepper', 'house oil'],
  'buttery onion bun': ['wheat flour', 'onions', 'butter', 'yeast', 'salt', 'sugar'],
  'multi-grain bread': ['wheat flour', 'multi-grain flour', 'water', 'yeast', 'salt', 'sugar', 'seeds'],
  
  // Desserts
  'chocolate cake': ['eggs', 'canola oil', 'milk', 'vanilla extract', 'flour', 'sugar', 'baking powder', 'baking soda', 'salt', 'cocoa powder', 'water'],
  'chocolate icing': ['chocolate pistoles', 'egg yolks', 'sugar', 'heavy whipping cream'],
  'hot fudge': ['chocolate', 'sugar', 'cream', 'butter', 'vanilla'],
  'whipped cream': ['heavy cream', 'sugar', 'vanilla'],
  'cake crumbs': ['cake', 'flour', 'sugar', 'butter'],
  'toasted cake crumbs': ['cake', 'flour', 'sugar', 'butter'],
  'pie crust': ['flour', 'butter', 'salt', 'water'],
  'pie crust shell': ['flour', 'butter', 'salt', 'water'],
  'pie crust topper': ['flour', 'butter', 'salt', 'water'],
  'graham cracker crust': ['graham crackers', 'butter', 'sugar'],
  'key lime filling': ['key lime juice', 'egg yolks', 'sweetened condensed milk', 'sugar', 'lemon juice'],
  'sweetened condensed milk': ['milk', 'sugar'],
  'cream cheese filling': ['cream cheese', 'sugar', 'eggs', 'salt', 'vanilla'],
  'sour cream topping': ['sour cream', 'sugar', 'vanilla'],
  'dessert cherry sauce': ['door county cherries', 'orange juice', 'cherry juice', 'sugar', 'cinnamon sticks', 'almond extract', 'cornstarch', 'water'],
  'chocolate chip cookie': ['butter', 'sugar', 'brown sugar', 'vanilla', 'eggs', 'flour', 'salt', 'baking powder', 'chocolate chips'],
  'vanilla ice cream': ['milk', 'cream', 'sugar', 'vanilla', 'egg yolks'],
  'warm berry sauce': ['raspberries', 'strawberries', 'blackberries', 'sugar', 'cornstarch', 'water'],
  'oatmeal raisin cookies': ['butter', 'sugar', 'brown sugar', 'eggs', 'vanilla', 'gluten free flour', 'baking soda', 'baking powder', 'salt', 'gluten free rolled oats', 'raisins'],
  'flourless chocolate cake': ['chocolate pistoles', 'butter', 'eggs', 'sugar', 'vanilla', 'salt', 'cocoa powder'],
  'chocolate pistoles': ['chocolate', 'cocoa butter', 'sugar'],
};

/**
 * Get sub-ingredients for a composite ingredient (sauce, condiment, etc.)
 */
function getSubIngredients(ingredient: string): string[] {
  const ingredientLower = ingredient.toLowerCase().trim();
  return compositeIngredients[ingredientLower] || [];
}

// Map allergen to the corresponding column name in MenuItem
// Note: onion_garlic and tomato are not in the CSV columns, so we'll detect them from description
const allergenToColumn: Partial<Record<Allergen, keyof MenuItem>> = {
  dairy: 'contains_dairy',
  egg: 'contains_egg',
  gluten: 'contains_gluten',
  shellfish: 'contains_shellfish',
  fish: 'contains_fish',
  soy: 'contains_soy',
  peanuts: 'contains_peanuts',
  tree_nuts: 'contains_tree_nuts',
  sesame: 'contains_sesame',
  msg: 'contains_msg',
  // onion_garlic and tomato will be detected from description only
};

// Ingredients that contain each allergen (case-insensitive matching)
const allergenIngredients: Record<Allergen, string[]> = {
  dairy: [
    'butter', 'steak butter', 'pre-mark butter', 'premark butter', 'cream', 'cheese', 'milk', 'yogurt', 'sour cream', 'whipping cream',
    'half and half', 'buttermilk', 'parmesan', 'asiago', 'swiss', 'cheddar',
    'mozzarella', 'feta', 'blue cheese', 'goat cheese', 'dairy', 'margarine',
    'heavy cream', 'whole milk', 'skim milk', 'cream cheese', 'ricotta'
  ],
  egg: [
    'egg', 'eggs', 'egg yolk', 'egg white', 'egg whites', 'pasteurized egg',
    'hard-boiled egg', 'mayonnaise', 'mayo', 'béarnaise', 'hollandaise',
    'aioli', 'custard', 'pudding', 'meringue'
  ],
  gluten: [
    'flour', 'bread', 'breadcrumb', 'breadcrumbs', 'crouton', 'croutons',
    'pasta', 'noodle', 'noodles', 'wheat', 'barley', 'rye', 'semolina',
    'couscous', 'bulgur', 'farro', 'spelt', 'bun', 'buns', 'flatbread',
    'puff pastry', 'pie crust', 'graham cracker', 'graham crackers',
    'macaroni', 'elbow macaroni', 'gluten', 'breading', 'batter'
  ],
  shellfish: [
    'shrimp', 'crab', 'lobster', 'scallop', 'scallops', 'oyster', 'oysters',
    'clam', 'clams', 'mussel', 'mussels', 'crayfish', 'crawfish', 'prawn',
    'prawns', 'langoustine', 'langoustines', 'shellfish', 'shell fish',
    'lobster base', 'clam juice', 'shrimp poaching liquid'
  ],
  fish: [
    'fish', 'salmon', 'tuna', 'cod', 'halibut', 'trout', 'bass', 'mackerel',
    'sardine', 'sardines', 'anchovy', 'anchovies', 'anchovy paste', 'fish sauce',
    'worcestershire', 'worcestershire sauce'
  ],
  soy: [
    'soy', 'soybean', 'soybeans', 'soy sauce', 'tamari', 'miso', 'tofu',
    'edamame', 'tempeh', 'soybean oil', 'soy lecithin', 'teriyaki', 'soy milk'
  ],
  peanuts: [
    'peanut', 'peanuts', 'peanut butter', 'peanut oil', 'groundnut', 'groundnuts'
  ],
  tree_nuts: [
    'almond', 'almonds', 'almond extract', 'walnut', 'walnuts', 'pecan', 'pecans',
    'cashew', 'cashews', 'pistachio', 'pistachios', 'hazelnut', 'hazelnuts',
    'macadamia', 'macadamia nut', 'macadamia nuts', 'brazil nut', 'brazil nuts',
    'pine nut', 'pine nuts', 'pignoli', 'chestnut', 'chestnuts', 'nut',
    'nuts', 'tree nut', 'tree nuts'
  ],
  sesame: [
    'sesame', 'sesame seed', 'sesame seeds', 'sesame oil', 'tahini', 'benne',
    'benne seed', 'benne seeds', 'sesame seed bun'
  ],
  msg: [
    'msg', 'monosodium glutamate', 'hydrolyzed', 'autolyzed', 'yeast extract',
    'textured protein', 'soy protein', 'whey protein', 'natural flavor',
    'artificial flavor', 'seasoning', 'seasonings', 'flavor enhancer'
  ],
  onion_garlic: [
    'onion', 'onions', 'garlic', 'shallot', 'shallots', 'scallion', 'scallions',
    'chive', 'chives', 'leek', 'leeks', 'onion powder', 'garlic powder',
    'garlic puree', 'minced garlic', 'roasted garlic', 'garlic crouton',
    'garlic croutons', 'onion soup', 'caramelized onions', 'red onion',
    'white onion', 'yellow onion', 'green onion', 'spring onion'
  ],
  tomato: [
    'tomato', 'tomatoes', 'tomato paste', 'tomato sauce', 'tomato jam',
    'tomato basil', 'cherry tomato', 'cherry tomatoes', 'tomato wedges',
    'tomato juice', 'sun-dried tomato', 'sun dried tomato', 'tomato puree'
  ],
};

/**
 * Analyze if a dish can be modified to remove an allergen
 */
function analyzeModificationPossibility(dish: MenuItem, allergen: Allergen): {
  modifiable: boolean;
  reason?: string;
  suggestion?: string;
} {
  const dishName = dish.dish_name.toLowerCase();
  const description = dish.description.toLowerCase();
  
  // NO MODIFICATIONS POSSIBLE scenarios:
  
  // Main protein IS the allergen
  if (
    (dishName.includes('calamari') || 
     dishName.includes('shrimp') || 
     dishName.includes('crab') ||
     dishName.includes('scallop') ||
     dishName.includes('salmon') ||
     dishName.includes('cod') ||
     dishName.includes('halibut') ||
     dishName.includes('tuna')) && 
    (allergen === 'shellfish' || allergen === 'fish')
  ) {
    return {
      modifiable: false,
      reason: 'The main component of this dish is the allergen and cannot be substituted'
    };
  }
  
  // Allergen baked/fried into dish
  if (
    (dishName.includes('baked') || 
     dishName.includes('fried') ||
     dishName.includes('crusted') ||
     description.includes('baked in the oven') ||
     description.includes('deep fried')) &&
    dish.ingredients?.some(ing => {
      const ingLower = ing.toLowerCase();
      return allergenIngredients[allergen]?.some(allergenIng => 
        ingLower.includes(allergenIng.toLowerCase())
      );
    })
  ) {
    return {
      modifiable: false,
      reason: 'The allergen is baked or fried into the dish and cannot be removed'
    };
  }
  
  // Core ingredient defines the dish
  if (
    (dishName.includes('mac and cheese') ||
     dishName.includes('cheesecake') ||
     dishName.includes('creamed') ||
     dishName.includes('bisque') ||
     dishName.includes('au gratin')) &&
    allergen === 'dairy'
  ) {
    return {
      modifiable: false,
      reason: 'The allergen is a core ingredient that defines this dish'
    };
  }
  
  // Eggs are main component in breakfast dishes
  if (
    (dishName.includes('breakfast') || 
     dishName.includes('omelet') || 
     dishName.includes('benedict') ||
     dishName.includes('french toast') ||
     dishName.includes('pancake')) &&
    allergen === 'egg'
  ) {
    return {
      modifiable: false,
      reason: 'Eggs are the main component of this dish and cannot be substituted'
    };
  }
  
  // Sauce/dressing mixed in (Caesar salad with anchovy)
  if (
    dishName.includes('caesar') && 
    allergen === 'shellfish'
  ) {
    return {
      modifiable: false,
      reason: 'The dressing contains anchovy which cannot be separated from the salad'
    };
  }
  
  // Pre-prepared mixtures (meatballs, crab cakes, etc.)
  if (
    (description.includes('consists of a mixture') ||
     description.includes('mixture of') ||
     description.includes('mixed with')) &&
    !dishName.includes('salad') // Salads can be modified
  ) {
    return {
      modifiable: false,
      reason: 'The allergen is part of a pre-made mixture that cannot be separated'
    };
  }
  
  // MODIFICATIONS POSSIBLE scenarios:
  
  // Side dressings (salads)
  if (
    dishName.includes('salad') &&
    !dishName.includes('caesar')
  ) {
    const safeDressings = ['citrus lime vinaigrette', 'balsamic vinaigrette', 'red wine vinaigrette', 'lemon herb vinaigrette'];
    return {
      modifiable: true,
      suggestion: `Choose allergen-free dressing option (${safeDressings.join(' or ')})`
    };
  }
  
  // Removable garnish/toppings
  if (
    description.includes('topped with') ||
    description.includes('garnished with') ||
    description.includes('sprinkled with')
  ) {
    return {
      modifiable: true,
      suggestion: 'Request dish without the garnish containing the allergen'
    };
  }
  
  // Side sauces/condiments
  if (
    description.includes('served with') ||
    description.includes('ramekin of') ||
    description.includes('on the side')
  ) {
    return {
      modifiable: true,
      suggestion: 'Request dish without the side sauce/condiment containing the allergen'
    };
  }
  
  // Default to no modification if unclear
  return {
    modifiable: false,
    reason: 'Unable to safely modify this dish to remove the allergen'
  };
}

/**
 * Find specific ingredients in the dish description that contain the allergen
 */
function findAllergenIngredients(description: string, allergen: Allergen): string[] {
  if (!description) return [];
  
  const descriptionLower = description.toLowerCase();
  const ingredients = allergenIngredients[allergen];
  const found: string[] = [];
  
  for (const ingredient of ingredients) {
    const ingredientLower = ingredient.toLowerCase();
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${ingredientLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(descriptionLower)) {
      // Find the actual word as it appears in the description (preserve case)
      const matches = description.match(regex);
      if (matches && matches.length > 0) {
        // Add unique matches
        matches.forEach(match => {
          if (!found.includes(match)) {
            found.push(match);
          }
        });
      }
    }
  }
  
  return found;
}

/**
 * Find custom allergen terms in the dish description
 */
function findCustomAllergenIngredients(description: string, customAllergen: string): string[] {
  if (!description || !customAllergen.trim()) return [];
  
  const descriptionLower = description.toLowerCase();
  const allergenLower = customAllergen.toLowerCase().trim();
  const found: string[] = [];
  
  // Use word boundaries to find the custom allergen term
  const regex = new RegExp(`\\b${allergenLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  if (regex.test(descriptionLower)) {
    // Find the actual word as it appears in the description (preserve case)
    const matches = description.match(regex);
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        if (!found.includes(match)) {
          found.push(match);
        }
      });
    }
  }
  
  return found;
}

// Helper to get allergen label
const ALLERGEN_LABELS: Record<Allergen, string> = {
  dairy: 'Dairy',
  egg: 'Egg',
  gluten: 'Gluten',
  shellfish: 'Shellfish',
  fish: 'Fish',
  soy: 'Soy',
  peanuts: 'Peanuts',
  tree_nuts: 'Tree Nuts',
  sesame: 'Sesame',
  msg: 'MSG',
  onion_garlic: 'Onion/Garlic',
  tomato: 'Tomato',
};

// Check if dish is a prepared food that cannot be modified (soups, bisques, desserts, etc.)
function isPreparedFood(dish: MenuItem): boolean {
  const description = dish.description.toLowerCase();
  const dishName = dish.dish_name.toLowerCase();
  const category = dish.category.toLowerCase();
  
  // Soups, bisques, and pre-made items
  const preparedKeywords = ['soup', 'bisque', 'stew', 'chili', 'gumbo'];
  const isSoup = preparedKeywords.some(keyword => 
    dishName.includes(keyword) || 
    description.includes(keyword) ||
    category.includes('soup')
  );
  
  // Desserts are typically pre-prepared (baked, chilled, etc.)
  const isDessert = category.includes('dessert');
  
  // Items that are baked/roasted in the oven and served as-is (cannot be deconstructed)
  // Examples: Baked Goat Cheese, Mac and Cheese (baked), Au Gratin Potatoes
  const bakedKeywords = [
    'baked in the oven',
    'baked slowly',
    'baked and',
    'baked.',
    'roasted to a golden brown in the oven',
    'roasted in the oven',
    'simmered', // Soups and stews that are simmered
    'braised', // Braised items like short ribs
    'slow roasted', // Prime rib, duck
    'slowly braised'
  ];
  const isBakedPrepared = bakedKeywords.some(keyword => 
    description.includes(keyword) && 
    // Exclude items that are baked but can still be modified (like steaks that are broiled)
    !description.includes('broiled') &&
    !description.includes('grilled')
  );
  
  // Items that are pre-made mixtures that cannot be separated
  // Examples: crab cakes (mixture of ingredients), meatballs (mixture)
  // Note: Soups/bisques are already caught by isSoup, so exclude them here
  const preMadeKeywords = [
    'consists of a mixture',
    'mixture of',
  ];
  const isPreMadeMixture = preMadeKeywords.some(keyword => 
    description.includes(keyword) &&
    // Exclude soups/bisques (already handled by isSoup)
    !isSoup &&
    // Exclude items that are just mixed but can be modified (like salads)
    !category.includes('salad')
  );
  
  // Check if dish has cannot_be_made_safe_notes
  const hasCannotBeMadeSafeNote = !!(dish.cannot_be_made_safe_notes && 
    dish.cannot_be_made_safe_notes.trim() !== '');
  
  return isSoup || isDessert || isBakedPrepared || isPreMadeMixture || hasCannotBeMadeSafeNote;
}

/**
 * Check if an ingredient is a garnish (can be removed even from pre-prepared foods)
 * Garnishes are typically mentioned after "garnished with", "topped with", "served with", etc.
 */
function isGarnishIngredient(dish: MenuItem, ingredient: string): boolean {
  const description = dish.description.toLowerCase();
  const ingredientLower = ingredient.toLowerCase();
  
  // Check if ingredient appears after garnish-related phrases
  const garnishPhrases = [
    'garnished with',
    'garnished',
    'topped with',
    'topped',
    'served with',
    'served',
    'with a side of',
    'on the side',
    'accompanied by',
    'with a ramekin of',
    'ramekin of'
  ];
  
  for (const phrase of garnishPhrases) {
    const phraseIndex = description.indexOf(phrase);
    if (phraseIndex !== -1) {
      // Check if ingredient appears after the garnish phrase
      const afterPhrase = description.substring(phraseIndex + phrase.length);
      if (afterPhrase.includes(ingredientLower)) {
        return true;
      }
    }
  }
  
  // Also check if it's explicitly mentioned as a garnish in the description
  if (description.includes('garnish') && description.includes(ingredientLower)) {
    return true;
  }
  
  return false;
}

/**
 * Check if this is the breakfast potatoes dish where onions cannot be substituted
 */
function isBreakfastPotatoes(dish: MenuItem): boolean {
  const dishName = dish.dish_name.toLowerCase();
  const description = dish.description.toLowerCase();
  
  // Check for breakfast potatoes or red skin mashed potatoes in brunch menu
  return (
    (dishName.includes('breakfast') && dishName.includes('potato')) ||
    (dishName.includes('red skin') && dishName.includes('mashed') && dishName.includes('potato')) ||
    (!!dish.menu && dish.menu.toLowerCase().includes('brunch') && description.includes('red skin') && description.includes('potato'))
  );
}

// Check if dish is a steak dish
function isSteakDish(dish: MenuItem): boolean {
  const description = dish.description.toLowerCase();
  const dishName = dish.dish_name.toLowerCase();
  const category = dish.category.toLowerCase();
  
  // Steak-related keywords
  const steakKeywords = [
    'steak', 'filet', 'filet mignon', 'porterhouse', 'prime rib', 
    'tenderloin', 'strip', 'ribeye', 'sirloin', 'coulotte', 
    'new york strip', 't-bone', 'cowboy', 'lamb chop', 'lamb porterhouse'
  ];
  
  return steakKeywords.some(keyword => 
    dishName.includes(keyword) || 
    description.includes(keyword) ||
    category.includes('filet') ||
    category.includes('steak')
  );
}

// Check if dish is a salad
function isSaladDish(dish: MenuItem): boolean {
  const description = dish.description.toLowerCase();
  const dishName = dish.dish_name.toLowerCase();
  const category = dish.category.toLowerCase();
  
  // Salad-related keywords
  const saladKeywords = ['salad', 'caesar', 'field', 'romaine', 'lettuce', 'greens'];
  
  return category.includes('salad') || 
         saladKeywords.some(keyword => 
           dishName.includes(keyword) || 
           description.includes(keyword)
         );
}

/**
 * Check if a composite ingredient contains an allergen by checking its sub-ingredients
 */
function compositeContainsAllergen(compositeIngredient: string, allergen: Allergen): boolean {
  const subIngredients = getSubIngredients(compositeIngredient);
  if (subIngredients.length === 0) return false;
  
  const allergenList = allergenIngredients[allergen];
  return subIngredients.some(subIng => 
    allergenList.some(allergenIng => 
      subIng.toLowerCase().includes(allergenIng.toLowerCase()) ||
      allergenIng.toLowerCase().includes(subIng.toLowerCase())
    )
  );
}

/**
 * Find the most specific ingredient name from dish.ingredients that matches a found ingredient
 * For example, if foundIngredients has "mushroom" but dish.ingredients has "mushroom gravy",
 * return "mushroom gravy" instead
 */
function findMostSpecificIngredientName(foundIngredient: string, dish: MenuItem): string {
  if (!dish.ingredients || dish.ingredients.length === 0) {
    return foundIngredient;
  }
  
  const foundLower = foundIngredient.toLowerCase();
  
  // Find all ingredients that contain the found ingredient
  const matchingIngredients = dish.ingredients.filter(ing => 
    ing.toLowerCase().includes(foundLower) || foundLower.includes(ing.toLowerCase())
  );
  
  if (matchingIngredients.length === 0) {
    return foundIngredient;
  }
  
  // Return the longest/most specific match
  return matchingIngredients.reduce((longest, current) => 
    current.length > longest.length ? current : longest
  );
}

/**
 * Get all composite ingredients in a dish that contain a specific allergen
 */
function getCompositeIngredientsWithAllergen(dish: MenuItem, allergen: Allergen): string[] {
  if (!dish.ingredients || dish.ingredients.length === 0) return [];
  
  const composites: string[] = [];
  for (const ingredient of dish.ingredients) {
    const ingredientLower = ingredient.toLowerCase().trim();
    // Check if this is a composite ingredient
    if (compositeIngredients[ingredientLower]) {
      // Check if it contains the allergen
      if (compositeContainsAllergen(ingredientLower, allergen)) {
        composites.push(ingredient);
      }
    }
  }
  return composites;
}

// Generate substitution list for an allergen
function generateSubstitutions(dish: MenuItem, allergen: Allergen, canModify: boolean, foundIngredients: string[]): string[] {
  // First check modification possibility
  const modAnalysis = analyzeModificationPossibility(dish, allergen);
  
  // If modification is not possible, return the reason
  if (!modAnalysis.modifiable) {
    if (modAnalysis.reason) {
      return [`NOT POSSIBLE - ${modAnalysis.reason}`];
    }
    return ['NOT POSSIBLE - This dish cannot be modified to remove the allergen'];
  }
  
  const isPrepared = isPreparedFood(dish);
  
  // For pre-prepared foods, filter to only garnish ingredients
  let ingredientsToProcess = foundIngredients;
  if (isPrepared) {
    const garnishIngredients = foundIngredients.filter(ing => isGarnishIngredient(dish, ing));
    
    // If it's pre-prepared and has no garnish ingredients, return special message
    if (garnishIngredients.length === 0) {
      return ['NOT POSSIBLE - This dish has been pre-prepared and cannot be modified'];
    }
    
    // Only process garnish ingredients for pre-prepared foods
    ingredientsToProcess = garnishIngredients;
  }
  
  if (!canModify && !isPrepared) {
    return [`NO ${ALLERGEN_LABELS[allergen]}`];
  }
  
  // If modification analysis suggests a specific approach, include it
  if (modAnalysis.suggestion) {
    // Continue with normal substitution generation, but the suggestion will be considered
  }

  const substitutions: string[] = [];
  
  // Get composite ingredients that contain this allergen
  // For pre-prepared foods, only check garnish ingredients
  const compositeWithAllergen = isPrepared 
    ? getCompositeIngredientsWithAllergen(dish, allergen).filter(composite => 
        isGarnishIngredient(dish, composite)
      )
    : getCompositeIngredientsWithAllergen(dish, allergen);
  
  /**
   * Helper function to get the most descriptive ingredient name for substitution
   * Checks dish.ingredients first for specific names, then falls back to found ingredient
   */
  const getDescriptiveIngredientName = (foundIngredient: string): string => {
    // First check if there's a more specific match in dish.ingredients
    if (dish.ingredients && dish.ingredients.length > 0) {
      const foundLower = foundIngredient.toLowerCase();
      const specificMatch = dish.ingredients.find(ing => {
        const ingLower = ing.toLowerCase();
        // Check if dish ingredient contains the found ingredient (more specific)
        return ingLower.includes(foundLower) && ingLower.length > foundLower.length;
      });
      if (specificMatch) {
        return specificMatch;
      }
    }
    return foundIngredient;
  };
  
  // Generate specific substitutions based on allergen type
  switch (allergen) {
    case 'dairy':
      // Check for composite ingredients containing dairy
      for (const composite of compositeWithAllergen) {
        const subIngs = getSubIngredients(composite.toLowerCase());
        const dairySubs = subIngs.filter(sub => 
          allergenIngredients.dairy.some(dairyIng => 
            sub.toLowerCase().includes(dairyIng.toLowerCase()) ||
            dairyIng.toLowerCase().includes(sub.toLowerCase())
          )
        );
        if (dairySubs.length > 0) {
          substitutions.push(`NO ${composite} (contains: ${dairySubs.join(', ')})`);
        } else {
          substitutions.push(`NO ${composite}`);
        }
      }
      
      // For steak dishes, handle steak butter and pre-mark butter separately
      if (isSteakDish(dish)) {
        const hasSteakButter = ingredientsToProcess.some(ing => 
          ing.toLowerCase().includes('steak butter') || ing.toLowerCase() === 'steak butter'
        ) || dish.ingredients?.some(ing => ing.toLowerCase().includes('steak butter'));
        const hasPreMarkButter = ingredientsToProcess.some(ing => 
          ing.toLowerCase().includes('pre-mark butter') || ing.toLowerCase() === 'pre-mark butter' ||
          ing.toLowerCase().includes('premark butter') || ing.toLowerCase() === 'premark butter'
        ) || dish.ingredients?.some(ing => 
          ing.toLowerCase().includes('pre-mark butter') || ing.toLowerCase().includes('premark butter')
        );
        const hasOtherButter = ingredientsToProcess.some(ing => 
          ing.toLowerCase().includes('butter') && 
          !ing.toLowerCase().includes('steak butter') && 
          !ing.toLowerCase().includes('pre-mark butter') &&
          !ing.toLowerCase().includes('premark butter')
        ) || dish.ingredients?.some(ing => 
          ing.toLowerCase().includes('butter') && 
          !ing.toLowerCase().includes('steak butter') && 
          !ing.toLowerCase().includes('pre-mark butter') &&
          !ing.toLowerCase().includes('premark butter')
        );
        
        if (hasSteakButter && !compositeWithAllergen.some(c => c.toLowerCase().includes('steak butter'))) {
          substitutions.push('NO steak butter');
        }
        if (hasPreMarkButter && !compositeWithAllergen.some(c => c.toLowerCase().includes('pre-mark butter') || c.toLowerCase().includes('premark butter'))) {
          substitutions.push('NO pre-mark butter');
        }
        if (hasOtherButter && !compositeWithAllergen.some(c => c.toLowerCase().includes('butter'))) {
          substitutions.push('NO butter (use oil)');
        }
      } else {
        // For non-steak dishes, check for general butter
        if (ingredientsToProcess.some(ing => ing.toLowerCase().includes('butter')) || 
            dish.ingredients?.some(ing => ing.toLowerCase().includes('butter'))) {
          if (!compositeWithAllergen.some(c => c.toLowerCase().includes('butter'))) {
            substitutions.push('NO butter (use oil)');
          }
        }
      }
      
      // Check for specific dairy ingredients - use most specific names from dish.ingredients
      // Order matters - check more specific terms first
      const dairyIngredients = [
        'whipping cream', 'half and half', 'whole milk', 'skim milk',
        'white cheddar cheese', 'yellow cheese spread', 'cheddar cheese',
        'sour cream', 'buttermilk', 'cheese', 'cream', 'milk', 'yogurt'
      ];
      for (const dairyIng of dairyIngredients) {
        const foundIng = ingredientsToProcess.find(ing => ing.toLowerCase().includes(dairyIng));
        const dishIng = dish.ingredients?.find(ing => ing.toLowerCase().includes(dairyIng));
        
        if (foundIng || dishIng) {
          if (!compositeWithAllergen.some(c => c.toLowerCase().includes(dairyIng))) {
            // Use the most specific ingredient name
            const specificName = foundIng 
              ? findMostSpecificIngredientName(foundIng, dish)
              : (dishIng || dairyIng);
            
            if (dairyIng === 'cream' || dairyIng === 'whipping cream' || dairyIng === 'half and half') {
              substitutions.push(`NO ${specificName} (use non-dairy alternative)`);
            } else if (dairyIng === 'cheese' || dairyIng.includes('cheese')) {
              substitutions.push(`NO ${specificName}`);
            } else {
              substitutions.push(`NO ${specificName}`);
            }
          }
        }
      }
      
      if (substitutions.length === 0) {
        substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
      }
      break;
    case 'gluten':
      // Check for bread/bun with descriptive names - check more specific types first
      const breadTypes = ['english muffin', 'english muffins', 'brioche bread', 'brioche', 'sesame seed bun', 'buttery onion bun', 'multi-grain bread', 'flatbread', 'bun', 'bread', 'toast'];
      let breadIng: string | undefined;
      
      // Find the most specific bread type
      for (const breadTypeCheck of breadTypes) {
        const found = ingredientsToProcess.find(ing => ing.toLowerCase().includes(breadTypeCheck)) ||
                     dish.ingredients?.find(ing => ing.toLowerCase().includes(breadTypeCheck));
        if (found) {
          breadIng = found;
          break;
        }
      }
      
      if (breadIng) {
        const descriptiveBread = getDescriptiveIngredientName(breadIng);
        substitutions.push(`NO ${descriptiveBread} (use gluten-free)`);
      }
      
      // Check for croutons with descriptive names
      const croutonIng = ingredientsToProcess.find(ing => ing.toLowerCase().includes('crouton')) ||
                        dish.ingredients?.find(ing => ing.toLowerCase().includes('crouton'));
      if (croutonIng) {
        const descriptiveCrouton = getDescriptiveIngredientName(croutonIng);
        // ONLY salads can have gluten-free croutons as substitution
        // All proteins (filets, steaks, etc.) served with croutons must have croutons removed
        if (isSaladDish(dish) && !isSteakDish(dish)) {
          substitutions.push(`Gluten Free ${descriptiveCrouton}`);
        } else {
          // For proteins or any non-salad dish, remove croutons completely
          substitutions.push(`NO ${descriptiveCrouton}`);
        }
      }
      
      // Check for flour with descriptive names
      const flourIng = ingredientsToProcess.find(ing => ing.toLowerCase().includes('flour')) ||
                      dish.ingredients?.find(ing => ing.toLowerCase().includes('flour'));
      if (flourIng) {
        const descriptiveFlour = getDescriptiveIngredientName(flourIng);
        substitutions.push(`NO ${descriptiveFlour} (use gluten-free alternative)`);
      }
      
      // Check for crackers, breadcrumbs, etc.
      const crackerIng = ingredientsToProcess.find(ing => ing.toLowerCase().includes('cracker')) ||
                        dish.ingredients?.find(ing => ing.toLowerCase().includes('cracker'));
      if (crackerIng) {
        const descriptiveCracker = getDescriptiveIngredientName(crackerIng);
        substitutions.push(`NO ${descriptiveCracker} (use gluten-free alternative)`);
      }
      
      // Check for pasta/macaroni
      const pastaIng = ingredientsToProcess.find(ing => 
        ing.toLowerCase().includes('macaroni') || 
        ing.toLowerCase().includes('pasta') ||
        ing.toLowerCase().includes('noodle')
      ) || dish.ingredients?.find(ing => 
        ing.toLowerCase().includes('macaroni') || 
        ing.toLowerCase().includes('pasta') ||
        ing.toLowerCase().includes('noodle')
      );
      if (pastaIng) {
        const descriptivePasta = getDescriptiveIngredientName(pastaIng);
        substitutions.push(`NO ${descriptivePasta} (use gluten-free alternative)`);
      }
      
      if (substitutions.length === 0) {
        substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
      }
      break;
    case 'shellfish':
    case 'fish':
      substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
      break;
    case 'egg':
      // Dish-specific substitutions for Steak and Blue Cheese Salad
      if (dish.id === 'steak_and_blue_cheese_salad' || dish.dish_name.toLowerCase().includes('steak and blue cheese salad')) {
        substitutions.push('NO ranch');
        substitutions.push('NO crispy onions');
      } else {
        // Check for composite ingredients containing egg
        for (const composite of compositeWithAllergen) {
          const subIngs = getSubIngredients(composite.toLowerCase());
          const eggSubs = subIngs.filter(sub => 
            allergenIngredients.egg.some(eggIng => 
              sub.toLowerCase().includes(eggIng.toLowerCase()) ||
              eggIng.toLowerCase().includes(sub.toLowerCase())
            )
          );
          if (eggSubs.length > 0) {
            substitutions.push(`NO ${composite} (contains: ${eggSubs.join(', ')})`);
          } else {
            substitutions.push(`NO ${composite}`);
          }
        }
        
        // General egg substitutions for raw ingredients - use descriptive names
        const mayoIng = ingredientsToProcess.find(ing => 
          ing.toLowerCase().includes('mayo') && !compositeWithAllergen.some(c => c.toLowerCase().includes(ing.toLowerCase()))
        ) || dish.ingredients?.find(ing => 
          ing.toLowerCase().includes('mayo') && !compositeWithAllergen.some(c => c.toLowerCase().includes(ing.toLowerCase()))
        );
        if (mayoIng) {
          const descriptiveMayo = getDescriptiveIngredientName(mayoIng);
          substitutions.push(`NO ${descriptiveMayo}`);
        }
        
        const ranchIng = ingredientsToProcess.find(ing => 
          ing.toLowerCase().includes('ranch') && !compositeWithAllergen.some(c => c.toLowerCase().includes(ing.toLowerCase()))
        ) || dish.ingredients?.find(ing => 
          ing.toLowerCase().includes('ranch') && !compositeWithAllergen.some(c => c.toLowerCase().includes(ing.toLowerCase()))
        );
        if (ranchIng) {
          const descriptiveRanch = getDescriptiveIngredientName(ranchIng);
          const subIngs = getSubIngredients(descriptiveRanch.toLowerCase());
          const eggSubs = subIngs.filter(sub => 
            allergenIngredients.egg.some(eggIng => 
              sub.toLowerCase().includes(eggIng.toLowerCase())
            )
          );
          if (eggSubs.length > 0) {
            substitutions.push(`NO ${descriptiveRanch} (contains: ${eggSubs.join(', ')})`);
          } else {
            substitutions.push(`NO ${descriptiveRanch}`);
          }
        }
        
        // Check for egg directly
        const eggIng = ingredientsToProcess.find(ing => 
          ing.toLowerCase().includes('egg') && !ing.toLowerCase().includes('mayo') && !ing.toLowerCase().includes('ranch')
        ) || dish.ingredients?.find(ing => 
          ing.toLowerCase().includes('egg') && !ing.toLowerCase().includes('mayo') && !ing.toLowerCase().includes('ranch')
        );
        if (eggIng) {
          const descriptiveEgg = getDescriptiveIngredientName(eggIng);
          substitutions.push(`NO ${descriptiveEgg}`);
      }
      if (substitutions.length === 0) {
        substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
        }
      }
      break;
    case 'soy':
      if (ingredientsToProcess.some(ing => ing.toLowerCase().includes('soy sauce') || ing.toLowerCase().includes('tamari'))) {
        substitutions.push('NO soy sauce (use coconut aminos)');
      } else {
        substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
      }
      break;
    case 'sesame':
      if (ingredientsToProcess.some(ing => ing.toLowerCase().includes('sesame seed bun'))) {
        substitutions.push('NO sesame seed bun (use regular bun)');
      } else {
        substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
      }
      break;
    case 'onion_garlic':
      // Special case: breakfast potatoes - onions cannot be substituted
      if (isBreakfastPotatoes(dish)) {
        // Check if this is specifically about onions in the breakfast potatoes
        const hasOnions = ingredientsToProcess.some(ing => 
          ing.toLowerCase().includes('onion') && 
          !ing.toLowerCase().includes('garlic')
        ) || dish.ingredients?.some(ing => 
          ing.toLowerCase().includes('onion') && 
          !ing.toLowerCase().includes('garlic')
        );
        
        if (hasOnions) {
          // Use most descriptive name
          const onionIng = ingredientsToProcess.find(ing => 
            ing.toLowerCase().includes('onion') && !ing.toLowerCase().includes('garlic')
          ) || dish.ingredients?.find(ing => 
            ing.toLowerCase().includes('onion') && !ing.toLowerCase().includes('garlic')
          );
          const descriptiveName = onionIng ? getDescriptiveIngredientName(onionIng) : 'onion';
          substitutions.push(`NOT POSSIBLE - ${descriptiveName} cannot be substituted in this dish`);
        } else {
          // For garlic or general onion/garlic, allow substitution with descriptive names
          const descriptiveNames = ingredientsToProcess.map(ing => getDescriptiveIngredientName(ing));
          if (descriptiveNames.length > 0) {
            substitutions.push(...descriptiveNames.map(name => `NO ${name}`));
          } else {
            substitutions.push('NO onion/garlic');
          }
        }
      } else {
        // Use most descriptive ingredient names
        const descriptiveNames = ingredientsToProcess.map(ing => getDescriptiveIngredientName(ing));
        if (descriptiveNames.length > 0) {
          substitutions.push(...descriptiveNames.map(name => `NO ${name}`));
        } else {
      substitutions.push('NO onion/garlic');
        }
      }
      break;
    case 'tomato':
      // Use most descriptive ingredient names
      const tomatoDescriptiveNames = ingredientsToProcess.map(ing => getDescriptiveIngredientName(ing));
      if (tomatoDescriptiveNames.length > 0) {
        substitutions.push(...tomatoDescriptiveNames.map(name => `NO ${name}`));
      } else {
      substitutions.push('NO tomato');
      }
      break;
    default:
      substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
  }

  return substitutions;
}

export function checkDishSafety(
  dish: MenuItem,
  allergies: Allergen[],
  customAllergies: string[] = []
): AllergyCheckResult {
  const canModify = !isPreparedFood(dish) && !(dish.cannot_be_made_safe_notes && dish.cannot_be_made_safe_notes.trim() !== '');
  
  const perAllergy = allergies.map((allergen) => {
    // For onion_garlic and tomato, check description only (no CSV column)
    const isDescriptionOnly = allergen === 'onion_garlic' || allergen === 'tomato';
    
    let containsValue: 'Y' | 'N' | '' | null = null;
    let contains = false;
    let foundIngredients: string[] = [];
    
    if (isDescriptionOnly) {
      // Check description for these allergens
      foundIngredients = findAllergenIngredients(dish.description, allergen);
      contains = foundIngredients.length > 0;
      containsValue = contains ? 'Y' : 'N';
    } else {
      // Check CSV column for other allergens
      const column = allergenToColumn[allergen];
      if (column) {
        containsValue = dish[column] as 'Y' | 'N' | '' | null;
        contains = containsValue === 'Y';
        // Also find ingredients in description for display
        if (contains) {
          foundIngredients = findAllergenIngredients(dish.description, allergen);
        }
      }
    }
    
    // Also check dish.ingredients array for composite ingredients that contain this allergen
    if (dish.ingredients && dish.ingredients.length > 0) {
      const compositeWithAllergen = getCompositeIngredientsWithAllergen(dish, allergen);
      if (compositeWithAllergen.length > 0) {
        contains = true;
        containsValue = 'Y';
        // Add composite ingredients to found ingredients if not already present
        compositeWithAllergen.forEach(composite => {
          if (!foundIngredients.some(ing => ing.toLowerCase() === composite.toLowerCase())) {
            foundIngredients.push(composite);
          }
        });
      }
    }

    // For dairy allergen and steak dishes, automatically mark with pre-mark butter and steak butter
    // ALL steak dishes are pre-prepared with pre-mark butter and have steak butter
    if (allergen === 'dairy' && isSteakDish(dish)) {
      // Mark as containing dairy (all steaks have these butters)
      contains = true;
      containsValue = 'Y';
      
      // Add pre-mark butter and steak butter to found ingredients if not already present
      const hasPreMarkButter = foundIngredients.some(ing => 
        ing.toLowerCase().includes('pre-mark butter') || ing.toLowerCase().includes('premark butter')
      );
      const hasSteakButter = foundIngredients.some(ing => 
        ing.toLowerCase().includes('steak butter')
      );
      
      if (!hasPreMarkButter) {
        foundIngredients.push('pre-mark butter');
      }
      if (!hasSteakButter) {
        foundIngredients.push('steak butter');
      }
    }

    const status: 'safe' | 'unsafe' = (containsValue === 'Y' || contains) ? 'unsafe' : 'safe';
    const substitutions = status === 'unsafe' ? generateSubstitutions(dish, allergen, canModify, foundIngredients) : [];
    
    // Determine if modification is actually possible based on analyzeModificationPossibility
    // This overrides the general canModify flag for specific cases
    const modAnalysis = analyzeModificationPossibility(dish, allergen);
    const actualCanBeModified = modAnalysis.modifiable && canModify;

    return {
      allergen,
      contains,
      status,
      canBeModified: actualCanBeModified,
      substitutions,
      foundIngredients: foundIngredients.length > 0 ? foundIngredients : undefined,
    };
  });

  // Check custom allergens
  const customAllergyResults = customAllergies.map((customAllergen) => {
    const foundIngredients = findCustomAllergenIngredients(dish.description, customAllergen);
    const contains = foundIngredients.length > 0;
    const status: 'safe' | 'unsafe' = contains ? 'unsafe' : 'safe';
    
    // Generate descriptive substitutions using most specific ingredient names
    let substitutions: string[] = [];
    if (status === 'unsafe') {
      if (!canModify) {
        substitutions = [`NOT POSSIBLE - Cannot remove ${customAllergen} - dish cannot be modified`];
      } else {
        // Use most descriptive ingredient names from dish.ingredients
        const descriptiveNames = foundIngredients.map(ing => {
          if (dish.ingredients && dish.ingredients.length > 0) {
            const foundLower = ing.toLowerCase();
            const specificMatch = dish.ingredients.find(dishIng => {
              const dishIngLower = dishIng.toLowerCase();
              return dishIngLower.includes(foundLower) && dishIngLower.length > foundLower.length;
            });
            return specificMatch || ing;
          }
          return ing;
        });
        
        // Remove duplicates and create substitutions
        const uniqueNames = [...new Set(descriptiveNames)];
        substitutions = uniqueNames.map(name => `NO ${name}`);
      }
    }

    return {
      allergen: customAllergen,
      contains,
      status,
      canBeModified: canModify,
      substitutions,
      foundIngredients: foundIngredients.length > 0 ? foundIngredients : undefined,
    };
  });

  // Combine all allergy results
  const allPerAllergy = [...perAllergy, ...customAllergyResults];

  // Determine overall status - if ANY allergen is unsafe, overall is unsafe
  const overallStatus: 'safe' | 'unsafe' = allPerAllergy.some((a) => a.status === 'unsafe') ? 'unsafe' : 'safe';

  // Generate global message
  let globalMessage: string;
  if (overallStatus === 'unsafe') {
    if (!canModify) {
      globalMessage = 'Cannot be changed after preparation. This dish contains allergens and cannot be modified.';
    } else {
      globalMessage = 'This dish contains allergens. See substitutions below.';
    }
  } else {
    globalMessage = 'No Changes';
  }

  return {
    dish,
    selectedAllergies: allergies,
    customAllergies,
    overallStatus,
    perAllergy: allPerAllergy,
    globalMessage,
  };
}


