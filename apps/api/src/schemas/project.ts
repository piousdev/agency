import { z } from 'zod';

/**
 * Query parameters schema for listing projects
 */
export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'deliveredAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
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
    .optional(),
  clientId: z.string().optional(),
  assignedToId: z.string().optional(), // Filter by team member assignment
});

/**
 * Schema for updating project status
 */
export const updateProjectStatusSchema = z.object({
  status: z.enum([
    'proposal',
    'in_development',
    'in_review',
    'delivered',
    'on_hold',
    'maintenance',
    'archived',
  ]),
});

/**
 * Schema for assigning team members to a project
 */
export const assignProjectSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1, 'At least one user ID is required'),
});

/**
 * Schema for removing a team member from a project
 */
export const removeProjectAssignmentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

/**
 * Schema for updating project completion percentage
 */
export const updateProjectCompletionSchema = z.object({
  completionPercentage: z.coerce.number().int().min(0).max(100),
});

/**
 * Schema for updating project delivery date
 */
export const updateProjectDeliverySchema = z.object({
  deliveredAt: z.iso.datetime().nullable(),
});

/**
 * Schema for creating a new project
 */
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
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
  repositoryUrl: z.url().max(2048).optional().or(z.literal('')),
  productionUrl: z.url().max(2048).optional().or(z.literal('')),
  stagingUrl: z.url().max(2048).optional().or(z.literal('')),
  notes: z.string().optional(),
  startedAt: z.iso.datetime().optional().nullable(),
  deliveredAt: z.iso.datetime().optional().nullable(),
});

/**
 * Schema for updating an existing project
 */
export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255).optional(),
  description: z.string().optional().nullable(),
  clientId: z.string().min(1).optional(),
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
    .optional(),
  completionPercentage: z.coerce.number().int().min(0).max(100).optional(),
  repositoryUrl: z.url().max(2048).optional().nullable().or(z.literal('')),
  productionUrl: z.url().max(2048).optional().nullable().or(z.literal('')),
  stagingUrl: z.url().max(2048).optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable(),
  startedAt: z.iso.datetime().optional().nullable(),
  deliveredAt: z.iso.datetime().optional().nullable(),
});
