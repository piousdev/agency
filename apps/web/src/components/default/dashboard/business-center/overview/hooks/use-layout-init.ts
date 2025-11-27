'use client';

import { useEffect } from 'react';

import { useDashboardStore, useDashboardInit, useLayout } from '@/lib/stores/dashboard-store';

interface UseLayoutInitOptions {
  readonly userRole: string;
}

export function useLayoutInit({ userRole }: UseLayoutInitOptions) {
  const layout = useLayout();
  const { isInitialized } = useDashboardInit();
  const { getDefaultLayoutForRole, setLayout } = useDashboardStore();

  useEffect(() => {
    if (isInitialized && layout.length === 0) {
      const defaultLayout = getDefaultLayoutForRole(userRole);
      setLayout(defaultLayout);
    }
  }, [isInitialized, layout.length, userRole, getDefaultLayoutForRole, setLayout]);

  return { layout };
}
