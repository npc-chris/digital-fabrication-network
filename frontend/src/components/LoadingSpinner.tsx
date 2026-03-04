'use client';

import { Loader2 } from 'lucide-react';

export type LoadingSpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: LoadingSpinnerSize;
  /** Custom class name for additional styling */
  className?: string;
}

const sizeClasses: Record<LoadingSpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

/**
 * A reusable loading spinner component.
 * Uses the Loader2 icon from lucide-react with a spinning animation.
 * 
 * @example
 * // Small spinner
 * <LoadingSpinner size="sm" />
 * 
 * // Large spinner with custom color
 * <LoadingSpinner size="lg" className="text-primary-600" />
 */
export default function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={`animate-spin text-primary-600 ${sizeClasses[size]} ${className}`}
      aria-label="Loading"
    />
  );
}
