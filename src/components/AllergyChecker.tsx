import { useMemo, useState } from 'react';
import { menuItems } from '../data/menu-items';
import type { Allergen } from '../types';
import { checkDishSafety } from '../utils/allergy-checker';
import './AllergyChecker.css';

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
};

export function AllergyChecker() {
  const [selectedDishId, setSelectedDishId] = useState<string>('');
  const [selectedAllergies, setSelectedAllergies] = useState<Set<Allergen>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const selectedDish = useMemo(() => {
    return menuItems.find((item) => item.id === selectedDishId) || null;
  }, [selectedDishId]);

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
  }, [searchTerm]);

  const handleAllergyToggle = (allergen: Allergen) => {
    const newSet = new Set(selectedAllergies);
    if (newSet.has(allergen)) {
      newSet.delete(allergen);
    } else {
      newSet.add(allergen);
    }
    setSelectedAllergies(newSet);
  };

  const handleCheckSafety = () => {
    if (!selectedDish || selectedAllergies.size === 0) {
      alert('Please select a dish and at least one allergy.');
      return;
    }
    setShowResults(true);
  };

  const result = useMemo(() => {
    if (!selectedDish || selectedAllergies.size === 0 || !showResults) {
      return null;
    }
    return checkDishSafety(selectedDish, Array.from(selectedAllergies));
  }, [selectedDish, selectedAllergies, showResults]);

  const getStatusColor = (status: 'safe' | 'safe_with_mods' | 'unsafe') => {
    switch (status) {
      case 'safe':
        return '#28a745'; // Green for safe
      case 'safe_with_mods':
        return '#ffc107'; // Yellow for warnings
      case 'unsafe':
        return '#dc3545'; // Red for danger
    }
  };

  const getStatusText = (status: 'safe' | 'safe_with_mods' | 'unsafe') => {
    switch (status) {
      case 'safe':
        return 'SAFE';
      case 'safe_with_mods':
        return 'REQUIRES MODIFICATIONS';
      case 'unsafe':
        return 'NOT RECOMMENDED';
    }
  };

  return (
    <div className="allergy-checker">
      <div className="hero-section">
        <h1>Allergy Safety Checker</h1>
        <p className="hero-subtitle">Check menu items for allergens and get modification suggestions</p>
      </div>

      {(selectedAllergies.size > 0 || selectedDishId) && (
        <div className="sticky-nav">
          <div className="selected-allergies-badges">
            {selectedAllergies.size > 0 && (
              <>
                <span style={{ color: '#e0e0e0', marginRight: '0.5rem' }}>Selected:</span>
                {Array.from(selectedAllergies).map((allergen) => (
                  <span key={allergen} className="allergy-badge">
                    {ALLERGEN_LABELS[allergen]}
                  </span>
                ))}
              </>
            )}
            {selectedDish && (
              <span className="allergy-badge" style={{ background: '#2d2d2d', border: '1px solid #DC143C' }}>
                {selectedDish.dish_name}
              </span>
            )}
          </div>
          <button
            className="reset-button"
            onClick={() => {
              setSelectedDishId('');
              setSelectedAllergies(new Set());
              setSearchTerm('');
              setShowResults(false);
              setShowSuggestions(false);
            }}
          >
            Reset
          </button>
        </div>
      )}

      <div className="step-indicator">
        <div className={`step ${selectedAllergies.size > 0 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <span>Select Allergies</span>
        </div>
        <div className={`step ${selectedDishId ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <span>Choose Dish</span>
        </div>
        <div className={`step ${showResults ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span>Review Results</span>
        </div>
      </div>

      <div className="container">
        <div className="disclaimer">
          <strong>Disclaimer:</strong> This is an unofficial internal helper based on our ingredient book. For severe allergies, ALWAYS confirm with the chef/manager and follow full allergy protocol.
        </div>

        <div className="form-section">
          <div className="form-group">
            <label htmlFor="dish-search">1. Select Dish</label>
            <div className="search-container">
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
                  // Delay hiding suggestions to allow clicks
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
                    }
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                className="search-input"
              />
              {showSuggestions && filteredDishes.length > 0 && (
                <div className="suggestions-dropdown">
                  {filteredDishes.map((item, index) => (
                    <div
                      key={item.id}
                      className={`suggestion-item ${
                        index === highlightedIndex ? 'highlighted' : ''
                      }`}
                      onClick={() => {
                        setSelectedDishId(item.id);
                        setSearchTerm(item.dish_name);
                        setShowSuggestions(false);
                        setHighlightedIndex(-1);
                        setShowResults(false);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="suggestion-name">{item.dish_name}</div>
                      {item.ticket_code && (
                        <div className="suggestion-code">{item.ticket_code}</div>
                      )}
                      <div className="suggestion-category">{item.category}</div>
                    </div>
                  ))}
                </div>
              )}
              {showSuggestions && searchTerm.trim() && filteredDishes.length === 0 && (
                <div className="suggestions-dropdown">
                  <div className="suggestion-item no-results">
                    No dishes found matching "{searchTerm}"
                  </div>
                </div>
              )}
            </div>
            <select
              value={selectedDishId}
              onChange={(e) => {
                setSelectedDishId(e.target.value);
                const selected = menuItems.find((item) => item.id === e.target.value);
                if (selected) {
                  setSearchTerm(selected.dish_name);
                }
                setShowResults(false);
                setShowSuggestions(false);
              }}
              className="dish-select"
            >
              <option value="">-- Or select from dropdown --</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.dish_name} {item.ticket_code && `(${item.ticket_code})`}
                </option>
              ))}
            </select>
            {selectedDish && (
              <div className="dish-info">
                <strong>{selectedDish.dish_name}</strong>
                {selectedDish.ticket_code && (
                  <span className="ticket-code">Ticket: {selectedDish.ticket_code}</span>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>2. Select Allergies (one or more)</label>
            <div className="allergy-checkboxes">
              {ALL_ALLERGENS.map((allergen) => (
                <label key={allergen} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedAllergies.has(allergen)}
                    onChange={() => {
                      handleAllergyToggle(allergen);
                      setShowResults(false);
                    }}
                  />
                  <span>{ALLERGEN_LABELS[allergen]}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleCheckSafety}
            disabled={!selectedDish || selectedAllergies.size === 0}
            className="check-button"
          >
            Check Safety
          </button>
        </div>

        {result && showResults && (
          <div className="results-section">
            <div
              className="status-banner"
              style={{ 
                backgroundColor: getStatusColor(result.overallStatus),
                color: '#ffffff'
              }}
            >
              <span className="status-text">{getStatusText(result.overallStatus)}</span>
            </div>

            <div className="result-content">
              <div className="dish-header">
                <h2>{result.dish.dish_name}</h2>
                {result.dish.ticket_code && (
                  <p className="ticket-code">Ticket Code: {result.dish.ticket_code}</p>
                )}
              </div>

              <div className="global-message">
                <p>{result.globalMessage}</p>
              </div>

              {result.modificationSuggestions.length > 0 && (
                <div className="modifications-section">
                  <h3>Recommended Modifications</h3>
                  <ul className="modifications-list">
                    {result.modificationSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="per-allergy-section">
                <h3>Allergen Analysis</h3>
                {result.perAllergy.map((item) => (
                  <div key={item.allergen} className="allergy-detail">
                    <div className="allergy-header">
                      <strong>{ALLERGEN_LABELS[item.allergen]}</strong>
                      <span
                        className="allergy-status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(item.status),
                          color: '#ffffff'
                        }}
                      >
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    <p className="allergy-message">{item.message}</p>
                    {item.foundIngredients && item.foundIngredients.length > 0 && (
                      <div className="found-ingredients">
                        <strong>Identified ingredients containing {ALLERGEN_LABELS[item.allergen]}:</strong>
                        <ul>
                          {item.foundIngredients.map((ingredient, idx) => (
                            <li key={idx}><em>{ingredient}</em></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.suggestions && item.suggestions.length > 0 && (
                      <div className="allergy-suggestions">
                        <strong>Modification options:</strong>
                        <ul>
                          {item.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {result.dish.notes && result.dish.notes.trim() !== '' && (
                <div className="notes-box">
                  <strong>Additional Notes:</strong>
                  <p>{result.dish.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

