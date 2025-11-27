'use client';

import { useActionState, useState } from 'react';

import { IconAlertTriangle, IconCircleCheck, IconLoader2, IconUsers } from '@tabler/icons-react';

import {
  assignProjectAction,
  assignTicketAction,
} from '@/app/(default)/dashboard/business-center/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import type { TeamMember } from '@/lib/api/users/types';

// Constant for default empty array to avoid re-renders
const EMPTY_ARRAY: string[] = [];

/**
 * Assign Modal Props
 */
interface AssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'ticket' | 'project';
  entityId: string;
  entityName: string;
  currentAssignees?: string[]; // IDs of currently assigned users
  teamMembers: TeamMember[];
}

/**
 * Get status badge configuration
 */
function getStatusConfig(status: TeamMember['status']) {
  switch (status) {
    case 'available':
      return {
        label: 'Available',
        color: 'text-success bg-success/10 border-success/20',
        icon: IconCircleCheck,
      };
    case 'at_capacity':
      return {
        label: 'At Capacity',
        color: 'text-warning bg-warning/10 border-warning/20',
        icon: IconAlertTriangle,
      };
    case 'overloaded':
      return {
        label: 'Overloaded',
        color: 'text-error bg-error/10 border-error/20',
        icon: IconAlertTriangle,
      };
  }
}

/**
 * Assign Modal Component (Client Component)
 * Generic assignment modal for both tickets (single select) and projects (multi-select)
 */
export function AssignModal({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityName,
  currentAssignees = EMPTY_ARRAY,
  teamMembers,
}: AssignModalProps) {
  // For ticket (single select)
  const [selectedUserId, setSelectedUserId] = useState<string>(currentAssignees[0]);

  // For project (multi-select)
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set(currentAssignees));

  // Bind the entityId to the action
  const boundAction =
    entityType === 'ticket'
      ? assignTicketAction.bind(null, entityId)
      : assignProjectAction.bind(null, entityId);

  const [state, formAction, isPending] = useActionState(boundAction, null);

  // Handle multi-select toggle
  const handleCheckboxChange = (userId: string, checked: boolean) => {
    const newSet = new Set(selectedUserIds);
    if (checked) {
      newSet.add(userId);
    } else {
      newSet.delete(userId);
    }
    setSelectedUserIds(newSet);
  };

  // Get overloaded members in selection
  const getOverloadedWarnings = () => {
    const selectedMembers =
      entityType === 'ticket'
        ? teamMembers.filter((m) => m.id === selectedUserId)
        : teamMembers.filter((m) => selectedUserIds.has(m.id));

    const overloaded = selectedMembers.filter(
      (m) => m.capacityPercentage >= 100 || m.status === 'overloaded'
    );

    return overloaded;
  };

  const overloadedMembers = getOverloadedWarnings();
  const hasOverloadedWarning = overloadedMembers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign {entityType === 'ticket' ? 'Ticket' : 'Project'}</DialogTitle>
          <DialogDescription>
            {entityType === 'ticket' ? 'Select a team member' : 'Select team members'} to assign to{' '}
            <span className="font-medium text-foreground">{entityName}</span>
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 flex-1 overflow-y-auto">
          {/* Error message */}
          {state && !state.success && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          {/* Success message */}
          {state?.success && (
            <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-md text-sm">
              {entityType === 'ticket' ? 'Ticket' : 'Project'} assigned successfully
            </div>
          )}

          {/* Overloaded Warning */}
          {hasOverloadedWarning && (
            <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-3 rounded-md text-sm flex items-start gap-2">
              <IconAlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Capacity Warning</p>
                <p className="text-xs mt-1">
                  {overloadedMembers.length === 1 ? (
                    <>
                      <strong>{overloadedMembers[0]?.name}</strong> is at or above 100% capacity
                    </>
                  ) : (
                    <>
                      <strong>{overloadedMembers.length} members</strong> are at or above 100%
                      capacity
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Team Member Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {entityType === 'ticket' ? 'Team Member' : 'Team Members'}{' '}
              {entityType === 'project' && (
                <span className="text-muted-foreground font-normal">
                  ({selectedUserIds.size} selected)
                </span>
              )}
            </Label>

            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <IconUsers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No team members available</p>
              </div>
            ) : entityType === 'ticket' ? (
              // Single Select (Radio Group) for Tickets
              <RadioGroup value={selectedUserId} onValueChange={setSelectedUserId}>
                <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg">
                  {teamMembers.map((member) => {
                    const statusConfig = getStatusConfig(member.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                      >
                        <RadioGroupItem value={member.id} id={`radio-${member.id}`} />
                        <input type="hidden" name="assignedToId" value={selectedUserId} />

                        <Label
                          htmlFor={`radio-${member.id}`}
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.image ?? undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{member.name}</span>
                              <Badge variant="outline" className={statusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {member.projectCount} projects • {member.capacityPercentage}% capacity
                              • {member.availableCapacity}% available
                            </div>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            ) : (
              // Multi-Select (Checkboxes) for Projects
              <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg">
                {teamMembers.map((member) => {
                  const statusConfig = getStatusConfig(member.status);
                  const StatusIcon = statusConfig.icon;
                  const isChecked = selectedUserIds.has(member.id);

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                    >
                      <Checkbox
                        id={`checkbox-${member.id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(member.id, checked === true)
                        }
                      />
                      {isChecked && <input type="hidden" name="userIds" value={member.id} />}

                      <Label
                        htmlFor={`checkbox-${member.id}`}
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.image ?? undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{member.name}</span>
                            <Badge variant="outline" className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {member.projectCount} projects • {member.capacityPercentage}% capacity •{' '}
                            {member.availableCapacity}% available
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                (entityType === 'ticket' ? !selectedUserId : selectedUserIds.size === 0)
              }
            >
              {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
