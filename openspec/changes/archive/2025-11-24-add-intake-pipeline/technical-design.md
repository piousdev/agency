# Intake Pipeline - Technical Design Document

## Overview

The Intake Pipeline is a 4-stage workflow system for processing incoming work requests before they become Projects or Tickets.

## Architecture

### Database Schema

#### New Enums

```typescript
// Request type - what kind of work is being requested
requestTypeEnum: ['bug', 'feature', 'enhancement', 'change_request', 'support', 'other'];

// Request stage - pipeline workflow stages
requestStageEnum: ['in_treatment', 'on_hold', 'estimation', 'ready'];

// Confidence level - estimation confidence
confidenceEnum: ['low', 'medium', 'high'];
```

#### Request Table

| Field                 | Type               | Description                            |
| --------------------- | ------------------ | -------------------------------------- |
| id                    | text               | Primary key (nanoid)                   |
| requestNumber         | varchar(20)        | Unique display number (REQ-0001)       |
| title                 | varchar(500)       | Request title                          |
| description           | text               | Detailed description                   |
| type                  | requestTypeEnum    | Type of request                        |
| stage                 | requestStageEnum   | Current pipeline stage                 |
| priority              | ticketPriorityEnum | Priority (reuse existing enum)         |
| stageEnteredAt        | timestamp          | When entered current stage (for aging) |
| businessJustification | text               | Why this work is needed                |
| desiredDeliveryDate   | timestamp          | When requester wants it                |
| stepsToReproduce      | text               | Bug-specific field                     |
| dependencies          | text               | External dependencies                  |
| additionalNotes       | text               | Any extra information                  |
| storyPoints           | integer            | Estimation (1,2,3,5,8,13,21)           |
| confidence            | confidenceEnum     | Estimation confidence                  |
| estimationNotes       | text               | Estimator's notes                      |
| estimatedAt           | timestamp          | When estimation was submitted          |
| holdReason            | text               | Why request is on hold                 |
| holdStartedAt         | timestamp          | When hold started                      |
| convertedToType       | text               | 'project' or 'ticket'                  |
| convertedToId         | text               | ID of created Project/Ticket           |
| convertedAt           | timestamp          | When conversion happened               |
| isConverted           | boolean            | Quick filter for converted             |
| isCancelled           | boolean            | Request was cancelled                  |
| cancelledReason       | text               | Why it was cancelled                   |
| requesterId           | text               | FK to user (who submitted)             |
| assignedPmId          | text               | FK to user (assigned PM)               |
| estimatorId           | text               | FK to user (who estimated)             |
| clientId              | text               | FK to client                           |
| relatedProjectId      | text               | FK to project (context)                |
| createdAt             | timestamp          | Created timestamp                      |
| updatedAt             | timestamp          | Updated timestamp                      |

#### Request Attachment Table

| Field     | Type      | Description      |
| --------- | --------- | ---------------- |
| id        | text      | Primary key      |
| requestId | text      | FK to request    |
| fileId    | text      | FK to file table |
| createdAt | timestamp | Upload timestamp |

#### Request History Table

| Field     | Type      | Description                  |
| --------- | --------- | ---------------------------- |
| id        | text      | Primary key                  |
| requestId | text      | FK to request                |
| actorId   | text      | FK to user (who made change) |
| action    | text      | Action type                  |
| metadata  | jsonb     | Change details               |
| createdAt | timestamp | Change timestamp             |

### API Endpoints

#### Request CRUD

| Method | Endpoint      | Description          |
| ------ | ------------- | -------------------- |
| POST   | /requests     | Create new request   |
| GET    | /requests     | List with filters    |
| GET    | /requests/:id | Get single request   |
| PATCH  | /requests/:id | Update request       |
| DELETE | /requests/:id | Soft delete (cancel) |

#### Stage Operations

| Method | Endpoint                 | Description               |
| ------ | ------------------------ | ------------------------- |
| POST   | /requests/:id/transition | Change stage              |
| POST   | /requests/:id/estimate   | Submit estimation         |
| POST   | /requests/:id/convert    | Convert to Project/Ticket |
| POST   | /requests/:id/hold       | Put on hold               |
| POST   | /requests/:id/resume     | Resume from hold          |

