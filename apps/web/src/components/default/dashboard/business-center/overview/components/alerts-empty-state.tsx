import { IconBellOff, IconCheck } from '@tabler/icons-react';

import { ConnectionDot } from '@/components/default/dashboard/business-center/overview/shared';
import { Item, ItemContent, ItemGroup, ItemMedia } from '@/components/ui/item';
import { cn } from '@/lib/utils';

interface AlertsEmptyStateProps {
  readonly isConnected: boolean;
  readonly isConnecting: boolean;
  readonly className?: string;
}

interface ConnectingStateProps {
  readonly className?: string;
}

const ConnectingState = ({ className }: ConnectingStateProps) => {
  return (
    <Item
      className={cn('flex flex-col items-center justify-center h-full text-center', className)}
      data-testid="alerts-empty-state-connecting"
      aria-label="Alerts empty state connecting"
    >
      <ItemGroup
        data-testid="alerts-empty-state-connecting-group"
        aria-label="Alerts empty state connecting group"
      >
        <ItemMedia
          data-testid="alerts-empty-state-connecting-icon"
          aria-label="Alerts empty state connecting icon"
        >
          <IconBellOff
            className="h-8 w-8 text-muted-foreground mb-2"
            aria-hidden="true"
            data-testid="alerts-empty-state-connecting-icon"
          />
        </ItemMedia>
        <ItemContent
          data-testid="alerts-empty-state-connecting-title"
          aria-label="Alerts empty state connecting title"
        >
          <p className="font-medium" data-testid="alerts-empty-state-connecting-title">
            Real-time Alerts
          </p>
        </ItemContent>
        <ItemContent
          data-testid="alerts-empty-state-connecting-message"
          aria-label="Alerts empty state connecting message"
        >
          <p
            className="text-sm text-muted-foreground mt-1"
            data-testid="alerts-empty-state-connecting-message"
          >
            Connecting to real-time updates...
          </p>
        </ItemContent>
      </ItemGroup>
      <ItemContent
        data-testid="alerts-empty-state-connecting-footer"
        aria-label="Alerts empty state connecting footer"
        className="flex flex-row items-center gap-1.5 mt-2 text-xs text-muted-foreground"
      >
        <ItemMedia
          data-testid="alerts-empty-state-connecting-footer-icon"
          aria-label="Alerts empty state connecting footer icon"
        >
          <ConnectionDot data-testid="alerts-empty-state-connecting-footer-icon" />
        </ItemMedia>
        <ItemContent
          data-testid="alerts-empty-state-connecting-footer-text"
          aria-label="Alerts empty state connecting footer text"
        >
          Connecting...
        </ItemContent>
      </ItemContent>
    </Item>
  );
};

const AllClearState = ({ className }: ConnectingStateProps) => {
  return (
    <Item
      className={cn('flex flex-col items-center justify-center h-full text-center', className)}
      data-testid="alerts-empty-state-all-clear"
      aria-label="Alerts empty state all clear"
    >
      <ItemGroup
        data-testid="alerts-empty-state-all-clear-group"
        aria-label="Alerts empty state all clear group"
      >
        <ItemMedia
          data-testid="alerts-empty-state-all-clear-icon"
          aria-label="Alerts empty state all clear icon"
        >
          <IconCheck
            className="h-8 w-8 text-success mb-2"
            aria-hidden="true"
            data-testid="alerts-empty-state-all-clear-icon"
          />
        </ItemMedia>
        <ItemContent
          data-testid="alerts-empty-state-all-clear-title"
          aria-label="Alerts empty state all clear title"
        >
          <p className="font-medium" data-testid="alerts-empty-state-all-clear-title">
            All Clear
          </p>
        </ItemContent>
        <ItemContent
          data-testid="alerts-empty-state-all-clear-message"
          aria-label="Alerts empty state all clear message"
        >
          <p
            className="text-sm text-muted-foreground mt-1"
            data-testid="alerts-empty-state-all-clear-message"
          >
            No active alerts
          </p>
        </ItemContent>
      </ItemGroup>
      <ItemContent
        data-testid="alerts-empty-state-all-clear-footer"
        aria-label="Alerts empty state all clear footer"
        className="flex flex-row items-center gap-1.5 mt-2 text-xs text-muted-foreground"
      >
        <ItemMedia
          data-testid="alerts-empty-state-all-clear-footer-icon"
          aria-label="Alerts empty state all clear footer icon"
        >
          <ConnectionDot data-testid="alerts-empty-state-all-clear-footer-icon" />
        </ItemMedia>
        <ItemContent
          data-testid="alerts-empty-state-all-clear-footer-text"
          aria-label="Alerts empty state all clear footer text"
        >
          <p data-testid="alerts-empty-state-all-clear-footer-text">Monitoring for new alerts...</p>
        </ItemContent>
      </ItemContent>
    </Item>
  );
};

export const AlertsEmptyState = ({
  isConnected,
  isConnecting,
  className,
}: AlertsEmptyStateProps) => {
  // Connecting state
  if (isConnecting) {
    return <ConnectingState className={className} />;
  }

  // All clear state (connected, no alerts)
  if (isConnected) {
    return <AllClearState className={className} />;
  }

  // Disconnected state
  return <ConnectingState className={className} />;
};
