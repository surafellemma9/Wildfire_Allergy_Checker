#!/usr/bin/env python3
"""
Clean menu-items.ts file by removing unnecessary adjectives and duplicates from ingredients.
"""

import json
import re
import sys
from pathlib import Path

# Adjectives that help identify substitutions - these should be kept
SUBSTITUTION_ADJECTIVES = {
    'caramelized', 'hard-boiled', 'hard boiled', 'pasteurized', 'sun-dried', 'sun dried',
    'smoked', 'crispy', 'grilled', 'roasted', 'fresh', 'dried', 'raw', 'cooked',
    'pickled', 'fermented', 'aged', 'sharp', 'mild', 'extra virgin'
}

# Words/phrases that are not ingredients
NON_INGREDIENT_WORDS = {
    'then', 'and', 'or', 'with', 'in', 'on', 'at', 'to', 'for', 'of', 'the', 'a', 'an',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'side', 'sides', 'ramekin', 'ramekins', 'cup', 'cups', 'bowl', 'bowls',
    'portion', 'portions', 'lunch', 'dinner', 'available', 'request', 'only',
    'equaling', 'about', 'total', 'each', 'pieces', 'piece', 'skewers', 'skewer',
    'choice', 'choices', 'drizzle', 'dollop', 'garnish', 'garnished', 'topped',
    'served', 'tossed', 'wrapped', 'baked', 'fried', 'grilled', 'broiled',
    'sliced', 'diced', 'chopped', 'roasted', 'skewered', 'marinated', 'seasoned',
    'brushed', 'glazed', 'coated', 'heated', 'chilled', 'peeled', 'poached',
    'simmered', 'boiled', 'steamed', 'seared', 'sautéed', 'scrambled', 'griddled',
    'desired', 'temperature', 'medium', 'rare', 'well', 'done', 'golden', 'brown',
    'oven', 'skillet', 'pan', 'spray', 'cooking', 'etc', 'etc.'
}

def fix_typos(text):
    """Fix common typos in ingredient names."""
    # Fix specific known typos first (most specific patterns first)
    # Fix "Old Bay s easoning" -> "Old Bay seasoning"
    text = re.sub(r'Old\s+Bay\s+s\s+easoning', 'Old Bay seasoning', text, flags=re.IGNORECASE)
    text = re.sub(r's\s+easoning', 'seasoning', text, flags=re.IGNORECASE)  # More general fix
    text = re.sub(r'Asiago\s+cheese\s+s\s*$', 'Asiago cheese', text, flags=re.IGNORECASE)
    text = re.sub(r'cheese\s+s\s*$', 'cheese', text, flags=re.IGNORECASE)
    
    # General fixes - fix space issues in words (but be careful not to break compound words)
    # Only fix if it's clearly a typo (single letter separated)
    text = re.sub(r'(\w)\s+([a-z])\s+(\w)', r'\1\2\3', text, flags=re.IGNORECASE)  # Fix "s easoning" -> "seasoning"
    # But preserve intentional spaces (like "Old Bay", "house oil")
    text = re.sub(r'OldBay', 'Old Bay', text, flags=re.IGNORECASE)
    text = re.sub(r'houseoil', 'house oil', text, flags=re.IGNORECASE)
    text = re.sub(r'chickenstock', 'chicken stock', text, flags=re.IGNORECASE)
    text = re.sub(r'shrimppoaching', 'shrimp poaching', text, flags=re.IGNORECASE)
    text = re.sub(r'lobsterbase', 'lobster base', text, flags=re.IGNORECASE)
    text = re.sub(r'tomatopaste', 'tomato paste', text, flags=re.IGNORECASE)
    text = re.sub(r'redpeppers', 'red peppers', text, flags=re.IGNORECASE)
    text = re.sub(r'garliccrouton', 'garlic crouton', text, flags=re.IGNORECASE)
    text = re.sub(r'chickenjus', 'chicken jus', text, flags=re.IGNORECASE)
    text = re.sub(r'tomatobasil', 'tomato basil', text, flags=re.IGNORECASE)
    text = re.sub(r'whitewine', 'white wine', text, flags=re.IGNORECASE)
    text = re.sub(r'redwine', 'red wine', text, flags=re.IGNORECASE)
    text = re.sub(r'bluecheese', 'blue cheese', text, flags=re.IGNORECASE)
    text = re.sub(r'goatcheese', 'goat cheese', text, flags=re.IGNORECASE)
    text = re.sub(r'heavycream', 'heavy cream', text, flags=re.IGNORECASE)
    text = re.sub(r'yogurtsauce', 'yogurt sauce', text, flags=re.IGNORECASE)
    
    # Remove trailing spaces
    text = text.rstrip()
    
    return text.strip()

