'use client';

import LoadingSpinner, { LoadingSpinnerSize } from './LoadingSpinner';

interface LoadingScreenProps {
  /** Loading message to display below the spinner */
  message?: string;
  /** Size of the spinner */
  spinnerSize?: LoadingSpinnerSize;
  /** Whether to show a full viewport height screen */
  fullScreen?: boolean;
  /** Custom class name for additional styling */
  className?: string;
}

/**
 * A reusable full-page or section loading screen component.
 * Displays a centered spinner with an optional message.
 * 
 * @example
 * // Full screen loading
 * <LoadingScreen message="Loading dashboard..." fullScreen />
 * 
 * // Section loading
 * <LoadingScreen message="Fetching data..." />
 */
export default function LoadingScreen({
  message = 'Loading...',
  spinnerSize = 'xl',
  fullScreen = true,
  className = '',
}: LoadingScreenProps) {
  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center py-12';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <LoadingSpinner size={spinnerSize} />
        </div>
        {message && (
          <p className="text-gray-600 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}
