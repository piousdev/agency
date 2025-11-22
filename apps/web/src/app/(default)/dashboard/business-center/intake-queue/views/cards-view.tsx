'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, Building2 } from 'lucide-react';
import type { TicketWithRelations } from '@/lib/api/tickets/types';

interface IntakeCardsViewProps {
  tickets: TicketWithRelations[];
}

export function IntakeCardsView({ tickets }: IntakeCardsViewProps) {
  if (tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No intake tickets found
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tickets.map((ticket) => (
        <Link key={ticket.id} href={`/dashboard/business-center/intake-queue/${ticket.id}`}>
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base line-clamp-2">{ticket.title}</CardTitle>
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
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{ticket.client?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{ticket.assignedTo?.name || 'Unassigned'}</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Badge variant="outline">{ticket.type}</Badge>
              <Badge variant="secondary">{ticket.status}</Badge>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
