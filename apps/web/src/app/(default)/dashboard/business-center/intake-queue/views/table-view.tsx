'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TicketWithRelations } from '@/lib/api/tickets/types';

interface IntakeTableViewProps {
  tickets: TicketWithRelations[];
}

export function IntakeTableView({ tickets }: IntakeTableViewProps) {
  if (tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No intake tickets found
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Assigned To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/business-center/intake-queue/${ticket.id}`}
                  className="hover:underline"
                >
                  {ticket.title}
                </Link>
              </TableCell>
              <TableCell>{ticket.client?.name || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant="outline">{ticket.type}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    ticket.priority === 'critical'
                      ? 'destructive'
                      : ticket.priority === 'high'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{ticket.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>{ticket.assignedTo?.name || 'Unassigned'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
