'use client';
import { Suspense } from 'react';

import Link from 'next/link';

import { UserMenu } from '@/components/auth/user-menu';
import Help from '@/components/default/dashboard/navigation/header/help';
import Settings from '@/components/default/dashboard/navigation/header/settings';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';

import { CommandPalette } from './command-palette';
import { Notifications } from './notifications';
import { ThemeToggle } from './theme-toggle';
import { KeyboardShortcuts } from '../../common/shortcuts';

function UserMenuSkeleton() {
  return <Skeleton className="size-6 rounded-full" />;
}

export function DefaultHeader() {
  const breadcrumbs = useBreadcrumbs();

  // Breadcrumb truncation logic
  // Show: First item, last 2 items, ellipsis in between if needed
  const getTruncatedBreadcrumbs = () => {
    const MAX_VISIBLE = 4; // Show max 4 items before truncating

    if (breadcrumbs.length <= MAX_VISIBLE) {
      return { visible: breadcrumbs, hidden: [] };
    }

    // Always show: first item, last 2 items
    const first = breadcrumbs[0];
    const lastTwo = breadcrumbs.slice(-2);
    const hidden = breadcrumbs.slice(1, -2);

    return {
      visible: first ? [first, ...lastTwo] : lastTwo,
      hidden,
    };
  };

  const { visible, hidden } = getTruncatedBreadcrumbs();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-2">
          {/* Left side of header */}
          <SidebarTrigger className="-ml-1 text-foreground" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {visible.map((breadcrumb, index) => {
                // Check if we need to show ellipsis after first item
                const showEllipsisAfter = index === 0  || hidden.length > 0;

                return (
                  <div key={breadcrumb.href} className="contents">
                    <BreadcrumbItem className={index === 0 ? 'hidden md:block' : undefined}>
                      {breadcrumb.isCurrentPage ? (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>

                    {showEllipsisAfter && (
                      <>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem className="hidden md:block">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1">
                              <BreadcrumbEllipsis className="text-primary" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              {hidden.map((item) => (
                                <DropdownMenuItem key={item.href} asChild>
                                  <Link href={item.href}>{item.label}</Link>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                      </>
                    )}

                    {!breadcrumb.isCurrentPage && !showEllipsisAfter && (
                      <BreadcrumbSeparator
                        className={index === 0 ? 'hidden md:block' : undefined}
                      />
                    )}
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {/* Right side of header */}
        <div className="ml-auto flex items-center gap-2">
          {/* Command Palette */}
          <CommandPalette />

          {/* Icon Buttons */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <ThemeToggle className="text-primary" />

            {/* Notifications */}
            <Notifications />

            {/* Help */}
            <Help />

            {/* Settings */}
            <Settings />

            {/* Separator before user menu */}
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

            {/* User Menu */}
            <Suspense fallback={<UserMenuSkeleton />}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts />
    </header>
  );
}
