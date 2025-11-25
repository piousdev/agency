# Business Center Design Document

## Context

The Business Center is Skyll's internal operational hub for managing work intake, active projects, and team capacity. This is a greenfield feature that must integrate with existing authentication, database schema, and frontend architecture while establishing patterns for future operational tools.

### Background

- **Current State**: No centralized business center; tracking is manual/fragmented
- **Users**: Internal team members only (5-15 users initially, scale to 50+)
- **Workload**: ~10-30 concurrent projects, ~5-20 intake requests/week
- **Existing Infrastructure**: Hono API, Next.js App Router, PostgreSQL with Drizzle ORM, Better-Auth

### Constraints

1. Must follow Server-First architecture (apps/web/ARCHITECTURE.md)
2. Internal-only access (is_internal flag)
3. Extend existing routes when possible (SOC/SRP)
4. Use existing schema tables (project, client, ticket, user)
5. Mobile web (not native) - desktop-first, responsive

### Stakeholders

- **Primary Users**: Skyll internal team (project managers, developers, designers)
- **System Owners**: Engineering team
- **Dependencies**: Better-Auth (session), Drizzle (ORM), Hono (API), Next.js (frontend)

## Goals / Non-Goals

### Goals

1. **Centralized Visibility** - Single source of truth for all operational work
2. **Intake Management** - Streamline request triage and assignment (reduce from hours to minutes)
3. **Capacity Planning** - Manual but clear view of team allocation to prevent bottlenecks
4. **Performance** - Page load < 2s, mutations < 500ms
5. **Scalability** - Support 50 users, 100+ concurrent projects, 1000+ tickets
6. **Maintainability** - Clear patterns for future operational tools

### Non-Goals

1. ❌ Client-facing portal (separate feature)
2. ❌ Automated capacity calculation (manual override for MVP)
3. ❌ Time tracking/billing integration (future)
4. ❌ Resource forecasting/predictions (future)
5. ❌ Real-time collaboration (websockets - future)
6. ❌ Mobile native apps (web responsive only)
7. ❌ Gantt charts/advanced project management (use external tools)

## Decisions

### Decision 1: Use Tickets Table for Intake Queue

**Choice**: Leverage existing `ticket` table with type='intake' for work requests

**Rationale**:

- Table already exists with status, priority, assignment fields
- Enum already includes 'intake' type
- Reduces new schema additions
- Enables unified ticket tracking (intake → bug/support later)
- Follows SOC/SRP by extending existing capability

**Alternatives Considered**:

- ❌ Create separate `intake_request` table - More tables, duplicate fields
- ❌ Create `work_order` table - Similar to ticket, unnecessary abstraction

**Trade-offs**:

- ✅ Pro: Reuses existing schema and indexes
- ✅ Pro: Natural progression: intake → project → tickets
- ⚠️ Con: Ticket table becomes multi-purpose (acceptable given enum types)

---

### Decision 2: Many-to-Many Project Assignment (New Table)

**Choice**: Create `project_assignment` junction table for user-to-project relationships

**Rationale**:

- Projects need multiple assignees (e.g., designer + developer)
- Users work on multiple projects simultaneously
- Need to track assignment history (assigned_at timestamp)
- Schema normalization best practice

**Alternatives Considered**:

- ❌ Add `assigned_to_id` to project table - Only supports 1:1
- ❌ Store user IDs in JSONB array - Poor query performance, no relational integrity
- ❌ Extend existing user_to_client table - Wrong domain boundary

**Schema**:

```typescript
project_assignment {
  id: text PK
  project_id: text FK → project.id (CASCADE)
  user_id: text FK → user.id (CASCADE)
  assigned_at: timestamp (for history tracking)
  created_at: timestamp
}
// Indexes: project_id, user_id, composite (project_id, user_id)
```

**Trade-offs**:

- ✅ Pro: Supports many-to-many naturally
- ✅ Pro: Query performance with proper indexes
- ✅ Pro: Enables future assignment metadata (role, percentage, etc.)
- ⚠️ Con: Adds complexity with joins (acceptable, mitigated by Drizzle relations)

---

### Decision 3: Manual Capacity Management (Column on User)

**Choice**: Add `capacity_percentage` column to `user` table, updated manually by admins

**Rationale**:

- MVP needs simple, manual capacity tracking
- Admin knows context (PTO, part-time, external commitments)
- Allows overrides and exceptions
- Simple schema change (single column)
- Avoid premature complexity of auto-calculation

**Alternatives Considered**:

