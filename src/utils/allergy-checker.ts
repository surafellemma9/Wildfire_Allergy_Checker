import type { Allergen, AllergyCheckResult, MenuItem } from '../types';
import { getCachedModification, hasDbModifications } from './modifications-cache';

// Knowledge base of composite ingredients (sauces, condiments, etc.) and their sub-ingredients
const compositeIngredients: Record<string, string[]> = {
  // Dairy-based
  'buttermilk': ['milk', 'cultured milk', 'lactic acid'],
  'ranch dressing': ['buttermilk', 'mayonnaise', 'hidden valley ranch dry dressing'],
  'ranch': ['buttermilk', 'mayonnaise', 'hidden valley ranch dry dressing'],
  'apple ranch dressing': ['reduced apple cider', 'ranch dressing', 'parsley'],
  'yogurt sauce': ['greek yogurt', 'extra virgin olive oil', 'lemon juice', 'garlic', 'basil', 'mint', 'salt', 'pepper', 'cucumber'],
  'horseradish cream sauce': ['sour cream', 'prepared horseradish', 'salt', 'pepper'],
  'béarnaise': ['white balsamic vinegar', 'white wine', 'shallots', 'tarragon', 'egg yolks', 'clarified butter', 'salt', 'pepper', 'tarragon'],
  'béarnaise sauce': ['white balsamic vinegar', 'white wine', 'shallots', 'tarragon', 'egg yolks', 'clarified butter', 'salt', 'pepper', 'tarragon'],
  'hollandaise': ['egg yolks', 'white wine', 'lemon juice', 'tabasco sauce', 'worcestershire sauce', 'salt', 'pepper', 'butter'],
  'hollandaise sauce': ['egg yolks', 'white wine', 'lemon juice', 'tabasco sauce', 'worcestershire sauce', 'salt', 'pepper', 'butter'],
  'aioli': ['mayonnaise', 'garlic', 'lemon juice', 'olive oil'],
  'ancho mayo': ['mayonnaise', 'al pastor marinade'],
  'ancho mayonnaise': ['mayonnaise', 'al pastor marinade'],
  'spicy mayo': ['mayonnaise', 'sambal chili paste'],
  'mustard mayonnaise': ['mayonnaise', 'a1-steak sauce', 'worcestershire', 'whipping cream', 'dry mustard', 'salt'],
  
  // Sauces
  'cocktail sauce': ['heinz cocktail sauce', 'prepared horseradish', 'lemon juice', 'salt', 'pepper'],
  'apricot dipping sauce': ['apricot preserves', 'rice vinegar', 'sambal chili paste', 'garlic', 'ginger', 'cilantro', 'toasted sesame seeds', 'sesame oil', 'san j tamari', 'scallions'],
  'coconut dipping sauce': ['coconut milk', 'dark brown sugar', 'rice wine vinegar', 'tamari', 'ginger', 'chili paste'],
  'barbecue sauce': ['sweet baby rays original barbecue sauce', 'dried onion', 'garlic', 'butter', 'chili powder', 'paprika', 'cloves', 'cinnamon', 'dried basil', 'ginger puree', 'dried tarragon', 'ketchup', 'tomato paste', 'steak sauce', 'worcestershire sauce', 'molasses', 'san j tamari', 'water', 'red wine vinegar', 'lemon juice', 'beef base', 'pepper', 'chilies', 'balsamic vinegar', 'dijon mustard'],
  'bbq sauce': ['sweet baby rays original barbecue sauce', 'dried onion', 'garlic', 'butter', 'chili powder', 'paprika', 'cloves', 'cinnamon', 'dried basil', 'ginger puree', 'dried tarragon', 'ketchup', 'tomato paste', 'steak sauce', 'worcestershire sauce', 'molasses', 'san j tamari', 'water', 'red wine vinegar', 'lemon juice', 'beef base', 'pepper', 'chilies', 'balsamic vinegar', 'dijon mustard'],
  'hot honey sauce': ['honey', 'hot sauce', 'butter', 'vinegar'],
  'balsamic vinaigrette': ['house oil', 'balsamic vinegar', 'white balsamic vinegar', 'sugar', 'shallots', 'garlic', 'dijon mustard', 'salt', 'pepper'],
  'citrus lime vinaigrette': ['dry mustard', 'sugar', 'garlic', 'lime juice', 'red wine vinegar', 'oregano', 'chilies', 'al pastor marinade', 'kosher salt', 'house oil'],
  'citrus dressing': ['dry mustard', 'sugar', 'garlic', 'lime juice', 'red wine vinegar', 'oregano', 'chilies', 'al pastor marinade', 'kosher salt', 'house oil'],
  'lemon herb vinaigrette': ['lemon juice', 'red wine vinegar', 'water', 'lemon zest', 'shallots', 'garlic', 'salt', 'pepper', 'old bay seasoning', 'sugar', 'dijon mustard', 'house oil', 'extra virgin olive oil', 'thyme', 'basil'],
  'blue cheese dressing': ['mayonnaise', 'buttermilk', 'salt', 'pepper', 'blue cheese crumbles', 'tabasco sauce'],
  'lemon parmesan vinaigrette': ['lemon juice', 'garlic', 'dijon mustard', 'salt', 'black pepper', 'house oil', 'extra virgin olive oil', 'parmesan cheese'],
  'red wine vinaigrette': ['red wine vinegar', 'sugar', 'salt', 'pepper', 'oregano', 'thyme', 'basil', 'garlic puree', 'red chilies', 'parmesan', 'house oil'],
  'shallot balsamic sauce': ['shallots', 'butter', 'au jus', 'balsamic vinegar', 'veal demi glaze', 'cornstarch', 'sugar', 'salt', 'pepper'],
  'tartar sauce': ['mayonnaise', 'capers', 'lemon zest', 'lemon juice', 'shallots', 'pickle relish', 'dijon mustard', 'parsley', 'tabasco', 'worcestershire sauce'],
  'caesar dressing': ['anchovy', 'garlic', 'lemon juice', 'dijon mustard', 'asiago cheese', 'pasteurized egg yolk', 'red wine vinegar', 'house oil', 'salt', 'pepper'],
  'tomato basil sauce': ['plum tomatoes', 'onions', 'garlic', 'olive oil', 'salt', 'pepper', 'butter', 'oregano', 'sugar', 'tomato paste', 'basil'],
  'ranchero sauce': ['plum tomatoes', 'onions', 'jalapenos', 'water', 'salt', 'cilantro'],
  'au jus': ['beef fat from pre-roasted prime ribs', 'salt', 'pepper', 'house oil', 'garlic', 'onions', 'rosemary', 'bay leaf', 'thyme', 'beef base', 'veal demi glaze', 'water'],
  'beef stock': ['beef bones', 'rosemary', 'thyme', 'sage', 'celery', 'carrots', 'garlic', 'onions'],
  'mint chimichurri': ['parsley', 'mint', 'jalapenos', 'shallots', 'garlic', 'red wine vinegar', 'sugar', 'salt', 'pepper', 'extra virgin olive oil'],
  'mushroom gravy': ['chicken jus', 'butter', 'flour', 'beef jus', 'whipping cream', 'rosemary', 'roasted wild mushrooms'],
  
  // Marinades
  'mediterranean marinade': ['lemon juice', 'red wine vinegar', 'olive oil', 'garlic', 'oregano', 'parsley', 'cumin', 'coriander', 'sugar', 'salt', 'pepper'],
  'steak marinade': ['pineapple juice', 'balsamic vinegar', 'worcestershire sauce', 'san j tamari', 'ground guajillo chilies', 'peppercorns', 'pureed garlic'],
  'al pastor marinade': ['ancho peppers', 'guajillo peppers', 'orange juice', 'grapefruit juice', 'salt', 'al pastor spice', 'chili powder', 'onion', 'garlic', 'red wine vinegar', 'cilantro', 'canola oil', 'paprika'],
  'fresh herb marinade': ['thyme', 'parsley', 'basil', 'sage', 'chives', 'rosemary', 'garlic', 'red chilies', 'lemon zest', 'lemon juice', 'house oil'],
  'bourbon marinade': ['basil hayden bourbon', 'jim beam bourbon', 'olive oil', 'dijon mustard', 'san j tamari', 'red wine vinegar', 'steak sauce', 'brown sugar', 'red onion', 'garlic', 'salt', 'pepper'],
  'basil hayden\'s bourbon': ['bourbon'],
  
  // Spice blends
  'wildfire 8 spice': ['kosher salt', 'coriander', 'fennel', 'mustard seed', 'rosemary', 'black pepper', 'bay leaves', 'crushed red pepper'],
  'blackening spice': ['paprika', 'dehydrated garlic', 'dehydrated onion', 'spices', 'salt', 'extractives', 'silicon dioxide'],
  'char-crust': ['garlic', 'peppercorns', 'sugar', 'spices', 'onion', 'caramel color', 'worcestershire powder', 'paprika', 'hydrolyzed soy', 'corn protein', 'wheat flour'],
  'char-crusted': ['garlic', 'peppercorns', 'sugar', 'spices', 'onion', 'caramel color', 'worcestershire powder', 'paprika', 'hydrolyzed soy', 'corn protein', 'wheat flour'],
  'old bay seasoning': ['celery salt', 'spices', 'mustard seed', 'red pepper', 'black pepper', 'bay leaves', 'cloves', 'allspice', 'ginger', 'mace', 'cardamom', 'cinnamon', 'paprika'],
  
  // Other composite ingredients
  'coleslaw': ['cabbage', 'carrots', 'mayonnaise', 'vinegar', 'sugar', 'salt', 'pepper'],
  'coleslaw dressing': ['mayonnaise', 'sour cream', 'sugar', 'white balsamic vinegar', 'salt', 'white pepper', 'celery seed', 'buedels horseradish'],
  'crispy onions': ['spanish onions', 'salt', 'pepper', 'buttermilk', 'seasoned flour'],
  'garlic crouton': ['bread', 'garlic', 'butter', 'salt', 'pepper'],
  'garlic croutons': ['bread', 'garlic', 'butter', 'salt', 'pepper'],
  'seasoned flour': ['flour', 'cornmeal', 'garlic', 'onion powder', 'salt', 'pepper', 'cayenne'],
  'saltine crackers': ['enriched flour', 'soybean oil', 'salt', 'corn syrup', 'baking soda', 'yeast', 'soy lecithin'],
  'elbow macaroni': ['wheat', 'flour', 'water', 'eggs'],
  'half and half': ['milk', 'cream'],
  'whipping cream': ['cream', 'milk'],
  'white cheddar cheese': ['milk', 'cheese', 'cultures', 'enzymes', 'salt'],
  'yellow cheese spread': ['milk', 'cheese', 'cultures', 'enzymes', 'salt', 'annatto'],
  'creamed spinach': ['spinach', 'cream', 'butter', 'flour', 'nutmeg', 'salt', 'pepper'],
  'au gratin potatoes': ['potatoes', 'cream', 'white cheddar cheese', 'butter', 'salt', 'pepper'],
  'garlic butter': ['butter', 'garlic', 'parsley', 'oregano', 'lemon juice', 'red chilies', 'salt', 'pepper'],
  'steak butter': ['balsamic vinegar', 'worcestershire sauce', 'sugar', 'butter', 'salt', 'pepper'],
  'steak sauce': ['worcestershire sauce', 'ketchup', 'tamari soy sauce', 'salt', 'tomato paste'],
  'pre-mark butter': ['butter', 'herbs', 'garlic'],
  'premark butter': ['butter', 'herbs', 'garlic'],
  'horseradish crust': ['butter', 'japanese breadcrumbs', 'fresh horseradish', 'prepared horseradish', 'salt', 'pepper'],
  'peppercorn crust': ['black peppercorns', 'breadcrumbs', 'butter'],
  'parmesan crust': ['butter', 'japanese breadcrumbs', 'parmesan cheese', 'garlic', 'shallots', 'thyme', 'parsley', 'salt', 'pepper'],
  'mushroom crust': ['portobello mushrooms', 'cremini mushrooms', 'porcini mushrooms', 'domestic mushrooms', 'veal demi glaze', 'garlic', 'shallots', 'thyme', 'rosemary', 'parsley', 'sherry', 'breadcrumbs', 'butter', 'house oil', 'salt', 'pepper'],
  'garlic crust': ['butter', 'garlic cloves', 'olive oil', 'salt', 'pepper', 'rosemary', 'thyme', 'shallots', 'white wine', 'lemon juice', 'cayenne pepper', 'lemon zest', 'granulated garlic', 'gluten free bread crumbs'],
  'blue cheese crust': ['butter', 'japanese breadcrumbs', 'blue cheese', 'salt', 'pepper'],
  'coconut crumbs': ['coconut', 'garlic butter', 'parsley', 'japanese breadcrumbs'],
  'japanese breadcrumbs': ['bleached wheat flour', 'dextrose', 'yeast', 'salt'],
  'panko': ['bleached wheat flour', 'dextrose', 'yeast', 'salt'],
  'breadcrumbs': ['bread', 'flour'],
  'breading': ['flour', 'egg', 'breadcrumbs'],
  'batter': ['flour', 'egg', 'milk', 'baking powder'],
  'fried chicken batter': ['flour', 'egg', 'buttermilk', 'spices'],
  'fried chicken flour': ['flour', 'spices', 'salt', 'pepper'],
  
  // Stocks and bases
  'chicken stock': ['chicken bones', 'celery', 'onions', 'carrots', 'parsley', 'garlic', 'bay leaf', 'thyme', 'peppercorns', 'chicken base'],
  'chicken jus': ['chicken bones', 'sage', 'rosemary', 'thyme', 'shallots', 'garlic', 'white wine', 'chicken base', 'chicken stock'],
  'lobster base': ['lobster', 'shellfish', 'salt', 'spices'],
  'shrimp poaching liquid': ['water', 'white wine', 'onions', 'celery', 'bay leaf', 'thyme', 'old bay seasoning', 'lemon slices'],
  'clam juice': ['clams', 'shellfish', 'water', 'salt'],
  
  // Other
  'ketchup': ['tomato', 'vinegar', 'sugar', 'salt', 'spices'],
  'mustard': ['mustard seeds', 'vinegar', 'salt', 'spices'],
  'dijon mustard': ['mustard seeds', 'white wine', 'vinegar', 'salt'],
  'honey dijon mustard': ['honey', 'dijon mustard', 'mustard seeds', 'vinegar'],
  'yellow mustard': ['mustard seeds', 'vinegar', 'turmeric', 'salt'],
  'worcestershire sauce': ['vinegar', 'molasses', 'high fructose corn syrup', 'anchovies', 'water', 'onions', 'salt', 'garlic', 'tamarind concentrate', 'cloves', 'natural flavorings', 'chili pepper extract'],
  'tamari': ['soybeans', 'water', 'salt'],
  'soy sauce': ['soybeans', 'wheat', 'water', 'salt'],
  'teriyaki': ['soy sauce', 'sugar', 'mirin', 'sake', 'ginger', 'garlic'],
  'bread and butter pickles': ['cucumbers', 'vinegar', 'sugar', 'salt', 'spices', 'turmeric'],
  'bubbies bread and butter pickles': ['cucumbers', 'vinegar', 'sugar', 'salt', 'spices', 'turmeric'],
  'roasted onions': ['onions', 'oil', 'salt', 'pepper'],
  'roasted red onions': ['red onions', 'oil', 'salt', 'pepper'],
  'sesame seed bun': ['wheat flour', 'sesame seeds', 'water', 'yeast', 'salt', 'sugar'],
  'american cheese': ['milk', 'cheese', 'cultures', 'enzymes', 'salt'],
  'jalapeno jack': ['milk', 'cheese', 'jalapeno peppers', 'cultures', 'enzymes', 'salt'],
  'swiss cheese': ['milk', 'cheese', 'cultures', 'enzymes', 'salt'],
  'lemon butter sauce': ['reduced shallots', 'white wine', 'lemon juice', 'clam juice', 'white balsamic vinegar', 'cayenne pepper', 'cream', 'butter'],
  'tomato jam': ['extra virgin olive oil', 'onions', 'garlic', 'fresh rosemary', 'fresh basil', 'dried oregano', 'dried basil', 'white wine', 'canned tomatoes', 'tomato paste', 'red chili flakes', 'sugar', 'salt', 'pepper'],
  'caramelized onions': ['extra virgin olive oil', 'onions', 'salt', 'pepper'],
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
  
  // Additional sauces and ingredients from PDF pages 23-31
  'al pastor spice': ['chili pepper', 'dehydrated garlic', 'onion', 'spices', 'paprika', 'maltodextrin', 'salt', 'natural flavors', 'silicon dioxide'],
  'applesauce': ['applesauce', 'sugar', 'cinnamon', 'lemon juice'],
  'apricot preserves': ['apricots', 'sugar', 'brown cane sugar', 'concentrated lemon juice', 'fruit pectin'],
  'avocado spread': ['avocado', 'salt', 'pepper', 'lime juice', 'scallions', 'cilantro'],
  'beef base': ['roasted beef', 'beef broth', 'salt', 'hydrolyzed corn protein', 'caramel color', 'sugar', 'onion powder', 'beef fat', 'potato starch', 'flavorings', 'disodium inosinate', 'disodium guanylate', 'yeast extract'],
  'berry sauce': ['door county cherry juice', 'raspberries', 'strawberries', 'sugar', 'cornstarch'],
  'brown sugar glaze': ['brown sugar', 'dijon mustard', 'san j tamari', 'butter'],
  'buttermilk brine': ['buttermilk', 'salt', 'pepper'],
  'caramel sauce': ['sugar', 'cream', 'butter', 'honey', 'vanilla', 'maple syrup'],
  'chopped chicken': ['chicken breast', 'herb chicken marinade'],
  'croutons': ['cubed striata baguette', 'garlic puree', 'house oil', 'lemon juice', 'salt', 'pepper'],
  'dejonghe crust': ['butter', 'asiago', 'japanese breadcrumbs', 'garlic', 'shallots', 'parsley', 'rosemary', 'lemon zest', 'salt', 'oregano', 'pepper', 'cayenne pepper', 'paprika', 'dry sherry', 'white wine'],
  'door county cherry sauce': ['door county cherries', 'cherry juice', 'orange juice', 'sugar', 'almond extract', 'cornstarch'],
  'duck stock': ['duck skin', 'duck fat', 'duck bones', 'bay leaves', 'thyme', 'red wine', 'chicken stock'],
  'egg wash': ['egg yolks', 'half and half'],
  'gluten free breadcrumbs': ['gluten free buns', 'garlic butter', 'salt', 'pepper', 'chives'],
  'graham cracker crumbs': ['unbleached enriched flour', 'graham flour', 'sugar', 'soybean oil', 'molasses', 'high fructose corn syrup', 'partially hydrogenated cottonseed oil', 'leavening', 'salt'],
  'hidden valley ranch dry dressing': ['salt', 'monosodium glutamate', 'dried garlic', 'modified food starch', 'spices', 'dried onion', 'maltodextrin', 'natural flavor', 'guar gum', 'calcium stearate'],
  'house oil': ['canola oil', 'olive oil'],
  'pico de gallo': ['plum tomatoes', 'onions', 'jalapenos', 'cilantro', 'salt', 'pepper', 'lemon juice'],
  'prepared horseradish': ['horseradish', 'distilled vinegar', 'water', 'soybean oil', 'salt', 'artificial flavor'],
  'roasted mushrooms': ['cremini mushrooms', 'portobello mushrooms', 'domestic mushrooms', 'salt', 'pepper', 'rosemary', 'garlic', 'balsamic vinegar', 'extra virgin olive oil'],
  'roasted wild mushrooms': ['portobello mushrooms', 'cremini mushrooms', 'domestic mushrooms', 'salt', 'pepper', 'rosemary', 'garlic', 'balsamic vinegar', 'extra virgin olive oil'],
  'sambal chili paste': ['chili', 'salt', 'distilled vinegar', 'potassium sorbate', 'sodium bisulfite', 'xantham gum'],
  'san j tamari': ['water', 'soybeans', 'salt', 'alcohol'],
  'shrimp stock': ['house oil', 'onion', 'celery', 'carrots', 'garlic', 'peppercorn', 'thyme', 'tarragon', 'bay leaves', 'shrimp shells', 'tomato paste', 'brandy', 'water'],
  'striata baguette': ['parisian sponge', 'king arthur flour', 'select bakers yeast', 'water', 'sir galahad flour', 'plain yogurt', 'salt', 'malt liquid', 'water'],
  'sweet baby rays original barbecue sauce': ['high fructose corn syrup', 'distilled vinegar', 'tomato paste', 'modified food starch', 'salt', 'pineapple juice concentrate', 'natural smoke flavor', 'spices', 'caramel color', 'sodium benzoate', 'molasses', 'corn syrup', 'garlic', 'sugar', 'tamarind', 'natural flavor'],
  'tabasco': ['distilled vinegar', 'red pepper', 'salt'],
  'veal demi glaze': ['veal stock', 'demi-glace sauce mix'],
  'vegetable base': ['vegetables', 'sugar', 'salt', 'yeast extract', 'hydrolyzed corn protein', 'maltodextrin', 'canola oil', 'natural flavor', 'disodium inosinate', 'disodium guanylate', 'modified food starch', 'spice', 'hydrolyzed soy protein', 'burgundy wine solids'],
  'vegetable stock': ['vegetable base', 'hot water'],
  'za\'atar': ['ground sumac seeds', 'ground thyme', 'roasted white sesame seeds'],
  
  // Nightly Specials components
  'cherry glaze': ['honey', 'shallots', 'orange juice', 'orange zest', 'thyme', 'balsamic vinegar', 'cherry juice', 'duck stock', 'door county cherries', 'cornstarch', 'butter', 'pepper'],
};

