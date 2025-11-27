import type {
  ActivityItem,
  ActivityType,
} from '@/components/default/dashboard/business-center/overview/types';

interface ServerActivity {
  readonly id: string;
  readonly type?: string;
  readonly description: string;
  readonly timestamp: string;
  readonly actor: {
    readonly name: string;
    readonly image?: string | null;
  };
  readonly entityName?: string;
}

interface RealtimeActivity {
  readonly id: string;
  readonly type: string;
  readonly description: string;
  readonly createdAt: string;
  readonly userName: string;
  readonly userImage?: string | null;
  readonly entityName?: string;
}

/**
 * Transforms server activity data to widget format.
 */
export function transformServerActivity(activity: ServerActivity): ActivityItem {
  return {
    id: activity.id,
    type: (activity.type ?? 'task_updated') as ActivityType,
    description: activity.description,
    timestamp: activity.timestamp,
    user: {
      name: activity.actor.name,
      image: activity.actor.image ?? undefined,
    },
    metadata: activity.entityName ? { projectName: activity.entityName } : undefined,
  };
}

/**
 * Transforms realtime activity data to widget format.
 */
export function transformRealtimeActivity(activity: RealtimeActivity): ActivityItem {
  return {
    id: activity.id,
    type: activity.type as ActivityType,
    description: activity.description,
    timestamp: activity.createdAt,
    user: {
      name: activity.userName,
      image: activity.userImage ?? undefined,
    },
    metadata: activity.entityName ? { projectName: activity.entityName } : undefined,
  };
}

/**
 * Batch transforms server activities.
 */
export function transformServerActivities(activities: readonly ServerActivity[]): ActivityItem[] {
  return activities.map(transformServerActivity);
}

/**
 * Batch transforms realtime activities.
 */
export function transformRealtimeActivities(
  activities: readonly RealtimeActivity[]
): ActivityItem[] {
  return activities.map(transformRealtimeActivity);
}
