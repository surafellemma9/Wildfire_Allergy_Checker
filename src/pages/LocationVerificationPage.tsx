/**
 * Location Verification Page
 * First-run activation page where users enter their activation code
 * Modern light theme with orbital glow animations
 */

import { useState, useRef, useEffect } from 'react';
import { Loader2, AlertCircle, Lock, Unlock, KeyRound } from 'lucide-react';

// Orbital glow component with rotating circles
function OrbitalGlow({ 
  size = 80, 
  isActive = false,
  isUnlocking = false 
}: { 
  size?: number; 
  isActive?: boolean;
  isUnlocking?: boolean;
}) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ width: size, height: size }}
    >
      {/* Outer orbital ring */}
      <div 
        className={`
          absolute inset-[-8px] rounded-[2rem]
          transition-opacity duration-500
          ${isActive || isUnlocking ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          animation: isActive || isUnlocking ? 'spin 8s linear infinite' : 'none',
        }}
      >
        {/* Glowing orbs on the orbit */}
        <div 
          className={`
            absolute w-3 h-3 rounded-full blur-[2px]
            ${isUnlocking ? 'bg-emerald-400' : 'bg-green-400'}
          `}
          style={{ top: '50%', left: '-6px', transform: 'translateY(-50%)' }}
        />
        <div 
          className={`
            absolute w-2 h-2 rounded-full blur-[1px]
            ${isUnlocking ? 'bg-emerald-300' : 'bg-emerald-400'}
          `}
          style={{ top: '-4px', left: '50%', transform: 'translateX(-50%)' }}
        />
        <div 
          className={`
            absolute w-2.5 h-2.5 rounded-full blur-[2px]
            ${isUnlocking ? 'bg-emerald-500' : 'bg-teal-400'}
          `}
          style={{ bottom: '-4px', left: '50%', transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Second orbital ring - counter rotation */}
      <div 
        className={`
          absolute inset-[-12px] rounded-[2.5rem]
          transition-opacity duration-500
          ${isActive || isUnlocking ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          animation: isActive || isUnlocking ? 'spin 12s linear infinite reverse' : 'none',
        }}
      >
        <div 
          className={`
            absolute w-2 h-2 rounded-full blur-[1px]
            ${isUnlocking ? 'bg-green-400' : 'bg-green-300'}
          `}
          style={{ top: '20%', right: '-4px' }}
        />
        <div 
          className={`
            absolute w-1.5 h-1.5 rounded-full blur-[1px]
            ${isUnlocking ? 'bg-teal-400' : 'bg-emerald-300'}
          `}
          style={{ bottom: '20%', left: '-3px' }}
        />
      </div>

      {/* Inner glow */}
      <div 
        className={`
          absolute inset-0 rounded-3xl
          transition-all duration-500
          ${isUnlocking 
            ? 'bg-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,0.4)]' 
            : isActive 
              ? 'bg-green-400/10 shadow-[0_0_20px_rgba(74,222,128,0.3)]'
              : ''
          }
        `}
      />
    </div>
  );
}

