# Intake Pipeline Technical Documentation

Component architecture, state management, and development guide for the Intake
Pipeline feature.

## Component Architecture

### Directory Structure

```
src/
├── app/(default)/dashboard/business-center/intake/
│   ├── page.tsx              # Server component - main list view
│   ├── new/page.tsx          # Server component - new request form
│   └── [id]/page.tsx         # Server component - request detail
│
└── components/dashboard/business-center/intake/
    ├── index.ts              # Barrel exports
    ├── intake-client.tsx     # Client component - main view logic
    ├── request-card.tsx      # Request card component
    ├── request-form.tsx      # Multi-step request form
    ├── estimation-form.tsx   # Estimation submission form
    ├── filter-sidebar.tsx    # Filter controls
    ├── filter-sheet.tsx      # Mobile filter drawer
    └── __tests__/            # Component tests
```

### Component Hierarchy

```
page.tsx (Server)
└── IntakeClient (Client)
    ├── StageTabs
    │   └── Stage count badges
    ├── FilterSidebar / FilterSheet (mobile)
    │   ├── Priority filters
    │   ├── Type filters
    │   └── PM filter
    ├── View Toggle (card/table)
    ├── Bulk Actions Bar
    │   ├── Bulk transition
    │   └── Bulk assign
    └── Request List
        └── RequestCard (multiple)
            ├── Priority badge
            ├── Stage badge (with aging)
            ├── Type badge
            ├── Tags
            ├── PM avatar
            └── Actions menu
```

## Key Components

### RequestCard

Displays a single request with all relevant information.

**Props:**

```typescript
interface RequestCardProps {
  request: Request;
  selectable?: boolean;
  onTransition?: (requestId: string, stage: RequestStage) => void;
  onAssignPm?: (requestId: string, pmId: string) => void;
  availablePMs?: Array<{ id: string; name: string }>;
}
```

**Features:**

- Priority and stage badges with color coding
- Aging indicators (warning/critical)
- Tags display (max 3 visible, +N more)
- PM avatar with fallback initials
- Selection checkbox (optional)
- Actions dropdown menu
- Link to detail page

**Data attributes:**

- `data-testid="request-card"` - Card container
- `data-testid="request-checkbox"` - Selection checkbox

### RequestForm

Multi-step form for creating new requests.

**Steps:**

1. Basic Info (title, type, priority)
2. Details (description, client, tags)
3. Review & Submit

**Features:**

- Draft persistence (Zustand + localStorage)
- Zod validation per step
- Progress indicator
- Navigation between steps

### EstimationForm

Form for submitting request estimates.

**Fields:**

- Story points (1-100, slider + input)
- Confidence level (low/medium/high)
- Estimator notes (optional)

### FilterSidebar / FilterSheet

Filter controls for the request list.

**Filters:**

- Stage (tabs, not in sidebar)
- Priority (multi-select)
- Type (multi-select)
- Assigned PM (single select)
- Search (text input)

---

## State Management

### Zustand Store (`intake-store.ts`)

Central state for intake pipeline UI.

```typescript
interface IntakeState {
  // View state
  viewMode: 'card' | 'table';

  // Filter state
  filters: IntakeFilters;

  // Selection state
  selectedIds: string[];

  // Draft form state
  draft: Partial<CreateRequestInput> | null;
  draftStep: number;
}

interface IntakeFilters {
  stage: RequestStage | null;
  priority: Priority | null;
  type: RequestType | null;
  assignedPmId: string | null;
  search: string;
}
```

### Actions

```typescript
// View
setViewMode: (mode: 'card' | 'table') => void;

// Filters
setFilters: (filters: Partial<IntakeFilters>) => void;
clearFilters: () => void;

// Selection
toggleSelection: (id: string) => void;
selectAll: (ids: string[]) => void;
clearSelection: () => void;

// Draft
saveDraft: (data: Partial<CreateRequestInput>) => void;
setDraftStep: (step: number) => void;
clearDraft: () => void;
```

### Selectors

```typescript
// Computed selectors
selectHasActiveFilters: (state) => boolean;
selectSelectedCount: (state) => number;
selectHasDraft: (state) => boolean;
```

### Persistence

The store uses Zustand's persist middleware:

```typescript
persist(
  (set, get) => ({...}),
  {
    name: 'intake-store',
    partialize: (state) => ({
      viewMode: state.viewMode,
      draft: state.draft,
      draftStep: state.draftStep,
    }),
  }
)
```

**Persisted:** `viewMode`, `draft`, `draftStep` **Not persisted:** `filters`,
`selectedIds`

---

## Schemas & Validation

