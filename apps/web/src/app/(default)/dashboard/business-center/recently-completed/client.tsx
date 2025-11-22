'use client';

import { useState, useMemo } from 'react';
import { List, LayoutGrid, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ProjectWithRelations } from '@/lib/api/projects/types';
import { CompletedTableView } from './views/table-view';
import { CompletedCardsView } from './views/cards-view';
import { CompletedTimelineView } from './views/timeline-view';
import { BusinessCenterHeader } from '../components/header';

interface RecentlyCompletedClientProps {
  projects: ProjectWithRelations[];
}

type ViewMode = 'table' | 'cards' | 'timeline';
type TimeRange = 'all' | 'last7' | 'last30' | 'last90';

export function RecentlyCompletedClient({ projects }: RecentlyCompletedClientProps) {
  const [view, setView] = useState<ViewMode>('timeline');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [projectType, setProjectType] = useState<'all' | 'content' | 'software'>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Filter by project type
      if (projectType === 'content' && p.client?.type !== 'creative') return false;
      if (projectType === 'software' && p.client?.type !== 'software') return false;

      // Filter by time range
      if (timeRange !== 'all') {
        const deliveredDate = new Date(p.deliveredAt || p.updatedAt);
        const now = new Date();
        const daysAgo = timeRange === 'last7' ? 7 : timeRange === 'last30' ? 30 : 90;
        const cutoff = new Date(now.setDate(now.getDate() - daysAgo));
        if (deliveredDate < cutoff) return false;
      }

      return true;
    });
  }, [projects, timeRange, projectType]);

  const activeFilterCount = (timeRange !== 'all' ? 1 : 0) + (projectType !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setTimeRange('all');
    setProjectType('all');
  };

  const viewSwitcher = (
    <div className="flex items-center gap-2">
      <Button
        variant={view === 'timeline' ? 'default' : 'outline'}
        size="sm"
        className="h-9 gap-2"
        onClick={() => setView('timeline')}
      >
        Timeline
      </Button>
      <Button
        variant={view === 'cards' ? 'default' : 'outline'}
        size="sm"
        className="h-9 gap-2"
        onClick={() => setView('cards')}
      >
        <LayoutGrid className="h-4 w-4" />
        Cards
      </Button>
      <Button
        variant={view === 'table' ? 'default' : 'outline'}
        size="sm"
        className="h-9 gap-2"
        onClick={() => setView('table')}
      >
        <List className="h-4 w-4" />
        Table
      </Button>
    </div>
  );

  const [timeRangeOpen, setTimeRangeOpen] = useState(true);
  const [projectTypeOpen, setProjectTypeOpen] = useState(false);

  const timeRangeOptions = [
    { value: 'all', label: 'All time' },
    { value: 'last7', label: 'Last 7 days' },
    { value: 'last30', label: 'Last 30 days' },
    { value: 'last90', label: 'Last 90 days' },
  ] as const;

  const projectTypeOptions = [
    { value: 'all', label: 'All types' },
    { value: 'content', label: 'Content' },
    { value: 'software', label: 'Software' },
  ] as const;

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

      {/* Time Range Section - Collapsible */}
      <Collapsible open={timeRangeOpen} onOpenChange={setTimeRangeOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-medium hover:text-foreground transition-colors">
          <span className="flex items-center gap-2">
            Time range
            {timeRange !== 'all' && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                1
              </Badge>
            )}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${timeRangeOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-3">
          <div className="flex flex-wrap gap-2">
            {timeRangeOptions.map((option) => {
              const isSelected = timeRange === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
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

      <Separator />

      {/* Project Type Section - Collapsible */}
      <Collapsible open={projectTypeOpen} onOpenChange={setProjectTypeOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-medium hover:text-foreground transition-colors">
          <span className="flex items-center gap-2">
            Project type
            {projectType !== 'all' && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                1
              </Badge>
            )}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${projectTypeOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-3">
          <div className="flex flex-wrap gap-2">
            {projectTypeOptions.map((option) => {
              const isSelected = projectType === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setProjectType(option.value)}
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
    const headers = ['Name', 'Client', 'Type', 'Completed Date'];
    const rows = filteredProjects.map((p) => [
      p.name,
      p.client?.name || 'Unknown',
      p.client?.type || 'Unknown',
      p.deliveredAt
        ? new Date(p.deliveredAt).toLocaleDateString()
        : new Date(p.updatedAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `completed-projects-${new Date().toISOString().split('T')[0]}.csv`;
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

      {view === 'timeline' && <CompletedTimelineView projects={filteredProjects} />}
      {view === 'cards' && <CompletedCardsView projects={filteredProjects} />}
      {view === 'table' && <CompletedTableView projects={filteredProjects} />}
    </div>
  );
}
