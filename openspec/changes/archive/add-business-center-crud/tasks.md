# Implementation Tasks

## Phase 1: Permission System Infrastructure

### 1.1 Permission Utilities

- [x] 1.1.1 Create `apps/web/src/lib/auth/permissions.ts` with permission
      constants
- [x] 1.1.2 Create `checkUserPermission(userId, permission)` function
- [x] 1.1.3 Create `requirePermission(permission)` Server Action wrapper
- [x] 1.1.4 Add `getUserPermissions(userId)` to fetch all user permissions
- [x] 1.1.5 Create `usePermissions()` hook for client-side permission checks

### 1.2 Seed Default Roles and Permissions

- [x] 1.2.1 Create migration to seed default roles (admin, editor, viewer,
      client) - added `seedRoles()` to `apps/api/src/db/seed.ts`
- [x] 1.2.2 Define permission sets for each default role
- [x] 1.2.3 Add role assignment to seed users - added `seedRoleAssignments()` to
      `apps/api/src/db/seed.ts`

### 1.3 Unified Activity Table

- [x] 1.3.1 Create `activity` table schema in
      `apps/api/src/db/schema/activity.ts`
- [x] 1.3.2 Add relations and indexes for activity table
- [x] 1.3.3 Create Drizzle migration
- [x] 1.3.4 Create `logActivity()` utility function for Server Actions

## Phase 2: Zod Schemas and Form Infrastructure

### 2.1 Shared Schemas

- [x] 2.1.1 Create `apps/web/src/lib/schemas/project.ts` with create/update
      schemas
- [x] 2.1.2 Create `apps/web/src/lib/schemas/ticket.ts` with create/update
      schemas
- [x] 2.1.3 Create `apps/web/src/lib/schemas/client.ts` with create/update
      schemas
- [x] 2.1.4 Add shared validation rules (url patterns, dates, enums)

### 2.2 Form Components

- [x] 2.2.1 Create
      `apps/web/src/components/business-center/forms/project-form.tsx`
- [x] 2.2.2 Create
      `apps/web/src/components/business-center/forms/ticket-form.tsx`
- [x] 2.2.3 Create
      `apps/web/src/components/business-center/forms/client-form.tsx`
- [x] 2.2.4 Create shared form field components (ClientSelect, UserSelect,
      PrioritySelect, StatusSelect)
- [x] 2.2.5 Add loading skeletons for each form (loading.tsx files exist for new
      pages)

## Phase 3: Ticket CRUD

### 3.1 Create Ticket

- [x] 3.1.1 Create
      `apps/web/src/app/(default)/dashboard/business-center/intake-queue/new/page.tsx`
- [x] 3.1.2 Create `createTicketAction` Server Action with permission check
- [x] 3.1.3 Add activity logging for ticket creation (API route logs via
      `logActivity()`)
- [x] 3.1.4 Create loading.tsx skeleton for new ticket page
- [x] 3.1.5 Add "+ New Ticket" button to intake-queue header
- [x] 3.1.6 Add "+ Add" buttons to kanban columns (links to /new with prefilled
      priority)

### 3.2 Edit Ticket (Dialog)

- [x] 3.2.1 Create
      `apps/web/src/components/business-center/dialogs/edit-ticket-dialog.tsx`
- [x] 3.2.2 Create `updateTicketAction` Server Action with permission check
- [x] 3.2.3 Add optimistic update support (kanban drag-drop already has
      optimistic updates)
- [x] 3.2.4 Add activity logging for ticket updates (API route logs via
      `logEntityChange()`)

### 3.3 Delete Ticket

- [x] 3.3.1 Create
      `apps/web/src/components/business-center/dialogs/delete-ticket-dialog.tsx`
- [x] 3.3.2 Create `deleteTicketAction` Server Action with permission check
- [x] 3.3.3 Add soft delete support (set status to 'closed' + deletedAt
      timestamp)
- [x] 3.3.4 Add activity logging for ticket deletion (logged as status change
      via update API)

## Phase 4: Project CRUD

### 4.1 Create Project

- [x] 4.1.1 Create
      `apps/web/src/app/(default)/dashboard/business-center/projects/new/page.tsx`
