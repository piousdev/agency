/**
 * Type definitions for user management API client
 * Shared types used across all user-related API operations
 */

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  isInternal: boolean | null;
  expiresAt: string | null;
  roles?: Role[];
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  roleType: string;
  permissions: Record<string, boolean> | null;
  createdAt: string;
  assignedAt?: Date;
  assignedBy?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface PaginatedUsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  isInternal?: 'true' | 'false' | 'all';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  image?: string | null;
  role?: 'admin' | 'editor' | 'client';
  isInternal?: boolean;
  expiresAt?: string | null;
}

export interface AssignRoleInput {
  roleId: string;
}

export interface UpdateInternalStatusInput {
  isInternal: boolean;
}

export interface ExtendExpirationInput {
  expiresAt: string | null;
}

export interface PaginatedRolesResponse {
  success: boolean;
  data: Role[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ListRolesParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  roleType?: 'internal' | 'client' | 'all';
}
