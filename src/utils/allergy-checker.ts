import type { Allergen, AllergyCheckResult, MenuItem } from '../types';

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
    'butter', 'cream', 'cheese', 'milk', 'yogurt', 'sour cream', 'whipping cream',
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

// General modification suggestions by allergen
const allergenSuggestions: Record<Allergen, string[]> = {
  dairy: [
    'Substitute butter with olive oil or dairy-free margarine',
    'Replace cream with coconut cream or non-dairy milk alternatives',
    'Remove or substitute cheese with dairy-free alternatives',
    'Use dairy-free alternatives for any sauces or dressings'
  ],
  egg: [
    'Remove egg-based binders or use egg substitutes',
    'Omit egg-based sauces or dressings',
    'Substitute egg wash with oil or dairy-free milk',
    'Ensure no egg-based breading or batter'
  ],
  gluten: [
    'Use gluten-free bread, buns, or pasta alternatives',
    'Substitute flour-based thickeners with cornstarch or arrowroot',
    'Remove croutons or bread-based garnishes',
    'Ensure all sauces and marinades are gluten-free'
  ],
  shellfish: [
    'Remove shellfish from the dish entirely',
    'Substitute with non-shellfish protein if applicable',
    'Ensure no shellfish-based stocks or broths are used',
    'Clean all surfaces and utensils to prevent cross-contamination'
  ],
  fish: [
    'Remove fish from the dish entirely',
    'Substitute with non-fish protein if applicable',
    'Ensure no fish-based stocks or sauces are used',
    'Clean all surfaces and utensils to prevent cross-contamination'
  ],
  soy: [
    'Substitute soy sauce with tamari (gluten-free) or coconut aminos',
    'Remove soy-based marinades or dressings',
    'Check all sauces for soy ingredients',
    'Use soy-free alternatives for any Asian-inspired dishes'
  ],
  peanuts: [
    'Remove peanuts and peanut-based ingredients',
    'Substitute peanut oil with other cooking oils',
    'Ensure no peanut-based sauces or garnishes',
    'Clean all surfaces and utensils to prevent cross-contamination'
  ],
  tree_nuts: [
    'Remove tree nuts and nut-based ingredients',
    'Substitute nut oils with other cooking oils',
    'Remove nut-based crusts or toppings',
    'Clean all surfaces and utensils to prevent cross-contamination'
  ],
  sesame: [
    'Remove sesame seeds and sesame oil',
    'Substitute sesame-based dressings or sauces',
    'Remove sesame seed buns or bread',
    'Clean all surfaces and utensils to prevent cross-contamination'
  ],
  msg: [
    'Remove MSG-containing seasonings',
    'Use fresh herbs and spices instead of pre-mixed seasonings',
    'Check all sauces and marinades for MSG',
    'Use natural flavor enhancers like mushrooms or tomatoes'
  ],
  onion_garlic: [
    'Remove all onion and garlic from the dish',
    'Substitute with celery or fennel for similar texture',
    'Use asafoetida (hing) powder as a garlic substitute if tolerated',
    'Omit garlic-based marinades, sauces, and dressings',
    'Remove garlic croutons or bread-based garnishes',
    'Ensure no onion or garlic in stocks, broths, or bases'
  ],
  tomato: [
    'Remove tomatoes and tomato-based ingredients',
    'Substitute tomato sauce with alternative sauces (e.g., pesto, white sauce)',
    'Omit tomato paste, tomato jam, or tomato-based condiments',
    'Remove tomato garnishes or toppings',
    'Check all sauces and dressings for tomato ingredients',
    'Substitute with bell peppers or other vegetables if applicable'
  ],
};

