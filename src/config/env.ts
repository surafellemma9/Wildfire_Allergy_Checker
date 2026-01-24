/**
 * Environment Configuration Validation
 * Validates required environment variables on app startup
 * Prevents silent failures from misconfiguration
 */

import { z } from 'zod';

// Schema for environment variables
const EnvSchema = z.object({
  VITE_SUPABASE_URL: z
    .string()
    .url('VITE_SUPABASE_URL must be a valid URL')
    .startsWith('https://', 'VITE_SUPABASE_URL must use HTTPS'),

  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(100, 'VITE_SUPABASE_ANON_KEY appears to be invalid (too short)')
    .startsWith('eyJ', 'VITE_SUPABASE_ANON_KEY must be a valid JWT'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * Validate and return environment configuration
 * Throws detailed error if validation fails
 */
export function validateEnv(): EnvConfig {
  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  try {
    return EnvSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err: z.ZodIssue) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(
        `❌ Environment configuration error:\n\n${missingVars}\n\n` +
        `Please check your .env file and ensure all required variables are set.\n` +
        `See .env.example for reference.`
      );
    }
    throw error;
  }
}

/**
 * Check if app is running in development mode
 */
export function isDev(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if app is running in production mode
 */
export function isProd(): boolean {
  return import.meta.env.PROD;
}

/**
 * Safe console.log that only logs in development
 */
export function devLog(...args: any[]): void {
  if (isDev()) {
    console.log(...args);
  }
}

/**
 * Enforce HTTPS in production
 * Redirects to HTTPS if on HTTP (except localhost)
 */
export function enforceHttps(): void {
  if (typeof window === 'undefined') return;

  const isLocalhost = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';

  if (!isLocalhost && window.location.protocol === 'http:') {
    const httpsUrl = window.location.href.replace('http://', 'https://');
    console.error(
      '🚨 SECURITY WARNING: App running on HTTP in production!\n' +
      `Redirecting to: ${httpsUrl}`
    );
    window.location.replace(httpsUrl);
  }
}
