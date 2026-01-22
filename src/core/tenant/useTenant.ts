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
  ActivationError,
  PackError,
} from './packClient';

// Refresh interval: 6 hours
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;

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

  // Set up refresh interval when we have a tenant context
  useEffect(() => {
    if (tenantContext && !refreshIntervalRef.current) {
      refreshIntervalRef.current = window.setInterval(() => {
        if (navigator.onLine && tenantContext) {
          checkForUpdates();
        }
      }, REFRESH_INTERVAL_MS);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [tenantContext]);

  /**
   * Load initial state from storage
   */
  async function loadInitialState() {
    try {
      setLoading(true);
      setError(null);
      setErrorCode(null);

      // Load tenant context
      const storedContext = await getTenantContext();
      
      if (!storedContext) {
        // No activation - show verification page
        setLoading(false);
        return;
      }

      setTenantContext(storedContext);

      // Load cached pack
      const cachedPack = await getCachedPack();
      
      if (cachedPack) {
        setPack(cachedPack.pack);
        setLastUpdated(cachedPack.storedAt);
        setIsUsingCache(true);
      }

      // Try to check for updates if online
      if (navigator.onLine && storedContext.deviceToken) {
        try {
          const updatedPack = await checkAndDownloadUpdate(storedContext.deviceToken);
          if (updatedPack && isMountedRef.current) {
            setPack(updatedPack);
            setLastUpdated(new Date().toISOString());
            setIsUsingCache(false);
          } else {
            setIsUsingCache(true);
          }
        } catch (updateError) {
          // Failed to update, but we have cache - that's okay
          console.warn('Failed to check for updates:', updateError);
          if (!cachedPack) {
            // No cache and can't download - this is a problem
            throw updateError;
          }
        }
      }

      // If no pack at all, we need to download
      if (!cachedPack && navigator.onLine && storedContext.deviceToken) {
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
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to load';
        const code = err instanceof PackError ? err.code : 'load_failed';
        setError(message);
        setErrorCode(code);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
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
    if (!tenantContext?.deviceToken) {
      return false;
    }

    if (!navigator.onLine) {
      setIsOffline(true);
      return false;
    }

    try {
      const updatedPack = await checkAndDownloadUpdate(tenantContext.deviceToken);
      
      if (updatedPack && isMountedRef.current) {
        setPack(updatedPack);
        setLastUpdated(new Date().toISOString());
        setIsUsingCache(false);
        return true;
      }
      
      return false;
    } catch (err) {
      console.warn('Update check failed:', err);
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
