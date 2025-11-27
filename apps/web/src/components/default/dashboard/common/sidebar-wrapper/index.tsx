'use client';

import dynamic from 'next/dynamic';

import type { DefaultSidebar as DefaultSidebarType } from '@/components/default/dashboard/sidebar';
import type { ComponentProps } from 'react';

// Dynamic import with SSR disabled to prevent Radix UI ID hydration mismatches
const DefaultSidebar = dynamic(
  () => import('@/components/default/dashboard/sidebar').then((mod) => mod.DefaultSidebar),
  {
    ssr: false,
  }
);

export function SidebarWrapper(props: ComponentProps<typeof DefaultSidebarType>) {
  return <DefaultSidebar {...props} />;
}