def should_keep_adjective(ingredient):
    """Check if an adjective should be kept (helps identify substitutions)."""
    lower = ingredient.lower()
    for adj in SUBSTITUTION_ADJECTIVES:
        if adj in lower:
            return True
    return False

def is_non_ingredient(text):
    """Check if text is clearly not an ingredient."""
    text_lower = text.lower().strip()
    
    # Check exact matches
    if text_lower in NON_INGREDIENT_WORDS:
        return True
    
    # Check patterns
    patterns = [
        r'^(dinner|lunch|breakfast|brunch)\s+(portion|filet|filets|is|are|available)',
        r'^(two|three|four|five|six|seven|eight|nine|ten)\s+(filets?|skewers?|pieces?|oz\.?|count)',
        r'^(duo|trio)\s*=',
        r'^on\s+(top\s+of\s+)?(a|an|the)\s+',
        r'^with\s+(a|an|the)\s+(ramekin|side|drizzle|dollop)',
        r'^then\s+',
        r'^and\s+then\s+',
        r'^and\s+(pepper|salt|butter|cheese|oil)',  # "and pepper", "and butter", etc.
        r'^served\s+with',
        r'^garnished\s+with',
        r'^topped\s+with',
        r'^tossed\s+with',
        r'^wrapped\s+in',
        r'^baked\s+in',
        r'^fried\s+in',
        r'^roasted\s+in',
        r'^grilled\s+to',
        r'^broiled\s+to',
        r'^cooked\s+to',
        r'^to\s+(desired|medium|rare|well|done)',
        r'^(oz\.?|count|pieces?|each|equaling|about|total)\s+',
        r'^\d+\s*(oz\.?|count|pieces?|each)',
        r'^\d+-\d+\s+',
        r'^cooking\s+spray$',
        r'^guest\s+choice',
        r'^crust\s+choices',
        r'^dressing\s+choices',
        r'\s+heated\s+up\s+in\s+',  # "heated up in"
        r'\s+with\s+white\s+wine$',  # "butter with white wine" -> should be separate
        r'^balls\s+of\s+',  # "balls of domestic goat cheese"
        r'\s+with\s+tomato\s+basil\s+sauce$',  # "goat cheese with tomato basil sauce"
        r'^on\s+top\s+of\s+(a|an|the)\s+',  # "on top of a garlic crouton"
        r'^then\s+',  # "then chicken jus"
        r'^bison\s+meatballs\s+heated',  # "bison meatballs heated up in garlic butter"
        r'^flatbread\s+\s+garlic',  # "flatbread   garlic puree" (multiple spaces)
        r'^balls\s+of\s+domestic',  # "balls of domestic goat cheese"
        r'^chicken\s+breast\s+pieces$',  # "chicken breast pieces" -> just "chicken"
    ]
    
    for pattern in patterns:
        if re.search(pattern, text_lower, re.IGNORECASE):
            return True
    
    return False

