import { useState } from 'react';
import { useTenant } from '@/core/tenant';
import { LocationVerificationPage } from '@/pages/LocationVerificationPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TenantAllergyChecker } from '@/components/TenantAllergyChecker';
import { Loader2 } from 'lucide-react';
import './App.css';

type Page = 'main' | 'settings';

function App() {
  const {
    tenantContext,
    pack,
    loading,
    error,
    errorCode,
    isOffline,
    isUsingCache,
    lastUpdated,
    activate,
    checkForUpdates,
    reset,
  } = useTenant();

  const [currentPage, setCurrentPage] = useState<Page>('main');

  // Loading state
  if (loading && !pack) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
          {isOffline && (
            <p className="text-slate-400 text-sm mt-2">Offline - loading cached data</p>
          )}
        </div>
      </div>
    );
  }

  // Not activated - show verification page
  if (!tenantContext) {
    return (
      <LocationVerificationPage
        onActivate={activate}
        error={error}
        errorCode={errorCode}
      />
    );
  }

  // Activated but no pack (and not loading) - error state
  if (!pack) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/90 border border-red-700/50 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-400 text-lg mb-4">
            Unable to load menu data
          </p>
          <p className="text-slate-400 mb-6">
            {isOffline
              ? 'You are offline and no cached data is available.'
              : error || 'Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Settings page
  if (currentPage === 'settings') {
    return (
      <SettingsPage
        tenantContext={tenantContext}
        pack={pack}
        lastUpdated={lastUpdated}
        isOffline={isOffline}
        isUsingCache={isUsingCache}
        onCheckForUpdates={checkForUpdates}
        onReset={reset}
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  // Main app - allergy checker
  return (
    <TenantAllergyChecker
      pack={pack}
      tenantContext={tenantContext}
      isOffline={isOffline}
      isUsingCache={isUsingCache}
      onOpenSettings={() => setCurrentPage('settings')}
    />
  );
}export default App;
