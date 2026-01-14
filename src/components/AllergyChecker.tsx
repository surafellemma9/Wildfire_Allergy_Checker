import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { cn } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';
import type { Allergen, MenuItem } from '../types';
import { checkDishSafety } from '../utils/allergy-checker';

// Lazy load menu items to reduce initial bundle size
let menuItemsCache: MenuItem[] | null = null;
let menuItemsPromise: Promise<MenuItem[]> | null = null;

async function loadMenuItems(): Promise<MenuItem[]> {
  if (menuItemsCache) {
    return menuItemsCache;
  }
  if (menuItemsPromise) {
    return menuItemsPromise;
  }
  
  const startTime = performance.now();
  menuItemsPromise = import('../data/menu-items').then((module) => {
    menuItemsCache = module.menuItems;
    const loadTime = performance.now() - startTime;
    console.log(`[Performance] Menu items loaded in ${loadTime.toFixed(2)}ms`);
    return module.menuItems;
  });
  
  return menuItemsPromise;
}

// Data timestamp
const DATA_TIMESTAMP = 'January 5, 2025';

/**
 * Fix spacing in ingredient names by adding spaces between common concatenated words
 */
function fixIngredientSpacing(ingredient: string): string {
  let fixed = ingredient;
  
  // Common ingredient word pairs that should have spaces
  const spacingFixes = [
    // Meat + seasoning/spice
    { pattern: /beefsalt/gi, replacement: 'beef salt' },
    { pattern: /chickensalt/gi, replacement: 'chicken salt' },
    { pattern: /porksalt/gi, replacement: 'pork salt' },
    
    // Pepper variations
    { pattern: /blackpepper/gi, replacement: 'black pepper' },
    { pattern: /cayennepepper/gi, replacement: 'cayenne pepper' },
    { pattern: /redpepper/gi, replacement: 'red pepper' },
    { pattern: /whitepepper/gi, replacement: 'white pepper' },
    { pattern: /greenpepper/gi, replacement: 'green pepper' },
    
    // Salt + pepper
    { pattern: /saltpepper/gi, replacement: 'salt pepper' },
    
    // Oil variations
    { pattern: /oliveoil/gi, replacement: 'olive oil' },
    { pattern: /vegetableoil/gi, replacement: 'vegetable oil' },
    { pattern: /canolaoil/gi, replacement: 'canola oil' },
    { pattern: /houseoil/gi, replacement: 'house oil' },
    { pattern: /housoil/gi, replacement: 'house oil' },
    
    // Cheese variations
    { pattern: /bluecheese/gi, replacement: 'blue cheese' },
    { pattern: /goatcheese/gi, replacement: 'goat cheese' },
    { pattern: /creamcheese/gi, replacement: 'cream cheese' },
    
    // Cream variations
    { pattern: /heavycream/gi, replacement: 'heavy cream' },
    { pattern: /whippingcream/gi, replacement: 'whipping cream' },
    { pattern: /sourcream/gi, replacement: 'sour cream' },
    
    // Wine variations
    { pattern: /whitewine/gi, replacement: 'white wine' },
    { pattern: /redwine/gi, replacement: 'red wine' },
    
    // Stock/broth variations
    { pattern: /chickenstock/gi, replacement: 'chicken stock' },
    { pattern: /beefstock/gi, replacement: 'beef stock' },
    { pattern: /vegetablestock/gi, replacement: 'vegetable stock' },
    
    // Paste/paste variations
    { pattern: /tomatopaste/gi, replacement: 'tomato paste' },
    
    // Other common combinations
    { pattern: /extravirginoliveoil/gi, replacement: 'extra virgin olive oil' },
    { pattern: /extravirgin/gi, replacement: 'extra virgin' },
    { pattern: /boiledegg/gi, replacement: 'boiled egg' },
    { pattern: /hardboiled/gi, replacement: 'hard boiled' },
    { pattern: /garliccrouton/gi, replacement: 'garlic crouton' },
    { pattern: /yogurtsauce/gi, replacement: 'yogurt sauce' },
    { pattern: /chickenjus/gi, replacement: 'chicken jus' },
    { pattern: /lobsterbase/gi, replacement: 'lobster base' },
    { pattern: /shrimppoaching/gi, replacement: 'shrimp poaching' },
    { pattern: /clamjuice/gi, replacement: 'clam juice' },
  ];
  
  // Apply all spacing fixes
  for (const fix of spacingFixes) {
    fixed = fixed.replace(fix.pattern, fix.replacement);
  }
  
  return fixed;
}

const ALL_ALLERGENS: Allergen[] = [
  'dairy',
  'egg',
  'gluten',
  'shellfish',
  'fish',
  'soy',
  'peanuts',
  'tree_nuts',
  'sesame',
  'msg',
  'onion_garlic',
  'tomato',
  'seed',
];

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