def remove_unnecessary_adjectives(ingredient):
    """Remove unnecessary adjectives unless they help identify substitutions."""
    if should_keep_adjective(ingredient):
        return ingredient
    
    # Remove common unnecessary adjectives at the start
    # But be conservative - only remove if it's clearly not helping
    cleaned = re.sub(
        r'^(fresh|chopped|sliced|diced|minced|grated|shredded|crumbled|toasted|whole|large|small|medium|big|tiny|thick|thin|soft|hard|smooth|rough|sweet|sour|bitter|spicy|mild|hot|cold|warm|cool|dry|wet|sticky|tender|tough|juicy|moist|flaky|dense|light|heavy|rich|lean|fatty|extra|super|premium|quality|fine|coarse|ground|powdered|granulated|liquid|solid|frozen|dried|canned|jarred|bottled|packaged|organic|natural|artificial|synthetic|pure|mixed|blended|combined|separated|whole|partial|complete|full|empty|new|old|young|mature|ripe|unripe|raw|cooked|uncooked|prepared|unprepared|processed|unprocessed|refined|unrefined|filtered|unfiltered|pasteurized|unpasteurized|homogenized|unhomogenized|sterilized|unsterilized|preserved|unpreserved|fermented|unfermented|aged|unaged|smoked|unsmoked|cured|uncured|salted|unsalted|sweetened|unsweetened|flavored|unflavored|seasoned|unseasoned|marinated|unmarinated|brined|unbrined|pickled|unpickled|dehydrated|rehydrated|frozen|thawed|chilled|warmed|heated|cooled)\s+',
        '',
        ingredient,
        flags=re.IGNORECASE
    )
    
    # Normalize whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    return cleaned

def split_compound_ingredient(ingredient):
    """Split compound ingredients like 'butter with white wine' into separate ingredients."""
    # Patterns that indicate multiple ingredients - split on these
    # But preserve known compounds
    known_compounds = ['salt and pepper', 'salt & pepper', 'tomato basil sauce']
    
    ingredient_lower = ingredient.lower()
    for compound in known_compounds:
        if compound in ingredient_lower:
            return [ingredient]  # Don't split known compounds
    
    # Patterns to split on
    split_patterns = [
        r'\s+with\s+',  # "butter with white wine" -> ["butter", "white wine"]
        r'\s+then\s+',  # "then chicken jus" -> should be removed, but if it has ingredients, split
        r'\s+heated\s+up\s+in\s+',  # "bison meatballs heated up in garlic butter" -> split
    ]
    
    results = [ingredient]
    for pattern in split_patterns:
        new_results = []
        for item in results:
            if re.search(pattern, item, re.IGNORECASE):
                parts = re.split(pattern, item, flags=re.IGNORECASE)
                # Filter out non-ingredient parts
                filtered_parts = []
                for part in parts:
                    part = part.strip()
                    if part and not is_non_ingredient(part) and len(part) > 2:
                        filtered_parts.append(part)
                if filtered_parts:
                    new_results.extend(filtered_parts)
                # If all parts were filtered, don't add anything
            else:
                new_results.append(item)
        results = new_results
    
    return results

def clean_ingredient(ingredient):
    """Clean a single ingredient string."""
    if not ingredient or not isinstance(ingredient, str):
        return None
    
    # Remove trailing spaces first
    ingredient = ingredient.rstrip()
    
    # Fix typos
    cleaned = fix_typos(ingredient)
    
    # Skip if empty or too short
    if len(cleaned) < 2:
        return None
    
    # Check if it's clearly not an ingredient
    if is_non_ingredient(cleaned):
        return None
    
    # Skip very long phrases (likely not ingredients)
    if len(cleaned) > 50:
        return None
    
    # Remove unnecessary adjectives (unless they help identify substitutions)
    cleaned = remove_unnecessary_adjectives(cleaned)
    
    # Final cleanup
    cleaned = cleaned.strip()
    if len(cleaned) < 2:
        return None
    
    return cleaned

def normalize_for_comparison(ingredient):
    """Normalize ingredient for comparison (lowercase, remove extra spaces)."""
    return re.sub(r'\s+', ' ', ingredient.lower().strip())

