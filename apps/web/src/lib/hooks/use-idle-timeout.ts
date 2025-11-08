'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { signOut } from '@/lib/auth-client';

/**
 * Idle Timeout Configuration
 *
 * Automatically logs out users after a period of inactivity to enhance security.
 * Provides warning before auto-logout to prevent data loss.
 */
export interface IdleTimeoutConfig {
  /**
   * Time in milliseconds before showing warning
   * Default: 25 minutes (1,500,000ms)
   */
  warningTimeout?: number;

  /**
   * Time in milliseconds before auto-logout
   * Default: 30 minutes (1,800,000ms)
   */
  idleTimeout?: number;

  /**
   * Whether to enable idle timeout
   * Default: true
   */
  enabled?: boolean;

  /**
   * Callback when user is warned about idle timeout
   */
  onWarning?: () => void;

  /**
   * Callback when user is logged out due to idle timeout
   */
  onTimeout?: () => void;

  /**
   * Callback when user activity resets the idle timer
   */
  onActivity?: () => void;
}

/**
 * Hook for idle timeout management
 *
 * Features:
 * - Tracks mouse, keyboard, and touch activity
 * - Shows warning before auto-logout (5 minutes warning by default)
 * - Automatically logs out after idle period
 * - Resets timer on any user activity
 *
 * Usage:
 * ```tsx
 * const { isWarning, remainingTime, resetTimer } = useIdleTimeout({
 *   idleTimeout: 30 * 60 * 1000, // 30 minutes
 *   warningTimeout: 25 * 60 * 1000, // 25 minutes
 *   onWarning: () => toast.warning('You will be logged out due to inactivity'),
 *   onTimeout: () => toast.error('Logged out due to inactivity'),
 * });
 * ```
 */
export function useIdleTimeout(config: IdleTimeoutConfig = {}) {
  const {
    warningTimeout = 25 * 60 * 1000, // 25 minutes
    idleTimeout = 30 * 60 * 1000, // 30 minutes
    enabled = true,
    onWarning,
    onTimeout,
    onActivity,
  } = config;

  const [isWarning, setIsWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  /**
   * Handle idle timeout - log user out
   */
  const handleTimeout = useCallback(async () => {
    clearTimers();
    setIsWarning(false);
    setRemainingTime(0);

    try {
      await signOut();
      onTimeout?.();
    } catch (error) {
      console.error('Error during idle timeout logout:', error);
    }
  }, [clearTimers, onTimeout]);

  /**
   * Handle warning state - user is close to being logged out
   */
  const handleWarning = useCallback(() => {
    setIsWarning(true);
    onWarning?.();

    // Start countdown for remaining time
    const startTime = Date.now();
    const warningDuration = idleTimeout - warningTimeout;

    countdownTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, warningDuration - elapsed);
      setRemainingTime(Math.ceil(remaining / 1000)); // Convert to seconds

      if (remaining <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
      }
    }, 1000);

    // Set timeout for auto-logout
    idleTimerRef.current = setTimeout(handleTimeout, warningDuration);
  }, [idleTimeout, warningTimeout, handleTimeout, onWarning]);

  /**
   * Reset idle timer on user activity
   */
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();
    lastActivityRef.current = now;

    // Clear existing timers
    clearTimers();

    // Reset warning state
    setIsWarning(false);
    setRemainingTime(0);

    // Call activity callback
    onActivity?.();

    // Set new timers
    warningTimerRef.current = setTimeout(handleWarning, warningTimeout);
  }, [enabled, clearTimers, handleWarning, warningTimeout, onActivity]);

  /**
   * Set up activity listeners
   */
  useEffect(() => {
    if (!enabled) return;

    // Activity events to track
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];

    // Throttle activity tracking to avoid excessive resets
    let throttleTimer: NodeJS.Timeout | null = null;
    const throttledReset = () => {
      if (!throttleTimer) {
        resetTimer();
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
        }, 1000); // Throttle to once per second
      }
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, throttledReset, { passive: true });
    });

    // Initialize timer on mount
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledReset);
      });
      clearTimers();
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
    };
  }, [enabled, resetTimer, clearTimers]);

  return {
    /**
     * Whether the user is in warning state (close to being logged out)
     */
    isWarning,

    /**
     * Remaining time in seconds before auto-logout (only set during warning)
     */
    remainingTime,

    /**
     * Manually reset the idle timer (useful for "Stay logged in" button)
     */
    resetTimer,
  };
}