- [x] 4.1.2 Create `createProjectAction` Server Action with permission check
- [x] 4.1.3 Add activity logging for project creation (API route logs via
      `logActivity()`)
- [x] 4.1.4 Create loading.tsx skeleton for new project page
- [x] 4.1.5 Add "+ New Project" button to projects header
- [x] 4.1.6 Add "+ Add" buttons to kanban columns (links to /new with prefilled
      status)

### 4.2 Edit Project (Dialog)

- [x] 4.2.1 Create
      `apps/web/src/components/business-center/dialogs/edit-project-dialog.tsx`
- [x] 4.2.2 Create `updateProjectAction` Server Action with permission check
      (extend existing)
- [x] 4.2.3 Add optimistic update support (kanban drag-drop already has
      optimistic updates)
- [x] 4.2.4 Add activity logging for project updates (API route logs via
      `logEntityChange()`)

### 4.3 Delete Project

- [x] 4.3.1 Create
      `apps/web/src/components/business-center/dialogs/delete-project-dialog.tsx`
- [x] 4.3.2 Create `deleteProjectAction` Server Action with permission check
- [x] 4.3.3 Add soft delete support (set status to 'archived' + deletedAt
      timestamp)
- [x] 4.3.4 Add activity logging for project deletion (logged as status change
      via update API)

## Phase 5: Client CRUD

### 5.1 Client List Page

- [x] 5.1.1 Create
      `apps/web/src/app/(default)/dashboard/business-center/clients/page.tsx`
- [x] 5.1.2 Create client list view component (table view)
- [x] 5.1.3 Add clients to business-center navigation sidebar

### 5.2 Create Client

- [x] 5.2.1 Create
      `apps/web/src/app/(default)/dashboard/business-center/clients/new/page.tsx`
- [x] 5.2.2 Create `apps/web/src/lib/actions/business-center/clients.ts`
- [x] 5.2.3 Create `createClientAction` Server Action with permission check
- [x] 5.2.4 Add activity logging for client creation (API route logs via
      `logActivity()`)

### 5.3 Edit Client (Dialog)

- [x] 5.3.1 Create
      `apps/web/src/components/business-center/dialogs/edit-client-dialog.tsx`
- [x] 5.3.2 Create `updateClientAction` Server Action with permission check
- [x] 5.3.3 Add activity logging for client updates (API route logs via
      `logEntityChange()`)

### 5.4 Delete Client

- [x] 5.4.1 Create
      `apps/web/src/components/business-center/dialogs/delete-client-dialog.tsx`
- [x] 5.4.2 Create `deleteClientAction` Server Action with permission check
- [x] 5.4.3 Handle cascade (warn about associated projects/tickets - dialog
      accepts counts and shows warning)
- [x] 5.4.4 Add soft delete support (set active to false)

## Phase 6: Bulk Operations

### 6.1 Selection Infrastructure

- [x] 6.1.1 Leveraged existing DataTable row selection (no separate provider
      needed)
- [x] 6.1.2 Add selection checkboxes to table views (already exists in
      DataTable)
- [x] 6.1.3 Add selection mode to card views (projects, tickets, clients cards
      support selectionMode prop)
- [x] 6.1.4 Create bulk action bar component
      `apps/web/src/components/business-center/bulk-actions.tsx`

### 6.2 Bulk Actions

- [x] 6.2.1 Create `apps/web/src/lib/actions/business-center/bulk.ts`
- [x] 6.2.2 Implement `bulkUpdateStatusAction` for tickets and projects
- [x] 6.2.3 Implement `bulkAssignAction` for tickets and projects
- [x] 6.2.4 Implement `bulkDeleteAction` with confirmation
- [x] 6.2.5 Add permission checks to all bulk actions (isInternal checks)
- [x] 6.2.6 Add activity logging for bulk operations (each item logged via
      individual API calls)

## Phase 7: Activity Feed

### 7.1 Activity Feed Component

- [x] 7.1.1 Create `apps/web/src/components/business-center/activity-feed.tsx`
- [x] 7.1.2 Add activity feed to ticket detail view
      (`intake-queue/[id]/ticket-activity.tsx`)
- [x] 7.1.3 Add activity feed to project detail view
      (`projects/[id]/project-activity.tsx`)
- [x] 7.1.4 Add activity feed to client detail view
      (`clients/[id]/client-activity.tsx`)

