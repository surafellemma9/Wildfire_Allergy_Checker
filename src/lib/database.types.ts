// Database types for Supabase
// Generated based on our schema design

export type AllergenType = 
  | 'dairy'
  | 'gluten'
  | 'shellfish'
  | 'fish'
  | 'egg'
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
  ticket_code: string | null;
  category: string;
  menu: string;
  description: string;
  ingredients: string[];
  notes: string | null;
  mod_notes: string | null;
  cannot_be_made_safe_notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AllergenModification {
  id: string;
  dish_id: string;
  modifications: string[];
  can_be_modified: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CompositeIngredient {
  id: string;
  name: string;
  sub_ingredients: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      dairy_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      gluten_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      shellfish_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      fish_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      egg_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      soy_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      peanut_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      tree_nut_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      sesame_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      msg_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      onion_garlic_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      tomato_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      seed_modifications: {
        Row: AllergenModification;
        Insert: Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AllergenModification, 'id' | 'created_at' | 'updated_at'>>;
      };
      composite_ingredients: {
        Row: CompositeIngredient;
        Insert: Omit<CompositeIngredient, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CompositeIngredient, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

// Helper type to get modification table name from allergen
export const allergenToTable: Record<AllergenType, string> = {
  dairy: 'dairy_modifications',
  gluten: 'gluten_modifications',
  shellfish: 'shellfish_modifications',
  fish: 'fish_modifications',
  egg: 'egg_modifications',
  soy: 'soy_modifications',
  peanuts: 'peanut_modifications',
  tree_nuts: 'tree_nut_modifications',
  sesame: 'sesame_modifications',
  msg: 'msg_modifications',
  onion_garlic: 'onion_garlic_modifications',
  tomato: 'tomato_modifications',
  seed: 'seed_modifications',
};
