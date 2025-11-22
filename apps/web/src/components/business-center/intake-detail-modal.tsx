'use client';

import { AlertCircle, Briefcase, Calendar, CheckCircle2, Clock, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TicketWithRelations } from '@/lib/api/tickets/types';

/**
 * Intake Detail Modal Props
 */
interface IntakeDetailModalProps {
  ticket: TicketWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign?: () => void;
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
 * Intake Detail Modal Component (Client Component)
 * Displays full details of an intake ticket with assignment options
 */
export function IntakeDetailModal({
  ticket,
  open,
  onOpenChange,
  onAssign,
}: IntakeDetailModalProps) {
  const _StatusIcon = statusConfig[ticket.status].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{ticket.title}</DialogTitle>
              <DialogDescription className="mt-2">
                Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </div>
            <Badge variant="outline" className={priorityConfig[ticket.priority].color}>
              {priorityConfig[ticket.priority].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status and metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${statusConfig[ticket.status].color}`} />
                <span className="text-sm font-medium">{statusConfig[ticket.status].label}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Type</div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium capitalize">{ticket.type}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Description</div>
            <div className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg border">
              {ticket.description}
            </div>
          </div>

          {/* Client information */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Client</div>
            <div className="flex items-center gap-3 p-3 bg-info/10 rounded-lg border border-info/20">
              <div className="h-10 w-10 rounded-full bg-info flex items-center justify-center text-white font-semibold">
                {ticket.client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-sm">{ticket.client.name}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {ticket.client.type} Client
                </div>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Assigned To</div>
            {ticket.assignedTo ? (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={ticket.assignedTo.image || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {ticket.assignedTo.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{ticket.assignedTo.name}</div>
                    <div className="text-xs text-muted-foreground">{ticket.assignedTo.email}</div>
                  </div>
                </div>
                {onAssign && (
                  <Button variant="outline" size="sm" onClick={onAssign}>
                    Reassign
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-warning">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Not assigned</span>
                  </div>
                  {onAssign && (
                    <Button variant="default" size="sm" onClick={onAssign}>
                      Assign to Team Member
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Created by */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Created By</div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
              <User className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="font-medium text-sm">{ticket.createdBy.name}</div>
                <div className="text-xs text-muted-foreground">{ticket.createdBy.email}</div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Created</div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(ticket.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
