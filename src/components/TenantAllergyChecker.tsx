/**
 * Tenant Allergy Checker Component
 * Uses TenantPack data for allergen checking instead of hardcoded data
 */

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Info,
  Search,
  ShieldCheck,
  ChevronLeft,
  Settings,
  Wifi,
  WifiOff,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react';
import type {
  TenantPack,
  TenantContext,
  MenuItem,
  RuleStatus,
  AllergenDef,
} from '@/core/tenant';
import {
  checkAllergens,
  getItemsByCategory,
  searchItems,
  type CheckerResult,
} from '@/core/checker';

// ============================================================================
// Props
// ============================================================================

interface TenantAllergyCheckerProps {
  pack: TenantPack;
  tenantContext: TenantContext;
  isOffline: boolean;
  isUsingCache: boolean;
  onOpenSettings: () => void;
}

// ============================================================================
// Constants
// ============================================================================

// Step definitions
type Step = 'allergies' | 'dish' | 'dressing' | 'protein' | 'sides' | 'crust' | 'results';

// Dressing option type (for salads)
interface DressingOption {
  id: string;
  name: string;
  allergenRules: Record<string, { status: string; substitutions: string[]; notes: string | null }>;
}

// Protein option type (for salads)
interface ProteinOption {
  id: string;
  name: string;
  ticketCode: string;
  allergenRules: Record<string, { status: string; substitutions: string[]; notes: string | null }>;
}

const DISCLAIMER_TEXT =
  'This tool is an internal helper based on our ingredient book. It may not capture all cross-contact or kitchen changes.';
const ALWAYS_VERIFY_TEXT =
  'Always verify with restaurant staff. Cross-contact may occur.';

// Category icons (use pack icons if available, fallback to these)
const CATEGORY_ICONS: Record<string, string> = {
  appetizers: '🍤',
  salads: '🥗',
  fresh_seafood: '🐟',
  sandwiches: '🍔',
  steaks: '🥩',
  prime_rib: '🥩',
  chicken: '🍗',
  ribs: '🍖',
  nightly: '🌙',
  desserts: '🍰',
  sides: '🥔',
  kids: '👶',
  brunch: '🍳',
  specials: '⭐',
};

// ============================================================================
// Component
// ============================================================================

