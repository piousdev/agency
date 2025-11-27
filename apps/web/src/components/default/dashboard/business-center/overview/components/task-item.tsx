import { memo } from 'react';

import Link from 'next/link';

import { IconClock, IconAlertTriangle } from '@tabler/icons-react';

import {
  PRIORITY_COLORS,
  STATUS_LABELS,
} from '@/components/default/dashboard/business-center/overview/constants/task-config';
import {
  isOverdue,
  formatDueTime,
  getTaskUrl,
} from '@/components/default/dashboard/business-center/overview/utils/task';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import type { TaskItem as TaskItemType } from '@/components/default/dashboard/business-center/overview/types';

interface TaskPriorityDotProps {
  readonly priority: TaskItemType['priority'];
}

const TaskPriorityDot = memo(function TaskPriorityDot({ priority }: TaskPriorityDotProps) {
  return (
    <span
      className={cn('w-2 h-2 rounded-full shrink-0', PRIORITY_COLORS[priority])}
      aria-label={`Priority: ${priority}`}
    />
  );
});

interface TaskTitleProps {
  readonly id: string;
  readonly title: string;
  readonly isBlocked?: boolean;
}

const TaskTitle = memo(function TaskTitle({ id, title, isBlocked }: TaskTitleProps) {
  return (
    <div className="flex items-center gap-2">
      <Link href={getTaskUrl(id)} className="font-medium text-sm truncate hover:underline">
        {title}
      </Link>
      {isBlocked && (
        <Badge variant="destructive" className="text-[10px] h-4 px-1">
          Blocked
        </Badge>
      )}
    </div>
  );
});

interface TaskMetaProps {
  readonly ticketNumber?: string | null;
  readonly projectName?: string | null;
  readonly storyPoints?: number | null;
}

const TaskMeta = memo(function TaskMeta({ ticketNumber, projectName, storyPoints }: TaskMetaProps) {
  const items: string[] = [];

  if (ticketNumber) items.push(ticketNumber);
  if (projectName) items.push(projectName);
  if (storyPoints) items.push(`${String(storyPoints)} pts`);

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
      {items.map((item, index) => (
        <span key={item} className="flex items-center gap-2">
          {index > 0 && <span>•</span>}
          <span className="truncate">{item}</span>
        </span>
      ))}
    </div>
  );
});

interface TaskDueTimeProps {
  readonly dueAt?: string | null;
}

const TaskDueTime = memo(function TaskDueTime({ dueAt }: TaskDueTimeProps) {
  const formattedTime = formatDueTime(dueAt);
  if (!formattedTime) return null;

  const overdue = isOverdue(dueAt);
  const Icon = overdue ? IconAlertTriangle : IconClock;

  return (
    <span
      className={cn(
        'flex items-center gap-1 text-xs',
        overdue ? 'text-destructive' : 'text-muted-foreground'
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {formattedTime}
    </span>
  );
});

interface TaskActionsProps {
  readonly status: TaskItemType['status'];
  readonly dueAt?: string | null;
  readonly onStartTimer: () => void;
}

const TaskActions = memo(function TaskActions({ status, dueAt, onStartTimer }: TaskActionsProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs">
          {STATUS_LABELS[status]}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onStartTimer}
          title="Start timer"
        >
          <IconClock className="h-3 w-3" aria-hidden="true" />
        </Button>
      </div>
      <TaskDueTime dueAt={dueAt} />
    </div>
  );
});

interface TaskItemProps {
  readonly task: TaskItemType;
  readonly onMarkDone: (taskId: string, taskTitle: string) => void;
  readonly onStartTimer: (taskId: string, taskTitle: string) => void;
}

export const TaskItem = memo(function TaskItem({ task, onMarkDone, onStartTimer }: TaskItemProps) {
  const handleCheckedChange = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      onMarkDone(task.id, task.title);
    }
  };

  const handleStartTimer = () => {
    onStartTimer(task.id, task.title);
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
      <Checkbox
        className="mt-1"
        onCheckedChange={handleCheckedChange}
        aria-label={`Mark "${task.title}" as done`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <TaskPriorityDot priority={task.priority} />
          <TaskTitle id={task.id} title={task.title} isBlocked={task.isBlocked} />
        </div>
        <TaskMeta
          ticketNumber={task.ticketNumber}
          projectName={task.projectName}
          storyPoints={task.storyPoints}
        />
      </div>
      <TaskActions status={task.status} dueAt={task.dueAt} onStartTimer={handleStartTimer} />
    </div>
  );
});
