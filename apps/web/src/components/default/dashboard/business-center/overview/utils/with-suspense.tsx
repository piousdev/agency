'use client';

import { Suspense, type ComponentType, type ReactElement } from 'react';

import type { SkeletonComponent } from '@/components/default/dashboard/business-center/overview/types';

interface WithSuspenseOptions {
  readonly displayName?: string;
}

/**
 * Higher-order component that wraps a component with Suspense.
 *
 * @param LazyComponent - The lazy-loaded component to wrap
 * @param FallbackComponent - The skeleton/loading component to show
 * @param options - Optional configuration
 * @returns A new component wrapped with Suspense
 */
export function withSuspense<P extends object>(
  LazyComponent: ComponentType<P>,
  FallbackComponent: SkeletonComponent,
  options: WithSuspenseOptions = {}
): ComponentType<P> {
  const { displayName } = options;

  function SuspenseWrapper(props: P): ReactElement {
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  // Set display name for React DevTools
  const componentName =
    displayName ?? (LazyComponent as { displayName?: string }).displayName ?? 'Component';
  SuspenseWrapper.displayName = `withSuspense(${componentName})`;

  return SuspenseWrapper;
}

/**
 * Creates a lazy import function with standardized module resolution.
 * Handles the common pattern of extracting a named export.
 *
 * @param importFn - Dynamic import function
 * @param exportName - Name of the export to extract
 */
export function createLazyImport<T extends ComponentType<unknown>>(
  importFn: () => Promise<Record<string, T>>,
  exportName: string
): () => Promise<{ default: T }> {
  return () =>
    importFn().then((mod) => {
      const component = mod[exportName];
      if (!component) {
        throw new Error(`Export "${exportName}" not found in module`);
      }
      return { default: component };
    });
}
