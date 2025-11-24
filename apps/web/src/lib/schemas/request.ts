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

// Priority enum
export const prioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

// Create request schema (multi-step form)
export const createRequestSchema = z.object({
  // Step 1: Basic Info
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
  type: requestTypeSchema,
  priority: prioritySchema,

  // Step 2: Description
  description: z.string().min(1, 'Description is required'),
  businessJustification: z.string().optional(),
  stepsToReproduce: z.string().optional(),

  // Step 3: Context
  clientId: z.string().optional(),
  relatedProjectId: z.string().optional(),
  dependencies: z.string().optional(),

  // Step 4: Timeline
  desiredDeliveryDate: z.string().optional(),
  additionalNotes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Update request schema
export const updateRequestSchema = createRequestSchema.partial();

// Estimate request schema
export const estimateRequestSchema = z.object({
  storyPoints: z.number().int().min(1).max(100),
  confidence: confidenceSchema,
  estimationNotes: z.string().optional(),
});

// Convert request schema
export const convertRequestSchema = z.object({
  destinationType: z.enum(['project', 'ticket']),
  projectId: z.string().optional(),
  overrideRouting: z.boolean().optional().default(false),
});

// Hold request schema
export const holdRequestSchema = z.object({
  reason: z.string().min(1, 'Hold reason is required'),
});

// Type exports
export type RequestType = z.infer<typeof requestTypeSchema>;
export type RequestStage = z.infer<typeof requestStageSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type Priority = z.infer<typeof prioritySchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type EstimateRequestInput = z.infer<typeof estimateRequestSchema>;
export type ConvertRequestInput = z.infer<typeof convertRequestSchema>;
export type HoldRequestInput = z.infer<typeof holdRequestSchema>;

// Request labels for UI
export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  bug: 'Bug Report',
  feature: 'Feature Request',
  enhancement: 'Enhancement',
  change_request: 'Change Request',
  support: 'Support Request',
  other: 'Other',
};

export const REQUEST_STAGE_LABELS: Record<RequestStage, string> = {
  in_treatment: 'In Treatment',
  on_hold: 'On Hold',
  estimation: 'Estimation',
  ready: 'Ready',
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

// Stage thresholds for aging (in hours)
export const STAGE_THRESHOLDS: Record<RequestStage, { warning: number; critical: number }> = {
  in_treatment: { warning: 24, critical: 48 },
  on_hold: { warning: 72, critical: 168 }, // 3 days, 7 days
  estimation: { warning: 12, critical: 24 },
  ready: { warning: 6, critical: 12 },
};

// Story point options (Fibonacci)
export const STORY_POINT_OPTIONS = [1, 2, 3, 5, 8, 13, 21];

// Options for form selects
export const REQUEST_TYPE_OPTIONS = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'enhancement', label: 'Enhancement' },
  { value: 'change_request', label: 'Change Request' },
  { value: 'support', label: 'Support Request' },
  { value: 'other', label: 'Other' },
] as const;

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const;

export const CONFIDENCE_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

// Routing rules
export function getRoutingRecommendation(
  storyPoints: number | null | undefined,
  type: RequestType
): 'project' | 'ticket' {
  // Change requests always go to tickets
  if (type === 'change_request') {
    return 'ticket';
  }

  // Points-based routing
  if (!storyPoints || storyPoints <= 8) {
    return 'ticket';
  }

  return 'project';
}
