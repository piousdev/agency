import { z } from 'zod';

/**
 * Label scope enum - matches database enum
 */
export const labelScopes = ['global', 'project', 'ticket'] as const;
export type LabelScope = (typeof labelScopes)[number];

/**
 * Hex color regex pattern
 */
const hexColorPattern = /^#[0-9A-Fa-f]{6}$/;

/**
 * Base label schema with common fields
 */
const labelBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Label name is required')
    .max(100, 'Label name must be 100 characters or less'),
  color: z
    .string()
    .regex(hexColorPattern, 'Color must be a valid hex color (e.g., #FF5733)')
    .default('#6B7280'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  scope: z.enum(labelScopes).default('global'),
});

/**
 * Schema for creating a new label
 */
export const createLabelSchema = labelBaseSchema;

/**
 * Schema for updating an existing label
 */
export const updateLabelSchema = labelBaseSchema.partial();

/**
 * Schema for assigning labels to an entity
 */
export const assignLabelsSchema = z.object({
  labelIds: z.array(z.string()).min(1, 'At least one label is required'),
});

/**
 * Schema for removing labels from an entity
 */
export const removeLabelsSchema = z.object({
  labelIds: z.array(z.string()).min(1, 'At least one label is required'),
});

/**
 * Type exports
 */
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
export type AssignLabelsInput = z.infer<typeof assignLabelsSchema>;
export type RemoveLabelsInput = z.infer<typeof removeLabelsSchema>;

/**
 * Label type for API responses
 */
export interface Label {
  id: string;
  name: string;
  color: string;
  description: string | null;
  scope: LabelScope;
  createdAt: string;
  updatedAt: string;
}

/**
 * Predefined label colors for color picker
 */
export const labelColors = [
  { name: 'Gray', value: '#6B7280' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Rose', value: '#F43F5E' },
] as const;
