# Technical Design: Business Center CRUD with RBAC and Audit Logging

## Context

The Business Center is the operational hub for agency management but currently lacks CRUD functionality. The existing database schema supports all required data models (projects, tickets, clients, roles, role_assignments), but the web application only has read operations implemented.

### Stakeholders

- Internal team (admin, editor roles) - primary users
- Clients (read-only access to their projects/tickets)

### Constraints

- Must follow Server-First architecture (apps/web/ARCHITECTURE.md)
- Use existing UI components (Dialog, Form, Skeleton, etc.)
- Integrate with existing Better-Auth session system
- Maintain backward compatibility with existing views

## Goals / Non-Goals

### Goals

- Implement full CRUD for tickets, projects, and clients
- Add fine-grained permission checking to all mutations
- Track all changes with audit logging
- Enable bulk operations for efficiency
- Provide responsive, accessible forms

### Non-Goals

- Real-time collaboration (future enhancement)
- File uploads/attachments (separate feature)
- Workflow automation (separate feature)
- API rate limiting (already exists)

## Decisions

### 1. Permission System Architecture

**Decision**: Use JSONB permissions stored in role table, checked via middleware.

```typescript
// Permission constants
export const Permissions = {
  // Tickets
  TICKET_CREATE: 'ticket:create',
  TICKET_EDIT: 'ticket:edit',
  TICKET_DELETE: 'ticket:delete',
  TICKET_ASSIGN: 'ticket:assign',

  // Projects
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  PROJECT_ASSIGN: 'project:assign',

  // Clients
  CLIENT_CREATE: 'client:create',
  CLIENT_EDIT: 'client:edit',
  CLIENT_DELETE: 'client:delete',

  // Bulk
  BULK_OPERATIONS: 'bulk:operations',
} as const;

// Server Action wrapper
export async function requirePermission(permission: string): Promise<SessionUser> {
  const user = await requireUser();
  const hasPermission = await checkUserPermission(user.id, permission);
  if (!hasPermission) {
    throw new Error(`Permission denied: ${permission}`);
  }
  return user;
}
```

**Alternatives considered:**

- Role-only checking (simpler but less flexible)
- External auth service (overkill for current scale)

### 2. Form Handling Pattern

**Decision**: Use React Hook Form with Zod resolver, integrated with Server Actions.

```typescript
// Schema definition
const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.date().optional(),
});

// Form component pattern
function CreateProjectForm() {
  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
  });

  async function onSubmit(data: z.infer<typeof createProjectSchema>) {
    const result = await createProjectAction(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Project created');
    router.push(`/dashboard/business-center/projects/${result.data.id}`);
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

### 3. Optimistic Updates Pattern

**Decision**: Use optimistic updates with rollback on Server Action failure.

```typescript
// In kanban view (already implemented for status)
// Extend pattern to all mutations

function useOptimisticMutation<T>(
  initialData: T,
  serverAction: (data: T) => Promise<ActionResult>
) {
  const [optimisticData, setOptimisticData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const mutate = (newData: T) => {
    const previousData = optimisticData;
    setOptimisticData(newData); // Optimistic update

    startTransition(async () => {
      const result = await serverAction(newData);
      if (!result.success) {
        setOptimisticData(previousData); // Rollback
        toast.error(result.error);
      }
    });
  };

  return { data: optimisticData, mutate, isPending };
}
```

### 4. Audit Logging Pattern

**Decision**: Extend existing ticketActivity pattern to all entities.

```typescript
// Generic activity schema (already exists for tickets)
// Create parallel tables: projectActivity, clientActivity

// Or: Single unified activity table
export const activity = pgTable('activity', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // 'project' | 'ticket' | 'client'
  entityId: text('entity_id').notNull(),
  actorId: text('actor_id').references(() => user.id),
  action: text('action').notNull(), // 'created' | 'updated' | 'deleted'
  changes: jsonb('changes').$type<Record<string, { old: unknown; new: unknown }>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Decision**: Use unified activity table for simplicity and cross-entity queries.

### 5. Bulk Operations Pattern

**Decision**: Client-side selection state with single Server Action for bulk mutations.

```typescript
// Selection context for bulk operations
const BulkSelectionContext = createContext<{
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
}>();

// Server Action for bulk operations
export async function bulkUpdateStatusAction(
  entityType: 'ticket' | 'project',
  ids: string[],
  status: string
): Promise<ActionResult> {
  await requirePermission(`${entityType}:edit`);

  // Use transaction for atomicity
  const result = await db.transaction(async (tx) => {
    for (const id of ids) {
      await tx.update(entity).set({ status }).where(eq(entity.id, id));
      await logActivity(tx, entityType, id, 'status_changed', { status });
    }
  });

  revalidatePath('/dashboard/business-center');
  return { success: true };
}
```

### 6. Create Page vs Edit Dialog

**Decision**: Hybrid approach per user requirement.

| Operation | UI Pattern      | Rationale                                        |
| --------- | --------------- | ------------------------------------------------ |
| Create    | Dedicated page  | More space for complex forms, better URL sharing |
| Edit      | Centered Dialog | Quick inline editing, maintains context          |
| View      | Centered Dialog | Quick preview without navigation                 |
| Delete    | Alert Dialog    | Confirmation required, no complex form           |

### 7. Loading States

**Decision**: Use Skeleton components matching actual content layout.

```typescript
// Page-level loading (loading.tsx)
export default function Loading() {
  return <ProjectFormSkeleton />;
}

// Component-level loading
function ProjectFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" /> {/* Name input */}
      <Skeleton className="h-24 w-full" /> {/* Description */}
      <Skeleton className="h-10 w-[200px]" /> {/* Client select */}
      <Skeleton className="h-10 w-[150px]" /> {/* Submit button */}
    </div>
  );
}
```

## Risks / Trade-offs

### Risk: Permission caching causing stale UI

**Mitigation**: Revalidate permissions on role changes, use short cache TTL (5 min)

### Risk: Bulk operations timeout on large selections

**Mitigation**: Limit bulk selection to 100 items, show progress indicator

### Risk: Audit log table growth

**Mitigation**: Implement retention policy (archive after 90 days)

### Trade-off: Unified vs entity-specific activity tables

**Decision**: Unified for simplicity, accept slightly less optimal queries

## Migration Plan

1. **Phase 1: Infrastructure**
   - Add permission utilities
   - Create unified activity table
   - Add bulk selection context

2. **Phase 2: CRUD Operations**
   - Implement create pages (tickets, projects, clients)
   - Add edit dialogs
   - Add delete with confirmation

3. **Phase 3: Advanced Features**
   - Enable bulk operations
   - Add activity feeds to detail views
   - Permission-aware UI conditionals

### Rollback

- Feature flags for each phase
- Database migrations are additive (no breaking changes)
- Old views continue working during rollout

## Open Questions

1. Should we support undo for delete operations (soft delete with grace period)?
2. Should bulk operations show individual progress or just final result?
3. What retention period for audit logs (30/60/90 days)?
