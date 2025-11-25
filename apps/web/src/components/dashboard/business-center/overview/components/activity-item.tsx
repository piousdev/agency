import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  getInitials,
  formatRelativeTime,
  getActivityConfig,
} from '@/components/dashboard/business-center/overview/utils/activity';
import type { ActivityItem as ActivityItemType } from '@/components/dashboard/business-center/overview/types';
import { Item, ItemContent, ItemMedia } from '@/components/ui/item';

interface ActivityAvatarProps {
  readonly name: string;
  readonly image?: string;
}

interface ActivityContentProps {
  readonly userName: string;
  readonly description: string;
  readonly projectName?: string;
}

interface ActivityMetaProps {
  readonly type: string;
  readonly timestamp: string;
}

interface ActivityItemProps {
  readonly activity: ActivityItemType;
}

const ActivityAvatar = ({ name, image }: ActivityAvatarProps) => {
  return (
    <ItemMedia>
      <Avatar className="size-8">
        <AvatarImage src={image} alt={name} />
        <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
      </Avatar>
    </ItemMedia>
  );
};

const ActivityContent = ({ userName, description, projectName }: ActivityContentProps) => {
  return (
    <ItemContent>
      <p className="text-sm">
        <span className="font-medium">{userName}</span>{' '}
        <span className="text-muted-foreground">{description}</span>
      </p>
      {projectName && <p className="text-xs text-muted-foreground mt-0.5">in {projectName}</p>}
    </ItemContent>
  );
};

const ActivityMeta = ({ type, timestamp }: ActivityMetaProps) => {
  const config = getActivityConfig(type);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <ItemContent className={cn('p-1.5 rounded-md', config.colorClass)}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </ItemContent>
      <ItemContent className="text-xs text-muted-foreground whitespace-nowrap">
        {formatRelativeTime(timestamp)}
      </ItemContent>
    </div>
  );
};

export const ActivityItem = ({ activity }: ActivityItemProps) => {
  return (
    <Item className="flex items-start gap-3 p-0 my-4">
      <ActivityAvatar name={activity.user.name} image={activity.user.image} />
      <ActivityContent
        userName={activity.user.name}
        description={activity.description}
        projectName={activity.metadata?.projectName}
      />
      <ActivityMeta type={activity.type} timestamp={activity.timestamp} />
    </Item>
  );
};
