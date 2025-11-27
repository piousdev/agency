import { STATUS_COLORS } from '@/components/default/dashboard/business-center/overview/constants/status-config';
import { getInitials } from '@/components/default/dashboard/business-center/overview/utils/member';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

import type { TeamMember } from '@/components/default/dashboard/business-center/overview/types';


interface MemberAvatarProps {
  readonly name: string;
  readonly image?: string;
  readonly status: TeamMember['status'];
}

export const MemberAvatar = ({ name, image, status }: MemberAvatarProps) => {
  return (
    <div className="relative" data-testid="member-avatar-container">
      <Avatar className="size-9" data-testid="member-avatar">
        <AvatarImage src={image} alt={name} data-testid="member-avatar-image" />
        <AvatarFallback className="text-xs" data-testid="member-avatar-fallback">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          'absolute bottom-0 right-0 size-3 rounded-full border-2 border-background',
          STATUS_COLORS[status]
        )}
        aria-label={`Status: ${status}`}
        data-testid="member-avatar-status"
      />
    </div>
  );
};

MemberAvatar.displayName = 'MemberAvatar';
