/**
 * Utility for merging Tailwind CSS classes
 * Handles conditional classes and removes duplicates
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Glass morphism card styles
 * Consistent glassmorphism effect across the app
 */
export const glassCard = cn(
  'bg-[rgba(255,255,255,0.03)]',
  'backdrop-blur-[12px]',
  'border border-[rgba(255,255,255,0.08)]',
  'rounded-xl',
  'shadow-glass',
  'transition-all duration-200',
  'hover:bg-[rgba(255,255,255,0.06)]'
);

/**
 * Premium button styles
 */
export const buttonPrimary = cn(
  'bg-gradient-to-br from-premium-gold to-premium-gold-dark',
  'text-black font-semibold',
  'px-6 py-3 rounded-lg',
  'shadow-glow-accent',
  'transition-all duration-200',
  'hover:-translate-y-0.5 hover:shadow-lg',
  'active:translate-y-0',
  'focus-visible:ring-2 focus-visible:ring-premium-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black'
);

export const buttonSecondary = cn(
  'bg-[rgba(255,255,255,0.05)]',
  'backdrop-blur-glass',
  'border border-[rgba(255,255,255,0.1)]',
  'text-white font-medium',
  'px-6 py-3 rounded-lg',
  'transition-all duration-200',
  'hover:bg-[rgba(255,255,255,0.08)]',
  'active:bg-[rgba(255,255,255,0.10)]'
);

/**
 * Status badge styles
 */
export const statusBadge = {
  SAFE: cn(
    'bg-status-safe-bg',
    'text-status-safe',
    'border border-status-safe-border',
    'px-3 py-1.5 rounded-lg',
    'font-medium text-sm',
    'inline-flex items-center gap-2'
  ),
  UNSAFE: cn(
    'bg-status-unsafe-bg',
    'text-status-unsafe',
    'border border-status-unsafe-border',
    'px-3 py-1.5 rounded-lg',
    'font-medium text-sm',
    'inline-flex items-center gap-2'
  ),
  MODIFY: cn(
    'bg-status-modify-bg',
    'text-status-modify',
    'border border-status-modify-border',
    'px-3 py-1.5 rounded-lg',
    'font-medium text-sm',
    'inline-flex items-center gap-2'
  ),
  UNKNOWN: cn(
    'bg-status-unknown-bg',
    'text-status-unknown',
    'border border-status-unknown-border',
    'px-3 py-1.5 rounded-lg',
    'font-medium text-sm',
    'inline-flex items-center gap-2'
  ),
};
