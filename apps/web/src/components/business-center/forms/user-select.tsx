'use client';

import { forwardRef } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Special value for "unassigned" since Radix Select doesn't allow empty strings
const UNASSIGNED_VALUE = '_unassigned_';

export interface UserOption {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  capacityPercentage?: number;
}

interface UserSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  users: UserOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCapacity?: boolean;
  allowUnassign?: boolean;
  unassignLabel?: string;
}

export const UserSelect = forwardRef<HTMLButtonElement, UserSelectProps>(
  (
    {
      value,
      onValueChange,
      users,
      placeholder = 'Select user',
      disabled = false,
      className,
      showCapacity = false,
      allowUnassign = false,
      unassignLabel = 'Unassigned',
    },
    ref
  ) => {
    // Convert empty string to special value for Select component
    const selectValue = value === '' ? UNASSIGNED_VALUE : value;

    // Convert special value back to empty string for parent
    const handleValueChange = (newValue: string) => {
      onValueChange?.(newValue === UNASSIGNED_VALUE ? '' : newValue);
    };
    const getInitials = (name: string | null, email: string) => {
      if (name) {
        return name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
      return email.slice(0, 2).toUpperCase();
    };

    const getCapacityColor = (capacity: number) => {
      if (capacity >= 100) return 'text-red-500';
      if (capacity >= 80) return 'text-amber-500';
      return 'text-emerald-500';
    };

    return (
      <Select value={selectValue} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger ref={ref} className={cn('w-full', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowUnassign && (
            <SelectItem value={UNASSIGNED_VALUE}>
              <span className="text-muted-foreground">{unassignLabel}</span>
            </SelectItem>
          )}
          {users.length === 0 ? (
            <div className="text-muted-foreground px-2 py-1.5 text-sm">No users available</div>
          ) : (
            users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.email} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.name ?? user.email}</span>
                  {showCapacity && user.capacityPercentage !== undefined && (
                    <span className={cn('text-xs', getCapacityColor(user.capacityPercentage))}>
                      ({user.capacityPercentage}%)
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    );
  }
);

UserSelect.displayName = 'UserSelect';
