import { MemberAvatar } from '@/components/default/dashboard/business-center/overview/components/team-member-avatar';
import { MemberInfo } from '@/components/default/dashboard/business-center/overview/components/team-member-info';
import { TaskBadge } from '@/components/default/dashboard/business-center/overview/components/team-member-task-badge';

import type { TeamMember } from '@/components/default/dashboard/business-center/overview/types';

interface TeamMemberItemProps {
  readonly member: TeamMember;
}

export const TeamMemberItem = ({ member }: TeamMemberItemProps) => {
  return (
    <div className="flex items-center gap-3" data-testid="team-member-container">
      <MemberAvatar name={member.name} image={member.image} status={member.status} />
      <MemberInfo name={member.name} role={member.role} />
      <TaskBadge count={member.tasksInProgress} status={member.status} />
    </div>
  );
};

TeamMemberItem.displayName = 'TeamMemberItem';
