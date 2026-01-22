/**
 * Device Fingerprint Module
 * Generates and stores a stable device identifier without native permissions
 */

const FINGERPRINT_KEY = 'wildfire_device_fingerprint';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback to manual generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a stable device fingerprint
 * The fingerprint is a UUID stored locally and persists across sessions
 */
export function getOrCreateDeviceFingerprint(): string {
  // Try to get existing fingerprint from localStorage
  let fingerprint = localStorage.getItem(FINGERPRINT_KEY);

  if (!fingerprint) {
    // Generate new fingerprint
    fingerprint = generateUUID();
    localStorage.setItem(FINGERPRINT_KEY, fingerprint);
  }

  return fingerprint;
}

/**
 * Clear the device fingerprint (use with caution - will require re-activation)
 */
export function clearDeviceFingerprint(): void {
  localStorage.removeItem(FINGERPRINT_KEY);
}

/**
 * Get the current device fingerprint without creating a new one
 */
export function getDeviceFingerprint(): string | null {
  return localStorage.getItem(FINGERPRINT_KEY);
}
