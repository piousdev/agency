import { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  STATUS_COLORS,
  STATUS_BADGE_VARIANTS,
} from '@/components/dashboard/business-center/overview/constants/status-config';
import { getInitials } from '@/components/dashboard/business-center/overview/utils/member';
import type { TeamMember } from '@/components/dashboard/business-center/overview/types';

interface MemberAvatarProps {
  readonly name: string;
  readonly image?: string;
  readonly status: TeamMember['status'];
}

const MemberAvatar = memo(function MemberAvatar({ name, image, status }: MemberAvatarProps) {
  return (
    <div className="relative">
      <Avatar className="h-9 w-9">
        <AvatarImage src={image} alt={name} />
        <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
      </Avatar>
      <span
        className={cn(
          'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
          STATUS_COLORS[status]
        )}
        aria-label={`Status: ${status}`}
      />
    </div>
  );
});

interface MemberInfoProps {
  readonly name: string;
  readonly role: string;
}

const MemberInfo = memo(function MemberInfo({ name, role }: MemberInfoProps) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{name}</p>
      <p className="text-xs text-muted-foreground truncate">{role}</p>
    </div>
  );
});

interface TaskBadgeProps {
  readonly count: number;
  readonly status: TeamMember['status'];
}

const TaskBadge = memo(function TaskBadge({ count, status }: TaskBadgeProps) {
  const variantClass = STATUS_BADGE_VARIANTS[status];

  return (
    <div className="text-right">
      <Badge variant="outline" className={cn('text-xs', variantClass)}>
        {count} {count === 1 ? 'task' : 'tasks'}
      </Badge>
    </div>
  );
});

interface TeamMemberItemProps {
  readonly member: TeamMember;
}

export const TeamMemberItem = memo(function TeamMemberItem({ member }: TeamMemberItemProps) {
  return (
    <div className="flex items-center gap-3">
      <MemberAvatar name={member.name} image={member.image} status={member.status} />
      <MemberInfo name={member.name} role={member.role} />
      <TaskBadge count={member.tasksInProgress} status={member.status} />
    </div>
  );
});
