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
  const deviceFingerprint = getOrCreateDeviceFingerprint();

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
      body: JSON.stringify({ code, deviceFingerprint }),
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
  console.log('[performFullActivation] Starting...');
  
  // 1. Activate device
  const activationResponse = await activateDevice(code);
  console.log('[performFullActivation] Activation response:', {
    tenantId: activationResponse.tenant.id,
    packVersion: activationResponse.pack.version,
    expectedChecksum: activationResponse.pack.checksum,
  });

  // 2. Download pack
  console.log('[performFullActivation] Downloading pack...');
  const packJsonString = await downloadPack(activationResponse.pack.signedUrl);
  console.log('[performFullActivation] Downloaded bytes:', packJsonString.length);

  // 3. Verify checksum
  const computedChecksum = await computeChecksum(packJsonString);
  console.log('[performFullActivation] Checksum comparison:', {
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

  // 4. Parse pack
  const pack: TenantPack = JSON.parse(packJsonString);

  // 5. Save to cache
  await saveCachedPack(pack, activationResponse.pack.checksum);

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
  // Get current cached version
  const cached = await getCachedPack();
  const currentVersion = cached?.pack.version ?? 0;

  // Check for latest version
  const latestInfo = await getLatestPackInfo(deviceToken);

  // If no update needed
  if (latestInfo.version <= currentVersion) {
    return null;
  }

  // Download new pack
  const packJsonString = await downloadPack(latestInfo.signedUrl);

  // Verify checksum
  const isValid = await verifyChecksum(packJsonString, latestInfo.checksum);
  if (!isValid) {
    throw new PackError('Pack checksum verification failed', 'checksum_mismatch');
  }

  // Parse and save
  const pack: TenantPack = JSON.parse(packJsonString);
  await saveCachedPack(pack, latestInfo.checksum);

  return pack;
}

/**
 * Load pack from cache
 */
export async function loadPackFromCache(): Promise<TenantPack | null> {
  const cached = await getCachedPack();
  return cached?.pack ?? null;
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
