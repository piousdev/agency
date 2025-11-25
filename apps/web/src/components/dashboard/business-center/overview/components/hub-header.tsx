import { memo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconAt, IconMessage, IconChecks } from '@tabler/icons-react';
import { ConnectionDot } from '@/components/dashboard/business-center/overview/shared';
import type { TabValue } from '@/components/dashboard/business-center/overview/types';

interface HubHeaderProps {
  readonly activeTab: TabValue;
  readonly onTabChange: (tab: TabValue) => void;
  readonly unreadCount: number;
  readonly unreadMentions: number;
  readonly isPending: boolean;
  readonly onMarkAllRead: () => void;
}

export const HubHeader = memo(function HubHeader({
  activeTab,
  onTabChange,
  unreadCount,
  unreadMentions,
  isPending,
  onMarkAllRead,
}: HubHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <Tabs
        value={activeTab}
        onValueChange={onTabChange as (value: string) => void}
        className="w-auto"
      >
        <TabsList className="h-7">
          <TabsTrigger value="all" className="text-xs px-2 h-6">
            All
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="mentions" className="text-xs px-2 h-6">
            <IconAt className="h-3 w-3 mr-1" aria-hidden="true" />
            {unreadMentions > 0 && (
              <Badge variant="destructive" className="h-4 min-w-4 px-1 text-xs">
                {unreadMentions}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="comments" className="text-xs px-2 h-6">
            <IconMessage className="h-3 w-3" aria-hidden="true" />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <ConnectionDot />
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={onMarkAllRead}
            disabled={isPending}
          >
            <IconChecks className="h-3 w-3 mr-1" aria-hidden="true" />
            Mark all read
          </Button>
        )}
      </div>
    </div>
  );
});
