# Change: Add Business Center for Work Management

## Why

Skyll currently lacks a centralized operational hub for managing work intake, tracking active projects, and monitoring team capacity across both service lines (content/media production and software development). As the agency scales, the team needs:

- **Centralized intake management** - Single place to triage and assign new work requests
- **Active work visibility** - Real-time view of all in-flight projects across both service lines
- **Capacity planning** - Understand team allocation and identify bottlenecks before they occur
- **Delivery tracking** - Clear timeline of deadlines and recently completed work
- **Internal-only access** - Operational dashboard for Skyll team members only

Without this capability, work tracking is fragmented, capacity planning is manual, and there's no single source of truth for operational status.

## What Changes

### Database Schema Extensions

- **Add `project_assignment` table** - Many-to-many relationship between projects and users
- **Add `capacity_percentage` column to `user` table** - Track current capacity allocation (0-100%)
- **Extend `ticket` type enum** - Leverage existing 'intake' type for work requests
- **Add indexes** - Performance optimization for Business Center queries

### API Endpoints (Extend Existing Routes)

#### Extend `/api/tickets/*` (New)

- `GET /api/tickets` - List tickets with filters (type, status, priority, assignee)
- `POST /api/tickets` - Create intake request
- `PATCH /api/tickets/:id` - Update ticket (assign, change status)
- `PATCH /api/tickets/:id/assign` - Assign ticket to team member

#### Extend `/api/projects/*` (New)

- `GET /api/projects` - List projects with filters (status, client, assignee)
- `GET /api/projects/:id` - Get project details with assignments
- `PATCH /api/projects/:id/assign` - Assign team members to project
- `PATCH /api/projects/:id/status` - Update project stage

#### Extend `/api/users/*` (Existing - Add)

- `PATCH /api/users/:id/capacity` - Update user capacity percentage
- `GET /api/users/team` - List internal users with capacity info

### Frontend Components (apps/web)

- **Business Center Page** - `/dashboard/business-center` (internal users only)
- **6 Section Views**:
  1. Intake Queue (tickets with type='intake', status='open')
  2. Active Work - Content/Media (projects filtered by client.type='creative')
  3. Active Work - Software Dev (projects filtered by client.type='software'|'full_service')
  4. Team Capacity/Allocation (users with is_internal=true, capacity info)
  5. Delivery Calendar/Timeline (projects by deliveredAt date)
  6. Recently Completed (projects delivered in last 14 days)

### Navigation & Access Control

- Add Business Center to dashboard navigation (internal users only)
- Use `<RequireRole role="internal">` component guard
- Server-side `requireRole('internal')` protection

## Impact

### Affected Specs

- **New capability**: `business-center` (full spec)
- **Extends**: `authentication` (adds internal-only route protection pattern)

### Affected Code

**Backend (`apps/api/`):**

- `src/db/schema/user.ts` - Add capacity_percentage column
- `src/db/schema/project-assignment.ts` - New table
- `src/db/schema/enums.ts` - No changes (intake already exists)
- `src/routes/tickets/*` - New route group (create, list, update, assign)
- `src/routes/projects/*` - New route group (list, get, assign, update-status)
- `src/routes/users/capacity.ts` - New endpoint (extend users)
- `src/routes/users/team.ts` - New endpoint (extend users)

**Frontend (`apps/web/`):**

- `src/app/(default)/dashboard/business-center/page.tsx` - Server Component
- `src/app/(default)/dashboard/business-center/actions.ts` - Server Actions
- `src/components/business-center/` - Component library
  - `index.tsx` - Layout orchestrator
  - `intake-queue.tsx` - Section 1
  - `active-work-content.tsx` - Section 2
  - `active-work-software.tsx` - Section 3
  - `team-capacity.tsx` - Section 4
  - `delivery-calendar.tsx` - Section 5
  - `recently-completed.tsx` - Section 6
  - `intake-form.tsx` - Client component for submissions
  - `assign-modal.tsx` - Assignment dialog
  - `types.ts` - TypeScript interfaces
- `src/lib/api/tickets.ts` - API client functions
- `src/lib/api/projects.ts` - API client functions
- `src/lib/schemas/ticket.ts` - Zod schemas
- `src/lib/schemas/project.ts` - Zod schemas
- `src/config/navigation.ts` - Add Business Center item (internal only)

**Database Migrations:**

- `migrations/xxxx_add_project_assignment.sql`
- `migrations/xxxx_add_user_capacity.sql`

### Benefits

- **80% reduction** in time to answer "who's working on what?"
- **Proactive capacity management** - Spot bottlenecks 1-2 weeks early
- **Faster intake-to-assignment** - Reduce triage time from hours to minutes
- **Delivery predictability** - Clear visibility into upcoming deadlines
- **Scalability foundation** - Supports growth to 10+ team members, 50+ concurrent projects

### Non-Goals (Out of Scope)

- Client-facing project portal (separate feature)
- Time tracking/billing integration (future enhancement)
- Automated capacity calculation (manual updates for MVP)
- Resource forecasting/predictions (future enhancement)
- Mobile app (desktop web only for MVP)