export function checkDishSafety(
  dish: MenuItem,
  allergies: Allergen[]
): AllergyCheckResult {
  const perAllergy = allergies.map((allergen) => {
    // For onion_garlic and tomato, check description only (no CSV column)
    const isDescriptionOnly = allergen === 'onion_garlic' || allergen === 'tomato';
    
    let containsValue: 'Y' | 'N' | '' | null = null;
    let contains = false;
    
    if (isDescriptionOnly) {
      // Check description for these allergens
      const foundIngredients = findAllergenIngredients(dish.description, allergen);
      contains = foundIngredients.length > 0;
      containsValue = contains ? 'Y' : 'N';
    } else {
      // Check CSV column for other allergens
      const column = allergenToColumn[allergen];
      if (column) {
        containsValue = dish[column] as 'Y' | 'N' | '' | null;
        contains = containsValue === 'Y';
      }
    }

    // Find specific ingredients containing this allergen
    const foundIngredients = contains ? findAllergenIngredients(dish.description, allergen) : [];

    let status: 'safe' | 'safe_with_mods' | 'unsafe';
    let message: string;
    let suggestions: string[] = [];

    if (containsValue === 'N' || containsValue === '' || containsValue === null || !contains) {
      status = 'safe';
      message = 'Does not contain this allergen according to current data.';
    } else if (containsValue === 'Y' || contains) {
      // Build message with specific ingredients
      let ingredientMessage = '';
      if (foundIngredients.length > 0) {
        const ingredientList = foundIngredients.join(', ');
        ingredientMessage = ` Contains: ${ingredientList}.`;
      } else {
        ingredientMessage = ' Contains this allergen (specific ingredients not identified in description).';
      }

      if (dish.cannot_be_made_safe_notes && dish.cannot_be_made_safe_notes.trim() !== '') {
        status = 'unsafe';
        message = dish.cannot_be_made_safe_notes + ingredientMessage;
        // Still provide suggestions even if marked as cannot be made safe
        suggestions = allergenSuggestions[allergen];
      } else if (dish.mod_notes && dish.mod_notes.trim() !== '') {
        status = 'safe_with_mods';
        message = dish.mod_notes + ingredientMessage;
        // Combine specific mod notes with general suggestions
        suggestions = [dish.mod_notes, ...allergenSuggestions[allergen]];
      } else {
        status = 'unsafe';
        message = 'Contains this allergen.' + ingredientMessage + ' Modification suggestions provided below.';
        suggestions = allergenSuggestions[allergen];
      }
    } else {
      // Fallback (shouldn't happen with proper data)
      status = 'unsafe';
      message = 'Unknown allergen status. Treat as NOT safe and consult chef/manager.';
      suggestions = allergenSuggestions[allergen];
    }

    return {
      allergen,
      contains,
      status,
      message,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      foundIngredients: foundIngredients.length > 0 ? foundIngredients : undefined,
    };
  });

  // Determine overall status
  let overallStatus: 'safe' | 'safe_with_mods' | 'unsafe';
  if (perAllergy.some((a) => a.status === 'unsafe')) {
    overallStatus = 'unsafe';
  } else if (perAllergy.some((a) => a.status === 'safe_with_mods')) {
    overallStatus = 'safe_with_mods';
  } else {
    overallStatus = 'safe';
  }

  // Generate global message
  let globalMessage: string;
  if (overallStatus === 'unsafe') {
    globalMessage = 'This dish contains allergens that may not be safely modified. Review modification suggestions below and consult with kitchen management before serving.';
  } else if (overallStatus === 'safe_with_mods') {
    globalMessage = 'Dish can be served ONLY with the modifications listed below. Confirm with kitchen and follow allergy procedures.';
  } else {
    globalMessage = 'Dish appears safe for the selected allergens based on current data. Still follow standard allergy protocols.';
  }

  // Collect all modification suggestions
  const modificationSuggestions: string[] = [];
  perAllergy.forEach((item) => {
    if (item.suggestions && item.suggestions.length > 0) {
      modificationSuggestions.push(...item.suggestions);
    }
  });
  // Remove duplicates
  const uniqueSuggestions = Array.from(new Set(modificationSuggestions));

  return {
    dish,
    selectedAllergies: allergies,
    overallStatus,
    perAllergy,
    globalMessage,
    modificationSuggestions: uniqueSuggestions,
  };
}

