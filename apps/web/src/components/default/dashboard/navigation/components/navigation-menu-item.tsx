'use client';
import { CollapsedDropdownMenuItem } from '@/components/default/dashboard/navigation/components/collapsed-dropdown-menu-item';
import { CollapsibleMenuItem } from '@/components/default/dashboard/navigation/components/collapsible-menu-item';
import { DirectLinkMenuItem } from '@/components/default/dashboard/navigation/components/direct-link-menu-item';
import { SearchTriggerMenuItem } from '@/components/default/dashboard/navigation/components/search-trigger-menu-item';

import type { NavigationItem } from '@/config/navigation';

type SidebarState = 'expanded' | 'collapsed';

interface NavigationMenuItemProps {
  readonly item: NavigationItem;
  readonly sidebarState: SidebarState;
  readonly isMobile: boolean;
}

/**
 * Factory component that determines and renders the appropriate menu item type.
 * Single responsibility: Select and delegate to the correct menu item component
 * based on item configuration and sidebar state.
 */
export function NavigationMenuItem({ item, sidebarState, isMobile }: NavigationMenuItemProps) {
  const hasSubItems = item.items && item.items.length > 0;
  const isSearchTrigger = item.url === '#search';
  const isCollapsed = sidebarState === 'collapsed' && !isMobile;

  // Search trigger item
  if (isSearchTrigger) {
    return <SearchTriggerMenuItem item={item} />;
  }

  // Direct link item (no subitems)
  if (!hasSubItems) {
    return <DirectLinkMenuItem item={item} />;
  }

  // Items with subitems - collapsed sidebar shows dropdown
  if (isCollapsed) {
    return <CollapsedDropdownMenuItem item={item} isMobile={isMobile} />;
  }

  // Items with subitems - expanded sidebar shows collapsible
  return <CollapsibleMenuItem item={item} />;
}
