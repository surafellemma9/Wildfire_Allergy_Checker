/**
 * useTenant Hook
 * Provides tenant context and pack management for components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TenantContext, TenantPack } from './packTypes';
import {
  getTenantContext,
  getCachedPack,
  clearAllTenantData,
} from './storage';
import {
  performFullActivation,
  checkAndDownloadUpdate,
  loadPackFromCache,
  ActivationError,
  PackError,
} from './packClient';

// Default refresh interval: 6 hours (can be overridden per tenant in pack)
const DEFAULT_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;

export interface UseTenantState {
  tenantContext: TenantContext | null;
  pack: TenantPack | null;
  loading: boolean;
  error: string | null;
  errorCode: string | null;
  isOffline: boolean;
  isUsingCache: boolean;
  lastUpdated: string | null;
}

export interface UseTenantActions {
  activate: (code: string) => Promise<void>;
  checkForUpdates: () => Promise<boolean>;
  reset: () => Promise<void>;
}

export type UseTenantReturn = UseTenantState & UseTenantActions;

export function useTenant(): UseTenantReturn {
  const [tenantContext, setTenantContext] = useState<TenantContext | null>(null);
  const [pack, setPack] = useState<TenantPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refreshIntervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    loadInitialState();

    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Set up refresh interval when we have a tenant context and pack
  useEffect(() => {
    if (tenantContext && pack && !refreshIntervalRef.current) {
      // Use pack-specific interval or default to 6 hours
      const intervalMs = pack.updateIntervalMs || DEFAULT_REFRESH_INTERVAL_MS;

      refreshIntervalRef.current = window.setInterval(() => {
        if (navigator.onLine && tenantContext) {
          checkForUpdates();
        }
      }, intervalMs);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [tenantContext, pack]);

  /**
   * Load initial state from storage
   */
  async function loadInitialState() {
    console.log('[useTenant] Loading initial state...');
    
    try {
      setLoading(true);
      setError(null);
      setErrorCode(null);

      // Load tenant context
      const storedContext = await getTenantContext();
      console.log('[useTenant] Stored context:', storedContext ? 'found' : 'not found');
      
      if (!storedContext) {
        // No activation - show verification page
        console.log('[useTenant] No activation, showing verification page');
        setLoading(false);
        return;
      }

      setTenantContext(storedContext);

      // Load cached pack with validation
      console.log('[useTenant] Loading cached pack...');
      const cachedPackData = await getCachedPack();
      let validatedPack = cachedPackData ? await loadPackFromCache() : null;
      
      if (validatedPack) {
        console.log('[useTenant] Cached pack loaded and validated');
        setPack(validatedPack);
        setLastUpdated(cachedPackData?.storedAt ?? null);
        setIsUsingCache(true);
      } else {
        console.log('[useTenant] No valid cached pack');
      }

      // Try to check for updates if online
      if (navigator.onLine && storedContext.deviceToken) {
        console.log('[useTenant] Online - checking for updates...');
        try {
          const updatedPack = await checkAndDownloadUpdate(storedContext.deviceToken);
          if (updatedPack && isMountedRef.current) {
            console.log('[useTenant] Update downloaded!');
            setPack(updatedPack);
            setLastUpdated(new Date().toISOString());
            setIsUsingCache(false);
          } else if (validatedPack) {
            console.log('[useTenant] No update available, using cache');
            setIsUsingCache(true);
          }
        } catch (updateError) {
          // Failed to update, but we have cache - that's okay
          console.warn('[useTenant] Failed to check for updates:', updateError);
          if (!validatedPack) {
            // No cache and can't download - this is a problem
            throw updateError;
          }
        }
      } else {
        console.log('[useTenant] Offline or no device token, using cache only');
      }

      // If no pack at all, we need to download
      if (!validatedPack && navigator.onLine && storedContext.deviceToken) {
        console.log('[useTenant] No cache, must download...');
        try {
          const updatedPack = await checkAndDownloadUpdate(storedContext.deviceToken);
          if (updatedPack && isMountedRef.current) {
            setPack(updatedPack);
            setLastUpdated(new Date().toISOString());
          }
        } catch (downloadError) {
          throw new Error('Unable to download menu data. Please check your connection.');
        }
      }

    } catch (err) {
      console.error('[useTenant] Error loading initial state:', err);
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to load';
        const code = err instanceof PackError ? err.code : 'load_failed';
        setError(message);
        setErrorCode(code);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        console.log('[useTenant] Initial load complete');
      }
    }
  }

  /**
   * Activate device with code
   */
  const activate = useCallback(async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      setErrorCode(null);

      const result = await performFullActivation(code);

      if (isMountedRef.current) {
        setTenantContext(result.tenantContext);
        setPack(result.pack);
        setLastUpdated(new Date().toISOString());
        setIsUsingCache(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Activation failed';
        const code = err instanceof ActivationError ? err.code : 'activation_failed';
        setError(message);
        setErrorCode(code);
        throw err;
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Check for pack updates
   * Returns true if an update was downloaded
   */
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    console.log('[useTenant.checkForUpdates] Starting...');
    
    if (!tenantContext?.deviceToken) {
      console.log('[useTenant.checkForUpdates] No device token, aborting');
      return false;
    }

    if (!navigator.onLine) {
      console.log('[useTenant.checkForUpdates] Offline, aborting');
      setIsOffline(true);
      return false;
    }

    try {
      const updatedPack = await checkAndDownloadUpdate(tenantContext.deviceToken);
      
      if (updatedPack && isMountedRef.current) {
        console.log('[useTenant.checkForUpdates] Update downloaded and applied!');
        setPack(updatedPack);
        setLastUpdated(new Date().toISOString());
        setIsUsingCache(false);
        return true;
      }
      
      console.log('[useTenant.checkForUpdates] No update needed');
      return false;
    } catch (err) {
      console.warn('[useTenant.checkForUpdates] Failed:', err);
      return false;
    }
  }, [tenantContext]);

  /**
   * Reset all tenant data (logout)
   */
  const reset = useCallback(async () => {
    try {
      await clearAllTenantData();
      
      if (isMountedRef.current) {
        setTenantContext(null);
        setPack(null);
        setLastUpdated(null);
        setError(null);
        setErrorCode(null);
        setIsUsingCache(false);
      }
    } catch (err) {
      console.error('Reset failed:', err);
      throw err;
    }
  }, []);

  return {
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
  };
}
