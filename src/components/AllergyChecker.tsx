import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { SparklesCore } from '@/components/ui/sparkles';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { menuItems } from '../data/menu-items';
import type { Allergen } from '../types';
import { checkDishSafety } from '../utils/allergy-checker';

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
  const [customAllergies, setCustomAllergies] = useState<Set<string>>(new Set());
  const [customAllergenInput, setCustomAllergenInput] = useState('');
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

  const handleAddCustomAllergen = () => {
    const trimmed = customAllergenInput.trim();
    if (trimmed && !customAllergies.has(trimmed)) {
      setCustomAllergies(new Set([...customAllergies, trimmed]));
      setCustomAllergenInput('');
      setShowResults(false);
    }
  };

  const handleRemoveCustomAllergen = (allergen: string) => {
    const newSet = new Set(customAllergies);
    newSet.delete(allergen);
    setCustomAllergies(newSet);
    setShowResults(false);
  };

  const handleCheckSafety = () => {
    if (!selectedDish || (selectedAllergies.size === 0 && customAllergies.size === 0)) {
      alert('Please select a dish and at least one allergy.');
      return;
    }
    setShowResults(true);
  };

  const result = useMemo(() => {
    if (!selectedDish || (selectedAllergies.size === 0 && customAllergies.size === 0) || !showResults) {
      return null;
    }
    return checkDishSafety(selectedDish, Array.from(selectedAllergies), Array.from(customAllergies));
  }, [selectedDish, selectedAllergies, customAllergies, showResults]);

  const getStatusText = (status: 'safe' | 'unsafe') => {
    switch (status) {
      case 'safe':
        return 'SAFE - NO CHANGES';
      case 'unsafe':
        return 'UNSAFE';
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Sparkles Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <SparklesCore
          id="tsparticles"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={150}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={0.5}
        />
        {/* Additional colorful particles layer */}
        <div className="absolute inset-0 opacity-60">
          <SparklesCore
            id="tsparticles-colorful"
            background="transparent"
            minSize={0.3}
            maxSize={0.8}
            particleDensity={80}
            className="w-full h-full"
            particleColor="#00ff00"
            speed={0.3}
          />
        </div>
        <div className="absolute inset-0 opacity-40">
          <SparklesCore
            id="tsparticles-blue"
            background="transparent"
            minSize={0.2}
            maxSize={0.6}
            particleDensity={60}
            className="w-full h-full"
            particleColor="#3b82f6"
            speed={0.4}
          />
        </div>
        <div className="absolute inset-0 opacity-50">
          <SparklesCore
            id="tsparticles-pink"
            background="transparent"
            minSize={0.25}
            maxSize={0.7}
            particleDensity={50}
            className="w-full h-full"
            particleColor="#ec4899"
            speed={0.35}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="w-full border-b border-slate-800/50 bg-black/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Allergy Safety Checker
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl">
              Check menu items for allergens and get modification suggestions
            </p>
          </div>
        </div>

      {(selectedAllergies.size > 0 || customAllergies.size > 0 || selectedDishId) && (
        <div className="sticky top-0 z-50 w-full border-b bg-black/80 backdrop-blur-md border-slate-800/50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(selectedAllergies.size > 0 || customAllergies.size > 0) && (
                <>
                  <span className="text-sm text-slate-300 font-medium">Selected:</span>
                  {Array.from(selectedAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="px-3 py-1 text-sm font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/50"
                    >
                      {ALLERGEN_LABELS[allergen]}
                    </span>
                  ))}
                  {Array.from(customAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="px-3 py-1 text-sm font-medium rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/50"
                    >
                      {allergen}
                    </span>
                  ))}
                </>
              )}
              {selectedDish && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-500/20 text-red-300 border border-red-500/50">
                  {selectedDish.dish_name}
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
                className="relative px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors border border-slate-600"
                onClick={() => {
                  setSelectedDishId('');
                  setSelectedAllergies(new Set());
                  setCustomAllergies(new Set());
                  setCustomAllergenInput('');
                  setSearchTerm('');
                  setShowResults(false);
                  setShowSuggestions(false);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Step Indicator */}
        <div className="container mx-auto px-4">
          <ProgressIndicator
            currentStep={
              showResults
                ? 3
                : selectedDishId
                ? 2
                : (selectedAllergies.size > 0 || customAllergies.size > 0)
                ? 1
                : 1
            }
          />
        </div>

        <div className="container mx-auto px-4 pb-12">
          <Card className="mb-6 border-amber-500/50 bg-amber-500/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-200">
                <strong>Disclaimer:</strong> This is an unofficial internal helper based on our ingredient book. For severe allergies, ALWAYS confirm with the chef/manager and follow full allergy protocol.
              </p>
            </CardContent>
          </Card>

        <Card className="mb-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">1. Select Dish</CardTitle>
            <CardDescription className="text-slate-300">Search for a dish by name, ticket code, or category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    }
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                className="w-full px-4 py-3 border-2 border-slate-700 rounded-lg bg-slate-800/50 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {showSuggestions && filteredDishes.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 border-2 border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredDishes.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-3 cursor-pointer transition-colors",
                        index === highlightedIndex
                          ? "bg-blue-600/30 border-l-4 border-blue-500"
                          : "hover:bg-slate-700/50"
                      )}
                      onClick={() => {
                        setSelectedDishId(item.id);
                        setSearchTerm(item.dish_name);
                        setShowSuggestions(false);
                        setHighlightedIndex(-1);
                        setShowResults(false);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="font-medium text-white">{item.dish_name}</div>
                      {item.ticket_code && (
                        <div className="text-sm text-slate-300">{item.ticket_code}</div>
                      )}
                      <div className="text-xs text-slate-400">{item.category}</div>
                    </div>
                  ))}
                </div>
              )}
              {showSuggestions && searchTerm.trim() && filteredDishes.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 border-2 border-slate-700 rounded-lg shadow-lg p-3">
                  <div className="text-slate-400 italic">No dishes found matching "{searchTerm}"</div>
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
              className="w-full px-4 py-3 border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/50 text-white"
            >
              <option value="">-- Or select from dropdown --</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.dish_name} {item.ticket_code && `(${item.ticket_code})`}
                </option>
              ))}
            </select>
            {selectedDish && (
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="font-semibold text-white">{selectedDish.dish_name}</div>
                {selectedDish.ticket_code && (
                  <div className="text-sm text-slate-300 mt-1">Ticket: {selectedDish.ticket_code}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">2. Select Allergies (one or more)</CardTitle>
            <CardDescription className="text-slate-300">Choose from common allergens or add a custom one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ALL_ALLERGENS.map((allergen) => (
                <label
                  key={allergen}
                  className={cn(
                    "flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
                    selectedAllergies.has(allergen)
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 bg-slate-800/30"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedAllergies.has(allergen)}
                    onChange={() => {
                      handleAllergyToggle(allergen);
                      setShowResults(false);
                    }}
                    className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className={cn(
                    "font-medium text-sm",
                    selectedAllergies.has(allergen) ? "text-blue-300" : "text-slate-300"
                  )}>
                    {ALLERGEN_LABELS[allergen]}
                  </span>
                </label>
              ))}
            </div>
            
            <div className="pt-4 border-t border-slate-700">
              <label htmlFor="custom-allergen-input" className="block text-sm font-medium text-slate-300 mb-3">
                Or add a custom allergen:
              </label>
              <div className="flex gap-3">
                <input
                  id="custom-allergen-input"
                  type="text"
                  placeholder="Type allergen name (e.g., 'cilantro', 'mushrooms', 'peppers')..."
                  value={customAllergenInput}
                  onChange={(e) => setCustomAllergenInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomAllergen();
                    }
                  }}
                  className="flex-1 px-4 py-2 border-2 border-slate-700 rounded-lg bg-slate-800/50 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="relative">
                  <GlowingEffect
                    spread={30}
                    glow={true}
                    disabled={!customAllergenInput.trim()}
                    proximity={64}
                    inactiveZone={0.3}
                    borderWidth={2}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAllergen}
                    disabled={!customAllergenInput.trim()}
                    className="relative px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors border border-purple-700"
                  >
                    Add
                  </button>
                </div>
              </div>
              {customAllergies.size > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {Array.from(customAllergies).map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/50"
                    >
                      {allergen}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomAllergen(allergen)}
                        className="w-5 h-5 rounded-full hover:bg-purple-500/30 flex items-center justify-center transition-colors text-purple-300"
                        aria-label={`Remove ${allergen}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="relative">
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={!selectedDish || (selectedAllergies.size === 0 && customAllergies.size === 0)}
            proximity={80}
            inactiveZone={0.2}
            borderWidth={3}
          />
          <button
            onClick={handleCheckSafety}
            disabled={!selectedDish || (selectedAllergies.size === 0 && customAllergies.size === 0)}
            className={cn(
              "relative w-full py-4 px-6 text-lg font-semibold rounded-lg transition-all border-2",
              !selectedDish || (selectedAllergies.size === 0 && customAllergies.size === 0)
                ? "bg-slate-300 text-slate-500 cursor-not-allowed border-slate-400"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border-blue-700"
            )}
          >
            Check Safety
          </button>
        </div>

        {result && showResults && (
          <div className="mt-8 space-y-6">
            <Card
              className={cn(
                "border-2 bg-slate-900/50 backdrop-blur-sm",
                result.overallStatus === 'safe'
                  ? "border-green-500/50 bg-green-500/10"
                  : "border-red-500/50 bg-red-500/10"
              )}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <h2
                    className={cn(
                      "text-2xl font-bold mb-2",
                      result.overallStatus === 'safe' ? "text-green-300" : "text-red-300"
                    )}
                  >
                    {getStatusText(result.overallStatus)}
                  </h2>
                  <p
                    className={cn(
                      "text-lg",
                      result.overallStatus === 'safe' ? "text-green-200" : "text-red-200"
                    )}
                  >
                    {result.globalMessage}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">{result.dish.dish_name}</CardTitle>
                {result.dish.ticket_code && (
                  <CardDescription className="text-slate-300">Ticket Code: {result.dish.ticket_code}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">

                {result.perAllergy.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Allergy Details</h3>
                    {result.perAllergy.map((item, idx) => {
                      const isCustomAllergen = typeof item.allergen === 'string' && !(item.allergen in ALLERGEN_LABELS);
                      const allergenLabel = isCustomAllergen
                        ? item.allergen
                        : ALLERGEN_LABELS[item.allergen as Allergen] || item.allergen;
                      
                      return (
                        <Card
                          key={idx}
                          className={cn(
                            "border-l-4 bg-slate-800/50 backdrop-blur-sm border-slate-700/50",
                            item.status === 'safe' ? "border-l-green-500" : "border-l-red-500"
                          )}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                              <strong className="text-lg text-white">{allergenLabel}</strong>
                              <span
                                className={cn(
                                  "px-3 py-1 rounded-full text-xs font-bold uppercase",
                                  item.status === 'safe'
                                    ? "bg-green-500/20 text-green-300 border border-green-500/50"
                                    : "bg-red-500/20 text-red-300 border border-red-500/50"
                                )}
                              >
                                {item.status === 'safe' ? 'SAFE' : 'UNSAFE'}
                              </span>
                            </div>
                            <p className="text-slate-300 mb-4">
                              {item.contains
                                ? `This dish contains ${allergenLabel.toLowerCase()}.`
                                : `This dish does not contain ${allergenLabel.toLowerCase()}.`}
                            </p>
                            {item.foundIngredients && item.foundIngredients.length > 0 && (
                              <div className="mb-4 pt-4 border-t border-slate-700">
                                <strong className="block text-sm font-semibold text-white mb-2">
                                  Identified ingredients containing {allergenLabel}:
                                </strong>
                                <ul className="list-disc list-inside space-y-1">
                                  {item.foundIngredients.map((ingredient, ingIdx) => (
                                    <li key={ingIdx} className="text-sm text-red-400">
                                      <em>{ingredient}</em>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.status === 'unsafe' && item.substitutions.length > 0 && (
                              <div className="pt-4 border-t border-slate-700">
                                <strong className="block text-sm font-semibold text-white mb-2">
                                  Suggested modifications:
                                </strong>
                                <ul className="list-disc list-inside space-y-1">
                                  {item.substitutions.map((sub, subIdx) => (
                                    <li key={subIdx} className="text-sm text-slate-300">{sub}</li>
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

                {result.perAllergy.some(item => item.status === 'unsafe' && item.substitutions.length > 0) && (
                  <Card className="border-amber-500/50 bg-amber-500/10 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-amber-200">Quick Reference - All Substitutions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {result.perAllergy
                          .filter(item => item.status === 'unsafe')
                          .flatMap(item => 
                            item.substitutions.map((sub, idx) => (
                              <li key={`${item.allergen}-${idx}`} className="text-amber-200">{sub}</li>
                            ))
                          )}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {result.dish.notes && result.dish.notes.trim() !== '' && (
                  <Card className="border-blue-500/50 bg-blue-500/10 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <strong className="block text-sm font-semibold text-blue-200 mb-2">
                        Additional Notes:
                      </strong>
                      <p className="text-blue-300">{result.dish.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

