/**
 * Business Center Type Definitions
 * Centralized type exports for all Business Center components
 */

import type { ProjectWithRelations } from '@/lib/api/projects/types';
import type { TeamMember } from '@/lib/api/users/types';

/**
 * Business Center Data Interface
 * Defines the complete structure for all data passed from the server to the Business Center
 */
export interface BusinessCenterData {
  activeProjects: ProjectWithRelations[];
  teamMembers: TeamMember[];
  upcomingDeliveries: ProjectWithRelations[];
  recentlyCompleted: ProjectWithRelations[];
}

/**
 * Active Work Content Component Props
 */
export interface ActiveWorkContentProps {
  projects: ProjectWithRelations[];
  teamMembers: TeamMember[];
}

/**
 * Active Work Software Component Props
 */
export interface ActiveWorkSoftwareProps {
  projects: ProjectWithRelations[];
  teamMembers: TeamMember[];
}

/**
 * Team Capacity Component Props
 */
export interface TeamCapacityProps {
  teamMembers: TeamMember[];
}

/**
 * Delivery Calendar Component Props
 */
export interface DeliveryCalendarProps {
  projects: ProjectWithRelations[];
}

/**
 * Recently Completed Component Props
 */
export interface RecentlyCompletedProps {
  projects: ProjectWithRelations[];
}

/**
 * Capacity Modal Component Props
 */
export interface CapacityModalProps {
  userId: string;
  userName: string;
  currentCapacity: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Assign Modal Component Props
 */
export interface AssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'ticket' | 'project';
  entityId: string;
  entityName: string;
  currentAssignees?: string[];
  teamMembers: TeamMember[];
}

/**
 * Assign Trigger Component Props
 */
export interface AssignTriggerProps {
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
 * Priority levels for tickets and projects
 */
export type Priority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Team member status based on capacity
 */
export type TeamMemberStatus = 'available' | 'at_capacity' | 'overloaded';

/**
 * Production stage for creative/content projects
 */
export type ContentProductionStage = 'Pre-Production' | 'In-Production' | 'Post-Production';

/**
 * Development stage for software projects
 */
export type SoftwareDevelopmentStage = 'Design' | 'Development' | 'Testing' | 'Delivery';
