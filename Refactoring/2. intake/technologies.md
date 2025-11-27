# Intake Navigation - Technologies & Patterns

## Document Information

- **Component**: Intake (Request Management Pipeline)
- **Version**: 1.0
- **Last Updated**: November 23, 2025
- **Status**: Draft

---

## 1. Core Technology Stack

### 1.1 Frontend Framework

**Next.js 15 (App Router)** - Already in use in the codebase

- Server Components by default for data fetching
- Server Actions for mutations (form submissions)
- Client Components only for interactivity
- Route groups for layout organization

### 1.2 UI Component Library

**shadcn/ui + Tailwind CSS** - Already in use

- Pre-built accessible components
- Customizable via CSS variables
- Follows Radix UI primitives

---

## 2. Form Management

### 2.1 React Hook Form

**Library**: `react-hook-form` (v7.x) **Resolver**: `@hookform/resolvers/zod`

**Key Patterns**:

```typescript
// Multi-step form with validation per step
const {
  register,
  handleSubmit,
  trigger,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur', // Validate on blur for better UX
});

// Step validation before navigation
const handleNext = async () => {
  const isValid = await trigger(['title', 'type', 'priority']);
  if (isValid) setStep(step + 1);
};

// Server error handling
const onSubmit = async (data) => {
  const response = await submitRequest(data);
  if (response.error) {
    setError('root.serverError', {
      type: response.status,
      message: response.message,
    });
  }
};
```

**Best Practices**:

- Use `mode: 'onBlur'` for multi-step forms to validate on field exit
- Use `trigger()` to validate specific fields before step navigation
- Use `setError('root.serverError', {...})` for server-side errors
- Use `errors.root?.serverError` to display server errors

### 2.2 Zod Schema Validation

**Library**: `zod` (v3.x)

**Key Patterns**:

```typescript
// Request form schema with discriminated unions
const RequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('change_request'),
    relatedProjectId: z.string().min(1, 'Related project is required'),
    // ... common fields
  }),
  z.object({
    type: z.literal('new_feature'),
    relatedProjectId: z.string().optional(),
    // ... common fields
  }),
  // ... other types
]);

// Partial schemas for multi-step validation
const Step1Schema = RequestSchema.pick({
  title: true,
  type: true,
  priority: true,
});

// Safe parsing with proper error handling
const result = RequestSchema.safeParse(data);
if (!result.success) {
  return { errors: result.error.flatten() };
}
```

**Best Practices**:

- Use discriminated unions for type-dependent validation
- Use `.pick()` to extract step-specific validation
- Use `.safeParse()` for server-side validation in Server Actions
- Define schemas in `/lib/schemas/` directory

---

## 3. State Management

### 3.1 Zustand (Client State)

**Library**: `zustand` (v5.x)

**Use Cases**:

- Pipeline filter preferences
- Edit mode state
- Draft form persistence
- UI preferences (view mode: list/card)

**Key Patterns**:

```typescript
// Intake store with persist and devtools
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface IntakeStore {
  // Filter state
  filters: IntakeFilters;
  setFilters: (filters: Partial<IntakeFilters>) => void;
  resetFilters: () => void;

  // View preferences
  viewMode: 'list' | 'card';
  setViewMode: (mode: 'list' | 'card') => void;

  // Draft management
  draftRequest: Partial<RequestForm> | null;
  saveDraft: (draft: Partial<RequestForm>) => void;
  clearDraft: () => void;
}

export const useIntakeStore = create<IntakeStore>()(
  devtools(
    persist(
      (set) => ({
        filters: defaultFilters,
        setFilters: (filters) =>
          set(
            (state) => ({
              filters: { ...state.filters, ...filters },
            }),
            undefined,
            'intake/setFilters'
          ),
        resetFilters: () =>
          set({ filters: defaultFilters }, undefined, 'intake/resetFilters'),

        viewMode: 'list',
        setViewMode: (mode) =>
          set({ viewMode: mode }, undefined, 'intake/setViewMode'),

        draftRequest: null,
        saveDraft: (draft) =>
          set({ draftRequest: draft }, undefined, 'intake/saveDraft'),
        clearDraft: () =>
          set({ draftRequest: null }, undefined, 'intake/clearDraft'),
      }),
      { name: 'intake-store' }
    )
  )
);
```

**Best Practices**:

- Use `devtools` middleware for debugging
- Use `persist` for user preferences and drafts
- Name actions for Redux DevTools clarity
- Keep store focused (split into slices if needed)

### 3.2 TanStack Query (Server State)

**Library**: `@tanstack/react-query` (v5.x)

**Use Cases**:

- Request data fetching with caching
- Optimistic updates for stage transitions
- Real-time data invalidation
- Pagination and infinite scroll

