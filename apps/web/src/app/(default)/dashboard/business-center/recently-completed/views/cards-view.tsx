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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IconCircleCheck, IconConfetti, IconCalendarCheck, IconUsers } from '@tabler/icons-react';
import type { ProjectWithRelations } from '@/lib/api/projects/types';
import { cn } from '@/lib/utils';

interface CompletedCardsViewProps {
  projects: ProjectWithRelations[];
  onProjectClick?: (projectId: string) => void;
}

const clientTypeConfig: Record<string, { label: string; color: string }> = {
  creative: {
    label: 'Content',
    color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-500/30',
  },
  software: {
    label: 'Software',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/30',
  },
  corporate: {
    label: 'Corporate',
    color: 'bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-500/30',
  },
  startup: {
    label: 'Startup',
    color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30',
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function CompletedCardsView({ projects, onProjectClick }: CompletedCardsViewProps) {
  const router = useRouter();
  const baseId = useId();

  const handleProjectActivate = useCallback(
    (projectId: string) => {
      if (onProjectClick) {
        onProjectClick(projectId);
      } else {
        router.push(`/dashboard/business-center/projects/${projectId}`);
      }
    },
    [onProjectClick, router]
  );

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <IconConfetti className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-base font-medium text-foreground">No completed projects</p>
        <p className="text-sm mt-1">Recently completed projects will appear here</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <MotionCardContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
        {projects.map((project, index) => {
          const clientType = project.client?.type || 'software';
          const typeConfig = clientTypeConfig[clientType] ?? {
            label: 'Software',
            color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/30',
          };
          const titleId = `${baseId}-title-${project.id}`;
          const deliveryDate = project.deliveredAt
            ? new Date(project.deliveredAt)
            : new Date(project.updatedAt);

          return (
            <MotionCard
              key={project.id}
              cardId={`completed-card-${project.id}`}
              index={index}
              animateOnMount={true}
              interactive={true}
              onActivate={() => handleProjectActivate(project.id)}
              aria-labelledby={titleId}
              showGradientOverlay={true}
              className="flex flex-col"
            >
              {/* Header: Completed badge + Type */}
              <MotionCardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wide">
                    <IconCircleCheck className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Delivered
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-wide',
                      typeConfig.color
                    )}
                  >
                    {typeConfig.label}
                  </Badge>
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

              {/* Client + Delivery Date row */}
              <MotionCardContent className="py-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs text-muted-foreground shrink-0">Client</span>
                    <span className="text-sm font-medium truncate">
                      {project.client?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 shrink-0">
                    <IconCalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="tabular-nums font-medium">
                      {format(deliveryDate, 'MMM d')}
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
                    <span className="text-sm text-muted-foreground/60 italic">—</span>
                  )}
                </div>
              </MotionCardContent>

              {/* Footer: Time ago */}
              <MotionCardFooter className="mt-auto pt-3 border-t border-border/50">
                <div className="flex items-center justify-between w-full text-[11px] text-muted-foreground">
                  <span>Completed project</span>
                  <span className="tabular-nums">
                    {formatDistanceToNowStrict(deliveryDate, { addSuffix: true })}
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
