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

// Check if dish is a prepared food that cannot be modified (soups, bisques, etc.)
function isPreparedFood(dish: MenuItem): boolean {
  const description = dish.description.toLowerCase();
  const dishName = dish.dish_name.toLowerCase();
  const category = dish.category.toLowerCase();
  
  // Soups, bisques, and pre-made items
  const preparedKeywords = ['soup', 'bisque', 'stew', 'chili', 'gumbo'];
  return preparedKeywords.some(keyword => 
    dishName.includes(keyword) || 
    description.includes(keyword) ||
    category.includes('soup')
  );
}

// Generate substitution list for an allergen
function generateSubstitutions(dish: MenuItem, allergen: Allergen, canModify: boolean): string[] {
  if (!canModify) {
    return [`NO ${ALLERGEN_LABELS[allergen]}`];
  }

  const substitutions: string[] = [];
  const foundIngredients = findAllergenIngredients(dish.description, allergen);
  
  // Generate specific substitutions based on allergen type
  switch (allergen) {
    case 'dairy':
      if (foundIngredients.some(ing => ing.toLowerCase().includes('butter'))) {
        substitutions.push('NO butter (use oil)');
      }
      if (foundIngredients.some(ing => ing.toLowerCase().includes('cheese'))) {
        substitutions.push('NO cheese');
      }
      if (foundIngredients.some(ing => ing.toLowerCase().includes('cream'))) {
        substitutions.push('NO cream (use non-dairy alternative)');
      }
      if (substitutions.length === 0) {
        substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
      }
      break;
    case 'gluten':
      if (foundIngredients.some(ing => ing.toLowerCase().includes('bun') || ing.toLowerCase().includes('bread'))) {
        substitutions.push('NO bun/bread (use gluten-free)');
      }
      if (foundIngredients.some(ing => ing.toLowerCase().includes('crouton'))) {
        substitutions.push('NO croutons');
      }
      if (foundIngredients.some(ing => ing.toLowerCase().includes('flour'))) {
        substitutions.push('NO flour (use gluten-free alternative)');
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
      if (foundIngredients.some(ing => ing.toLowerCase().includes('mayo'))) {
        substitutions.push('NO mayonnaise');
      }
      if (substitutions.length === 0) {
        substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
      }
      break;
    case 'soy':
      if (foundIngredients.some(ing => ing.toLowerCase().includes('soy sauce') || ing.toLowerCase().includes('tamari'))) {
        substitutions.push('NO soy sauce (use coconut aminos)');
      } else {
        substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
      }
      break;
    case 'sesame':
      if (foundIngredients.some(ing => ing.toLowerCase().includes('sesame seed bun'))) {
        substitutions.push('NO sesame seed bun (use regular bun)');
      } else {
        substitutions.push(`NO ${ALLERGEN_LABELS[allergen]}`);
      }
      break;
    case 'onion_garlic':
      substitutions.push('NO onion/garlic');
      break;
    case 'tomato':
      substitutions.push('NO tomato');
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

    const status: 'safe' | 'unsafe' = (containsValue === 'Y' || contains) ? 'unsafe' : 'safe';
    const substitutions = status === 'unsafe' ? generateSubstitutions(dish, allergen, canModify) : [];

    return {
      allergen,
      contains,
      status,
      canBeModified: canModify,
      substitutions,
      foundIngredients: foundIngredients.length > 0 ? foundIngredients : undefined,
    };
  });

  // Check custom allergens
  const customAllergyResults = customAllergies.map((customAllergen) => {
    const foundIngredients = findCustomAllergenIngredients(dish.description, customAllergen);
    const contains = foundIngredients.length > 0;
    const status: 'safe' | 'unsafe' = contains ? 'unsafe' : 'safe';
    const substitutions = status === 'unsafe' 
      ? (canModify ? [`NO ${customAllergen}`] : [`Cannot remove ${customAllergen} - dish cannot be modified`])
      : [];

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

