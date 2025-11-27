'use client';

import { useMemo } from 'react';

import { usePathname } from 'next/navigation';

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage: boolean;
}

/**
 * Custom hook to generate breadcrumbs from the current pathname
 * Automatically capitalizes and formats path segments
 *
 * @returns Array of breadcrumb items with label, href, and current page status
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    // Split pathname into segments, filter out empty strings
    const segments = pathname.split('/').filter(Boolean);

    // If we're on the home page, return empty array (no breadcrumbs needed)
    if (segments.length === 0) {
      return [];
    }

    // Build breadcrumb items
    const breadcrumbs: BreadcrumbItem[] = segments.map((segment, index) => {
      // Build the href by joining segments up to current index
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      const isCurrentPage = index === segments.length - 1;

      // Format the label: replace hyphens with spaces and capitalize words
      const label = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        label,
        href,
        isCurrentPage,
      };
    });

    return breadcrumbs;
  }, [pathname]);
}
