# Implementation Tasks

## Phase 1: Permission System Infrastructure

### 1.1 Permission Utilities

- [x] 1.1.1 Create `apps/web/src/lib/auth/permissions.ts` with permission constants
- [x] 1.1.2 Create `checkUserPermission(userId, permission)` function
- [x] 1.1.3 Create `requirePermission(permission)` Server Action wrapper
- [x] 1.1.4 Add `getUserPermissions(userId)` to fetch all user permissions
- [x] 1.1.5 Create `usePermissions()` hook for client-side permission checks

### 1.2 Seed Default Roles and Permissions

- [ ] 1.2.1 Create migration to seed default roles (admin, editor, viewer)
- [x] 1.2.2 Define permission sets for each default role
- [ ] 1.2.3 Add role assignment to seed users

### 1.3 Unified Activity Table

- [x] 1.3.1 Create `activity` table schema in `apps/api/src/db/schema/activity.ts`
- [x] 1.3.2 Add relations and indexes for activity table
- [x] 1.3.3 Create Drizzle migration
- [x] 1.3.4 Create `logActivity()` utility function for Server Actions

## Phase 2: Zod Schemas and Form Infrastructure

### 2.1 Shared Schemas

- [x] 2.1.1 Create `apps/web/src/lib/schemas/project.ts` with create/update schemas
- [x] 2.1.2 Create `apps/web/src/lib/schemas/ticket.ts` with create/update schemas
- [x] 2.1.3 Create `apps/web/src/lib/schemas/client.ts` with create/update schemas
- [x] 2.1.4 Add shared validation rules (url patterns, dates, enums)

### 2.2 Form Components

- [x] 2.2.1 Create `apps/web/src/components/business-center/forms/project-form.tsx`
- [x] 2.2.2 Create `apps/web/src/components/business-center/forms/ticket-form.tsx`
- [x] 2.2.3 Create `apps/web/src/components/business-center/forms/client-form.tsx`
- [x] 2.2.4 Create shared form field components (ClientSelect, UserSelect, PrioritySelect, StatusSelect)
- [ ] 2.2.5 Add loading skeletons for each form

## Phase 3: Ticket CRUD

### 3.1 Create Ticket

- [x] 3.1.1 Create `apps/web/src/app/(default)/dashboard/business-center/intake-queue/new/page.tsx`
- [x] 3.1.2 Create `createTicketAction` Server Action with permission check
- [ ] 3.1.3 Add activity logging for ticket creation
- [x] 3.1.4 Create loading.tsx skeleton for new ticket page
- [x] 3.1.5 Add "+ New Ticket" button to intake-queue header
- [ ] 3.1.6 Add "+ Add" buttons to kanban columns (links to /new with prefilled priority)

### 3.2 Edit Ticket (Dialog)

- [x] 3.2.1 Create `apps/web/src/components/business-center/dialogs/edit-ticket-dialog.tsx`
- [x] 3.2.2 Create `updateTicketAction` Server Action with permission check
- [ ] 3.2.3 Add optimistic update support
- [ ] 3.2.4 Add activity logging for ticket updates

### 3.3 Delete Ticket

- [x] 3.3.1 Create `apps/web/src/components/business-center/dialogs/delete-ticket-dialog.tsx`
- [x] 3.3.2 Create `deleteTicketAction` Server Action with permission check
- [x] 3.3.3 Add soft delete support (set status to 'closed' + deletedAt timestamp)
- [ ] 3.3.4 Add activity logging for ticket deletion

## Phase 4: Project CRUD

### 4.1 Create Project

- [x] 4.1.1 Create `apps/web/src/app/(default)/dashboard/business-center/projects/new/page.tsx`
- [x] 4.1.2 Create `createProjectAction` Server Action with permission check
- [ ] 4.1.3 Add activity logging for project creation
- [x] 4.1.4 Create loading.tsx skeleton for new project page
- [x] 4.1.5 Add "+ New Project" button to projects header
- [ ] 4.1.6 Add "+ Add" buttons to kanban columns (links to /new with prefilled status)

### 4.2 Edit Project (Dialog)

- [x] 4.2.1 Create `apps/web/src/components/business-center/dialogs/edit-project-dialog.tsx`
- [x] 4.2.2 Create `updateProjectAction` Server Action with permission check (extend existing)
- [ ] 4.2.3 Add optimistic update support
- [ ] 4.2.4 Add activity logging for project updates

### 4.3 Delete Project