export function TenantAllergyChecker({
  pack,
  tenantContext,
  isOffline,
  isUsingCache,
  onOpenSettings,
}: TenantAllergyCheckerProps) {
  // ========== State ==========
  const [currentStep, setCurrentStep] = useState<Step>('allergies');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAllergenText, setCustomAllergenText] = useState('');
  const [customIngredientSearch, setCustomIngredientSearch] = useState('');
  const [selectedCustomIngredients, setSelectedCustomIngredients] = useState<string[]>([]);
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<ProteinOption | null>(null);
  const [selectedDressing, setSelectedDressing] = useState<DressingOption | null>(null);
  const [selectedSide, setSelectedSide] = useState<MenuItem | null>(null);
  const [selectedCrust, setSelectedCrust] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(
    localStorage.getItem('wildfire_disclaimer_accepted') === 'true'
  );
  const [showDisclaimer, setShowDisclaimer] = useState(!disclaimerAccepted);


  // ========== Computed ==========
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchItems(pack, searchQuery).slice(0, 20);
  }, [pack, searchQuery]);


  const categoryItems = useMemo(() => {
    if (!selectedCategory) return [];
    return getItemsByCategory(pack, selectedCategory);
  }, [pack, selectedCategory]);

  // Get all available ingredients for autocomplete (from pack)
  const allIngredients = useMemo(() => {
    // Combine ingredients and garnishes into one searchable list
    const ingredients = pack.allIngredients || [];
    const garnishes = pack.allGarnishes || [];
    return [...new Set([...ingredients, ...garnishes])].sort();
  }, [pack]);

  // Get ingredient groups from pack (for smart search)
  const ingredientGroups = useMemo(() => {
    return (pack as any).ingredientGroups || {};
  }, [pack]);

  // Filter ingredients based on search - with ingredient group support
  const filteredIngredients = useMemo(() => {
    if (!customIngredientSearch.trim()) return [];
    const search = customIngredientSearch.toLowerCase();
    
    // Results will include both specific ingredients AND group matches
    const results: Array<{ type: 'specific' | 'group'; name: string; ingredients: string[] }> = [];
    
    // 1. Check for group matches (e.g., "tomato" matches tomato group)
    for (const [groupName, groupIngredients] of Object.entries(ingredientGroups)) {
      if (groupName.includes(search) && (groupIngredients as string[]).length > 0) {
        const unselectedIngredients = (groupIngredients as string[]).filter(
          ing => !selectedCustomIngredients.includes(ing)
        );
        if (unselectedIngredients.length > 0) {
          results.push({
            type: 'group',
            name: groupName,
            ingredients: unselectedIngredients,
          });
        }
      }
    }
    
    // 2. Also include specific ingredient matches
    const specificMatches = allIngredients
      .filter(ing => ing.toLowerCase().includes(search))
      .filter(ing => !selectedCustomIngredients.includes(ing));
    
    for (const ing of specificMatches) {
      // Don't duplicate if already in a group result
      const alreadyInGroup = results.some(r => 
        r.type === 'group' && r.ingredients.includes(ing)
      );
      if (!alreadyInGroup) {
        results.push({ type: 'specific', name: ing, ingredients: [ing] });
      }
    }
    
    return results.slice(0, 15);
  }, [allIngredients, ingredientGroups, customIngredientSearch, selectedCustomIngredients]);

  const checkerResult: CheckerResult | null = useMemo(() => {
    // Allow checking with either allergens OR custom ingredients
    if (!selectedItem || (selectedAllergens.length === 0 && selectedCustomIngredients.length === 0)) return null;

    try {
      const result = checkAllergens(pack, {
        allergenIds: selectedAllergens,
        itemId: selectedItem.id,
        sideId: selectedSide?.id,
        crustId: selectedCrust || undefined,
        dressingId: selectedDressing?.id,  // Pass dressing for ingredient checking
        customAllergenText: customAllergenText.trim() || undefined,
        customIngredients: selectedCustomIngredients.length > 0 ? selectedCustomIngredients : undefined,
      });

      // If dressing is selected, combine its allergen rules with the result
      if (selectedDressing && result) {
        for (const allergenResult of result.mainItem.perAllergen) {
          const dressingRule = selectedDressing.allergenRules[allergenResult.allergenId];
          if (dressingRule) {
            if (dressingRule.status === 'UNSAFE') {
              // If dressing is unsafe for this allergen, mark overall as unsafe
              allergenResult.status = 'UNSAFE';
              allergenResult.notes = [...allergenResult.notes, `${selectedDressing.name}: ${dressingRule.notes || 'Contains this allergen'}`];
            }
          }
        }
      }

      // If protein is selected, combine its allergen rules with the result
      if (selectedProtein && result) {
        for (const allergenResult of result.mainItem.perAllergen) {
          const proteinRule = selectedProtein.allergenRules[allergenResult.allergenId];
          if (proteinRule) {
            // If protein has modifications, add them
            if (proteinRule.status === 'MODIFIABLE' && proteinRule.substitutions.length > 0) {
              // Add protein mods to the substitutions
              const proteinMods = proteinRule.substitutions.map(s => `(${selectedProtein.name}) ${s}`);
              allergenResult.substitutions = [...allergenResult.substitutions, ...proteinMods];
              // If main dish was SAFE, protein makes it MODIFIABLE
              if (allergenResult.status === 'SAFE') {
                allergenResult.status = 'MODIFIABLE';
              }
            } else if (proteinRule.status === 'UNSAFE') {
              // If protein is unsafe for this allergen, mark overall as unsafe
              allergenResult.status = 'UNSAFE';
              allergenResult.notes = [...allergenResult.notes, `${selectedProtein.name} is not safe for this allergen`];
            }
          }
        }
      }

      // Recalculate overall status AND main item status (after dressing and protein)
      if ((selectedDressing || selectedProtein) && result) {
        const statuses = result.mainItem.perAllergen.map(pa => pa.status);
        if (statuses.includes('UNSAFE') || statuses.includes('NOT_SAFE_NOT_IN_SHEET')) {
          result.overallStatus = 'UNSAFE';
          result.mainItem.status = 'UNSAFE';
          // Clear substitutions when unsafe - don't show modifications
          result.mainItem.perAllergen = result.mainItem.perAllergen.map(pa => ({ ...pa, substitutions: [] }));
        } else if (statuses.includes('VERIFY_WITH_KITCHEN')) {
          result.overallStatus = 'VERIFY_WITH_KITCHEN';
          result.mainItem.status = 'VERIFY_WITH_KITCHEN';
        } else if (statuses.includes('MODIFIABLE')) {
          result.overallStatus = 'MODIFIABLE';
          result.mainItem.status = 'MODIFIABLE';
        } else {
          result.overallStatus = 'SAFE';
          result.mainItem.status = 'SAFE';
        }
      }

      return result;
    } catch (error) {
      console.error('Checker error:', error);
      return null;
    }
  }, [pack, selectedItem, selectedDressing, selectedProtein, selectedSide, selectedCrust, selectedAllergens, customAllergenText, selectedCustomIngredients]);

  // ========== Handlers ==========
  const handleAcceptDisclaimer = () => {
    localStorage.setItem('wildfire_disclaimer_accepted', 'true');
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
  };

  const handleAllergenToggle = (allergenId: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergenId)
        ? prev.filter((a) => a !== allergenId)
        : [...prev, allergenId]
    );
  };

  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    // Check for dressing options (salads) - dressing comes first
    const dressingOptions = (item as any).dressingOptions;
    
    // If item has dressing options, go to dressing step (no separate flag needed)
    if (dressingOptions && dressingOptions.length > 0) {
      setCurrentStep('dressing');
    } else {
      // Check for protein options (salads without dressing options)
      const proteinOptions = (item as any).proteinOptions;
      if (proteinOptions && proteinOptions.length > 0) {
        setCurrentStep('protein');
      } else if (item.isEntree && item.sides && item.sides.length > 0) {
        setCurrentStep('sides');
      } else if (item.requiresCrust && item.crustOptions && item.crustOptions.length > 0) {
        setCurrentStep('crust');
      } else {
        setCurrentStep('results');
      }
    }
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleSelectDressing = (dressing: DressingOption) => {
    setSelectedDressing(dressing);
    // After dressing, check for protein options
    const proteinOptions = (selectedItem as any)?.proteinOptions;
    if (proteinOptions && proteinOptions.length > 0) {
      setCurrentStep('protein');
    } else if (selectedItem?.isEntree && selectedItem?.sides && selectedItem.sides.length > 0) {
      setCurrentStep('sides');
    } else if (selectedItem?.requiresCrust && selectedItem?.crustOptions && selectedItem.crustOptions.length > 0) {
      setCurrentStep('crust');
    } else {
      setCurrentStep('results');
    }
  };

  const handleSelectProtein = (protein: ProteinOption | null) => {
    setSelectedProtein(protein);
    // After protein, check for sides or crust, otherwise go to results
    if (selectedItem?.isEntree && selectedItem?.sides && selectedItem.sides.length > 0) {
      setCurrentStep('sides');
    } else if (selectedItem?.requiresCrust && selectedItem?.crustOptions && selectedItem.crustOptions.length > 0) {
      setCurrentStep('crust');
    } else {
      setCurrentStep('results');
    }
  };

  const handleSelectSide = (sideId: string | null) => {
    const side = sideId ? pack.items.find((i) => i.id === sideId) : null;
    setSelectedSide(side || null);
    
    if (selectedItem?.requiresCrust && selectedItem.crustOptions && selectedItem.crustOptions.length > 0) {
      setCurrentStep('crust');
    } else {
      setCurrentStep('results');
    }
  };

  const handleSelectCrust = (crustId: string | null) => {
    setSelectedCrust(crustId);
    setCurrentStep('results');
  };

  const handleBack = () => {
    const proteinOptions = (selectedItem as any)?.proteinOptions;
    const hasProteinOptions = proteinOptions && proteinOptions.length > 0;
    const dressingOptions = (selectedItem as any)?.dressingOptions;
    const hasDressingOptions = dressingOptions && dressingOptions.length > 0;
    
    switch (currentStep) {
      case 'dish':
        setCurrentStep('allergies');
        break;
      case 'dressing':
        setCurrentStep('dish');
        setSelectedItem(null);
        setSelectedDressing(null);
        break;
      case 'protein':
        if (hasDressingOptions) {
          setCurrentStep('dressing');
          setSelectedDressing(null);
        } else {
          setCurrentStep('dish');
          setSelectedItem(null);
        }
        setSelectedProtein(null);
        break;
      case 'sides':
        if (hasProteinOptions) {
          setCurrentStep('protein');
          setSelectedProtein(null);
        } else if (hasDressingOptions) {
          setCurrentStep('dressing');
          setSelectedDressing(null);
        } else {
          setCurrentStep('dish');
          setSelectedItem(null);
        }
        break;
      case 'crust':
        if (selectedItem?.isEntree) {
          setCurrentStep('sides');
        } else if (hasProteinOptions) {
          setCurrentStep('protein');
          setSelectedProtein(null);
        } else if (hasDressingOptions) {
          setCurrentStep('dressing');
          setSelectedDressing(null);
        } else {
          setCurrentStep('dish');
          setSelectedItem(null);
        }
        break;
      case 'results':
        if (selectedItem?.requiresCrust) {
          setCurrentStep('crust');
        } else if (selectedItem?.isEntree) {
          setCurrentStep('sides');
        } else if (hasProteinOptions) {
          setCurrentStep('protein');
          setSelectedProtein(null);
        } else if (hasDressingOptions) {
          setCurrentStep('dressing');
          setSelectedDressing(null);
        } else {
          setCurrentStep('dish');
          setSelectedItem(null);
        }
        break;
    }
  };

  const handleStartOver = () => {
    setCurrentStep('allergies');
    setSelectedAllergens([]);
    setCustomAllergenText('');
    setSelectedCustomIngredients([]);
    setCustomIngredientSearch('');
    setShowAllIngredients(false);
    setSelectedItem(null);
    setSelectedDressing(null);
    setSelectedProtein(null);
    setSelectedSide(null);
    setSelectedCrust(null);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleContinue = () => {
    if (currentStep === 'allergies' && (selectedAllergens.length > 0 || selectedCustomIngredients.length > 0 || showAllIngredients)) {
      setCurrentStep('dish');
    }
  };

  // ========== Disclaimer Modal ==========
  if (showDisclaimer) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background */}
        <div 
          className="fixed inset-0"
          style={{
            background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 25%, #141414 50%, #0d0d0d 75%, #080808 100%)',
          }}
        />
        <div className="relative max-w-md w-full bg-white/5 rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Important Notice</h2>
          </div>
          <p className="text-white/60 mb-4 leading-relaxed text-sm">{DISCLAIMER_TEXT}</p>
          <p className="text-amber-400 font-medium mb-6 text-sm">{ALWAYS_VERIFY_TEXT}</p>
          <button
            onClick={handleAcceptDisclaimer}
            className="w-full py-4 bg-white hover:bg-white/90 text-gray-900 rounded-xl font-semibold transition-all shadow-lg shadow-white/20"
          >
            I Understand
          </button>
        </div>
      </div>
    );
  }

  // ========== Render ==========
  return (
    <div className="min-h-screen relative">
      {/* Background - Dark neutral gradient */}
      <div 
        className="fixed inset-0"
        style={{
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 25%, #141414 50%, #0d0d0d 75%, #080808 100%)',
        }}
      />
      {/* Subtle glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl" />
      </div>
      
      {/* Header - Modern glass */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-black/20 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/20">
              <ShieldCheck className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Allergy Safety Checker</h1>
              <p className="text-xs text-white/50">
                {tenantContext.conceptName} • {tenantContext.locationName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Connection status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              {isOffline ? (
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {isUsingCache && (
                <span className="text-amber-400 text-xs font-medium">cached</span>
              )}
            </div>
            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Settings className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="relative max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center justify-center gap-3">
          {['allergies', 'dish', 'results'].map((step, idx) => {
            const stepIdx = ['allergies', 'dish', 'results'].indexOf(step);
            const currentIdx = ['allergies', 'dish', 'protein', 'sides', 'crust', 'results'].indexOf(currentStep);
            const stepTargetIdx = step === 'results' ? 5 : stepIdx;
            const isActive = currentStep === step || 
              (step === 'dish' && ['dish', 'protein', 'sides', 'crust'].includes(currentStep));
            const isPast = currentIdx > stepTargetIdx;

            return (
              <div key={step} className="flex items-center gap-3">
                {idx > 0 && (
                  <div className={cn(
                    'w-12 h-0.5 rounded-full transition-colors',
                    isPast ? 'bg-white' : 'bg-white/10'
                  )} />
                )}
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300',
                    isActive && 'bg-white text-gray-900 shadow-lg shadow-white/20',
                    isPast && 'bg-white text-gray-900',
                    !isActive && !isPast && 'bg-white/5 border border-white/10 text-white/40'
                  )}
                >
                  {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="relative max-w-4xl mx-auto px-6 pb-12">
        {/* Back button */}
        {currentStep !== 'allergies' && (
          <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}

        {/* Step: Allergies */}
        {currentStep === 'allergies' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-3">
                Select Allergies
              </h2>
              <p className="text-white/50 text-base">
                Choose all allergies that apply to this guest
              </p>
            </div>

            {/* Allergen grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {pack.allergens.map((allergen) => {
                const isSelected = selectedAllergens.includes(allergen.id);
                return (
                  <button
                    key={allergen.id}
                    onClick={() => handleAllergenToggle(allergen.id)}
                    className={cn(
                      'relative p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-2.5',
                      'hover:scale-[1.02] active:scale-[0.98]',
                      isSelected
                        ? 'bg-white/20 border-white/40 shadow-lg shadow-white/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <Check className="w-3 h-3 text-gray-900" strokeWidth={3} />
                      </div>
                    )}
                    <span className="text-3xl">{allergen.icon}</span>
                    <span className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-white' : 'text-white/70'
                    )}>{allergen.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom ingredient search with autocomplete */}
            <div className="max-w-md mx-auto">
              <label className="block text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
                Check for specific ingredient (optional)
              </label>
              
              {/* Show All Ingredients mode pill */}
              {showAllIngredients && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-sm font-medium">
                    📋 Show All Ingredients
                    <button
                      onClick={() => setShowAllIngredients(false)}
                      className="hover:text-red-300 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                </div>
              )}
              
              {/* Selected ingredients pills */}
              {selectedCustomIngredients.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedCustomIngredients.map(ing => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-white text-sm font-medium"
                    >
                      {ing}
                      <button
                        onClick={() => setSelectedCustomIngredients(prev => prev.filter(i => i !== ing))}
                        className="hover:text-red-300 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Search input with dropdown */}
              <div className="relative">
                <input
                  type="text"
                  value={customIngredientSearch}
                  onChange={(e) => {
                    setCustomIngredientSearch(e.target.value);
                    setShowIngredientDropdown(true);
                  }}
                  onFocus={() => setShowIngredientDropdown(true)}
                  onBlur={() => setTimeout(() => setShowIngredientDropdown(false), 200)}
                  placeholder={allIngredients.length > 0 ? "Search ingredients..." : "No ingredient data available"}
                  disabled={allIngredients.length === 0}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all text-base disabled:opacity-50"
                />
                
                {/* Autocomplete dropdown with group support */}
                {showIngredientDropdown && filteredIngredients.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/20 rounded-xl overflow-hidden shadow-xl max-h-80 overflow-y-auto">
                    {filteredIngredients.map((item, idx) => (
                      <button
                        key={`${item.type}-${item.name}-${idx}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          // Add all ingredients from this result (group or single)
                          setSelectedCustomIngredients(prev => [...prev, ...item.ingredients]);
                          setCustomIngredientSearch('');
                          setShowIngredientDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                      >
                        {item.type === 'group' ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400 font-semibold capitalize">{item.name}</span>
                              <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded">
                                {item.ingredients.length} items
                              </span>
                            </div>
                            <div className="text-xs text-white/50 mt-1 truncate">
                              {item.ingredients.slice(0, 3).join(', ')}
                              {item.ingredients.length > 3 && ` +${item.ingredients.length - 3} more`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-white">{item.name}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Show message if searching but no results */}
                {showIngredientDropdown && customIngredientSearch.trim() && filteredIngredients.length === 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/20 rounded-xl overflow-hidden shadow-xl">
                    <div className="px-4 py-3 text-white/50 text-sm">
                      No matching ingredients found
                    </div>
                  </div>
                )}
              </div>
              
              {allIngredients.length > 0 && (
                <p className="text-xs text-white/30 mt-2">
                  {allIngredients.length} ingredients available to search
                </p>
              )}
              
              {/* View Ingredients Button - separate from allergy check */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/40 mb-2 text-center">
                  Or view full ingredient list of a dish
                </p>
                <button
                  onClick={() => {
                    setShowAllIngredients(true);
                    setSelectedAllergens([]);
                    setSelectedCustomIngredients([]);
                  }}
                  className={cn(
                    'w-full py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2',
                    showAllIngredients
                      ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Info className="w-4 h-4" />
                  {showAllIngredients ? 'Ingredient View Mode Active' : 'View Dish Ingredients'}
                </button>
                {showAllIngredients && (
                  <button
                    onClick={() => setShowAllIngredients(false)}
                    className="w-full mt-2 py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
                  >
                    Cancel and return to allergy check
                  </button>
                )}
              </div>
            </div>

            {/* Continue button */}
            <div className="pt-2">
              <button
                onClick={handleContinue}
                disabled={selectedAllergens.length === 0 && selectedCustomIngredients.length === 0 && !showAllIngredients}
                className={cn(
                  'w-full max-w-md mx-auto block py-4 px-6 text-base font-semibold rounded-xl transition-all duration-200',
                  (selectedAllergens.length > 0 || selectedCustomIngredients.length > 0 || showAllIngredients)
                    ? 'bg-white text-gray-900 hover:bg-white/90 shadow-lg shadow-white/20'
                    : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                )}
              >
                {showAllIngredients ? 'View Ingredients' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Dish */}
        {currentStep === 'dish' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-3">Select Dish</h2>
              <p className="text-white/50 text-base">
                Search or browse by category
              </p>
            </div>

            {/* Search */}
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes..."
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all text-base"
                />
              </div>

              {/* Search results */}
              {searchQuery && searchResults.length > 0 && (
                <div className="mt-3 space-y-2">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {pack.categories.find((c) => c.id === item.categoryId)?.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category grid */}
            {!searchQuery && !selectedCategory && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {pack.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white transition-all hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
                  >
                    <span className="text-3xl mb-2 block">
                      {category.icon || CATEGORY_ICONS[category.id] || '📋'}
                    </span>
                    <span className="font-medium text-sm block text-white/90">{category.name}</span>
                    <span className="text-xs text-white/40 block mt-0.5">
                      {getItemsByCategory(pack, category.id).length} items
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Items in category */}
            {!searchQuery && selectedCategory && (
              <div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mb-4 flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-medium">Back to categories</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {categoryItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <p className="text-white font-medium">{item.name}</p>
                      {item.ticketCode && (
                        <p className="text-xs text-white/40 mt-0.5">{item.ticketCode}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Dressing (for salads) */}
        {currentStep === 'dressing' && selectedItem && (selectedItem as any).dressingOptions && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-3">Select Dressing</h2>
              <p className="text-white/50 text-base">
                Choose a dressing for {selectedItem.name}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {((selectedItem as any).dressingOptions as DressingOption[]).map((dressing) => {
                // Check if this dressing is safe for all selected allergens
                const unsafeAllergens = selectedAllergens.filter(allergenId => {
                  const rule = dressing.allergenRules[allergenId];
                  return rule && rule.status === 'UNSAFE';
                });
                const isSafe = unsafeAllergens.length === 0;
                
                return (
                  <button
                    key={dressing.id}
                    onClick={() => handleSelectDressing(dressing)}
                    className={cn(
                      'p-4 border rounded-xl transition-all text-left',
                      isSafe
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-white">{dressing.name}</div>
                      {!isSafe && (
                        <div className="flex items-center gap-1 text-red-400 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Contains allergen</span>
                        </div>
                      )}
                      {isSafe && dressing.id !== 'no_dressing' && (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs">
                          <Check className="w-3 h-3" />
                          <span>Safe</span>
                        </div>
                      )}
                    </div>
                    {!isSafe && (
                      <div className="text-xs text-red-400/70 mt-1">
                        {unsafeAllergens.map(a => {
                          const allergen = pack.allergens.find(al => al.id === a);
                          return allergen?.name || a;
                        }).join(', ')}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Protein (for salads) */}
        {currentStep === 'protein' && selectedItem && (selectedItem as any).proteinOptions && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-3">Add Protein?</h2>
              <p className="text-white/50 text-base">
                Optional: Add protein to your {selectedItem.name}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {((selectedItem as any).proteinOptions as ProteinOption[]).map((protein) => (
                <button
                  key={protein.id}
                  onClick={() => handleSelectProtein(protein)}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left"
                >
                  <div className="font-medium text-white">{protein.name}</div>
                  <div className="text-xs text-white/40 mt-0.5">{protein.ticketCode}</div>
                </button>
              ))}
              <button
                onClick={() => handleSelectProtein(null)}
                className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-white/40 hover:bg-white/5 hover:border-white/10 transition-all text-left"
              >
                <div className="font-medium">No Protein</div>
                <div className="text-xs mt-0.5">Skip protein add-on</div>
              </button>
            </div>
          </div>
        )}

        {/* Step: Sides */}
        {currentStep === 'sides' && selectedItem?.sides && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-3">Select Side</h2>
              <p className="text-white/50 text-base">
                Choose a side for {selectedItem.name}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
              {selectedItem.sides.map((side) => (
                <button
                  key={side.id}
                  onClick={() => handleSelectSide(side.id)}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  {side.name}
                </button>
              ))}
              <button
                onClick={() => handleSelectSide(null)}
                className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-white/40 font-medium text-sm hover:bg-white/5 hover:border-white/10 transition-all"
              >
                No side
              </button>
            </div>
          </div>
        )}

        {/* Step: Crust */}
        {currentStep === 'crust' && selectedItem?.crustOptions && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-3">Select Crust</h2>
              <p className="text-white/50 text-base">
                Choose a crust for {selectedItem.name}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
              {selectedItem.crustOptions.map((crust) => (
                <button
                  key={crust.id}
                  onClick={() => handleSelectCrust(crust.id)}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  {crust.name}
                </button>
              ))}
              <button
                onClick={() => handleSelectCrust(null)}
                className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-white/40 font-medium text-sm hover:bg-white/5 hover:border-white/10 transition-all"
              >
                No crust
              </button>
            </div>
          </div>
        )}

        {/* Step: Results */}
        {currentStep === 'results' && showAllIngredients && selectedItem && (
          <IngredientsView
            item={selectedItem}
            dressing={selectedDressing}
            pack={pack}
            onStartOver={handleStartOver}
          />
        )}
        {currentStep === 'results' && !showAllIngredients && checkerResult && (
          <ResultsView
            result={checkerResult}
            selectedAllergens={pack.allergens.filter((a) =>
              selectedAllergens.includes(a.id)
            )}
            selectedDressing={selectedDressing}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Results View - Modern Light Design
// ============================================================================

interface ResultsViewProps {
  result: CheckerResult;
  selectedAllergens: AllergenDef[];
  selectedDressing: DressingOption | null;
  onStartOver: () => void;
}

function ResultsView({ result, selectedAllergens, selectedDressing, onStartOver }: ResultsViewProps) {
  const statusConfig: Record<
    RuleStatus,
    { 
      cardBg: string;
      cardBorder: string;
      iconBg: string;
      iconColor: string;
      titleColor: string;
      subtitleColor: string;
      icon: React.ReactNode; 
      title: string;
      subtitle: string;
    }
  > = {
    SAFE: {
      cardBg: 'bg-emerald-500/20',
      cardBorder: 'border-emerald-400/30',
      iconBg: 'bg-emerald-500',
      iconColor: 'text-white',
      titleColor: 'text-emerald-300',
      subtitleColor: 'text-emerald-300/70',
      icon: <Check className="w-7 h-7" strokeWidth={2.5} />,
      title: 'Ready to Serve',
      subtitle: 'All dietary requirements met',
    },
    MODIFIABLE: {
      cardBg: 'bg-amber-500/20',
      cardBorder: 'border-amber-400/30',
      iconBg: 'bg-amber-500',
      iconColor: 'text-white',
      titleColor: 'text-amber-300',
      subtitleColor: 'text-amber-300/70',
      icon: <AlertTriangle className="w-7 h-7" strokeWidth={2} />,
      title: 'Modifications Needed',
      subtitle: 'Review preparation notes below',
    },
    VERIFY_WITH_KITCHEN: {
      cardBg: 'bg-amber-500/20',
      cardBorder: 'border-amber-400/30',
      iconBg: 'bg-amber-500',
      iconColor: 'text-white',
      titleColor: 'text-amber-300',
      subtitleColor: 'text-amber-300/70',
      icon: <AlertTriangle className="w-7 h-7" strokeWidth={2} />,
      title: 'Verify With Kitchen',
      subtitle: 'Manual confirmation required',
    },
    NOT_SAFE_NOT_IN_SHEET: {
      cardBg: 'bg-red-500/20',
      cardBorder: 'border-red-400/30',
      iconBg: 'bg-red-500',
      iconColor: 'text-white',
      titleColor: 'text-red-300',
      subtitleColor: 'text-red-300/70',
      icon: <X className="w-7 h-7" strokeWidth={2.5} />,
      title: 'Not In Allergy Sheet',
      subtitle: 'Cannot verify safety',
    },
    UNSAFE: {
      cardBg: 'bg-red-500/20',
      cardBorder: 'border-red-400/30',
      iconBg: 'bg-red-500',
      iconColor: 'text-white',
      titleColor: 'text-red-300',
      subtitleColor: 'text-red-300/70',
      icon: <X className="w-7 h-7" strokeWidth={2.5} />,
      title: 'Cannot Accommodate',
      subtitle: 'Please select a different item',
    },
  };

  const config = statusConfig[result.overallStatus];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      
      {/* Status Card */}
      <div className={cn(
        'rounded-2xl p-5 border',
        config.cardBg,
        config.cardBorder
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            config.iconBg
          )}>
            <div className={config.iconColor}>{config.icon}</div>
          </div>
          
          <div className="flex-1">
            <h1 className={cn('text-xl font-bold', config.titleColor)}>
              {config.title}
            </h1>
            <p className={cn('text-sm', config.subtitleColor)}>
              {config.subtitle}
            </p>
          </div>
        </div>
        
        {/* Allergen pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedAllergens.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white text-sm font-medium"
            >
              <span className="text-base">{a.icon}</span>
              {a.name}
            </span>
          ))}
        </div>
      </div>

      {/* Order Card */}
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        
        {/* Main item */}
        <div className="p-4">
          {(() => {
            // Check if only custom ingredients were selected (no standard allergens)
            const onlyCustomIngredients = selectedAllergens.length === 0;
            const hasCustomIngredientMatch = result.customIngredientResults?.some(r => r.foundIn !== 'not_found');
            const suppressStandardNotes = onlyCustomIngredients && hasCustomIngredientMatch;
            
            return (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-white leading-tight">
                      {result.mainItem.itemName}
                    </p>
                    {result.mainItem.ticketCode && (
                      <p className="text-white/40 text-xs mt-0.5">
                        {result.mainItem.ticketCode}
                      </p>
                    )}
                    {/* Show selected dressing if applicable */}
                    {selectedDressing && (
                      <p className="text-white/60 text-sm mt-1">
                        with <span className="text-white/80 font-medium">{selectedDressing.name}</span>
                      </p>
                    )}
                  </div>
                  {/* Hide status badge when only checking custom ingredients that were found */}
                  {!suppressStandardNotes && <ItemStatusBadge status={result.mainItem.status} />}
                </div>
                {/* Hide preparation notes when only checking custom ingredients that were found */}
                {!suppressStandardNotes && <PreparationNotes result={result.mainItem} />}
              </>
            );
          })()}
        </div>

        {/* Side item */}
        {result.sideItem && (
          <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">
                  Side
                </p>
                <p className="text-base font-semibold text-white">
                  {result.sideItem.itemName}
                </p>
              </div>
              <ItemStatusBadge status={result.sideItem.status} />
            </div>
            <PreparationNotes result={result.sideItem} />
          </div>
        )}

        {/* Crust item */}
        {result.crustItem && (
          <div className="px-4 py-3 border-t border-white/5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">
                  Crust
                </p>
                <p className="text-base font-semibold text-white">
                  {result.crustItem.itemName}
                </p>
              </div>
              <ItemStatusBadge status={result.crustItem.status} />
            </div>
            <PreparationNotes result={result.crustItem} />
          </div>
        )}

        {/* Custom allergen warning */}
        {result.customAllergenWarning && (
          <div className="px-4 py-3 border-t border-white/5 bg-amber-500/10">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-amber-300 text-xs font-medium">
                {result.customAllergenWarning}
              </p>
            </div>
          </div>
        )}

        {/* Custom ingredient check results */}
        {result.customIngredientResults && result.customIngredientResults.length > 0 && (
          <div className="px-4 py-3 border-t border-white/5">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
              Ingredient Check
            </p>
            <div className="space-y-1.5">
              {result.customIngredientResults.map((ingResult, idx) => {
                // Determine styling based on where ingredient was found
                const isIngredient = ingResult.foundIn === 'ingredients';
                const isGarnish = ingResult.foundIn === 'garnishes';
                const notFound = ingResult.foundIn === 'not_found';
                
                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-2 py-2 px-3 rounded-lg border',
                      isIngredient && 'bg-red-500/10 border-red-500/20',
                      isGarnish && 'bg-amber-500/10 border-amber-500/20',
                      notFound && 'bg-emerald-500/10 border-emerald-500/20'
                    )}
                  >
                    {isIngredient && <X className="w-3.5 h-3.5 text-red-400" strokeWidth={2.5} />}
                    {isGarnish && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />}
                    {notFound && <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />}
                    <span className={cn(
                      'text-sm font-medium',
                      isIngredient && 'text-red-400',
                      isGarnish && 'text-amber-400',
                      notFound && 'text-emerald-400'
                    )}>
                      {isIngredient && `Contains ${ingResult.ingredient}`}
                      {isGarnish && `No ${ingResult.ingredient} (garnish can be removed)`}
                      {notFound && `No ${ingResult.ingredient} found`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-white/30 text-xs">
        Always verify with kitchen staff
      </p>

      {/* Action button */}
      <button
        onClick={onStartOver}
        className="w-full py-4 bg-white hover:bg-white/90 text-gray-900 text-base font-semibold rounded-xl transition-all shadow-lg shadow-white/20"
      >
        New Check
      </button>
    </div>
  );
}

// ============================================================================
// Helper Components - Modern Light Style
// ============================================================================

function ItemStatusBadge({ status }: { status: RuleStatus }) {
  const configs: Record<RuleStatus, { bg: string; text: string; label: string }> = {
    SAFE: {
      bg: 'bg-emerald-500',
      text: 'text-white',
      label: 'Ready',
    },
    MODIFIABLE: {
      bg: 'bg-amber-500',
      text: 'text-white',
      label: 'Modify',
    },
    VERIFY_WITH_KITCHEN: {
      bg: 'bg-amber-500',
      text: 'text-white',
      label: 'Verify',
    },
    NOT_SAFE_NOT_IN_SHEET: {
      bg: 'bg-red-500',
      text: 'text-white',
      label: 'No',
    },
    UNSAFE: {
      bg: 'bg-red-500',
      text: 'text-white',
      label: 'No',
    },
  };

  const config = configs[status];

  return (
    <div className={cn(
      'px-3 py-1 rounded-lg text-xs font-semibold',
      config.bg,
      config.text
    )}>
      {config.label}
    </div>
  );
}

interface PreparationNotesProps {
  result: CheckerResult['mainItem'];
}

function PreparationNotes({ result }: PreparationNotesProps) {
  if (result.status === 'SAFE') {
    return (
      <div className="mt-3 flex items-center gap-2 py-2 px-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
        <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
        <span className="text-emerald-400 text-sm font-medium">
          No changes needed
        </span>
      </div>
    );
  }

  if (result.status === 'UNSAFE') {
    return (
      <div className="mt-3 space-y-1.5">
        {result.perAllergen
          .filter((pa) => pa.status === 'UNSAFE')
          .map((pa) => (
            <div
              key={pa.allergenId}
              className="flex items-center gap-2 py-2 px-3 bg-red-500/10 rounded-lg border border-red-500/20"
            >
              <X className="w-3.5 h-3.5 text-red-400" strokeWidth={2.5} />
              <span className="text-red-400 text-sm font-medium">
                {pa.notes.join(' · ') || `Contains ${pa.allergenName.toLowerCase()}`}
              </span>
            </div>
          ))}
      </div>
    );
  }

  if (result.status === 'VERIFY_WITH_KITCHEN') {
    return (
      <div className="mt-3 space-y-1.5">
        {result.perAllergen
          .filter((pa) => pa.status === 'VERIFY_WITH_KITCHEN')
          .map((pa) => (
            <div
              key={pa.allergenId}
              className="flex items-center gap-2 py-2 px-3 bg-amber-500/10 rounded-lg border border-amber-500/20"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
              <span className="text-amber-400 text-sm font-medium">
                {pa.notes.join(' · ') || 'Verify with kitchen'}
              </span>
            </div>
          ))}
      </div>
    );
  }

  if (result.status === 'NOT_SAFE_NOT_IN_SHEET') {
    return (
      <div className="mt-3 space-y-1.5">
        {result.perAllergen
          .filter((pa) => pa.status === 'NOT_SAFE_NOT_IN_SHEET')
          .map((pa) => (
            <div
              key={pa.allergenId}
              className="flex items-center gap-2 py-2 px-3 bg-red-500/10 rounded-lg border border-red-500/20"
            >
              <X className="w-3.5 h-3.5 text-red-400" strokeWidth={2.5} />
              <span className="text-red-400 text-sm font-medium">
                {pa.allergenName}: Not in allergy sheet
              </span>
            </div>
          ))}
      </div>
    );
  }

  // MODIFIABLE - Use consolidated results with component-based grouping
  if (result.consolidated) {
    const { bread, removals, substitutions, preparation } = result.consolidated;
    
    // Check if there are any modifications at all
    const hasModifications = 
      bread.selected ||
      removals.sauce.length > 0 ||
      removals.garnish.length > 0 ||
      removals.seasoning.length > 0 ||
      removals.other.length > 0 ||
      substitutions.protein.length > 0 ||
      substitutions.other.length > 0 ||
      preparation.length > 0;
    
    if (!hasModifications) {
      return null;
    }

    return (
      <div className="mt-3 space-y-3">
        {/* BREAD - Single best option */}
        {bread.selected && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
              Bread
            </div>
            <div
              className={cn(
                'flex items-center gap-2 py-2 px-3 rounded-lg border',
                bread.selected.toLowerCase().startsWith('no ')
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-blue-500/10 border-blue-500/20'
              )}
            >
              {bread.selected.toLowerCase().startsWith('no ') ? (
                <X className="w-3.5 h-3.5 text-red-400" strokeWidth={2.5} />
              ) : (
                <Check className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
              )}
              <span className={cn(
                'text-sm font-medium',
                bread.selected.toLowerCase().startsWith('no ')
                  ? 'text-red-400'
                  : 'text-blue-400'
              )}>
                {bread.selected}
              </span>
            </div>
            {/* Show rejected bread options */}
            {bread.rejected.length > 0 && (
              <div className="text-xs text-amber-400/70 pl-1">
                <span className="text-amber-400/50">Unavailable: </span>
                {bread.rejected.map((r, i) => (
                  <span key={i}>
                    {i > 0 && ', '}
                    {r.option.replace(/^(NO |SUB )/i, '')} ({r.reason.toLowerCase()})
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROTEIN substitutions */}
        {substitutions.protein.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
              Protein
            </div>
            {substitutions.protein.map((sub, idx) => (
              <div
                key={`protein-${idx}`}
                className="flex items-center gap-2 py-2 px-3 rounded-lg border bg-blue-500/10 border-blue-500/20"
              >
                <Check className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
                <span className="text-blue-400 text-sm font-medium">{sub}</span>
              </div>
            ))}
          </div>
        )}

        {/* REMOVE section - grouped sauces, garnishes, seasonings */}
        {(removals.sauce.length > 0 || removals.garnish.length > 0 || 
          removals.seasoning.length > 0 || removals.other.length > 0) && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
              Remove
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...removals.sauce, ...removals.garnish, ...removals.seasoning, ...removals.other].map((removal, idx) => (
                <div
                  key={`removal-${idx}`}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border bg-red-500/10 border-red-500/20"
                >
                  <X className="w-3 h-3 text-red-400" strokeWidth={2.5} />
                  <span className="text-red-400 text-xs font-medium">
                    {removal.replace(/^NO /i, '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PREPARATION instructions */}
        {preparation.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
              Preparation
            </div>
            {preparation.map((prep, idx) => (
              <div
                key={`prep-${idx}`}
                className="flex items-center gap-2 py-2 px-3 rounded-lg border bg-amber-500/10 border-amber-500/20"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
                <span className="text-amber-400 text-sm font-medium">{prep}</span>
              </div>
            ))}
          </div>
        )}

        {/* Other substitutions */}
        {substitutions.other.length > 0 && (
          <div className="space-y-1.5">
            {substitutions.other.map((sub, idx) => (
              <div
                key={`other-${idx}`}
                className="flex items-center gap-2 py-2 px-3 rounded-lg border bg-blue-500/10 border-blue-500/20"
              >
                <Check className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
                <span className="text-blue-400 text-sm font-medium">{sub}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback: Legacy path using perAllergen (for items without consolidated data)
  const modifications = result.perAllergen.flatMap((pa) =>
    pa.substitutions.map((sub) => ({ allergen: pa.allergenName, sub }))
  );

  if (modifications.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-1.5">
      {modifications.map((mod, idx) => {
        const isOmit = mod.sub.startsWith('NO ');
        const isSub = mod.sub.startsWith('SUB ') || mod.sub.startsWith('GF ');
        
        return (
          <div
            key={idx}
            className={cn(
              'flex items-center gap-2 py-2 px-3 rounded-lg border',
              isOmit && 'bg-red-500/10 border-red-500/20',
              isSub && 'bg-blue-500/10 border-blue-500/20',
              !isOmit && !isSub && 'bg-white/5 border-white/10'
            )}
          >
            {isOmit && <X className="w-3.5 h-3.5 text-red-400" strokeWidth={2.5} />}
            {isSub && <Check className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />}
            {!isOmit && !isSub && <AlertTriangle className="w-3.5 h-3.5 text-white/50" strokeWidth={2} />}
            <span className={cn(
              'text-sm font-medium',
              isOmit && 'text-red-400',
              isSub && 'text-blue-400',
              !isOmit && !isSub && 'text-white/50'
            )}>
              {mod.sub}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Ingredients View - Show Full Ingredient List
// ============================================================================

interface IngredientsViewProps {
  item: MenuItem;
  dressing: DressingOption | null;
  pack: TenantPack;
  onStartOver: () => void;
}

function IngredientsView({ item, dressing, pack, onStartOver }: IngredientsViewProps) {
  // Get item ingredients from pack
  const itemIngredients = (item as any).ingredients || [];
  const itemGarnishes = (item as any).garnishes || [];
  
  // Get dressing ingredients directly from the dressing option object
  const dressingIngredients = (dressing as any)?.ingredients || [];
  
  // Get bread info from the item's defaultBread (now comes from Supabase via pack)
  const defaultBread = (item as any).defaultBread;
  const breadName = defaultBread?.name || null;
  const breadIngredients = defaultBread?.ingredients || [];
  const breadAllergens = defaultBread?.allergens || [];
  
  // Get compound ingredients lookup from pack for detailed breakdowns
  const compoundIngredients = pack.compoundIngredients || [];
  
  // Function to find compound ingredient breakdown by name
  const findCompoundIngredient = (ingredientName: string) => {
    const lower = ingredientName.toLowerCase();
    return compoundIngredients.find((ci: any) => 
      ci.name.toLowerCase() === lower ||
      lower.includes(ci.name.toLowerCase()) ||
      ci.name.toLowerCase().includes(lower)
    );
  };
  
  // Check which ingredients have detailed breakdowns
  const ingredientsWithBreakdown = itemIngredients.map((ing: string) => ({
    name: ing,
    breakdown: findCompoundIngredient(ing),
  }));
  
  const garnishesWithBreakdown = itemGarnishes.map((gar: string) => ({
    name: gar,
    breakdown: findCompoundIngredient(gar),
  }));

  return (
    <div className="max-w-lg mx-auto space-y-4">
      
      {/* Header Card */}
      <div className="rounded-2xl p-5 border bg-cyan-500/20 border-cyan-400/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-500">
            <Info className="w-7 h-7 text-white" />
          </div>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold text-cyan-300">
              Ingredient Information
            </h1>
            <p className="text-sm text-cyan-300/70">
              Full ingredient list for this dish
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        
        {/* Dish Name */}
        <div className="p-4 border-b border-white/10">
          <p className="text-lg font-semibold text-white leading-tight">
            {item.name}
          </p>
          {(item as any).ticketCode && (
            <p className="text-white/40 text-xs mt-0.5">
              {(item as any).ticketCode}
            </p>
          )}
          {dressing && (
            <p className="text-white/60 text-sm mt-1">
              with <span className="text-white/80 font-medium">{dressing.name}</span>
            </p>
          )}
        </div>

        {/* Main Ingredients Section with Breakdowns */}
        {ingredientsWithBreakdown.length > 0 && (
          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">
              Main Ingredients
            </div>
            <div className="space-y-3">
              {ingredientsWithBreakdown.map((item: any, idx: number) => (
                <div key={idx}>
                  <div className="flex flex-wrap gap-2">
                    <span className={cn(
                      "px-3 py-1.5 rounded-lg text-sm",
                      item.breakdown 
                        ? "bg-blue-500/20 border border-blue-400/30 text-blue-300" 
                        : "bg-white/10 border border-white/10 text-white"
                    )}>
                      {item.name}
                      {item.breakdown && <span className="ml-1 text-blue-400/60">↓</span>}
                    </span>
                  </div>
                  {/* Show breakdown if available */}
                  {item.breakdown && (
                    <div className="mt-2 ml-4 p-2 rounded-lg bg-blue-500/5 border border-blue-400/10">
                      <div className="text-[9px] font-semibold text-blue-400/70 uppercase mb-1">
                        {item.breakdown.category}: {item.breakdown.name}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.breakdown.ingredients.map((subIng: string, subIdx: number) => (
                          <span key={subIdx} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300/80 text-xs">
                            {subIng}
                          </span>
                        ))}
                      </div>
                      {item.breakdown.allergens?.length > 0 && (
                        <div className="mt-1 text-[9px] text-red-400/80">
                          ⚠️ Contains: {item.breakdown.allergens.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Garnishes Section with Breakdowns */}
        {garnishesWithBreakdown.length > 0 && (
          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">
              Garnishes <span className="text-white/30">(can be removed)</span>
            </div>
            <div className="space-y-3">
              {garnishesWithBreakdown.map((item: any, idx: number) => (
                <div key={idx}>
                  <div className="flex flex-wrap gap-2">
                    <span className={cn(
                      "px-3 py-1.5 rounded-lg text-sm",
                      item.breakdown 
                        ? "bg-amber-500/20 border border-amber-400/30 text-amber-300" 
                        : "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                    )}>
                      {item.name}
                      {item.breakdown && <span className="ml-1 text-amber-400/60">↓</span>}
                    </span>
                  </div>
                  {/* Show breakdown if available */}
                  {item.breakdown && (
                    <div className="mt-2 ml-4 p-2 rounded-lg bg-amber-500/5 border border-amber-400/10">
                      <div className="text-[9px] font-semibold text-amber-400/70 uppercase mb-1">
                        {item.breakdown.category}: {item.breakdown.name}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.breakdown.ingredients.map((subIng: string, subIdx: number) => (
                          <span key={subIdx} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300/80 text-xs">
                            {subIng}
                          </span>
                        ))}
                      </div>
                      {item.breakdown.allergens?.length > 0 && (
                        <div className="mt-1 text-[9px] text-red-400/80">
                          ⚠️ Contains: {item.breakdown.allergens.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bread Section (for sandwiches) - Now from Supabase */}
        {breadName && (
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Bread: {breadName}
              </div>
              {breadAllergens.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    Contains: {breadAllergens.join(', ')}
                  </span>
                </div>
              )}
            </div>
            {breadIngredients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {breadIngredients.map((ing: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-sm">Bread ingredient details not available</p>
            )}
          </div>
        )}

        {/* Dressing Section (for salads) */}
        {dressing && dressingIngredients.length > 0 && (
          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">
              {dressing.name} Ingredients
            </div>
            <div className="flex flex-wrap gap-2">
              {dressingIngredients.map((ing: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* No ingredients available */}
        {itemIngredients.length === 0 && itemGarnishes.length === 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 py-3 px-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">
                Ingredient details not available for this item
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <p className="text-center text-white/30 text-xs">
        For allergy information, please start a new check with allergens selected
      </p>

      {/* Action button */}
      <button
        onClick={onStartOver}
        className="w-full py-4 bg-white hover:bg-white/90 text-gray-900 text-base font-semibold rounded-xl transition-all shadow-lg shadow-white/20"
      >
        New Check
      </button>
    </div>
  );
}
