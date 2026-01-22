/**
 * Location Verification Page
 * First-run activation page where users enter their activation code
 */

import { useState } from 'react';
import { ShieldCheck, Loader2, AlertCircle, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LocationVerificationPageProps {
  onActivate: (code: string) => Promise<void>;
  error: string | null;
  errorCode: string | null;
}

export function LocationVerificationPage({
  onActivate,
  error,
  errorCode,
}: LocationVerificationPageProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmedCode = code.trim().toUpperCase();
    
    if (!trimmedCode) {
      setLocalError('Please enter an activation code');
      return;
    }

    if (trimmedCode.length < 6) {
      setLocalError('Activation code must be at least 6 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      await onActivate(trimmedCode);
    } catch (err) {
      // Error is handled by parent via error prop
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  // Map error codes to user-friendly messages
  const getErrorMessage = (errorCode: string | null, message: string) => {
    switch (errorCode) {
      case 'invalid_code':
        return 'Invalid activation code. Please check and try again.';
      case 'expired_code':
        return 'This activation code has expired. Contact your manager for a new code.';
      case 'max_activations_reached':
        return 'Maximum devices reached for this code. Contact your manager.';
      case 'tenant_inactive':
        return 'This restaurant location is not active. Contact support.';
      case 'device_revoked':
        return 'This device has been revoked. Contact support.';
      case 'no_pack_published':
        return 'Menu data not yet published. Contact support.';
      case 'checksum_mismatch':
        return `Menu data verification failed. Details: ${message}`;
      case 'function_not_deployed':
        return '⚠️ Server not ready: Edge Functions are not deployed. Contact your administrator.';
      case 'config_missing':
        return '⚠️ App not configured: Supabase environment variables missing.';
      case 'network_error':
        return 'Network error. Please check your internet connection and try again.';
      case 'server_error':
        return 'Server error. Please try again in a few moments.';
      default:
        // Show full error message for debugging
        return message ? `${message} (code: ${errorCode || 'unknown'})` : 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
      
      <Card className="w-full max-w-lg relative z-10 bg-slate-800/90 border-slate-700 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-lg">
              <Flame className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <CardTitle className="text-2xl md:text-3xl font-bold text-white">
            Location Verification
          </CardTitle>
          <p className="text-slate-400 mt-2 text-base md:text-lg">
            Enter your restaurant's activation code to get started
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Activation code input */}
            <div className="space-y-2">
              <label
                htmlFor="activation-code"
                className="block text-sm font-medium text-slate-300"
              >
                Activation Code
              </label>
              <input
                id="activation-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={12}
                disabled={isSubmitting}
                autoComplete="off"
                autoCapitalize="characters"
                className="w-full px-4 py-4 text-2xl md:text-3xl text-center font-mono tracking-[0.3em]
                  bg-slate-900/50 border-2 border-slate-600 rounded-xl
                  text-white placeholder-slate-500
                  focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200"
              />
              <p className="text-xs text-slate-500 text-center">
                Ask your manager for the activation code
              </p>
            </div>

            {/* Error message */}
            {displayError && (
              <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">
                  {getErrorMessage(errorCode, displayError)}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="w-full py-4 px-6 text-lg font-semibold
                bg-gradient-to-r from-amber-500 to-orange-600
                hover:from-amber-600 hover:to-orange-700
                text-white rounded-xl
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                flex items-center justify-center gap-3
                shadow-lg hover:shadow-amber-500/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Activate Station
                </>
              )}
            </button>
          </form>

          {/* Footer info */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure activation • Data encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
