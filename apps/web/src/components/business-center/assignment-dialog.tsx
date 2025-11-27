'use client';

import { useState } from 'react';

import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


import type { TeamMember } from '@/lib/api/users/types';

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  teamMembers: TeamMember[];
  onAssign: (userId: string) => Promise<void>;
  currentAssigneeId?: string;
}

export function AssignmentDialog({
  open,
  onOpenChange,
  title,
  description,
  teamMembers,
  onAssign,
  currentAssigneeId,
}: AssignmentDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(currentAssigneeId);
  const [isLoading, setIsLoading] = useState(false);

  const selectedMember = teamMembers.find((m) => m.id === selectedUserId);
  const showCapacityWarning = selectedMember && selectedMember.capacityPercentage >= 80;

  const handleAssign = async () => {
    if (!selectedUserId) return;

    setIsLoading(true);
    try {
      await onAssign(selectedUserId);
      onOpenChange(false);
      setSelectedUserId('');
    } catch (error) {
      // Error handling is done in the parent via toast
      console.error('Assignment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="team-member" className="text-sm font-medium">
              Team Member
            </label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="team-member">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span>{member.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {member.capacityPercentage}% • {member.projectCount}{' '}
                        {member.projectCount === 1 ? 'project' : 'projects'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showCapacityWarning && (
            <Alert
              variant="default"
              className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950"
            >
              <IconAlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                {selectedMember.status === 'at_capacity'
                  ? `${selectedMember.name} is at capacity (${String(selectedMember.capacityPercentage)}%). Consider this before assigning.`
                  : `${selectedMember.name} is overloaded (${String(selectedMember.capacityPercentage)}%). Assignment not recommended.`}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedUserId || isLoading}>
            {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
