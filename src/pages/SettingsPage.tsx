/**
 * Settings Page
 * Shows restaurant info, pack version, and provides update/reset options
 */

import { useState } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  LogOut,
  Wifi,
  WifiOff,
  Package,
  Clock,
  Building2,
  Clipboard,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TenantContext, TenantPack } from '@/core/tenant';
import { getDeviceFingerprint, runSmokeCheck, logPackDebugInfo } from '@/core/tenant';
import { getCachedPack } from '@/core/tenant';

interface SettingsPageProps {
  tenantContext: TenantContext;
  pack: TenantPack | null;
  lastUpdated: string | null;
  isOffline: boolean;
  isUsingCache: boolean;
  onCheckForUpdates: () => Promise<boolean>;
  onReset: () => Promise<void>;
  onBack: () => void;
}

export function SettingsPage({
  tenantContext,
  pack,
  lastUpdated,
  isOffline,
  isUsingCache,
  onCheckForUpdates,
  onReset,
  onBack,
}: SettingsPageProps) {
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [updateResult, setUpdateResult] = useState<'updated' | 'no-update' | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedDeviceId, setCopiedDeviceId] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    setUpdateResult(null);
    
    try {
      const wasUpdated = await onCheckForUpdates();
      setUpdateResult(wasUpdated ? 'updated' : 'no-update');
      
      // Clear result after 3 seconds
      setTimeout(() => setUpdateResult(null), 3000);
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onReset();
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  const handleCopyDeviceId = async () => {
    const fingerprint = getDeviceFingerprint();
    if (fingerprint) {
      await navigator.clipboard.writeText(fingerprint);
      setCopiedDeviceId(true);
      setTimeout(() => setCopiedDeviceId(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Allergy Checker</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Restaurant Info */}
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              Restaurant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Concept</p>
              <p className="text-lg text-white font-medium">{tenantContext.conceptName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Location</p>
              <p className="text-lg text-white font-medium">{tenantContext.locationName}</p>
            </div>
          </CardContent>
        </Card>

        {/* Menu Data Info */}
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              Menu Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection status */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Connection</span>
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <>
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">Offline</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Online</span>
                  </>
                )}
              </div>
            </div>

            {/* Pack version */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Version</span>
              <span className="text-white font-mono">
                v{pack?.version ?? 'N/A'}
                {isUsingCache && (
                  <span className="ml-2 text-xs text-amber-400">(cached)</span>
                )}
              </span>
            </div>

            {/* Last updated */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Last Updated
              </span>
              <span className="text-slate-300 text-sm">
                {lastUpdated ? formatDate(lastUpdated) : 'Never'}
              </span>
            </div>

            {/* Items count */}
            {pack && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Menu Items</span>
                <span className="text-white">{pack.items.length}</span>
              </div>
            )}

            {/* Check for updates button */}
            <button
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdates || isOffline}
              className="w-full mt-4 py-3 px-4 
                bg-slate-700 hover:bg-slate-600 
                disabled:opacity-50 disabled:cursor-not-allowed
                text-white rounded-lg
                flex items-center justify-center gap-2
                transition-colors"
            >
              {isCheckingUpdates ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : updateResult === 'updated' ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  Updated!
                </>
              ) : updateResult === 'no-update' ? (
                <>
                  <Check className="w-4 h-4" />
                  Already up to date
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Check for Updates
                </>
              )}
            </button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Support</CardTitle>
          </CardHeader>
          <CardContent>
            <button
              onClick={handleCopyDeviceId}
              className="w-full py-3 px-4 
                bg-slate-700 hover:bg-slate-600
                text-white rounded-lg
                flex items-center justify-center gap-2
                transition-colors"
            >
              {copiedDeviceId ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Clipboard className="w-4 h-4" />
                  Copy Device ID
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Share this ID with support if you need assistance
            </p>
          </CardContent>
        </Card>

        {/* Reset */}
        <Card className="bg-slate-800/90 border-red-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showResetConfirm ? (
              <div className="space-y-4">
                <p className="text-slate-300 text-sm">
                  Are you sure? This will remove all data and require re-activation.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    disabled={isResetting}
                    className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isResetting}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Yes, Reset'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-3 px-4 
                  bg-red-900/30 hover:bg-red-900/50 
                  border border-red-700/50
                  text-red-300 rounded-lg
                  flex items-center justify-center gap-2
                  transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Reset / Change Restaurant
              </button>
            )}
          </CardContent>
        </Card>

        {/* Debug Section */}
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle 
              className="text-lg text-white cursor-pointer flex items-center justify-between"
              onClick={() => setShowDebug(!showDebug)}
            >
              <span>🔧 Debug Info</span>
              <span className="text-sm text-slate-400">{showDebug ? '▼' : '▶'}</span>
            </CardTitle>
          </CardHeader>
          {showDebug && (
            <CardContent className="space-y-4">
              <button
                onClick={async () => {
                  if (!pack) {
                    setDebugInfo('No pack loaded');
                    return;
                  }
                  const cached = await getCachedPack();
                  const smokeCheck = runSmokeCheck(pack, cached?.checksum);
                  logPackDebugInfo(pack, cached?.checksum, 'settings-page');
                  setDebugInfo(JSON.stringify(smokeCheck, null, 2));
                }}
                className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Run Smoke Check
              </button>
              
              {debugInfo && (
                <pre className="bg-slate-900 p-3 rounded-lg text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                  {debugInfo}
                </pre>
              )}
              
              {pack && (
                <div className="text-xs text-slate-400 space-y-1">
                  <p>Pack Version: {pack.version}</p>
                  <p>Items: {pack.items.length}</p>
                  <p>Categories: {pack.categories.length}</p>
                  <p>Allergens: {pack.allergens.length}</p>
                  <p>---</p>
                  <p>Sample item categoryId: {pack.items[0]?.categoryId || 'N/A'}</p>
                  <p>Sample item name: {pack.items[0]?.name || 'N/A'}</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* App version */}
        <p className="text-center text-slate-600 text-sm py-4">
          Wildfire Allergy Checker v2.0
        </p>
      </div>
    </div>
  );
}
