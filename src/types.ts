export type Allergen =
  | 'dairy'
  | 'egg'
  | 'gluten'
  | 'shellfish'
  | 'fish'
  | 'soy'
  | 'peanuts'
  | 'tree_nuts'
  | 'sesame'
  | 'msg'
  | 'onion_garlic'
  | 'tomato';

export interface MenuItem {
  id: string;
  dish_name: string;
  ticket_code: string;
  category: string;
  menu: string;
  description: string;
  allergy_raw: string;
  contains_dairy: 'Y' | 'N' | '' | null;
  contains_egg: 'Y' | 'N' | '' | null;
  contains_gluten: 'Y' | 'N' | '' | null;
  contains_shellfish: 'Y' | 'N' | '' | null;
  contains_fish: 'Y' | 'N' | '' | null;
  contains_soy: 'Y' | 'N' | '' | null;
  contains_nuts: 'Y' | 'N' | '' | null;
  contains_sesame: 'Y' | 'N' | '' | null;
  contains_msg: 'Y' | 'N' | '' | null;
  contains_peanuts: 'Y' | 'N' | '' | null;
  contains_tree_nuts: 'Y' | 'N' | '' | null;
  notes: string;
  mod_notes: string;
  cannot_be_made_safe_notes: string;
}

export interface AllergyCheckResult {
  dish: MenuItem;
  selectedAllergies: Allergen[];
  overallStatus: 'safe' | 'safe_with_mods' | 'unsafe';
  perAllergy: Array<{
    allergen: Allergen;
    contains: boolean;
    status: 'safe' | 'safe_with_mods' | 'unsafe';
    message: string;
    suggestions?: string[];
    foundIngredients?: string[];
  }>;
  globalMessage: string;
  modificationSuggestions: string[];
}

