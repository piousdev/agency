# Business Center Capability

## ADDED Requirements

### Requirement: Intake Queue Display

The Business Center SHALL display all pending work requests (tickets with type='intake') in a filterable list view with key metadata.

#### Scenario: View intake queue

- **WHEN** internal user navigates to Business Center
- **THEN** intake queue section displays all tickets where type='intake' AND status IN ('open', 'in_progress')
- **AND** each item shows: Request ID, Client Name, Service Type (from client.type), Submission Date, Priority, Status

#### Scenario: Filter intake by service type

- **WHEN** user applies service type filter (creative OR software)
- **THEN** only intake requests from clients matching that type are displayed

#### Scenario: Filter intake by priority

- **WHEN** user applies priority filter (low/medium/high/critical)
- **THEN** only intake requests matching selected priorities are displayed

### Requirement: Intake Request Creation

The Business Center SHALL provide a form for internal users to create new work requests (intake tickets) on behalf of clients.

#### Scenario: Create intake request

- **WHEN** internal user submits intake form with required fields (client, title, description, service type, priority)
- **THEN** system creates new ticket with type='intake', status='open', created_by_id=current user
- **AND** redirects to intake queue with success message

#### Scenario: Validation on create

- **WHEN** user submits intake form with missing required fields
- **THEN** form displays field-level validation errors
- **AND** no ticket is created

### Requirement: Intake Detail Modal

The Business Center SHALL provide a detail modal for viewing full intake context and performing assignment actions.

#### Scenario: Open intake detail modal

- **WHEN** user clicks on intake request in queue
- **THEN** modal opens showing full ticket details (title, description, client, service type, priority, status, creation date, notes)
- **AND** modal includes assignment action button

#### Scenario: Assign from detail modal

- **WHEN** user clicks assign button in detail modal
- **THEN** assignment dialog opens with team member selection
- **AND** provides context about assignee capacity

### Requirement: Intake Assignment

The Business Center SHALL allow assignment of intake requests to team members for triage and initial scoping.

#### Scenario: Assign intake to team member

- **WHEN** internal user assigns intake ticket to team member
- **THEN** ticket.assigned_to_id is updated
- **AND** ticket.status changes to 'in_progress'
- **AND** assigned user sees ticket in their queue

### Requirement: Active Work Display - Content/Media

The Business Center SHALL display all active content/media production projects grouped by production stage.

#### Scenario: View active content projects

- **WHEN** internal user views Active Work - Content/Media section
- **THEN** displays projects where client.type='creative' AND project.status IN ('in_development', 'in_review')
- **AND** projects are grouped by stage: Pre-Production, In-Production, Post-Production (derived from status/metadata)

#### Scenario: Project card display

- **WHEN** viewing active content projects
- **THEN** each project card shows: Project Name, Client, Assignee(s), Deadline, Current Stage, Completion %, Priority
- **AND** completion percentage is displayed as visual progress indicator

#### Scenario: Project quick actions

- **WHEN** user interacts with project card quick actions
- **THEN** available actions include: Change assignee, Update status, View timeline
- **AND** actions open appropriate modal or navigation

### Requirement: Active Work Display - Software Development

The Business Center SHALL display all active software development projects grouped by development stage.

#### Scenario: View active software projects

- **WHEN** internal user views Active Work - Software Development section
- **THEN** displays projects where client.type IN ('software', 'full_service') AND project.status IN ('in_development', 'in_review')
- **AND** projects are grouped by stage: Design, Development, Testing, Delivery

#### Scenario: Quick status update

- **WHEN** user changes project status via quick action
- **THEN** project.status is updated
- **AND** project card reflects new stage grouping immediately

### Requirement: Project Assignment

The Business Center SHALL allow assignment of team members to projects with role designation.

#### Scenario: Assign team member to project

- **WHEN** internal user assigns team member to project
- **THEN** project_assignment record is created with user_id, project_id, assigned_at timestamp
- **AND** project card shows assignee in team list

#### Scenario: Remove team member from project

- **WHEN** internal user removes team member from project
- **THEN** corresponding project_assignment record is deleted
- **AND** project card updates to remove assignee

### Requirement: Team Capacity Display

The Business Center SHALL display all internal team members with current capacity allocation and availability status.

#### Scenario: View team capacity

- **WHEN** internal user views Team Capacity section
- **THEN** displays table with columns: Team Member, Current Projects (count), Capacity Used (%), Available Capacity (%), Status
- **AND** each row includes visual bar showing allocation percentage
- **AND** only shows users where is_internal=true

#### Scenario: Filter team capacity

- **WHEN** user applies filter by service type or team member
- **THEN** table displays only team members matching filter criteria
- **AND** available filters include: service type (creative/software), team member name search

#### Scenario: Capacity status calculation