#### Bulk Operations

| Method | Endpoint                  | Description        |
| ------ | ------------------------- | ------------------ |
| POST   | /requests/bulk/transition | Bulk stage change  |
| POST   | /requests/bulk/assign     | Bulk PM assignment |

#### Query Endpoints

| Method | Endpoint               | Description     |
| ------ | ---------------------- | --------------- |
| GET    | /requests/stage-counts | Count per stage |
| GET    | /requests/aging        | Aging requests  |

### Routing Rules

The routing decision determines whether a request becomes a Project or Ticket:

| Story Points                | Destination |
| --------------------------- | ----------- |
| 0-8 points                  | Ticket      |
| 13+ points                  | Project     |
| Change Request (any points) | Ticket      |

### Stage Thresholds (Aging)

| Stage        | Warning  | Critical |
| ------------ | -------- | -------- |
| In Treatment | 24 hours | 48 hours |
| On Hold      | 3 days   | 7 days   |
| Estimation   | 12 hours | 24 hours |
| Ready        | 6 hours  | 12 hours |

### Frontend Routes

| Route                                  | Component         | Description        |
| -------------------------------------- | ----------------- | ------------------ |
| /dashboard/business-center/intake      | IntakePage        | Main pipeline view |
| /dashboard/business-center/intake/new  | NewRequestPage    | Request submission |
| /dashboard/business-center/intake/[id] | RequestDetailPage | Request details    |

### State Management

#### Zustand Store (intake-store.ts)

```typescript
interface IntakeStore {
  // View state
  viewMode: 'cards' | 'table';
  activeStage: RequestStage | 'all';

  // Filters
  filters: {
    priority: Priority[];
    type: RequestType[];
    assignedPmId: string | null;
    dateRange: { from: Date | null; to: Date | null };
  };

  // Selection (for bulk ops)
  selectedIds: string[];

  // Draft persistence
  draft: Partial<RequestFormData> | null;

  // Actions
  setViewMode: (mode: 'cards' | 'table') => void;
  setActiveStage: (stage: RequestStage | 'all') => void;
  setFilters: (filters: Partial<Filters>) => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  saveDraft: (data: Partial<RequestFormData>) => void;
  clearDraft: () => void;
}
```

#### TanStack Query Keys

```typescript
export const intakeKeys = {
  all: ['requests'] as const,
  lists: () => [...intakeKeys.all, 'list'] as const,
  list: (filters: RequestFilters) => [...intakeKeys.lists(), filters] as const,
  details: () => [...intakeKeys.all, 'detail'] as const,
  detail: (id: string) => [...intakeKeys.details(), id] as const,
  stageCounts: () => [...intakeKeys.all, 'stage-counts'] as const,
  aging: () => [...intakeKeys.all, 'aging'] as const,
};
```

### Form Schema (Zod)

```typescript
const requestFormSchema = z.object({
  // Step 1: Basic Info
  title: z.string().min(1).max(500),
  type: z.enum(['bug', 'feature', 'enhancement', 'change_request', 'support', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),

  // Step 2: Description
  description: z.string().min(1),
  businessJustification: z.string().optional(),
  stepsToReproduce: z.string().optional(), // Required if type === 'bug'

  // Step 3: Context
  clientId: z.string().optional(),
  relatedProjectId: z.string().optional(),
  dependencies: z.string().optional(),

  // Step 4: Timeline
  desiredDeliveryDate: z.date().optional(),
  additionalNotes: z.string().optional(),
});
```

### WebSocket Events

| Event                 | Direction       | Payload                                   |
| --------------------- | --------------- | ----------------------------------------- |
| request:created       | Server → Client | { request: Request }                      |
| request:stage-changed | Server → Client | { requestId, oldStage, newStage }         |
| request:estimated     | Server → Client | { requestId, storyPoints, confidence }    |
| request:converted     | Server → Client | { requestId, convertedTo, convertedToId } |

### Performance Considerations

1. **Pagination**: 25 items per page, cursor-based
2. **Caching**: 5-minute stale time for list queries
3. **Optimistic Updates**: Instant UI feedback for transitions
4. **Server Components**: Initial data load via RSC
5. **Real-time**: Socket.IO rooms scoped by stage
