/**
 * Tenant Allergy Checker Component
 * Uses TenantPack data for allergen checking instead of hardcoded data
 */

import { useState, useMemo } from 'react';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  HelpCircle,
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

const TABLET_BREAKPOINT = 768;

// Step definitions
type Step = 'allergies' | 'dish' | 'sides' | 'crust' | 'results';

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

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  appetizers: 'from-amber-600 to-orange-700',
  salads: 'from-green-600 to-emerald-700',
  fresh_seafood: 'from-cyan-600 to-blue-700',
  sandwiches: 'from-red-600 to-rose-700',
  steaks: 'from-red-800 to-red-900',
  prime_rib: 'from-red-800 to-red-900',
  chicken: 'from-orange-600 to-amber-700',
  ribs: 'from-orange-700 to-red-700',
  nightly: 'from-indigo-600 to-purple-700',
  desserts: 'from-pink-600 to-rose-700',
  sides: 'from-slate-600 to-slate-700',
  kids: 'from-purple-600 to-indigo-700',
  brunch: 'from-yellow-500 to-amber-600',
  specials: 'from-yellow-500 to-orange-600',
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
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSide, setSelectedSide] = useState<MenuItem | null>(null);
  const [selectedCrust, setSelectedCrust] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(
    localStorage.getItem('wildfire_disclaimer_accepted') === 'true'
  );
  const [showDisclaimer, setShowDisclaimer] = useState(!disclaimerAccepted);

  // ========== Responsive ==========
  const [isTablet, setIsTablet] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= TABLET_BREAKPOINT : false
  );

  // Listen for resize
  useState(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsTablet(window.innerWidth >= TABLET_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  // ========== Computed ==========
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchItems(pack, searchQuery).slice(0, 20);
  }, [pack, searchQuery]);

  const categoryItems = useMemo(() => {
    if (!selectedCategory) return [];
    return getItemsByCategory(pack, selectedCategory);
  }, [pack, selectedCategory]);

  const checkerResult: CheckerResult | null = useMemo(() => {
    if (!selectedItem || selectedAllergens.length === 0) return null;

    try {
      return checkAllergens(pack, {
        allergenIds: selectedAllergens,
        itemId: selectedItem.id,
        sideId: selectedSide?.id,
        crustId: selectedCrust || undefined,
        customAllergenText: customAllergenText.trim() || undefined,
      });
    } catch (error) {
      console.error('Checker error:', error);
      return null;
    }
  }, [pack, selectedItem, selectedSide, selectedCrust, selectedAllergens, customAllergenText]);

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
    if (item.isEntree && item.sides && item.sides.length > 0) {
      setCurrentStep('sides');
    } else if (item.requiresCrust && item.crustOptions && item.crustOptions.length > 0) {
      setCurrentStep('crust');
    } else {
      setCurrentStep('results');
    }
    setSelectedCategory(null);
    setSearchQuery('');
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
    switch (currentStep) {
      case 'dish':
        setCurrentStep('allergies');
        break;
      case 'sides':
        setCurrentStep('dish');
        setSelectedItem(null);
        break;
      case 'crust':
        if (selectedItem?.isEntree) {
          setCurrentStep('sides');
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
    setSelectedItem(null);
    setSelectedSide(null);
    setSelectedCrust(null);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleContinue = () => {
    if (currentStep === 'allergies' && selectedAllergens.length > 0) {
      setCurrentStep('dish');
    }
  };

  // ========== Disclaimer Modal ==========
  if (showDisclaimer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-slate-800/90 border-amber-600/50">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Info className="w-6 h-6 text-amber-500" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">{DISCLAIMER_TEXT}</p>
            <p className="text-amber-400 font-medium">{ALWAYS_VERIFY_TEXT}</p>
            <button
              onClick={handleAcceptDisclaimer}
              className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              I Understand
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========== Render ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AnimatedBackground />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-amber-500" />
            <div>
              <h1 className="text-lg font-bold text-white">Allergy Safety Checker</h1>
              <p className="text-xs text-slate-400">
                {tenantContext.conceptName} • {tenantContext.locationName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className="flex items-center gap-1 text-xs">
              {isOffline ? (
                <WifiOff className="w-4 h-4 text-red-400" />
              ) : (
                <Wifi className="w-4 h-4 text-green-400" />
              )}
              {isUsingCache && (
                <span className="text-amber-400">cached</span>
              )}
            </div>
            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2 text-sm">
          {['allergies', 'dish', 'sides', 'crust', 'results'].map((step, idx) => {
            const isActive = currentStep === step;
            const isPast =
              ['allergies', 'dish', 'sides', 'crust', 'results'].indexOf(currentStep) > idx;
            const shouldShow =
              step === 'allergies' ||
              step === 'dish' ||
              step === 'results' ||
              (step === 'sides' && selectedItem?.isEntree) ||
              (step === 'crust' && selectedItem?.requiresCrust);

            if (!shouldShow) return null;

            return (
              <div key={step} className="flex items-center gap-2">
                {idx > 0 && <div className="w-8 h-0.5 bg-slate-700" />}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                    isActive && 'bg-amber-500 text-white',
                    isPast && 'bg-green-600 text-white',
                    !isActive && !isPast && 'bg-slate-700 text-slate-400'
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
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Back button */}
        {currentStep !== 'allergies' && (
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        )}

        {/* Step: Allergies */}
        {currentStep === 'allergies' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Select Allergies
              </h2>
              <p className="text-slate-400">
                Choose all allergies that apply to this guest
              </p>
            </div>

            {/* Allergen grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {pack.allergens.map((allergen) => {
                const isSelected = selectedAllergens.includes(allergen.id);
                return (
                  <button
                    key={allergen.id}
                    onClick={() => handleAllergenToggle(allergen.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                      isSelected
                        ? 'border-amber-500 bg-amber-500/20 text-white'
                        : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                    )}
                  >
                    <span className="text-3xl">{allergen.icon}</span>
                    <span className="text-sm font-medium">{allergen.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom allergen input */}
            <div className="max-w-md mx-auto">
              <label className="block text-sm text-slate-400 mb-2">
                Other allergy (optional)
              </label>
              <input
                type="text"
                value={customAllergenText}
                onChange={(e) => setCustomAllergenText(e.target.value)}
                placeholder="Enter other allergy..."
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Continue button */}
            <div className="text-center">
              <button
                onClick={handleContinue}
                disabled={selectedAllergens.length === 0}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-semibold rounded-xl transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step: Dish */}
        {currentStep === 'dish' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Select Dish</h2>
              <p className="text-slate-400">
                {isTablet
                  ? 'Choose a category then select a dish'
                  : 'Search for a dish or browse by category'}
              </p>
            </div>

            {/* Mobile: Search */}
            {!isTablet && (
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Search results */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className="w-full p-4 bg-slate-800/50 border border-slate-600 rounded-lg text-left hover:border-amber-500/50 transition-colors"
                      >
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          {pack.categories.find((c) => c.id === item.categoryId)?.name}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tablet: Category grid */}
            {isTablet && !selectedCategory && (
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
                {pack.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'p-6 rounded-xl bg-gradient-to-br text-white transition-transform hover:scale-105',
                      CATEGORY_COLORS[category.id] || 'from-slate-600 to-slate-700'
                    )}
                  >
                    <span className="text-4xl mb-2 block">
                      {category.icon || CATEGORY_ICONS[category.id] || '📋'}
                    </span>
                    <span className="font-semibold">{category.name}</span>
                    <span className="text-xs opacity-75 block mt-1">
                      {getItemsByCategory(pack, category.id).length} items
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Tablet: Items in category */}
            {isTablet && selectedCategory && (
              <div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back to categories
                </button>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg text-left hover:border-amber-500/50 transition-colors"
                    >
                      <p className="text-white font-medium">{item.name}</p>
                      {item.ticketCode && (
                        <p className="text-xs text-slate-500 mt-1">{item.ticketCode}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Sides */}
        {currentStep === 'sides' && selectedItem?.sides && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Select Side</h2>
              <p className="text-slate-400">
                Choose a side for {selectedItem.name}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {selectedItem.sides.map((side) => (
                <button
                  key={side.id}
                  onClick={() => handleSelectSide(side.id)}
                  className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg text-white hover:border-amber-500/50 transition-colors"
                >
                  {side.name}
                </button>
              ))}
              <button
                onClick={() => handleSelectSide(null)}
                className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-400 hover:border-amber-500/50 transition-colors"
              >
                No side
              </button>
            </div>
          </div>
        )}

        {/* Step: Crust */}
        {currentStep === 'crust' && selectedItem?.crustOptions && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Select Crust</h2>
              <p className="text-slate-400">
                Choose a crust for {selectedItem.name}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {selectedItem.crustOptions.map((crust) => (
                <button
                  key={crust.id}
                  onClick={() => handleSelectCrust(crust.id)}
                  className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg text-white hover:border-amber-500/50 transition-colors"
                >
                  {crust.name}
                </button>
              ))}
              <button
                onClick={() => handleSelectCrust(null)}
                className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-400 hover:border-amber-500/50 transition-colors"
              >
                No crust
              </button>
            </div>
          </div>
        )}

        {/* Step: Results */}
        {currentStep === 'results' && checkerResult && (
          <ResultsView
            result={checkerResult}
            selectedAllergens={pack.allergens.filter((a) =>
              selectedAllergens.includes(a.id)
            )}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Results View
// ============================================================================

interface ResultsViewProps {
  result: CheckerResult;
  selectedAllergens: AllergenDef[];
  onStartOver: () => void;
}

function ResultsView({ result, selectedAllergens, onStartOver }: ResultsViewProps) {
  // Status banner colors and icons
  const statusConfig: Record<
    RuleStatus,
    { bg: string; border: string; text: string; icon: React.ReactNode; label: string }
  > = {
    SAFE: {
      bg: 'bg-green-900/30',
      border: 'border-green-600',
      text: 'text-green-400',
      icon: <Check className="w-8 h-8" />,
      label: 'Safe to Serve',
    },
    MODIFY: {
      bg: 'bg-amber-900/30',
      border: 'border-amber-600',
      text: 'text-amber-400',
      icon: <AlertTriangle className="w-8 h-8" />,
      label: 'Modifications Required',
    },
    UNSAFE: {
      bg: 'bg-red-900/30',
      border: 'border-red-600',
      text: 'text-red-400',
      icon: <X className="w-8 h-8" />,
      label: 'Cannot Be Modified',
    },
    UNKNOWN: {
      bg: 'bg-slate-800/50',
      border: 'border-slate-600',
      text: 'text-slate-400',
      icon: <HelpCircle className="w-8 h-8" />,
      label: 'Verify with Chef',
    },
  };

  const config = statusConfig[result.overallStatus];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Status banner */}
      <div
        className={cn(
          'p-6 rounded-xl border-2 flex items-center gap-4',
          config.bg,
          config.border
        )}
      >
        <div className={config.text}>{config.icon}</div>
        <div>
          <h2 className={cn('text-2xl font-bold', config.text)}>{config.label}</h2>
          <p className="text-slate-300 mt-1">
            {selectedAllergens.map((a) => a.name).join(', ')} allergy
            {selectedAllergens.length > 1 ? 'ies' : 'y'}
          </p>
        </div>
      </div>

      {/* Kitchen Ticket */}
      <Card className="bg-white border-2 border-slate-300">
        <CardHeader className="bg-slate-900 text-white py-3 rounded-t-lg">
          <CardTitle className="text-xl text-center">🎫 Kitchen Ticket</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-dashed divide-gray-300">
          {/* Main item */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Main Item
                </p>
                <p className="font-bold text-gray-900 text-lg">
                  {result.mainItem.itemName}
                </p>
                {result.mainItem.ticketCode && (
                  <p className="text-xs text-gray-500">{result.mainItem.ticketCode}</p>
                )}
              </div>
              <StatusIndicator status={result.mainItem.status} />
            </div>
            <ModificationsList result={result.mainItem} />
          </div>

          {/* Side */}
          {result.sideItem && (
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Side
                  </p>
                  <p className="font-bold text-gray-900">{result.sideItem.itemName}</p>
                </div>
                <StatusIndicator status={result.sideItem.status} />
              </div>
              <ModificationsList result={result.sideItem} />
            </div>
          )}

          {/* Crust */}
          {result.crustItem && (
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Crust
                  </p>
                  <p className="font-bold text-gray-900">{result.crustItem.itemName}</p>
                </div>
                <StatusIndicator status={result.crustItem.status} />
              </div>
              <ModificationsList result={result.crustItem} />
            </div>
          )}

          {/* Custom allergen warning */}
          {result.customAllergenWarning && (
            <div className="p-4 bg-amber-50">
              <p className="text-amber-800 font-medium flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {result.customAllergenWarning}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start over button */}
      <div className="text-center">
        <button
          onClick={onStartOver}
          className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white text-lg font-semibold rounded-xl transition-colors"
        >
          Start New Check
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-slate-500">
        {ALWAYS_VERIFY_TEXT}
      </p>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function StatusIndicator({ status }: { status: RuleStatus }) {
  if (status === 'SAFE') {
    return (
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
        <Check className="w-6 h-6 text-green-600" />
      </div>
    );
  }
  if (status === 'MODIFY') {
    return (
      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-amber-600" />
      </div>
    );
  }
  if (status === 'UNSAFE') {
    return (
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
        <X className="w-6 h-6 text-red-600" />
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
      <HelpCircle className="w-6 h-6 text-slate-600" />
    </div>
  );
}

interface ModificationsListProps {
  result: CheckerResult['mainItem'];
}

function ModificationsList({ result }: ModificationsListProps) {
  if (result.status === 'SAFE') {
    return (
      <p className="mt-2 text-green-700 font-medium flex items-center gap-2">
        <Check className="w-4 h-4" />
        No changes needed
      </p>
    );
  }

  if (result.status === 'UNSAFE') {
    return (
      <div className="mt-2">
        {result.perAllergen
          .filter((pa) => pa.status === 'UNSAFE')
          .map((pa) => (
            <p key={pa.allergenId} className="text-red-700 font-medium">
              ⛔ {pa.notes.join(' • ') || `Cannot remove ${pa.allergenName}`}
            </p>
          ))}
      </div>
    );
  }

  if (result.status === 'UNKNOWN') {
    return (
      <div className="mt-2">
        {result.perAllergen
          .filter((pa) => pa.status === 'UNKNOWN')
          .map((pa) => (
            <p key={pa.allergenId} className="text-slate-600">
              ❓ {pa.notes.join(' • ')}
            </p>
          ))}
      </div>
    );
  }

  // MODIFY - show substitutions
  const modifications = result.perAllergen.flatMap((pa) =>
    pa.substitutions.map((sub) => ({ allergen: pa.allergenName, sub }))
  );

  if (modifications.length === 0) {
    return null;
  }

  return (
    <ul className="mt-3 space-y-1">
      {modifications.map((mod, idx) => (
        <li key={idx} className="text-gray-800 font-bold text-lg">
          {mod.sub.startsWith('NO ') ? (
            <span className="text-red-700">{mod.sub}</span>
          ) : mod.sub.startsWith('SUB ') ? (
            <span className="text-blue-700">{mod.sub}</span>
          ) : (
            mod.sub
          )}
        </li>
      ))}
    </ul>
  );
}
