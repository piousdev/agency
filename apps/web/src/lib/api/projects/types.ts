/**
 * Type definitions for project management API client
 * Shared types used across all project-related API operations
 */

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status:
    | 'proposal'
    | 'in_development'
    | 'in_review'
    | 'delivered'
    | 'on_hold'
    | 'maintenance'
    | 'archived';
  clientId: string;
  completionPercentage: number;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAssignee {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface ProjectWithRelations extends Project {
  teamMembers: ProjectAssignee[];
  client: {
    id: string;
    name: string;
    type: string;
  };
  assignees: ProjectAssignee[];
}

export interface PaginatedProjectsResponse {
  success: boolean;
  data: ProjectWithRelations[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ProjectResponse {
  success: boolean;
  data: ProjectWithRelations;
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ListProjectsParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'deliveredAt';
  sortOrder?: 'asc' | 'desc';
  status?:
    | 'proposal'
    | 'in_development'
    | 'in_review'
    | 'delivered'
    | 'on_hold'
    | 'maintenance'
    | 'archived';
  clientId?: string;
  assignedToId?: string;
}

export interface UpdateProjectStatusInput {
  status:
    | 'proposal'
    | 'in_development'
    | 'in_review'
    | 'delivered'
    | 'on_hold'
    | 'maintenance'
    | 'archived';
}

export interface UpdateProjectCompletionInput {
  completionPercentage: number;
}

export interface AssignProjectInput {
  userIds: string[];
}

export interface RemoveProjectAssignmentInput {
  userId: string;
}

export interface UpdateProjectDeliveryInput {
  deliveredAt: string | null;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  clientId: string;
  status?:
    | 'proposal'
    | 'in_development'
    | 'in_review'
    | 'delivered'
    | 'on_hold'
    | 'maintenance'
    | 'archived';
  completionPercentage?: number;
  repositoryUrl?: string;
  productionUrl?: string;
  stagingUrl?: string;
  notes?: string;
  startedAt?: string | null;
  deliveredAt?: string | null;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  clientId?: string;
  status?:
    | 'proposal'
    | 'in_development'
    | 'in_review'
    | 'delivered'
    | 'on_hold'
    | 'maintenance'
    | 'archived';
  completionPercentage?: number;
  repositoryUrl?: string | null;
  productionUrl?: string | null;
  stagingUrl?: string | null;
  notes?: string | null;
  startedAt?: string | null;
  deliveredAt?: string | null;
}

export interface ProjectDetailResponse {
  success: boolean;
  data: ProjectWithRelations & {
    repositoryUrl?: string | null;
    productionUrl?: string | null;
    stagingUrl?: string | null;
    notes?: string | null;
    startedAt?: string | null;
    tickets?: {
      id: string;
      title: string;
      status: string;
      priority: string;
      assignedTo?: {
        id: string;
        name: string;
        email: string;
      } | null;
    }[];
  };
  message?: string;
}
