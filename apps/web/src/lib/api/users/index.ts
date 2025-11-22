/**
 * User management API client
 * Centralized exports for all user-related API operations
 *
 * Usage in Server Components or Server Actions:
 * ```tsx
 * import { listUsers, updateUser, listTeamMembers } from "@/lib/api/users";
 * ```
 */

// User CRUD operations
export { deleteUser } from './delete';
export { extendExpiration } from './expiration';
export { getUser } from './get';
export { listUsers } from './list';
export { updateUser } from './update';

// User status operations
export { updateInternalStatus } from './internal-status';

// Capacity operations
export { updateCapacity } from './capacity';

// Team operations
export { listTeamMembers } from './team';

// Role operations
export { assignRole, listRoles, removeRole } from './roles';

// Helper utilities (exported for testing/advanced use)
export { buildApiUrl, getAuthHeaders } from './api-utils';

// Type exports
export type {
  ApiResponse,
  AssignRoleInput,
  ExtendExpirationInput,
  ListRolesParams,
  ListUsersParams,
  PaginatedRolesResponse,
  PaginatedUsersResponse,
  Role,
  TeamMember,
  TeamMemberProject,
  TeamMembersResponse,
  UpdateCapacityInput,
  UpdateInternalStatusInput,
  UpdateUserInput,
  User,
  UserResponse,
} from './types';
