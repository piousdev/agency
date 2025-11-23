'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { IconBuilding, IconCalendar, IconUser, IconAlertCircle } from '@tabler/icons-react';
import type { TicketWithRelations } from '@/lib/api/tickets/types';

interface TicketDetailProps {
  ticket: TicketWithRelations;
  onAssignClick: () => void;
}

const priorityColors = {
  low: 'default',
  medium: 'default',
  high: 'default',
  critical: 'destructive',
} as const;

export function TicketDetail({ ticket, onAssignClick }: TicketDetailProps) {
  return (
    <div className="space-y-6">
      {/* Ticket metadata */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <IconBuilding className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Client</span>
          <span className="text-sm text-muted-foreground">{ticket.client?.name || 'N/A'}</span>
        </div>

        <div className="flex items-center gap-2">
          <IconAlertCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Priority</span>
          <Badge variant={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <IconUser className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Assigned To</span>
          <span className="text-sm text-muted-foreground">
            {ticket.assignedTo?.name || 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Created</span>
          <span className="text-sm text-muted-foreground">
            {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      <Separator />

      {/* Ticket description */}
      <div>
        <h3 className="text-sm font-medium mb-2">Description</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {ticket.description || 'No description provided'}
        </p>
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-2">
        <Button onClick={onAssignClick} className="w-full">
          {ticket.assignedTo ? 'Reassign Ticket' : 'Assign Ticket'}
        </Button>
      </div>
    </div>
  );
}
