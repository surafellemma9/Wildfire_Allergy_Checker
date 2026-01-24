/**
 * Tenant Module Exports
 */

// Types
export * from './packTypes';

// Storage
export {
  getTenantContext,
  saveTenantContext,
  clearTenantContext,
  getCachedPack,
  saveCachedPack,
  clearCachedPack,
  clearAllTenantData,
} from './storage';

// Device fingerprint
export {
  getOrCreateDeviceFingerprint,
  getDeviceFingerprint,
  clearDeviceFingerprint,
} from './deviceFingerprint';

// Pack client
export {
  computeChecksum,
  verifyChecksum,
  downloadPack,
  activateDevice,
  getLatestPackInfo,
  performFullActivation,
  checkAndDownloadUpdate,
  loadPackFromCache,
  ActivationError,
  PackError,
} from './packClient';

// Pack validator
export {
  validateAndMigratePack,
  runSmokeCheck,
  logPackDebugInfo,
} from './packValidator';
export type { ValidationResult, SmokeCheckResult } from './packValidator';

// Hook
export { useTenant } from './useTenant';
export type { UseTenantState, UseTenantActions, UseTenantReturn } from './useTenant';