**Key Patterns**:

```typescript
// Query keys factory for type safety
export const intakeKeys = {
  all: ['intake'] as const,
  lists: () => [...intakeKeys.all, 'list'] as const,
  list: (filters: IntakeFilters) => [...intakeKeys.lists(), filters] as const,
  details: () => [...intakeKeys.all, 'detail'] as const,
  detail: (id: string) => [...intakeKeys.details(), id] as const,
  stageCounts: () => [...intakeKeys.all, 'stageCounts'] as const,
};

// Optimistic update for stage transition
const moveToEstimation = useMutation({
  mutationFn: async ({ requestId, estimatorId }) => {
    return await moveRequestToEstimation(requestId, estimatorId);
  },
  onMutate: async ({ requestId }) => {
    await queryClient.cancelQueries({ queryKey: intakeKeys.lists() });
    const previousData = queryClient.getQueryData(
      intakeKeys.list(currentFilters)
    );

    // Optimistically update the cache
    queryClient.setQueryData(intakeKeys.list(currentFilters), (old) => ({
      ...old,
      items: old.items.map((item) =>
        item.id === requestId ? { ...item, stage: 'estimation' } : item
      ),
    }));

    return { previousData };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(
      intakeKeys.list(currentFilters),
      context.previousData
    );
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: intakeKeys.lists() });
    queryClient.invalidateQueries({ queryKey: intakeKeys.stageCounts() });
  },
});
```

**Best Practices**:

- Use query key factories for consistency
- Implement optimistic updates for better UX
- Always handle rollback on error
- Invalidate related queries on mutation success

---

## 4. Drag and Drop

### 4.1 dnd-kit

**Library**: `@dnd-kit/core`, `@dnd-kit/sortable`

**Use Cases**:

- Kanban board for pipeline stages (future)
- Reordering requests within a stage
- Drag handles for widget reordering

**Key Patterns**:

```typescript
// Sortable list setup
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

function SortableRequestList({ items, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableRequestCard key={item.id} request={item} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

**Best Practices**:

- Use keyboard sensor for accessibility
- Implement drag overlay for better visual feedback
- Use `closestCenter` for simple lists, `closestCorners` for grids
- Persist order changes optimistically

---

## 5. Real-Time Updates

### 5.1 Socket.IO

**Library**: `socket.io-client` (v4.x)

**Use Cases**:

- New request notifications
- Stage change updates
- Aging threshold alerts
- Estimation assignments

**Key Patterns**:

```typescript
// Socket hook for intake events
export function useIntakeSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    socket.on('intake:request:created', (data) => {
      queryClient.invalidateQueries({ queryKey: intakeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: intakeKeys.stageCounts() });
    });

    socket.on('intake:request:stage-changed', ({ requestId, newStage }) => {
      queryClient.setQueryData(intakeKeys.lists(), (old) => {
        // Update the request in cache
      });
    });

    socket.on('intake:alert:aging', (data) => {
      // Show toast notification
    });

    return () => {
      socket.off('intake:request:created');
      socket.off('intake:request:stage-changed');
      socket.off('intake:alert:aging');
    };
  }, [queryClient]);
}
```

**Best Practices**:

- Register event handlers once, clean up on unmount
- Use rooms for scoped updates (e.g., by stage, by PM)
- Avoid registering handlers in connect event
- Use `socket.auth.offset` for at-least-once delivery

---

## 6. File Upload

### 6.1 File Upload Pattern

**Approach**: Direct upload to S3/R2 with presigned URLs

**Key Patterns**:

```typescript
// Server Action: Generate presigned URL
export async function getUploadUrl(fileName: string, contentType: string) {
  const key = `requests/${nanoid()}/${fileName}`;
  const signedUrl = await generatePresignedUrl(key, contentType);
  return { uploadUrl: signedUrl, fileKey: key };
}