### 7.2 Activity API

- [x] 7.2.1 Create activity API routes (`tickets/activity.ts`,
      `clients/activity.ts`, `projects/activity.ts`)
- [x] 7.2.2 Add pagination support for activity feeds
- [x] 7.2.3 Add filtering by activity type (API and frontend hook both support
      `types` param)

## Phase 8: Permission-Aware UI

### 8.1 Conditional Rendering

- [x] 8.1.1 Add `PermissionGate` component for conditional rendering (in
      `use-permissions.tsx` with hide/disable modes)
- [x] 8.1.2 Hide create buttons when user lacks permission (wrapped with
      PermissionGate in header components)
- [x] 8.1.3 Hide edit buttons when user lacks permission (wrapped in table-view
      row actions)
- [x] 8.1.4 Hide delete buttons when user lacks permission (wrapped in
      table-view row actions)
- [x] 8.1.5 Disable bulk action bar when user lacks permission (wrapped with
      PermissionGate BULK_OPERATIONS)

### 8.2 Permission Feedback

- [x] 8.2.1 Show tooltip on disabled actions explaining permission requirement
      (PermissionGate tooltip prop)
- [x] 8.2.2 Handle permission errors gracefully in Server Actions
      (`withErrorHandling` + `formatPermissionError` in errors.ts)
- [x] 8.2.3 Add permission error toast messages (existing toast.error pattern
      displays permission errors)

## Phase 9: Testing & Polish

### 9.1 Unit Tests

- [x] 9.1.1 Test permission checking utilities (`permissions.test.ts` - tests
      constants, roles, error handling)
- [x] 9.1.2 Test Zod schemas validation (`schemas.test.ts` - 56 tests for
      project/ticket/client schemas)
- [x] 9.1.3 Test Server Action error handling (`errors.test.ts` - tests
      withErrorHandling, formatApiError)

### 9.2 Integration Tests

- [x] 9.2.1 Test CRUD flows for tickets (`business-center-crud.spec.ts`)
- [x] 9.2.2 Test CRUD flows for projects (`business-center-crud.spec.ts`)
- [x] 9.2.3 Test CRUD flows for clients (`business-center-crud.spec.ts`)
- [x] 9.2.4 Test bulk operations (`business-center-crud.spec.ts`)
- [x] 9.2.5 Test permission enforcement (`business-center-crud.spec.ts`)

### 9.3 Accessibility

- [x] 9.3.1 Test keyboard navigation in forms (`business-center-a11y.spec.ts`)
- [x] 9.3.2 Test screen reader announcements for dialogs
      (`business-center-a11y.spec.ts`)
- [x] 9.3.3 Test focus management in modals (`business-center-a11y.spec.ts`)
- [x] 9.3.4 Add aria-labels to all interactive elements
      (`business-center-a11y.spec.ts`)

### 9.4 Responsive Design

- [x] 9.4.1 Test create pages on mobile viewports
      (`business-center-responsive.spec.ts`)
- [x] 9.4.2 Test edit dialogs on mobile viewports
      (`business-center-responsive.spec.ts`)
- [x] 9.4.3 Test bulk selection on touch devices
      (`business-center-responsive.spec.ts`)
- [x] 9.4.4 Ensure forms are usable on small screens
      (`business-center-responsive.spec.ts`)

### 9.5 Loading States

- [x] 9.5.1 Add form submission loading states
      (`business-center-responsive.spec.ts`)
- [x] 9.5.2 Add dialog loading states (`business-center-responsive.spec.ts`)
- [x] 9.5.3 Add bulk action progress indicators
      (`business-center-responsive.spec.ts`)
- [x] 9.5.4 Test skeleton loading animations
      (`business-center-responsive.spec.ts`)

## Phase 10: Industry-Standard Schema Enhancements (Database Layer)

### 10.1 New Enums

- [x] 10.1.1 Add `project_visibility` enum (private, team, client, public)
- [x] 10.1.2 Add `ticket_resolution` enum (fixed, wont_fix, duplicate,
      cannot_reproduce, not_a_bug, done, incomplete, cancelled)
- [x] 10.1.3 Add `client_industry` enum (technology, healthcare, finance,
      education, retail, manufacturing, media, real_estate, hospitality,
      nonprofit, government, professional_services, other)
