'use client';

import Link from 'next/link';

import { IconChevronRight } from '@tabler/icons-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { NavigationItem } from '@/config/navigation';

interface CollapsedDropdownMenuItemProps {
  item: NavigationItem;
  isMobile: boolean;
}

/**
 * Renders a dropdown menu for navigation items with subitems when sidebar is collapsed.
 * Single responsibility: Display dropdown navigation in collapsed sidebar state.
 */
export function CollapsedDropdownMenuItem({ item, isMobile }: CollapsedDropdownMenuItemProps) {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                <IconChevronRight className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" hidden={isMobile}>
            {item.title}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="right" align="start" sideOffset={20}>
          <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items?.map((subItem) => (
            <DropdownMenuItem key={subItem.title} asChild>
              <Link href={subItem.url ?? '#'}>
                <span>{subItem.title}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
