'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { NavigationItem } from '@/config/navigation';

export function Main({ items, groupLabel }: { items: NavigationItem[]; groupLabel?: string }) {
  const { state, isMobile } = useSidebar();

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Trigger command palette
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    document.dispatchEvent(event);
  };

  return (
    <SidebarGroup>
      {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isSearchTrigger = item.url === '#search';

          // For items without subitems (direct links or search trigger)
          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                {isSearchTrigger ? (
                  <SidebarMenuButton tooltip={item.title} onClick={handleSearchClick}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <Link href={item.url || '#'}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          }

          // For items with subitems
          if (state === 'collapsed' && !isMobile) {
            return (
              <SidebarMenuItem key={item.title}>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      align="center"
                      hidden={state !== 'collapsed' || isMobile}
                    >
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent side="right" align="start" sideOffset={20}>
                    <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.items?.map((subItem) => (
                      <DropdownMenuItem key={subItem.title} asChild>
                        <Link href={subItem.url || '#'}>
                          <span>{subItem.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            );
          }

          // For items with subitems (collapsible - expanded state or mobile)
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url || '#'}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
