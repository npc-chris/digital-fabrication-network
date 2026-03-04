'use client';

import { useEffect, useRef } from 'react';
import LoadingSpinner, { LoadingSpinnerSize } from './LoadingSpinner';

interface LoadingModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Loading message to display below the spinner */
  message?: string;
  /** Size of the spinner */
  spinnerSize?: LoadingSpinnerSize;
  /** Whether to show a dark overlay background */
  showOverlay?: boolean;
  /** Custom class name for additional styling */
  className?: string;
}

/**
 * A reusable loading modal component.
 * Displays a centered spinner with an optional message in a modal overlay.
 * Prevents body scroll when open.
 * 
 * @example
 * // Basic loading modal
 * <LoadingModal isOpen={isLoading} message="Saving changes..." />
 * 
 * // Loading modal without overlay
 * <LoadingModal isOpen={isLoading} showOverlay={false} />
 */
export default function LoadingModal({
  isOpen,
  message = 'Please wait...',
  spinnerSize = 'lg',
  showOverlay = true,
  className = '',
}: LoadingModalProps) {
  // Store original overflow value
  const originalOverflow = useRef<string>('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store the original overflow value before modifying
      originalOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      // Restore the original overflow value when modal closes
      document.body.style.overflow = originalOverflow.current;
    }

    return () => {
      // Cleanup: restore original overflow on unmount
      if (isOpen) {
        document.body.style.overflow = originalOverflow.current;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        showOverlay ? 'bg-black bg-opacity-50' : ''
      } ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <LoadingSpinner size={spinnerSize} />
          </div>
          {message && (
            <p className="text-gray-700 font-medium">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
