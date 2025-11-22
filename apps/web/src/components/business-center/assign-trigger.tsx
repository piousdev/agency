'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { TeamMember } from '@/lib/api/users/types';
import { AssignModal } from './assign-modal';

/**
 * Assign Trigger Props
 */
interface AssignTriggerProps {
  entityType: 'ticket' | 'project';
  entityId: string;
  entityName: string;
  currentAssignees?: string[];
  teamMembers: TeamMember[];
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  buttonClassName?: string;
}

/**
 * Assign Trigger Component (Client Component)
 * Manages modal state for assignment
 */
export function AssignTrigger({
  entityType,
  entityId,
  entityName,
  currentAssignees = [],
  teamMembers,
  buttonText = 'Assign',
  buttonVariant = 'outline',
  buttonSize = 'sm',
  buttonClassName,
}: AssignTriggerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={buttonClassName}
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
      >
        {buttonText}
      </Button>

      <AssignModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        entityType={entityType}
        entityId={entityId}
        entityName={entityName}
        currentAssignees={currentAssignees}
        teamMembers={teamMembers}
      />
    </>
  );
}
