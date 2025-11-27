import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from '../../../api/src/lib/auth';

// Connect directly to the Hono API backend
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  credentials: 'include', // Required for cross-origin cookie handling
  plugins: [
    inferAdditionalFields<typeof auth>(), // Infer additional user fields from server
  ],
  fetchOptions: {
    /**
     * Global Rate Limit Error Handler
     *
     * Intercepts HTTP 429 (Too Many Requests) responses from the API
     * and extracts the X-Retry-After header to inform users when they can retry.
     *
     * This provides a consistent user experience across all authentication
     * operations (sign-in, sign-up, etc.)
     */
    onError: (context) => {
      const { response } = context;

      if (response.status === 429) {
        const retryAfter = response.headers.get('X-Retry-After');
        const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : 60;

        // Log for debugging (can be replaced with toast notification in UI components)
        console.warn(`Rate limit exceeded. Please try again in ${String(retrySeconds)} seconds.`);

        // Throw error with retry information for UI components to handle
        throw new Error(
          `Too many attempts. Please wait ${String(retrySeconds)} seconds before trying again.`
        );
      }
    },
  },
});

// Export convenience hooks and methods
export const { signIn, signUp, signOut, useSession } = authClient;