- [x] 4.3.1 Create `apps/web/src/components/business-center/dialogs/delete-project-dialog.tsx`
- [x] 4.3.2 Create `deleteProjectAction` Server Action with permission check
- [x] 4.3.3 Add soft delete support (set status to 'archived' + deletedAt timestamp)
- [ ] 4.3.4 Add activity logging for project deletion

## Phase 5: Client CRUD

### 5.1 Client List Page

- [x] 5.1.1 Create `apps/web/src/app/(default)/dashboard/business-center/clients/page.tsx`
- [x] 5.1.2 Create client list view component (table view)
- [x] 5.1.3 Add clients to business-center navigation sidebar

### 5.2 Create Client

- [x] 5.2.1 Create `apps/web/src/app/(default)/dashboard/business-center/clients/new/page.tsx`
- [x] 5.2.2 Create `apps/web/src/lib/actions/business-center/clients.ts`
- [x] 5.2.3 Create `createClientAction` Server Action with permission check
- [ ] 5.2.4 Add activity logging for client creation

### 5.3 Edit Client (Dialog)

- [x] 5.3.1 Create `apps/web/src/components/business-center/dialogs/edit-client-dialog.tsx`
- [x] 5.3.2 Create `updateClientAction` Server Action with permission check
- [ ] 5.3.3 Add activity logging for client updates

### 5.4 Delete Client

- [x] 5.4.1 Create `apps/web/src/components/business-center/dialogs/delete-client-dialog.tsx`
- [x] 5.4.2 Create `deleteClientAction` Server Action with permission check
- [ ] 5.4.3 Handle cascade (warn about associated projects/tickets)
- [x] 5.4.4 Add soft delete support (set active to false)

## Phase 6: Bulk Operations

### 6.1 Selection Infrastructure

- [x] 6.1.1 Leveraged existing DataTable row selection (no separate provider needed)
- [x] 6.1.2 Add selection checkboxes to table views (already exists in DataTable)
- [ ] 6.1.3 Add selection mode to card views
- [x] 6.1.4 Create bulk action bar component `apps/web/src/components/business-center/bulk-actions.tsx`

### 6.2 Bulk Actions

- [x] 6.2.1 Create `apps/web/src/lib/actions/business-center/bulk.ts`
- [x] 6.2.2 Implement `bulkUpdateStatusAction` for tickets and projects
- [x] 6.2.3 Implement `bulkAssignAction` for tickets and projects
- [x] 6.2.4 Implement `bulkDeleteAction` with confirmation
- [x] 6.2.5 Add permission checks to all bulk actions (isInternal checks)
- [ ] 6.2.6 Add activity logging for bulk operations

## Phase 7: Activity Feed

### 7.1 Activity Feed Component

- [x] 7.1.1 Create `apps/web/src/components/business-center/activity-feed.tsx`
- [x] 7.1.2 Add activity feed to ticket detail view (`intake-queue/[id]/ticket-activity.tsx`)
- [x] 7.1.3 Add activity feed to project detail view (`projects/[id]/project-activity.tsx`)
- [x] 7.1.4 Add activity feed to client detail view (`clients/[id]/client-activity.tsx`)

### 7.2 Activity API

- [x] 7.2.1 Create activity API routes (`tickets/activity.ts`, `clients/activity.ts`, `projects/activity.ts`)
- [x] 7.2.2 Add pagination support for activity feeds
- [ ] 7.2.3 Add filtering by activity type (API supports `types` param, frontend hook not wired up)

## Phase 8: Permission-Aware UI

### 8.1 Conditional Rendering

- [ ] 8.1.1 Add `PermissionGate` component for conditional rendering
- [ ] 8.1.2 Hide create buttons when user lacks permission
- [ ] 8.1.3 Hide edit buttons when user lacks permission
- [ ] 8.1.4 Hide delete buttons when user lacks permission
- [ ] 8.1.5 Disable bulk action bar when user lacks permission

### 8.2 Permission Feedback

- [ ] 8.2.1 Show tooltip on disabled actions explaining permission requirement
- [ ] 8.2.2 Handle permission errors gracefully in Server Actions
- [ ] 8.2.3 Add permission error toast messages

## Phase 9: Testing & Polish

### 9.1 Unit Tests

- [ ] 9.1.1 Test permission checking utilities
- [ ] 9.1.2 Test Zod schemas validation
- [ ] 9.1.3 Test Server Action error handling

