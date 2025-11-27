'use client';

import { useState, useMemo } from 'react';

import { IconChevronDown } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

import { TeamCardsView } from './views/cards-view';
import { TeamTableView } from './views/table-view';
import { BusinessCenterHeader } from '../components/header';

import type { TeamMember } from '@/lib/api/users/types';

interface TeamCapacityClientProps {
  teamMembers: TeamMember[];
}

type ViewMode = 'table' | 'cards';
type CapacityStatus = 'available' | 'at_capacity' | 'overloaded';

const statusOptions: { value: CapacityStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'at_capacity', label: 'At Capacity' },
  { value: 'overloaded', label: 'Overloaded' },
];

export function TeamCapacityClient({ teamMembers }: TeamCapacityClientProps) {
  const [view, setView] = useState<ViewMode>('cards');
  const [selectedStatuses, setSelectedStatuses] = useState<CapacityStatus[]>([]);

  const filteredMembers = useMemo(() => {
    if (selectedStatuses.length === 0) return teamMembers;
    return teamMembers.filter((m) => selectedStatuses.includes(m.status as CapacityStatus));
  }, [teamMembers, selectedStatuses]);

  const toggleStatus = (status: CapacityStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
  };

  const activeFilterCount = selectedStatuses.length;

  const viewSwitcher = (
    <div className="flex items-center gap-2">
      <Button
        variant={view === 'cards' ? 'default' : 'outline'}
        size="sm"
        className="h-9 gap-2"
        onClick={() => setView('cards')}
      >
        Cards
      </Button>
      <Button
        variant={view === 'table' ? 'default' : 'outline'}
        size="sm"
        className="h-9 gap-2"
        onClick={() => setView('table')}
      >
        Table
      </Button>
    </div>
  );

  const [statusOpen, setStatusOpen] = useState(true);

  const filterContent = (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h4 className="text-sm font-semibold">Filters</h4>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Capacity Status Section - Collapsible */}
      <Collapsible open={statusOpen} onOpenChange={setStatusOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-medium hover:text-foreground transition-colors">
          <span className="flex items-center gap-2">
            Capacity status
            {selectedStatuses.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {selectedStatuses.length}
              </Badge>
            )}
          </span>
          <IconChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${statusOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-3">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isSelected = selectedStatuses.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleStatus(option.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Status', 'Projects', 'Capacity %', 'Available Capacity'];
    const rows = filteredMembers.map((m) => [
      m.name,
      m.email,
      m.status,
      m.projectCount.toString(),
      `${String(m.capacityPercentage)}%`,
      m.availableCapacity.toString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-capacity-${new Date().toISOString().split('T')[0] ?? 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <BusinessCenterHeader
        viewSwitcher={viewSwitcher}
        filterContent={filterContent}
        activeFilterCount={activeFilterCount}
        onExport={handleExport}
      />

      {view === 'cards' && <TeamCardsView teamMembers={filteredMembers} />}
      {view === 'table' && <TeamTableView teamMembers={filteredMembers} />}
    </div>
  );
}
