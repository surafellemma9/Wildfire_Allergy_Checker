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
  | 'tomato'
  | 'seed';

export interface MenuItem {
  id: string;
  dish_name: string;
  ticket_code: string;
  category: string;
  menu: string;
  description: string;
  ingredients: string[]; // Parsed list of all ingredients
  allergy_raw: string;
  contains_dairy: 'Y' | 'N' | '' | null | boolean;
  contains_egg: 'Y' | 'N' | '' | null | boolean;
  contains_gluten: 'Y' | 'N' | '' | null | boolean;
  contains_shellfish: 'Y' | 'N' | '' | null | boolean;
  contains_fish: 'Y' | 'N' | '' | null | boolean;
  contains_soy: 'Y' | 'N' | '' | null | boolean;
  contains_nuts: 'Y' | 'N' | '' | null | boolean;
  contains_sesame: 'Y' | 'N' | '' | null | boolean;
  contains_msg: 'Y' | 'N' | '' | null | boolean;
  contains_peanuts: 'Y' | 'N' | '' | null | boolean;
  contains_tree_nuts: 'Y' | 'N' | '' | null | boolean;
  notes: string;
  mod_notes: string;
  cannot_be_made_safe_notes: string;
}

export interface AllergyCheckResult {
  dish: MenuItem;
  selectedAllergies: Allergen[];
  customAllergies: string[];
  overallStatus: 'safe' | 'unsafe';
  perAllergy: Array<{
    allergen: Allergen | string;
    contains: boolean;
    status: 'safe' | 'unsafe';
    canBeModified: boolean;
    substitutions: string[];
    foundIngredients?: string[];
  }>;
  globalMessage: string;
}