export function AllergyChecker() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedDishId, setSelectedDishId] = useState<string>('');
  const [selectedSideDishId, setSelectedSideDishId] = useState<string>('');
  const [selectedCrusts, setSelectedCrusts] = useState<Set<string>>(new Set());
  const [selectedProtein, setSelectedProtein] = useState<string>('');
  const [selectedDressing, setSelectedDressing] = useState<string>('');
  const [selectedAllergies, setSelectedAllergies] = useState<Set<Allergen>>(new Set());
  const [customAllergies, setCustomAllergies] = useState<Set<string>>(new Set());
  const [allergenSearchTerm, setAllergenSearchTerm] = useState('');
  const [showAllergenSuggestions, setShowAllergenSuggestions] = useState(false);
  const [highlightedAllergenIndex, setHighlightedAllergenIndex] = useState(-1);
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');
  const [showIngredientSuggestions, setShowIngredientSuggestions] = useState(false);
  const [highlightedIngredientIndex, setHighlightedIngredientIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showBrowseMode, setShowBrowseMode] = useState(false);
  const [sideDishSearchTerm, setSideDishSearchTerm] = useState('');
  const [showSideDishSuggestions, setShowSideDishSuggestions] = useState(false);
  const [highlightedSideDishIndex, setHighlightedSideDishIndex] = useState(-1);

  // Load menu items asynchronously
  useEffect(() => {
    const startTime = performance.now();
    loadMenuItems()
      .then((items) => {
        setMenuItems(items);
        const loadTime = performance.now() - startTime;
        console.log(`[Performance] Menu items loaded and rendered in ${loadTime.toFixed(2)}ms`);
      })
      .catch((error) => {
        console.error('[Error] Failed to load menu items:', error);
      });
  }, []);

  const selectedDish = useMemo(() => {
    return menuItems.find((item) => item.id === selectedDishId) || null;
  }, [selectedDishId, menuItems]);

  const selectedSideDish = useMemo(() => {
    return selectedSideDishId ? menuItems.find((item) => item.id === selectedSideDishId) || null : null;
  }, [selectedSideDishId, menuItems]);

  // Check if selected dish can have a side dish (all dishes except Appetizers and Sides)
  const canHaveSideDish = useMemo(() => {
    if (!selectedDish) return false;
    // Exclude Appetizers and Sides categories
    const excludedCategories = ['Appetizers', 'Sides'];
    return !excludedCategories.includes(selectedDish.category);
  }, [selectedDish]);

  // Check if selected dish is Classic Breakfast (needs protein selection)
  const isClassicBreakfast = useMemo(() => {
    if (!selectedDish) return false;
    return selectedDish.dish_name.toLowerCase().includes('classic breakfast');
  }, [selectedDish]);

  // Mapping of salads to their default dressings
  const saladDefaultDressings: Record<string, string> = {
    'caesar_salad': 'caesar',
    'tuscan_kale_and_spinach_salad': 'lemon_parmesan_vinaigrette',
    'greek_salad': 'red_wine_vinaigrette',
    'steak_and_blue_cheese_salad': 'balsamic_vinaigrette', // Also has ranch drizzle, but balsamic is the main one
    'wildfire_chopped_salad': 'citrus_lime_vinaigrette',
    // Field Salad has no default - guest chooses
  };

  // Check if selected dish is a salad
  const isSalad = useMemo(() => {
    if (!selectedDish) return false;
    return selectedDish.category === 'Salads' || selectedDish.dish_name.toLowerCase().includes('salad');
  }, [selectedDish]);

  // Check if selected dish is Field Salad (needs dressing selection, no default)
  const isFieldSalad = useMemo(() => {
    if (!selectedDish) return false;
    return selectedDish.dish_name.toLowerCase().includes('field salad');
  }, [selectedDish]);

  // Get default dressing for the selected salad
  const defaultDressing = useMemo(() => {
    if (!selectedDish || isFieldSalad) return null;
    return saladDefaultDressings[selectedDish.id] || null;
  }, [selectedDish, isFieldSalad]);

  // Get all side dishes
  const sideDishes = useMemo(() => {
    return menuItems.filter((item) => item.category === 'Sides');
  }, [menuItems]);

  // Filter side dishes based on search term
  const filteredSideDishes = useMemo(() => {
    if (!sideDishSearchTerm.trim()) return [];
    const term = sideDishSearchTerm.toLowerCase();
    const matches = sideDishes
      .filter(
        (item) =>
          item.dish_name.toLowerCase().includes(term) ||
          item.ticket_code.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
      )
      .map((item) => {
        // Calculate relevance score for sorting
        const nameMatch = item.dish_name.toLowerCase().startsWith(term) ? 3 : 
                         item.dish_name.toLowerCase().includes(term) ? 2 : 0;
        const codeMatch = item.ticket_code.toLowerCase().includes(term) ? 1 : 0;
        return {
          ...item,
          relevance: nameMatch + codeMatch,
        };
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10); // Show top 10 matches
    
    return matches;
  }, [sideDishSearchTerm, sideDishes]);

  // Helper function to check if a dish can have crust (only specific dishes)
  const dishCanHaveCrust = (dishName: string): boolean => {
    const name = dishName.toLowerCase();
    
    // Check for specific dishes that can have crust:
    // New York Strip, Filet, Porterhouse, Prime Rib, Ribeye, Skirt Steak, Lambchop, Porkchop
    return (
      name.includes('new york strip') ||
      (name.includes('filet') && !name.includes('sandwich')) ||
      name.includes('porterhouse') ||
      (name.includes('prime rib') && !name.includes('sandwich') && !name.includes('dip')) ||
      name.includes('rib eye') ||
      name.includes('ribeye') ||
      name.includes('skirt steak') ||
      (name.includes('lamb') && (name.includes('chop') || name.includes('porterhouse'))) ||
      (name.includes('pork') && name.includes('chop'))
    );
  };

  // Check if selected dish can have crust (only specific dishes)
  const canHaveCrust = useMemo(() => {
    if (!selectedDish) return false;
    return dishCanHaveCrust(selectedDish.dish_name);
  }, [selectedDish]);

  // Crust options
  const crustOptions = [
    { value: 'bluecheese', label: 'Blue Cheese' },
    { value: 'parmesan', label: 'Parmesan' },
    { value: 'horseradish', label: 'Horseradish' },
    { value: 'garlic', label: 'Garlic' }
  ];

  // Dressing options for Field Salad
  const dressingOptions = [
    { value: 'citrus_lime_vinaigrette', label: 'Citrus Lime Vinaigrette' },
    { value: 'ranch', label: 'Ranch' },
    { value: 'balsamic_vinaigrette', label: 'Balsamic Vinaigrette' },
    { value: 'red_wine_vinaigrette', label: 'Red Wine Vinaigrette' },
    { value: 'blue_cheese_dressing', label: 'Blue Cheese Dressing' },
    { value: 'lemon_parmesan_vinaigrette', label: 'Lemon Parmesan Vinaigrette' },
    { value: 'lemon_herb_vinaigrette', label: 'Lemon Herb Vinaigrette' },
    { value: 'caesar', label: 'Caesar' }
  ];

  const filteredDishes = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    const matches = menuItems
      .filter(
        (item) =>
          item.dish_name.toLowerCase().includes(term) ||
          item.ticket_code.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
      )
      .map((item) => {
        // Calculate relevance score for sorting
        const nameMatch = item.dish_name.toLowerCase().startsWith(term) ? 3 : 
                         item.dish_name.toLowerCase().includes(term) ? 2 : 0;
        const codeMatch = item.ticket_code.toLowerCase().includes(term) ? 1 : 0;
        const categoryMatch = item.category.toLowerCase().includes(term) ? 0.5 : 0;
        return {
          ...item,
          relevance: nameMatch + codeMatch + categoryMatch,
        };
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10); // Show top 10 matches
    
    return matches;
  }, [searchTerm, menuItems]);

  // Filter allergens based on search term
  const filteredAllergens = useMemo(() => {
    if (!allergenSearchTerm.trim()) return ALL_ALLERGENS;
    const term = allergenSearchTerm.toLowerCase();
    return ALL_ALLERGENS.filter((allergen) =>
      ALLERGEN_LABELS[allergen].toLowerCase().includes(term)
    );
  }, [allergenSearchTerm]);

  // Get all unique ingredients from all menu items
  const allIngredients = useMemo(() => {
    const ingredientSet = new Set<string>();
    menuItems.forEach((item) => {
      if (item.ingredients && Array.isArray(item.ingredients)) {
        item.ingredients.forEach((ingredient) => {
          if (typeof ingredient === 'string' && ingredient.trim()) {
            // Fix spacing in ingredient names
            const fixed = fixIngredientSpacing(ingredient);
            ingredientSet.add(fixed);
          }
        });
      }
    });
    return Array.from(ingredientSet).sort();
  }, [menuItems]);

  // Filter ingredients from all menu items for custom allergen selection
  const filteredIngredients = useMemo(() => {
    if (!ingredientSearchTerm.trim()) return [];
    
    const term = ingredientSearchTerm.toLowerCase();
    return allIngredients
      .filter((ingredient) => 
        ingredient.toLowerCase().includes(term) &&
        !customAllergies.has(ingredient) &&
        !selectedAllergies.has(ingredient as Allergen)
      )
      .slice(0, 20); // Limit to 20 suggestions
  }, [ingredientSearchTerm, allIngredients, customAllergies, selectedAllergies]);

  const handleAllergySelect = (allergen: Allergen) => {
    const newSet = new Set(selectedAllergies);
    if (!newSet.has(allergen)) {
      newSet.add(allergen);
    setSelectedAllergies(newSet);
      setAllergenSearchTerm('');
      setShowAllergenSuggestions(false);
      setShowResults(false);
    }
  };

  const handleAllergenInputChange = (value: string) => {
    setAllergenSearchTerm(value);
    setShowAllergenSuggestions(true);
    setHighlightedAllergenIndex(-1);
    setShowResults(false);
  };

  const handleAllergenInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const availableAllergens = filteredAllergens.filter((a) => !selectedAllergies.has(a));
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedAllergenIndex((prev) => 
        prev < availableAllergens.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedAllergenIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedAllergenIndex >= 0 && highlightedAllergenIndex < availableAllergens.length) {
        // Select from dropdown
        handleAllergySelect(availableAllergens[highlightedAllergenIndex]);
      } else if ((selectedAllergies.size > 0 || customAllergies.size > 0) && !selectedDishId) {
        // If allergens are selected but no dish, trigger browse mode
        setShowBrowseMode(true);
        setShowResults(false);
        setAllergenSearchTerm('');
        setShowAllergenSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowAllergenSuggestions(false);
    }
  };

  // Handler for ingredient input changes (custom allergens)
  const handleIngredientInputChange = (value: string) => {
    setIngredientSearchTerm(value);
    setShowIngredientSuggestions(true);
    setHighlightedIngredientIndex(-1);
    setShowResults(false);
  };

  // Handler for ingredient input keydown
  const handleIngredientInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const availableIngredients = filteredIngredients.filter((ing) => !customAllergies.has(ing));
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIngredientIndex((prev) => 
        prev < availableIngredients.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIngredientIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIngredientIndex >= 0 && highlightedIngredientIndex < availableIngredients.length) {
        // Select from suggestions
        const ingredient = availableIngredients[highlightedIngredientIndex];
        setCustomAllergies(new Set([...customAllergies, ingredient]));
        setIngredientSearchTerm('');
        setShowIngredientSuggestions(false);
        setShowResults(false);
      }
    } else if (e.key === 'Escape') {
      setShowIngredientSuggestions(false);
    }
  };

  // Handler for selecting an ingredient
  const handleIngredientSelect = (ingredient: string) => {
    if (!customAllergies.has(ingredient) && !selectedAllergies.has(ingredient as Allergen)) {
      setCustomAllergies(new Set([...customAllergies, ingredient]));
      setIngredientSearchTerm('');
      setShowIngredientSuggestions(false);
      setShowResults(false);
    }
  };

  const handleRemoveAllergen = (allergen: Allergen | string) => {
    // Check if it's a common allergen (in ALLERGEN_LABELS) or a custom allergen
    if (allergen in ALLERGEN_LABELS) {
      // Common allergen - remove from selectedAllergies
      const newSet = new Set(selectedAllergies);
      newSet.delete(allergen as Allergen);
      setSelectedAllergies(newSet);
    } else {
      // Custom allergen - remove from customAllergies
    const newSet = new Set(customAllergies);
    newSet.delete(allergen);
    setCustomAllergies(newSet);
    }
    setShowResults(false);
  };

  const handleCheckSafety = () => {
    if (!selectedDish || (selectedAllergies.size === 0 && customAllergies.size === 0)) {
      alert('Please select a dish and at least one allergy.');
      return;
    }
    if (isClassicBreakfast && !selectedProtein) {
      alert('Please select a protein option (bacon or turkey sausage).');
      return;
    }
    if (isFieldSalad && !selectedDressing) {
      alert('Please select a dressing option.');
      return;
    }
    console.log('Setting showResults to true');
    setShowResults(true);
  };

  // Check crusts for allergens
  const checkCrustAllergens = (crusts: Set<string>, allergies: Allergen[]) => {
    if (!crusts || crusts.size === 0) return null;
    
    const crustAllergens: Record<string, Allergen[]> = {
      'bluecheese': ['dairy'],
      'parmesan': ['dairy'],
      'horseradish': [], // Horseradish itself doesn't contain common allergens, but check description
      'garlic': ['onion_garlic']
    };
    
    const crustContains: Record<string, boolean> = {};
    const crustFoundIngredients: Record<string, string[]> = {};
    const crustSubstitutions: Record<string, string[]> = {};
    
    allergies.forEach((allergen) => {
      let contains = false;
      const foundCrusts: string[] = [];
      const substitutionCrusts: string[] = [];
      
      // Check each selected crust
      crusts.forEach((crust) => {
        if (crustAllergens[crust]?.includes(allergen)) {
          contains = true;
          const crustLabel = crustOptions.find(c => c.value === crust)?.label || crust;
          foundCrusts.push(`${crustLabel} crust`);
          substitutionCrusts.push(`NO ${crustLabel} crust`);
        }
      });
      
      crustContains[allergen] = contains;
      crustFoundIngredients[allergen] = foundCrusts;
      crustSubstitutions[allergen] = substitutionCrusts;
    });
    
    // Check if any allergen is present
    const hasAllergen = Object.values(crustContains).some(v => v);
    
    return {
      contains: hasAllergen,
      status: hasAllergen ? 'unsafe' as const : 'safe' as const,
      foundIngredients: crustFoundIngredients,
      substitutions: crustSubstitutions
    };
  };

  // Check dressing for allergens
  const checkDressingAllergens = (dressing: string, allergies: Allergen[]) => {
    if (!dressing) return null;
    
    // Map dressing values to their allergen content
    const dressingAllergens: Record<string, Allergen[]> = {
      'citrus_lime_vinaigrette': [], // Typically oil-based, no common allergens
      'ranch': ['dairy', 'egg'], // Contains buttermilk, sour cream, mayonnaise
      'balsamic_vinaigrette': [], // Typically oil-based, no common allergens
      'red_wine_vinaigrette': [], // Typically oil-based, no common allergens
      'blue_cheese_dressing': ['dairy', 'egg'], // Contains mayonnaise, buttermilk, blue cheese
      'lemon_parmesan_vinaigrette': ['dairy'], // Contains parmesan cheese
      'lemon_herb_vinaigrette': [], // Typically oil-based, no common allergens
      'caesar': ['dairy', 'egg', 'shellfish'] // Contains anchovy, asiago cheese, egg yolk
    };
    
    const dressingContains: Record<string, boolean> = {};
    const dressingFoundIngredients: Record<string, string[]> = {};
    const dressingSubstitutions: Record<string, string[]> = {};
    
    const dressingAllergenList = dressingAllergens[dressing] || [];
    
    allergies.forEach((allergen) => {
      const contains = dressingAllergenList.includes(allergen);
      dressingContains[allergen] = contains;
      
      if (contains) {
        const dressingLabel = dressingOptions.find(d => d.value === dressing)?.label || dressing;
        dressingFoundIngredients[allergen] = [dressingLabel];
        dressingSubstitutions[allergen] = [`NO ${dressingLabel} - Choose a different dressing`];
      } else {
        dressingFoundIngredients[allergen] = [];
        dressingSubstitutions[allergen] = [];
      }
    });
    
    // Check if any allergen is present
    const hasAllergen = Object.values(dressingContains).some(v => v);
    
    return {
      contains: hasAllergen,
      status: hasAllergen ? 'unsafe' as const : 'safe' as const,
      foundIngredients: dressingFoundIngredients,
      substitutions: dressingSubstitutions
    };
  };

  const result = useMemo(() => {
    if (!selectedDish || (selectedAllergies.size === 0 && customAllergies.size === 0) || !showResults) {
      return null;
    }
    
    try {
      // Check main dish
      const mainDishResult = checkDishSafety(selectedDish, Array.from(selectedAllergies), Array.from(customAllergies));
      
      if (!mainDishResult) {
        console.error('checkDishSafety returned null or undefined');
        return null;
      }
    
    // Check crusts if selected
    const crustCheck = selectedCrusts && selectedCrusts.size > 0 ? checkCrustAllergens(selectedCrusts, Array.from(selectedAllergies)) : null;
    
    // For salads: check both default dressing and selected dressing (if different)
    // Field Salad: only check selected dressing (no default)
    // Other salads: check default dressing, and if a different one is selected, check that too
    const defaultDressingCheck = defaultDressing ? checkDressingAllergens(defaultDressing, Array.from(selectedAllergies)) : null;
    const selectedDressingCheck = selectedDressing ? checkDressingAllergens(selectedDressing, Array.from(selectedAllergies)) : null;
    
    // If a different dressing is selected than the default, we'll show both
    const hasDressingSubstitution = defaultDressing && selectedDressing && defaultDressing !== selectedDressing;
    
    // For overall status, check both default and selected if they differ
    const defaultDressingUnsafe = defaultDressingCheck?.status === 'unsafe';
    const selectedDressingUnsafe = selectedDressingCheck?.status === 'unsafe';
    const dressingUnsafe = defaultDressingUnsafe || selectedDressingUnsafe;
    
    // If there's a side dish selected, check it too
    if (selectedSideDish) {
      const sideDishResult = checkDishSafety(selectedSideDish, Array.from(selectedAllergies), Array.from(customAllergies));
      
      // Determine overall status: unsafe if dish, side dish, crust, or any dressing is unsafe
      const crustUnsafe = crustCheck?.status === 'unsafe';
      const overallStatus = mainDishResult.overallStatus === 'unsafe' || sideDishResult.overallStatus === 'unsafe' || crustUnsafe || dressingUnsafe ? 'unsafe' : 'safe' as 'safe' | 'unsafe';
      
      // Create combined result with both dish results
      return {
        ...mainDishResult,
        overallStatus,
        globalMessage: overallStatus === 'unsafe' 
          ? `This meal contains allergens. Please review the details for the entree, side dish, crust, and dressing below.`
          : `This meal is safe for your selected allergies.`,
        mainDishResult,
        sideDishResult,
        crustCheck,
        defaultDressingCheck,
        selectedDressingCheck,
        defaultDressing,
        selectedDressing,
        hasDressingSubstitution,
        selectedCrusts,
        hasSideDish: true
      };
    }
    
    // If there's a crust or dressing but no side dish
    const crustUnsafe = crustCheck?.status === 'unsafe';
    const overallStatus = mainDishResult.overallStatus === 'unsafe' || crustUnsafe || dressingUnsafe ? 'unsafe' : 'safe' as 'safe' | 'unsafe';
    
    return {
      ...mainDishResult,
      overallStatus,
      globalMessage: overallStatus === 'unsafe' 
        ? `This meal contains allergens. Please review the details for the entree, crust, and dressing below.`
        : `This meal is safe for your selected allergies.`,
      mainDishResult,
      sideDishResult: null,
      crustCheck,
      defaultDressingCheck,
      selectedDressingCheck,
      defaultDressing,
      selectedDressing,
      hasDressingSubstitution,
      selectedCrusts,
      hasSideDish: false
    };
    } catch (error) {
      console.error('Error calculating result:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
        dish: selectedDish?.dish_name,
        allergies: Array.from(selectedAllergies),
        customAllergies: Array.from(customAllergies)
      });
      return null;
    }
  }, [selectedDish, selectedSideDish, selectedCrusts, selectedProtein, selectedDressing, defaultDressing, isFieldSalad, selectedAllergies, customAllergies, showResults]);

  const getStatusText = (status: 'safe' | 'unsafe') => {
    switch (status) {
      case 'safe':
        return 'SAFE - NO CHANGES';
      case 'unsafe':
        return 'UNSAFE';
    }
  };

  // Filter safe dishes by category for browse mode
  const safeDishesByCategory = useMemo(() => {
    if (!showBrowseMode || (selectedAllergies.size === 0 && customAllergies.size === 0)) {
      return null;
    }

    const categories = {
      'Appetizers': [] as MenuItem[],
      'Entrees': [] as MenuItem[],
      'Sides': [] as MenuItem[],
      'Desserts': [] as MenuItem[],
    };

    const entreeCategories = [
      'Steaks And Chops',
      'Chicken And Barbecue',
      'Fresh Fish And Seafood',
      'Filet Mignon',
      'Roasted Prime Rib  Of Beef Au Jus',
      'Sandwiches: Prime Burgers',
      'Sandwiches: Signatures',
      'Nightly Specials',
    ];

    menuItems.forEach((dish) => {
      // Skip non-menu items
      if (dish.category === 'Glossary' || 
          dish.category === 'Items Not On The Menu (Secret Menu):' ||
          dish.category === 'Items Not On The Menu And Aq Prices' ||
          dish.category === 'Dessert Prices' ||
          dish.category === 'Non Alcoholic Beverage Prices' ||
          dish.category === 'Brunch Items Not On The Menu – 155 Only' ||
          dish.category === 'Item  Il 5/6/25 66 5/6/25  Mn 5/6/25  Va 5/6/25') {
        return;
      }

      // Check if dish is safe and requires no modifications
      const checkResult = checkDishSafety(dish, Array.from(selectedAllergies), Array.from(customAllergies));
      
      // Only include dishes that are completely safe with no modifications needed
      // This means: overallStatus is 'safe' AND no substitutions are required
      const isCompletelySafe = checkResult.overallStatus === 'safe' && 
        checkResult.perAllergy.every(item => 
          item.status === 'safe' && 
          (item.substitutions.length === 0 || item.substitutions.every(sub => !sub.includes('NOT POSSIBLE')))
        );
      
      if (isCompletelySafe) {
        if (dish.category === 'Appetizers') {
          categories['Appetizers'].push(dish);
        } else if (dish.category === 'Sides') {
          categories['Sides'].push(dish);
        } else if (dish.category === 'Desserts') {
          categories['Desserts'].push(dish);
        } else if (entreeCategories.includes(dish.category)) {
          categories['Entrees'].push(dish);
        }
      }
    });

    // Sort dishes alphabetically within each category
    Object.keys(categories).forEach((key) => {
      categories[key as keyof typeof categories].sort((a, b) => 
        a.dish_name.localeCompare(b.dish_name)
      );
    });

    return categories;
  }, [showBrowseMode, selectedAllergies, customAllergies, menuItems]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      {/* Content */}
      <div className="relative z-10">
      {(selectedAllergies.size > 0 || customAllergies.size > 0 || selectedDishId || selectedSideDishId) && (
        <div className="sticky top-0 z-50 w-full border-b bg-gray-900/80 backdrop-blur-md border-gray-700/30 shadow-lg">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(selectedAllergies.size > 0 || customAllergies.size > 0) && (
                <>
                  <span className="text-sm text-gray-700 font-medium">Selected:</span>
                  {Array.from(selectedAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-[#1e3a5f]/20 text-[#1e3a5f] border border-[#1e3a5f]/50"
                    >
                      {ALLERGEN_LABELS[allergen]}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="w-4 h-4 rounded-full hover:bg-[#1e3a5f]/30 flex items-center justify-center transition-colors text-blue-700 leading-none"
                        aria-label={`Remove ${ALLERGEN_LABELS[allergen]}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {Array.from(customAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-purple-500/20 text-purple-700 border border-purple-500/50"
                    >
                      {allergen}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="w-4 h-4 rounded-full hover:bg-purple-500/30 flex items-center justify-center transition-colors text-purple-700 leading-none"
                        aria-label={`Remove ${allergen}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </>
              )}
              {selectedDish && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50">
                  {selectedDish.dish_name}
                </span>
              )}
              {selectedSideDish && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-orange-500/20 text-orange-700 border border-orange-500/50">
                  Side: {selectedSideDish.dish_name}
                </span>
              )}
              {selectedCrusts && selectedCrusts.size > 0 && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#2d5016]/20 text-[#2d5016] border border-[#2d5016]/50">
                  Crusts: {Array.from(selectedCrusts).map(c => crustOptions.find(opt => opt.value === c)?.label).filter(Boolean).join(', ')}
                </span>
              )}
              {selectedProtein && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-500/20 text-purple-700 border border-purple-500/50">
                  Protein: {selectedProtein === 'bacon' ? 'Bacon' : 'Turkey Sausage'}
                </span>
              )}
              {selectedDressing && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-500/20 text-indigo-700 border border-indigo-500/50">
                  {defaultDressing && defaultDressing !== selectedDressing ? (
                    <>
                      Dressing: {dressingOptions.find(d => d.value === defaultDressing)?.label || defaultDressing} → {dressingOptions.find(d => d.value === selectedDressing)?.label || selectedDressing}
                    </>
                  ) : (
                    <>
                      Dressing: {dressingOptions.find(d => d.value === selectedDressing)?.label || selectedDressing}
                    </>
                  )}
                </span>
              )}
              {defaultDressing && !selectedDressing && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#1e3a5f]/20 text-[#1e3a5f] border border-[#1e3a5f]/50">
                  Dressing: {dressingOptions.find(d => d.value === defaultDressing)?.label || defaultDressing} (Default)
                </span>
              )}
            </div>
            <div className="relative">
              <GlowingEffect
                spread={30}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.3}
                borderWidth={2}
              />
              <button
                className="relative px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
                onClick={() => {
                  setSelectedDishId('');
                  setSelectedSideDishId('');
                  setSelectedCrusts(new Set());
                  setSelectedProtein('');
                  setSelectedDressing('');
                  setSelectedAllergies(new Set());
                  setCustomAllergies(new Set());
                  setAllergenSearchTerm('');
                  setSearchTerm('');
                  setSideDishSearchTerm('');
                  setShowResults(false);
                  setShowSuggestions(false);
                  setShowSideDishSuggestions(false);
                  setShowBrowseMode(false);
                }}
              >
                Reset
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

        {/* Step Indicator */}
        <div className="flex justify-center py-6">
          <div className="w-full max-w-2xl mx-auto px-6">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[
              { num: 1, label: 'Select Allergies', active: selectedAllergies.size > 0 || customAllergies.size > 0 },
              { num: 2, label: 'Choose Dish', active: !!selectedDishId },
              { num: 3, label: 'Review Results', active: showResults },
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                      step.active
                        ? 'bg-blue-500 text-white shadow-lg scale-110 shadow-blue-500/50'
                        : 'bg-gray-700 text-gray-300 border border-gray-600'
                    )}
                  >
                    {step.num}
                  </div>
                  <span
                    className={cn(
                      'text-xs md:text-sm font-medium',
                      step.active ? 'text-blue-400' : 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {step.num < 3 && (
                  <div
                    className={cn(
                      'w-8 md:w-16 h-0.5',
                      step.active ? 'bg-blue-500' : 'bg-gray-600'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="flex justify-center pb-12">
          <div className="w-full max-w-2xl mx-auto px-6">
        <Card className="mb-6 border-amber-500/50 bg-amber-900/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-200">
                <strong>Disclaimer:</strong> This is an unofficial internal helper based on our ingredient book. For severe allergies, ALWAYS confirm with the chef/manager and follow full allergy protocol.
              </p>
            </CardContent>
          </Card>

        <Card className="mb-6 bg-gray-800/60 backdrop-blur-sm border-gray-700/50 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-white text-3xl font-serif font-light tracking-wide mb-2" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.05em' }}>
              1. Select Dish
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm font-light tracking-wider uppercase" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.15em', fontWeight: 300 }}>
              Search for a dish by name, ticket code, or category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <input
                id="dish-search"
                type="text"
                placeholder="Start typing dish name, ticket code, or category..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  setHighlightedIndex(-1);
                  setShowResults(false);
                }}
                onFocus={() => {
                  if (searchTerm.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedIndex((prev) => 
                      prev < filteredDishes.length - 1 ? prev + 1 : prev
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                  } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                    e.preventDefault();
                    const selected = filteredDishes[highlightedIndex];
                    if (selected) {
                      setSelectedDishId(selected.id);
                      setSearchTerm(selected.dish_name);
                      setShowSuggestions(false);
                      setHighlightedIndex(-1);
                      // Reset dressing if not a salad, or if it's a salad but not Field Salad (will use default)
                      const isNewDishSalad = selected.category === 'Salads' || selected.dish_name.toLowerCase().includes('salad');
                      const isNewDishFieldSalad = selected.dish_name.toLowerCase().includes('field salad');
                      if (!isNewDishSalad || (isNewDishSalad && !isNewDishFieldSalad)) {
                        setSelectedDressing('');
                      }
                    }
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                className="w-full px-5 py-4 border border-gray-600/50 rounded-md bg-gray-800/80 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all font-light tracking-wide"
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: '15px', letterSpacing: '0.02em' }}
              />
              {showSuggestions && filteredDishes.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-md shadow-2xl max-h-60 overflow-y-auto">
                  {filteredDishes.map((item, index) => (
                    <div
                      key={`dish-${index}-${item.id}`}
                      className={cn(
                        "p-3 cursor-pointer transition-colors",
                        index === highlightedIndex
                          ? "bg-blue-500/20 border-l-2 border-blue-400"
                          : "hover:bg-gray-800/50"
                      )}
                      onClick={() => {
                        setSelectedDishId(item.id);
                        setSearchTerm(item.dish_name);
                        setShowBrowseMode(false); // Exit browse mode when dish is selected
                        // Reset side dish only if new dish is an Appetizer or Side
                        const excludedCategories = ['Appetizers', 'Sides'];
                        if (excludedCategories.includes(item.category)) {
                          setSelectedSideDishId('');
                        }
                        // Reset crust if new dish cannot have crust
                        if (!dishCanHaveCrust(item.dish_name)) {
                          setSelectedCrusts(new Set());
                        }
                        // Reset protein if not Classic Breakfast
                        if (!item.dish_name.toLowerCase().includes('classic breakfast')) {
                          setSelectedProtein('');
                        }
                        // Reset dressing if not a salad, or if it's a salad but not Field Salad (will use default)
                        const isNewDishSalad = item.category === 'Salads' || item.dish_name.toLowerCase().includes('salad');
                        const isNewDishFieldSalad = item.dish_name.toLowerCase().includes('field salad');
                        if (!isNewDishSalad || (isNewDishSalad && !isNewDishFieldSalad)) {
                          setSelectedDressing('');
                        }
                        setShowSuggestions(false);
                        setHighlightedIndex(-1);
                        setShowResults(false);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="font-medium text-white text-base tracking-wide" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.02em' }}>{item.dish_name}</div>
                      {item.ticket_code && (
                        <div className="text-xs text-gray-200 mt-1 uppercase tracking-wider font-light" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.15em' }}>{item.ticket_code}</div>
                      )}
                      <div className="text-xs text-gray-300 mt-1 font-light uppercase tracking-widest" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.1em' }}>{item.category}</div>
                    </div>
                  ))}
                </div>
              )}
              {showSuggestions && searchTerm.trim() && filteredDishes.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-md shadow-2xl p-3">
                  <div className="text-gray-300 italic">No dishes found matching "{searchTerm}"</div>
                </div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700/30">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest font-light text-center" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.2em' }}>
                Or select from dropdown
              </div>
              <select
                className="dropdown-select w-full px-5 py-4 border border-gray-600/50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 bg-gray-800/80 text-white font-light tracking-wide appearance-none cursor-pointer transition-all hover:border-gray-500/50"
                value={selectedDishId}
                onChange={(e) => {
                  setSelectedDishId(e.target.value);
                  setShowBrowseMode(false); // Exit browse mode when dish is selected
                  const selected = menuItems.find((item) => item.id === e.target.value);
                  if (selected) {
                    setSearchTerm(selected.dish_name);
                    // Reset side dish only if new dish is an Appetizer or Side
                    const excludedCategories = ['Appetizers', 'Sides'];
                    if (excludedCategories.includes(selected.category)) {
                      setSelectedSideDishId('');
                    }
                  } else {
                    setSelectedSideDishId('');
                  }
                  // Reset dressing if not a salad, or if it's a salad but not Field Salad (will use default)
                  if (selected) {
                    const isNewDishSalad = selected.category === 'Salads' || selected.dish_name.toLowerCase().includes('salad');
                    const isNewDishFieldSalad = selected.dish_name.toLowerCase().includes('field salad');
                    if (!isNewDishSalad || (isNewDishSalad && !isNewDishFieldSalad)) {
                      setSelectedDressing('');
                    }
                  } else {
                    setSelectedDressing('');
                  }
                  // Reset crust if dish cannot have crust
                  if (selected) {
                    if (!dishCanHaveCrust(selected.dish_name)) {
                      setSelectedCrusts(new Set());
                    }
                    // Reset protein if not Classic Breakfast
                    if (!selected.dish_name.toLowerCase().includes('classic breakfast')) {
                      setSelectedProtein('');
                    }
                  } else {
                    setSelectedCrusts(new Set());
                    setSelectedProtein('');
                  }
                  setShowResults(false);
                  setShowSuggestions(false);
                }}
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: '15px', letterSpacing: '0.02em', color: '#ffffff' }}
              >
                <option value="" className="bg-gray-800 text-gray-400">Select a dish...</option>
              {useMemo(() => {
                // Sort menu items to put "Pork Chop" items right after "Mushroom Crusted Pork Chop"
                const sortedItems = [...menuItems].sort((a, b) => {
                  const aName = a.dish_name.toLowerCase();
                  const bName = b.dish_name.toLowerCase();
                  
                  // Check if either is "Mushroom Crusted Pork Chop"
                  const aIsMushroomPork = aName.includes('mushroom') && (aName.includes('pork') || aName.includes('porkchop') || aName.includes('pork chop'));
                  const bIsMushroomPork = bName.includes('mushroom') && (bName.includes('pork') || bName.includes('porkchop') || bName.includes('pork chop'));
                  
                  // Check if either is a pork chop (but not mushroom crusted)
                  const aIsPorkChop = (aName.includes('porkchop') || aName.includes('pork chop') || (aName.includes('pork') && aName.includes('chop'))) && !aIsMushroomPork;
                  const bIsPorkChop = (bName.includes('porkchop') || bName.includes('pork chop') || (bName.includes('pork') && bName.includes('chop'))) && !bIsMushroomPork;
                  
                  // Priority 1: Mushroom Crusted Pork Chop comes first
                  if (aIsMushroomPork && !bIsMushroomPork) return -1;
                  if (!aIsMushroomPork && bIsMushroomPork) return 1;
                  
                  // Priority 2: Other pork chops come right after mushroom pork
                  if (aIsPorkChop && !bIsPorkChop && !bIsMushroomPork) {
                    // Check if b should come before mushroom pork alphabetically
                    const mushroomPorkItems = menuItems.filter(item => {
                      const name = item.dish_name.toLowerCase();
                      return name.includes('mushroom') && (name.includes('pork') || name.includes('porkchop') || name.includes('pork chop'));
                    });
                    if (mushroomPorkItems.length > 0) {
                      const mushroomPorkName = mushroomPorkItems[0].dish_name.toLowerCase();
                      // If b comes before mushroom pork alphabetically, let it
                      if (bName < mushroomPorkName) return 1;
                    }
                    return -1;
                  }
                  if (!aIsPorkChop && bIsPorkChop && !aIsMushroomPork) {
                    return 1;
                  }
                  
                  // If both are the same type, sort alphabetically
                  if ((aIsMushroomPork && bIsMushroomPork) || (aIsPorkChop && bIsPorkChop)) {
                    return a.dish_name.localeCompare(b.dish_name);
                  }
                  
                  // Default alphabetical sort
                  return a.dish_name.localeCompare(b.dish_name);
                });
                
                return sortedItems;
              }, []).map((item, index) => (
                <option key={`option-${index}-${item.id}`} value={item.id} className="bg-gray-800 text-white">
                  {item.dish_name} {item.ticket_code && `(${item.ticket_code})`}
                </option>
              ))}
                </select>
              </div>
            {selectedDish && (
              <div className="p-5 bg-gray-900/40 backdrop-blur-sm rounded-md border border-gray-700/30">
                <div className="font-medium text-white text-lg tracking-wide mb-1" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.03em' }}>{selectedDish.dish_name}</div>
                {selectedDish.ticket_code && (
                  <div className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-light" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.2em' }}>Ticket: {selectedDish.ticket_code}</div>
                )}
              </div>
            )}
            {isClassicBreakfast && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-200 mb-3 uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.15em', fontWeight: 400 }}>
                  Select Protein (Required)
                </label>
                <select
                  className="dropdown-select w-full px-5 py-4 border border-gray-600/50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 bg-gray-800/80 text-white font-light tracking-wide appearance-none cursor-pointer transition-all hover:border-gray-500/50"
                  value={selectedProtein}
                  onChange={(e) => {
                    setSelectedProtein(e.target.value);
                    setShowResults(false);
                  }}
                  style={{ fontFamily: "'Poppins', sans-serif", fontSize: '15px', letterSpacing: '0.02em', color: '#ffffff' }}
                >
                  <option value="" className="bg-gray-800 text-gray-400">Select protein...</option>
                  <option value="bacon" className="bg-gray-800 text-white">Bacon (3 slices)</option>
                  <option value="turkey_sausage" className="bg-gray-800 text-white">Turkey Sausage (2 patties)</option>
                </select>
                {selectedProtein && (
                  <div className="mt-3 p-4 bg-gray-900/40 backdrop-blur-sm rounded-md border border-gray-700/30">
                    <div className="text-sm font-medium text-white tracking-wide" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.02em' }}>
                      Selected Protein: {selectedProtein === 'bacon' ? 'Bacon (3 slices)' : 'Turkey Sausage (2 patties)'}
                    </div>
                  </div>
                )}
              </div>
            )}
            {isSalad && (
              <div className="mt-4">
                {isFieldSalad ? (
                  <>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Select Dressing (Required)
                    </label>
                    <select
                      className="dropdown-select w-full px-5 py-4 border border-gray-600/50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 bg-gray-800/80 text-white font-light tracking-wide appearance-none cursor-pointer transition-all hover:border-gray-500/50"
                      value={selectedDressing}
                      onChange={(e) => {
                        setSelectedDressing(e.target.value);
                        setShowResults(false);
                      }}
                      style={{ fontFamily: "'Poppins', sans-serif", fontSize: '15px', letterSpacing: '0.02em', color: '#ffffff' }}
                    >
                      <option value="" className="bg-gray-800 text-gray-400">Select dressing...</option>
                      {dressingOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {selectedDressing && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-sm font-medium text-white">
                          Selected Dressing: {dressingOptions.find(d => d.value === selectedDressing)?.label || selectedDressing}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {defaultDressing && (
                      <div className="mb-3 p-3 bg-[#1e3a5f]/10 rounded-lg border border-[#1e3a5f]/30">
                        <div className="text-sm font-medium text-white">
                          Default Dressing: {dressingOptions.find(d => d.value === defaultDressing)?.label || defaultDressing}
                        </div>
                        <div className="text-xs text-white mt-1">
                          This salad comes with this dressing. Results will show analysis for this dressing.
                        </div>
                      </div>
                    )}
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Change Dressing (Optional)
                    </label>
                    <select
                      className="dropdown-select w-full px-5 py-4 border border-gray-600/50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 bg-gray-800/80 text-white font-light tracking-wide appearance-none cursor-pointer transition-all hover:border-gray-500/50"
                      value={selectedDressing}
                      onChange={(e) => {
                        setSelectedDressing(e.target.value);
                        setShowResults(false);
                      }}
                      style={{ fontFamily: "'Poppins', sans-serif", fontSize: '15px', letterSpacing: '0.02em', color: '#ffffff' }}
                    >
                      <option value="" className="bg-gray-800 text-gray-400">Keep default dressing</option>
                      {dressingOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {selectedDressing && (
                      <div className="mt-3 p-4 bg-amber-900/30 backdrop-blur-sm rounded-md border border-amber-500/30">
                        <div className="text-sm font-medium text-amber-200 tracking-wide" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.02em' }}>
                          Substitution Dressing: {dressingOptions.find(d => d.value === selectedDressing)?.label || selectedDressing}
                        </div>
                        <div className="text-xs text-amber-300/80 mt-2 font-light">
                          Results will show analysis for both the default dressing and this substitution.
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {canHaveSideDish && (
              <div className="mt-4">
                <label className="block text-base font-semibold text-white mb-3 uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.15em', fontWeight: 600 }}>
                  Select Side Dish (Optional)
                </label>
                
                {/* Search Input for Side Dish */}
                <div className="relative mb-3">
                  <input
                    id="side-dish-search"
                    type="text"
                    placeholder="Type to search side dishes by name or ticket code..."
                    value={sideDishSearchTerm}
                    onChange={(e) => {
                      setSideDishSearchTerm(e.target.value);
                      setShowSideDishSuggestions(true);
                      setHighlightedSideDishIndex(-1);
                      setShowResults(false);
                    }}
                    onFocus={() => {
                      if (sideDishSearchTerm.trim()) {
                        setShowSideDishSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSideDishSuggestions(false), 200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setHighlightedSideDishIndex((prev) => 
                          prev < filteredSideDishes.length - 1 ? prev + 1 : prev
                        );
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setHighlightedSideDishIndex((prev) => (prev > 0 ? prev - 1 : -1));
                      } else if (e.key === 'Enter' && highlightedSideDishIndex >= 0) {
                        e.preventDefault();
                        const selected = filteredSideDishes[highlightedSideDishIndex];
                        if (selected) {
                          setSelectedSideDishId(selected.id);
                          setSideDishSearchTerm(selected.dish_name);
                          setShowSideDishSuggestions(false);
                          setHighlightedSideDishIndex(-1);
                          setShowResults(false);
                        }
                      } else if (e.key === 'Escape') {
                        setShowSideDishSuggestions(false);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg bg-gray-800/80 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', letterSpacing: '0.02em' }}
                  />
                  {showSideDishSuggestions && filteredSideDishes.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-md shadow-2xl max-h-60 overflow-y-auto">
                      {filteredSideDishes.map((item, index) => (
                        <div
                          key={`side-dish-${index}-${item.id}`}
                          className={cn(
                            "p-3 cursor-pointer transition-colors",
                            index === highlightedSideDishIndex
                              ? "bg-blue-500/20 border-l-2 border-blue-400"
                              : "hover:bg-gray-800/50"
                          )}
                          onClick={() => {
                            setSelectedSideDishId(item.id);
                            setSideDishSearchTerm(item.dish_name);
                            setShowSideDishSuggestions(false);
                            setHighlightedSideDishIndex(-1);
                            setShowResults(false);
                          }}
                          onMouseEnter={() => setHighlightedSideDishIndex(index)}
                        >
                          <div className="font-medium text-white">{item.dish_name}</div>
                          {item.ticket_code && (
                            <div className="text-sm text-gray-200 mt-0.5">Ticket: {item.ticket_code}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropdown for Side Dish */}
                <div className="mt-6 pt-6 border-t border-gray-700/30">
                  <div className="text-sm text-gray-300 mb-3 uppercase tracking-widest font-medium text-center" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.2em' }}>
                    Or select from dropdown
                  </div>
                  <select
                    className="dropdown-select w-full px-5 py-4 border border-gray-600/50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 bg-gray-800/80 text-white font-medium tracking-wide appearance-none cursor-pointer transition-all hover:border-gray-500/50"
                    value={selectedSideDishId}
                    onChange={(e) => {
                      setSelectedSideDishId(e.target.value);
                      if (e.target.value) {
                        const selected = sideDishes.find(side => side.id === e.target.value);
                        if (selected) {
                          setSideDishSearchTerm(selected.dish_name);
                        }
                      } else {
                        setSideDishSearchTerm('');
                      }
                      setShowResults(false);
                    }}
                    style={{ fontFamily: "'Poppins', sans-serif", fontSize: '15px', letterSpacing: '0.02em', color: '#ffffff' }}
                  >
                    <option value="" className="bg-gray-800 text-gray-400">No side dish</option>
                  {sideDishes.map((side, index) => (
                    <option key={`side-${index}-${side.id}`} value={side.id} className="bg-gray-800 text-white">
                      {side.dish_name} {side.ticket_code && `(${side.ticket_code})`}
                    </option>
                  ))}
                  </select>
                </div>
                
                {selectedSideDish && (
                  <div className="mt-3 p-4 bg-gray-900/40 backdrop-blur-sm rounded-md border border-gray-700/30">
                    <div className="text-sm font-medium text-white tracking-wide mb-1" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.02em' }}>Selected Side: {selectedSideDish.dish_name}</div>
                    {selectedSideDish.ticket_code && (
                      <div className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-light" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.15em' }}>Ticket: {selectedSideDish.ticket_code}</div>
                    )}
                  </div>
                )}
              </div>
            )}
            {canHaveCrust && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-200 mb-3 uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.15em', fontWeight: 400 }}>
                  Select Crusts (Optional - up to 4)
                </label>
                <div className="space-y-2">
                  {crustOptions.map((crust) => {
                    const isSelected = selectedCrusts?.has(crust.value) || false;
                    const isDisabled = !isSelected && (selectedCrusts?.size || 0) >= 4;
                    return (
                      <label
                        key={crust.value}
                        className={cn(
                          "flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all",
                          isSelected
                            ? "bg-blue-50 border-[#1e3a5f]"
                            : isDisabled
                            ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-50"
                            : "bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={(e) => {
                            const newCrusts = new Set(selectedCrusts);
                            if (e.target.checked) {
                              newCrusts.add(crust.value);
                            } else {
                              newCrusts.delete(crust.value);
                            }
                            setSelectedCrusts(newCrusts);
                            setShowResults(false);
                          }}
                          className="w-5 h-5 text-[#1e3a5f] border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900">{crust.label}</span>
                      </label>
                    );
                  })}
                </div>
                {selectedCrusts && selectedCrusts.size > 0 && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-white">
                      Selected Crusts: {Array.from(selectedCrusts).map(c => crustOptions.find(opt => opt.value === c)?.label).filter(Boolean).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6 bg-gray-800/60 backdrop-blur-sm border-gray-700/50 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-white text-3xl font-serif font-light tracking-wide mb-2" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.05em' }}>
              2. Select Allergies (one or more)
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm font-light tracking-wider uppercase" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.15em', fontWeight: 300 }}>
              Search for common allergens
              {selectedAllergies.size > 0 || customAllergies.size > 0 ? (
                <span className="block mt-2 text-blue-400 font-normal normal-case" style={{ letterSpacing: '0.05em' }}>
                  💡 Tip: Press Enter (with no dish selected) to browse all safe dishes for your allergies
                </span>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
                <input
                id="allergen-search"
                  type="text"
                placeholder="Start typing allergen name (e.g., 'dairy', 'gluten')..."
                value={allergenSearchTerm}
                onChange={(e) => handleAllergenInputChange(e.target.value)}
                onFocus={() => {
                  if (allergenSearchTerm.trim()) {
                    setShowAllergenSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowAllergenSuggestions(false), 200);
                }}
                onKeyDown={handleAllergenInputKeyDown}
                className="w-full px-5 py-4 border border-gray-600/50 rounded-md bg-gray-800/80 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all font-light tracking-wide"
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: '15px', letterSpacing: '0.02em' }}
              />
              {showAllergenSuggestions && filteredAllergens.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-md shadow-2xl max-h-60 overflow-y-auto">
                  {filteredAllergens
                    .filter((allergen) => !selectedAllergies.has(allergen))
                    .map((allergen) => {
                      const displayIndex = filteredAllergens
                        .filter((a) => !selectedAllergies.has(a))
                        .findIndex((a) => a === allergen);
                      return (
                        <div
                  key={allergen}
                  className={cn(
                            "p-3 cursor-pointer transition-colors",
                            displayIndex === highlightedAllergenIndex
                              ? "bg-blue-500/20 border-l-2 border-blue-400"
                              : "hover:bg-gray-800/50"
                          )}
                          onClick={() => {
                            handleAllergySelect(allergen);
                          }}
                          onMouseEnter={() => setHighlightedAllergenIndex(displayIndex)}
                        >
                          <div className="font-medium text-white">{ALLERGEN_LABELS[allergen]}</div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
            
            {/* Custom Ingredient Selection - Search all ingredients */}
            <div className="mt-6 pt-6 border-t border-gray-700/30">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest font-light" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.2em' }}>
                Select Specific Ingredient (from entire menu)
              </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Start typing ingredient name (e.g., 'black pepper', 'onions')..."
                    value={ingredientSearchTerm}
                    onChange={(e) => handleIngredientInputChange(e.target.value)}
                    onFocus={() => {
                      if (ingredientSearchTerm.trim()) {
                        setShowIngredientSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowIngredientSuggestions(false), 200);
                    }}
                    onKeyDown={handleIngredientInputKeyDown}
                    className="w-full px-5 py-4 border border-gray-600/50 rounded-md bg-gray-800/80 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all font-light tracking-wide"
                    style={{ fontFamily: "'Poppins', sans-serif", fontSize: '15px', letterSpacing: '0.02em' }}
                  />
                  {showIngredientSuggestions && filteredIngredients.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-md shadow-2xl max-h-60 overflow-y-auto">
                      {filteredIngredients.map((ingredient, _index) => {
                        const displayIndex = filteredIngredients.findIndex((ing) => ing === ingredient);
                        return (
                          <div
                            key={ingredient}
                            className={cn(
                              "p-3 cursor-pointer transition-colors",
                              displayIndex === highlightedIngredientIndex
                                ? "bg-purple-500/20 border-l-2 border-purple-400"
                                : "hover:bg-gray-800/50"
                            )}
                            onClick={() => handleIngredientSelect(ingredient)}
                            onMouseEnter={() => setHighlightedIngredientIndex(displayIndex)}
                          >
                            <div className="font-medium text-white">{ingredient}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {showIngredientSuggestions && ingredientSearchTerm.trim() && filteredIngredients.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-md shadow-2xl p-3">
                      <div className="text-gray-300 italic">
                        No ingredients found matching "{ingredientSearchTerm}". Please select from the suggestions above.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700/30">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest font-light text-center" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.2em' }}>
                Or select from dropdown
              </div>
              <select
                className="dropdown-select w-full px-5 py-4 border border-gray-600/50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 bg-gray-800/80 text-white font-light tracking-wide appearance-none cursor-pointer transition-all hover:border-gray-500/50"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    const allergen = e.target.value as Allergen;
                    handleAllergySelect(allergen);
                    e.target.value = '';
                  }
                }}
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: '15px', letterSpacing: '0.02em', color: '#ffffff' }}
              >
                <option value="" className="bg-gray-800 text-gray-400">Select an allergen...</option>
              {ALL_ALLERGENS.filter((a) => !selectedAllergies.has(a)).map((allergen) => (
                <option key={allergen} value={allergen} className="bg-gray-800 text-white">
                    {ALLERGEN_LABELS[allergen]}
                </option>
              ))}
              </select>
            </div>
            
            {/* Selected Allergies Display */}
            {(selectedAllergies.size > 0 || customAllergies.size > 0) && (
              <div className="pt-6 border-t border-gray-700/30">
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest font-light" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.2em' }}>
                  Selected Allergies
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-200 rounded-md text-sm font-light tracking-wide border border-blue-400/30"
                      style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.02em' }}
                    >
                      {ALLERGEN_LABELS[allergen]}
                  <button
                    type="button"
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="w-5 h-5 rounded-full hover:bg-blue-400/30 flex items-center justify-center transition-colors text-blue-200 hover:text-white"
                        aria-label={`Remove ${ALLERGEN_LABELS[allergen]}`}
                      >
                        ×
                  </button>
                    </span>
                  ))}
                  {Array.from(customAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-200 rounded-md text-sm font-light tracking-wide border border-purple-400/30"
                      style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.02em' }}
                    >
                      {allergen}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="w-5 h-5 rounded-full hover:bg-purple-400/30 flex items-center justify-center transition-colors text-purple-200 hover:text-white"
                        aria-label={`Remove ${allergen}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                </div>
              )}
            {(selectedAllergies.size > 0 || customAllergies.size > 0) && !selectedDishId && (
              <div className="mt-6 pt-6 border-t border-gray-700/30">
                <button
                  onClick={() => {
                    setShowBrowseMode(true);
                    setShowResults(false);
                    setAllergenSearchTerm('');
                    setShowAllergenSuggestions(false);
                  }}
                  className="w-full px-5 py-4 bg-blue-500 hover:bg-blue-600 text-white font-light tracking-wide rounded-md transition-all shadow-lg hover:shadow-xl"
                  style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.05em' }}
                >
                  Browse All Safe Dishes (or press Enter)
                </button>
            </div>
            )}
          </CardContent>
        </Card>

        <div className="relative">
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={!selectedDish || (selectedAllergies.size === 0 && customAllergies.size === 0) || (isClassicBreakfast && !selectedProtein) || (isFieldSalad && !selectedDressing)}
            proximity={80}
            inactiveZone={0.2}
            borderWidth={3}
          />
          <button
            onClick={handleCheckSafety}
            disabled={!selectedDish || (selectedAllergies.size === 0 && customAllergies.size === 0) || (isClassicBreakfast && !selectedProtein) || (isFieldSalad && !selectedDressing)}
            className={cn(
              "relative w-full py-4 px-6 text-lg font-semibold rounded-lg transition-all border-2",
              !selectedDish || (selectedAllergies.size === 0 && customAllergies.size === 0) || (isClassicBreakfast && !selectedProtein) || (isFieldSalad && !selectedDressing)
                ? "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-400"
                : "bg-[#1e3a5f] text-white hover:bg-[#2d3748] shadow-lg hover:shadow-xl transform hover:scale-[1.02] border-[#1e3a5f]"
            )}
          >
            Check Safety
          </button>
        </div>

        {/* Browse Safe Dishes Mode - Show below Check Safety button */}
        {showBrowseMode && safeDishesByCategory && !selectedDishId && (
          <div className="mt-8">
            <Card className="bg-gray-800/60 backdrop-blur-sm border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Safe Dishes for Your Allergies (No Modifications Needed)</CardTitle>
                <CardDescription className="text-gray-600">
                  These dishes are completely safe for your selected allergies and require no modifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(safeDishesByCategory).map(([category, dishes]) => {
                  if (dishes.length === 0) return null;
                  return (
                    <div key={category} className="space-y-3">
                      <h3 className="text-xl font-bold text-white border-b-2 border-gray-500 pb-2">
                        {category} ({dishes.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dishes.map((dish) => (
                          <div
                            key={dish.id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#1e3a5f] hover:shadow-md transition-all cursor-pointer"
                            onClick={() => {
                              setSelectedDishId(dish.id);
                              setSearchTerm(dish.dish_name);
                              setShowBrowseMode(false);
                              setShowResults(false);
                            }}
                          >
                            <div className="font-semibold text-gray-900">{dish.dish_name}</div>
                            {dish.ticket_code && (
                              <div className="text-sm text-gray-600 mt-1">Ticket: {dish.ticket_code}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {Object.values(safeDishesByCategory).every(cat => cat.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg font-medium">No safe dishes found for the selected allergies.</p>
                    <p className="text-sm mt-2">Please try selecting different allergies or check with the chef for modifications.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {showResults && (
          <div className="mt-8 space-y-6">
            {!result ? (
              <Card className="bg-red-50 border-red-500 border-2">
                <CardContent className="pt-6">
                  <p className="text-red-700 text-center font-bold mb-2">Error: Could not calculate results.</p>
                  <p className="text-red-600 text-sm text-center">Please check the browser console (F12) for error details and share them.</p>
                  <p className="text-red-500 text-xs text-center mt-2">Dish: {selectedDish?.dish_name || 'Unknown'}</p>
                  <p className="text-red-500 text-xs text-center">Allergies: {Array.from(selectedAllergies).join(', ') || 'None'}</p>
                  <p className="text-red-500 text-xs text-center">Custom: {Array.from(customAllergies).join(', ') || 'None'}</p>
                </CardContent>
              </Card>
            ) : (
            <>
            <Card
              className={cn(
                "backdrop-blur-sm shadow-2xl",
                result.overallStatus === 'safe'
                  ? "border-4 border-[#2d5016] bg-gradient-to-br from-[#2d5016]/20 to-[#2d5016]/10"
                  : "border-4 border-red-600 bg-gradient-to-br from-red-950/90 to-red-900/80 animate-pulse"
              )}
            >
              <CardContent className={cn(
                "pt-8 pb-8 px-6",
                result.overallStatus === 'unsafe' && "bg-red-950/30"
              )}>
                <div className="text-center">
                  <h2
                    className={cn(
                      "mb-4 font-black tracking-wider",
                      result.overallStatus === 'safe' 
                        ? "text-4xl text-[#2d5016]" 
                        : "text-5xl text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] font-extrabold"
                    )}
                    style={result.overallStatus === 'unsafe' ? {
                      textShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.5)'
                    } : {}}
                  >
                    {getStatusText(result.overallStatus)}
                  </h2>
                  <p
                    className={cn(
                      "font-bold leading-relaxed",
                      result.overallStatus === 'safe' 
                        ? "text-xl text-[#2d5016]" 
                        : "text-2xl text-red-200 font-semibold"
                    )}
                  >
                    {result.globalMessage}
                  </p>
                  <p className={cn(
                    "mt-6 italic",
                    result.overallStatus === 'safe' 
                      ? "text-gray-500 text-xs" 
                      : "text-red-300/70 text-sm"
                  )}>
                    Source: Official Training Materials | Data Current as of: {DATA_TIMESTAMP}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-gray-300/50">
              <CardHeader>
                <CardTitle className="text-gray-900">{result.mainDishResult?.dish?.dish_name || result.dish?.dish_name || 'Unknown Dish'}</CardTitle>
                {(result.mainDishResult?.dish?.ticket_code || result.dish?.ticket_code) && (
                  <CardDescription className="text-gray-600">Ticket Code: {result.mainDishResult?.dish?.ticket_code || result.dish?.ticket_code}</CardDescription>
                )}
                {selectedSideDish && (
                  <CardDescription className="text-gray-600 mt-1">
                    Side Dish: {selectedSideDish.dish_name} {selectedSideDish.ticket_code && `(${selectedSideDish.ticket_code})`}
                  </CardDescription>
                )}
                {selectedCrusts && selectedCrusts.size > 0 && (
                  <CardDescription className="text-gray-600 mt-1">
                    Crusts: {Array.from(selectedCrusts).map(c => crustOptions.find(opt => opt.value === c)?.label).filter(Boolean).join(', ')}
                  </CardDescription>
                )}
                {selectedProtein && (
                  <CardDescription className="text-gray-600 mt-1">
                    Protein: {selectedProtein === 'bacon' ? 'Bacon (3 slices)' : 'Turkey Sausage (2 patties)'}
                  </CardDescription>
                )}
                {result.defaultDressing && (
                  <CardDescription className="text-gray-600 mt-1">
                    Default Dressing: {dressingOptions.find(d => d.value === result.defaultDressing)?.label || result.defaultDressing}
                  </CardDescription>
                )}
                {result.selectedDressing && (
                  <CardDescription className="text-gray-600 mt-1">
                    {result.hasDressingSubstitution ? (
                      <>
                        Substitution Dressing: {dressingOptions.find(d => d.value === result.selectedDressing)?.label || result.selectedDressing}
                      </>
                    ) : (
                      <>
                        Dressing: {dressingOptions.find(d => d.value === result.selectedDressing)?.label || result.selectedDressing}
                      </>
                    )}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Entree Results */}
                  <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Entree: {result.mainDishResult.dish.dish_name}</h3>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase",
                        result.mainDishResult.overallStatus === 'safe'
                          ? "bg-[#2d5016]/20 text-[#2d5016] border border-[#2d5016]/50"
                          : "bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50"
                      )}
                    >
                      {result.mainDishResult.overallStatus === 'safe' ? 'SAFE' : 'UNSAFE'}
                    </span>
                  </div>

                  {result.mainDishResult.perAllergy.length > 0 && (
                    <div className="space-y-3">
                      {result.mainDishResult.perAllergy.map((item, idx) => {
                      const isCustomAllergen = typeof item.allergen === 'string' && !(item.allergen in ALLERGEN_LABELS);
                      const allergenLabel = isCustomAllergen
                        ? item.allergen
                        : ALLERGEN_LABELS[item.allergen as Allergen] || item.allergen;
                      
                      return (
                        <Card
                            key={`entree-allergy-${idx}-${item.allergen}`}
                          className={cn(
                              "border-l-4 bg-white border-gray-200",
                            item.status === 'safe' ? "border-l-green-500" : "border-l-red-500"
                          )}
                        >
                            <CardContent className="pt-4 pb-4">
                              <div className="flex items-center justify-between mb-2">
                                <strong className="text-base text-gray-900">{allergenLabel}</strong>
                                <span
                                  className={cn(
                                    "px-2 py-1 rounded-full text-xs font-bold uppercase",
                                    item.status === 'safe'
                                      ? "bg-[#2d5016]/20 text-[#2d5016] border border-[#2d5016]/50"
                                      : "bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50"
                                  )}
                                >
                                  {item.status === 'safe' ? 'SAFE' : 'UNSAFE'}
                                </span>
                              </div>
                              {item.foundIngredients && item.foundIngredients.length > 0 && (
                                <div className="mb-3 pt-3 border-t border-gray-200">
                                  <strong className="block text-xs font-semibold text-gray-700 mb-1">
                                    Found ingredients:
                                  </strong>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {item.foundIngredients.map((ingredient, ingIdx) => (
                                      <li key={ingIdx} className="text-xs text-[#991b1b]">
                                        <em>{ingredient}</em>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {item.status === 'unsafe' && item.substitutions.length > 0 && (
                                <div className="pt-3 border-t border-gray-200">
                                  <strong className="block text-xs font-semibold text-gray-700 mb-1">
                                    Substitutions:
                                  </strong>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {item.substitutions.map((sub, subIdx) => (
                                      <li key={subIdx} className="text-xs text-gray-600">{sub}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Side Dish Results */}
                {result.sideDishResult && (
                  <div className="space-y-4 pt-6 border-t-2 border-gray-300">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Side Dish: {result.sideDishResult.dish.dish_name}</h3>
                              <span
                                className={cn(
                                  "px-3 py-1 rounded-full text-xs font-bold uppercase",
                          result.sideDishResult.overallStatus === 'safe'
                            ? "bg-[#2d5016]/20 text-[#2d5016] border border-[#2d5016]/50"
                            : "bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50"
                        )}
                      >
                        {result.sideDishResult.overallStatus === 'safe' ? 'SAFE' : 'UNSAFE'}
                      </span>
                    </div>

                    {result.sideDishResult.perAllergy.length > 0 && (
                      <div className="space-y-3">
                        {result.sideDishResult.perAllergy.map((item, idx) => {
                          const isCustomAllergen = typeof item.allergen === 'string' && !(item.allergen in ALLERGEN_LABELS);
                          const allergenLabel = isCustomAllergen
                            ? item.allergen
                            : ALLERGEN_LABELS[item.allergen as Allergen] || item.allergen;
                          
                          return (
                            <Card
                              key={`side-allergy-${idx}-${item.allergen}`}
                              className={cn(
                                "border-l-4 bg-white border-gray-200",
                                item.status === 'safe' ? "border-l-green-500" : "border-l-red-500"
                              )}
                            >
                              <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <strong className="text-base text-gray-900">{allergenLabel}</strong>
                                  <span
                                    className={cn(
                                      "px-2 py-1 rounded-full text-xs font-bold uppercase",
                                  item.status === 'safe'
                                        ? "bg-[#2d5016]/20 text-[#2d5016] border border-[#2d5016]/50"
                                        : "bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50"
                                )}
                              >
                                {item.status === 'safe' ? 'SAFE' : 'UNSAFE'}
                              </span>
                            </div>
                            {item.foundIngredients && item.foundIngredients.length > 0 && (
                                  <div className="mb-3 pt-3 border-t border-gray-200">
                                    <strong className="block text-xs font-semibold text-gray-700 mb-1">
                                      Found ingredients:
                                </strong>
                                    <ul className="list-disc list-inside space-y-0.5">
                                  {item.foundIngredients.map((ingredient, ingIdx) => (
                                        <li key={ingIdx} className="text-xs text-[#991b1b]">
                                      <em>{ingredient}</em>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.status === 'unsafe' && item.substitutions.length > 0 && (
                                  <div className="pt-3 border-t border-gray-200">
                                    <strong className="block text-xs font-semibold text-gray-700 mb-1">
                                      Substitutions:
                                </strong>
                                    <ul className="list-disc list-inside space-y-0.5">
                                  {item.substitutions.map((sub, subIdx) => (
                                        <li key={subIdx} className="text-xs text-gray-600">{sub}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                      </div>
                    )}
                  </div>
                )}

                {/* Crust Results */}
                {result.selectedCrusts && result.selectedCrusts.size > 0 && result.crustCheck && (
                  <div className="space-y-4 pt-6 border-t-2 border-gray-300">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        Crusts: {Array.from(result.selectedCrusts).map(c => crustOptions.find(opt => opt.value === c)?.label).filter(Boolean).join(', ')}
                      </h3>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold uppercase",
                          result.crustCheck.status === 'safe'
                            ? "bg-[#2d5016]/20 text-[#2d5016] border border-[#2d5016]/50"
                            : "bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50"
                        )}
                      >
                        {result.crustCheck.status === 'safe' ? 'SAFE' : 'UNSAFE'}
                      </span>
                    </div>

                    {Array.from(selectedAllergies).map((allergen) => {
                      if (!result.crustCheck) return null;
                      const contains = result.crustCheck.foundIngredients[allergen]?.length > 0 || false;
                      const status = contains ? 'unsafe' : 'safe';
                      const allergenLabel = ALLERGEN_LABELS[allergen] || allergen;
                      
                      return (
                        <Card
                          key={`crust-allergy-${allergen}`}
                          className={cn(
                            "border-l-4 bg-white border-gray-200",
                            status === 'safe' ? "border-l-green-500" : "border-l-red-500"
                          )}
                        >
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-base text-gray-900">{allergenLabel}</strong>
                              <span
                                className={cn(
                                  "px-2 py-1 rounded-full text-xs font-bold uppercase",
                                  status === 'safe'
                                    ? "bg-[#2d5016]/20 text-[#2d5016] border border-[#2d5016]/50"
                                    : "bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50"
                                )}
                              >
                                {status === 'safe' ? 'SAFE' : 'UNSAFE'}
                              </span>
                            </div>
                            {result.crustCheck?.foundIngredients[allergen] && result.crustCheck.foundIngredients[allergen].length > 0 && (
                              <div className="mb-3 pt-3 border-t border-gray-200">
                                <strong className="block text-xs font-semibold text-gray-700 mb-1">
                                  Found ingredients:
                                </strong>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {result.crustCheck.foundIngredients[allergen].map((ingredient, ingIdx) => (
                                    <li key={ingIdx} className="text-xs text-[#991b1b]">
                                      <em>{ingredient}</em>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {status === 'unsafe' && result.crustCheck?.substitutions[allergen] && result.crustCheck.substitutions[allergen].length > 0 && (
                              <div className="pt-3 border-t border-gray-200">
                                <strong className="block text-xs font-semibold text-gray-700 mb-1">
                                  Substitutions:
                                </strong>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {result.crustCheck.substitutions[allergen].map((sub, subIdx) => (
                                    <li key={subIdx} className="text-xs text-gray-600">{sub}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Dressing Check Results - Default Dressing */}
                {result.defaultDressingCheck && result.defaultDressing && (
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        Default Dressing: {dressingOptions.find(d => d.value === result.defaultDressing)?.label || result.defaultDressing}
                      </h3>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold uppercase",
                          result.defaultDressingCheck.status === 'safe'
                            ? "bg-[#2d5016]/20 text-[#2d5016] border border-[#2d5016]/50"
                            : "bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50"
                        )}
                      >
                        {result.defaultDressingCheck.status === 'safe' ? 'SAFE' : 'UNSAFE'}
                      </span>
                    </div>

                    {Array.from(selectedAllergies).map((allergen) => {
                      if (!result.defaultDressingCheck) return null;
                      const contains = result.defaultDressingCheck.foundIngredients[allergen]?.length > 0 || false;
                      const status = contains ? 'unsafe' : 'safe';
                      const allergenLabel = ALLERGEN_LABELS[allergen] || allergen;
                      
                      return (
                        <Card
                          key={`default-dressing-allergy-${allergen}`}
                          className={cn(
                            "border-l-4 bg-white border-gray-200",
                            status === 'safe' ? "border-l-green-500" : "border-l-red-500"
                          )}
                        >
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-base text-gray-900">{allergenLabel}</strong>
                              <span
                                className={cn(
                                  "px-2 py-1 rounded-full text-xs font-bold uppercase",
                                  status === 'safe'
                                    ? "bg-[#2d5016]/20 text-[#2d5016] border border-[#2d5016]/50"
                                    : "bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50"
                                )}
                              >
                                {status === 'safe' ? 'SAFE' : 'UNSAFE'}
                              </span>
                            </div>
                            {result.defaultDressingCheck?.foundIngredients[allergen] && result.defaultDressingCheck.foundIngredients[allergen].length > 0 && (
                              <div className="mb-3 pt-3 border-t border-gray-200">
                                <strong className="block text-xs font-semibold text-gray-700 mb-1">
                                  Found ingredients:
                                </strong>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {result.defaultDressingCheck.foundIngredients[allergen].map((ingredient, ingIdx) => (
                                    <li key={ingIdx} className="text-xs text-[#991b1b]">
                                      <em>{ingredient}</em>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {status === 'unsafe' && result.defaultDressingCheck?.substitutions[allergen] && result.defaultDressingCheck.substitutions[allergen].length > 0 && (
                              <div className="pt-3 border-t border-gray-200">
                                <strong className="block text-xs font-semibold text-gray-700 mb-1">
                                  Substitutions:
                                </strong>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {result.defaultDressingCheck.substitutions[allergen].map((sub, subIdx) => (
                                    <li key={subIdx} className="text-xs text-gray-600">{sub}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Dressing Check Results - Selected/Substitution Dressing */}
                {result.selectedDressingCheck && result.selectedDressing && (
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {result.hasDressingSubstitution ? 'Substitution ' : ''}Dressing: {dressingOptions.find(d => d.value === result.selectedDressing)?.label || result.selectedDressing}
                      </h3>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold uppercase",
                          result.selectedDressingCheck.status === 'safe'
                            ? "bg-[#2d5016]/20 text-[#2d5016] border border-[#2d5016]/50"
                            : "bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50"
                        )}
                      >
                        {result.selectedDressingCheck.status === 'safe' ? 'SAFE' : 'UNSAFE'}
                      </span>
                    </div>

                    {Array.from(selectedAllergies).map((allergen) => {
                      if (!result.selectedDressingCheck) return null;
                      const contains = result.selectedDressingCheck.foundIngredients[allergen]?.length > 0 || false;
                      const status = contains ? 'unsafe' : 'safe';
                      const allergenLabel = ALLERGEN_LABELS[allergen] || allergen;
                      
                      return (
                        <Card
                          key={`selected-dressing-allergy-${allergen}`}
                          className={cn(
                            "border-l-4 bg-white border-gray-200",
                            status === 'safe' ? "border-l-green-500" : "border-l-red-500"
                          )}
                        >
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-base text-gray-900">{allergenLabel}</strong>
                              <span
                                className={cn(
                                  "px-2 py-1 rounded-full text-xs font-bold uppercase",
                                  status === 'safe'
                                    ? "bg-[#2d5016]/20 text-[#2d5016] border border-[#2d5016]/50"
                                    : "bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50"
                                )}
                              >
                                {status === 'safe' ? 'SAFE' : 'UNSAFE'}
                              </span>
                            </div>
                            {result.selectedDressingCheck?.foundIngredients[allergen] && result.selectedDressingCheck.foundIngredients[allergen].length > 0 && (
                              <div className="mb-3 pt-3 border-t border-gray-200">
                                <strong className="block text-xs font-semibold text-gray-700 mb-1">
                                  Found ingredients:
                                </strong>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {result.selectedDressingCheck.foundIngredients[allergen].map((ingredient, ingIdx) => (
                                    <li key={ingIdx} className="text-xs text-[#991b1b]">
                                      <em>{ingredient}</em>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {status === 'unsafe' && result.selectedDressingCheck?.substitutions[allergen] && result.selectedDressingCheck.substitutions[allergen].length > 0 && (
                              <div className="pt-3 border-t border-gray-200">
                                <strong className="block text-xs font-semibold text-gray-700 mb-1">
                                  Substitutions:
                                </strong>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {result.selectedDressingCheck.substitutions[allergen].map((sub, subIdx) => (
                                    <li key={subIdx} className="text-xs text-gray-600">{sub}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Quick Reference Section - Simplified and Easy to Read */}
                <Card className="border-[#1e3a5f]/50 bg-white mt-6">
                  <CardHeader>
                    <CardTitle className="text-[#1e3a5f] text-xl font-bold">Quick Reference</CardTitle>
                    <CardDescription className="text-gray-600">
                      Summary of all dishes and required modifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Entree */}
                      <div className="border-b border-gray-200 pb-4">
                        <h4 className="font-bold text-gray-900 text-lg mb-3">
                          Entree: {result.mainDishResult.dish.dish_name}
                        </h4>
                        {result.mainDishResult.overallStatus === 'safe' ? (
                          <p className="text-[#2d5016] font-medium">✓ No changes needed</p>
                        ) : (
                          <div className="space-y-4">
                            {result.mainDishResult.perAllergy
                              .filter(item => item.status === 'unsafe')
                              .map((item, idx) => {
                                const isCustomAllergen = typeof item.allergen === 'string' && !(item.allergen in ALLERGEN_LABELS);
                                const allergenLabel = isCustomAllergen
                                  ? item.allergen
                                  : ALLERGEN_LABELS[item.allergen as Allergen] || item.allergen;
                                
                                // Separate substitutable vs not modifiable
                                const notModifiable = item.substitutions.filter(sub => 
                                  sub.includes('NOT POSSIBLE') || sub.includes('not possible')
                                );
                                const substitutable = item.substitutions.filter(sub => 
                                  !sub.includes('NOT POSSIBLE') && !sub.includes('not possible')
                                );
                                
                                // Separate "NO" items from alternatives (like "Gluten Free croutons")
                                const noItems = substitutable.filter(sub => sub.startsWith('NO '));
                                const alternatives = substitutable.filter(sub => !sub.startsWith('NO '));
                                
                                return (
                                  <div key={`entree-${idx}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="mb-3">
                                      <span className="px-2 py-1 rounded-full text-xs font-bold uppercase bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50">
                                        UNSAFE
                                      </span>
                                    </div>
                                    
                                    <h5 className="font-bold text-gray-900 mb-3">
                                      Allergen: {allergenLabel}
                                    </h5>
                                    
                                    {/* Show found ingredients if available */}
                                    {item.foundIngredients && item.foundIngredients.length > 0 && (
                                      <div className="mb-3">
                                        <strong className="block text-xs font-semibold text-gray-700 mb-1">
                                          Found ingredients:
                                        </strong>
                                        <ul className="list-disc list-inside space-y-0.5">
                                          {item.foundIngredients.map((ing, ingIdx) => (
                                            <li key={ingIdx} className="text-xs text-red-600 italic">
                                              {ing}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                      {/* Show NOT MODIFIABLE items */}
                                      {notModifiable.length > 0 && (
                                        <div className="mb-3 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                                          <p className="text-red-700 font-semibold text-sm mb-1">
                                            NOT MODIFIABLE ({allergenLabel}):
                                          </p>
                                          <ul className="list-disc list-inside space-y-1 ml-2">
                                            {notModifiable.map((sub, subIdx) => {
                                              // Remove "NOT POSSIBLE - " prefix
                                              let message = sub.replace(/^NOT POSSIBLE - /i, '').replace(/^not possible - /i, '');
                                              return (
                                                <li key={subIdx} className="text-red-600 text-xs">
                                                  {message}
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        </div>
                                      )}
                                    
                                    {/* Show SUBSTITUTABLE items */}
                                    {substitutable.length > 0 && (
                                      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                                        <p className="text-green-700 font-semibold text-sm mb-1">
                                          SUBSTITUTABLE:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                          {noItems.map((sub, subIdx) => (
                                            <li key={subIdx} className="text-green-800 text-xs">
                                              {sub}
                                            </li>
                                          ))}
                                          {alternatives.map((alt, altIdx) => (
                                            <li key={`alt-${altIdx}`} className="text-green-800 text-xs ml-4">
                                              {alt}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {/* If no substitutions at all (shouldn't happen, but handle it) */}
                                    {notModifiable.length === 0 && substitutable.length === 0 && (
                                      <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                                        <p className="text-red-700 text-sm">
                                          This dish contains {allergenLabel.toLowerCase()} and cannot be modified.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>

                      {/* Side Dish */}
                      {result.sideDishResult && (
                        <div className="border-b border-gray-200 pb-4">
                          <h4 className="font-bold text-gray-900 text-lg mb-3">
                            Side Dish: {result.sideDishResult.dish.dish_name}
                          </h4>
                          {result.sideDishResult.overallStatus === 'safe' ? (
                            <p className="text-[#2d5016] font-medium">✓ No changes needed</p>
                          ) : (
                            <div className="space-y-4">
                              {result.sideDishResult.perAllergy
                                .filter(item => item.status === 'unsafe')
                                .map((item, idx) => {
                                  const isCustomAllergen = typeof item.allergen === 'string' && !(item.allergen in ALLERGEN_LABELS);
                                  const allergenLabel = isCustomAllergen
                                    ? item.allergen
                                    : ALLERGEN_LABELS[item.allergen as Allergen] || item.allergen;
                                  
                                  // Separate substitutable vs not modifiable
                                  const notModifiable = item.substitutions.filter(sub => 
                                    sub.includes('NOT POSSIBLE') || sub.includes('not possible')
                                  );
                                  const substitutable = item.substitutions.filter(sub => 
                                    !sub.includes('NOT POSSIBLE') && !sub.includes('not possible')
                                  );
                                  
                                  // Separate "NO" items from alternatives (like "Gluten Free croutons")
                                  const noItems = substitutable.filter(sub => sub.startsWith('NO '));
                                  const alternatives = substitutable.filter(sub => !sub.startsWith('NO '));
                                  
                                  return (
                                    <div key={`side-${idx}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                      <div className="mb-3">
                                        <span className="px-2 py-1 rounded-full text-xs font-bold uppercase bg-[#991b1b]/20 text-[#991b1b] border border-[#991b1b]/50">
                                          UNSAFE
                                        </span>
                                      </div>
                                      
                                      <h5 className="font-bold text-gray-900 mb-3">
                                        Allergen: {allergenLabel}
                                      </h5>
                                      
                                      {/* Show found ingredients if available */}
                                      {item.foundIngredients && item.foundIngredients.length > 0 && (
                                        <div className="mb-3">
                                          <strong className="block text-xs font-semibold text-gray-700 mb-1">
                                            Found ingredients:
                                          </strong>
                                          <ul className="list-disc list-inside space-y-0.5">
                                            {item.foundIngredients.map((ing, ingIdx) => (
                                              <li key={ingIdx} className="text-xs text-red-600 italic">
                                                {ing}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {/* Show NOT MODIFIABLE items */}
                                      {notModifiable.length > 0 && (
                                        <div className="mb-3 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                                          <p className="text-red-700 font-semibold text-sm mb-1">
                                            NOT MODIFIABLE ({allergenLabel}):
                                          </p>
                                          <ul className="list-disc list-inside space-y-1 ml-2">
                                            {notModifiable.map((sub, subIdx) => {
                                              // Remove "NOT POSSIBLE - " prefix
                                              let message = sub.replace(/^NOT POSSIBLE - /i, '').replace(/^not possible - /i, '');
                                              return (
                                                <li key={subIdx} className="text-red-600 text-xs">
                                                  {message}
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {/* Show SUBSTITUTABLE items */}
                                      {substitutable.length > 0 && (
                                        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                                          <p className="text-green-700 font-semibold text-sm mb-1">
                                            SUBSTITUTABLE:
                                          </p>
                                          <ul className="list-disc list-inside space-y-1 ml-2">
                                            {noItems.map((sub, subIdx) => (
                                              <li key={subIdx} className="text-green-800 text-xs">
                                                {sub}
                                              </li>
                                            ))}
                                            {alternatives.map((alt, altIdx) => (
                                              <li key={`alt-${altIdx}`} className="text-green-800 text-xs ml-4">
                                                {alt}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {/* If no substitutions at all */}
                                      {notModifiable.length === 0 && substitutable.length === 0 && (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                                          <p className="text-red-700 text-sm">
                                            This dish contains {allergenLabel.toLowerCase()} and cannot be modified.
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Crusts */}
                      {result.crustCheck && result.selectedCrusts && result.selectedCrusts.size > 0 && (
                        <div className="border-b border-gray-200 pb-4">
                          <h4 className="font-bold text-gray-900 text-lg mb-3">
                            Crusts: {Array.from(result.selectedCrusts).map(c => crustOptions.find(opt => opt.value === c)?.label).filter(Boolean).join(', ')}
                          </h4>
                          {result.crustCheck.status === 'safe' ? (
                            <p className="text-[#2d5016] font-medium">✓ No changes needed</p>
                          ) : (
                            <div className="space-y-2">
                              {Array.from(selectedAllergies)
                                .filter(allergen => result.crustCheck && result.crustCheck.substitutions[allergen]?.length > 0)
                                .map((allergen) => {
                                  if (!result.crustCheck) return null;
                                  const allergenLabel = ALLERGEN_LABELS[allergen] || allergen;
                                  const subs = result.crustCheck.substitutions[allergen] || [];
                                  return (
                                    <div key={`crust-${allergen}`} className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                                      <p className="text-amber-900 font-semibold mb-1">
                                        Crusts - {allergenLabel}:
                                      </p>
                                      <ul className="list-disc list-inside space-y-1 ml-2">
                                        {subs.map((sub, idx) => (
                                          <li key={idx} className="text-amber-800 text-sm">
                                            {sub.replace(/^NO /, '')}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Dressings */}
                      {(result.defaultDressingCheck || result.selectedDressingCheck) && (
                        <div>
                          {result.defaultDressingCheck && result.defaultDressing && (
                            <div className="mb-4">
                              <h4 className="font-bold text-gray-900 text-lg mb-3">
                                Default Dressing: {dressingOptions.find(d => d.value === result.defaultDressing)?.label || result.defaultDressing}
                              </h4>
                              {Array.from(selectedAllergies)
                                .filter(allergen => result.defaultDressingCheck && result.defaultDressingCheck.substitutions[allergen]?.length > 0)
                                .length === 0 ? (
                                <p className="text-[#2d5016] font-medium">✓ No changes needed</p>
                              ) : (
                                <div className="space-y-2">
                                  {Array.from(selectedAllergies)
                                    .filter(allergen => result.defaultDressingCheck && result.defaultDressingCheck.substitutions[allergen]?.length > 0)
                                    .map((allergen) => {
                                      if (!result.defaultDressingCheck) return null;
                                      const allergenLabel = ALLERGEN_LABELS[allergen] || allergen;
                                      const subs = result.defaultDressingCheck.substitutions[allergen] || [];
                                      return (
                                        <div key={`default-dressing-${allergen}`} className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                                          <p className="text-amber-900 font-semibold mb-1">
                                            Default Dressing - {allergenLabel}:
                                          </p>
                                          <ul className="list-disc list-inside space-y-1 ml-2">
                                            {subs.map((sub, idx) => (
                                              <li key={idx} className="text-amber-800 text-sm">
                                                {sub.replace(/^NO /, '')}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          )}
                          {result.selectedDressingCheck && result.selectedDressing && (
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg mb-3">
                                {result.hasDressingSubstitution ? 'Substitution ' : ''}Dressing: {dressingOptions.find(d => d.value === result.selectedDressing)?.label || result.selectedDressing}
                              </h4>
                              {Array.from(selectedAllergies)
                                .filter(allergen => result.selectedDressingCheck && result.selectedDressingCheck.substitutions[allergen]?.length > 0)
                                .length === 0 ? (
                                <p className="text-[#2d5016] font-medium">✓ No changes needed</p>
                              ) : (
                                <div className="space-y-2">
                                  {Array.from(selectedAllergies)
                                    .filter(allergen => result.selectedDressingCheck && result.selectedDressingCheck.substitutions[allergen]?.length > 0)
                                    .map((allergen) => {
                                      if (!result.selectedDressingCheck) return null;
                                      const allergenLabel = ALLERGEN_LABELS[allergen] || allergen;
                                      const subs = result.selectedDressingCheck.substitutions[allergen] || [];
                                      return (
                                        <div key={`selected-dressing-${allergen}`} className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                                          <p className="text-amber-900 font-semibold mb-1">
                                            {result.hasDressingSubstitution ? 'Substitution ' : ''}Dressing - {allergenLabel}:
                                          </p>
                                          <ul className="list-disc list-inside space-y-1 ml-2">
                                            {subs.map((sub, idx) => (
                                              <li key={idx} className="text-amber-800 text-sm">
                                                {sub.replace(/^NO /, '')}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {result.mainDishResult?.dish?.notes && result.mainDishResult.dish.notes.trim() !== '' && (
                  <Card className="border-[#1e3a5f]/50 bg-[#1e3a5f]/10 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <strong className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                        Additional Notes:
                      </strong>
                      <p className="text-[#1e3a5f]">{result.mainDishResult.dish.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
            </>
            )}
          </div>
        )}

        {/* Footer with Data Timestamp */}
        <footer className="mt-12 pt-8 border-t border-gray-700/30 text-center text-sm text-gray-400">
          <p>Source: Official Training Materials | Data Current as of: {DATA_TIMESTAMP}</p>
        </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

