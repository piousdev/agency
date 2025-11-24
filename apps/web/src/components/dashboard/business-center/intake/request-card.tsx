'use client';

import Link from 'next/link';
import {
  IconClock,
  IconUser,
  IconAlertTriangle,
  IconDotsVertical,
  IconArrowRight,
  IconUserPlus,
  IconEye,
  IconMenu2,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useIntakeStore } from '@/lib/stores/intake-store';
import { SwipeableCard } from './swipeable-card';
import type { Request } from '@/lib/api/requests/types';
import type { RequestStage } from '@/lib/schemas/request';
import {
  REQUEST_TYPE_LABELS,
  REQUEST_STAGE_LABELS,
  PRIORITY_LABELS,
  STAGE_THRESHOLDS,
} from '@/lib/schemas/request';

interface RequestCardProps {
  request: Request;
  selectable?: boolean;
  onTransition?: (requestId: string, stage: RequestStage) => void;
  onAssignPm?: (requestId: string, pmId: string) => void;
  availablePMs?: Array<{ id: string; name: string }>;
  /** Enable mobile swipe gestures */
  enableSwipe?: boolean;
  /** Called when user swipes left - opens action sheet */
  onSwipeAction?: (request: Request) => void;
}

function getAgingStatus(stage: string, stageEnteredAt: string): 'normal' | 'warning' | 'critical' {
  const threshold = STAGE_THRESHOLDS[stage as keyof typeof STAGE_THRESHOLDS];
  if (!threshold) return 'normal';

  const hoursInStage = (Date.now() - new Date(stageEnteredAt).getTime()) / (1000 * 60 * 60);

  if (hoursInStage >= threshold.critical) return 'critical';
  if (hoursInStage >= threshold.warning) return 'warning';
  return 'normal';
}

function getAgingBadgeVariant(
  status: 'normal' | 'warning' | 'critical'
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'critical':
      return 'destructive';
    case 'warning':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getPriorityVariant(priority: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (priority) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ago`;
  }
  if (diffHours > 0) {
    return `${diffHours}h ago`;
  }
  return 'Just now';
}

const VALID_TRANSITIONS: Record<RequestStage, RequestStage[]> = {
  in_treatment: ['on_hold', 'estimation'],
  on_hold: ['in_treatment', 'estimation'],
  estimation: ['in_treatment', 'on_hold', 'ready'],
  ready: ['in_treatment', 'on_hold', 'estimation'],
};

export function RequestCard({
  request,
  selectable = false,
  onTransition,
  onAssignPm,
  availablePMs = [],
  enableSwipe = false,
  onSwipeAction,
}: RequestCardProps) {
  const agingStatus = getAgingStatus(request.stage, request.stageEnteredAt);
  const { toggleSelection, isSelected } = useIntakeStore();
  const selected = isSelected(request.id);

  const validTargetStages = VALID_TRANSITIONS[request.stage] || [];

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSelection(request.id);
  };

  const handleSwipeLeft = () => {
    onSwipeAction?.(request);
  };

  const handleSwipeRight = () => {
    toggleSelection(request.id);
  };

  const cardContent = (
    <Card
      data-testid="request-card"
      className={cn(
        'transition-shadow hover:shadow-md h-full relative',
        selected && 'ring-2 ring-primary'
      )}
    >
      {/* Selection checkbox */}
      {selectable && (
        <div className="absolute left-3 top-3 z-10" onClick={handleCheckboxChange}>
          <Checkbox data-testid="request-checkbox" checked={selected} />
        </div>
      )}

      {/* Actions menu */}
      <div className="absolute right-3 top-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.preventDefault()}
            >
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/business-center/intake/${request.id}`}>
                <IconEye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>

            {onTransition && validTargetStages.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconArrowRight className="mr-2 h-4 w-4" />
                  Move to Stage
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {validTargetStages.map((stage) => (
                    <DropdownMenuItem
                      key={stage}
                      onClick={(e) => {
                        e.preventDefault();
                        onTransition(request.id, stage);
                      }}
                    >
                      {REQUEST_STAGE_LABELS[stage]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}

            {onAssignPm && availablePMs.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconUserPlus className="mr-2 h-4 w-4" />
                  Assign PM
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {availablePMs.map((pm) => (
                    <DropdownMenuItem
                      key={pm.id}
                      onClick={(e) => {
                        e.preventDefault();
                        onAssignPm(request.id, pm.id);
                      }}
                    >
                      {pm.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/business-center/intake/${request.id}/edit`}>
                Edit Request
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/dashboard/business-center/intake/${request.id}`} className="block h-full">
        <CardHeader className={cn('pb-3', selectable && 'pl-10')}>
          <div className="flex items-start justify-between gap-2 pr-8">
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-mono">{request.requestNumber}</p>
              <h3 className="font-semibold leading-tight line-clamp-2">{request.title}</h3>
            </div>
            <Badge variant={getPriorityVariant(request.priority)} className="shrink-0">
              {PRIORITY_LABELS[request.priority]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className={cn('space-y-3', selectable && 'pl-10')}>
          {/* Type and Stage */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{REQUEST_TYPE_LABELS[request.type]}</Badge>
            <Badge variant={getAgingBadgeVariant(agingStatus)}>
              {agingStatus !== 'normal' && <IconAlertTriangle className="mr-1 h-3 w-3" />}
              {REQUEST_STAGE_LABELS[request.stage]}
            </Badge>
          </div>

          {/* Description preview */}
          {request.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
          )}

          {/* Estimation info if available */}
          {request.storyPoints !== null && request.storyPoints !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{request.storyPoints} SP</span>
              {request.confidence && (
                <Badge variant="outline" className="text-xs">
                  {request.confidence} confidence
                </Badge>
              )}
            </div>
          )}

          {/* Tags */}
          {request.tags && request.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {request.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {request.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{request.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer info */}
          <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {request.assignedPm ? (
                <div className="flex items-center gap-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={request.assignedPm.image || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(request.assignedPm.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[80px]">{request.assignedPm.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground/60">
                  <IconUser className="h-4 w-4" />
                  <span>Unassigned</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <IconClock className="h-3 w-3" />
              <span>{formatTimeAgo(request.stageEnteredAt)}</span>
            </div>
          </div>

          {/* Client info if available */}
          {request.client && (
            <div className="text-xs text-muted-foreground">Client: {request.client.name}</div>
          )}
        </CardContent>
      </Link>
    </Card>
  );

  if (enableSwipe) {
    return (
      <SwipeableCard
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        leftAction={{
          icon: <IconMenu2 className="h-5 w-5" />,
          label: 'Actions',
        }}
        rightAction={{
          icon: selected ? <IconX className="h-5 w-5" /> : <IconCheck className="h-5 w-5" />,
          label: selected ? 'Deselect' : 'Select',
          color: selected ? 'warning' : 'primary',
        }}
      >
        {cardContent}
      </SwipeableCard>
    );
  }

  return cardContent;
}
