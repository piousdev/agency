'use client';

import { useEffect } from 'react';
import { useIdleTimeout } from '@/lib/hooks/use-idle-timeout';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * Idle Timeout Provider
 *
 * Wraps the application and provides idle timeout functionality.
 * Shows a warning dialog before logging the user out automatically.
 *
 * Features:
 * - Tracks user activity (mouse, keyboard, touch)
 * - Shows warning dialog 5 minutes before logout
 * - Displays countdown timer
 * - Auto-logout after 30 minutes of inactivity
 * - "Stay logged in" button to reset timer
 *
 * Usage:
 * ```tsx
 * <IdleTimeoutProvider>
 *   <YourApp />
 * </IdleTimeoutProvider>
 * ```
 */
export function IdleTimeoutProvider({ children }: { children: React.ReactNode }) {
  const { isWarning, remainingTime, resetTimer } = useIdleTimeout({
    idleTimeout: 30 * 60 * 1000, // 30 minutes
    warningTimeout: 25 * 60 * 1000, // 25 minutes (5 minute warning)
    enabled: true,
    onWarning: () => {
      console.log('⚠️  Idle timeout warning: User will be logged out soon');
    },
    onTimeout: () => {
      toast.error('You have been logged out due to inactivity', {
        description: 'Please log in again to continue',
        duration: 5000,
      });
    },
    onActivity: () => {
      // Activity detected - timer reset
      // (optional: log for debugging)
    },
  });

  // Format remaining time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}

      {/* Idle Timeout Warning Dialog */}
      <AlertDialog open={isWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <svg
                className="h-6 w-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Still there?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You've been inactive for a while. For your security, you'll be automatically logged
                out in:
              </p>
              <div className="text-center">
                <div className="inline-block rounded-lg bg-orange-50 px-4 py-2 text-3xl font-bold text-orange-600">
                  {formatTime(remainingTime)}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Click the button below to stay logged in and continue your session.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetTimer} className="w-full">
              Stay Logged In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