### 9.2 Integration Tests

- [ ] 9.2.1 Test CRUD flows for tickets
- [ ] 9.2.2 Test CRUD flows for projects
- [ ] 9.2.3 Test CRUD flows for clients
- [ ] 9.2.4 Test bulk operations
- [ ] 9.2.5 Test permission enforcement

### 9.3 Accessibility

- [ ] 9.3.1 Test keyboard navigation in forms
- [ ] 9.3.2 Test screen reader announcements for dialogs
- [ ] 9.3.3 Test focus management in modals
- [ ] 9.3.4 Add aria-labels to all interactive elements

### 9.4 Responsive Design

- [ ] 9.4.1 Test create pages on mobile viewports
- [ ] 9.4.2 Test edit dialogs on mobile viewports
- [ ] 9.4.3 Test bulk selection on touch devices
- [ ] 9.4.4 Ensure forms are usable on small screens

### 9.5 Loading States

- [ ] 9.5.1 Add form submission loading states
- [ ] 9.5.2 Add dialog loading states
- [ ] 9.5.3 Add bulk action progress indicators
- [ ] 9.5.4 Test skeleton loading animations

## Phase 10: Industry-Standard Schema Enhancements (Database Layer)

### 10.1 New Enums

- [x] 10.1.1 Add `project_visibility` enum (private, team, client, public)
- [x] 10.1.2 Add `ticket_resolution` enum (fixed, wont_fix, duplicate, cannot_reproduce, not_a_bug, done, incomplete, cancelled)
- [x] 10.1.3 Add `client_industry` enum (technology, healthcare, finance, education, retail, manufacturing, media, real_estate, hospitality, nonprofit, government, professional_services, other)
- [x] 10.1.4 Add `client_size` enum (startup, small, medium, large, enterprise)
- [x] 10.1.5 Add `sla_tier` enum (bronze, silver, gold, platinum)
- [x] 10.1.6 Add `contact_role` enum (primary, billing, technical, executive, stakeholder, other)
- [x] 10.1.7 Add `sprint_status` enum (planning, active, completed, cancelled)
- [x] 10.1.8 Add `milestone_status` enum (pending, in_progress, completed, missed, cancelled)
- [x] 10.1.9 Add `label_scope` enum (global, project, ticket)
- [x] 10.1.10 Extend `ticket_type` enum with feature_request, task, story, epic

### 10.2 New Tables

- [x] 10.2.1 Create `sprint` table in `apps/api/src/db/schema/sprint.ts`
- [x] 10.2.2 Create `milestone` table in `apps/api/src/db/schema/milestone.ts`
- [x] 10.2.3 Create `label` table in `apps/api/src/db/schema/label.ts`
- [x] 10.2.4 Create `project_label` join table for many-to-many
- [x] 10.2.5 Create `ticket_label` join table for many-to-many
- [x] 10.2.6 Create `project_watcher` table in `apps/api/src/db/schema/watcher.ts`
- [x] 10.2.7 Create `ticket_watcher` table
- [x] 10.2.8 Create `checklist` table in `apps/api/src/db/schema/checklist.ts`
- [x] 10.2.9 Create `checklist_item` table with assignee support
- [x] 10.2.10 Create `client_contact` table in `apps/api/src/db/schema/client-contact.ts`

### 10.3 Enhanced Existing Tables

- [x] 10.3.1 Add to `ticket`: resolution, storyPoints, sprintId, affectedVersion, fixVersion, component, isInternal, acceptanceCriteria
- [x] 10.3.2 Add to `project`: color, icon, visibility, isTemplate, ownerId, goals, customFields
- [x] 10.3.3 Add to `client`: industry, companySize, logo, timezone, preferredLanguage, slaTier, contractStartDate, contractEndDate, annualValue, currency, billingAddress, billingEmail, customFields, tags

### 10.4 Relations and Migration

- [x] 10.4.1 Update `relations.ts` with all new table relations
- [x] 10.4.2 Update `index.ts` to export all new tables
- [x] 10.4.3 Generate Drizzle migration
- [x] 10.4.4 Run migration against database

## Phase 11: Labels Management

### 11.1 Label CRUD Infrastructure

- [ ] 11.1.1 Create `apps/web/src/lib/schemas/label.ts` with Zod schemas
- [ ] 11.1.2 Create `apps/web/src/lib/actions/business-center/labels.ts`
- [ ] 11.1.3 Create `createLabelAction` Server Action
- [ ] 11.1.4 Create `updateLabelAction` Server Action
- [ ] 11.1.5 Create `deleteLabelAction` Server Action

