import type React from 'react';
import { DefaultHeader } from '@/components/default/dashboard/navigation/header';
import { DefaultSidebar } from '@/components/default/dashboard/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

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
      <DefaultSidebar variant="inset" />
      <SidebarInset>
        <DefaultHeader />
        <div className="m-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
