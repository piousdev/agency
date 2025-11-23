'use client';

import { IconAlertCircle, IconClock, IconInbox, IconUser } from '@tabler/icons-react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useCallback, useId } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MotionCard,
  MotionCardContainer,
  MotionCardContent,
  MotionCardFooter,
  MotionCardHeader,
} from '@/components/ui/motion-card';
import type { TicketWithRelations } from '@/lib/api/tickets/types';
import { cn } from '@/lib/utils';

interface IntakeCardsViewProps {
  tickets: TicketWithRelations[];
  onTicketClick?: (ticketId: string) => void;
}

const priorityConfig = {
  critical: {
    label: 'Critical',
    color: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/30',
    dot: 'bg-red-500',
    urgent: true,
  },
  high: {
    label: 'High',
    color: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-500/30',
    dot: 'bg-orange-500',
    urgent: false,
  },
  medium: {
    label: 'Medium',
    color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30',
    dot: 'bg-amber-500',
    urgent: false,
  },
  low: {
    label: 'Low',
    color: 'bg-slate-500/10 text-slate-500 border-slate-200 dark:border-slate-500/30',
    dot: 'bg-slate-400',
    urgent: false,
  },
} as const;

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  new: {
    label: 'New',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/30',
    dot: 'bg-blue-500',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30',
    dot: 'bg-amber-500',
  },
  pending: {
    label: 'Pending',
    color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-500/30',
    dot: 'bg-purple-500',
  },
  resolved: {
    label: 'Resolved',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  closed: {
    label: 'Closed',
    color: 'bg-slate-500/10 text-slate-500 border-slate-200 dark:border-slate-500/30',
    dot: 'bg-slate-400',
  },
};

const typeConfig: Record<string, { label: string; eyebrow: string }> = {
  bug: { label: 'Bug Report', eyebrow: 'BUG' },
  feature: { label: 'Feature Request', eyebrow: 'FEATURE' },
  support: { label: 'Support Request', eyebrow: 'SUPPORT' },
  question: { label: 'Question', eyebrow: 'QUESTION' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function IntakeCardsView({ tickets, onTicketClick }: IntakeCardsViewProps) {
  const router = useRouter();
  const baseId = useId();

  const handleTicketActivate = useCallback(
    (ticketId: string) => {
      if (onTicketClick) {
        onTicketClick(ticketId);
      } else {
        router.push(`/dashboard/business-center/intake-queue/${ticketId}`);
      }
    },
    [onTicketClick, router]
  );

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <IconInbox className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-base font-medium text-foreground">No intake tickets</p>
        <p className="text-sm mt-1">New tickets will appear here</p>
      </div>
    );
  }

  return (
    <MotionCardContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
      {tickets.map((ticket, index) => {
        const priority = priorityConfig[ticket.priority] ?? {
          label: 'Medium',
          color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30',
          dot: 'bg-amber-500',
          urgent: false,
        };
        const status = statusConfig[ticket.status] ?? {
          label: 'New',
          color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/30',
          dot: 'bg-blue-500',
        };
        const type = typeConfig[ticket.type] ?? {
          label: 'Support',
          eyebrow: 'SUPPORT',
        };
        const titleId = `${baseId}-title-${ticket.id}`;
        const createdAt = new Date(ticket.createdAt);

        return (
          <MotionCard
            key={ticket.id}
            cardId={`ticket-card-${ticket.id}`}
            index={index}
            animateOnMount={true}
            interactive={true}
            onActivate={() => handleTicketActivate(ticket.id)}
            aria-labelledby={titleId}
            showGradientOverlay={true}
            className="flex flex-col"
          >
            {/* Header: Type badge + Priority */}
            <MotionCardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <Badge
                  variant="secondary"
                  className="text-[10px] font-semibold uppercase tracking-wide bg-muted/60 text-muted-foreground"
                >
                  {type.eyebrow}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 h-auto',
                    priority.color
                  )}
                >
                  {priority.urgent && (
                    <IconAlertCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                  )}
                  {priority.label}
                </Badge>
              </div>
              {/* Title - More prominent */}
              <h3
                id={titleId}
                className="text-base font-semibold leading-snug tracking-tight line-clamp-2 text-foreground"
              >
                {ticket.title}
              </h3>
              {/* Description */}
              {ticket.description && (
                <p className="text-sm text-muted-foreground/70 leading-relaxed line-clamp-2 mt-2">
                  {ticket.description}
                </p>
              )}
            </MotionCardHeader>

            {/* Client + Time row */}
            <MotionCardContent className="py-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xs text-muted-foreground shrink-0">From</span>
                  <span className="text-sm font-medium truncate">
                    {ticket.client?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <IconClock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="tabular-nums">{format(createdAt, 'MMM d')}</span>
                </div>
              </div>
            </MotionCardContent>

            {/* Assignee Section */}
            <MotionCardContent className="py-3 border-t border-border/50 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IconUser className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Assignee</span>
                </div>
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-border/50">
                      {ticket.assignedTo.image && (
                        <AvatarImage
                          src={ticket.assignedTo.image}
                          alt={ticket.assignedTo.name || ''}
                        />
                      )}
                      <AvatarFallback className="text-[10px] font-semibold bg-muted">
                        {getInitials(ticket.assignedTo.name || ticket.assignedTo.email || '?')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate max-w-[100px]">
                      {ticket.assignedTo.name?.split(' ')[0] ||
                        ticket.assignedTo.email?.split('@')[0]}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-amber-600 dark:text-amber-500 font-medium">
                    Needs assignment
                  </span>
                )}
              </div>
            </MotionCardContent>

            {/* Footer: Status + Time ago */}
            <MotionCardFooter className="mt-auto pt-3 border-t border-border/50">
              <div className="flex items-center justify-between w-full">
                <Badge
                  variant="outline"
                  className={cn('text-[10px] font-semibold uppercase tracking-wide', status.color)}
                >
                  <span
                    className={cn('w-1.5 h-1.5 rounded-full mr-1.5', status.dot)}
                    aria-hidden="true"
                  />
                  {status.label}
                </Badge>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {formatDistanceToNowStrict(createdAt, { addSuffix: true })}
                </span>
              </div>
            </MotionCardFooter>
          </MotionCard>
        );
      })}
    </MotionCardContainer>
  );
}