### 11.2 Label Management UI

- [ ] 11.2.1 Create `apps/web/src/app/(default)/dashboard/business-center/settings/labels/page.tsx`
- [ ] 11.2.2 Create `apps/web/src/components/business-center/forms/label-form.tsx`
- [ ] 11.2.3 Create color picker component for label colors
- [ ] 11.2.4 Add label management to business-center settings navigation

### 11.3 Label Assignment Components

- [ ] 11.3.1 Create `apps/web/src/components/business-center/label-picker.tsx` (multi-select dropdown)
- [ ] 11.3.2 Create `apps/web/src/components/business-center/label-badge.tsx` (colored badge display)
- [ ] 11.3.3 Add `assignLabelToTicketAction` Server Action
- [ ] 11.3.4 Add `removeLabelFromTicketAction` Server Action
- [ ] 11.3.5 Add `assignLabelToProjectAction` Server Action
- [ ] 11.3.6 Add `removeLabelFromProjectAction` Server Action

### 11.4 Label Integration

- [ ] 11.4.1 Add label picker to ticket form
- [ ] 11.4.2 Add label picker to project form
- [ ] 11.4.3 Display labels in ticket list/card views
- [ ] 11.4.4 Display labels in project list/card views
- [ ] 11.4.5 Add label filtering to intake-queue views
- [ ] 11.4.6 Add label filtering to projects views

## Phase 12: Milestones Management

### 12.1 Milestone CRUD Infrastructure

- [ ] 12.1.1 Create `apps/web/src/lib/schemas/milestone.ts` with Zod schemas
- [ ] 12.1.2 Create `apps/web/src/lib/actions/business-center/milestones.ts`
- [ ] 12.1.3 Create `createMilestoneAction` Server Action
- [ ] 12.1.4 Create `updateMilestoneAction` Server Action
- [ ] 12.1.5 Create `deleteMilestoneAction` Server Action

### 12.2 Milestone UI Components

- [ ] 12.2.1 Create `apps/web/src/components/business-center/forms/milestone-form.tsx`
- [ ] 12.2.2 Create `apps/web/src/components/business-center/milestone-list.tsx`
- [ ] 12.2.3 Create `apps/web/src/components/business-center/milestone-progress.tsx` (progress bar)
- [ ] 12.2.4 Create milestone select dropdown for ticket assignment

### 12.3 Milestone Integration

- [ ] 12.3.1 Add milestones section to project detail page
- [ ] 12.3.2 Add milestone selector to ticket form
- [ ] 12.3.3 Create milestone timeline view component
- [ ] 12.3.4 Add milestone filtering to ticket views

## Phase 13: Sprints & Agile Features

### 13.1 Sprint CRUD Infrastructure

- [ ] 13.1.1 Create `apps/web/src/lib/schemas/sprint.ts` with Zod schemas
- [ ] 13.1.2 Create `apps/web/src/lib/actions/business-center/sprints.ts`
- [ ] 13.1.3 Create `createSprintAction` Server Action
- [ ] 13.1.4 Create `updateSprintAction` Server Action
- [ ] 13.1.5 Create `startSprintAction` Server Action (change status to active)
- [ ] 13.1.6 Create `completeSprintAction` Server Action

### 13.2 Sprint UI Components

- [ ] 13.2.1 Create `apps/web/src/components/business-center/forms/sprint-form.tsx`
- [ ] 13.2.2 Create `apps/web/src/components/business-center/sprint-board.tsx` (kanban for sprint)
- [ ] 13.2.3 Create `apps/web/src/components/business-center/sprint-burndown.tsx` (burndown chart)
- [ ] 13.2.4 Create sprint select dropdown for ticket assignment

### 13.3 Sprint Page

- [ ] 13.3.1 Create `apps/web/src/app/(default)/dashboard/business-center/sprints/page.tsx`
- [ ] 13.3.2 Create sprint list view with status indicators
- [ ] 13.3.3 Create `apps/web/src/app/(default)/dashboard/business-center/sprints/[id]/page.tsx`
- [ ] 13.3.4 Add sprints to business-center navigation sidebar

### 13.4 Agile Fields Integration

