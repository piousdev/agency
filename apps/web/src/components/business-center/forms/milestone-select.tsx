'use client';

import { forwardRef, useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { listMilestones } from '@/lib/api/milestones';
import type { Milestone } from '@/lib/api/milestones/types';
import { getMilestoneStatusColor, type MilestoneStatus } from '@/lib/schemas/milestone';
import { IconFlag, IconCalendar } from '@tabler/icons-react';
import { format } from 'date-fns';

interface MilestoneSelectProps {
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  projectId: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  excludeStatuses?: MilestoneStatus[];
}

export const MilestoneSelect = forwardRef<HTMLButtonElement, MilestoneSelectProps>(
  (
    {
      value,
      onValueChange,
      projectId,
      placeholder = 'Select milestone',
      disabled = false,
      className,
      allowClear = true,
      excludeStatuses = ['cancelled'],
    },
    ref
  ) => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      async function fetchMilestones() {
        if (!projectId) {
          setMilestones([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        try {
          const result = await listMilestones(projectId);
          if (result.success) {
            // Filter out excluded statuses
            const filtered = result.data.filter((m) => !excludeStatuses.includes(m.status));
            setMilestones(filtered);
          }
        } catch (error) {
          console.error('Failed to fetch milestones:', error);
        } finally {
          setIsLoading(false);
        }
      }

      fetchMilestones();
    }, [projectId, excludeStatuses.join(',')]);

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

    if (milestones.length === 0 && !allowClear) {
      return (
        <Select disabled>
          <SelectTrigger ref={ref} className={cn('w-full', className)}>
            <SelectValue placeholder="No milestones available" />
          </SelectTrigger>
        </Select>
      );
    }

    return (
      <Select value={value ?? undefined} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger ref={ref} className={cn('w-full', className)}>
          <SelectValue placeholder={placeholder}>
            {value && milestones.find((m) => m.id === value)?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allowClear && (
            <SelectItem value="__clear__">
              <span className="text-muted-foreground">None</span>
            </SelectItem>
          )}
          {milestones.map((milestone) => (
            <SelectItem key={milestone.id} value={milestone.id}>
              <div className="flex items-center gap-2">
                <IconFlag className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">{milestone.name}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex h-2 w-2 rounded-full',
                        getMilestoneStatusColor(milestone.status).split(' ')[0]
                      )}
                    />
                    {milestone.status.replace('_', ' ')}
                    {milestone.dueDate && (
                      <>
                        <span className="mx-1">·</span>
                        <IconCalendar className="h-3 w-3" />
                        {format(new Date(milestone.dueDate), 'MMM d')}
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

MilestoneSelect.displayName = 'MilestoneSelect';

/**
 * Simple milestone select without async loading
 * Use when milestones are already available
 */
interface MilestoneSelectSimpleProps {
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  milestones: Milestone[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
}

export const MilestoneSelectSimple = forwardRef<HTMLButtonElement, MilestoneSelectSimpleProps>(
  (
    {
      value,
      onValueChange,
      milestones,
      placeholder = 'Select milestone',
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
            {value && milestones.find((m) => m.id === value)?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allowClear && (
            <SelectItem value="__clear__">
              <span className="text-muted-foreground">None</span>
            </SelectItem>
          )}
          {milestones.map((milestone) => (
            <SelectItem key={milestone.id} value={milestone.id}>
              <div className="flex items-center gap-2">
                <IconFlag className="h-4 w-4 text-muted-foreground" />
                <span>{milestone.name}</span>
                <span
                  className={cn(
                    'ml-auto inline-flex h-2 w-2 rounded-full',
                    getMilestoneStatusColor(milestone.status).split(' ')[0]
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

MilestoneSelectSimple.displayName = 'MilestoneSelectSimple';
