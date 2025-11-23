import { z } from 'zod';

/**
 * Project status enum values
 */
export const projectStatusValues = [
  'proposal',
  'in_development',
  'in_review',
  'delivered',
  'on_hold',
  'maintenance',
  'archived',
] as const;

export type ProjectStatus = (typeof projectStatusValues)[number];

/**
 * Project priority enum values
 */
export const projectPriorityValues = ['low', 'medium', 'high', 'urgent'] as const;

export type ProjectPriority = (typeof projectPriorityValues)[number];

/**
 * Status options for UI select components
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
 * Priority options for UI select components
 */
export const projectPriorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const;

/**
 * URL validation helper
 */
const optionalUrl = z
  .string()
  .url('Must be a valid URL')
  .max(2048, 'URL too long')
  .optional()
  .or(z.literal(''));

/**
 * Schema for creating a new project
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be less than 255 characters'),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
  status: z.enum(projectStatusValues).default('proposal'),
  priority: z.enum(projectPriorityValues).default('medium'),
  dueDate: z.coerce.date().optional().nullable(),
  completionPercentage: z.coerce.number().int().min(0).max(100).default(0).optional(),
  estimatedHours: z.coerce.number().int().positive().optional().nullable(),
  budgetAmount: z.coerce.number().positive().optional().nullable(),
  budgetCurrency: z.string().length(3).default('USD').optional(),
  repositoryUrl: optionalUrl,
  productionUrl: optionalUrl,
  stagingUrl: optionalUrl,
  notes: z.string().optional(),
  startedAt: z.string().optional().nullable(),
  deliveredAt: z.string().optional().nullable(),
  assigneeIds: z.array(z.string()).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Schema for updating an existing project
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be less than 255 characters')
    .optional(),
  description: z.string().optional().nullable(),
  clientId: z.string().min(1, 'Client is required').optional(),
  status: z.enum(projectStatusValues).optional(),
  priority: z.enum(projectPriorityValues).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  completionPercentage: z.coerce.number().int().min(0).max(100).optional(),
  estimatedHours: z.coerce.number().int().positive().optional().nullable(),
  actualHours: z.coerce.number().int().min(0).optional(),
  budgetAmount: z.coerce.number().positive().optional().nullable(),
  budgetCurrency: z.string().length(3).optional(),
  repositoryUrl: optionalUrl.nullable(),
  productionUrl: optionalUrl.nullable(),
  stagingUrl: optionalUrl.nullable(),
  notes: z.string().optional().nullable(),
  startedAt: z.string().optional().nullable(),
  deliveredAt: z.string().optional().nullable(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/**
 * Schema for project status update (quick action)
 */
export const updateProjectStatusSchema = z.object({
  status: z.enum(projectStatusValues),
});

export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>;

/**
 * Schema for project completion update (quick action)
 */
export const updateProjectCompletionSchema = z.object({
  completionPercentage: z.coerce.number().int().min(0).max(100),
});

export type UpdateProjectCompletionInput = z.infer<typeof updateProjectCompletionSchema>;

/**
 * Schema for project priority update (quick action)
 */
export const updateProjectPrioritySchema = z.object({
  priority: z.enum(projectPriorityValues),
});

export type UpdateProjectPriorityInput = z.infer<typeof updateProjectPrioritySchema>;

/**
 * Schema for project assignment
 */
export const assignProjectSchema = z.object({
  userIds: z.array(z.string()).min(1, 'At least one user must be selected'),
});

export type AssignProjectInput = z.infer<typeof assignProjectSchema>;

/**
 * Schema for bulk project operations
 */
export const bulkProjectOperationSchema = z.object({
  projectIds: z
    .array(z.string())
    .min(1, 'Select at least one project')
    .max(100, 'Maximum 100 projects'),
  operation: z.enum(['update_status', 'update_priority', 'assign', 'delete']),
  status: z.enum(projectStatusValues).optional(),
  priority: z.enum(projectPriorityValues).optional(),
  assigneeIds: z.array(z.string()).optional(),
});

export type BulkProjectOperationInput = z.infer<typeof bulkProjectOperationSchema>;

/**
 * Form input type aliases (use z.input for pre-parse types with optional defaults)
 */
export type CreateProjectFormInput = z.input<typeof createProjectSchema>;
export type UpdateProjectFormInput = z.input<typeof updateProjectSchema>;
