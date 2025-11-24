import { z } from 'zod';

/**
 * Sprint statuses matching the database enum
 */
export const sprintStatuses = ['planning', 'active', 'completed', 'cancelled'] as const;
export type SprintStatus = (typeof sprintStatuses)[number];

/**
 * Sprint status options for UI selects
 */
export const sprintStatusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

/**
 * Fibonacci sequence for story points
 */
export const storyPointOptions = [1, 2, 3, 5, 8, 13, 21] as const;
export type StoryPoints = (typeof storyPointOptions)[number];

/**
 * Schema for creating a new sprint
 */
export const createSprintSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  goal: z.string().max(2000, 'Goal must be 2000 characters or less').optional(),
  status: z.enum(sprintStatuses).default('planning'),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  plannedPoints: z.number().int().min(0).default(0),
  sprintNumber: z.number().int().min(1).optional(),
});

export type CreateSprintInput = z.infer<typeof createSprintSchema>;

/**
 * Schema for updating an existing sprint
 */
export const updateSprintSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less')
    .optional(),
  goal: z.string().max(2000, 'Goal must be 2000 characters or less').optional().nullable(),
  status: z.enum(sprintStatuses).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  plannedPoints: z.number().int().min(0).optional(),
  completedPoints: z.number().int().min(0).optional(),
  sprintNumber: z.number().int().min(1).optional(),
});

export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;

/**
 * Get status color for UI display
 */
export function getSprintStatusColor(status: SprintStatus): string {
  const colors: Record<SprintStatus, string> = {
    planning: 'bg-purple-100 text-purple-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  return colors[status];
}

/**
 * Calculate sprint progress percentage
 */
export function calculateSprintProgress(plannedPoints: number, completedPoints: number): number {
  if (plannedPoints === 0) return 0;
  return Math.min(Math.round((completedPoints / plannedPoints) * 100), 100);
}

/**
 * Calculate days remaining in sprint
 */
export function calculateDaysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
