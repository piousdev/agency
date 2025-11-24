/**
 * Labels API client
 * Centralized exports for all label-related API operations
 */

export { listLabels } from './list';
export { getLabel } from './get';
export { createLabel } from './create';
export { updateLabel } from './update';
export { deleteLabel } from './delete';
export {
  assignLabelsToTicket,
  removeLabelsFromTicket,
  getTicketLabels,
  assignLabelsToProject,
  removeLabelsFromProject,
  getProjectLabels,
} from './assign';
export type {
  Label,
  LabelsListResponse,
  LabelResponse,
  AssignLabelsResponse,
  RemoveLabelsResponse,
} from './types';
