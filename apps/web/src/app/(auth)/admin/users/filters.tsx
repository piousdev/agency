/**
 * Users Filters Component (Client Component)
 * Search, filter, and sort controls for users list
 */

'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UsersFiltersProps {
  defaultSearch?: string;
  defaultIsInternal?: string;
  defaultSortBy?: string;
  defaultSortOrder?: string;
}

export function UsersFilters({
  defaultSearch = '',
  defaultIsInternal = 'all',
  defaultSortBy = 'createdAt',
  defaultSortOrder = 'desc',
}: UsersFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(defaultSearch);

  /**
   * Update URL with new filters
   */
  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.set('page', '1');

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  /**
   * Handle search submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search });
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearch('');
    startTransition(() => {
      router.push('/admin/users');
    });
  };

  const hasActiveFilters =
    defaultSearch || defaultIsInternal !== 'all' || defaultSortBy !== 'createdAt';

  return (
    <div className="bg-muted/50 border rounded-lg p-4 mb-6">
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            Search
          </Button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4">
          {/* User Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Type:</span>
            <Select
              value={defaultIsInternal}
              onValueChange={(value) => updateFilters({ isInternal: value })}
              disabled={isPending}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="true">Internal</SelectItem>
                <SelectItem value="false">External</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort By:</span>
            <Select
              value={defaultSortBy}
              onValueChange={(value) => updateFilters({ sortBy: value })}
              disabled={isPending}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Updated Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Order:</span>
            <Select
              value={defaultSortOrder}
              onValueChange={(value) => updateFilters({ sortOrder: value })}
              disabled={isPending}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
