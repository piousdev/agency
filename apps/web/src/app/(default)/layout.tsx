import { SidebarWrapper } from '@/components/default/dashboard/common/sidebar-wrapper';
import { DefaultHeader } from '@/components/default/dashboard/navigation/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import type React from 'react';

/**
 * Default Layout
 * Layout for authenticated dashboard pages
 */
export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <SidebarWrapper variant="inset" />
      <SidebarInset>
        <DefaultHeader />
        <div className="m-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
