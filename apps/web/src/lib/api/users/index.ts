/**
 * User management API client
 * Centralized exports for all user-related API operations
 *
 * Usage in Server Components or Server Actions:
 * ```tsx
 * import { listUsers, updateUser } from "@/lib/api/users";
 * ```
 */

export { deleteUser } from './delete';
export { extendExpiration } from './expiration';
export { getUser } from './get';
// Helper utilities (exported for testing/advanced use)
export { buildApiUrl, getAuthHeaders } from './api-utils';
// User status operations
export { updateInternalStatus } from './internal-status';
// User CRUD operations
export { listUsers } from './list';
// Role operations
export { assignRole, listRoles, removeRole } from './roles';
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
  UpdateInternalStatusInput,
  UpdateUserInput,
  User,
  UserResponse,
} from './types';
export { updateUser } from './update';