- ❌ Auto-calculate from project estimates - Requires estimate tracking (out of scope)
- ❌ Create separate `user_capacity` table - Over-engineering for single field
- ❌ Use user_metadata JSONB - Harder to query/index

**Schema**:

```typescript
user {
  // ... existing fields
  capacity_percentage: integer DEFAULT 0 CHECK (>= 0 AND <= 200)
}
// Index: capacity_percentage
```

**Validation Rules**:

- 0-80%: Available
- 80-99%: At Capacity
- 100-150%: Overloaded (acceptable short-term)
- 150-200%: Warning threshold (admin override required)

**Trade-offs**:

- ✅ Pro: Simple to implement and understand
- ✅ Pro: Flexible for exceptions (PTO, part-time)
- ⚠️ Con: Manual updates required (acceptable for 5-15 users)
- ⚠️ Con: Can drift from reality (mitigate with weekly reviews)

---

### Decision 4: Server-First Architecture with Minimal Client JS

**Choice**: Follow strict Server-First pattern per apps/web/ARCHITECTURE.md

**Pattern**:

1. **Server Components** - All data fetching, business logic (default)
2. **Server Actions** - All mutations (forms, assignments, updates)
3. **Client Components** - Only interactive UI (forms, modals, dropdowns)
4. **API Client Layer** - Reusable functions in `lib/api/` for server-to-server calls

**Example Flow - Assign Ticket**:

```typescript
// 1. Server Component fetches data
export default async function BusinessCenterPage() {
  const user = await requireUser();
  if (!user.isInternal) redirect('/dashboard');

  const tickets = await getTickets({ type: 'intake', status: 'open' });
  return <IntakeQueue tickets={tickets} />;
}

// 2. Server Action handles mutation
'use server';
export async function assignTicketAction(ticketId, userId) {
  await requireRole('internal');
  await assignTicket(ticketId, userId); // lib/api call
  revalidatePath('/dashboard/business-center');
}

// 3. Client Component for form UI
'use client';
export function AssignModal({ ticketId }) {
  const [state, formAction, pending] = useActionState(assignTicketAction, null);
  return <form action={formAction}>...</form>;
}
```

**Rationale**:

- Established pattern in codebase (see changelog, help pages)
- Security: API calls never exposed to browser
- Performance: Less JavaScript shipped to client
- SEO/Accessibility: HTML rendered server-side
- Progressive enhancement: Works without JavaScript

**Trade-offs**:

- ✅ Pro: Security (no API keys in browser)
- ✅ Pro: Performance (smaller bundles)
- ✅ Pro: Simpler state management
- ⚠️ Con: Real-time updates require polling or manual refresh (acceptable for MVP)

---

### Decision 5: 6-Section Layout (Dashboard Grid)