### Request Schemas (`src/lib/schemas/request.ts`)

```typescript
// Create request input
export const createRequestSchema = z.object({
  title: z.string().min(1).max(255),
  type: requestTypeSchema,
  priority: prioritySchema,
  description: z.string().optional(),
  clientId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

// Update request input
export const updateRequestSchema = createRequestSchema.partial();

// Estimate request input
export const estimateRequestSchema = z.object({
  storyPoints: z.number().min(1).max(100),
  confidence: confidenceSchema,
  estimatorNotes: z.string().optional(),
});

// Convert request input
export const convertRequestSchema = z.object({
  type: z.enum(['ticket', 'project']),
  title: z.string().optional(),
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

// Hold request input
export const holdRequestSchema = z.object({
  reason: z.string().min(1),
  expectedResumeDate: z.string().optional(),
});
```

### Constants

```typescript
// Request type labels
export const REQUEST_TYPE_LABELS = {
  bug: 'Bug Report',
  feature: 'Feature Request',
  enhancement: 'Enhancement',
  change_request: 'Change Request',
  support: 'Support Request',
  other: 'Other',
};

// Stage labels
export const REQUEST_STAGE_LABELS = {
  in_treatment: 'In Treatment',
  on_hold: 'On Hold',
  estimation: 'Estimation',
  ready: 'Ready',
};

// Priority labels
export const PRIORITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

// Aging thresholds (hours)
export const STAGE_THRESHOLDS = {
  in_treatment: { warning: 24, critical: 48 },
  on_hold: { warning: 72, critical: 168 },
  estimation: { warning: 24, critical: 48 },
  ready: { warning: 72, critical: 168 },
};
```

### Routing Logic

```typescript
export function getRoutingRecommendation(
  storyPoints: number,
  type: RequestType
): 'ticket' | 'project' {
  // Change requests always go to tickets
  if (type === 'change_request') return 'ticket';

  // Points-based routing
  return storyPoints <= 8 ? 'ticket' : 'project';
}
```

---

## Server Actions

### Location

`src/lib/actions/business-center/requests.ts`

### Pattern

All actions follow this pattern:

```typescript
export async function actionName(
  params...
): Promise<ActionResponse<ReturnType>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/endpoint`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Default error' }));
      throw new BusinessCenterError(error.message, 'ERROR_CODE');
    }

    const data = await response.json();
    revalidatePath('/dashboard/business-center/intake');
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Action name');
  }
}
```

### Error Handling

```typescript
// Custom error class
export class BusinessCenterError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'BusinessCenterError';
  }
}

// Error handler
export function handleApiError<T>(
  error: unknown,
  context: string
): ActionResponse<T> {
  console.error(`${context} error:`, error);

  if (error instanceof BusinessCenterError) {
    return { success: false, error: error.message, code: error.code };
  }

  if (error instanceof Error) {
    return { success: false, error: error.message };
  }

  return { success: false, error: 'An unexpected error occurred' };
}
```

---

## Testing

### Unit Tests

**Location:** `src/lib/schemas/__tests__/request.test.ts` **Coverage:** 70 tests
for all Zod schemas and routing logic

**Location:** `src/lib/stores/__tests__/intake-store.test.ts` **Coverage:** 57
tests for Zustand store actions and selectors

### Component Tests

**Location:** `src/components/dashboard/business-center/intake/__tests__/`
**Coverage:** RequestCard rendering, variants, selection

### Integration Tests

**Location:** `src/lib/actions/business-center/__tests__/requests.test.ts`
**Coverage:** 31 tests for all server actions

### E2E Tests

**Location:** `tests/e2e/intake-pipeline.spec.ts` **Coverage:** Full user flows
(submission, transition, estimation, conversion)

**Location:** `tests/e2e/intake-pipeline-a11y.spec.ts` **Coverage:**
Accessibility (keyboard, screen reader, focus)

---

## Development Guidelines

### Adding a New Filter

1. Add field to `IntakeFilters` in store
2. Add UI control in `FilterSidebar`
3. Pass filter to `listRequests` action
4. Update tests

### Adding a New Stage Action

1. Create server action in `requests.ts`
2. Add API endpoint in backend
3. Add UI trigger (menu item, button)
4. Add tests

### Modifying Request Schema

1. Update Zod schema in `request.ts`
2. Update database schema if needed
3. Run migration
4. Update TypeScript types
5. Update form components
6. Update tests

### Performance Considerations

- Use server components for initial data fetch
- Client components only for interactivity
- Avoid re-fetching on every filter change (debounce search)
- Use optimistic updates for better UX
- Paginate large lists