// Special dish-specific modifications for allergies
// These override the automatic detection with exact restaurant specifications
type SpecialModification = {
  modifications: string[];  // What to tell the kitchen
  canBeModified: boolean;   // Whether the dish can be modified
};

const specialDishModifications: Record<string, Partial<Record<Allergen, SpecialModification>>> = {
  // =====================
  // APPETIZERS
  // =====================
  'mediterranean_chicken_skewers': {
    dairy: { modifications: ['NO yogurt sauce'], canBeModified: true },
  },
  'shrimp_cocktail': {
    dairy: { modifications: [], canBeModified: true }, // No changes needed
  },
  'oven_roasted_lump_crab_cakes': {
    dairy: { modifications: ['NO mustard mayonnaise'], canBeModified: true },
  },
  'applewood_smoked_bacon_wrapped_sea_scallops_skewers': {
    dairy: { modifications: [], canBeModified: true }, // No changes needed
  },

  // =====================
  // SALADS
  // Note: Safe dressings are Balsamic Vinaigrette, Citrus Lime Vinaigrette, Lemon Herb Vinaigrette
  // =====================
  'field_salad': {
    dairy: { modifications: [], canBeModified: true }, // No changes needed (use safe dressings)
  },
  'tuscan_kale_and_spinach_salad': {
    dairy: { modifications: ['NO cheese', 'NO dressing'], canBeModified: true },
  },
  'greek_salad': {
    dairy: { modifications: ['NO feta cheese', 'NO dressing'], canBeModified: true },
  },
  'steak_and_blue_cheese_salad': {
    dairy: { modifications: ['NO cheese', 'NO crispy onions', 'NO ranch dressing'], canBeModified: true },
  },
  'wildfire_chopped_salad': {
    dairy: { modifications: ['NO marinated chicken', 'NO blue cheese', 'NO tortillas'], canBeModified: true },
  },
  'caesar_salad': {
    dairy: { modifications: [], canBeModified: false }, // Dressing contains dairy, cannot be modified
  },

  // =====================
  // SANDWICHES
  // Note: NO butter on buns/bread, may sub sesame seed or multi-grain bun
  // NO kid's bun, NO buttery onion bun, NO gluten free bun
  // NO coleslaw, NO fries with sandwiches
  // =====================
  'add_roasted_wild_mushrooms_or_applewood_smoked_bacon_to_any_burger_for_2_00_each_thick_prime_angus_burger_cheeseburger': {
    dairy: { modifications: ['NO butter on bun', 'NO coleslaw', 'NO fries'], canBeModified: true },
  },
  'all_natural_turkey_burger': {
    dairy: { modifications: ['NO cheese', 'NO butter on bun'], canBeModified: true },
  },
  'grilled_chicken_club': {
    dairy: { modifications: ['NO mustard-mayo marinated chicken (SUB plain chicken)', 'NO cheese', 'NO mustard mayonnaise', 'NO butter on bun'], canBeModified: true },
  },
  'roasted_prime_rib_french_dip': {
    dairy: { modifications: ['NO butter on bread', 'NO horseradish cream sauce'], canBeModified: true },
  },
  'blackened_new_york_strip_steak_sandwich': {
    dairy: { modifications: ['NO butter on bun'], canBeModified: true },
  },
  'sliced_turkey_sandwich': {
    dairy: { modifications: ['NO cheese', 'NO butter on bread'], canBeModified: true },
  },

  // =====================
  // FILETS
  // Note: NO crusts (except peppercorn), NO steak butter, NO garlic crouton, NO pre-marking butter
  // =====================
  'center_cut_by_master_butchers_from_the_finest_midwestern_beef_tenderloin_basil_hayden_s_bourbon_marinated_tenderloin_tips': {
    dairy: { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  },
  'petite_filet_mignon_filet_mignon': {
    dairy: { modifications: ['NO pre-marking butter', 'NO steak butter', 'NO garlic crouton'], canBeModified: true },
  },
  'horseradish_crusted_filet': {
    dairy: { modifications: ['NO horseradish crust', 'NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  },
  'filet_medallion_duo_filet_medallion_trio': {
    dairy: { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  },

  // =====================
  // STEAKS AND CHOPS
  // =====================
  'tenderness_and_taste_brushed_with_our_seasoning_blend_and_broiled_over_glowing_embers_to_your_preferred_temperature_mushroom_crusted_fancy_pork_chops': {
    dairy: { modifications: ['NO mushroom crust', 'NO pre-marking butter'], canBeModified: true },
  },
  'roumanian_skirt_steak': {
    dairy: { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  },
  'new_york_strip_steak': {
    dairy: { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  },
  'porterhouse': {
    dairy: { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  },
  'char_crust_bone_in_rib_eye': {
    dairy: { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  },
  'broiled_lamb_porterhouse_chops': {
    dairy: { modifications: ['NO steak butter', 'NO pre-marking butter'], canBeModified: true },
  },

  // =====================
  // PRIME RIB
  // =====================
  'roasted_prime_rib': {
    dairy: { modifications: ['NO horseradish cream sauce'], canBeModified: true },
  },
  'roasted_prime_rib_of_beef': {
    dairy: { modifications: ['NO horseradish cream sauce'], canBeModified: true },
  },

  // =====================
  // FRESH FISH AND SEAFOOD
  // =====================
  'cedar_planked_salmon': {
    dairy: { modifications: ['NO glaze'], canBeModified: true },
  },
  'lump_crab_cakes': {
    dairy: { modifications: ['NO mustard mayo'], canBeModified: true },
  },

  // =====================
  // NIGHTLY SPECIALS
  // =====================
  'wednesday_spit_roasted_half_long_island_duck': {
    dairy: { modifications: ['NO cherry glaze', 'NO wild rice'], canBeModified: true },
  },

  // =====================
  // CHICKEN
  // =====================
  // Note: Chicken Moreno needs: NO lemon parmesan vinaigrette (SUB lemon herb vinaigrette), NO parmesan
  // But Chicken Moreno doesn't appear to be in the menu data

  // =====================
  // SIDES
  // =====================
  'steamed_broccoli_with_lemon_vinaigrette': {
    dairy: { modifications: [], canBeModified: true }, // No changes needed
  },
  'roasted_vegetables': {
    dairy: { modifications: [], canBeModified: true }, // No changes needed
  },
  'idaho_baked_potato': {
    dairy: { modifications: ['NO sour cream', 'NO butter'], canBeModified: true },
  },
  'bbq_rubbed_sweet_potato': {
    dairy: { modifications: ['NO butter'], canBeModified: true },
  },
  'applesauce': {
    dairy: { modifications: [], canBeModified: true }, // No changes needed
  },
  'red_skin_mashed_potatoes': {
    dairy: { modifications: [], canBeModified: false }, // Contains dairy, cannot remove
  },
  'creamed_spinach': {
    dairy: { modifications: [], canBeModified: false }, // Contains cream, cannot remove
  },
  'au_gratin_potatoes': {
    dairy: { modifications: [], canBeModified: false }, // Contains cheese/cream, cannot remove
  },
  'mac_and_cheese': {
    dairy: { modifications: [], canBeModified: false }, // Contains cheese, cannot remove
  },

  // =====================
  // DESSERTS
  // =====================
  'seasonal_berries_crisp': {
    dairy: { modifications: ['NO oatmeal crumble', 'NO ice cream'], canBeModified: true },
  },
  'jd_s_cheesecake': {
    dairy: { modifications: [], canBeModified: false }, // Core ingredient is dairy
  },
  'key_lime_pie': {
    dairy: { modifications: [], canBeModified: false }, // Contains dairy
  },

  // =====================
  // KID'S MENU
  // =====================
  'burger_cheeseburger_and_fries': {
    dairy: { modifications: ['NO bun (SUB multi-grain or sesame seed bun)', 'NO butter on bun/bread', 'NO cheese'], canBeModified: true },
  },
  'available_upon_request_kids_filet_mashed_potato': {
    dairy: { modifications: ['NO pre-marking butter', 'NO steak butter', 'NO mashed potatoes'], canBeModified: true },
  },
  'grilled_cheese_and_fries': {
    dairy: { modifications: [], canBeModified: false }, // Cheese is core ingredient
  },
  'macaroni_and_cheese': {
    dairy: { modifications: [], canBeModified: false }, // Cheese is core ingredient
  },

  // =====================
  // BRUNCH
  // =====================
  'classic_breakfast': {
    dairy: { modifications: ['NO butter when cooking eggs', 'NO breakfast potatoes and onions', 'NO butter on toast'], canBeModified: true },
  },
  'avocado_toast': {
    dairy: { modifications: ['NO butter on toast', 'NO cheese in eggs'], canBeModified: true },
  },
  'steak_and_eggs': {
    dairy: { modifications: [], canBeModified: true }, // No changes needed (Southwestern Steak and Eggs)
  },
  'eggs_benedict': {
    dairy: { modifications: [], canBeModified: false }, // Hollandaise contains butter
  },
  'wildfire_pancakes': {
    dairy: { modifications: [], canBeModified: false }, // Buttermilk is dairy
  },

  // =====================
  // SPECIAL PARTY MENU / HAPPY HOUR / VEGAN PLATE
  // =====================
  'roasted_vegetable_vegan_plate': {
    dairy: { modifications: [], canBeModified: true }, // No changes needed
  },
  'pasta_and_roasted_vegetable_pasta': {
    dairy: { modifications: ['NO garlic butter', 'NO tomato basil sauce', 'NO goat cheese', 'NO asiago', 'SUB tomato jam'], canBeModified: true },
  },
};

// Special marker for UNKNOWN status (dish not in database)
const UNKNOWN_MODIFICATION: SpecialModification = {
  modifications: ['UNKNOWN - This dish has not been verified for this allergen. Please consult a manager.'],
  canBeModified: false,
};

// Helper function to get special modifications for a dish
// First checks database cache, then falls back to static modifications
// When using database: missing row = UNKNOWN (not safe)
function getSpecialModifications(dishId: string, allergen: Allergen): SpecialModification | null {
  // First, check if we have database modifications
  if (hasDbModifications()) {
    const dbMod = getCachedModification(dishId, allergen);
    if (dbMod) {
      return {
        modifications: dbMod.modifications,
        canBeModified: dbMod.canBeModified,
      };
    }
    // IMPORTANT: If using database and no modification found, return UNKNOWN
    // This prevents false safety claims - better to be cautious
    return UNKNOWN_MODIFICATION;
  }
  
  // Fall back to static modifications (legacy behavior)
  const dishMods = specialDishModifications[dishId];
  if (dishMods && dishMods[allergen]) {
    return dishMods[allergen];
  }
  return null;
}

/**
 * Get sub-ingredients for a composite ingredient (sauce, condiment, etc.)
 */
function getSubIngredients(ingredient: string): string[] {
  const ingredientLower = ingredient.toLowerCase().trim();
  return compositeIngredients[ingredientLower] || [];
}

// Map allergen to the corresponding column name in MenuItem
// Note: onion_garlic, tomato, and seed are not in the CSV columns, so we'll detect them from description
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
  // onion_garlic, tomato, and seed will be detected from description only
};

// Ingredients that contain each allergen (case-insensitive matching)
const allergenIngredients: Record<Allergen, string[]> = {
  dairy: [
    'butter', 'buttered', 'steak butter', 'pre-mark butter', 'premark butter', 'pre-marking butter',
    'garlic butter', 'cream', 'cheese', 'milk', 'yogurt', 'sour cream', 'whipping cream',
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
  seed: [
    'seed', 'seeds', 'sesame seed', 'sesame seeds', 'pumpkin seed', 'pumpkin seeds',
    'sunflower seed', 'sunflower seeds', 'poppy seed', 'poppy seeds',
    'chia seed', 'chia seeds', 'flax seed', 'flax seeds', 'hemp seed', 'hemp seeds',
    'mustard seed', 'mustard seeds', 'celery seed', 'celery seeds',
    'caraway seed', 'caraway seeds', 'fennel seed', 'fennel seeds',
    'cumin seed', 'cumin seeds', 'coriander seed', 'coriander seeds',
    'anise seed', 'anise seeds', 'dill seed', 'dill seeds',
    'nigella seed', 'nigella seeds', 'black seed', 'black seeds',
    'house oil'
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
  
  // Check if dish has cannot_be_made_safe_notes - if so, it cannot be modified
  if (dish.cannot_be_made_safe_notes && dish.cannot_be_made_safe_notes.trim() !== '') {
    return {
      modifiable: false,
      reason: dish.cannot_be_made_safe_notes.trim()
    };
  }
  
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
  
  // MODIFICATIONS POSSIBLE scenarios (check these FIRST):
  // These are ingredients added DURING or AFTER cooking that can be removed
  
  // Butter/oil brushed on, glazed on, or drizzled on (applied to protein during/after cooking)
  // Examples: "brushed with melted butter", "glazed with brown sugar...and butter"
  if (
    description.includes('brushed with') ||
    description.includes('glazed with') ||
    description.includes('drizzled with')
  ) {
    // Check if the allergen is mentioned in what's being brushed/glazed on
    const brushedMatch = description.match(/(?:brushed|glazed|drizzled)\s+with\s+([^.]+)/i);
    if (brushedMatch) {
      const brushedContent = brushedMatch[1].toLowerCase();
      const hasAllergen = allergenIngredients[allergen]?.some(allergenIng => 
        brushedContent.includes(allergenIng.toLowerCase())
      ) || compositeContainsAllergen(brushedContent, allergen);
      
      if (hasAllergen) {
        return {
          modifiable: true,
          suggestion: allergen === 'dairy' 
            ? 'Request dish without butter (butter is brushed/glazed on and can be removed)'
            : `Request dish without the glaze containing ${allergen}`
        };
      }
    }
  }
  
  // Steak butter, pre-mark butter (always modifiable - added after cooking)
  if (
    (description.includes('steak butter') ||
     description.includes('pre-mark butter') ||
     description.includes('premark butter')) &&
    allergen === 'dairy'
  ) {
    return {
      modifiable: true,
      suggestion: 'Request dish without steak butter'
    };
  }
  
  // Ingredients that are "marinated in" are NOT modifiable - they're part of the base preparation
  // Examples: "marinated in Mediterranean marinade", "marinated in herb chicken marinade"
  if (description.includes('marinated in')) {
    const marinatedMatch = description.match(/marinated\s+in\s+([^.]+)/i);
    if (marinatedMatch) {
      const marinatedContent = marinatedMatch[1].toLowerCase();
      // Check if the allergen is in the marinade
      const hasAllergenInMarinade = allergenIngredients[allergen]?.some(allergenIng => 
        marinatedContent.includes(allergenIng.toLowerCase())
      ) || compositeContainsAllergen(marinatedContent, allergen);
      
      if (hasAllergenInMarinade) {
        return {
          modifiable: false,
          reason: 'The allergen is in the marinade which is part of the base preparation and cannot be removed'
        };
      }
    }
  }
  
  // Allergen baked/fried INTO the core mixture OR baked ONTO the dish
  // This applies when:
  // 1. The allergen is part of a mixture that is then baked/fried together (cheese in mac and cheese)
  // 2. The allergen is "covered with" and the dish name includes "baked" (cheese covered on French onion soup, then baked)
  // BUT NOT: butter brushed/glazed on salmon (that's added on, can be removed - handled above)
  if (
    (description.includes('baked in the oven') ||
     description.includes('deep fried') ||
     (description.includes('mixed with') && (description.includes('baked') || description.includes('fried'))) ||
     (description.includes('covered with') && dishName.includes('baked'))) &&
    dish.ingredients?.some(ing => {
      const ingLower = ing.toLowerCase();
      // Check if allergen is in a composite ingredient that's part of the baked/fried mixture
      const isCompositeWithAllergen = compositeContainsAllergen(ingLower, allergen);
      const isDirectAllergen = allergenIngredients[allergen]?.some(allergenIng => 
        ingLower.includes(allergenIng.toLowerCase())
      );
      // Only mark as non-modifiable if it's part of the core mixture or baked onto it
      // NOT if it's just brushed/glazed on (those are modifiable - handled above)
      // Note: "topped with" might refer to something else (like croutons), so we don't exclude based on that
      return (isCompositeWithAllergen || isDirectAllergen) && 
             !description.includes('brushed with') &&
             !description.includes('glazed with');
    })
  ) {
    return {
      modifiable: false,
      reason: 'The allergen is baked or fried into the dish and cannot be removed'
    };
  }
  
  // Crusted dishes - the crust is baked on, but check if allergen is in the crust vs the protein
  // If allergen is in the crust itself (like horseradish crust with dairy), it's baked on
  // But if allergen is just butter brushed on before crusting, it can be removed (handled above)
  if (dishName.includes('crusted') && 
      description.includes('crusted') &&
      !description.includes('brushed with') && // If brushed on, it's modifiable (handled above)
      dish.ingredients?.some(ing => {
        const ingLower = ing.toLowerCase();
        // Check if allergen is specifically in a crust ingredient
        return (ingLower.includes('crust') || ingLower.includes('breadcrumb')) &&
               allergenIngredients[allergen]?.some(allergenIng => 
                 ingLower.includes(allergenIng.toLowerCase())
               );
      })) {
    return {
      modifiable: false,
      reason: 'The allergen is in the crust which is baked onto the dish and cannot be removed'
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
  
  // Bisques and soups - gluten/flour is in the main mixture, not modifiable
  if (
    (dishName.includes('bisque') ||
     dishName.includes('soup') ||
     dishName.includes('stew') ||
     dishName.includes('chili') ||
     dishName.includes('gumbo')) &&
    allergen === 'gluten'
  ) {
    return {
      modifiable: false,
      reason: 'The allergen is part of a pre-made mixture that cannot be separated'
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
  if (!description || typeof description !== 'string' || !customAllergen || !customAllergen.trim()) return [];
  
  const descriptionLower = description.toLowerCase();
  const allergenLower = customAllergen.toLowerCase().trim();
  const found: string[] = [];
  
  // Special handling for "onion" and "garlic" to match related terms
  // When someone enters "onion", they should match "onions", "onion powder", etc.
  // When someone enters "garlic", they should match "garlic powder", "minced garlic", etc.
  if (allergenLower === 'onion' || allergenLower === 'onions') {
    // Use onion-related terms from onion_garlic allergen list, but exclude garlic terms
    const onionTerms = allergenIngredients.onion_garlic.filter(term => {
      const termLower = term.toLowerCase();
      return termLower.includes('onion') && !termLower.includes('garlic');
    });
    
    for (const term of onionTerms) {
      const termLower = term.toLowerCase();
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
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
    }
  } else if (allergenLower === 'garlic') {
    // Use garlic-related terms from onion_garlic allergen list, but exclude onion terms
    const garlicTerms = allergenIngredients.onion_garlic.filter(term => {
      const termLower = term.toLowerCase();
      return termLower.includes('garlic') && !termLower.includes('onion');
    });
    
    for (const term of garlicTerms) {
      const termLower = term.toLowerCase();
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
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
    }
  } else if (allergenLower === 'black pepper' || allergenLower === 'blackpepper') {
    // Match "black pepper", "blackpepper", or just "pepper" (when black pepper is in ingredients)
    const pepperPatterns = ['black pepper', 'blackpepper', 'pepper'];
    for (const pattern of pepperPatterns) {
      const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(descriptionLower)) {
        const matches = description.match(regex);
        if (matches && matches.length > 0) {
          matches.forEach(match => {
            // Prefer "black pepper" if found, otherwise use the match
            const normalized = match.toLowerCase().replace(/\s+/g, ' ');
            if (!found.some(f => f.toLowerCase().replace(/\s+/g, ' ') === normalized)) {
              found.push(match);
            }
          });
        }
      }
    }
  } else if (allergenLower === 'red pepper' || allergenLower === 'redpepper' || allergenLower === 'red peppers' || allergenLower === 'redpeppers') {
    // Match "red pepper", "red peppers", "redpepper", "redpeppers"
    const pepperPatterns = ['red peppers', 'redpeppers', 'red pepper', 'redpepper'];
    for (const pattern of pepperPatterns) {
      const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(descriptionLower)) {
        const matches = description.match(regex);
        if (matches && matches.length > 0) {
          matches.forEach(match => {
            const normalized = match.toLowerCase().replace(/\s+/g, ' ');
            if (!found.some(f => f.toLowerCase().replace(/\s+/g, ' ') === normalized)) {
              found.push(match);
            }
          });
        }
      }
    }
  } else {
    // For other custom allergens, use exact match with word boundaries
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
  seed: 'Seed',
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
  const dishNameLower = dish.dish_name.toLowerCase();
  
  // Main proteins are NEVER garnish - they're the core of the dish
  // Check if the ingredient is the main protein type that's also in the dish name
  const mainProteins = ['shrimp', 'crab', 'lobster', 'scallop', 'salmon', 'tuna', 'cod', 'halibut', 
                        'chicken', 'beef', 'steak', 'pork', 'lamb', 'duck', 'fish'];
  const isMainProtein = mainProteins.some(protein => 
    ingredientLower.includes(protein) && dishNameLower.includes(protein)
  );
  if (isMainProtein) {
    return false; // Main protein is never a garnish
  }
  
  // Marinades are NEVER garnish - they're part of the base preparation
  // Examples: "marinated in Mediterranean marinade", "marinated in herb chicken marinade"
  if (ingredientLower.includes('marinade') && description.includes('marinated in')) {
    const marinatedMatch = description.match(/marinated\s+in\s+([^.]+)/i);
    if (marinatedMatch) {
      const marinatedContent = marinatedMatch[1].toLowerCase();
      if (marinatedContent.includes(ingredientLower) || ingredientLower.includes(marinatedContent)) {
        return false; // Marinade is part of base preparation, not garnish
      }
    }
  }
  
  // Check if ingredient appears DIRECTLY after garnish-related phrases (in the same sentence)
  const garnishPhrases = [
    'garnished with',
    'garnished',
    'topped with',
    'topped',
    'covered with',
    'covered',
    'served with',
    'with a side of',
    'on the side',
    'accompanied by',
    'with a ramekin of',
    'ramekin of',
    'drizzle of',
    'drizzled with'
  ];
  
  for (const phrase of garnishPhrases) {
    const phraseIndex = description.indexOf(phrase);
    if (phraseIndex !== -1) {
      // Check if ingredient appears in the SAME sentence after the garnish phrase
      // Find the end of the current sentence (period or end of description)
      const afterPhrase = description.substring(phraseIndex + phrase.length);
      const sentenceEnd = afterPhrase.indexOf('.');
      const sameSentence = sentenceEnd !== -1 ? afterPhrase.substring(0, sentenceEnd) : afterPhrase;
      
      // Check if ingredient appears in this same sentence segment
      if (sameSentence.includes(ingredientLower)) {
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
 * Uses strict matching to avoid false positives (e.g., 'garlic' matching 'garlic butter')
 */
function compositeContainsAllergen(compositeIngredient: string, allergen: Allergen): boolean {
  const subIngredients = getSubIngredients(compositeIngredient);
  if (subIngredients.length === 0) return false;
  
  const allergenList = allergenIngredients[allergen];
  return subIngredients.some(subIng => {
    const subIngLower = subIng.toLowerCase().trim();
    return allergenList.some(allergenIng => {
      const allergenIngLower = allergenIng.toLowerCase().trim();
      // Check if sub-ingredient IS the allergen or contains the allergen term
      // e.g., "blue cheese crumbles" contains "cheese" or "blue cheese"
      if (subIngLower.includes(allergenIngLower)) return true;
      
      // Check for exact match
      if (subIngLower === allergenIngLower) return true;
      
      // For compound allergen terms (e.g., "garlic butter"), only match if sub-ingredient
      // contains the FULL compound term, not just part of it
      // Do NOT use reverse match (allergenIng.includes(subIng)) as it causes false positives
      // e.g., "garlic" should not match "garlic butter" because garlic alone is not dairy
      return false;
    });
  });
}

/**
 * Check if a composite ingredient contains onion (but not necessarily garlic)
 */
function compositeContainsOnion(compositeIngredient: string): boolean {
  const subIngredients = getSubIngredients(compositeIngredient);
  if (subIngredients.length === 0) return false;
  
  const onionTerms = allergenIngredients.onion_garlic.filter(term => {
    const termLower = term.toLowerCase();
    return termLower.includes('onion') && !termLower.includes('garlic');
  });
  
  return subIngredients.some(subIng => 
    onionTerms.some(onionTerm => 
      subIng.toLowerCase().includes(onionTerm.toLowerCase()) ||
      onionTerm.toLowerCase().includes(subIng.toLowerCase())
    )
  );
}

/**
 * Check if a composite ingredient contains garlic (but not necessarily onion)
 */
function compositeContainsGarlic(compositeIngredient: string): boolean {
  const subIngredients = getSubIngredients(compositeIngredient);
  if (subIngredients.length === 0) return false;
  
  const garlicTerms = allergenIngredients.onion_garlic.filter(term => {
    const termLower = term.toLowerCase();
    return termLower.includes('garlic') && !termLower.includes('onion');
  });
  
  return subIngredients.some(subIng => 
    garlicTerms.some(garlicTerm => 
      subIng.toLowerCase().includes(garlicTerm.toLowerCase()) ||
      garlicTerm.toLowerCase().includes(subIng.toLowerCase())
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
  // Check for special dish-specific modifications first
  const specialMods = getSpecialModifications(dish.id, allergen);
  if (specialMods) {
    // Check if this is the UNKNOWN marker (missing from database)
    if (specialMods === UNKNOWN_MODIFICATION) {
      return specialMods.modifications; // Returns the UNKNOWN message
    }
    // If not modifiable, return NOT POSSIBLE message
    if (!specialMods.canBeModified) {
      return [`NOT POSSIBLE - ${ALLERGEN_LABELS[allergen]} cannot be removed from this dish`];
    }
    return specialMods.modifications;
  }
  
  const isPrepared = isPreparedFood(dish);
  
  // Safety check: ensure foundIngredients is an array
  if (!Array.isArray(foundIngredients)) {
    foundIngredients = [];
  }
  
  // For pre-prepared foods, separate garnish ingredients from main ingredients
  let ingredientsToProcess = foundIngredients || [];
  let mainIngredients: string[] = [];
  if (isPrepared) {
    const garnishIngredients = (foundIngredients || []).filter(ing => isGarnishIngredient(dish, ing));
    mainIngredients = (foundIngredients || []).filter(ing => !isGarnishIngredient(dish, ing));
    
    // If it's pre-prepared and has main ingredients with the allergen, they cannot be modified
    // Return NOT POSSIBLE immediately for main ingredients
    if (mainIngredients.length > 0) {
      const mainIngredientNames = mainIngredients.map(ing => findMostSpecificIngredientName(ing, dish));
      // If there are also garnish ingredients, we'll process those separately below
      // But for now, we know main ingredients are NOT POSSIBLE
      if (garnishIngredients.length === 0) {
        // No garnish ingredients, so everything is NOT POSSIBLE
        return mainIngredientNames.map(ing => 
          `NOT POSSIBLE - ${ing} (${ALLERGEN_LABELS[allergen]}) - cannot be removed, part of pre-made mixture`
        );
      }
      // If there are garnish ingredients, we'll process those and add NOT POSSIBLE for main ingredients at the end
      ingredientsToProcess = garnishIngredients;
    } else if (garnishIngredients.length > 0) {
      // Only garnish ingredients, we can modify those
      ingredientsToProcess = garnishIngredients;
    } else {
      // No ingredients found at all, but dish contains allergen - check modification possibility
      const modAnalysis = analyzeModificationPossibility(dish, allergen);
      if (!modAnalysis.modifiable) {
        if (modAnalysis.reason) {
          return [`NOT POSSIBLE - ${ALLERGEN_LABELS[allergen]} cannot be removed - ${modAnalysis.reason}`];
        }
        return [`NOT POSSIBLE - ${ALLERGEN_LABELS[allergen]} cannot be removed - this dish has been pre-prepared and cannot be modified`];
      }
    }
  } else {
    // For non-prepared foods, check modification possibility first
    const modAnalysis = analyzeModificationPossibility(dish, allergen);
    
    // If modification is not possible, return the reason
      if (!modAnalysis.modifiable) {
        if (modAnalysis.reason) {
          return [`NOT POSSIBLE - ${ALLERGEN_LABELS[allergen]} cannot be removed - ${modAnalysis.reason}`];
        }
        return [`NOT POSSIBLE - ${ALLERGEN_LABELS[allergen]} cannot be removed - this dish cannot be modified`];
      }
  }
  
  if (!canModify && !isPrepared) {
    return [`NO ${ALLERGEN_LABELS[allergen]}`];
  }
  
  // Get modification analysis for non-prepared foods (already checked above for prepared foods)
  let modAnalysis: { modifiable: boolean; reason?: string; suggestion?: string } | null = null;
  if (!isPrepared) {
    modAnalysis = analyzeModificationPossibility(dish, allergen);
  }
  
  // If modification analysis suggests a specific approach, include it
  if (modAnalysis?.suggestion) {
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
    // Safety check: if foundIngredient is undefined or empty, return a default
    if (!foundIngredient || typeof foundIngredient !== 'string') {
      return ALLERGEN_LABELS[allergen] || 'ingredient';
    }
    
    // First check if there's a more specific match in dish.ingredients
    if (dish.ingredients && dish.ingredients.length > 0) {
      const foundLower = foundIngredient.toLowerCase();
      const specificMatch = dish.ingredients.find(ing => {
        if (!ing || typeof ing !== 'string') return false;
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
        // Only match sub-ingredients that actually ARE dairy, not ones that happen
        // to be part of a compound dairy term (e.g., "garlic" should not match "garlic butter")
        const dairySubs = subIngs.filter(sub => {
          const subLower = sub.toLowerCase().trim();
          return allergenIngredients.dairy.some(dairyIng => {
            const dairyIngLower = dairyIng.toLowerCase().trim();
            // Check if sub-ingredient contains the dairy term (e.g., "greek yogurt" contains "yogurt")
            // or if they're an exact match
            return subLower.includes(dairyIngLower) || subLower === dairyIngLower;
          });
        });
        if (dairySubs.length > 0) {
          substitutions.push(`NO ${composite} (contains: ${dairySubs.join(', ')})`);
        } else {
          substitutions.push(`NO ${composite}`);
        }
      }
      
      // Check if butter is part of a cooked/simmered base mixture (NOT MODIFIABLE)
      // Examples: "onions and butter simmered", "butter and onions cooked", "caramelized onions and butter"
      const description = dish.description.toLowerCase();
      const isButterInBaseMixture = (
        (description.includes('and butter') && (
          description.includes('simmered') ||
          description.includes('cooked') ||
          description.includes('caramelized') ||
          description.includes('sautéed') ||
          description.includes('sweated')
        )) ||
        (description.includes('butter and') && (
          description.includes('simmered') ||
          description.includes('cooked') ||
          description.includes('caramelized') ||
          description.includes('sautéed') ||
          description.includes('sweated')
        ))
      );
      
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
        // For non-steak dishes, check for butter
        // Only add butter to substitutions if it's NOT in the base mixture
        // Butter in base mixture (cooked/simmered) should be in mainIngredients and marked as NOT POSSIBLE
        const hasButterInGarnish = ingredientsToProcess.some(ing => 
          ing.toLowerCase().includes('butter') && 
          !ing.toLowerCase().includes('steak butter') &&
          !ing.toLowerCase().includes('pre-mark butter') &&
          !ing.toLowerCase().includes('premark butter')
        );
        
        // Check if butter is in dish.ingredients but not in base mixture
        const hasButterNotInBase = !isButterInBaseMixture && 
          dish.ingredients?.some(ing => 
            ing.toLowerCase().includes('butter') && 
            !ing.toLowerCase().includes('steak butter') &&
            !ing.toLowerCase().includes('pre-mark butter') &&
            !ing.toLowerCase().includes('premark butter')
          );
        
        if ((hasButterInGarnish || hasButterNotInBase) && 
            !compositeWithAllergen.some(c => c.toLowerCase().includes('butter'))) {
          // Butter is not in base mixture, so it's modifiable (e.g., brushed on, glazed on, or garnish)
          substitutions.push('NO butter (use oil)');
        }
        // If butter is in base mixture (isButterInBaseMixture is true), we don't add it to substitutions
        // It will be caught by the main ingredients check and marked as NOT POSSIBLE
      }
      
      // Check for specific cheese types first (Swiss, Asiago, etc.) - these should be identified separately
      const cheeseTypes = ['swiss', 'asiago', 'parmesan', 'cheddar', 'mozzarella', 'feta', 'blue cheese', 'goat cheese'];
      for (const cheeseType of cheeseTypes) {
        const foundCheese = ingredientsToProcess.find(ing => 
          ing.toLowerCase().includes(cheeseType) || ing.toLowerCase() === cheeseType
        ) || dish.ingredients?.find(ing => 
          ing.toLowerCase().includes(cheeseType) || ing.toLowerCase() === cheeseType
        );
        
        if (foundCheese && !compositeWithAllergen.some(c => c.toLowerCase().includes(cheeseType))) {
          const descriptiveCheese = getDescriptiveIngredientName(foundCheese);
          // Capitalize first letter for display
          const displayName = descriptiveCheese.charAt(0).toUpperCase() + descriptiveCheese.slice(1);
          substitutions.push(`NO ${displayName}`);
        }
      }
      
      // Check for specific dairy ingredients - use most specific names from dish.ingredients
      // Order matters - check more specific terms first
      // Skip cheese types we already handled above
      const dairyIngredients = [
        'whipping cream', 'half and half', 'whole milk', 'skim milk',
        'white cheddar cheese', 'yellow cheese spread', 'cheddar cheese',
        'sour cream', 'buttermilk', 'cream', 'milk', 'yogurt'
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
            } else {
              substitutions.push(`NO ${specificName}`);
            }
          }
        }
      }
      
      // Check for generic "cheese" if no specific cheese types were found
      if (!substitutions.some(sub => sub.toLowerCase().includes('cheese'))) {
        const foundCheese = ingredientsToProcess.find(ing => 
          ing.toLowerCase() === 'cheese' || ing.toLowerCase().includes('cheese')
        ) || dish.ingredients?.find(ing => 
          ing.toLowerCase() === 'cheese' || ing.toLowerCase().includes('cheese')
        );
        
        if (foundCheese && !compositeWithAllergen.some(c => c.toLowerCase().includes('cheese'))) {
          const descriptiveCheese = getDescriptiveIngredientName(foundCheese);
          substitutions.push(`NO ${descriptiveCheese}`);
        }
      }
      
      if (substitutions.length === 0) {
        substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
      }
      break;
    case 'gluten':
      // For pre-prepared foods, only check ingredientsToProcess (garnish ingredients)
      // Main ingredients (like flour in bisque) are handled separately below
      // For non-prepared foods, also check dish.ingredients as fallback
      
      // Check for bread/bun with descriptive names - check more specific types first
      const breadTypes = ['english muffin', 'english muffins', 'brioche bread', 'brioche', 'sesame seed bun', 'buttery onion bun', 'multi-grain bread', 'flatbread', 'bun', 'bread', 'toast'];
      let breadIng: string | undefined;
      
      // Find the most specific bread type (only from ingredientsToProcess for pre-prepared, with fallback for non-prepared)
      for (const breadTypeCheck of breadTypes) {
        const found = ingredientsToProcess.find(ing => ing.toLowerCase().includes(breadTypeCheck)) ||
                     (!isPrepared ? dish.ingredients?.find(ing => ing.toLowerCase().includes(breadTypeCheck)) : undefined);
        if (found) {
          breadIng = found;
          break;
        }
      }
      
      if (breadIng) {
        const descriptiveBread = getDescriptiveIngredientName(breadIng);
        substitutions.push(`NO ${descriptiveBread} (use gluten-free)`);
      }
      
      // Check for croutons with descriptive names (only from ingredientsToProcess for pre-prepared, with fallback for non-prepared)
      const croutonIng = ingredientsToProcess.find(ing => ing.toLowerCase().includes('crouton')) ||
                        (!isPrepared ? dish.ingredients?.find(ing => ing.toLowerCase().includes('crouton')) : undefined);
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
      
      // Check for flour with descriptive names (only from ingredientsToProcess for pre-prepared, with fallback for non-prepared)
      const flourIng = ingredientsToProcess.find(ing => ing.toLowerCase().includes('flour')) ||
                      (!isPrepared ? dish.ingredients?.find(ing => ing.toLowerCase().includes('flour')) : undefined);
      if (flourIng) {
        const descriptiveFlour = getDescriptiveIngredientName(flourIng);
        substitutions.push(`NO ${descriptiveFlour} (use gluten-free alternative)`);
      }
      
      // Check for crackers, breadcrumbs, etc. (only from ingredientsToProcess for pre-prepared, with fallback for non-prepared)
      const crackerIng = ingredientsToProcess.find(ing => ing.toLowerCase().includes('cracker')) ||
                        (!isPrepared ? dish.ingredients?.find(ing => ing.toLowerCase().includes('cracker')) : undefined);
      if (crackerIng) {
        const descriptiveCracker = getDescriptiveIngredientName(crackerIng);
        substitutions.push(`NO ${descriptiveCracker} (use gluten-free alternative)`);
      }
      
      // Check for pasta/macaroni (only from ingredientsToProcess for pre-prepared, with fallback for non-prepared)
      const pastaIng = ingredientsToProcess.find(ing => 
        ing.toLowerCase().includes('macaroni') || 
        ing.toLowerCase().includes('pasta') ||
        ing.toLowerCase().includes('noodle')
      ) || (!isPrepared ? dish.ingredients?.find(ing => 
        ing.toLowerCase().includes('macaroni') || 
        ing.toLowerCase().includes('pasta') ||
        ing.toLowerCase().includes('noodle')
      ) : undefined);
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
          substitutions.push(`NOT POSSIBLE - ${ALLERGEN_LABELS[allergen]} cannot be removed - ${descriptiveName} cannot be substituted in this dish`);
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
        if (ingredientsToProcess && ingredientsToProcess.length > 0) {
          const descriptiveNames = ingredientsToProcess
            .filter(ing => ing && typeof ing === 'string')
            .map(ing => getDescriptiveIngredientName(ing));
          if (descriptiveNames.length > 0) {
            substitutions.push(...descriptiveNames.map(name => `NO ${name}`));
          } else {
            substitutions.push('NO onion/garlic');
          }
        } else {
          substitutions.push('NO onion/garlic');
        }
      }
      break;
    case 'tomato':
      // Use most descriptive ingredient names
      if (ingredientsToProcess && ingredientsToProcess.length > 0) {
        const tomatoDescriptiveNames = ingredientsToProcess
          .filter(ing => ing && typeof ing === 'string')
          .map(ing => getDescriptiveIngredientName(ing));
        if (tomatoDescriptiveNames.length > 0) {
          substitutions.push(...tomatoDescriptiveNames.map(name => `NO ${name}`));
        } else {
          substitutions.push('NO tomato');
        }
      } else {
        substitutions.push('NO tomato');
      }
      break;
    case 'seed':
      // Check for composite ingredients containing seeds
      for (const composite of compositeWithAllergen) {
        const subIngs = getSubIngredients(composite.toLowerCase());
        const seedSubs = subIngs.filter(sub => 
          allergenIngredients.seed.some(seedIng => 
            sub.toLowerCase().includes(seedIng.toLowerCase()) ||
            seedIng.toLowerCase().includes(sub.toLowerCase())
          )
        );
        if (seedSubs.length > 0) {
          substitutions.push(`NO ${composite} (contains: ${seedSubs.join(', ')})`);
        } else {
          substitutions.push(`NO ${composite}`);
        }
      }
      
      // Check for house oil specifically
      const hasHouseOil = ingredientsToProcess.some(ing => 
        ing.toLowerCase().includes('house oil')
      ) || dish.ingredients?.some(ing => 
        ing.toLowerCase().includes('house oil')
      );
      if (hasHouseOil && !compositeWithAllergen.some(c => c.toLowerCase().includes('house oil'))) {
        substitutions.push('NO house oil');
      }
      
      // Check for specific seed types - use most descriptive names
      if (ingredientsToProcess && ingredientsToProcess.length > 0) {
        const seedDescriptiveNames = ingredientsToProcess
          .filter(ing => ing && typeof ing === 'string')
          .map(ing => getDescriptiveIngredientName(ing));
        if (seedDescriptiveNames.length > 0) {
          // Filter out house oil as we handle it separately above
          const nonHouseOilSeeds = seedDescriptiveNames.filter(name => 
            !name.toLowerCase().includes('house oil')
          );
          if (nonHouseOilSeeds.length > 0) {
            substitutions.push(...nonHouseOilSeeds.map(name => `NO ${name}`));
          }
        }
      }
      
      // Check dish.ingredients for seeds if not already found
      if (dish.ingredients && dish.ingredients.length > 0) {
        const seedTerms = allergenIngredients.seed.filter(term => term !== 'house oil');
        dish.ingredients.forEach(ing => {
          if (ing && typeof ing === 'string') {
            const ingLower = ing.toLowerCase();
            const matchesSeed = seedTerms.some(term => {
              const termLower = term.toLowerCase();
              const regex = new RegExp(`\\b${termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
              return regex.test(ingLower);
            });
            if (matchesSeed && !substitutions.some(sub => sub.toLowerCase().includes(ingLower))) {
              const descriptiveSeed = getDescriptiveIngredientName(ing);
              substitutions.push(`NO ${descriptiveSeed}`);
            }
          }
        });
      }
      
      if (substitutions.length === 0) {
        substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
      }
      break;
    default:
      substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
  }

  // For pre-prepared foods with main ingredients, add NOT POSSIBLE messages for those
  if (isPrepared && mainIngredients.length > 0) {
    // Add NOT POSSIBLE messages for main ingredients at the beginning
    const mainIngredientNames = mainIngredients.map(ing => findMostSpecificIngredientName(ing, dish));
    const notPossibleMessages = mainIngredientNames.map(ing => 
      `NOT POSSIBLE - ${ing} (${ALLERGEN_LABELS[allergen]}) - cannot be removed, part of pre-made mixture`
    );
    // Return NOT POSSIBLE messages first, then substitutable items
    return [...notPossibleMessages, ...substitutions];
  }

  return substitutions;
}

export function checkDishSafety(
  dish: MenuItem,
  allergies: Allergen[],
  customAllergies: string[] = []
): AllergyCheckResult {
  try {
    const canModify = !isPreparedFood(dish) && !(dish.cannot_be_made_safe_notes && dish.cannot_be_made_safe_notes.trim() !== '');
    
    const perAllergy = allergies.map((allergen) => {
    // For onion_garlic, tomato, and seed, check description only (no CSV column)
    const isDescriptionOnly = allergen === 'onion_garlic' || allergen === 'tomato' || allergen === 'seed';
    
    let containsValue: 'Y' | 'N' | '' | null = null;
    let contains = false;
    let foundIngredients: string[] = [];
    
    if (isDescriptionOnly) {
      // Check description for these allergens
      const foundInDescription = findAllergenIngredients(dish.description, allergen);
      foundIngredients = [...foundInDescription]; // Create a new mutable array
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
          const foundInDescription = findAllergenIngredients(dish.description || '', allergen);
          foundIngredients = [...foundInDescription]; // Create a new mutable array
          // Also check dish.ingredients array for direct matches (e.g., "flour" in ingredients list)
          if (dish.ingredients && dish.ingredients.length > 0 && allergen === 'gluten') {
            const glutenIngredientTerms = allergenIngredients.gluten || [];
            dish.ingredients.forEach(ing => {
              if (ing && typeof ing === 'string') {
                const ingLower = ing.toLowerCase();
                const matchesGluten = glutenIngredientTerms.some(term => 
                  ingLower.includes(term.toLowerCase()) || term.toLowerCase().includes(ingLower)
                );
                if (matchesGluten && !foundIngredients.some(f => f.toLowerCase() === ingLower)) {
                  foundIngredients.push(ing);
                }
              }
            });
          }
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
      
      // Also check for direct allergen ingredients in dish.ingredients (e.g., "flour" for gluten, "house oil" for seed)
      // This ensures we catch ingredients that are in the ingredients list but might not be in the description
      // For description-only allergens (seed, onion_garlic, tomato), always check dish.ingredients
      // For other allergens, only check if already found
      const shouldCheckIngredients = contains || isDescriptionOnly;
      if (shouldCheckIngredients && allergenIngredients[allergen]) {
        const allergenTerms = allergenIngredients[allergen];
        let foundInIngredients = false;
        const ingredientsToAdd: string[] = [];
        
        dish.ingredients.forEach(ing => {
          if (ing && typeof ing === 'string') {
            const ingLower = ing.toLowerCase();
            const matchesAllergen = allergenTerms.some(term => {
              const termLower = term.toLowerCase();
              // Use word boundary matching for more accurate detection
              // For multi-word terms like "house oil", check if the ingredient contains the full phrase
              if (termLower.includes(' ')) {
                // Multi-word term: check if ingredient contains the full phrase
                return ingLower.includes(termLower);
              } else {
                // Single word: use word boundary matching
                const regex = new RegExp(`\\b${termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                return regex.test(ingLower) || ingLower === termLower;
              }
            });
            if (matchesAllergen) {
              foundInIngredients = true;
              if (!foundIngredients.some(f => f.toLowerCase() === ingLower) &&
                  !ingredientsToAdd.some(f => f.toLowerCase() === ingLower)) {
                ingredientsToAdd.push(ing);
              }
            }
          }
        });
        
        // Set contains if we found a match (for description-only allergens)
        if (foundInIngredients) {
          if (isDescriptionOnly && !contains) {
            contains = true;
            containsValue = 'Y';
          }
          // Add ingredients to foundIngredients array
          foundIngredients.push(...ingredientsToAdd);
        }
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

    // Check for special dish-specific modifications first
    const specialMods = getSpecialModifications(dish.id, allergen);
    
    // Determine status - special mods with empty array = safe (no changes needed)
    let status: 'safe' | 'unsafe';
    if (specialMods) {
      // If special mods exist with empty array and canBeModified=true, dish is safe
      if (specialMods.modifications.length === 0 && specialMods.canBeModified) {
        status = 'safe';
      } else {
        // Has modifications needed OR cannot be modified = unsafe
        status = 'unsafe';
      }
    } else {
      // No special mods, use standard detection
      status = (containsValue === 'Y' || contains) ? 'unsafe' : 'safe';
    }
    
    const substitutions = status === 'unsafe' ? generateSubstitutions(dish, allergen, canModify, foundIngredients) : [];
    
    // Determine if modification is actually possible based on analyzeModificationPossibility
    // Special modifications override the automatic analysis
    const modAnalysis = analyzeModificationPossibility(dish, allergen);
    const actualCanBeModified = specialMods ? specialMods.canBeModified : (modAnalysis.modifiable && canModify);

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
    // Check both description and ingredients array
    const foundInDescription = findCustomAllergenIngredients(dish.description || '', customAllergen);
    const foundInIngredients = dish.ingredients && Array.isArray(dish.ingredients) ? findCustomAllergenIngredients(dish.ingredients.join(' '), customAllergen) : [];
    
    // Also check ingredients array directly for exact matches (more specific)
    const allergenLower = customAllergen.toLowerCase().trim();
    const directIngredientMatches: string[] = [];
    if (dish.ingredients && Array.isArray(dish.ingredients) && dish.ingredients.length > 0) {
      for (const ingredient of dish.ingredients) {
        if (!ingredient || typeof ingredient !== 'string') continue;
        const ingLower = ingredient.toLowerCase();
        // Check for exact match or if ingredient contains the allergen
        if (ingLower === allergenLower || 
            ingLower.includes(allergenLower) || 
            allergenLower.includes(ingLower)) {
          // For "black pepper" or "red pepper", prefer the more specific match
          if (allergenLower.includes('black pepper') && ingLower.includes('black') && ingLower.includes('pepper')) {
            directIngredientMatches.push(ingredient);
          } else if (allergenLower.includes('red pepper') && ingLower.includes('red') && ingLower.includes('pepper')) {
            directIngredientMatches.push(ingredient);
          } else if (!allergenLower.includes('pepper') || !ingLower.includes('pepper')) {
            // For non-pepper allergens, use simple match
            directIngredientMatches.push(ingredient);
          }
        }
      }
    }
    
    // Combine and deduplicate found ingredients, preferring more specific matches from ingredients array
    const allFound = [...foundInDescription, ...foundInIngredients, ...directIngredientMatches].filter(v => v && typeof v === 'string');
    const foundIngredients = allFound.filter((value, index, self) => {
      if (!value || typeof value !== 'string') return false;
      const valueLower = value.toLowerCase();
      // Remove duplicates
      const firstIndex = self.findIndex(v => v && typeof v === 'string' && v.toLowerCase() === valueLower);
      if (firstIndex !== index) return false;
      
      // For pepper-related, prefer more specific (e.g., "black pepper" over "pepper")
      if (valueLower.includes('black pepper') || valueLower.includes('red pepper')) {
        return true; // Keep the more specific one
      }
      // If we have a generic "pepper" but also have a specific one, remove the generic
      if (valueLower === 'pepper' || valueLower === 'peppers') {
        const hasSpecific = self.some(v => 
          v && typeof v === 'string' && (
            v.toLowerCase().includes('black pepper') || 
            v.toLowerCase().includes('red pepper')
          )
        );
        return !hasSpecific;
      }
      return true;
    });
    
    let contains = foundIngredients.length > 0;
    
    // For "onion" or "garlic" custom allergens, also check composite ingredients
    // (similar to how standard allergens check composite ingredients)
    // Note: allergenLower is already declared above
    if ((allergenLower === 'onion' || allergenLower === 'onions') && dish.ingredients && dish.ingredients.length > 0) {
      // Check composite ingredients for onion
      const compositeWithOnion = dish.ingredients.filter(ing => {
        const ingLower = ing.toLowerCase().trim();
        return compositeIngredients[ingLower] && compositeContainsOnion(ingLower);
      });
      if (compositeWithOnion.length > 0) {
        contains = true;
        compositeWithOnion.forEach(composite => {
          if (!foundIngredients.some(ing => ing.toLowerCase() === composite.toLowerCase())) {
            foundIngredients.push(composite);
          }
        });
      }
    } else if (allergenLower === 'garlic' && dish.ingredients && dish.ingredients.length > 0) {
      // Check composite ingredients for garlic
      const compositeWithGarlic = dish.ingredients.filter(ing => {
        const ingLower = ing.toLowerCase().trim();
        return compositeIngredients[ingLower] && compositeContainsGarlic(ingLower);
      });
      if (compositeWithGarlic.length > 0) {
        contains = true;
        compositeWithGarlic.forEach(composite => {
          if (!foundIngredients.some(ing => ing.toLowerCase() === composite.toLowerCase())) {
            foundIngredients.push(composite);
          }
        });
      }
    }
    
    // Check if this is a pre-prepared dish
    const isPrepared = isPreparedFood(dish);
    
    // Check if the allergen is only in garnish
    const garnishIngredients = foundIngredients.filter(ing => isGarnishIngredient(dish, ing));
    const isOnlyGarnish = garnishIngredients.length > 0 && garnishIngredients.length === foundIngredients.length;
    
    // Special case: chives allergy - check if dish contains onions/garlic (related ingredients)
    // If dish has onions/garlic in main mixture, chives cannot be made safe even if chives are garnish
    let hasRelatedMainIngredient = false;
    if (customAllergen.toLowerCase() === 'chives' || customAllergen.toLowerCase().includes('chive')) {
      // Check if dish contains onions or garlic in the main description (not just garnish)
      const descriptionLower = dish.description.toLowerCase();
      const hasOnions = descriptionLower.includes('onion') && !isGarnishIngredient(dish, 'onion');
      const hasGarlic = descriptionLower.includes('garlic') && !isGarnishIngredient(dish, 'garlic');
      // Check ingredients array for onions/garlic that are not garnish
      const hasOnionsInIngredients = dish.ingredients?.some(ing => {
        const ingLower = ing.toLowerCase();
        return (ingLower.includes('onion') || ingLower.includes('garlic')) && 
               !isGarnishIngredient(dish, ing);
      });
      hasRelatedMainIngredient = hasOnions || hasGarlic || !!hasOnionsInIngredients;
    }
    
    // Determine status and modifiability
    let status: 'safe' | 'unsafe' = contains ? 'unsafe' : 'safe';
    let actualCanBeModified = canModify;
    
    // For pre-prepared dishes with garnish-only allergens (and no related main ingredients)
    if (isPrepared && isOnlyGarnish && !hasRelatedMainIngredient) {
      // Garnish can be removed even from pre-prepared dishes
      actualCanBeModified = true;
    } else if (isPrepared && contains && !isOnlyGarnish) {
      // Allergen is in main mixture, cannot be removed
      actualCanBeModified = false;
    } else if (isPrepared && hasRelatedMainIngredient) {
      // Related ingredient in main mixture (e.g., chives + onions), cannot be made safe
      actualCanBeModified = false;
    }
    
    // Generate descriptive substitutions using most specific ingredient names
    let substitutions: string[] = [];
    if (status === 'unsafe') {
      if (!actualCanBeModified) {
        if (hasRelatedMainIngredient) {
          substitutions = [`NOT POSSIBLE - Cannot remove ${customAllergen} - dish contains related ingredients in main mixture`];
        } else {
          substitutions = [`NOT POSSIBLE - Cannot remove ${customAllergen} - dish cannot be modified`];
        }
      } else {
        // Use most descriptive ingredient names from dish.ingredients
        const ingredientsToProcess = isPrepared && isOnlyGarnish ? garnishIngredients : foundIngredients;
        const descriptiveNames = ingredientsToProcess.map(ing => {
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
      canBeModified: actualCanBeModified,
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
  } catch (error) {
    console.error('Error in checkDishSafety:', error);
    console.error('Dish:', dish?.dish_name);
    console.error('Allergies:', allergies);
    console.error('Custom Allergies:', customAllergies);
    throw error; // Re-throw to be caught by the component's try-catch
  }
}