- [x] 10.1.4 Add `client_size` enum (startup, small, medium, large, enterprise)
- [x] 10.1.5 Add `sla_tier` enum (bronze, silver, gold, platinum)
- [x] 10.1.6 Add `contact_role` enum (primary, billing, technical, executive,
      stakeholder, other)
- [x] 10.1.7 Add `sprint_status` enum (planning, active, completed, cancelled)
- [x] 10.1.8 Add `milestone_status` enum (pending, in_progress, completed,
      missed, cancelled)
- [x] 10.1.9 Add `label_scope` enum (global, project, ticket)
- [x] 10.1.10 Extend `ticket_type` enum with feature_request, task, story, epic

### 10.2 New Tables

- [x] 10.2.1 Create `sprint` table in `apps/api/src/db/schema/sprint.ts`
- [x] 10.2.2 Create `milestone` table in `apps/api/src/db/schema/milestone.ts`
- [x] 10.2.3 Create `label` table in `apps/api/src/db/schema/label.ts`
- [x] 10.2.4 Create `project_label` join table for many-to-many
- [x] 10.2.5 Create `ticket_label` join table for many-to-many
- [x] 10.2.6 Create `project_watcher` table in
      `apps/api/src/db/schema/watcher.ts`
- [x] 10.2.7 Create `ticket_watcher` table
- [x] 10.2.8 Create `checklist` table in `apps/api/src/db/schema/checklist.ts`
- [x] 10.2.9 Create `checklist_item` table with assignee support
- [x] 10.2.10 Create `client_contact` table in
      `apps/api/src/db/schema/client-contact.ts`

### 10.3 Enhanced Existing Tables

- [x] 10.3.1 Add to `ticket`: resolution, storyPoints, sprintId,
      affectedVersion, fixVersion, component, isInternal, acceptanceCriteria
- [x] 10.3.2 Add to `project`: color, icon, visibility, isTemplate, ownerId,
      goals, customFields
- [x] 10.3.3 Add to `client`: industry, companySize, logo, timezone,
      preferredLanguage, slaTier, contractStartDate, contractEndDate,
      annualValue, currency, billingAddress, billingEmail, customFields, tags

### 10.4 Relations and Migration

- [x] 10.4.1 Update `relations.ts` with all new table relations
- [x] 10.4.2 Update `index.ts` to export all new tables
- [x] 10.4.3 Generate Drizzle migration
- [x] 10.4.4 Run migration against database

## Phase 11: Labels Management

### 11.1 Label CRUD Infrastructure

- [x] 11.1.1 Create `apps/web/src/lib/schemas/label.ts` with Zod schemas
- [x] 11.1.2 Create `apps/web/src/lib/actions/business-center/labels.ts`
- [x] 11.1.3 Create `createLabelAction` Server Action
- [x] 11.1.4 Create `updateLabelAction` Server Action
- [x] 11.1.5 Create `deleteLabelAction` Server Action
- [x] 11.1.6 Create API routes in `apps/api/src/routes/labels/` (list, get,
      create, update, delete, assign)
- [x] 11.1.7 Add `LABEL_CREATE`, `LABEL_EDIT`, `LABEL_DELETE`, `LABEL_VIEW`
      permissions
- [x] 11.1.8 Add 'label' to `entityTypeEnum` for activity logging

### 11.2 Label Management UI

- [x] 11.2.1 Create
      `apps/web/src/app/(default)/dashboard/business-center/settings/labels/page.tsx`
- [x] 11.2.2 Create
      `apps/web/src/components/business-center/forms/label-form.tsx`
- [x] 11.2.3 Create color picker component for label colors (18 presets + custom
      color input)
- [x] 11.2.4 Create labels client component with create/edit/delete dialogs

### 11.3 Label Assignment Components

- [x] 11.3.1 Create
      `apps/web/src/components/business-center/forms/label-select.tsx`
      (multi-select dropdown)
- [x] 11.3.2 Create
      `apps/web/src/components/business-center/forms/label-badge.tsx` (colored
      badge display)