// Card orbital glow
function CardOrbitalGlow({ isActive = false }: { isActive?: boolean }) {
  return (
    <>
      {/* Rotating rainbow/green border glow */}
      <div 
        className="absolute inset-[-3px] rounded-[2.2rem] pointer-events-none"
        style={{
          background: isActive 
            ? 'conic-gradient(from 0deg, rgba(74,222,128,0.9), rgba(52,211,153,0.9), rgba(16,185,129,0.9), rgba(74,222,128,0.9))'
            : 'conic-gradient(from 0deg, rgba(239,68,68,0.8), rgba(249,115,22,0.8), rgba(234,179,8,0.8), rgba(34,197,94,0.8), rgba(59,130,246,0.8), rgba(168,85,247,0.8), rgba(236,72,153,0.8), rgba(239,68,68,0.8))',
          animation: 'spin 3s linear infinite',
          padding: '3px',
        }}
      >
        <div className="w-full h-full bg-gray-900 rounded-[2rem]" />
      </div>
      
      {/* Outer glow effect */}
      <div 
        className="absolute inset-[-8px] rounded-[2.5rem] pointer-events-none opacity-70 blur-lg"
        style={{
          background: isActive 
            ? 'conic-gradient(from 0deg, rgba(74,222,128,0.6), rgba(52,211,153,0.6), rgba(16,185,129,0.6), rgba(74,222,128,0.6))'
            : 'conic-gradient(from 0deg, rgba(239,68,68,0.5), rgba(249,115,22,0.5), rgba(234,179,8,0.5), rgba(34,197,94,0.5), rgba(59,130,246,0.5), rgba(168,85,247,0.5), rgba(236,72,153,0.5), rgba(239,68,68,0.5))',
          animation: 'spin 3s linear infinite',
        }}
      />
      
      {/* Floating orbs around the card */}
      <div 
        className={`
          absolute w-4 h-4 rounded-full blur-md pointer-events-none
          transition-all duration-500
          ${isActive ? 'bg-green-400/60' : 'bg-rose-400/60'}
        `}
        style={{
          animation: 'float-orb-1 6s ease-in-out infinite',
        }}
      />
      <div 
        className={`
          absolute w-3 h-3 rounded-full blur-md pointer-events-none
          transition-all duration-500
          ${isActive ? 'bg-emerald-400/60' : 'bg-blue-400/60'}
        `}
        style={{
          animation: 'float-orb-2 8s ease-in-out infinite',
        }}
      />
      <div 
        className={`
          absolute w-3 h-3 rounded-full blur-md pointer-events-none
          transition-all duration-500
          ${isActive ? 'bg-teal-400/60' : 'bg-purple-400/60'}
        `}
        style={{
          animation: 'float-orb-3 7s ease-in-out infinite',
        }}
      />
    </>
  );
}

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
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6).split('');
      const newCode = [...code];
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const newCode = [...code];
      newCode[index] = char;
      setCode(newCode);
      
      if (char && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const fullCode = code.join('').trim();
    
    if (!fullCode) {
      setLocalError('Please enter an activation code');
      return;
    }

    if (fullCode.length < 6) {
      setLocalError('Please enter all 6 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setIsUnlocking(true);
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      await onActivate(fullCode);
    } catch (err) {
      setIsUnlocking(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;
  const isComplete = code.every(c => c !== '');

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
        return 'Server not ready. Contact your administrator.';
      case 'config_missing':
        return 'App not configured. Contact support.';
      case 'network_error':
        return 'Network error. Please check your connection.';
      case 'server_error':
        return 'Server error. Please try again.';
      default:
        return message || 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Radial gradient from center */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, #374151 0%, #1f2937 40%, #111827 70%, #000000 100%)',
        }}
      />
      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float-orb-1 {
          0%, 100% { top: 10%; left: -8px; }
          25% { top: -8px; left: 30%; }
          50% { top: 10%; right: -8px; left: auto; }
          75% { top: 50%; right: -8px; left: auto; }
        }
        @keyframes float-orb-2 {
          0%, 100% { bottom: 20%; right: -6px; }
          33% { bottom: -6px; right: 40%; }
          66% { bottom: 30%; left: -6px; right: auto; }
        }
        @keyframes float-orb-3 {
          0%, 100% { top: 50%; left: -6px; }
          50% { bottom: -6px; left: 60%; top: auto; }
        }
        @keyframes unlock-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes success-ring {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
      `}</style>

      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500 rounded-full blur-3xl opacity-10" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10" />
      </div>
      
      <div className={`
        w-full max-w-md relative z-10 
        transition-all duration-1000 ease-out
        ${isUnlocking ? 'scale-95 opacity-0 translate-y-8' : 'scale-100 opacity-100'}
      `}>
        {/* Card with orbital glow */}
        <div className="relative p-2">
          <CardOrbitalGlow isActive={isComplete && !isUnlocking} />
          
          <div className={`
            relative bg-gray-900 rounded-[2rem] shadow-2xl shadow-black/50
            overflow-hidden z-10
          `}>
            {/* Header */}
            <div className="pt-10 pb-6 px-8 text-center">
              {/* Lock Icon with orbital glow */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <OrbitalGlow 
                    size={80} 
                    isActive={isComplete} 
                    isUnlocking={isUnlocking}
                  />
                  
                  <div className={`
                    relative w-20 h-20 rounded-3xl
                    bg-gradient-to-br from-gray-800 to-gray-900
                    border border-gray-700
                    flex items-center justify-center
                    shadow-lg
                    transition-all duration-500
                    ${isUnlocking ? 'bg-emerald-900/50 border-emerald-500 scale-110' : ''}
                    ${isComplete && !isUnlocking ? 'border-green-500' : ''}
                  `}>
                    <div className={`
                      transition-all duration-500 
                      ${isUnlocking ? 'text-emerald-500 scale-110' : isComplete ? 'text-green-500' : 'text-gray-400'}
                    `}>
                      {isUnlocking ? (
                        <Unlock className="w-9 h-9" strokeWidth={1.5} />
                      ) : (
                        <Lock className="w-9 h-9" strokeWidth={1.5} />
                      )}
                    </div>
                    
                    {/* Success rings on unlock */}
                    {isUnlocking && (
                      <>
                        <div 
                          className="absolute inset-0 rounded-3xl border-2 border-emerald-400"
                          style={{ animation: 'success-ring 1s ease-out forwards' }}
                        />
                        <div 
                          className="absolute inset-0 rounded-3xl border-2 border-emerald-400"
                          style={{ animation: 'success-ring 1s ease-out 0.2s forwards' }}
                        />
                        <div 
                          className="absolute inset-0 rounded-3xl border-2 border-emerald-400"
                          style={{ animation: 'success-ring 1s ease-out 0.4s forwards' }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
              
          <h1 className="text-2xl font-semibold text-white mb-2">
            Welcome
          </h1>
          <p className="text-gray-400 text-base">
            Enter your activation code to continue
          </p>
            </div>

            {/* Form */}
            <div className="px-8 pb-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Code input boxes */}
                <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-400 text-center">
                Activation Code
              </label>
                  
                  <div className="flex justify-center gap-2">
                    {code.map((char, index) => (
                      <div key={index} className="relative">
                        {/* Individual input glow when filled */}
                        {char && (
                          <div 
                            className="absolute inset-0 rounded-xl bg-green-500/30 blur-md"
                            style={{
                              animation: 'pulse 2s ease-in-out infinite',
                            }}
                          />
                        )}
                        <input
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          value={char}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          disabled={isSubmitting}
                          maxLength={6}
                          className={`
                            relative w-12 h-14 text-center text-xl font-semibold
                            bg-gray-800 border-2 rounded-xl
                            text-white placeholder-gray-500
                            focus:outline-none focus:bg-gray-800
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-200
                            ${char 
                              ? 'border-green-500 bg-gray-800 shadow-sm shadow-green-500/20' 
                              : 'border-gray-700'
                            }
                            ${isComplete && !isSubmitting 
                              ? 'border-green-400 bg-gray-800' 
                              : ''
                            }
                            focus:border-green-400 focus:ring-4 focus:ring-green-500/20
                          `}
                          placeholder="•"
                        />
                      </div>
                    ))}
                  </div>
                  
              <p className="text-xs text-gray-500 text-center">
                Ask your manager for the code
              </p>
                </div>

            {/* Error message */}
            {displayError && !isUnlocking && (
              <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-800 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">
                  {getErrorMessage(errorCode, displayError)}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !isComplete}
              className={`
                relative w-full py-4 px-6 text-base font-semibold
                rounded-2xl overflow-hidden
                transition-all duration-300
                flex items-center justify-center gap-3
                ${isComplete && !isSubmitting
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {/* Button glow effect */}
              {isComplete && !isSubmitting && (
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-400/30 to-green-400/20"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s linear infinite',
                  }}
                />
              )}
                  
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Unlocking...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
              </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Lock className="w-3.5 h-3.5" />
              <span>Secure connection</span>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
