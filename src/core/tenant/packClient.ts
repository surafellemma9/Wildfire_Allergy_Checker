/**
 * Pack Client Module
 * Handles downloading, verifying, and caching tenant packs
 */

import type {
  TenantPack,
  TenantContext,
  ActivateResponse,
  GetLatestPackResponse,
  ApiError,
} from './packTypes';
import { saveTenantContext, saveCachedPack, getCachedPack } from './storage';
import { getOrCreateDeviceFingerprint } from './deviceFingerprint';
import { validateAndMigratePack, logPackDebugInfo } from './packValidator';
import {
  validateActivationCode,
  validateDeviceFingerprint,
  validateDeviceToken,
  checkRateLimit,
  getRateLimitResetTime,
} from '../../utils/validation';
import { devLog } from '../../config/env';

// Supabase Edge Function URLs
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Compute SHA-256 checksum of a string
 */
export async function computeChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify pack checksum
 */
export async function verifyChecksum(
  packJsonString: string,
  expectedChecksum: string
): Promise<boolean> {
  const computed = await computeChecksum(packJsonString);
  return computed === expectedChecksum;
}

/**
 * Download pack from signed URL
 */
export async function downloadPack(signedUrl: string): Promise<string> {
  const response = await fetch(signedUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to download pack: ${response.status} ${response.statusText}`);
  }
  
  return response.text();
}

/**
 * Activate device with activation code
 */
export async function activateDevice(code: string): Promise<ActivateResponse> {
  // Client-side rate limiting (5 attempts per minute)
  if (!checkRateLimit('activation', 5, 60000)) {
    const resetMs = getRateLimitResetTime('activation');
    const resetSec = Math.ceil(resetMs / 1000);
    throw new ActivationError(
      `Too many activation attempts. Please wait ${resetSec} seconds and try again.`,
      'rate_limited'
    );
  }

  // Validate and sanitize inputs
  let validatedCode: string;
  try {
    validatedCode = validateActivationCode(code);
  } catch (error) {
    throw new ActivationError(
      error instanceof Error ? error.message : 'Invalid activation code format',
      'invalid_code'
    );
  }

  const deviceFingerprint = getOrCreateDeviceFingerprint();

  // Validate device fingerprint
  try {
    validateDeviceFingerprint(deviceFingerprint);
  } catch (error) {
    throw new ActivationError(
      'Device fingerprint validation failed. Please clear app data and try again.',
      'invalid_fingerprint'
    );
  }

  // Check if Supabase is configured
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new ActivationError(
      'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
      'config_missing'
    );
  }

  let response: Response;
  try {
    response = await fetch(`${FUNCTIONS_URL}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ code: validatedCode, deviceFingerprint }),
    });
  } catch (networkError) {
    throw new ActivationError(
      'Network error. Check your internet connection.',
      'network_error'
    );
  }

  // Handle 404 = Edge Function not deployed
  if (response.status === 404) {
    throw new ActivationError(
      'Activation service not available. Edge Functions may not be deployed.',
      'function_not_deployed'
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new ActivationError(
      `Server error (${response.status}). Please try again.`,
      'server_error'
    );
  }

  if (!response.ok) {
    const error = data as ApiError;
    throw new ActivationError(error.error || 'Activation failed', error.code || 'unknown_error');
  }

  return data as ActivateResponse;
}

/**
 * Get latest pack info for authenticated device
 */
export async function getLatestPackInfo(
  deviceToken: string
): Promise<GetLatestPackResponse> {
  // Validate device token
  try {
    validateDeviceToken(deviceToken);
  } catch (error) {
    throw new PackError('Invalid device token', 'invalid_token');
  }

  const response = await fetch(`${FUNCTIONS_URL}/get_latest_pack`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ deviceToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    throw new PackError(error.error, error.code);
  }

  return data as GetLatestPackResponse;
}

/**
 * Full activation flow:
 * 1. Activate device
 * 2. Download pack
 * 3. Verify checksum
 * 4. Save to cache
 * 5. Save tenant context
 */
export async function performFullActivation(code: string): Promise<{
  tenantContext: TenantContext;
  pack: TenantPack;
}> {
  devLog('[performFullActivation] Starting...');
  
  // 1. Activate device
  const activationResponse = await activateDevice(code);
  devLog('[performFullActivation] Activation response:', {
    tenantId: activationResponse.tenant.id,
    packVersion: activationResponse.pack.version,
    expectedChecksum: activationResponse.pack.checksum,
  });

  // 2. Download pack
  devLog('[performFullActivation] Downloading pack...');
  const packJsonString = await downloadPack(activationResponse.pack.signedUrl);
  devLog('[performFullActivation] Downloaded bytes:', packJsonString.length);

  // 3. Verify checksum
  const computedChecksum = await computeChecksum(packJsonString);
  devLog('[performFullActivation] Checksum comparison:', {
    expected: activationResponse.pack.checksum,
    computed: computedChecksum,
    match: computedChecksum === activationResponse.pack.checksum,
  });
  
  const isValid = computedChecksum === activationResponse.pack.checksum;
  if (!isValid) {
    throw new PackError(
      `Pack checksum verification failed. Expected: ${activationResponse.pack.checksum}, Got: ${computedChecksum}`,
      'checksum_mismatch'
    );
  }

  // 4. Parse and validate pack
  devLog('[performFullActivation] Parsing and validating pack...');
  const rawPack = JSON.parse(packJsonString);
  const { result: validationResult, pack } = validateAndMigratePack(rawPack);
  
  if (!validationResult.valid || !pack) {
    console.error('[performFullActivation] Pack validation failed:', validationResult.errors);
    throw new PackError(
      `Pack validation failed: ${validationResult.errors.join(', ')}`,
      'pack_invalid'
    );
  }
  
  if (validationResult.migrated) {
    devLog('[performFullActivation] Legacy pack was migrated');
  }
  
  // Log pack debug info
  logPackDebugInfo(pack, activationResponse.pack.checksum, 'activation');

  // 5. Save to cache
  await saveCachedPack(pack, activationResponse.pack.checksum);
  devLog('[performFullActivation] Pack saved to cache');

  // 6. Save tenant context
  const tenantContext: TenantContext = {
    tenantId: activationResponse.tenant.id,
    conceptName: activationResponse.tenant.conceptName,
    locationName: activationResponse.tenant.locationName,
    deviceToken: activationResponse.deviceToken,
  };
  await saveTenantContext(tenantContext);

  return { tenantContext, pack };
}

