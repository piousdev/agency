/**
 * Auth UI State Management - Client-Side Only
 *
 * Server-First Principle: This store is ONLY for client-side UI state.
 * It does NOT contain session data - that's handled by Better-Auth's useSession.
 *
 * Use this store for:
 * ✅ Multi-step auth forms (onboarding, registration)
 * ✅ UI preferences (remember email, show password)
 * ✅ Temporary modal/dialog state (2FA modal, password reset)
 * ✅ Auth flow progress tracking
 *
 * Do NOT use for:
 * ❌ Session data (use Better-Auth useSession)
 * ❌ User data (use Server Components + requireUser)
 * ❌ Permissions (use Server Actions with requireRole)
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Auth UI State Interface
 * All fields are client-side UI state only
 */
interface AuthUIState {
  /**
   * Remember email preference for login form
   * Stored in localStorage for convenience across sessions
   */
  rememberEmail: boolean;
  savedEmail: string | null;

  /**
   * Multi-step form state (e.g., onboarding after registration)
   */
  onboardingStep: number;
  onboardingCompleted: boolean;

  /**
   * Temporary UI state (resets on page reload)
   */
  showPasswordResetModal: boolean;
  show2FAModal: boolean;

  /**
   * Actions
   */
  setRememberEmail: (remember: boolean, email?: string) => void;
  clearSavedEmail: () => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setShowPasswordResetModal: (show: boolean) => void;
  setShow2FAModal: (show: boolean) => void;
  resetUIState: () => void;
}

/**
 * Initial state
 */
const initialState = {
  rememberEmail: false,
  savedEmail: null,
  onboardingStep: 0,
  onboardingCompleted: false,
  showPasswordResetModal: false,
  show2FAModal: false,
};

/**
 * Auth UI Store
 *
 * Uses persist middleware to save preferences (rememberEmail, onboarding status)
 * to localStorage. Temporary UI state (modals) is not persisted.
 */
export const useAuthUI = create<AuthUIState>()(
  persist(
    (set) => ({
      ...initialState,

      setRememberEmail: (remember, email) =>
        set({
          rememberEmail: remember,
          savedEmail: remember ? (email ?? null) : null,
        }),

      clearSavedEmail: () =>
        set({
          rememberEmail: false,
          savedEmail: null,
        }),

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      completeOnboarding: () =>
        set({
          onboardingCompleted: true,
          onboardingStep: 0,
        }),

      resetOnboarding: () =>
        set({
          onboardingStep: 0,
          onboardingCompleted: false,
        }),

      setShowPasswordResetModal: (show) => set({ showPasswordResetModal: show }),

      setShow2FAModal: (show) => set({ show2FAModal: show }),

      resetUIState: () => set(initialState),
    }),
    {
      name: 'auth-ui-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist preferences, not temporary UI state
      partialize: (state) => ({
        rememberEmail: state.rememberEmail,
        savedEmail: state.savedEmail,
        onboardingCompleted: state.onboardingCompleted,
        // Exclude: onboardingStep, showPasswordResetModal, show2FAModal (temporary)
      }),
    }
  )
);
