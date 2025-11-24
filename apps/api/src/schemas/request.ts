import { z } from 'zod';

// Request type enum
export const requestTypeSchema = z.enum([
  'bug',
  'feature',
  'enhancement',
  'change_request',
  'support',
  'other',
]);

// Request stage enum
export const requestStageSchema = z.enum(['in_treatment', 'on_hold', 'estimation', 'ready']);

// Confidence level enum
export const confidenceSchema = z.enum(['low', 'medium', 'high']);

// Priority enum (reusing from ticket)
export const prioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

// Create request schema
export const createRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  type: requestTypeSchema,
  priority: prioritySchema.optional().default('medium'),
  businessJustification: z.string().optional(),
  desiredDeliveryDate: z.coerce.date().optional(),
  stepsToReproduce: z.string().optional(),
  dependencies: z.string().optional(),
  additionalNotes: z.string().optional(),
  clientId: z.string().optional(),
  relatedProjectId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

// Update request schema
export const updateRequestSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  type: requestTypeSchema.optional(),
  priority: prioritySchema.optional(),
  businessJustification: z.string().optional().nullable(),
  desiredDeliveryDate: z.coerce.date().optional().nullable(),
  stepsToReproduce: z.string().optional().nullable(),
  dependencies: z.string().optional().nullable(),
  additionalNotes: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  relatedProjectId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

// Stage transition schema
export const transitionRequestSchema = z.object({
  toStage: requestStageSchema,
  reason: z.string().optional(), // Required for on_hold transition
});

// Estimate request schema
export const estimateRequestSchema = z.object({
  storyPoints: z.number().int().min(1).max(100),
  confidence: confidenceSchema,
  estimationNotes: z.string().optional(),
});

// Convert request schema
export const convertRequestSchema = z.object({
  destinationType: z.enum(['project', 'ticket']),
  projectId: z.string().optional(), // Required if converting to ticket under a project
  overrideRouting: z.boolean().optional().default(false), // Allow override of automatic routing
});

// Hold request schema
export const holdRequestSchema = z.object({
  reason: z.string().min(1, 'Hold reason is required'),
});

// Assign PM schema
export const assignPmSchema = z.object({
  assignedPmId: z.string().min(1, 'PM ID is required'),
});

// Assign estimator schema
export const assignEstimatorSchema = z.object({
  estimatorId: z.string().min(1, 'Estimator ID is required'),
});

// Bulk transition schema
export const bulkTransitionSchema = z.object({
  requestIds: z.array(z.string()).min(1, 'At least one request ID required'),
  toStage: requestStageSchema,
  reason: z.string().optional(),
});

// Bulk assign schema
export const bulkAssignSchema = z.object({
  requestIds: z.array(z.string()).min(1, 'At least one request ID required'),
  assignedPmId: z.string().min(1, 'PM ID is required'),
});

// List requests query schema
export const listRequestsQuerySchema = z.object({
  stage: requestStageSchema.optional(),
  type: requestTypeSchema.optional(),
  priority: prioritySchema.optional(),
  assignedPmId: z.string().optional(),
  clientId: z.string().optional(),
  isConverted: z.enum(['true', 'false']).optional(),
  isCancelled: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'stageEnteredAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
});

export type CreateRequest = z.infer<typeof createRequestSchema>;
export type UpdateRequest = z.infer<typeof updateRequestSchema>;
export type TransitionRequest = z.infer<typeof transitionRequestSchema>;
export type EstimateRequest = z.infer<typeof estimateRequestSchema>;
export type ConvertRequest = z.infer<typeof convertRequestSchema>;
export type HoldRequest = z.infer<typeof holdRequestSchema>;
export type AssignPm = z.infer<typeof assignPmSchema>;
export type AssignEstimator = z.infer<typeof assignEstimatorSchema>;
export type BulkTransition = z.infer<typeof bulkTransitionSchema>;
export type BulkAssign = z.infer<typeof bulkAssignSchema>;
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;