/**
 * Check for and download pack updates
 * Returns the new pack if updated, null if no update needed
 */
export async function checkAndDownloadUpdate(
  deviceToken: string
): Promise<TenantPack | null> {
  devLog('[checkAndDownloadUpdate] Starting update check...');
  
  // Get current cached version
  const cached = await getCachedPack();
  const currentVersion = cached?.pack.version ?? 0;
  const currentChecksum = cached?.checksum ?? '';
  
  devLog('[checkAndDownloadUpdate] Current cached:', {
    version: currentVersion,
    checksum: currentChecksum.substring(0, 16) + '...',
  });

  // Check for latest version
  const latestInfo = await getLatestPackInfo(deviceToken);
  
  devLog('[checkAndDownloadUpdate] Latest available:', {
    version: latestInfo.version,
    checksum: latestInfo.checksum.substring(0, 16) + '...',
  });

  // Check by BOTH version AND checksum (in case pack was regenerated at same version)
  if (latestInfo.version <= currentVersion && latestInfo.checksum === currentChecksum) {
    devLog('[checkAndDownloadUpdate] No update needed (same version and checksum)');
    return null;
  }
  
  devLog('[checkAndDownloadUpdate] Update available! Downloading...');

  // Download new pack (add cache-busting)
  const cacheBustedUrl = latestInfo.signedUrl + (latestInfo.signedUrl.includes('?') ? '&' : '?') + `_t=${Date.now()}`;
  const packJsonString = await downloadPack(cacheBustedUrl);
  devLog('[checkAndDownloadUpdate] Downloaded bytes:', packJsonString.length);

  // Verify checksum
  const computedChecksum = await computeChecksum(packJsonString);
  devLog('[checkAndDownloadUpdate] Checksum comparison:', {
    expected: latestInfo.checksum.substring(0, 16) + '...',
    computed: computedChecksum.substring(0, 16) + '...',
    match: computedChecksum === latestInfo.checksum,
  });
  
  if (computedChecksum !== latestInfo.checksum) {
    throw new PackError('Pack checksum verification failed', 'checksum_mismatch');
  }

  // Parse and validate
  devLog('[checkAndDownloadUpdate] Parsing and validating pack...');
  const rawPack = JSON.parse(packJsonString);
  const { result: validationResult, pack } = validateAndMigratePack(rawPack);
  
  if (!validationResult.valid || !pack) {
    console.error('[checkAndDownloadUpdate] Pack validation failed:', validationResult.errors);
    throw new PackError(
      `Pack validation failed: ${validationResult.errors.join(', ')}`,
      'pack_invalid'
    );
  }
  
  if (validationResult.migrated) {
    devLog('[checkAndDownloadUpdate] Legacy pack was migrated');
  }
  
  // Log pack debug info
  logPackDebugInfo(pack, latestInfo.checksum, 'update');
  
  // Save to cache
  await saveCachedPack(pack, latestInfo.checksum);
  devLog('[checkAndDownloadUpdate] Pack saved to cache');

  return pack;
}

/**
 * Load pack from cache with validation
 */
export async function loadPackFromCache(): Promise<TenantPack | null> {
  devLog('[loadPackFromCache] Loading from cache...');
  const cached = await getCachedPack();
  
  if (!cached) {
    devLog('[loadPackFromCache] No cached pack found');
    return null;
  }
  
  // Validate cached pack (in case schema changed)
  const { result: validationResult, pack } = validateAndMigratePack(cached.pack);
  
  if (!validationResult.valid || !pack) {
    console.error('[loadPackFromCache] Cached pack is invalid:', validationResult.errors);
    return null;
  }
  
  if (validationResult.migrated) {
    devLog('[loadPackFromCache] Cached pack was migrated to new schema');
    // Save migrated pack back to cache
    await saveCachedPack(pack, cached.checksum);
  }
  
  logPackDebugInfo(pack, cached.checksum, 'cache');
  
  return pack;
}

// ============================================================================
// Custom Error Classes
// ============================================================================

export class ActivationError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'ActivationError';
    this.code = code;
  }
}

export class PackError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'PackError';
    this.code = code;
  }
}