def clean_ingredients(ingredients):
    """Clean and deduplicate ingredients array."""
    cleaned_set = set()
    normalized_map = {}  # normalized -> original
    
    for ing in ingredients:
        # First try to split compound ingredients
        split_items = split_compound_ingredient(ing)
        
        for item in split_items:
            cleaned_ing = clean_ingredient(item)
            if not cleaned_ing:
                continue
            
            # Remove unnecessary adjectives (unless they help identify substitutions)
            without_adj = remove_unnecessary_adjectives(cleaned_ing)
            
            # Normalize for comparison
            normalized_key = normalize_for_comparison(without_adj)
            
            # Skip if we already have this (normalized)
            if normalized_key in normalized_map:
                # Keep the version with helpful adjectives if it exists
                existing = normalized_map[normalized_key]
                if should_keep_adjective(cleaned_ing) and not should_keep_adjective(existing):
                    normalized_map[normalized_key] = cleaned_ing
                    cleaned_set.discard(existing)
                    cleaned_set.add(cleaned_ing)
                continue
            
            # Check for similar ingredients (plural/singular, etc.)
            is_duplicate = False
            for norm_key, orig in list(normalized_map.items()):
                # Check if one is plural/singular of the other
                if normalized_key == norm_key + 's' or norm_key == normalized_key + 's':
                    # Keep the more specific one or the one with helpful adjectives
                    if should_keep_adjective(cleaned_ing) and not should_keep_adjective(orig):
                        del normalized_map[norm_key]
                        cleaned_set.discard(orig)
                        normalized_map[normalized_key] = cleaned_ing
                        cleaned_set.add(cleaned_ing)
                    is_duplicate = True
                    break
                # Check if they're very similar (e.g., "cheese" vs "cheese s")
                if abs(len(normalized_key) - len(norm_key)) <= 2:
                    if normalized_key in norm_key or norm_key in normalized_key:
                        # Keep the more complete version
                        if len(cleaned_ing) > len(orig) or should_keep_adjective(cleaned_ing):
                            del normalized_map[norm_key]
                            cleaned_set.discard(orig)
                            normalized_map[normalized_key] = cleaned_ing
                            cleaned_set.add(cleaned_ing)
                        is_duplicate = True
                        break
            
            if not is_duplicate:
                normalized_map[normalized_key] = cleaned_ing
                cleaned_set.add(cleaned_ing)
    
    # Sort ingredients alphabetically
    return sorted(cleaned_set, key=str.lower)

def main():
    script_dir = Path(__file__).parent
    file_path = script_dir.parent / 'src' / 'data' / 'menu-items.ts'
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the JSON array from the file
    # Find the menuItems array
    match = re.search(r'export const menuItems: MenuItem\[\] = (\[[\s\S]*?\]) as MenuItem\[\];', content)
    if not match:
        print('Could not find menuItems array in file')
        sys.exit(1)
    
    # Parse the JSON
    try:
        menu_items = json.loads(match.group(1))
    except json.JSONDecodeError as e:
        print(f'Error parsing JSON: {e}')
        sys.exit(1)
    
    print(f'Processing {len(menu_items)} menu items...')
    
    # Clean each menu item's ingredients
    total_before = 0
    total_after = 0
    
    for item in menu_items:
        total_before += len(item.get('ingredients', []))
        item['ingredients'] = clean_ingredients(item.get('ingredients', []))
        total_after += len(item['ingredients'])
    
    print(f'Reduced ingredients from {total_before} to {total_after} (removed {total_before - total_after} items)')
    
    # Write back to file
    output = f"""// This file is auto-generated from wildfire_menu_allergens.csv
// Run: npm run generate-menu-data
// NOTE: This file has been cleaned to remove unnecessary adjectives and duplicates

import type {{ MenuItem }} from '../types';

export const menuItems: MenuItem[] = {json.dumps(menu_items, indent=2, ensure_ascii=False)} as MenuItem[];
"""
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(output)
    
    print(f'Cleaned file written to {file_path}')

if __name__ == '__main__':
    main()
