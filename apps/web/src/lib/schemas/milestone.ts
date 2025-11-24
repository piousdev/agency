import { z } from 'zod';

/**
 * Milestone statuses matching the database enum
 */
export const milestoneStatuses = [
  'pending',
  'in_progress',
  'completed',
  'missed',
  'cancelled',
] as const;
export type MilestoneStatus = (typeof milestoneStatuses)[number];

/**
 * Milestone status options for UI selects
 */
export const milestoneStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

/**
 * Schema for creating a new milestone
 */
export const createMilestoneSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  status: z.enum(milestoneStatuses).default('pending'),
  dueDate: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;

/**
 * Schema for updating an existing milestone
 */
export const updateMilestoneSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or less')
    .optional()
    .nullable(),
  status: z.enum(milestoneStatuses).optional(),
  dueDate: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

/**
 * Get status color for UI display
 */
export function getMilestoneStatusColor(status: MilestoneStatus): string {
  const colors: Record<MilestoneStatus, string> = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    missed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  return colors[status];
}

/**
 * Get status icon name for UI display
 */
export function getMilestoneStatusIcon(status: MilestoneStatus): string {
  const icons: Record<MilestoneStatus, string> = {
    pending: 'IconClock',
    in_progress: 'IconProgress',
    completed: 'IconCheck',
    missed: 'IconX',
    cancelled: 'IconBan',
  };
  return icons[status];
}