- [x] 11.3.3 Add `assignLabelsToTicketAction` Server Action
- [x] 11.3.4 Add `removeLabelsFromTicketAction` Server Action
- [x] 11.3.5 Add `assignLabelsToProjectAction` Server Action
- [x] 11.3.6 Add `removeLabelsFromProjectAction` Server Action
- [x] 11.3.7 Create web API client in `apps/web/src/lib/api/labels/`

## Phase 12: Milestones Management

### 12.1 Milestone CRUD Infrastructure

- [x] 12.1.1 Create `apps/web/src/lib/schemas/milestone.ts` with Zod schemas
- [x] 12.1.2 Create `apps/web/src/lib/actions/business-center/milestones.ts`
- [x] 12.1.3 Create `createMilestoneAction` Server Action
- [x] 12.1.4 Create `updateMilestoneAction` Server Action
- [x] 12.1.5 Create `deleteMilestoneAction` Server Action
- [x] 12.1.6 Create API routes in `apps/api/src/routes/milestones/` (list, get,
      create, update, delete)
- [x] 12.1.7 Create web API client in `apps/web/src/lib/api/milestones/`

### 12.2 Milestone UI Components

- [x] 12.2.1 Create
      `apps/web/src/components/business-center/forms/milestone-form.tsx`
- [x] 12.2.2 Create `apps/web/src/components/business-center/milestone-list.tsx`
- [x] 12.2.3 Create
      `apps/web/src/components/business-center/milestone-progress.tsx` (progress
      bar with compact and badge variants)
- [x] 12.2.4 Create
      `apps/web/src/components/business-center/forms/milestone-select.tsx` for
      ticket assignment

### 12.3 Milestone Integration

- [x] 12.3.1 Add milestones section to project detail page (business-center)
- [x] 12.3.3 Create
      `apps/web/src/components/business-center/milestone-timeline.tsx` view
      component

## Phase 13: Sprints & Agile Features

### 13.1 Sprint CRUD Infrastructure

- [x] 13.1.1 Create `apps/web/src/lib/schemas/sprint.ts` with Zod schemas
- [x] 13.1.2 Create `apps/web/src/lib/actions/business-center/sprints.ts`
- [x] 13.1.3 Create `createSprintAction` Server Action
- [x] 13.1.4 Create `updateSprintAction` Server Action
- [x] 13.1.5 Create `startSprintAction` Server Action (change status to active)
- [x] 13.1.6 Create `completeSprintAction` Server Action
- [x] 13.1.7 Create `deleteSprintAction` Server Action
- [x] 13.1.8 Create API routes in `apps/api/src/routes/sprints/` (list, get,
      create, update, delete)
- [x] 13.1.9 Create web API client in `apps/web/src/lib/api/sprints/`

### 13.2 Sprint UI Components

- [x] 13.2.1 Create
      `apps/web/src/components/business-center/forms/sprint-form.tsx`
- [x] 13.2.2 Create `apps/web/src/components/business-center/sprint-board.tsx`
      (kanban for sprint)
- [x] 13.2.3 Create
      `apps/web/src/components/business-center/sprint-burndown.tsx` (burndown
      chart)
- [x] 13.2.4 Create
      `apps/web/src/components/business-center/forms/sprint-select.tsx` for
      ticket assignment
- [x] 13.2.5 Create `apps/web/src/components/business-center/sprint-list.tsx`
      (list with CRUD)

### 13.3 Sprint Page

- [x] 13.3.1 Create
      `apps/web/src/app/(default)/dashboard/business-center/sprints/page.tsx`
- [x] 13.3.2 Create
      `apps/web/src/app/(default)/dashboard/business-center/sprints/client.tsx`
      (sprint list with status indicators, filters)
- [x] 13.3.3 Create
      `apps/web/src/app/(default)/dashboard/business-center/sprints/[id]/page.tsx`
      (sprint detail page)
- [x] 13.3.4 Add sprints to business-center navigation in
      `apps/web/src/config/navigation.ts`
- [x] 13.3.5 Update sprint list API to support listing all sprints without
      projectId

---

## Status Summary

**Completed:** Phases 1-13 (core infrastructure, CRUD operations, labels,
milestones, sprints)

**Deferred to Overview Navigation:** Remaining features (checklists, client
contacts, watchers, enhanced form fields, advanced filtering, dashboard
analytics) will be addressed as part of the new Overview Navigation
implementation.
