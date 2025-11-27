'use client';

import { useCallback, useId } from 'react';

import {
  IconBuilding,
  IconMail,
  IconPhone,
  IconWorld,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react';
import { format, formatDistanceToNowStrict } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MotionCard,
  MotionCardContent,
  MotionCardFooter,
  MotionCardHeader,
  MotionCardContainer,
} from '@/components/ui/motion-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import type { Client } from '@/lib/api/clients/types';

interface ClientsCardsViewProps {
  clients: Client[];
  onClientClick?: (client: Client) => void;
  selectionMode?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

const typeConfig = {
  software: {
    label: 'Software',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/30',
    dot: 'bg-blue-500',
  },
  creative: {
    label: 'Creative',
    color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-500/30',
    dot: 'bg-purple-500',
  },
  full_service: {
    label: 'Full Service',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
} as const;

const EMPTY_ARRAY: string[] = [];

export function ClientsCardsView({
  clients,
  onClientClick,
  selectionMode = false,
  selectedIds = EMPTY_ARRAY,
  onSelectionChange,
}: ClientsCardsViewProps) {
  const baseId = useId();

  const handleClientActivate = useCallback(
    (client: Client) => {
      if (selectionMode) {
        // In selection mode, toggle selection instead of triggering click
        const newSelectedIds = selectedIds.includes(client.id)
          ? selectedIds.filter((id) => id !== client.id)
          : [...selectedIds, client.id];
        onSelectionChange?.(newSelectedIds);
        return;
      }
      if (onClientClick) {
        onClientClick(client);
      }
    },
    [onClientClick, selectionMode, selectedIds, onSelectionChange]
  );

  const handleCheckboxChange = useCallback(
    (clientId: string, checked: boolean) => {
      const newSelectedIds = checked
        ? [...selectedIds, clientId]
        : selectedIds.filter((id) => id !== clientId);
      onSelectionChange?.(newSelectedIds);
    },
    [selectedIds, onSelectionChange]
  );

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <IconBuilding className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-base font-medium text-foreground">No clients found</p>
        <p className="text-sm mt-1">Try adjusting your filters or add a new client</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <MotionCardContainer
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        staggerDelay={0.06}
      >
        {clients.map((client, index) => {
          const type = typeConfig[client.type];
          const titleId = `${baseId}-title-${client.id}`;

          return (
            <MotionCard
              key={client.id}
              cardId={`client-card-${client.id}`}
              index={index}
              animateOnMount={true}
              interactive={true}
              onActivate={() => handleClientActivate(client)}
              aria-labelledby={titleId}
              showGradientOverlay={true}
              className="flex flex-col"
            >
              {/* Header: Type Badge + Status */}
              <MotionCardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {selectionMode && (
                      <Checkbox
                        checked={selectedIds.includes(client.id)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(client.id, checked === true)
                        }
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${client.name}`}
                        className="h-4 w-4"
                      />
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 h-auto',
                        type.color
                      )}
                    >
                      <span
                        className={cn('w-1.5 h-1.5 rounded-full mr-1.5', type.dot)}
                        aria-hidden="true"
                      />
                      {type.label}
                    </Badge>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        {client.active ? (
                          <IconCircleCheck className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <IconCircleX className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {client.active ? 'Active' : 'Inactive'}
                    </TooltipContent>
                  </Tooltip>
                </div>
                {/* Title */}
                <h3
                  id={titleId}
                  className="text-base font-semibold leading-snug tracking-tight line-clamp-2 text-foreground"
                >
                  {client.name}
                </h3>
                {/* Notes preview */}
                {client.notes && (
                  <p className="text-sm text-muted-foreground/70 leading-relaxed line-clamp-2 mt-2">
                    {client.notes}
                  </p>
                )}
              </MotionCardHeader>

              {/* Contact Info */}
              <MotionCardContent className="py-3 border-t border-border/50 space-y-2 flex-1">
                {/* Email */}
                <div className="flex items-center gap-2 text-sm">
                  <IconMail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={`mailto:${client.email}`}
                    className="text-muted-foreground hover:text-primary truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {client.email}
                  </a>
                </div>

                {/* Phone */}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <IconPhone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={`tel:${client.phone}`}
                      className="text-muted-foreground hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {client.phone}
                    </a>
                  </div>
                )}

                {/* Website */}
                {client.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <IconWorld className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {new URL(client.website).hostname}
                    </a>
                  </div>
                )}

                {/* Address */}
                {client.address && (
                  <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2">
                    {client.address}
                  </p>
                )}
              </MotionCardContent>

              {/* Footer: Created date */}
              <MotionCardFooter className="mt-auto pt-3 border-t border-border/50">
                <div className="flex items-center justify-between w-full text-[11px] text-muted-foreground">
                  <span>
                    Created {client.createdAt && format(new Date(client.createdAt), 'MMM d, yyyy')}
                  </span>
                  <span className="tabular-nums">
                    {client.createdAt &&
                      formatDistanceToNowStrict(new Date(client.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </MotionCardFooter>
            </MotionCard>
          );
        })}
      </MotionCardContainer>
    </TooltipProvider>
  );
}
