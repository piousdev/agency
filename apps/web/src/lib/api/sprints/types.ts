/**
 * Sprint API types
 */

import type { SprintStatus } from '@/lib/schemas/sprint';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  startDate: string | null;
  endDate: string | null;
  plannedPoints: number;
  completedPoints: number;
  sprintNumber: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SprintWithProject extends Sprint {
  project?: {
    id: string;
    name: string;
  };
}

export interface SprintsListResponse {
  success: boolean;
  data: Sprint[];
  message?: string;
}

export interface SprintResponse {
  success: boolean;
  data: SprintWithProject;
  message?: string;
}

export interface CreateSprintInput {
  projectId: string;
  name: string;
  goal?: string;
  status?: SprintStatus;
  startDate?: string | null;
  endDate?: string | null;
  plannedPoints?: number;
  sprintNumber?: number;
}

export interface UpdateSprintInput {
  name?: string;
  goal?: string | null;
  status?: SprintStatus;
  startDate?: string | null;
  endDate?: string | null;
  plannedPoints?: number;
  completedPoints?: number;
  sprintNumber?: number;
}
