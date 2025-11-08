/**
 * RequireClientType Component - Client-Side UI Guard
 *
 * ⚠️  SECURITY WARNING: This is a UI helper ONLY.
 * Real authorization MUST happen server-side in:
 * - Server Components: requireClientType()
 * - Server Actions: requireClientType()
 *
 * Purpose: Conditionally render UI elements based on client type.
 * Use for showing/hiding features specific to client tiers.
 * DO NOT use as the only authorization check for protected functionality.
 *
 * ⚠️  IMPLEMENTATION NOTE:
 * Requires server-side session extension to include client type data.
 * TODO: Extend Better-Auth session with customSession plugin to add clientType.
 *
 * Server-First Pattern:
 * 1. Server Components/Actions: requireClientType() (REAL security)
 * 2. This component: UI convenience (NOT security)
 */

'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';

/**
 * Client types from database enum
 * See: apps/api/src/db/schema/clients.ts
 */
export type ClientType = 'client_type_a' | 'client_type_b' | 'client_type_c' | 'one_time';

interface RequireClientTypeProps {
  /**
   * Required client type(s)
   * Can be a single type or array of allowed types
   */
  type: ClientType | ClientType[];

  /**
   * Content to render if user has the required client type
   */
  children: ReactNode;

  /**
   * Optional fallback content if user doesn't have client type
   * If not provided, renders nothing
   */
  fallback?: ReactNode;

  /**
   * Optional loading state while checking authentication
   * If not provided, renders nothing during loading
   */
  loadingFallback?: ReactNode;
}

/**
 * RequireClientType Component
 *
 * Conditionally renders children based on client type.
 *
 * @example
 * ```tsx
 * // Show premium features only for Type A clients
 * <RequireClientType type="client_type_a">
 *   <PremiumFeatures />
 * </RequireClientType>
 *
 * // Allow multiple client types
 * <RequireClientType
 *   type={["client_type_a", "client_type_b"]}
 *   fallback={<UpgradePrompt />}
 * >
 *   <AdvancedReporting />
 * </RequireClientType>
 * ```
 *
 * ⚠️  Remember: Always validate authorization server-side!
 * This component only controls UI visibility, not access.
 */
export function RequireClientType({
  type,
  children,
  fallback = null,
  loadingFallback = null,
}: RequireClientTypeProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state
  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // TODO: Implement client type check once session is extended
  // Currently, the Better-Auth session doesn't include client type information
  // This requires:
  // 1. Server-side: Extend session with customSession plugin in apps/api/src/lib/auth.ts
  // 2. Include client_type in session data by querying user_to_client join table
  // 3. Add customSessionClient plugin in apps/web/src/lib/auth-client.ts
  //
  // Placeholder implementation:
  const userClientType = (user as Record<string, unknown>).clientType as ClientType | undefined;

  if (!userClientType) {
    console.warn(
      'RequireClientType: clientType not found in session. ' +
        'Session needs to be extended server-side with customSession plugin.'
    );
    return <>{fallback}</>;
  }

  // Check if user's client type matches required type(s)
  const allowedTypes = Array.isArray(type) ? type : [type];
  const hasAccess = allowedTypes.includes(userClientType);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
