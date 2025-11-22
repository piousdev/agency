'use client';

import { Bookmark, Check, Filter, MoreVertical, Plus, Star, Trash2 } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

export type FilterValue = {
  field: string;
  operator: string;
  value: string | string[];
};

export type SavedFilter = {
  id: string;
  name: string;
  filters: FilterValue[];
  favorite: boolean;
  createdAt: Date;
  usageCount: number;
};

const STORAGE_KEY = 'skyll-saved-filters';

export function useSavedFilters() {
  const [filters, setFilters] = React.useState<SavedFilter[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedFilter[];
        setFilters(parsed.map((f) => ({ ...f, createdAt: new Date(f.createdAt) })));
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage
  const saveFilters = React.useCallback((newFilters: SavedFilter[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFilters));
      setFilters(newFilters);
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  }, []);

  const addFilter = React.useCallback(
    (name: string, filterValues: FilterValue[]) => {
      const newFilter: SavedFilter = {
        id: Date.now().toString(),
        name,
        filters: filterValues,
        favorite: false,
        createdAt: new Date(),
        usageCount: 0,
      };
      saveFilters([...filters, newFilter]);
    },
    [filters, saveFilters]
  );

  const removeFilter = React.useCallback(
    (id: string) => {
      saveFilters(filters.filter((f) => f.id !== id));
    },
    [filters, saveFilters]
  );

  const toggleFavorite = React.useCallback(
    (id: string) => {
      saveFilters(filters.map((f) => (f.id === id ? { ...f, favorite: !f.favorite } : f)));
    },
    [filters, saveFilters]
  );

  const incrementUsage = React.useCallback(
    (id: string) => {
      saveFilters(filters.map((f) => (f.id === id ? { ...f, usageCount: f.usageCount + 1 } : f)));
    },
    [filters, saveFilters]
  );

  return {
    filters,
    isLoading,
    addFilter,
    removeFilter,
    toggleFavorite,
    incrementUsage,
  };
}

type SaveFilterDialogProps = {
  currentFilters: FilterValue[];
  onSave: (name: string) => void;
};

export function SaveFilterDialog({ currentFilters, onSave }: SaveFilterDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const filterNameId = React.useId();

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bookmark className="mr-2 size-4" />
          Save Filter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Filter</DialogTitle>
          <DialogDescription>
            Save your current filter settings for quick access later
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={filterNameId}>Filter Name</Label>
            <Input
              id={filterNameId}
              placeholder="e.g., High Priority This Month"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Current Filters</Label>
            <div className="space-y-1 rounded-lg border bg-muted/50 p-3">
              {currentFilters.length === 0 ? (
                <p className="text-sm text-muted-foreground">No filters applied</p>
              ) : (
                currentFilters.map((filter, index) => (
                  <div key={`${filter.field}-${index}`} className="text-sm">
                    <span className="font-medium">{filter.field}</span>{' '}
                    <span className="text-muted-foreground">{filter.operator}</span>{' '}
                    <span className="font-medium">
                      {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || currentFilters.length === 0}>
            Save Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type SavedFiltersListProps = {
  onApplyFilter: (filter: SavedFilter) => void;
  className?: string;
};

export function SavedFiltersList({ onApplyFilter, className }: SavedFiltersListProps) {
  const { filters, removeFilter, toggleFavorite, incrementUsage } = useSavedFilters();

  const favoriteFilters = filters.filter((f) => f.favorite);
  const recentFilters = filters
    .filter((f) => !f.favorite)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);

  const handleApply = (filter: SavedFilter) => {
    incrementUsage(filter.id);
    onApplyFilter(filter);
  };

  if (filters.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Filter className="mr-2 size-4" />
          Saved Filters
          {favoriteFilters.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {favoriteFilters.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <ScrollArea className="max-h-[400px]">
          {favoriteFilters.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Favorites
              </div>
              {favoriteFilters.map((filter) => (
                <div key={filter.id} className="group flex items-center gap-2 px-2 py-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto flex-1 justify-start py-1.5 text-left font-normal"
                    onClick={() => handleApply(filter)}
                  >
                    <Star className="mr-2 size-4 shrink-0 fill-current text-yellow-500" />
                    <div className="flex-1 truncate">{filter.name}</div>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleApply(filter)}>
                        <Check className="mr-2 size-4" />
                        Apply Filter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleFavorite(filter.id)}>
                        <Star className="mr-2 size-4" />
                        Remove from Favorites
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => removeFilter(filter.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {recentFilters.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Recent</div>
              {recentFilters.map((filter) => (
                <div key={filter.id} className="group flex items-center gap-2 px-2 py-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto flex-1 justify-start py-1.5 text-left font-normal"
                    onClick={() => handleApply(filter)}
                  >
                    <Filter className="mr-2 size-4 shrink-0" />
                    <div className="flex-1 truncate">{filter.name}</div>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleApply(filter)}>
                        <Check className="mr-2 size-4" />
                        Apply Filter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleFavorite(filter.id)}>
                        <Star className="mr-2 size-4" />
                        Add to Favorites
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => removeFilter(filter.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </>
          )}
        </ScrollArea>

        {filters.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">No saved filters</div>
        )}

        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Plus className="mr-2 size-4" />
            Manage Filters
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
