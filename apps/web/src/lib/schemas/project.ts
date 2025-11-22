/**
 * Zod validation schemas for project management forms
 * Used for client-side and server-side validation
 */

import { z } from 'zod';

/**
 * Schema for assigning team members to a project
 */
export const assignProjectSchema = z.object({
  userIds: z.array(z.string()).min(1, 'At least one team member is required'),
});

/**
 * Schema for removing a team member from a project
 */
export const removeProjectAssignmentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

/**
 * Schema for updating project status
 */
export const updateProjectStatusSchema = z.object({
  status: z.enum(['intake', 'proposal', 'in_development', 'in_review', 'delivered', 'on_hold']),
});

/**
 *
 * Schema for updating project completion percentage
 */
export const updateProjectCompletionSchema = z.object({
  completionPercentage: z
    .number()
    .int('Completion percentage must be a whole number')
    .min(0, 'Completion percentage cannot be negative')
    .max(100, 'Completion percentage cannot exceed 100'),
});

/**
 * Schema for list projects query parameters
 */
export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'deliveredAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z
    .enum(['intake', 'proposal', 'in_development', 'in_review', 'delivered', 'on_hold'])
    .optional(),
  clientId: z.string().optional(),
  assignedToId: z.string().optional(),
});

/**
 * Project status options for forms
 */
export const projectStatusOptions = [
  { value: 'proposal', label: 'Proposal' },
  { value: 'in_development', label: 'In Development' },
  { value: 'in_review', label: 'In Review' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'archived', label: 'Archived' },
] as const;

/**
 * Schema for creating a new project
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255, 'Name must be less than 255 characters'),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
  status: z
    .enum([
      'proposal',
      'in_development',
      'in_review',
      'delivered',
      'on_hold',
      'maintenance',
      'archived',
    ])
    .default('proposal'),
  completionPercentage: z.coerce.number().int().min(0).max(100).default(0),
  repositoryUrl: z.string().url('Invalid URL').max(2048).optional().or(z.literal('')),
  productionUrl: z.string().url('Invalid URL').max(2048).optional().or(z.literal('')),
  stagingUrl: z.string().url('Invalid URL').max(2048).optional().or(z.literal('')),
  notes: z.string().optional(),
  startedAt: z.string().optional().nullable(),
  deliveredAt: z.string().optional().nullable(),
});

/**
 * Schema for updating an existing project
 */
export const updateProjectSchema = createProjectSchema.partial().extend({
  name: z.string().min(1, 'Project name is required').max(255).optional(),
});

// Type exports for TypeScript
export type AssignProjectInput = z.infer<typeof assignProjectSchema>;
export type RemoveProjectAssignmentInput = z.infer<typeof removeProjectAssignmentSchema>;
export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>;
export type UpdateProjectCompletionInput = z.infer<typeof updateProjectCompletionSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
export type CreateProjectFormInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormInput = z.infer<typeof updateProjectSchema>;
