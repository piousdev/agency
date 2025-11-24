import type { RequestType, RequestStage, Priority, Confidence } from '@/lib/schemas/request';

// User summary for relations
export interface UserSummary {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

// Client summary for relations
export interface ClientSummary {
  id: string;
  name: string;
}

// Project summary for relations
export interface ProjectSummary {
  id: string;
  name: string;
  status: string;
}

// File attachment
export interface FileAttachment {
  id: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

// Request attachment with file
export interface RequestAttachment {
  id: string;
  requestId: string;
  fileId: string;
  file: FileAttachment;
  createdAt: string;
}

// Request history entry
export interface RequestHistoryEntry {
  id: string;
  requestId: string;
  actorId: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: UserSummary;
}

// Full request type
export interface Request {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  type: RequestType;
  stage: RequestStage;
  priority: Priority;
  stageEnteredAt: string;
  businessJustification?: string | null;
  desiredDeliveryDate?: string | null;
  stepsToReproduce?: string | null;
  dependencies?: string | null;
  additionalNotes?: string | null;
  storyPoints?: number | null;
  confidence?: Confidence | null;
  estimationNotes?: string | null;
  estimatedAt?: string | null;
  holdReason?: string | null;
  holdStartedAt?: string | null;
  convertedToType?: 'project' | 'ticket' | null;
  convertedToId?: string | null;
  convertedAt?: string | null;
  isConverted: boolean;
  isCancelled: boolean;
  cancelledReason?: string | null;
  cancelledAt?: string | null;
  tags: string[];
  requesterId: string;
  assignedPmId?: string | null;
  estimatorId?: string | null;
  clientId?: string | null;
  relatedProjectId?: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  requester?: UserSummary;
  assignedPm?: UserSummary | null;
  estimator?: UserSummary | null;
  client?: ClientSummary | null;
  relatedProject?: ProjectSummary | null;
}

// Request with full relations
export interface RequestWithRelations extends Request {
  attachments?: RequestAttachment[];
  history?: RequestHistoryEntry[];
}

// Stage counts
export interface StageCounts {
  in_treatment: number;
  on_hold: number;
  estimation: number;
  ready: number;
}

// List requests filters
export interface ListRequestsFilters {
  stage?: RequestStage;
  type?: RequestType;
  priority?: Priority;
  assignedPmId?: string;
  clientId?: string;
  isConverted?: boolean;
  isCancelled?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'stageEnteredAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Pagination info
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// List requests response
export interface ListRequestsResponse {
  success: boolean;
  data: Request[];
  pagination: PaginationInfo;
}

// Single request response
export interface RequestResponse {
  success: boolean;
  data: RequestWithRelations;
}

// Stage counts response
export interface StageCountsResponse {
  success: boolean;
  data: StageCounts;
}

// Convert response
export interface ConvertResponse {
  success: boolean;
  data: {
    convertedToType: 'project' | 'ticket';
    convertedToId: string;
  };
  message: string;
}