- **WHEN** displaying team member capacity
- **THEN** Status is determined:
  - Available: capacity_percentage < 80%
  - At Capacity: capacity_percentage >= 80% AND < 100%
  - Overloaded: capacity_percentage >= 100%

### Requirement: Manual Capacity Management

The Business Center SHALL allow administrators to manually update team member capacity allocations.

#### Scenario: Update user capacity

- **WHEN** admin updates team member capacity percentage (0-100)
- **THEN** user.capacity_percentage is updated
- **AND** team capacity table reflects new allocation
- **AND** status indicator updates based on new percentage

#### Scenario: Capacity validation

- **WHEN** admin attempts to set capacity > 150%
- **THEN** system displays warning "Capacity exceeds recommended maximum"
- **AND** allows save but marks user as overloaded

### Requirement: Delivery Calendar

The Business Center SHALL display all active projects on a calendar/timeline view organized by delivery date.

#### Scenario: View delivery calendar

- **WHEN** internal user views Delivery Calendar section
- **THEN** displays projects with deliveredAt dates in calendar format (month/week view)
- **AND** each entry shows: Project Name, Client, Deadline, Status
- **AND** projects are color-coded by service type (content/media vs software development)

#### Scenario: Identify bottlenecks

- **WHEN** multiple projects have same delivery date
- **THEN** calendar visually highlights the date with count indicator
- **AND** expands to show all projects on that date when clicked

#### Scenario: Filter by date range

- **WHEN** user selects date range (current month, next 30 days, quarter)
- **THEN** calendar displays only projects with deliveredAt in selected range

### Requirement: Recently Completed Projects

The Business Center SHALL display projects delivered in the past 7-14 days for reference and output tracking.

#### Scenario: View recently completed

- **WHEN** internal user views Recently Completed section
- **THEN** displays projects where status='delivered' AND deliveredAt >= (today - 14 days)
- **AND** sorted by deliveredAt descending (most recent first)
- **AND** configurable time range (7 days or 14 days)

#### Scenario: Completed project display

- **WHEN** viewing recently completed projects
- **THEN** each item shows: Project Name, Client, Service Type, Completion Date, Assigned Team

### Requirement: Internal-Only Access Control

The Business Center SHALL be accessible only to users with is_internal=true flag, enforced at both middleware and component levels.

#### Scenario: Internal user access

- **WHEN** user with is_internal=true navigates to /dashboard/business-center
- **THEN** page renders successfully with all sections visible

#### Scenario: Client user denied

- **WHEN** user with is_internal=false attempts to navigate to /dashboard/business-center
- **THEN** middleware redirects to /dashboard with error message "Access denied: Internal team only"

#### Scenario: Unauthenticated access denied

- **WHEN** unauthenticated user attempts to access /dashboard/business-center
- **THEN** redirects to /login with return URL preserved

### Requirement: Server-First Architecture Compliance

The Business Center SHALL follow the Server-First architecture pattern with Server Components, Server Actions, and minimal client JavaScript.

#### Scenario: Server Component data fetching

- **WHEN** Business Center page loads
- **THEN** all section data is fetched server-side via Server Components
- **AND** no client-side data fetching occurs on initial render

#### Scenario: Server Actions for mutations

- **WHEN** user performs mutation (assign ticket, update capacity, change status)
- **THEN** action is handled by Server Action
- **AND** server-to-server API call is made to Hono backend
- **AND** page revalidates to show updated data

#### Scenario: Client components limited

- **WHEN** rendering Business Center
- **THEN** only interactive elements (forms, modals, dropdowns) use 'use client'
- **AND** data display components remain Server Components

### Requirement: Performance Optimization

The Business Center SHALL load efficiently with appropriate database query optimization and caching strategies.

#### Scenario: Indexed queries

- **WHEN** fetching intake queue, active projects, or team capacity
- **THEN** database queries use existing indexes on:
  - ticket: type, status, assigned_to_id, client_id
  - project: status, client_id, delivered_at
  - user: is_internal, capacity_percentage

#### Scenario: Data caching

- **WHEN** multiple sections query same data (e.g., client names)
- **THEN** React cache() deduplicates requests within single render

### Requirement: Error Handling

The Business Center SHALL gracefully handle errors and display user-friendly messages for all operations.

#### Scenario: API error on load

- **WHEN** section data fails to load due to API error
- **THEN** section displays error state with retry button
- **AND** other sections continue to function

#### Scenario: Assignment conflict

- **WHEN** attempting to assign project but user capacity already at 100%
- **THEN** system displays warning "Team member at capacity. Assign anyway?"
- **AND** allows override with confirmation

#### Scenario: Network timeout

- **WHEN** Server Action times out
- **THEN** user sees "Request timed out. Please try again."
- **AND** form state is preserved for retry
