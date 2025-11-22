/**
 * Project management API client
 * Centralized exports for all project-related API operations
 *
 * Usage in Server Components or Server Actions:
 * ```tsx
 * import { listProjects, getProject, createProject, updateProject, assignProject } from "@/lib/api/projects";
 * ```
 */

// Project operations
export { assignProject, removeProjectAssignment } from './assign';
export { createProject } from './create';
export { getProject } from './get';
export { listProjects } from './list';
export { updateProject } from './update';
export {
  updateProjectCompletion,
  updateProjectDelivery,
  updateProjectStatus,
} from './update-status';

// Comments operations
export { createComment, deleteComment, getProjectComments, updateComment } from './comments';

// Activity operations
export { getProjectActivity } from './activity';

// Files operations
export { deleteFile, getProjectFiles } from './files';

// Helper utilities (exported for testing/advanced use)
export { buildApiUrl, getAuthHeaders } from './api-utils';

// Type exports
export type {
  ApiResponse,
  AssignProjectInput,
  CreateProjectInput,
  ListProjectsParams,
  PaginatedProjectsResponse,
  Project,
  ProjectAssignee,
  ProjectDetailResponse,
  ProjectResponse,
  ProjectWithRelations,
  RemoveProjectAssignmentInput,
  UpdateProjectCompletionInput,
  UpdateProjectDeliveryInput,
  UpdateProjectInput,
  UpdateProjectStatusInput,
} from './types';

export type {
  Comment,
  CommentAuthor,
  CommentResponse,
  CommentsResponse,
  CreateCommentInput,
  UpdateCommentInput,
} from './comments';

export type {
  Activity,
  ActivityActor,
  ActivityParams,
  ActivityResponse,
  ActivityType,
} from './activity';

export type { FileUploader, FilesResponse, ProjectFile } from './files';
