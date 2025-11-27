'use client';

import { memo } from 'react';

import { TeamActions } from '@/components/default/dashboard/business-center/overview/components/team-actions';
import { TeamMemberItem } from '@/components/default/dashboard/business-center/overview/components/team-member-item';
import { TeamSummary } from '@/components/default/dashboard/business-center/overview/components/team-summary';
import { useTeamStatus } from '@/components/default/dashboard/business-center/overview/hooks/use-team-status';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import type { TeamMember } from '@/components/default/dashboard/business-center/overview/types';

export interface TeamStatusWidgetProps {
  readonly team?: readonly TeamMember[];
  readonly className?: string;
}

export const TeamStatusWidget = memo(function TeamStatusWidget({
  team: propTeam,
  className,
}: TeamStatusWidgetProps) {
  const { team, stats } = useTeamStatus({ team: propTeam });

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <TeamSummary stats={stats} />

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-3 p-2">
          {team.map((member) => (
            <TeamMemberItem key={member.id} member={member} />
          ))}
        </div>
      </ScrollArea>

      <TeamActions />
    </div>
  );
});
