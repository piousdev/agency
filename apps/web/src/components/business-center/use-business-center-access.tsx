'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Client-Side Business Center Access Guard
 *
 * This hook provides client-side access control for Business Center components.
 * Note: This is a UX optimization layer - the authoritative security checks
 * happen on the server via requireUser() and isInternal validation.
 *
 * Usage in Client Components:
 * ```tsx
 * 'use client';
 *
 * export function MyClientComponent() {
 *   const { isLoading, hasAccess } = useBusinessCenterAccess();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!hasAccess) return null; // Will redirect
 *
 *   return <div>Protected content</div>;
 * }
 * ```
 */
export function useBusinessCenterAccess() {
  const router = useRouter();

  useEffect(() => {
    // Check access client-side for UX optimization
    // Note: Server Components already enforce this via requireUser() + isInternal check
    // This is just to provide immediate feedback without a full page load

    async function checkAccess() {
      try {
        // Call the Better-Auth session endpoint
        const response = await fetch('/api/auth/get-session', {
          credentials: 'include',
        });

        if (!response.ok) {
          // Not authenticated
          router.push('/login?returnUrl=/dashboard/business-center');
          return;
        }

        const data = await response.json();

        // Check if user is internal (agency team member)
        if (!data?.user?.isInternal) {
          // Not authorized for Business Center
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Access check failed:', error);
        router.push('/login');
      }
    }

    checkAccess();
  }, [router]);

  // In a real implementation, you would track loading and access state
  // For now, we assume the server-side protection is the primary guard
  return {
    isLoading: false,
    hasAccess: true, // Optimistic - server will enforce
  };
}

/**
 * Higher-Order Component for Business Center Access Control
 *
 * Wraps a client component with access control.
 * Note: Prefer server-side protection in page.tsx over this HOC.
 *
 * Usage:
 * ```tsx
 * const ProtectedComponent = withBusinessCenterAccess(MyClientComponent);
 * ```
 */
export function withBusinessCenterAccess<P extends object>(Component: React.ComponentType<P>) {
  return function BusinessCenterGuard(props: P) {
    const { isLoading, hasAccess } = useBusinessCenterAccess();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Verifying access...</p>
          </div>
        </div>
      );
    }

    if (!hasAccess) {
      return null; // Redirect will happen via useEffect
    }

    return <Component {...props} />;
  };
}
