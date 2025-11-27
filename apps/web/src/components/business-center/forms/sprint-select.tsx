'use client';

import { forwardRef, useState, useEffect, useMemo } from 'react';

import { IconRun, IconCalendar } from '@tabler/icons-react';
import { format } from 'date-fns';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { listSprints } from '@/lib/api/sprints';
import { getSprintStatusColor, type SprintStatus } from '@/lib/schemas/sprint';
import { cn } from '@/lib/utils';

import type { Sprint } from '@/lib/api/sprints/types';


interface SprintSelectProps {
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  projectId: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  excludeStatuses?: SprintStatus[];
}

export const SprintSelect = forwardRef<HTMLButtonElement, SprintSelectProps>(
  (
    {
      value,
      onValueChange,
      projectId,
      placeholder = 'Select sprint',
      disabled = false,
      className,
      allowClear = true,
      excludeStatuses = ['cancelled', 'completed'],
    },
    ref
  ) => {
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Create a stable string representation of excludeStatuses for dependency tracking
    const excludeStatusesKey = useMemo(() => excludeStatuses.join(','), [excludeStatuses]);

    useEffect(() => {
      async function fetchSprints() {
        if (!projectId) {
          setSprints([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        try {
          const result = await listSprints(projectId);
          if (result.success) {
            // Filter out excluded statuses
            const filtered = result.data.filter((s) => !excludeStatuses.includes(s.status));
            setSprints(filtered);
          }
        } catch (error) {
          console.error('Failed to fetch sprints:', error);
        } finally {
          setIsLoading(false);
        }
      }

      void fetchSprints();
    }, [projectId, excludeStatusesKey, excludeStatuses]);

    const handleValueChange = (newValue: string) => {
      if (newValue === '__clear__') {
        onValueChange?.(null);
      } else {
        onValueChange?.(newValue);
      }
    };

    if (isLoading) {
      return <Skeleton className="h-10 w-full" />;
    }

    if (sprints.length === 0 && !allowClear) {
      return (
        <Select disabled>
          <SelectTrigger ref={ref} className={cn('w-full', className)}>
            <SelectValue placeholder="No sprints available" />
          </SelectTrigger>
        </Select>
      );
    }

    return (
      <Select value={value ?? undefined} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger ref={ref} className={cn('w-full', className)}>
          <SelectValue placeholder={placeholder}>
            {value && sprints.find((s) => s.id === value)?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allowClear && (
            <SelectItem value="__clear__">
              <span className="text-muted-foreground">No Sprint (Backlog)</span>
            </SelectItem>
          )}
          {sprints.map((sprint) => (
            <SelectItem key={sprint.id} value={sprint.id}>
              <div className="flex items-center gap-2">
                <IconRun className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">{sprint.name}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex h-2 w-2 rounded-full',
                        getSprintStatusColor(sprint.status).split(' ')[0]
                      )}
                    />
                    {sprint.status}
                    {sprint.endDate && (
                      <>
                        <span className="mx-1">·</span>
                        <IconCalendar className="h-3 w-3" />
                        {format(new Date(sprint.endDate), 'MMM d')}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

SprintSelect.displayName = 'SprintSelect';

/**
 * Simple sprint select without async loading
 * Use when sprints are already available
 */
interface SprintSelectSimpleProps {
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  sprints: Sprint[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
}

export const SprintSelectSimple = forwardRef<HTMLButtonElement, SprintSelectSimpleProps>(
  (
    {
      value,
      onValueChange,
      sprints,
      placeholder = 'Select sprint',
      disabled = false,
      className,
      allowClear = true,
    },
    ref
  ) => {
    const handleValueChange = (newValue: string) => {
      if (newValue === '__clear__') {
        onValueChange?.(null);
      } else {
        onValueChange?.(newValue);
      }
    };

    return (
      <Select value={value ?? undefined} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger ref={ref} className={cn('w-full', className)}>
          <SelectValue placeholder={placeholder}>
            {value && sprints.find((s) => s.id === value)?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allowClear && (
            <SelectItem value="__clear__">
              <span className="text-muted-foreground">No Sprint (Backlog)</span>
            </SelectItem>
          )}
          {sprints.map((sprint) => (
            <SelectItem key={sprint.id} value={sprint.id}>
              <div className="flex items-center gap-2">
                <IconRun className="h-4 w-4 text-muted-foreground" />
                <span>{sprint.name}</span>
                <span
                  className={cn(
                    'ml-auto inline-flex h-2 w-2 rounded-full',
                    getSprintStatusColor(sprint.status).split(' ')[0]
                  )}
                />
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

SprintSelectSimple.displayName = 'SprintSelectSimple';
