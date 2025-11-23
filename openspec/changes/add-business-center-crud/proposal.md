# Change: Add Full CRUD Operations with RBAC and Audit Logging

## Why

The Business Center currently lacks essential CRUD functionality:

1. **No Create Operations**: Users cannot create new tickets, projects, or clients
2. **No Delete Operations**: No way to remove or archive entities
3. **No Permission System**: All internal users have identical access - no role-based restrictions
4. **No Audit Trail**: Changes are not tracked - no accountability or history
5. **No Bulk Operations**: Cannot efficiently manage multiple items at once

This makes the Business Center unsuitable for production use where teams need proper access control, accountability, and efficient workflows.

## What Changes

### Permission-Based RBAC System

- Implement fine-grained permissions: `can_create_project`, `can_edit_ticket`, `can_delete_client`, etc.
- Add permission checking middleware for Server Actions
- Create permission-aware UI that hides/disables actions based on user permissions
- Integrate with existing `role` and `role_assignment` tables

### Full CRUD Operations

- **Create**: Dedicated pages for creating tickets, projects, and clients (`/new` routes)
- **Edit**: Dialog-based editing forms (using existing Dialog component)
- **Delete**: Soft delete with confirmation dialogs and proper cascade handling
- Add "+ New" buttons to kanban columns and list views

### Bulk Operations

- Multi-select functionality across all table and card views
- Bulk assign, bulk status change, bulk delete actions
- Select all / deselect all functionality

### Audit Logging

- Track all CRUD operations with user, timestamp, and changes
- Display activity feed on entity detail pages
- Integrate with existing `ticketActivity` pattern for all entities

### UI Pattern (Hybrid Approach)

- **Create**: Dedicated pages with full forms (`/business-center/projects/new`)
- **Edit/View**: Centered Dialog modals for quick inline editing
- **Delete**: Alert Dialog with confirmation

## Impact

### Affected Specs

- `business-center` - Add CRUD requirements (major additions)
- `authentication` - Add permission checking requirements (minor additions)

### Affected Code

**New Routes:**

- `apps/web/src/app/(default)/dashboard/business-center/projects/new/page.tsx`
- `apps/web/src/app/(default)/dashboard/business-center/intake-queue/new/page.tsx`
- `apps/web/src/app/(default)/dashboard/business-center/clients/` (new section)

**New Server Actions:**

- `apps/web/src/lib/actions/business-center/projects.ts` - Add create, update, delete
- `apps/web/src/lib/actions/business-center/tickets.ts` - Add create, delete
- `apps/web/src/lib/actions/business-center/clients.ts` - Full CRUD (new)
- `apps/web/src/lib/actions/business-center/bulk.ts` - Bulk operations (new)

**New Components:**

- `apps/web/src/components/business-center/forms/` - Create/Edit forms
- `apps/web/src/components/business-center/dialogs/` - Edit dialogs
- `apps/web/src/components/business-center/bulk-actions.tsx` - Bulk action bar

**Permission System:**

- `apps/web/src/lib/auth/permissions.ts` - Permission checking utilities
- `apps/api/src/routes/permissions.ts` - Permission API endpoints

**Audit System:**

- `apps/api/src/db/schema/activity.ts` - Extend for all entities
- `apps/web/src/components/business-center/activity-feed.tsx` - Reusable activity component

### Dependencies on Other Changes

- Complements `add-business-center-interactions` (0/58 tasks) which handles:
  - Detail modals for viewing
  - Status update Server Actions
  - Kanban drag-and-drop
  - Assignment dialogs

This proposal adds the missing Create/Delete/RBAC/Audit layers.
