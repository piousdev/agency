'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IconTag, IconCheck, IconChevronDown, IconLoader2 } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { LabelBadge } from './label-badge';
import type { Label } from '@/lib/api/labels';

export interface LabelOption {
  id: string;
  name: string;
  color: string;
  scope: string;
}

interface LabelSelectProps {
  labels: LabelOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  scope?: 'all' | 'ticket' | 'project';
  className?: string;
}

/**
 * Determine if a color is light (for text contrast)
 */
function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export function LabelSelect({
  labels,
  selectedIds,
  onChange,
  placeholder = 'Select labels...',
  disabled = false,
  isLoading = false,
  scope = 'all',
  className,
}: LabelSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter labels based on scope
  const filteredLabels = useMemo(() => {
    return labels.filter((label) => {
      if (scope === 'all') return true;
      return label.scope === 'global' || label.scope === scope;
    });
  }, [labels, scope]);

  // Get selected label objects
  const selectedLabels = useMemo(() => {
    return labels.filter((label) => selectedIds.includes(label.id));
  }, [labels, selectedIds]);

  // Toggle a label selection
  const toggleLabel = (labelId: string) => {
    if (selectedIds.includes(labelId)) {
      onChange(selectedIds.filter((id) => id !== labelId));
    } else {
      onChange([...selectedIds, labelId]);
    }
  };

  // Remove a label
  const removeLabel = (labelId: string) => {
    onChange(selectedIds.filter((id) => id !== labelId));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoading}
            className="w-full justify-between"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Loading labels...
              </div>
            ) : selectedLabels.length > 0 ? (
              <span className="truncate">
                {selectedLabels.length} label{selectedLabels.length !== 1 ? 's' : ''} selected
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search labels..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No labels found.</CommandEmpty>
              <CommandGroup>
                {filteredLabels.map((label) => {
                  const isSelected = selectedIds.includes(label.id);
                  return (
                    <CommandItem
                      key={label.id}
                      value={label.name}
                      onSelect={() => toggleLabel(label.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded border',
                            isSelected ? 'border-primary bg-primary' : 'border-muted'
                          )}
                        >
                          {isSelected && <IconCheck className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: label.color,
                            color: isLightColor(label.color) ? '#000' : '#fff',
                          }}
                        >
                          {label.name}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected labels display */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedLabels.map((label) => (
            <LabelBadge
              key={label.id}
              name={label.name}
              color={label.color}
              onRemove={() => removeLabel(label.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
