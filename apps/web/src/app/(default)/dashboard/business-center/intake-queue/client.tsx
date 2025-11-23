'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { IconChevronDown, IconPlus } from '@tabler/icons-react';
import { ViewSwitcher, type ViewMode } from '@/components/business-center/view-switcher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type {
  TicketWithRelations,
  TicketStatus,
  TicketPriority,
  TicketType,
} from '@/lib/api/tickets/types';
import type { TeamMember } from '@/lib/api/users/types';
import { IntakeTableView } from './views/table-view';
import { IntakeCardsView } from './views/cards-view';
import { IntakeKanbanView } from './views/kanban-view';
import { BusinessCenterHeader } from '../components/header';

interface IntakeQueueClientProps {
  tickets: TicketWithRelations[];
  teamMembers: TeamMember[];
}

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending_client', label: 'Pending Client' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const typeOptions: { value: TicketType; label: string }[] = [
  { value: 'intake', label: 'Intake' },
  { value: 'bug', label: 'Bug' },
  { value: 'support', label: 'Support' },
  { value: 'incident', label: 'Incident' },
  { value: 'change_request', label: 'Change Request' },
];

export function IntakeQueueClient({ tickets, teamMembers }: IntakeQueueClientProps) {
  const [view, setView] = useState<ViewMode>('kanban');
  const [selectedStatuses, setSelectedStatuses] = useState<TicketStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TicketPriority[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<TicketType[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const toggleFilter = <T,>(value: T, selected: T[], setSelected: (values: T[]) => void) => {
    setSelected(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedTypes([]);
    setSelectedAssignees([]);
  };

  const activeFilterCount =
    selectedStatuses.length +
    selectedPriorities.length +
    selectedTypes.length +
    selectedAssignees.length;

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(ticket.status)) return false;
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(ticket.priority))
        return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(ticket.type)) return false;
      if (selectedAssignees.length > 0) {
        if (!ticket.assignedToId || !selectedAssignees.includes(ticket.assignedToId)) return false;
      }
      return true;
    });
  }, [tickets, selectedStatuses, selectedPriorities, selectedTypes, selectedAssignees]);

  const [statusOpen, setStatusOpen] = useState(true);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [assigneesOpen, setAssigneesOpen] = useState(false);

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
                  onClick={() => toggleFilter(option.value, selectedStatuses, setSelectedStatuses)}
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

      {/* Priority Section - Collapsible */}
      <Collapsible open={priorityOpen} onOpenChange={setPriorityOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-medium hover:text-foreground transition-colors">
          <span className="flex items-center gap-2">
            Priority
            {selectedPriorities.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {selectedPriorities.length}
              </Badge>
            )}
          </span>
          <IconChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${priorityOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-3">
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => {
              const isSelected = selectedPriorities.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    toggleFilter(option.value, selectedPriorities, setSelectedPriorities)
                  }
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

      {/* Type Section - Collapsible */}
      <Collapsible open={typeOpen} onOpenChange={setTypeOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-medium hover:text-foreground transition-colors">
          <span className="flex items-center gap-2">
            Type
            {selectedTypes.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {selectedTypes.length}
              </Badge>
            )}
          </span>
          <IconChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${typeOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-3">
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((option) => {
              const isSelected = selectedTypes.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleFilter(option.value, selectedTypes, setSelectedTypes)}
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

      {/* Assignees Section - Collapsible */}
      {teamMembers.length > 0 && (
        <>
          <Separator />
          <Collapsible open={assigneesOpen} onOpenChange={setAssigneesOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-medium hover:text-foreground transition-colors">
              <span className="flex items-center gap-2">
                Assignee
                {selectedAssignees.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {selectedAssignees.length}
                  </Badge>
                )}
              </span>
              <IconChevronDown
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
                      onClick={() =>
                        toggleFilter(member.id, selectedAssignees, setSelectedAssignees)
                      }
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
    // Export filtered tickets as CSV
    const headers = [
      'Ticket #',
      'Title',
      'Status',
      'Priority',
      'Type',
      'Assignee',
      'Client',
      'Created',
    ];
    const rows = filteredTickets.map((t) => [
      t.ticketNumber || t.id,
      t.title,
      t.status,
      t.priority,
      t.type,
      t.assignedTo?.name || 'Unassigned',
      t.client.name,
      new Date(t.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intake-queue-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <BusinessCenterHeader
        viewSwitcher={<ViewSwitcher currentView={view} onViewChange={setView} />}
        filterContent={filterContent}
        activeFilterCount={activeFilterCount}
        onExport={handleExport}
        primaryAction={
          <Button asChild>
            <Link href="/dashboard/business-center/intake-queue/new">
              <IconPlus className="mr-2 h-4 w-4" />
              New Ticket
            </Link>
          </Button>
        }
      />

      {view === 'table' && <IntakeTableView tickets={filteredTickets} />}
      {view === 'cards' && <IntakeCardsView tickets={filteredTickets} />}
      {view === 'kanban' && <IntakeKanbanView tickets={filteredTickets} />}
    </div>
  );
}
