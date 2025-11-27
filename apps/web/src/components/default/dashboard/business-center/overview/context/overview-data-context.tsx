'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { OverviewData } from '@/lib/actions/business-center/overview';

const OverviewDataContext = createContext<OverviewData | null>(null);

export function useOverviewData() {
  return useContext(OverviewDataContext);
}

interface OverviewDataProviderProps {
  value: OverviewData | null | undefined;
  children: ReactNode;
}

export function OverviewDataProvider({ value, children }: OverviewDataProviderProps) {
  return (
    <OverviewDataContext.Provider value={value ?? null}>{children}</OverviewDataContext.Provider>
  );
}
