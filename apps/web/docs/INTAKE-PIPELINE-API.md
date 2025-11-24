# Intake Pipeline API Documentation

Technical documentation for the Intake Pipeline API endpoints and server actions.

## Overview

The Intake Pipeline provides a structured workflow for processing incoming requests before they become tickets or projects. Requests flow through stages: **In Treatment** → **On Hold** (optional) → **Estimation** → **Ready** → **Converted**.

## API Endpoints

Base URL: `/api/requests`

### CRUD Operations

#### List Requests

```
GET /api/requests
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `stage` | string | Filter by stage (`in_treatment`, `on_hold`, `estimation`, `ready`) |
| `type` | string | Filter by type (`bug`, `feature`, `enhancement`, `change_request`, `support`, `other`) |
| `priority` | string | Filter by priority (`critical`, `high`, `medium`, `low`) |
| `assignedPmId` | string | Filter by assigned PM |
| `clientId` | string | Filter by client |
| `isConverted` | boolean | Filter by conversion status |
| `isCancelled` | boolean | Filter by cancellation status |
| `search` | string | Search in title and description |
| `sortBy` | string | Sort field (`createdAt`, `updatedAt`, `priority`, `stageEnteredAt`) |
| `sortOrder` | string | Sort direction (`asc`, `desc`) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response:**

```typescript
{
  data: Request[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

#### Get Single Request

```
GET /api/requests/:id
```

**Response:**

```typescript
{
  data: RequestWithRelations;
}
```

#### Create Request

```
POST /api/requests
```

**Body:**

```typescript
{
  title: string,           // Required
  type: RequestType,       // Required
  priority: Priority,      // Required
  description?: string,
  clientId?: string,
  tags?: string[]
}
```

#### Update Request

```
PATCH /api/requests/:id
```

**Body:** Any fields from CreateRequest (all optional)

#### Delete Request (Soft Delete)

```
DELETE /api/requests/:id
```

### Stage Operations

#### Transition Request

```
POST /api/requests/:id/transition
```

**Body:**

```typescript
{
  toStage: RequestStage,
  reason?: string          // Required for on_hold
}
```

**Valid Transitions:**
| From | To |
|------|-----|
| `in_treatment` | `on_hold`, `estimation` |
| `on_hold` | `in_treatment`, `estimation` |
| `estimation` | `in_treatment`, `on_hold`, `ready` |
| `ready` | `in_treatment`, `on_hold`, `estimation` |

#### Hold Request

```
POST /api/requests/:id/hold
```

**Body:**

```typescript
{
  reason: string,          // Required
  expectedResumeDate?: string  // ISO date
}
```

#### Resume Request

```
POST /api/requests/:id/resume
```

No body required. Moves from `on_hold` back to `in_treatment`.

### Estimation

#### Submit Estimation

```
POST /api/requests/:id/estimate
```

**Body:**

```typescript
{
  storyPoints: number,     // 1-100
  confidence: 'low' | 'medium' | 'high',
  estimatorNotes?: string
}
```

Auto-transitions request to `ready` stage.

### Conversion

#### Convert to Project/Ticket

```
POST /api/requests/:id/convert
```

**Body:**

```typescript
{
  type: 'ticket' | 'project',
  title?: string,          // Override request title
  clientId?: string,
  projectId?: string       // For tickets only
}
```

**Response:**

```typescript
{
  data: {
    type: 'ticket' | 'project',
    entityId: string,
    request: Request
  }
}
```

**Routing Rules:**

- `change_request` type → Always ticket
- 1-8 story points → Ticket
- 9+ story points → Project

### Assignment

#### Assign PM

```
POST /api/requests/:id/assign-pm
```

**Body:**

```typescript
{
  pmId: string;
}
```

#### Assign Estimator

```
POST /api/requests/:id/assign-estimator
```

**Body:**

```typescript
{
  estimatorId: string;
}
```

### Bulk Operations

#### Bulk Transition

```
POST /api/requests/bulk/transition
```

**Body:**

```typescript
{
  requestIds: string[],
  toStage: RequestStage,
  reason?: string
}
```

#### Bulk Assign PM

```
POST /api/requests/bulk/assign
```

**Body:**

```typescript
{
  requestIds: string[],
  assignedPmId: string
}
```

### Analytics

#### Stage Counts

```
GET /api/requests/stage-counts
```

**Response:**

```typescript
{
  data: {
    in_treatment: number,
    on_hold: number,
    estimation: number,
    ready: number
  }
}
```

## Server Actions

Located in `src/lib/actions/business-center/requests.ts`

### Query Actions

```typescript
// List requests with filters
listRequests(filters?: ListRequestsFilters): Promise<ActionResponse<{
  requests: Request[],
  pagination: Pagination
}>>

// Get single request
getRequest(id: string): Promise<ActionResponse<RequestWithRelations>>

// Get stage counts
getStageCounts(): Promise<ActionResponse<StageCounts>>
```

### Mutation Actions

```typescript
// CRUD
createRequest(input: CreateRequestInput): Promise<ActionResponse<Request>>
updateRequest(id: string, input: UpdateRequestInput): Promise<ActionResponse<Request>>
cancelRequest(id: string, reason?: string): Promise<ActionResponse<void>>

// Stage operations
transitionRequest(id: string, toStage: string, reason?: string): Promise<ActionResponse<Request>>
holdRequest(id: string, input: HoldRequestInput): Promise<ActionResponse<Request>>
resumeRequest(id: string): Promise<ActionResponse<Request>>

// Estimation & Conversion
estimateRequest(id: string, input: EstimateRequestInput): Promise<ActionResponse<Request>>
convertRequest(id: string, input: ConvertRequestInput): Promise<ActionResponse<ConvertResponse>>

// Assignment
assignPm(id: string, pmId: string): Promise<ActionResponse<Request>>
assignEstimator(id: string, estimatorId: string): Promise<ActionResponse<Request>>

// Bulk operations
bulkTransitionRequests(ids: string[], toStage: string, reason?: string): Promise<ActionResponse<BulkOperationResult>>
bulkAssignPm(ids: string[], pmId: string): Promise<ActionResponse<BulkOperationResult>>
```

## Type Definitions

### Request

```typescript
interface Request {
  id: string;
  requestNumber: string; // Auto-generated: REQ-001
  title: string;
  description: string | null;
  type: RequestType;
  stage: RequestStage;
  priority: Priority;
  tags: string[];
  storyPoints: number | null;
  confidence: ConfidenceLevel | null;
  estimatorNotes: string | null;
  holdReason: string | null;
  expectedResumeDate: string | null;
  isConverted: boolean;
  isCancelled: boolean;
  requesterId: string;
  assignedPmId: string | null;
  assignedEstimatorId: string | null;
  clientId: string | null;
  convertedToProjectId: string | null;
  convertedToTicketId: string | null;
  stageEnteredAt: string;
  createdAt: string;
  updatedAt: string;
}
```

### Enums

```typescript
type RequestType = 'bug' | 'feature' | 'enhancement' | 'change_request' | 'support' | 'other';
type RequestStage = 'in_treatment' | 'on_hold' | 'estimation' | 'ready';
type Priority = 'critical' | 'high' | 'medium' | 'low';
type ConfidenceLevel = 'low' | 'medium' | 'high';
```

## Error Handling

All server actions return `ActionResponse<T>`:

```typescript
type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };
```

Common error codes:

- `FETCH_ERROR` - Failed to fetch data
- `CREATE_ERROR` - Failed to create request
- `UPDATE_ERROR` - Failed to update request
- `TRANSITION_ERROR` - Invalid stage transition
- `ESTIMATE_ERROR` - Estimation validation failed
- `CONVERT_ERROR` - Conversion failed
- `PERMISSION_DENIED` - Insufficient permissions

## Cache Invalidation

Server actions automatically revalidate these paths:

- `/dashboard/business-center/intake` - After any request mutation
- `/dashboard/business-center/projects` - After conversion to project