- [ ] 13.4.1 Add story points field to ticket form (Fibonacci select: 1, 2, 3, 5, 8, 13, 21)
- [ ] 13.4.2 Add sprint selector to ticket form
- [ ] 13.4.3 Add acceptance criteria textarea to ticket form
- [ ] 13.4.4 Display story points in ticket list/card views
- [ ] 13.4.5 Calculate sprint velocity (sum of completed story points)

## Phase 14: Checklists Management

### 14.1 Checklist CRUD Infrastructure

- [ ] 14.1.1 Create `apps/web/src/lib/schemas/checklist.ts` with Zod schemas
- [ ] 14.1.2 Create `apps/web/src/lib/actions/business-center/checklists.ts`
- [ ] 14.1.3 Create `createChecklistAction` Server Action
- [ ] 14.1.4 Create `updateChecklistAction` Server Action
- [ ] 14.1.5 Create `deleteChecklistAction` Server Action
- [ ] 14.1.6 Create `addChecklistItemAction` Server Action
- [ ] 14.1.7 Create `updateChecklistItemAction` Server Action
- [ ] 14.1.8 Create `toggleChecklistItemAction` Server Action
- [ ] 14.1.9 Create `deleteChecklistItemAction` Server Action
- [ ] 14.1.10 Create `reorderChecklistItemsAction` Server Action

### 14.2 Checklist UI Components

- [ ] 14.2.1 Create `apps/web/src/components/business-center/checklist.tsx` (main checklist component)
- [ ] 14.2.2 Create `apps/web/src/components/business-center/checklist-item.tsx` (individual item)
- [ ] 14.2.3 Add drag-and-drop reordering support
- [ ] 14.2.4 Add inline item editing
- [ ] 14.2.5 Add item assignee selector
- [ ] 14.2.6 Add item due date picker
- [ ] 14.2.7 Show checklist progress (X of Y completed)

### 14.3 Checklist Integration

- [ ] 14.3.1 Add checklists section to ticket detail view
- [ ] 14.3.2 Add checklists section to project detail view
- [ ] 14.3.3 Add "Add Checklist" button to ticket/project views
- [ ] 14.3.4 Display checklist completion status in list views

## Phase 15: Client Contacts Management

### 15.1 Client Contact CRUD Infrastructure

- [ ] 15.1.1 Create `apps/web/src/lib/schemas/client-contact.ts` with Zod schemas
- [ ] 15.1.2 Create `apps/web/src/lib/actions/business-center/client-contacts.ts`
- [ ] 15.1.3 Create `createClientContactAction` Server Action
- [ ] 15.1.4 Create `updateClientContactAction` Server Action
- [ ] 15.1.5 Create `deleteClientContactAction` Server Action
- [ ] 15.1.6 Create `setPrimaryContactAction` Server Action

### 15.2 Client Contact UI Components

- [ ] 15.2.1 Create `apps/web/src/components/business-center/forms/client-contact-form.tsx`
- [ ] 15.2.2 Create `apps/web/src/components/business-center/client-contact-list.tsx`
- [ ] 15.2.3 Create `apps/web/src/components/business-center/client-contact-card.tsx`
- [ ] 15.2.4 Add contact role badge component

### 15.3 Client Contact Integration

- [ ] 15.3.1 Add contacts section to client detail page
- [ ] 15.3.2 Add "Add Contact" button to client view
- [ ] 15.3.3 Show primary contact in client list view
- [ ] 15.3.4 Add contact selector for ticket communication

## Phase 16: Watchers/Subscriptions

### 16.1 Watcher Infrastructure

- [ ] 16.1.1 Create `apps/web/src/lib/actions/business-center/watchers.ts`
- [ ] 16.1.2 Create `watchProjectAction` Server Action
- [ ] 16.1.3 Create `unwatchProjectAction` Server Action
- [ ] 16.1.4 Create `watchTicketAction` Server Action
- [ ] 16.1.5 Create `unwatchTicketAction` Server Action
- [ ] 16.1.6 Create `getWatchersAction` Server Action

### 16.2 Watcher UI Components

- [ ] 16.2.1 Create `apps/web/src/components/business-center/watch-button.tsx` (toggle button)
- [ ] 16.2.2 Create `apps/web/src/components/business-center/watchers-list.tsx` (avatar list)
- [ ] 16.2.3 Add watcher count badge to list views

### 16.3 Watcher Integration

- [ ] 16.3.1 Add watch button to ticket detail view
- [ ] 16.3.2 Add watch button to project detail view
- [ ] 16.3.3 Show current user's watched items in a dedicated view
- [ ] 16.3.4 Auto-watch on creation (configurable)

