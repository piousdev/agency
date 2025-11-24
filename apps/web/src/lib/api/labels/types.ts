/**
 * Labels API types
 */

import type { LabelScope } from '@/lib/schemas/label';

export interface Label {
  id: string;
  name: string;
  color: string;
  description: string | null;
  scope: LabelScope;
  createdAt: string;
  updatedAt: string;
}

export interface LabelsListResponse {
  success: boolean;
  data: Label[];
}

export interface LabelResponse {
  success: boolean;
  data: Label;
  message?: string;
}

export interface AssignLabelsResponse {
  success: boolean;
  message: string;
  assignedCount?: number;
}

export interface RemoveLabelsResponse {
  success: boolean;
  message: string;
}
