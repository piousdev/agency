'use client';

import Link from 'next/link';

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import type { NavigationItem } from '@/config/navigation';

interface DirectLinkMenuItemProps {
  item: NavigationItem;
}

/**
 * Renders a simple navigation menu item that links directly to a URL.
 * Single responsibility: Display a clickable navigation link.
 */
export function DirectLinkMenuItem({ item }: DirectLinkMenuItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={item.title} asChild>
        <Link href={item.url ?? '#'}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