## Phase 17: Enhanced Form Fields

### 17.1 Update Ticket Form

- [ ] 17.1.1 Add resolution field (shown when status is resolved/closed)
- [ ] 17.1.2 Add story points field (Fibonacci selector)
- [ ] 17.1.3 Add sprint selector
- [ ] 17.1.4 Add component field
- [ ] 17.1.5 Add isInternal toggle
- [ ] 17.1.6 Add acceptance criteria textarea
- [ ] 17.1.7 Add affected version field
- [ ] 17.1.8 Add fix version field
- [ ] 17.1.9 Update ticket Zod schema with new fields

### 17.2 Update Project Form

- [ ] 17.2.1 Add color picker field
- [ ] 17.2.2 Add icon selector field
- [ ] 17.2.3 Add visibility selector
- [ ] 17.2.4 Add isTemplate toggle
- [ ] 17.2.5 Add owner selector (different from assignees)
- [ ] 17.2.6 Add goals textarea
- [ ] 17.2.7 Update project Zod schema with new fields

### 17.3 Update Client Form

- [ ] 17.3.1 Add industry selector
- [ ] 17.3.2 Add company size selector
- [ ] 17.3.3 Add logo upload field
- [ ] 17.3.4 Add timezone selector
- [ ] 17.3.5 Add preferred language selector
- [ ] 17.3.6 Add SLA tier selector
- [ ] 17.3.7 Add contract start/end date pickers
- [ ] 17.3.8 Add annual value field with currency
- [ ] 17.3.9 Add billing address textarea
- [ ] 17.3.10 Add billing email field
- [ ] 17.3.11 Add tags input (multi-value)
- [ ] 17.3.12 Update client Zod schema with new fields

### 17.4 Custom Fields Support

- [ ] 17.4.1 Create custom fields editor component
- [ ] 17.4.2 Create custom fields display component
- [ ] 17.4.3 Add custom fields section to ticket form
- [ ] 17.4.4 Add custom fields section to project form
- [ ] 17.4.5 Add custom fields section to client form

## Phase 18: Advanced Filtering & Search

### 18.1 Filter Infrastructure

- [ ] 18.1.1 Create `apps/web/src/components/business-center/advanced-filter.tsx`
- [ ] 18.1.2 Add filter state management (URL params or Zustand)
- [ ] 18.1.3 Create filter presets/saved filters feature

### 18.2 Ticket Filters

- [ ] 18.2.1 Add filter by labels
- [ ] 18.2.2 Add filter by sprint
- [ ] 18.2.3 Add filter by milestone
- [ ] 18.2.4 Add filter by story points range
- [ ] 18.2.5 Add filter by resolution
- [ ] 18.2.6 Add filter by component
- [ ] 18.2.7 Add filter by watcher (watching/not watching)

### 18.3 Project Filters

- [ ] 18.3.1 Add filter by visibility
- [ ] 18.3.2 Add filter by owner
- [ ] 18.3.3 Add filter by labels
- [ ] 18.3.4 Add filter by template status

### 18.4 Client Filters

- [ ] 18.4.1 Add filter by industry
- [ ] 18.4.2 Add filter by company size
- [ ] 18.4.3 Add filter by SLA tier
- [ ] 18.4.4 Add filter by tags
- [ ] 18.4.5 Add filter by contract status (active/expired)

## Phase 19: Dashboard & Analytics

### 19.1 Sprint Analytics

- [ ] 19.1.1 Create sprint velocity chart component
- [ ] 19.1.2 Create sprint burndown chart component
- [ ] 19.1.3 Create sprint cumulative flow diagram
- [ ] 19.1.4 Add sprint summary cards (points committed/completed)

### 19.2 Milestone Analytics

- [ ] 19.2.1 Create milestone progress overview
- [ ] 19.2.2 Create milestone timeline visualization
- [ ] 19.2.3 Add milestone risk indicators (at risk/overdue)

### 19.3 Team Capacity Enhancements

- [ ] 19.3.1 Add story points to capacity calculations
- [ ] 19.3.2 Show team velocity trends
- [ ] 19.3.3 Add sprint assignment distribution

### 19.4 Client Analytics

- [ ] 19.4.1 Create client health dashboard
- [ ] 19.4.2 Add SLA compliance tracking
- [ ] 19.4.3 Show contract renewal alerts
- [ ] 19.4.4 Display client revenue analytics
