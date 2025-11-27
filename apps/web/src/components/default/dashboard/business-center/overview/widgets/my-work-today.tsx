'use client';

import { memo } from 'react';

import { TaskActionsFooter } from '@/components/default/dashboard/business-center/overview/components/task-actions';
import { TaskControls } from '@/components/default/dashboard/business-center/overview/components/task-controls';
import { TaskEmptyState } from '@/components/default/dashboard/business-center/overview/components/task-empty-state';
import { TaskItem } from '@/components/default/dashboard/business-center/overview/components/task-item';
import {
  useTasks,
  useTaskFilters,
} from '@/components/default/dashboard/business-center/overview/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import type { TaskItem as TaskItemType } from '@/components/default/dashboard/business-center/overview/types';

export interface MyWorkTodayWidgetProps {
  readonly tasks?: readonly TaskItemType[];
  readonly className?: string;
}

export const MyWorkTodayWidget = memo(function MyWorkTodayWidget({
  tasks: propTasks,
  className,
}: MyWorkTodayWidgetProps) {
  const { tasks, markTaskDone, startTimer } = useTasks({ tasks: propTasks });

  const { sortBy, filterBy, setSortBy, setFilterBy, filteredTasks, isFiltered, isEmpty } =
    useTaskFilters({ tasks });

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <TaskControls
        sortBy={sortBy}
        filterBy={filterBy}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
      />

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-2">
          {isEmpty ? (
            <TaskEmptyState isFiltered={isFiltered} />
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onMarkDone={markTaskDone}
                onStartTimer={startTimer}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <TaskActionsFooter />
    </div>
  );
});