**Choice**: Fixed 6-section layout inspired by JIRA/Rally operational dashboards

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ Intake Queue          │ Active - Content/Media      │
│ (Tickets)             │ (Projects)                  │
├───────────────────────┼─────────────────────────────┤
│ Active - Software Dev │ Team Capacity               │
│ (Projects)            │ (Users)                     │
├───────────────────────┼─────────────────────────────┤
│ Delivery Calendar     │ Recently Completed          │
│ (Timeline)            │ (Projects)                  │
└─────────────────────────────────────────────────────┘
```

**Responsive**: Stack vertically on mobile/tablet (< 1024px)

**Rationale**:

- Matches user mental model from requirements
- All data visible without scrolling/navigation
- Optimized for 1920x1080 displays (common for desktops)
- Clear separation of concerns per section

**Alternatives Considered**:

- ❌ Tabbed interface - Hides data, requires clicks
- ❌ Single scrolling list - Harder to scan
- ❌ Customizable dashboard - Over-engineering for MVP

**Trade-offs**:

- ✅ Pro: All info at-a-glance
- ✅ Pro: Fast decision-making
- ⚠️ Con: Crowded on smaller screens (mitigate with responsive stacking)

---

### Decision 6: Database Query Performance Strategy

**Choice**: Leverage existing indexes + add targeted new indexes for Business Center queries

**Existing Indexes** (already optimal):

- `ticket`: type, status, assigned_to_id, client_id, composite (client_status, assigned_status)
- `project`: status, client_id, composite (client_status), delivered_at (BRIN)
- `user`: is_internal

**New Indexes**:

- `user.capacity_percentage` (B-Tree) - For filtering/sorting team
- `project_assignment.project_id` (B-Tree) - For fetching assignees
- `project_assignment.user_id` (B-Tree) - For finding user's projects
- `project_assignment (project_id, user_id)` (Composite, unique) - Prevent duplicates

**Query Patterns**:

1. Intake Queue: `WHERE type='intake' AND status IN ('open', 'in_progress')` - Uses existing index
2. Active Work: `WHERE status IN ('in_development', 'in_review') AND client.type='creative'` - Uses existing composite
3. Team Capacity: `WHERE is_internal=true ORDER BY capacity_percentage` - Uses new index
4. Delivery Calendar: `WHERE delivered_at BETWEEN X AND Y` - Uses existing BRIN index

**Caching**:

- React `cache()` for deduplication within single request
- No Redis/external cache for MVP (add if load > 1000 concurrent users)

**Trade-offs**:

- ✅ Pro: Sub-100ms query times for typical datasets
- ✅ Pro: Minimal new indexes (low write overhead)
- ⚠️ Con: No caching layer (acceptable for <50 users)

---

### Decision 7: Access Control - Three Layers

**Choice**: Implement defense-in-depth with middleware + Server Components + Server Actions

**Layer 1 - Middleware** (optimistic):

```typescript
// Checks cookie exists, redirects if missing
if (!sessionCookie && pathname.startsWith('/dashboard/business-center')) {
  return redirect('/login');
}
```

**Layer 2 - Server Component** (REAL security):

```typescript
// Validates session + role
const user = await requireUser();
if (!user.isInternal) {
  redirect('/dashboard?error=access-denied');
}
```

**Layer 3 - Server Actions** (mutation protection):

```typescript
'use server';
export async function assignTicketAction() {
  await requireRole('internal'); // Throws if not internal
  // ... mutation
}
```

**Rationale**:

- Follows Better-Auth best practices (apps/web/ARCHITECTURE.md)
- Middleware is UX optimization, not security
- Server Components are security boundary
- Server Actions prevent direct API calls

**Trade-offs**:

- ✅ Pro: Defense-in-depth
- ✅ Pro: Aligns with existing auth patterns
- ⚠️ Con: Requires role check in multiple places (acceptable, DRY via helpers)

## Risks / Trade-offs

### Risk 1: Manual Capacity Drift

**Risk**: Capacity percentages become stale as team members aren't updating them

**Mitigation**:

- Weekly capacity review meeting (process, not tech)
- Add "Last Updated" timestamp to capacity display
- Email reminders to update capacity (future enhancement)
- Phase 2: Auto-suggest capacity based on assignments

**Severity**: Medium | **Likelihood**: High | **Impact**: Medium

---

### Risk 2: Performance Degradation at Scale

**Risk**: Dashboard becomes slow with 100+ projects, 1000+ tickets

**Mitigation**:

- Pagination on all lists (limit=50 default)
- Database indexes on all filter fields
- React cache() for request deduplication
- Monitor query performance in production
- Add Redis caching if response time > 2s

**Severity**: Low | **Likelihood**: Medium | **Impact**: Medium

**Threshold**: If page load > 2s with 100 projects → add caching layer

---

### Risk 3: Schema Migration Failure

**Risk**: Adding capacity column or project_assignment table fails in production

**Mitigation**:

- Test migrations on staging database first
- Use Drizzle's migration system (reviewed SQL)
- Backup database before migration
- Rollback plan: Drop new table/column, restore from backup
- Zero downtime: New columns nullable, backfill after deploy

**Severity**: Medium | **Likelihood**: Low | **Impact**: High

---

### Risk 4: User Adoption - Too Complex

**Risk**: Team finds Business Center overwhelming or doesn't use it

**Mitigation**:

- User testing with 2-3 team members before launch
- Add help content to help system (contextual guidance)
- Simple "Getting Started" tour on first visit
- Iterate based on feedback (measure usage with analytics)

**Severity**: Medium | **Likelihood**: Medium | **Impact**: High

**Success Metric**: >80% of internal users log in weekly within 4 weeks of launch

## Migration Plan

### Phase 1: Database Migrations (Zero Downtime)

**Step 1.1**: Add `capacity_percentage` column

```sql
ALTER TABLE "user" ADD COLUMN "capacity_percentage" INTEGER DEFAULT 0 CHECK (capacity_percentage >= 0 AND capacity_percentage <= 200);
CREATE INDEX "user_capacity_percentage_idx" ON "user" ("capacity_percentage");
```

- **Impact**: None (nullable column, has default)
- **Rollback**: `ALTER TABLE "user" DROP COLUMN "capacity_percentage";`

**Step 1.2**: Create `project_assignment` table

```sql
CREATE TABLE "project_assignment" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL REFERENCES "project"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "assigned_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX "project_assignment_project_id_idx" ON "project_assignment" ("project_id");
CREATE INDEX "project_assignment_user_id_idx" ON "project_assignment" ("user_id");
CREATE UNIQUE INDEX "project_assignment_project_user_idx" ON "project_assignment" ("project_id", "user_id");
```

- **Impact**: None (new table, no dependencies)
- **Rollback**: `DROP TABLE "project_assignment";`

**Timeline**: Run during low-traffic window (2-5 AM UTC)

---

### Phase 2: API Deployment

**Step 2.1**: Deploy API with new routes (tickets, projects, users extensions)

- Routes return 200 but empty data initially (graceful degradation)
- No breaking changes to existing routes

**Step 2.2**: Backfill data (if needed)

- No backfill required (new tables start empty)
- Capacity defaults to 0% (manually updated post-launch)

**Verification**:

- Test each endpoint with curl/Postman
- Verify auth protection (401 for non-internal users)

**Rollback**: Redeploy previous API version (routes unused by frontend yet)

---

### Phase 3: Frontend Deployment

**Step 3.1**: Deploy frontend with Business Center page

- Add navigation link (hidden for non-internal users via RequireRole)
- Page protected by middleware + Server Component checks

**Step 3.2**: Gradual rollout

- Enable for 2-3 pilot users first
- Collect feedback for 1 week
- Full launch to all internal users

**Verification**:

- Load Business Center as internal user (success)
- Attempt access as client user (redirect with error)
- Test each section (intake, projects, capacity, calendar, completed)

**Rollback**: Hide navigation link via feature flag, redeploy

---

### Phase 4: Data Population

**Step 4.1**: Create initial intake requests

- Migrate any backlog from external systems (email, Trello, etc.)
- Bulk import script if needed (one-time)

**Step 4.2**: Set initial team capacity

- Have each team member review and set their capacity %
- Default to 50% for first week (conservative)

**Timeline**: 1-2 weeks post-launch

## Open Questions

### Q1: Should we add email notifications for assignments?

**Context**: When a ticket/project is assigned, should assignee get an email?

**Options**:

- A) Add email notifications (requires integration with nodemailer)
- B) In-app notifications only (future enhancement)
- C) No notifications (manual check of Business Center)

**Decision**: Defer to Phase 2. Start with option C (manual), add in-app notifications after MVP.

---

### Q2: How to handle project completion percentage?

**Context**: Active work sections show "Completion %" but source is undefined

**Options**:

- A) Manual field on project table (admin updates)
- B) Calculate from ticket completion (requires ticket→project linkage)
- C) Remove from MVP, add later

**Decision**: **Option A** - Add optional `completion_percentage` column (integer 0-100) to project table. Admin manually updates. Display as visual progress bar on project cards. Keep simple for MVP.

---

### Q3: Should Recently Completed be editable (mark as incomplete)?

**Context**: If a project is accidentally marked delivered, can it be reverted?

**Options**:

- A) Allow status change back to in_development (simple)
- B) Require admin approval to revert (audit trail)
- C) No revert (create new project instead)

**Decision**: **Option A** - Allow simple status change. Add audit logging in Phase 2.

---

### Q4: Real-time updates vs. manual refresh?

**Context**: If two users are viewing Business Center, changes don't sync in real-time

**Options**:

- A) Add WebSocket/SSE for real-time updates
- B) Auto-refresh every 30s
- C) Manual refresh only (user clicks refresh or re-navigates)

**Decision**: **Option C** for MVP. Add option B (polling) in Phase 2 if users request it. Avoid WebSockets for simplicity.

## Success Metrics

**MVP Success** (measured 4 weeks after launch):

1. **Usage**: >80% of internal users log in weekly
2. **Intake Speed**: Average time from intake creation → assignment <24 hours
3. **Capacity Accuracy**: Capacity data updated at least weekly
4. **Performance**: Page load <2s, mutations <500ms (p95)
5. **Satisfaction**: User survey NPS >7/10

**Phase 2 Trigger** (consider enhancements when):

- > 50 users
- > 100 concurrent projects
- > 30 intake requests/week
- User requests for automation/notifications >5x

## Related Documents

- `openspec/changes/add-business-center/proposal.md` - Why and what
- `openspec/changes/add-business-center/tasks.md` - Implementation checklist
- `openspec/changes/add-business-center/specs/business-center/spec.md` - Requirements
- `apps/web/ARCHITECTURE.md` - Server-First patterns
- `openspec/specs/authentication/spec.md` - Auth requirements
