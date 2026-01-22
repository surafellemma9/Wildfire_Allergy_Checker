import { AnimatedBackground } from '@/components/ui/animated-background';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';
import { Info, Search, ShieldCheck, ChevronLeft, Grid3x3 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import type { Allergen, MenuItem } from '../types';
import { checkDishSafety } from '../utils/allergy-checker';
import { useOnlineStatus } from '../utils/use-online-status';

// POS Categories for tablet view
const POS_CATEGORIES = [
  { id: 'nightly', label: 'Nightly Specials', icon: '🌙', color: 'from-indigo-600 to-purple-700' },
  { id: 'seasonal', label: 'Specials', icon: '⭐', color: 'from-yellow-500 to-orange-600' },
  { id: 'appetizers', label: 'Appetizers', icon: '🍤', color: 'from-amber-600 to-orange-700' },
  { id: 'salads', label: 'Salads', icon: '🥗', color: 'from-green-600 to-emerald-700' },
  { id: 'seafood', label: 'Fresh Seafood', icon: '🐟', color: 'from-cyan-600 to-blue-700' },
  { id: 'burgers', label: 'Burgers & Sandwiches', icon: '🍔', color: 'from-red-600 to-rose-700' },
  { id: 'steaks', label: 'Steaks & Chops', icon: '🥩', color: 'from-red-800 to-red-900' },
  { id: 'chicken', label: 'Chicken & BBQ', icon: '🍗', color: 'from-orange-600 to-amber-700' },
  { id: 'brunch', label: 'Brunch', icon: '🍳', color: 'from-yellow-500 to-amber-600' },
  { id: 'desserts', label: 'Desserts', icon: '🍰', color: 'from-pink-600 to-rose-700' },
  { id: 'sides', label: 'Sides', icon: '🥔', color: 'from-slate-600 to-slate-700' },
  { id: 'kids', label: "Kid's Menu", icon: '👶', color: 'from-purple-600 to-indigo-700' },
] as const;

// Map menu categories to POS categories
function getPosCategory(menuCategory: string): string {
  const cat = menuCategory.toLowerCase();
  // Nightly Specials - daily rotating specials
  if (cat.includes('nightly special')) return 'nightly';
  // Seasonal/Party Specials - happy hour, party items, vegan plate, etc.
  if (cat.includes('special party') || cat.includes('happy hour') || cat.includes('vegan')) return 'seasonal';
  if (cat.includes('appetizer')) return 'appetizers';
  if (cat.includes('salad')) return 'salads';
  if (cat.includes('fish') || cat.includes('seafood')) return 'seafood';
  if (cat.includes('burger') || cat.includes('sandwich') || cat.includes('signature')) return 'burgers';
  if (cat.includes('steak') || cat.includes('chop') || cat.includes('filet') || cat.includes('prime rib')) return 'steaks';
  if (cat.includes('chicken') || cat.includes('bbq') || cat.includes('barbecue') || cat.includes('bone bowl')) return 'chicken';
  if (cat.includes('brunch') || cat.includes('breakfast')) return 'brunch';
  if (cat.includes('dessert')) return 'desserts';
  if (cat.includes('side')) return 'sides';
  if (cat.includes('kid')) return 'kids';
  return 'appetizers'; // Default fallback
}

// Check if a category is an "entree" that should flip to sides
function isEntreeCategory(posCategory: string): boolean {
  return ['nightly', 'seasonal', 'seafood', 'burgers', 'steaks', 'chicken', 'brunch'].includes(posCategory);
}

// Lazy load menu items to reduce initial bundle size
type MenuItemsModule = typeof import('../data/menu-items');
let menuItemsModuleCache: MenuItemsModule | null = null;
let menuItemsPromise: Promise<MenuItemsModule> | null = null;

// Import modifications cache for Supabase integration
import { loadAllModifications, hasDbModifications } from '../utils/modifications-cache';

async function loadMenuItems(): Promise<MenuItemsModule> {
  if (menuItemsModuleCache) {
    return menuItemsModuleCache;
  }
  if (menuItemsPromise) {
    return menuItemsPromise;
  }
  
  const startTime = performance.now();
  
  // Load menu items and modifications in parallel
  menuItemsPromise = Promise.all([
    import('../data/menu-items'),
    loadAllModifications(), // Load modifications from Supabase if configured
  ]).then(([module]) => {
    menuItemsModuleCache = module;
    const loadTime = performance.now() - startTime;
    console.log(`[Performance] Menu items loaded in ${loadTime.toFixed(2)}ms`);
    console.log(`[Performance] Using ${hasDbModifications() ? 'Supabase' : 'static'} modifications`);
    return module;
  });
  
  return menuItemsPromise;
}

// Data timestamp
const DATA_TIMESTAMP = 'January 5, 2025';
const DISCLAIMER_STORAGE_KEY = 'wildfire_disclaimer_accepted';
const DISCLAIMER_TEXT =
  'This tool is an internal helper based on our ingredient book. It may not capture all cross-contact or kitchen changes.';
const ALWAYS_VERIFY_TEXT =
  'Always verify with restaurant staff. Cross-contact may occur.';
const APP_TITLE = 'Allergy Safety Checker';

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

const ALLERGEN_ICONS: Record<Allergen, string> = {
  dairy: '🥛',
  egg: '🥚',
  gluten: '🌾',
  shellfish: '🦐',
  fish: '🐟',
  soy: '🫘',
  peanuts: '🥜',
  tree_nuts: '🌰',
  sesame: '🫓',
  msg: '🧂',
  onion_garlic: '🧅',
  tomato: '🍅',
  seed: '🌱',
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
  const [menuDataInfo, setMenuDataInfo] = useState({ version: '', generatedAt: '' });
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isOnline = useOnlineStatus();
  
  // POS mode state (for tablets)
  const [selectedPosCategory, setSelectedPosCategory] = useState<string | null>(null);
  const [showPosSidesPanel, setShowPosSidesPanel] = useState(false);
  // Detect tablet/desktop mode (768px+ width) - initialize with actual value
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768;
  });
  
  // Listen for resize events
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkWidth = () => {
      setIsTablet(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Load menu items asynchronously
  useEffect(() => {
    const startTime = performance.now();
    loadMenuItems()
      .then((module) => {
        setMenuItems(module.menuItems);
        setMenuDataInfo({
          version: module.MENU_DATA_VERSION || '',
          generatedAt: module.MENU_DATA_GENERATED_AT || '',
        });
        const loadTime = performance.now() - startTime;
        console.log(`[Performance] Menu items loaded and rendered in ${loadTime.toFixed(2)}ms`);
      })
      .catch((error) => {
        console.error('[Error] Failed to load menu items:', error);
      });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(DISCLAIMER_STORAGE_KEY);
    const accepted = stored === 'true';
    setIsDisclaimerOpen(!accepted);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const updateKeyboardOffset = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;
      const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty('--keyboard-offset', `${offset}px`);
    };

    updateKeyboardOffset();
    window.visualViewport.addEventListener('resize', updateKeyboardOffset);
    window.visualViewport.addEventListener('scroll', updateKeyboardOffset);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateKeyboardOffset);
      window.visualViewport?.removeEventListener('scroll', updateKeyboardOffset);
    };
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

  // Group menu items by POS category for tablet view
  const dishesByPosCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    POS_CATEGORIES.forEach(cat => {
      grouped[cat.id] = [];
    });
    
    menuItems.forEach(item => {
      const posCategory = getPosCategory(item.category);
      if (grouped[posCategory]) {
        grouped[posCategory].push(item);
      }
    });
    
    // Custom sort for nightly specials (Monday to Sunday order)
    const dayOrder: Record<string, number> = {
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
      'sunday': 7
    };
    
    const getDayOrder = (dishName: string): number => {
      const nameLower = dishName.toLowerCase();
      for (const [day, order] of Object.entries(dayOrder)) {
        if (nameLower.includes(day)) return order;
      }
      return 99; // Default to end if no day found
    };
    
    // Sort nightly specials by day order
    if (grouped['nightly']) {
      grouped['nightly'].sort((a, b) => getDayOrder(a.dish_name) - getDayOrder(b.dish_name));
    }
    
    // Sort other categories alphabetically
    Object.keys(grouped).forEach(key => {
      if (key !== 'nightly') {
        grouped[key].sort((a, b) => a.dish_name.localeCompare(b.dish_name));
      }
    });
    
    return grouped;
  }, [menuItems]);

  // Get sides dishes for the flip panel
  const sidesDishes = useMemo(() => {
    return menuItems.filter(item => getPosCategory(item.category) === 'sides');
  }, [menuItems]);

  // Sorted menu items for dropdown (keeps Pork Chop items grouped)
  const sortedMenuItems = useMemo(() => {
    return [...menuItems].sort((a, b) => {
      const aName = a.dish_name.toLowerCase();
      const bName = b.dish_name.toLowerCase();
      
      const aIsMushroomPork = aName.includes('mushroom') && (aName.includes('pork') || aName.includes('porkchop') || aName.includes('pork chop'));
      const bIsMushroomPork = bName.includes('mushroom') && (bName.includes('pork') || bName.includes('porkchop') || bName.includes('pork chop'));
      
      const aIsPorkChop = (aName.includes('porkchop') || aName.includes('pork chop') || (aName.includes('pork') && aName.includes('chop'))) && !aIsMushroomPork;
      const bIsPorkChop = (bName.includes('porkchop') || bName.includes('pork chop') || (bName.includes('pork') && bName.includes('chop'))) && !bIsMushroomPork;
      
      if (aIsMushroomPork && !bIsMushroomPork) return -1;
      if (!aIsMushroomPork && bIsMushroomPork) return 1;
      
      if (aIsPorkChop && !bIsPorkChop && !bIsMushroomPork) {
        const mushroomPorkItems = menuItems.filter(item => {
          const name = item.dish_name.toLowerCase();
          return name.includes('mushroom') && (name.includes('pork') || name.includes('porkchop') || name.includes('pork chop'));
        });
        if (mushroomPorkItems.length > 0) {
          const mushroomPorkName = mushroomPorkItems[0].dish_name.toLowerCase();
          if (bName < mushroomPorkName) return 1;
        }
        return -1;
      }
      if (!aIsPorkChop && bIsPorkChop && !aIsMushroomPork) return 1;
      
      if ((aIsMushroomPork && bIsMushroomPork) || (aIsPorkChop && bIsPorkChop)) {
        return a.dish_name.localeCompare(b.dish_name);
      }
      
      return a.dish_name.localeCompare(b.dish_name);
    });
  }, [menuItems]);

  // Handle POS dish selection
  const handlePosDishSelect = (dish: MenuItem) => {
    setSelectedDishId(dish.id);
    setSearchTerm(dish.dish_name);
    setShowBrowseMode(false);
    setShowResults(false);
    
    // Reset options
    if (!dishCanHaveCrust(dish.dish_name)) {
      setSelectedCrusts(new Set());
    }
    if (!dish.dish_name.toLowerCase().includes('classic breakfast')) {
      setSelectedProtein('');
    }
    const isDishSalad = dish.category.toLowerCase().includes('salad');
    const isFieldSaladDish = dish.dish_name.toLowerCase().includes('field salad');
    if (!isDishSalad || (isDishSalad && !isFieldSaladDish)) {
      setSelectedDressing('');
    }
    
    // If it's an entree category, flip to sides panel
    const posCategory = getPosCategory(dish.category);
    if (isEntreeCategory(posCategory)) {
      setShowPosSidesPanel(true);
    }
  };

  // Handle POS side dish selection
  const handlePosSideSelect = (side: MenuItem) => {
    setSelectedSideDishId(side.id);
    setSideDishSearchTerm(side.dish_name);
    setShowPosSidesPanel(false);
    setSelectedPosCategory(null);
  };

  // Go back from sides panel to categories
  const handlePosBackToCategories = () => {
    setShowPosSidesPanel(false);
    setSelectedPosCategory(null);
  };

  const handleAllergyToggle = (allergen: Allergen) => {
    const newSet = new Set(selectedAllergies);
    if (newSet.has(allergen)) {
      newSet.delete(allergen);
    } else {
      newSet.add(allergen);
    }
    setSelectedAllergies(newSet);
      setShowResults(false);
  };

  const handleAllergenInputChange = (value: string) => {
    setAllergenSearchTerm(value);
    setShowResults(false);
  };

  const handleAllergenInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if ((selectedAllergies.size > 0 || customAllergies.size > 0) && !selectedDishId) {
        // If allergens are selected but no dish, trigger browse mode
        setShowBrowseMode(true);
        setShowResults(false);
        setAllergenSearchTerm('');
      }
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
          : `Potentially safe for your selected allergies.`,
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
        : `Potentially safe for your selected allergies.`,
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
        return 'Potentially safe';
      case 'unsafe':
        return 'Potentially unsafe';
    }
  };

  const getDisplayGlobalMessage = (status: 'safe' | 'unsafe', message: string) => {
    if (status === 'safe') {
      return 'Potentially safe for your selected allergies.';
    }
    return message;
  };

  const menuGeneratedAtLabel = menuDataInfo.generatedAt
    ? new Date(menuDataInfo.generatedAt).toLocaleString()
    : 'Unknown';

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

  const handleDisclaimerContinue = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    setIsDisclaimerOpen(false);
    setDisclaimerChecked(false);
  };

  const handleDisclaimerReset = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(DISCLAIMER_STORAGE_KEY);
    setIsDisclaimerOpen(true);
    setDisclaimerChecked(false);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <AnimatedBackground />

      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 safe-area-top">
          <div className="bg-amber-400 text-amber-950 text-xs font-semibold px-4 py-2 text-center shadow-md">
            Offline mode: using on-device menu data.
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className={cn('relative z-10 safe-area-top', !isOnline && 'pt-10')}
        aria-hidden={isDisclaimerOpen}
      >
        <div className="w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="flex justify-center">
            <div className="w-full max-w-5xl mx-auto px-6 md:px-10 py-4 md:py-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-blue-300" />
                </div>
                <div className="text-white text-lg md:text-xl font-semibold tracking-wide">{APP_TITLE}</div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="min-h-[44px] min-w-[44px] rounded-full border border-slate-700/60 bg-slate-900/70 text-slate-200 hover:bg-slate-800/90 flex items-center justify-center transition-colors"
                aria-label="About and settings"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      {/* PHONE: Sticky top bar for selections */}
      {!isTablet && (selectedAllergies.size > 0 || customAllergies.size > 0 || selectedDishId || selectedSideDishId) && (
        <div className={cn(
          "sticky top-0 z-50 w-full border-b bg-slate-900/90 backdrop-blur-md border-slate-800 shadow-lg",
          !isOnline && "top-10"
        )}>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(selectedAllergies.size > 0 || customAllergies.size > 0) && (
                <>
                  <span className="text-sm text-slate-400 font-medium">Selected:</span>
                  {Array.from(selectedAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-blue-600/20 text-blue-200 border border-blue-500/50"
                    >
                      {ALLERGEN_LABELS[allergen]}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="w-4 h-4 rounded-full hover:bg-blue-500/30 flex items-center justify-center transition-colors text-blue-200 leading-none"
                        aria-label={`Remove ${ALLERGEN_LABELS[allergen]}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {Array.from(customAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-slate-700/60 text-slate-200 border border-slate-600/60"
                    >
                      {allergen}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="w-4 h-4 rounded-full hover:bg-slate-500/40 flex items-center justify-center transition-colors text-slate-200 leading-none"
                        aria-label={`Remove ${allergen}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </>
              )}
              {selectedDish && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-slate-800 text-slate-200 border border-slate-600">
                  {selectedDish.dish_name}
                </span>
              )}
              {selectedSideDish && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-slate-800 text-slate-200 border border-slate-600">
                  Side: {selectedSideDish.dish_name}
                </span>
              )}
            </div>
            <button
              className="px-4 py-2 min-h-[44px] text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
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
                setSelectedPosCategory(null);
                setShowPosSidesPanel(false);
              }}
            >
              Reset
            </button>
          </div>
          </div>
        </div>
      )}

      {/* TABLET: Fixed right sidebar for selections */}
      {isTablet && (selectedAllergies.size > 0 || customAllergies.size > 0 || selectedDishId || selectedSideDishId) && (
        <div className="fixed right-0 top-0 bottom-0 w-72 lg:w-80 z-40 bg-slate-900/95 backdrop-blur-md border-l border-slate-800 shadow-2xl flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-white font-semibold text-lg">Current Order</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Selected Allergies */}
            {(selectedAllergies.size > 0 || customAllergies.size > 0) && (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Allergies</div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg bg-blue-600/20 text-blue-200 border border-blue-500/50"
                    >
                      {ALLERGEN_ICONS[allergen]} {ALLERGEN_LABELS[allergen]}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="w-4 h-4 rounded-full hover:bg-blue-500/30 flex items-center justify-center transition-colors text-blue-200 leading-none ml-1"
                        aria-label={`Remove ${ALLERGEN_LABELS[allergen]}`}
                      >
                        ×
                      </button>
                </span>
                  ))}
                  {Array.from(customAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg bg-slate-700/60 text-slate-200 border border-slate-600/60"
                    >
                      {allergen}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="w-4 h-4 rounded-full hover:bg-slate-500/40 flex items-center justify-center transition-colors text-slate-200 leading-none ml-1"
                        aria-label={`Remove ${allergen}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Dish */}
            {selectedDish && (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Entree</div>
                <div className="p-3 bg-slate-800/70 rounded-lg border border-slate-700">
                  <div className="text-white font-medium">{selectedDish.dish_name}</div>
                  {selectedDish.ticket_code && (
                    <div className="text-slate-400 text-xs mt-1 uppercase">{selectedDish.ticket_code}</div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Side */}
            {selectedSideDish && (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Side</div>
                <div className="p-3 bg-slate-800/70 rounded-lg border border-slate-700">
                  <div className="text-white font-medium">{selectedSideDish.dish_name}</div>
                  {selectedSideDish.ticket_code && (
                    <div className="text-slate-400 text-xs mt-1 uppercase">{selectedSideDish.ticket_code}</div>
                  )}
                </div>
              </div>
            )}

            {/* Crusts */}
            {selectedCrusts && selectedCrusts.size > 0 && (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Crusts</div>
                <div className="p-3 bg-slate-800/70 rounded-lg border border-slate-700">
                  <div className="text-white text-sm">
                    {Array.from(selectedCrusts).map(c => crustOptions.find(opt => opt.value === c)?.label).filter(Boolean).join(', ')}
                  </div>
                </div>
              </div>
            )}

            {/* Protein */}
              {selectedProtein && (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Protein</div>
                <div className="p-3 bg-slate-800/70 rounded-lg border border-slate-700">
                  <div className="text-white text-sm">{selectedProtein === 'bacon' ? 'Bacon' : 'Turkey Sausage'}</div>
                </div>
              </div>
            )}

            {/* Dressing */}
            {(selectedDressing || defaultDressing) && (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Dressing</div>
                <div className="p-3 bg-slate-800/70 rounded-lg border border-slate-700">
                  <div className="text-white text-sm">
                    {selectedDressing ? (
                      defaultDressing && defaultDressing !== selectedDressing ? (
                        <>{dressingOptions.find(d => d.value === defaultDressing)?.label} → {dressingOptions.find(d => d.value === selectedDressing)?.label}</>
                      ) : (
                        dressingOptions.find(d => d.value === selectedDressing)?.label
                      )
                    ) : (
                      <>{dressingOptions.find(d => d.value === defaultDressing)?.label} (Default)</>
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>

          {/* Actions */}
          <div className="p-4 border-t border-slate-800 space-y-3">
            {selectedDish && (selectedAllergies.size > 0 || customAllergies.size > 0) && !showResults && (
              <button
                onClick={handleCheckSafety}
                disabled={(isClassicBreakfast && !selectedProtein) || (isFieldSalad && !selectedDressing)}
                className={cn(
                  "w-full py-3 px-4 text-base font-semibold rounded-lg transition-all",
                  (isClassicBreakfast && !selectedProtein) || (isFieldSalad && !selectedDressing)
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-500"
                )}
              >
                Check Safety
              </button>
            )}
            <button
              className="w-full py-3 px-4 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
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
                setSelectedPosCategory(null);
                setShowPosSidesPanel(false);
                }}
              >
              Reset All
              </button>
          </div>
        </div>
      )}

        {/* Step Indicator */}
        <div className="flex justify-center py-6 md:py-8">
          <div className="w-full max-w-5xl mx-auto px-6 md:px-10">
            <div className="relative flex items-start justify-between max-w-xl mx-auto">
              <div className="absolute left-0 right-0 top-5 md:top-6 h-px bg-slate-700" />
            {[
              { num: 1, label: 'Select Allergies', active: selectedAllergies.size > 0 || customAllergies.size > 0 },
              { num: 2, label: 'Choose Dish', active: !!selectedDishId },
              { num: 3, label: 'Review Results', active: showResults },
            ].map((step) => (
                <div key={step.num} className="relative flex flex-col items-center gap-2 md:gap-3">
                  <div
                    className={cn(
                      'h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-sm md:text-base font-semibold ring-2 ring-transparent transition-all',
                      step.active
                        ? 'bg-blue-600 text-white ring-blue-400/60 shadow-lg'
                        : 'bg-slate-800 text-slate-400 ring-slate-700'
                    )}
                  >
                    {step.num}
                  </div>
                  <span
                    className={cn(
                      'text-xs md:text-sm font-medium',
                      step.active ? 'text-blue-300' : 'text-slate-500'
                    )}
                  >
                    {step.label}
                  </span>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className={cn(
          "flex justify-center pb-24 md:pb-12 transition-all duration-300",
          isTablet && (selectedAllergies.size > 0 || customAllergies.size > 0 || selectedDishId || selectedSideDishId) && "pr-72 lg:pr-80"
        )}>
          <div className="w-full max-w-5xl mx-auto px-6 md:px-10">
        <Card className="mb-6 md:mb-8 border border-amber-500/60 bg-amber-900/25 backdrop-blur-sm">
          <CardContent className="pt-6 md:pt-8">
            <div className="flex items-start gap-4 md:gap-5">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 text-lg md:text-xl font-bold shrink-0">
                !
              </div>
              <div className="space-y-2 md:space-y-3">
                <p className="text-sm md:text-base font-semibold text-amber-200">Important Safety Notice</p>
                <p className="text-sm md:text-base text-amber-100">{DISCLAIMER_TEXT}</p>
                <p className="text-xs md:text-sm text-amber-100">{ALWAYS_VERIFY_TEXT}</p>
              </div>
            </div>
            </CardContent>
          </Card>

        {/* PHONE VIEW: Search-based dish selection */}
        {!isTablet && (
        <Card className="mb-6 md:mb-8 bg-slate-900/80 backdrop-blur-sm border-slate-800/80 shadow-xl">
          <CardHeader className="pb-6 md:pb-8">
            <CardTitle className="text-white text-2xl md:text-3xl font-semibold tracking-wide">
              Step 2: Choose Dish
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm md:text-base">
              Search for a dish by name, ticket code, or category.
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
                className="w-full px-5 md:px-6 py-4 md:py-5 border border-slate-700 rounded-lg bg-slate-800 text-white text-base md:text-lg placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition-all"
              />
              {showSuggestions && filteredDishes.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/70 rounded-lg shadow-2xl max-h-72 md:max-h-80 overflow-y-auto">
                  {filteredDishes.map((item, index) => (
                    <div
                      key={`dish-${index}-${item.id}`}
                      className={cn(
                        "p-3 md:p-4 cursor-pointer transition-colors",
                        index === highlightedIndex
                          ? "bg-blue-500/20 border-l-2 border-blue-400"
                          : "hover:bg-slate-800/50"
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
                      <div className="font-medium text-white text-base md:text-lg tracking-wide">{item.dish_name}</div>
                      {item.ticket_code && (
                        <div className="text-xs md:text-sm text-slate-300 mt-1 uppercase tracking-wider">{item.ticket_code}</div>
                      )}
                      <div className="text-xs md:text-sm text-slate-400 mt-1 uppercase tracking-widest">{item.category}</div>
                    </div>
                  ))}
                </div>
              )}
              {showSuggestions && searchTerm.trim() && filteredDishes.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/70 rounded-md shadow-2xl p-3">
                  <div className="text-slate-300 italic">No dishes found matching "{searchTerm}"</div>
                </div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700/30">
              <div className="text-xs text-slate-400 mb-3 uppercase tracking-widest text-center">
                Or select from dropdown
              </div>
              <select
                className="dropdown-select w-full px-5 md:px-6 py-4 md:py-5 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 bg-slate-800 text-white text-base md:text-lg appearance-none cursor-pointer transition-all hover:border-slate-600"
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
              >
                <option value="" className="bg-slate-800 text-slate-400">Select a dish...</option>
                {sortedMenuItems.map((item, index) => (
                  <option key={`option-${index}-${item.id}`} value={item.id} className="bg-slate-800 text-white">
                  {item.dish_name} {item.ticket_code && `(${item.ticket_code})`}
                </option>
              ))}
                </select>
              </div>
            {selectedDish && (
              <div className="p-5 bg-slate-900/40 backdrop-blur-sm rounded-md border border-slate-700/40">
                <div className="font-medium text-white text-lg tracking-wide mb-1">{selectedDish.dish_name}</div>
                {selectedDish.ticket_code && (
                  <div className="text-xs text-slate-400 mt-2 uppercase tracking-widest">Ticket: {selectedDish.ticket_code}</div>
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
        )}

        {/* TABLET VIEW: POS-style category grid */}
        {isTablet && (
          <Card className="mb-6 md:mb-8 bg-slate-900/80 backdrop-blur-sm border-slate-800/80 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-2xl md:text-3xl font-semibold tracking-wide flex items-center gap-3">
                    <Grid3x3 className="h-7 w-7 text-blue-400" />
                    Step 2: Choose Dish
            </CardTitle>
                  <CardDescription className="text-slate-400 text-sm md:text-base mt-1">
                    {showPosSidesPanel 
                      ? 'Select a side dish for your entree'
                      : selectedPosCategory 
                        ? `Select a dish from ${POS_CATEGORIES.find(c => c.id === selectedPosCategory)?.label}`
                        : 'Tap a category to see dishes'}
                  </CardDescription>
                </div>
                {(selectedPosCategory || showPosSidesPanel) && (
                  <button
                    onClick={handlePosBackToCategories}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Back
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Category Grid */}
              {!selectedPosCategory && !showPosSidesPanel && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                  {POS_CATEGORIES.map((category) => {
                    const dishCount = dishesByPosCategory[category.id]?.length || 0;
                    if (dishCount === 0) return null;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedPosCategory(category.id)}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-4 md:p-6 rounded-xl border-2 transition-all min-h-[120px] md:min-h-[140px]",
                          "bg-gradient-to-br border-slate-700/50 hover:border-slate-500 hover:scale-[1.02] active:scale-[0.98]",
                          category.color
                        )}
                      >
                        <span className="text-4xl md:text-5xl mb-2">{category.icon}</span>
                        <span className="text-white font-semibold text-sm md:text-base text-center">{category.label}</span>
                        <span className="text-white/70 text-xs mt-1">{dishCount} items</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dishes Grid for Selected Category */}
              {selectedPosCategory && !showPosSidesPanel && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {dishesByPosCategory[selectedPosCategory]?.map((dish) => {
                      const isSelected = selectedDishId === dish.id;
                      return (
                        <button
                          key={dish.id}
                          onClick={() => handlePosDishSelect(dish)}
                          className={cn(
                            "flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left min-h-[100px]",
                            isSelected
                              ? "bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/50"
                              : "bg-slate-800/70 border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                          )}
                        >
                          <span className="text-white font-medium text-sm md:text-base leading-tight">{dish.dish_name}</span>
                          {dish.ticket_code && (
                            <span className="text-slate-400 text-xs mt-1 uppercase">{dish.ticket_code}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sides Panel (auto-shown after entree selection) */}
              {showPosSidesPanel && (
                <div className="space-y-4">
                  <div className="bg-blue-600/20 border border-blue-400/50 rounded-lg p-4 mb-4">
                    <p className="text-blue-200 text-sm">
                      <strong>Selected:</strong> {selectedDish?.dish_name}
                      {selectedDish?.ticket_code && <span className="text-blue-300 ml-2">({selectedDish.ticket_code})</span>}
                    </p>
                  </div>
                  <p className="text-slate-300 text-sm font-medium mb-3">Choose a side dish:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {sidesDishes.map((side) => {
                      const isSelected = selectedSideDishId === side.id;
                      return (
                        <button
                          key={side.id}
                          onClick={() => handlePosSideSelect(side)}
                          className={cn(
                            "flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left min-h-[80px]",
                            isSelected
                              ? "bg-green-600/30 border-green-400 ring-2 ring-green-400/50"
                              : "bg-slate-800/70 border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                          )}
                        >
                          <span className="text-white font-medium text-sm">{side.dish_name}</span>
                          {side.ticket_code && (
                            <span className="text-slate-400 text-xs mt-1 uppercase">{side.ticket_code}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      setShowPosSidesPanel(false);
                      setSelectedPosCategory(null);
                    }}
                    className="w-full mt-4 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Skip Side Dish
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 md:mb-8 bg-slate-900/80 backdrop-blur-sm border-slate-800/80 shadow-xl">
          <CardHeader className="pb-6 md:pb-8">
            <CardTitle className="text-white text-2xl md:text-3xl font-semibold tracking-wide">
              Step 1: Select Allergies
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm md:text-base">
              Search or select allergens to check against menu items.
              {selectedAllergies.size > 0 || customAllergies.size > 0 ? (
                <span className="block mt-2 text-blue-300 font-normal">
                  💡 Tip: Press Enter (with no dish selected) to browse all potentially safe dishes for your allergies
                </span>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 md:space-y-3">
              <label className="text-xs md:text-sm uppercase tracking-wider text-slate-400">
                Search or select allergens
              </label>
            <div className="relative">
                <input
                id="allergen-search"
                  type="text"
                  placeholder="Type to search (e.g., dairy, gluten, nuts...)"
                value={allergenSearchTerm}
                onChange={(e) => handleAllergenInputChange(e.target.value)}
                onKeyDown={handleAllergenInputKeyDown}
                  className="w-full px-4 md:px-5 py-3 md:py-4 pr-10 md:pr-12 border border-slate-700 rounded-lg bg-slate-800 text-white text-base md:text-lg placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition-all"
                />
                <Search className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-slate-500" />
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="text-xs md:text-sm uppercase tracking-wider text-slate-400">
                Common allergens
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filteredAllergens.map((allergen) => {
                  const isSelected = selectedAllergies.has(allergen);
                      return (
                    <button
                  key={allergen}
                      type="button"
                      onClick={() => handleAllergyToggle(allergen)}
                  className={cn(
                        "flex items-center justify-between gap-2 md:gap-3 rounded-xl border px-3 md:px-4 py-3 md:py-4 text-left transition-all min-h-[60px] md:min-h-[72px]",
                        isSelected
                          ? "bg-blue-600/30 border-blue-400/70 text-white shadow-lg ring-1 ring-blue-400/40"
                          : "bg-slate-800/70 border-slate-700 text-slate-200 hover:border-blue-400/60 hover:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className={cn(
                          "inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full text-xl md:text-2xl shrink-0",
                          isSelected ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-200"
                        )}>
                          {ALLERGEN_ICONS[allergen]}
                        </span>
                        <div className="font-medium text-sm md:text-base">{ALLERGEN_LABELS[allergen]}</div>
                        </div>
                      <span
                        className={cn(
                          "h-6 w-6 md:h-7 md:w-7 rounded-md border text-sm flex items-center justify-center shrink-0",
                          isSelected ? "bg-blue-500 border-blue-400 text-white" : "border-slate-500 text-slate-400"
                        )}
                      >
                        {isSelected ? '✓' : ''}
                      </span>
                    </button>
                      );
                    })}
                </div>
            </div>
            
            {/* Custom Ingredient Selection - Search all ingredients */}
            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-800">
              <div className="text-xs md:text-sm text-slate-400 mb-3 md:mb-4 uppercase tracking-widest">
                Select Specific Ingredient (advanced)
              </div>
                <div className="relative">
                  <input
                    type="text"
                  placeholder="Start typing ingredient name (e.g., black pepper, onions)..."
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
                  className="w-full px-5 md:px-6 py-4 md:py-5 border border-slate-700 rounded-lg bg-slate-800 text-white text-base md:text-lg placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all"
                  />
                  {showIngredientSuggestions && filteredIngredients.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/70 rounded-md shadow-2xl max-h-60 overflow-y-auto">
                      {filteredIngredients.map((ingredient, _index) => {
                        const displayIndex = filteredIngredients.findIndex((ing) => ing === ingredient);
                        return (
                          <div
                            key={ingredient}
                            className={cn(
                              "p-3 cursor-pointer transition-colors",
                              displayIndex === highlightedIngredientIndex
                                ? "bg-purple-500/20 border-l-2 border-purple-400"
                              : "hover:bg-slate-800/50"
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
                  <div className="absolute z-50 w-full mt-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/70 rounded-md shadow-2xl p-3">
                    <div className="text-slate-300 italic">
                        No ingredients found matching "{ingredientSearchTerm}". Please select from the suggestions above.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            
            {(selectedAllergies.size > 0 || customAllergies.size > 0) && (
              <div className="pt-6 md:pt-8 border-t border-slate-800">
                <div className="text-xs md:text-sm uppercase tracking-wider text-slate-400 mb-3 md:mb-4">
                  Selected allergens
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {Array.from(selectedAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base font-medium rounded-full bg-blue-600/20 text-blue-200 border border-blue-500/50"
                    >
                      <span className="text-base md:text-lg">{ALLERGEN_ICONS[allergen]}</span> {ALLERGEN_LABELS[allergen]}
                  <button
                    type="button"
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="w-5 h-5 md:w-6 md:h-6 rounded-full hover:bg-blue-400/30 flex items-center justify-center transition-colors text-blue-200 leading-none"
                        aria-label={`Remove ${ALLERGEN_LABELS[allergen]}`}
                      >
                        ×
                  </button>
                    </span>
                  ))}
                  {Array.from(customAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base font-medium rounded-full bg-slate-700/60 text-slate-200 border border-slate-600/60"
                    >
                      {allergen}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="w-5 h-5 md:w-6 md:h-6 rounded-full hover:bg-slate-500/40 flex items-center justify-center transition-colors text-slate-200 leading-none"
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
              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-800">
                <button
                  onClick={() => {
                    setShowBrowseMode(true);
                    setShowResults(false);
                    setAllergenSearchTerm('');
                  }}
                  className="w-full px-5 md:px-6 py-4 md:py-5 bg-blue-600 hover:bg-blue-500 text-white text-base md:text-lg font-medium rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Browse Potentially Safe Dishes (or press Enter)
                </button>
            </div>
            )}
          </CardContent>
        </Card>

        <div className="sticky bottom-0 z-40 mt-6 md:static md:mt-6 safe-area-bottom">
          <div className="relative pt-4 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent md:bg-none">
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
                "relative w-full py-4 md:py-5 px-6 text-lg md:text-xl font-semibold rounded-xl transition-all border-2 min-h-[56px] md:min-h-[64px]",
              !selectedDish || (selectedAllergies.size === 0 && customAllergies.size === 0) || (isClassicBreakfast && !selectedProtein) || (isFieldSalad && !selectedDressing)
                ? "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border-blue-600"
            )}
          >
            Check Safety
          </button>
          </div>
        </div>

        {/* Browse Safe Dishes Mode - Show below Check Safety button */}
        {showBrowseMode && safeDishesByCategory && !selectedDishId && (
          <div className="mt-8">
            <Card className="bg-gray-800/60 backdrop-blur-sm border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Potentially Safe Dishes for Your Allergies (No Modifications Needed)</CardTitle>
                <CardDescription className="text-gray-600">
                  These dishes are potentially safe for your selected allergies and require no modifications.
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
                    <p className="text-lg font-medium">No potentially safe dishes found for the selected allergies.</p>
                    <p className="text-sm mt-2">Please try selecting different allergies or check with the chef for modifications.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {showResults && (
          <div className="mt-8 md:mt-10 space-y-6 md:space-y-8">
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
                "pt-8 md:pt-12 pb-8 md:pb-12 px-6 md:px-10",
                result.overallStatus === 'unsafe' && "bg-red-950/30"
              )}>
                <div className="text-center">
                  <h2
                    className={cn(
                      "mb-4 md:mb-6 font-black tracking-wider",
                      result.overallStatus === 'safe' 
                        ? "text-4xl md:text-5xl text-[#2d5016]" 
                        : "text-5xl md:text-6xl text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] font-extrabold"
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
                        ? "text-xl md:text-2xl text-[#2d5016]" 
                        : "text-2xl md:text-3xl text-red-200 font-semibold"
                    )}
                  >
                    {getDisplayGlobalMessage(result.overallStatus, result.globalMessage)}
                  </p>
                  <p className="mt-4 md:mt-6 text-xs md:text-sm text-gray-500 font-medium">
                    {ALWAYS_VERIFY_TEXT}
                  </p>
                  <p className={cn(
                    "mt-6 md:mt-8 italic",
                    result.overallStatus === 'safe' 
                      ? "text-gray-500 text-xs md:text-sm" 
                      : "text-red-300/70 text-sm md:text-base"
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
                      {getStatusText(result.mainDishResult.overallStatus)}
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
                                  {getStatusText(item.status)}
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
                    {getStatusText(result.sideDishResult.overallStatus)}
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
                                {getStatusText(item.status)}
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
                    {getStatusText(result.crustCheck.status)}
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
                                {getStatusText(status)}
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
                    {getStatusText(result.defaultDressingCheck.status)}
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
                                {getStatusText(status)}
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
                    {getStatusText(result.selectedDressingCheck.status)}
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
                                {getStatusText(status)}
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

                {/* Quick Reference Section - Clean Kitchen Ticket */}
                <Card className="border-2 border-[#1e3a5f] bg-white mt-6 shadow-lg overflow-hidden">
                  <CardHeader className="bg-[#1e3a5f] text-white py-4">
                    <CardTitle className="text-xl font-bold text-center">🎫 Kitchen Ticket</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 divide-y-2 divide-dashed divide-gray-200">
                      {/* Entree */}
                    {(() => {
                      const allMods: string[] = [];
                      const notModifiableItems: string[] = [];
                      result.mainDishResult.perAllergy
                              .filter(item => item.status === 'unsafe')
                        .forEach(item => {
                          item.substitutions.forEach(sub => {
                            if (sub.includes('NOT POSSIBLE') || sub.includes('not possible')) {
                              notModifiableItems.push(sub.replace(/^NOT POSSIBLE - /i, '').replace(/^not possible - /i, ''));
                            } else {
                              allMods.push(sub);
                            }
                          });
                        });
                      const isSafe = result.mainDishResult.overallStatus === 'safe';
                      const isNotModifiable = notModifiableItems.length > 0 && allMods.length === 0;
                                
                                return (
                        <div className="p-5">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Entree</p>
                          <p className="font-bold text-gray-900 text-lg mb-3">{result.mainDishResult.dish.dish_name}</p>
                          
                          {isSafe ? (
                            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-4">
                              <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xl font-bold">✓</span>
                              </div>
                              <p className="text-emerald-700 font-bold text-lg">No Changes Needed</p>
                            </div>
                          ) : isNotModifiable ? (
                            <div className="bg-red-50 rounded-xl p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xl font-bold">✗</span>
                                </div>
                                <p className="text-red-700 font-bold text-lg">Cannot Be Modified</p>
                              </div>
                              <div className="mt-2 pl-13 text-red-600 text-sm">
                                {notModifiableItems.map((item, idx) => (
                                  <p key={idx}>{item}</p>
                                ))}
                                      </div>
                                        </div>
                          ) : (
                            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                              {allMods.map((mod, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">!</span>
                                  </div>
                                  <p className="text-amber-900 font-bold text-lg">{mod}</p>
                                </div>
                              ))}
                              {notModifiableItems.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-red-200">
                                  <p className="text-red-600 font-semibold text-sm">⚠️ Cannot Remove:</p>
                                  {notModifiableItems.map((item, idx) => (
                                    <p key={idx} className="text-red-500 text-sm">{item}</p>
                                  ))}
                                      </div>
                                    )}
                                      </div>
                                    )}
                                  </div>
                                );
                    })()}

                      {/* Side Dish */}
                    {result.sideDishResult && (() => {
                      const allMods: string[] = [];
                      const notModifiableItems: string[] = [];
                      result.sideDishResult!.perAllergy
                                .filter(item => item.status === 'unsafe')
                        .forEach(item => {
                          item.substitutions.forEach(sub => {
                            if (sub.includes('NOT POSSIBLE') || sub.includes('not possible')) {
                              notModifiableItems.push(sub.replace(/^NOT POSSIBLE - /i, '').replace(/^not possible - /i, ''));
                            } else {
                              allMods.push(sub);
                            }
                          });
                        });
                      const isSafe = result.sideDishResult!.overallStatus === 'safe';
                      const isNotModifiable = notModifiableItems.length > 0 && allMods.length === 0;
                                  
                                  return (
                        <div className="p-5">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Side</p>
                          <p className="font-bold text-gray-900 text-lg mb-3">{result.sideDishResult!.dish.dish_name}</p>
                          
                          {isSafe ? (
                            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-4">
                              <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xl font-bold">✓</span>
                              </div>
                              <p className="text-emerald-700 font-bold text-lg">No Changes Needed</p>
                            </div>
                          ) : isNotModifiable ? (
                            <div className="bg-red-50 rounded-xl p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xl font-bold">✗</span>
                                </div>
                                <p className="text-red-700 font-bold text-lg">Cannot Be Modified</p>
                              </div>
                              <div className="mt-2 pl-13 text-red-600 text-sm">
                                {notModifiableItems.map((item, idx) => (
                                  <p key={idx}>{item}</p>
                                ))}
                                        </div>
                                        </div>
                          ) : (
                            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                              {allMods.map((mod, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">!</span>
                                  </div>
                                  <p className="text-amber-900 font-bold text-lg">{mod}</p>
                                </div>
                              ))}
                              {notModifiableItems.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-red-200">
                                  <p className="text-red-600 font-semibold text-sm">⚠️ Cannot Remove:</p>
                                  {notModifiableItems.map((item, idx) => (
                                    <p key={idx} className="text-red-500 text-sm">{item}</p>
                                  ))}
                                        </div>
                                      )}
                                        </div>
                                      )}
                                    </div>
                                  );
                    })()}

                      {/* Crusts */}
                    {result.crustCheck && result.selectedCrusts && result.selectedCrusts.size > 0 && (() => {
                      const allMods: string[] = [];
                      Array.from(selectedAllergies).forEach(allergen => {
                        if (result.crustCheck && result.crustCheck.substitutions[allergen]) {
                          result.crustCheck.substitutions[allergen].forEach(sub => allMods.push(sub));
                        }
                      });
                      const isSafe = result.crustCheck.status === 'safe' || allMods.length === 0;

                                  return (
                        <div className="p-5">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Crust</p>
                          <p className="font-bold text-gray-900 text-lg mb-3">
                            {Array.from(result.selectedCrusts).map(c => crustOptions.find(opt => opt.value === c)?.label).filter(Boolean).join(', ')}
                          </p>
                          
                          {isSafe ? (
                            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-4">
                              <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xl font-bold">✓</span>
                                    </div>
                              <p className="text-emerald-700 font-bold text-lg">No Changes Needed</p>
                            </div>
                          ) : (
                            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                              {allMods.map((mod, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">!</span>
                                  </div>
                                  <p className="text-amber-900 font-bold text-lg">{mod}</p>
                                </div>
                              ))}
                        </div>
                      )}
                        </div>
                      );
                    })()}

                      {/* Dressings */}
                    {result.defaultDressingCheck && result.defaultDressing && (() => {
                      const allMods: string[] = [];
                      Array.from(selectedAllergies).forEach(allergen => {
                        if (result.defaultDressingCheck && result.defaultDressingCheck.substitutions[allergen]) {
                          result.defaultDressingCheck.substitutions[allergen].forEach(sub => allMods.push(sub));
                        }
                      });
                      const isSafe = allMods.length === 0;

                                      return (
                        <div className="p-5">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Default Dressing</p>
                          <p className="font-bold text-gray-900 text-lg mb-3">
                            {dressingOptions.find(d => d.value === result.defaultDressing)?.label || result.defaultDressing}
                          </p>
                          
                          {isSafe ? (
                            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-4">
                              <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xl font-bold">✓</span>
                                        </div>
                              <p className="text-emerald-700 font-bold text-lg">No Changes Needed</p>
                                </div>
                          ) : (
                            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                              {allMods.map((mod, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">!</span>
                                  </div>
                                  <p className="text-amber-900 font-bold text-lg">{mod}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    
                    {result.selectedDressingCheck && result.selectedDressing && (() => {
                      const allMods: string[] = [];
                      Array.from(selectedAllergies).forEach(allergen => {
                        if (result.selectedDressingCheck && result.selectedDressingCheck.substitutions[allergen]) {
                          result.selectedDressingCheck.substitutions[allergen].forEach(sub => allMods.push(sub));
                        }
                      });
                      const isSafe = allMods.length === 0;

                                      return (
                        <div className="p-5">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                            {result.hasDressingSubstitution ? 'Substituted Dressing' : 'Selected Dressing'}
                          </p>
                          <p className="font-bold text-gray-900 text-lg mb-3">
                            {dressingOptions.find(d => d.value === result.selectedDressing)?.label || result.selectedDressing}
                          </p>
                          
                          {isSafe ? (
                            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-4">
                              <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xl font-bold">✓</span>
                                        </div>
                              <p className="text-emerald-700 font-bold text-lg">No Changes Needed</p>
                                </div>
                          ) : (
                            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                              {allMods.map((mod, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">!</span>
                            </div>
                                  <p className="text-amber-900 font-bold text-lg">{mod}</p>
                                </div>
                              ))}
                        </div>
                      )}
                    </div>
                      );
                    })()}
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

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 py-10">
          <Card className="w-full max-w-lg bg-white shadow-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Settings & About</CardTitle>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="min-h-[40px] min-w-[40px] rounded-full text-gray-500 hover:bg-gray-100"
                  aria-label="Close settings"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-gray-400">App Version</div>
                <div className="font-medium text-gray-900">{__APP_VERSION__}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-gray-400">Menu Data Version</div>
                <div className="font-medium text-gray-900">{menuDataInfo.version || 'Unknown'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-gray-400">Last Updated</div>
                <div className="font-medium text-gray-900">{menuGeneratedAtLabel}</div>
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="text-xs uppercase tracking-wider text-gray-400">Disclaimer</div>
                <p>{DISCLAIMER_TEXT}</p>
                <p className="font-semibold text-gray-700">{ALWAYS_VERIFY_TEXT}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleDisclaimerReset();
                  setIsSettingsOpen(false);
                }}
                className="w-full min-h-[44px] rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Reset disclaimer acknowledgement
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {isDisclaimerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Card className="w-full max-w-lg bg-white shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900">Before You Continue</CardTitle>
              <CardDescription className="text-gray-600">
                Please acknowledge the safety disclaimer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700">
              <p>{DISCLAIMER_TEXT}</p>
              <p className="font-semibold text-gray-700">{ALWAYS_VERIFY_TEXT}</p>
              <label className="flex items-start gap-3 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={disclaimerChecked}
                  onChange={(event) => setDisclaimerChecked(event.target.checked)}
                  className="mt-1 h-5 w-5"
                />
                <span>I understand and will verify with staff.</span>
              </label>
              <button
                type="button"
                onClick={handleDisclaimerContinue}
                disabled={!disclaimerChecked}
                className={cn(
                  'w-full min-h-[44px] rounded-md font-semibold transition-colors',
                  disclaimerChecked
                    ? 'bg-[#1e3a5f] text-white hover:bg-[#2d3748]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                )}
              >
                Continue
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

