'use client';

import { format, formatDistanceToNowStrict } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useCallback, useId } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  MotionCard,
  MotionCardContent,
  MotionCardFooter,
  MotionCardHeader,
  MotionCardContainer,
} from '@/components/ui/motion-card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IconAlertTriangle, IconClipboardList, IconCalendar, IconUsers } from '@tabler/icons-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { ProjectWithRelations } from '@/lib/api/projects/types';
import { cn } from '@/lib/utils';

interface ProjectCardsViewProps {
  projects: ProjectWithRelations[];
  onProjectClick?: (projectId: string) => void;
  selectionMode?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

const statusConfig = {
  proposal: {
    label: 'Proposal',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/30',
    dot: 'bg-blue-500',
  },
  in_development: {
    label: 'In Dev',
    color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30',
    dot: 'bg-amber-500',
  },
  in_review: {
    label: 'Review',
    color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-500/30',
    dot: 'bg-purple-500',
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-slate-500/10 text-slate-500 border-slate-200 dark:border-slate-500/30',
    dot: 'bg-slate-400',
  },
  maintenance: {
    label: 'Maint.',
    color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-500/30',
    dot: 'bg-cyan-500',
  },
  archived: {
    label: 'Archived',
    color: 'bg-gray-500/10 text-gray-500 border-gray-200 dark:border-gray-500/30',
    dot: 'bg-gray-400',
  },
} as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return '[&>div]:bg-emerald-500';
  if (percentage >= 50) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-blue-500';
}

function getProgressTextColor(percentage: number): string {
  if (percentage >= 80) return 'text-emerald-600';
  if (percentage >= 50) return 'text-amber-600';
  return 'text-blue-600';
}

export function ProjectCardsView({
  projects,
  onProjectClick,
  selectionMode = false,
  selectedIds = [],
  onSelectionChange,
}: ProjectCardsViewProps) {
  const router = useRouter();
  const baseId = useId();

  const handleProjectActivate = useCallback(
    (projectId: string) => {
      if (selectionMode) {
        // In selection mode, toggle selection instead of navigating
        const newSelectedIds = selectedIds.includes(projectId)
          ? selectedIds.filter((id) => id !== projectId)
          : [...selectedIds, projectId];
        onSelectionChange?.(newSelectedIds);
        return;
      }
      if (onProjectClick) {
        onProjectClick(projectId);
      } else {
        router.push(`/dashboard/business-center/projects/${projectId}`);
      }
    },
    [onProjectClick, router, selectionMode, selectedIds, onSelectionChange]
  );

  const handleCheckboxChange = useCallback(
    (projectId: string, checked: boolean) => {
      const newSelectedIds = checked
        ? [...selectedIds, projectId]
        : selectedIds.filter((id) => id !== projectId);
      onSelectionChange?.(newSelectedIds);
    },
    [selectedIds, onSelectionChange]
  );

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <IconClipboardList className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-base font-medium text-foreground">No projects found</p>
        <p className="text-sm mt-1">Try adjusting your filters or create a new project</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <MotionCardContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
        {projects.map((project, index) => {
          const isOverdue =
            project.deliveredAt &&
            new Date(project.deliveredAt) < new Date() &&
            project.status !== 'delivered';

          const status = statusConfig[project.status] ?? {
            label: 'Proposal',
            color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/30',
            dot: 'bg-blue-500',
          };
          const progress = project.completionPercentage || 0;
          const titleId = `${baseId}-title-${project.id}`;

          return (
            <MotionCard
              key={project.id}
              cardId={`project-card-${project.id}`}
              index={index}
              animateOnMount={true}
              interactive={true}
              onActivate={() => handleProjectActivate(project.id)}
              aria-labelledby={titleId}
              showGradientOverlay={true}
              className="flex flex-col"
            >
              {/* Header: Status Badge + Title */}
              <MotionCardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {selectionMode && (
                      <Checkbox
                        checked={selectedIds.includes(project.id)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(project.id, checked === true)
                        }
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${project.name}`}
                        className="h-4 w-4"
                      />
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 h-auto',
                        status.color
                      )}
                    >
                      <span
                        className={cn('w-1.5 h-1.5 rounded-full mr-1.5', status.dot)}
                        aria-hidden="true"
                      />
                      {status.label}
                    </Badge>
                  </div>
                  {/* Progress indicator */}
                  <span
                    className={cn('text-sm font-bold tabular-nums', getProgressTextColor(progress))}
                  >
                    {progress}%
                  </span>
                </div>
                {/* Title - More prominent */}
                <h3
                  id={titleId}
                  className="text-base font-semibold leading-snug tracking-tight line-clamp-2 text-foreground"
                >
                  {project.name}
                </h3>
                {/* Description */}
                {project.description && (
                  <p className="text-sm text-muted-foreground/70 leading-relaxed line-clamp-2 mt-2">
                    {project.description}
                  </p>
                )}
              </MotionCardHeader>

              {/* Progress Bar - Full width visual */}
              <div className="px-5">
                <Progress
                  value={progress}
                  className={cn('h-1.5 bg-muted/50', getProgressColor(progress))}
                  aria-label={`Project progress: ${progress}%`}
                />
              </div>

              {/* Client + Due Date row */}
              <MotionCardContent className="py-3 border-t border-border/50 mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs text-muted-foreground shrink-0">Client</span>
                    <span className="text-sm font-medium truncate">
                      {project.client?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 text-xs shrink-0',
                      isOverdue ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {isOverdue ? (
                      <IconAlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <IconCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span className="tabular-nums font-medium">
                      {project.deliveredAt
                        ? format(new Date(project.deliveredAt), 'MMM d')
                        : 'No date'}
                    </span>
                  </div>
                </div>
              </MotionCardContent>

              {/* Team Section */}
              <MotionCardContent className="py-3 border-t border-border/50 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IconUsers className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Team</span>
                  </div>
                  {project.assignees && project.assignees.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {project.assignees.slice(0, 3).map((assignee) => (
                          <Tooltip key={assignee.id}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-6 w-6 border-2 border-background ring-0">
                                {assignee.image && (
                                  <AvatarImage src={assignee.image} alt={assignee.name || ''} />
                                )}
                                <AvatarFallback className="text-[9px] font-semibold bg-muted">
                                  {getInitials(assignee.name || assignee.email || '?')}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {assignee.name || assignee.email}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {project.assignees.length > 3 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Avatar className="h-6 w-6 border-2 border-background">
                                <AvatarFallback className="text-[9px] font-semibold bg-muted text-muted-foreground">
                                  +{project.assignees.length - 3}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {project.assignees.length - 3} more
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <span className="text-xs font-medium tabular-nums">
                        {project.assignees.length}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-amber-600 dark:text-amber-500 font-medium">
                      Needs team
                    </span>
                  )}
                </div>
              </MotionCardContent>

              {/* Footer: Created date */}
              <MotionCardFooter className="mt-auto pt-3 border-t border-border/50">
                <div className="flex items-center justify-between w-full text-[11px] text-muted-foreground">
                  <span>
                    Created {project.createdAt && format(new Date(project.createdAt), 'MMM d')}
                  </span>
                  <span className="tabular-nums">
                    {project.createdAt &&
                      formatDistanceToNowStrict(new Date(project.createdAt), { addSuffix: true })}
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
