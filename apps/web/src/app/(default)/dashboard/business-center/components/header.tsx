'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconChevronLeft, IconDownload, IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BusinessCenterHeaderProps {
  /** User's name for personalized welcome message */
  userName?: string;
  /** View switcher controls to show inline with Filter/Export */
  viewSwitcher?: React.ReactNode;
  /** Filter content to show in the filter popover */
  filterContent?: React.ReactNode;
  /** Number of active filters to show as badge */
  activeFilterCount?: number;
  /** Export handler */
  onExport?: () => void;
  /** Primary action button (e.g., "+ New Ticket") */
  primaryAction?: React.ReactNode;
  className?: string;
}

const tabs = [
  { label: 'Overview', href: '/dashboard/business-center' },
  { label: 'Intake', href: '/dashboard/business-center/intake-queue' },
  { label: 'Projects', href: '/dashboard/business-center/projects' },
  { label: 'Clients', href: '/dashboard/business-center/clients' },
  { label: 'Deliverables', href: '/dashboard/business-center/deliverables' },
  { label: 'Team', href: '/dashboard/business-center/team-capacity' },
  { label: 'Completed', href: '/dashboard/business-center/recently-completed' },
];

export function BusinessCenterHeader({
  userName,
  viewSwitcher,
  filterContent,
  activeFilterCount = 0,
  onExport,
  primaryAction,
  className,
}: BusinessCenterHeaderProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(() => {
    // Match exact or find closest parent tab
    const exactMatch = tabs.find((tab) => pathname === tab.href);
    if (exactMatch) return exactMatch.href;

    // Check if pathname starts with any tab href (for sub-pages)
    const parentMatch = tabs.find(
      (tab) => tab.href !== '/dashboard/business-center' && pathname.startsWith(tab.href)
    );
    return parentMatch?.href || '/dashboard/business-center';
  });

  // Always show personalized welcome or default (first name only)
  const firstName = userName?.split(' ')[0];
  const displayTitle = firstName ? `Welcome back, ${firstName}` : 'Welcome back';
  const displayDescription = "Glad to have you back! Let's get started.";

  const hasActions = viewSwitcher || filterContent || onExport || primaryAction;

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('space-y-3', className)}>
        {/* Welcome Message */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{displayTitle}</h1>
          <p className="text-sm text-muted-foreground">{displayDescription}</p>
        </div>

        {/* Tab Navigation Row */}
        <nav
          className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-hide"
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.href)}
                className={cn(
                  'relative px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions Row - only show if there are actions */}
        {hasActions && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {viewSwitcher}
              {filterContent && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 relative"
                      aria-label="Filter"
                    >
                      <IconAdjustmentsHorizontal className="h-4 w-4" />
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    {filterContent}
                  </PopoverContent>
                </Popover>
              )}
              {onExport && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={onExport}
                      aria-label="Export"
                    >
                      <IconDownload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export</TooltipContent>
                </Tooltip>
              )}
            </div>
            {primaryAction}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * Header for detail pages (project detail, ticket detail, etc.)
 * Shows back button and custom title
 */
interface DetailPageHeaderProps {
  title: React.ReactNode;
  description?: string;
  backUrl: string;
  backLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DetailPageHeader({
  title,
  description,
  backUrl,
  backLabel = 'Back',
  children,
  className,
}: DetailPageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Link href={backUrl} className="inline-block">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 text-muted-foreground hover:text-foreground"
            >
              <IconChevronLeft className="mr-1 h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
