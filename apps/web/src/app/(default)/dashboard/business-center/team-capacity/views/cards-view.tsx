'use client';

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
import { IconUsers, IconFolder, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import type { TeamMember } from '@/lib/api/users/types';
import { cn } from '@/lib/utils';

interface TeamCardsViewProps {
  teamMembers: TeamMember[];
  onMemberClick?: (memberId: string) => void;
}

const statusConfig = {
  available: {
    label: 'Available',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
    icon: IconTrendingDown,
  },
  at_capacity: {
    label: 'At Capacity',
    color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30',
    dot: 'bg-amber-500',
    icon: null,
  },
  overloaded: {
    label: 'Overloaded',
    color: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/30',
    dot: 'bg-red-500',
    icon: IconTrendingUp,
  },
} as const;

function getCapacityColor(percentage: number): string {
  if (percentage >= 100) return 'text-red-500';
  if (percentage >= 80) return 'text-amber-500';
  return 'text-emerald-500';
}

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '[&>div]:bg-red-500';
  if (percentage >= 80) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-emerald-500';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function TeamCardsView({ teamMembers, onMemberClick }: TeamCardsViewProps) {
  const router = useRouter();
  const baseId = useId();

  const handleMemberActivate = useCallback(
    (memberId: string) => {
      if (onMemberClick) {
        onMemberClick(memberId);
      } else {
        router.push(`/dashboard/team/${memberId}`);
      }
    },
    [onMemberClick, router]
  );

  if (teamMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <IconUsers className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-base font-medium text-foreground">No team members found</p>
        <p className="text-sm mt-1">Team capacity data will appear here</p>
      </div>
    );
  }

  return (
    <MotionCardContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
      {teamMembers.map((member, index) => {
        const status = statusConfig[member.status] ?? {
          label: 'Available',
          color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30',
          dot: 'bg-emerald-500',
          icon: null,
        };
        const titleId = `${baseId}-title-${member.id}`;
        const capacityDisplay = Math.min(member.capacityPercentage, 100);

        return (
          <MotionCard
            key={member.id}
            cardId={`team-card-${member.id}`}
            index={index}
            animateOnMount={true}
            interactive={true}
            onActivate={() => handleMemberActivate(member.id)}
            aria-labelledby={titleId}
            showGradientOverlay={true}
            className="flex flex-col"
          >
            {/* Header: Name + Status Badge */}
            <MotionCardHeader className="pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-11 w-11 border-2 border-border/50 shadow-sm shrink-0">
                    <AvatarImage src={member.image || undefined} alt={member.name} />
                    <AvatarFallback className="text-sm font-semibold bg-muted">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3
                      id={titleId}
                      className="text-base font-semibold leading-tight tracking-tight truncate text-foreground"
                    >
                      {member.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">
                      {member.email.split('@')[0]}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'shrink-0 text-[10px] font-semibold uppercase tracking-wide h-auto py-0.5',
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
            </MotionCardHeader>

            {/* Capacity Section - More prominent */}
            <MotionCardContent className="py-4 border-t border-border/50">
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Workload</span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        'text-2xl font-bold tabular-nums tracking-tight',
                        getCapacityColor(member.capacityPercentage)
                      )}
                    >
                      {member.capacityPercentage}
                    </span>
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <Progress
                  value={capacityDisplay}
                  className={cn('h-2 bg-muted/50', getProgressColor(member.capacityPercentage))}
                  aria-label={`Capacity: ${member.capacityPercentage}%`}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Available</span>
                  <span
                    className={cn(
                      'font-medium',
                      member.availableCapacity > 0 ? 'text-emerald-600' : 'text-muted-foreground'
                    )}
                  >
                    {member.availableCapacity > 0 ? `${member.availableCapacity}%` : 'None'}
                  </span>
                </div>
              </div>
            </MotionCardContent>

            {/* Projects Section */}
            <MotionCardContent className="py-3 border-t border-border/50 flex-1">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IconFolder className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="font-medium">Projects</span>
                </div>
                <span className="text-xs font-semibold tabular-nums">{member.projectCount}</span>
              </div>
              {member.projects.length > 0 ? (
                <div className="space-y-1">
                  {member.projects.slice(0, 2).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-muted/40"
                    >
                      <span className="text-sm truncate flex-1 mr-3">{project.name}</span>
                      <span className="text-xs font-medium tabular-nums text-muted-foreground shrink-0">
                        {project.completionPercentage != null
                          ? `${project.completionPercentage}%`
                          : '—'}
                      </span>
                    </div>
                  ))}
                  {member.projects.length > 2 && (
                    <p className="text-[11px] text-muted-foreground pl-2.5 pt-1">
                      +{member.projects.length - 2} more projects
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic pl-0.5">No active projects</p>
              )}
            </MotionCardContent>

            {/* Footer: Summary stats */}
            <MotionCardFooter className="mt-auto pt-3 border-t border-border/50">
              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                <span>
                  {member.projectCount} active project{member.projectCount !== 1 ? 's' : ''}
                </span>
                <span className={cn('font-medium', getCapacityColor(member.capacityPercentage))}>
                  {member.capacityPercentage >= 100
                    ? 'Over capacity'
                    : member.capacityPercentage >= 80
                      ? 'Near capacity'
                      : 'Has availability'}
                </span>
              </div>
            </MotionCardFooter>
          </MotionCard>
        );
      })}
    </MotionCardContainer>
  );
}
