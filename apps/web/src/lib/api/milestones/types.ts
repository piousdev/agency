/**
 * Milestone API types
 */

import type { MilestoneStatus } from '@/lib/schemas/milestone';

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  status: MilestoneStatus;
  dueDate: string | null;
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneWithProject extends Milestone {
  project?: {
    id: string;
    name: string;
  };
}

export interface MilestonesListResponse {
  success: boolean;
  data: Milestone[];
  message?: string;
}

export interface MilestoneResponse {
  success: boolean;
  data: MilestoneWithProject;
  message?: string;
}

export interface CreateMilestoneInput {
  projectId: string;
  name: string;
  description?: string;
  status?: MilestoneStatus;
  dueDate?: string | null;
  sortOrder?: number;
}

export interface UpdateMilestoneInput {
  name?: string;
  description?: string | null;
  status?: MilestoneStatus;
  dueDate?: string | null;
  sortOrder?: number;
}
