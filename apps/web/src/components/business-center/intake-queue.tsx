import { AlertCircle, CheckCircle2, Clock, Inbox, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TicketWithRelations } from '@/lib/api/tickets/types';
import type { TeamMember } from '@/lib/api/users/types';
import { AssignTrigger } from './assign-trigger';

/**
 * Intake Queue Props
 */
interface IntakeQueueProps {
  tickets: TicketWithRelations[];
  teamMembers: TeamMember[];
}

/**
 * Priority configuration for styling using global CSS variables
 */
const priorityConfig = {
  critical: {
    label: 'Critical',
    color: 'text-error bg-error/10 border-error/20',
  },
  high: {
    label: 'High',
    color: 'text-warning bg-warning/10 border-warning/20',
  },
  medium: { label: 'Medium', color: 'text-info bg-info/10 border-info/20' },
  low: { label: 'Low', color: 'text-success bg-success/10 border-success/20' },
};

/**
 * Status configuration for styling using global CSS variables
 */
const statusConfig = {
  open: { label: 'Open', icon: AlertCircle, color: 'bg-info' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'bg-warning' },
  pending_client: { label: 'Pending Client', icon: Clock, color: 'bg-warning' },
  resolved: { label: 'Resolved', icon: CheckCircle2, color: 'bg-success' },
  closed: { label: 'Closed', icon: CheckCircle2, color: 'bg-muted' },
};

/**
 * Intake Queue Component (Server Component)
 * Displays a list of intake tickets with filtering and actions
 */
export function IntakeQueue({ tickets, teamMembers }: IntakeQueueProps) {
  // Filter only intake type tickets
  const intakeTickets = tickets.filter((ticket) => ticket.type === 'intake');

  if (intakeTickets.length === 0) {
    return (
      <div className="space-y-4">
        {/* Header with New Request button */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Intake Queue ({intakeTickets.length})</h3>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>

        {/* Empty state */}
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <Inbox className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-base font-medium">No pending intake requests</p>
          <p className="text-sm mt-2">New client requests will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with New Request button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Intake Queue ({intakeTickets.length})</h3>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Tickets Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {intakeTickets.map((ticket) => {
              const _StatusIcon = statusConfig[ticket.status].icon;

              return (
                <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {ticket.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{ticket.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {ticket.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm">{ticket.client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityConfig[ticket.priority].color}>
                      {priorityConfig[ticket.priority].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${statusConfig[ticket.status].color}`}
                      />
                      <span className="text-sm">{statusConfig[ticket.status].label}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <AssignTrigger
                      entityType="ticket"
                      entityId={ticket.id}
                      entityName={ticket.title}
                      currentAssignees={ticket.assignedToId ? [ticket.assignedToId] : []}
                      teamMembers={teamMembers}
                      buttonText="Assign"
                      buttonVariant="outline"
                      buttonSize="sm"
                      buttonClassName="text-xs h-7"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
