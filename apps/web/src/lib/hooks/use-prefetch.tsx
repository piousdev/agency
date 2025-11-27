'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Routes to prefetch proactively for the overview dashboard.
 * These are routes users frequently navigate to that may not be
 * directly visible in the viewport (e.g., in collapsed widgets).
 *
 * Note: Next.js Link automatically prefetches visible links in production.
 * This list is for routes that benefit from eager prefetching.
 */
const OVERVIEW_ROUTES = [
  '/dashboard/business-center/intake-queue',
  '/dashboard/business-center/projects',
  '/dashboard/business-center/clients',
  '/dashboard/business-center/sprints',
  '/dashboard/collaboration/feed',
  '/dashboard/collaboration/messages',
  '/dashboard/billing',
  '/dashboard/analytics',
];

/**
 * Prefetch common routes when the overview dashboard loads.
 *
 * Uses requestIdleCallback to avoid blocking main thread.
 * This complements Next.js Link's automatic viewport-based prefetching
 * by eagerly prefetching likely navigation targets during idle time.
 *
 * @see https://nextjs.org/docs/app/guides/prefetching
 */
export function usePrefetchCommonRoutes() {
  const router = useRouter();
  const prefetchedRef = useRef(false);

  useEffect(() => {
    // Only prefetch once per component lifecycle
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;

    // Use requestIdleCallback for non-blocking prefetch
    const prefetch = () => {
      OVERVIEW_ROUTES.forEach((route) => {
        router.prefetch(route);
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetch, { timeout: 2000 });
    } else {
      // Fallback for Safari and older browsers
      setTimeout(prefetch, 100);
    }
  }, [router]);
}

/**
 * Hook to get a prefetch callback for a specific route.
 * Use this for programmatic prefetching on user interactions.
 *
 * @example
 * const prefetch = usePrefetchOnHover('/dashboard/projects');
 * <div onMouseEnter={prefetch}>View Projects</div>
 */
export function usePrefetchOnHover(route: string) {
  const router = useRouter();
  const prefetchedRef = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;
    router.prefetch(route);
  }, [router, route]);

  return prefetch;
}

/**
 * Hook to prefetch multiple routes with individual control.
 *
 * @example
 * const { prefetch, prefetchAll } = usePrefetchRoutes(['/a', '/b']);
 * prefetch('/a'); // Prefetch single route
 * prefetchAll();  // Prefetch all routes
 */
export function usePrefetchRoutes(routes: string[]) {
  const router = useRouter();
  const prefetchedRef = useRef(new Set<string>());

  const prefetch = useCallback(
    (route: string) => {
      if (prefetchedRef.current.has(route)) return;
      prefetchedRef.current.add(route);
      router.prefetch(route);
    },
    [router]
  );

  const prefetchAll = useCallback(() => {
    routes.forEach((route) => prefetch(route));
  }, [routes, prefetch]);

  return { prefetch, prefetchAll };
}

/**
 * Link component that defers prefetching until hover.
 * Follows Next.js recommended pattern for reducing initial resource usage.
 *
 * Use for links in large lists or footer areas where automatic
 * viewport-based prefetching would be wasteful.
 *
 * @see https://nextjs.org/docs/app/guides/prefetching#hover-triggered-prefetch
 *
 * @example
 * <HoverPrefetchLink href="/dashboard/projects">Projects</HoverPrefetchLink>
 */
export function HoverPrefetchLink({
  href,
  children,
  ...props
}: LinkProps & { children: React.ReactNode }) {
  const [active, setActive] = useState(false);

  return (
    <Link
      href={href}
      prefetch={active ? undefined : false}
      onMouseEnter={() => setActive(true)}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Link component that completely disables prefetching.
 * Use for links that users rarely click or in very long lists.
 *
 * @see https://nextjs.org/docs/app/guides/prefetching#disabling-prefetching
 */
export function NoPrefetchLink({
  children,
  ...props
}: Omit<LinkProps, 'prefetch'> & { children: React.ReactNode }) {
  return (
    <Link {...props} prefetch={false}>
      {children}
    </Link>
  );
}

/**
 * Combined hook for overview dashboard prefetching.
 * Call this at the top of the dashboard component.
 *
 * Handles proactive prefetching of common routes during browser idle time.
 * This complements Next.js Link's automatic prefetching for visible links.
 */
export function useOverviewPrefetch() {
  usePrefetchCommonRoutes();
}