// Client: Upload file
async function uploadFile(file: File) {
  const { uploadUrl, fileKey } = await getUploadUrl(file.name, file.type);

  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  return fileKey;
}
```

**Best Practices**:

- Validate file type and size on client AND server
- Use presigned URLs for direct upload (bypass server)
- Store file keys, not full URLs in database
- Generate signed download URLs on demand

---

## 7. Multi-Step Form Pattern

### 7.1 Implementation Pattern

```typescript
// Multi-step form container
function RequestSubmissionForm() {
  const [step, setStep] = useState(1);
  const methods = useForm<RequestFormData>({
    resolver: zodResolver(RequestSchema),
    mode: 'onBlur',
    defaultValues: loadDraft(), // From Zustand
  });

  const steps = [
    { title: 'Basic Info', schema: Step1Schema, fields: ['title', 'type', 'priority'] },
    { title: 'Description', schema: Step2Schema, fields: ['description', 'justification'] },
    { title: 'Context', schema: Step3Schema, fields: ['attachments', 'dependencies'] },
    { title: 'Timeline', schema: Step4Schema, fields: ['deliveryDate', 'flexibility'] },
  ];

  const validateStep = async () => {
    const currentFields = steps[step - 1].fields;
    return await methods.trigger(currentFields);
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      saveDraft(methods.getValues()); // Auto-save to Zustand
      setStep(step + 1);
    }
  };

  return (
    <FormProvider {...methods}>
      <StepIndicator currentStep={step} steps={steps} />
      {step === 1 && <Step1BasicInfo />}
      {step === 2 && <Step2Description />}
      {step === 3 && <Step3Context />}
      {step === 4 && <Step4Timeline />}
      <FormNavigation
        step={step}
        totalSteps={4}
        onBack={() => setStep(step - 1)}
        onNext={handleNext}
        onSubmit={methods.handleSubmit(onSubmit)}
      />
    </FormProvider>
  );
}
```

---

## 8. Database Patterns

### 8.1 Drizzle ORM

**Already in use** - Follow existing patterns in `apps/api/src/db/`

**Key Patterns for Intake**:

```typescript
// Request table with proper relations
export const request = pgTable('request', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  type: requestTypeEnum('type').notNull(),
  priority: priorityEnum('priority').notNull().default('medium'),
  stage: requestStageEnum('stage').notNull().default('in_treatment'),
  storyPoints: integer('story_points'),
  confidence: confidenceEnum('confidence'),

  // Relationships
  requesterId: text('requester_id')
    .references(() => user.id)
    .notNull(),
  assignedPmId: text('assigned_pm_id').references(() => user.id),
  estimatorId: text('estimator_id').references(() => user.id),
  relatedProjectId: text('related_project_id').references(() => project.id),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  stageEnteredAt: timestamp('stage_entered_at').defaultNow().notNull(),
});

// Aging calculation query
const agingRequests = await db
  .select()
  .from(request)
  .where(
    and(
      eq(request.stage, 'in_treatment'),
      lt(request.stageEnteredAt, subDays(new Date(), 2))
    )
  );
```

---

## 9. Testing Strategy

### 9.1 Unit Tests (Vitest)

- Form validation schemas
- Store actions
- Utility functions
- Aging calculations

### 9.2 Component Tests (Vitest + Testing Library)

- Multi-step form navigation
- Stage-specific views
- Filter interactions
- Drag and drop behavior

### 9.3 E2E Tests (Playwright)

- Full submission flow
- Stage transitions
- Estimation workflow
- Bulk operations

---

## 10. Directory Structure

```
apps/web/src/
├── app/(default)/dashboard/business-center/intake/
│   ├── page.tsx                    # Main intake dashboard
│   ├── client.tsx                  # Client-side layout
│   ├── new/
│   │   └── page.tsx               # Request submission form
│   ├── [id]/
│   │   └── page.tsx               # Request details
│   └── views/
│       ├── cards-view.tsx
│       ├── table-view.tsx
│       └── kanban-view.tsx
├── components/intake/
│   ├── forms/
│   │   ├── request-form.tsx       # Multi-step submission form
│   │   ├── estimation-form.tsx    # Story points form
│   │   └── triage-form.tsx        # PM triage form
│   ├── stage-tabs.tsx             # Pipeline stage navigation
│   ├── request-card.tsx           # Request card component
│   ├── request-details.tsx        # Details panel
│   └── filters/
│       ├── filter-sidebar.tsx
│       └── search-input.tsx
├── lib/
│   ├── schemas/
│   │   └── request.ts             # Zod schemas
│   ├── stores/
│   │   └── intake-store.ts        # Zustand store
│   ├── api/intake/
│   │   ├── queries.ts             # TanStack Query queries
│   │   └── mutations.ts           # TanStack Query mutations
│   └── actions/intake/
│       ├── create.ts              # Server Actions
│       ├── update.ts
│       └── transitions.ts
```

---

## 11. Performance Considerations

### 11.1 Data Fetching

- Use Server Components for initial data load
- Implement pagination (25 items per page)
- Use React Query for client-side caching
- Prefetch adjacent pages

### 11.2 Real-Time

- Debounce filter changes (300ms)
- Throttle socket events
- Use rooms to scope updates

### 11.3 Forms

- Lazy load rich text editor
- Compress images before upload
- Show upload progress

---

## 12. Accessibility Requirements

- Keyboard navigation for all interactions
- ARIA labels on all interactive elements
- Focus management in modals and panels
- Screen reader announcements for stage changes
- High contrast mode support
- Minimum touch target size (44x44px)

---

**End of Technologies Document**
