'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type { DefaultSidebar as DefaultSidebarType } from './sidebar';

// Dynamic import with SSR disabled to prevent Radix UI ID hydration mismatches
const DefaultSidebar = dynamic(() => import('./sidebar').then((mod) => mod.DefaultSidebar), {
  ssr: false,
});

export function SidebarWrapper(props: ComponentProps<typeof DefaultSidebarType>) {
  return <DefaultSidebar {...props} />;
}
