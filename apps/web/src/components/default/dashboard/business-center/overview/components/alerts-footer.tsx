import Link from 'next/link';

import { IconExternalLink } from '@tabler/icons-react';

import {
  formatRelativeTime,
  getEntityIcon,
} from '@/components/default/dashboard/business-center/overview/utils/alert';
import {
  ItemFooter,
  Item,
  ItemContent,
  ItemTitle,
  ItemActions,
  ItemMedia,
} from '@/components/ui/item';

interface AlertFooterProps {
  readonly entityType: string;
  readonly entityName?: string;
  readonly createdAt: string;
  readonly actionUrl?: string;
}

export const AlertsFooter = ({
  entityType,
  entityName,
  createdAt,
  actionUrl,
}: AlertFooterProps) => {
  const EntityIcon = getEntityIcon(entityType);

  return (
    <ItemFooter
      className="flex items-center justify-between mt-2 pt-2 border-t border-border/50"
      data-testid="alert-item-footer"
      aria-label="Alert footer"
    >
      <Item
        className="flex items-center gap-2 text-xs text-muted-foreground p-0"
        data-testid="alert-item-footer-item"
        aria-label="Alert footer item"
      >
        {entityName && (
          <ItemContent
            className="flex flex-row items-center gap-1"
            data-testid="alert-item-footer-item-content"
            aria-label="Alert footer item content"
          >
            <ItemMedia
              data-testid="alert-item-footer-item-content-media"
              aria-label="Alert footer item content media"
            >
              <EntityIcon
                className="size-3"
                aria-hidden="true"
                data-testid="alert-item-footer-item-content-media-icon"
              />
            </ItemMedia>
            <ItemTitle
              data-testid="alert-item-footer-item-content-title"
              aria-label="Alert footer item content title"
            >
              {entityName}
            </ItemTitle>
          </ItemContent>
        )}
        <ItemContent
          data-testid="alert-item-footer-item-content timestamp container"
          aria-label="Alert footer item content timestamp container"
        >
          {formatRelativeTime(createdAt)}
        </ItemContent>
      </Item>
      {actionUrl && (
        <ItemActions
          data-testid="alert-item-footer-item-action container"
          aria-label="Alert footer item action container"
        >
          <Link
            href={actionUrl}
            className="text-xs text-primary hover:underline flex items-center gap-0.5"
            data-testid="alert-item-footer-item-action"
            aria-label="Alert footer item action"
          >
            <span
              data-testid="alert-item-footer-item-action-text"
              aria-label="Alert footer item action text"
            >
              View
            </span>
            <IconExternalLink
              className="size-3"
              aria-hidden="true"
              data-testid="alert-item-footer-item-action-icon"
            />
          </Link>
        </ItemActions>
      )}
    </ItemFooter>
  );
};
