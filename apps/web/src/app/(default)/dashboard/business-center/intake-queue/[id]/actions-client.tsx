'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  assignTicketAction,
  updateTicketStatusAction,
  updateTicketPriorityAction,
} from '@/lib/actions/business-center/tickets';
import type { TeamMember } from '@/lib/api/users/types';

interface TicketActionsProps {
  ticketId: string;
  currentAssigneeId?: string;
  currentStatus: string;
  currentPriority: string;
  teamMembers: TeamMember[];
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending_client', label: 'Pending Client' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export function TicketActions({
  ticketId,
  currentAssigneeId,
  currentStatus,
  currentPriority,
  teamMembers,
}: TicketActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedAssignee, setSelectedAssignee] = useState(currentAssigneeId || '');
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [selectedPriority, setSelectedPriority] = useState(currentPriority);

  const handleAssign = () => {
    if (!selectedAssignee) return;

    startTransition(async () => {
      const result = await assignTicketAction(ticketId, selectedAssignee);
      if (result.success) {
        toast.success('Ticket assigned successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to assign ticket');
      }
    });
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    startTransition(async () => {
      const result = await updateTicketStatusAction(
        ticketId,
        newStatus as 'open' | 'in_progress' | 'pending_client' | 'resolved' | 'closed'
      );
      if (result.success) {
        toast.success('Status updated');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update status');
        setSelectedStatus(currentStatus);
      }
    });
  };

  const handlePriorityChange = (newPriority: string) => {
    setSelectedPriority(newPriority);
    startTransition(async () => {
      const result = await updateTicketPriorityAction(
        ticketId,
        newPriority as 'low' | 'medium' | 'high' | 'critical'
      );
      if (result.success) {
        toast.success('Priority updated');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update priority');
        setSelectedPriority(currentPriority);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Assignee Select */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Assign To</label>
        <div className="flex gap-2">
          <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={isPending || !selectedAssignee || selectedAssignee === currentAssigneeId}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
          </Button>
        </div>
      </div>

      {/* Status Select */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select value={selectedStatus} onValueChange={handleStatusChange} disabled={isPending}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Priority Select */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Priority</label>
        <Select value={selectedPriority} onValueChange={handlePriorityChange} disabled={isPending}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
