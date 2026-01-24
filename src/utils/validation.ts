/**
 * Input Validation and Sanitization
 * Protects against XSS, injection, and malformed input
 */

import { z } from 'zod';
import DOMPurify from 'dompurify';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Activation code schema
 * 6 alphanumeric characters (uppercase)
 */
export const ActivationCodeSchema = z
  .string()
  .min(4, 'Activation code must be at least 4 characters')
  .max(10, 'Activation code must be at most 10 characters')
  .regex(/^[A-Z0-9]+$/, 'Activation code must contain only uppercase letters and numbers')
  .transform((val) => val.toUpperCase().trim());

/**
 * Device fingerprint schema
 * UUID v4 format
 */
export const DeviceFingerprintSchema = z
  .string()
  .uuid('Device fingerprint must be a valid UUID')
  .max(128, 'Device fingerprint is too long');

/**
 * Custom allergen text schema
 * User-provided allergen that's not in the predefined list
 */
export const CustomAllergenTextSchema = z
  .string()
  .max(500, 'Custom allergen description is too long (max 500 characters)')
  .transform((val) => val.trim());

/**
 * Device token schema
 */
export const DeviceTokenSchema = z
  .string()
  .min(32, 'Device token is invalid')
  .max(256, 'Device token is too long');

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitize HTML to prevent XSS attacks
 * Strips all HTML tags except safe formatting
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize text for display
 * Removes all HTML and scripts
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Validate activation code
 * Returns validated & normalized code or throws error
 */
export function validateActivationCode(code: string): string {
  try {
    return ActivationCodeSchema.parse(code);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    throw error;
  }
}

/**
 * Validate device fingerprint
 */
export function validateDeviceFingerprint(fingerprint: string): string {
  try {
    return DeviceFingerprintSchema.parse(fingerprint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid device fingerprint');
    }
    throw error;
  }
}

/**
 * Validate and sanitize custom allergen text
 */
export function validateCustomAllergenText(text: string): string {
  try {
    const validated = CustomAllergenTextSchema.parse(text);
    return sanitizeText(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    throw error;
  }
}

/**
 * Validate device token
 */
export function validateDeviceToken(token: string): string {
  try {
    return DeviceTokenSchema.parse(token);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid device token');
    }
    throw error;
  }
}

// ============================================================================
// RATE LIMITING (Client-side)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Client-side rate limiting
 * Prevents rapid-fire requests that could indicate abuse
 *
 * @param key - Unique key for the action (e.g., 'activation')
 * @param maxAttempts - Maximum attempts allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No entry or expired - allow
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  // Within window - check count
  if (entry.count >= maxAttempts) {
    return false;
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  return true;
}

/**
 * Get time until rate limit resets
 */
export function getRateLimitResetTime(key: string): number {
  const entry = rateLimitStore.get(key);
  if (!entry) return 0;

  const now = Date.now();
  return Math.max(0, entry.resetAt - now);
}

/**
 * Clear rate limit for a key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}
