'use client';

import { useState, useMemo } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ViewSwitcher, type ViewMode } from '@/components/business-center/view-switcher';
import type { ProjectWithRelations } from '@/lib/api/projects/types';
import type { TeamMember } from '@/lib/api/users/types';
import { ProjectTableView } from './views/table-view';
import { ProjectCardsView } from './views/cards-view';
import { ProjectKanbanView } from './views/kanban-view';
import { ProjectCalendarView } from './views/calendar-view';
import { BusinessCenterHeader } from '../components/header';

type ProjectType = 'all' | 'content' | 'software';
type DeliverableFilter = 'all' | 'has_delivery' | 'no_delivery' | 'overdue';

interface ProjectsClientProps {
  projects: ProjectWithRelations[];
  allProjects: ProjectWithRelations[];
  teamMembers: TeamMember[];
}

const PROJECT_STATUSES = [
  { value: 'intake', label: 'Intake' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'in_development', label: 'In Development' },
  { value: 'in_review', label: 'In Review' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'on_hold', label: 'On Hold' },
];

export function ProjectsClient({ projects, allProjects, teamMembers }: ProjectsClientProps) {
  const [view, setView] = useState<ViewMode>('table');
  const [activeTab, setActiveTab] = useState('projects');
  const [projectType, setProjectType] = useState<ProjectType>('all');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [deliverableFilter, setDeliverableFilter] = useState<DeliverableFilter>('all');
  const [showDelivered, setShowDelivered] = useState(false);

  // Get the base projects list (with or without delivered)
  const baseProjects = showDelivered ? allProjects : projects;

  // Filter projects based on all criteria
  const filteredProjects = useMemo(() => {
    return baseProjects.filter((project) => {
      // Filter by project type
      if (projectType === 'content' && project.client?.type !== 'creative') {
        return false;
      }
      if (projectType === 'software' && project.client?.type !== 'software') {
        return false;
      }

      // Filter by status
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(project.status)) {
        return false;
      }

      // Filter by assignee
      if (selectedAssignees.length > 0) {
        const projectAssigneeIds = project.assignees?.map((a) => a.id) || [];
        const hasMatchingAssignee = selectedAssignees.some((id) => projectAssigneeIds.includes(id));
        if (!hasMatchingAssignee) {
          return false;
        }
      }

      // Filter by deliverable
      if (deliverableFilter !== 'all') {
        const hasDelivery = !!project.deliveredAt;
        const isOverdue =
          project.deliveredAt &&
          new Date(project.deliveredAt) < new Date() &&
          project.status !== 'delivered';

        switch (deliverableFilter) {
          case 'has_delivery':
            if (!hasDelivery) return false;
            break;
          case 'no_delivery':
            if (hasDelivery) return false;
            break;
          case 'overdue':
            if (!isOverdue) return false;
            break;
        }
      }

      return true;
    });
  }, [baseProjects, projectType, selectedStatuses, selectedAssignees, deliverableFilter]);

  const activeFiltersCount =
    (selectedStatuses.length > 0 ? 1 : 0) +
    (selectedAssignees.length > 0 ? 1 : 0) +
    (deliverableFilter !== 'all' ? 1 : 0) +
    (showDelivered ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedAssignees([]);
    setDeliverableFilter('all');
    setShowDelivered(false);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Count projects by type for tab badges
  const contentCount = baseProjects.filter((p) => p.client?.type === 'creative').length;
  const softwareCount = baseProjects.filter((p) => p.client?.type === 'software').length;

  const [statusOpen, setStatusOpen] = useState(true);
  const [assigneesOpen, setAssigneesOpen] = useState(false);

  const filterContent = (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h4 className="text-sm font-semibold">Filters</h4>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Include Delivered Toggle */}
      <div className="flex items-center justify-between py-3">
        <Label htmlFor="show-delivered" className="text-sm font-medium cursor-pointer">
          Include delivered
        </Label>
        <Switch id="show-delivered" checked={showDelivered} onCheckedChange={setShowDelivered} />
      </div>

      <Separator />

      {/* Status Section - Collapsible */}
      <Collapsible open={statusOpen} onOpenChange={setStatusOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-medium hover:text-foreground transition-colors">
          <span className="flex items-center gap-2">
            Status
            {selectedStatuses.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {selectedStatuses.length}
              </Badge>
            )}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${statusOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-3">
          <div className="flex flex-wrap gap-2">
            {PROJECT_STATUSES.map((status) => {
              const isSelected = selectedStatuses.includes(status.value);
              return (
                <button
                  key={status.value}
                  onClick={() => toggleStatus(status.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {status.label}
                </button>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Delivery Date Section */}
      <div className="py-3">
        <Label className="text-sm font-medium mb-2 block">Delivery date</Label>
        <Select
          value={deliverableFilter}
          onValueChange={(v: string) => setDeliverableFilter(v as DeliverableFilter)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            <SelectItem value="has_delivery">Has delivery date</SelectItem>
            <SelectItem value="no_delivery">No delivery date</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignees Section - Collapsible */}
      {teamMembers.length > 0 && (
        <>
          <Separator />
          <Collapsible open={assigneesOpen} onOpenChange={setAssigneesOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-medium hover:text-foreground transition-colors">
              <span className="flex items-center gap-2">
                Assignees
                {selectedAssignees.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {selectedAssignees.length}
                  </Badge>
                )}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${assigneesOpen ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-3">
              <div className="flex flex-wrap gap-2">
                {teamMembers.map((member) => {
                  const isSelected = selectedAssignees.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      onClick={() => toggleAssignee(member.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      }`}
                    >
                      {member.name}
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  );

  const handleExport = () => {
    const headers = ['Name', 'Client', 'Status', 'Progress', 'Delivery Date', 'Team'];
    const rows = filteredProjects.map((p) => [
      p.name,
      p.client?.name || 'Unknown',
      p.status,
      `${p.completionPercentage}%`,
      p.deliveredAt ? new Date(p.deliveredAt).toLocaleDateString() : 'Not set',
      p.assignees?.map((a) => a.name).join(', ') || 'Unassigned',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <BusinessCenterHeader
        viewSwitcher={
          activeTab === 'projects' ? (
            <ViewSwitcher currentView={view} onViewChange={setView} />
          ) : undefined
        }
        filterContent={filterContent}
        activeFilterCount={activeFiltersCount}
        onExport={handleExport}
      />

      {/* Project Type Tabs */}
      <Tabs value={projectType} onValueChange={(v: string) => setProjectType(v as ProjectType)}>
        <TabsList>
          <TabsTrigger value="all">
            All Projects
            <Badge variant="secondary" className="ml-2">
              {baseProjects.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="content">
            Content
            <Badge variant="secondary" className="ml-2">
              {contentCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="software">
            Software
            <Badge variant="secondary" className="ml-2">
              {softwareCount}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* View Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="calendar">Delivery Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          {view === 'table' && <ProjectTableView projects={filteredProjects} />}
          {view === 'cards' && <ProjectCardsView projects={filteredProjects} />}
          {view === 'kanban' && <ProjectKanbanView projects={filteredProjects} />}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <ProjectCalendarView projects={filteredProjects} allProjects={baseProjects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
