/**
 * Tenant Storage Module
 * Uses IndexedDB for persistent storage with localStorage fallback
 */

import type { TenantContext, CachedPack, TenantPack } from './packTypes';

const DB_NAME = 'wildfire_allergy_db';
const DB_VERSION = 1;
const TENANT_STORE = 'tenant_context';
const PACK_STORE = 'cached_pack';

// Fallback keys for localStorage
const LS_TENANT_KEY = 'wildfire_tenant_context';
const LS_PACK_KEY = 'wildfire_cached_pack';

let db: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

/**
 * Initialize IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
  if (db) return db;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Create tenant context store
      if (!database.objectStoreNames.contains(TENANT_STORE)) {
        database.createObjectStore(TENANT_STORE, { keyPath: 'key' });
      }
      
      // Create cached pack store
      if (!database.objectStoreNames.contains(PACK_STORE)) {
        database.createObjectStore(PACK_STORE, { keyPath: 'key' });
      }
    };
  });

  return dbInitPromise;
}

/**
 * Check if IndexedDB is available
 */
function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

// ============================================================================
// TENANT CONTEXT
// ============================================================================

/**
 * Get tenant context from storage
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  if (isIndexedDBAvailable()) {
    try {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(TENANT_STORE, 'readonly');
        const store = transaction.objectStore(TENANT_STORE);
        const request = store.get('context');

        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB read failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(LS_TENANT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Save tenant context to storage
 */
export async function saveTenantContext(context: TenantContext): Promise<void> {
  if (isIndexedDBAvailable()) {
    try {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(TENANT_STORE, 'readwrite');
        const store = transaction.objectStore(TENANT_STORE);
        const request = store.put({ key: 'context', data: context });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB write failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  localStorage.setItem(LS_TENANT_KEY, JSON.stringify(context));
}

/**
 * Clear tenant context from storage
 */
export async function clearTenantContext(): Promise<void> {
  if (isIndexedDBAvailable()) {
    try {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(TENANT_STORE, 'readwrite');
        const store = transaction.objectStore(TENANT_STORE);
        const request = store.delete('context');

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB delete failed:', error);
    }
  }

  // Also clear localStorage
  localStorage.removeItem(LS_TENANT_KEY);
}

// ============================================================================
// CACHED PACK
// ============================================================================

/**
 * Get cached pack from storage
 */
export async function getCachedPack(): Promise<CachedPack | null> {
  if (isIndexedDBAvailable()) {
    try {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(PACK_STORE, 'readonly');
        const store = transaction.objectStore(PACK_STORE);
        const request = store.get('pack');

        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB read failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(LS_PACK_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Save cached pack to storage
 */
export async function saveCachedPack(pack: TenantPack, checksum: string): Promise<void> {
  const cachedPack: CachedPack = {
    pack,
    checksum,
    storedAt: new Date().toISOString(),
  };

  if (isIndexedDBAvailable()) {
    try {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(PACK_STORE, 'readwrite');
        const store = transaction.objectStore(PACK_STORE);
        const request = store.put({ key: 'pack', data: cachedPack });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB write failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  try {
    localStorage.setItem(LS_PACK_KEY, JSON.stringify(cachedPack));
  } catch (error) {
    // localStorage might be full
    console.error('Failed to save pack to localStorage:', error);
    throw new Error('Failed to cache menu data. Storage may be full.');
  }
}

/**
 * Clear cached pack from storage
 */
export async function clearCachedPack(): Promise<void> {
  if (isIndexedDBAvailable()) {
    try {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(PACK_STORE, 'readwrite');
        const store = transaction.objectStore(PACK_STORE);
        const request = store.delete('pack');

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB delete failed:', error);
    }
  }

  // Also clear localStorage
  localStorage.removeItem(LS_PACK_KEY);
}

/**
 * Clear all tenant data (context + pack)
 */
export async function clearAllTenantData(): Promise<void> {
  await clearTenantContext();
  await clearCachedPack();
}
