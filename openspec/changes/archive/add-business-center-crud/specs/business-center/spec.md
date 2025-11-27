# Business Center CRUD Spec Deltas

## ADDED Requirements

### Requirement: Permission-Based Access Control

The system SHALL enforce fine-grained permissions for all CRUD operations in the
Business Center.

Permissions SHALL be stored in the role table's JSONB permissions field and
checked before every mutation.

The following permissions SHALL be supported:

- `ticket:create`, `ticket:edit`, `ticket:delete`, `ticket:assign`
- `project:create`, `project:edit`, `project:delete`, `project:assign`
- `client:create`, `client:edit`, `client:delete`
- `bulk:operations`

#### Scenario: User with permission performs action

- **WHEN** a user with `ticket:create` permission attempts to create a ticket
- **THEN** the action succeeds and the ticket is created

#### Scenario: User without permission denied

- **WHEN** a user without `project:delete` permission attempts to delete a
  project
- **THEN** the action fails with a "Permission denied" error
- **AND** no data is modified

#### Scenario: UI hides unavailable actions

- **WHEN** a user without `client:create` permission views the clients page
- **THEN** the "New Client" button is not visible or is disabled

---

### Requirement: Ticket CRUD Operations

The system SHALL provide full Create, Read, Update, and Delete operations for
tickets.

#### Scenario: Create ticket via dedicated page

- **WHEN** a user with `ticket:create` permission navigates to
  `/business-center/intake-queue/new`
- **THEN** a form is displayed with fields for title, description, type,
  priority, client, and assignee
- **AND** upon successful submission, the user is redirected to the new ticket's
  detail view

#### Scenario: Create ticket from kanban column

- **WHEN** a user clicks "+ Add" in a kanban priority column
- **THEN** they are navigated to the create page with the priority pre-selected

#### Scenario: Edit ticket via dialog

- **WHEN** a user with `ticket:edit` permission clicks "Edit" on a ticket
- **THEN** a dialog opens with the ticket's current values pre-filled
- **AND** changes are saved optimistically with rollback on failure

#### Scenario: Delete ticket with confirmation

- **WHEN** a user with `ticket:delete` permission clicks "Delete" on a ticket
- **THEN** a confirmation dialog appears warning about the action
- **AND** upon confirmation, the ticket is soft-deleted (status set to 'closed')

---

### Requirement: Project CRUD Operations

The system SHALL provide full Create, Read, Update, and Delete operations for
projects.

#### Scenario: Create project via dedicated page

- **WHEN** a user with `project:create` permission navigates to
  `/business-center/projects/new`
- **THEN** a form is displayed with fields for name, description, client,
  priority, due date, and team members
- **AND** upon successful submission, the user is redirected to the new
  project's detail view

#### Scenario: Create project from kanban column

- **WHEN** a user clicks "+ Add" in a kanban status column
- **THEN** they are navigated to the create page with the status pre-selected

#### Scenario: Edit project via dialog

- **WHEN** a user with `project:edit` permission clicks "Edit" on a project
- **THEN** a dialog opens with the project's current values pre-filled
- **AND** changes are saved optimistically with rollback on failure

#### Scenario: Delete project with confirmation

- **WHEN** a user with `project:delete` permission clicks "Delete" on a project
- **THEN** a confirmation dialog appears warning about associated tickets
- **AND** upon confirmation, the project is soft-deleted (status set to
  'archived')

---

### Requirement: Client CRUD Operations

The system SHALL provide full Create, Read, Update, and Delete operations for
clients.

#### Scenario: View clients list

- **WHEN** a user navigates to `/business-center/clients`
- **THEN** a table of all clients is displayed with name, type, email, and
  project count

#### Scenario: Create client via dedicated page

- **WHEN** a user with `client:create` permission navigates to
  `/business-center/clients/new`
- **THEN** a form is displayed with fields for name, type, email, phone,
  website, and address
- **AND** upon successful submission, the user is redirected to the clients list

#### Scenario: Edit client via dialog

- **WHEN** a user with `client:edit` permission clicks "Edit" on a client
- **THEN** a dialog opens with the client's current values pre-filled

#### Scenario: Delete client with cascade warning

- **WHEN** a user with `client:delete` permission clicks "Delete" on a client
  with associated projects
- **THEN** a confirmation dialog shows the number of associated projects and
  tickets
- **AND** upon confirmation, the client is soft-deleted (active set to false)

---

### Requirement: Bulk Operations

The system SHALL support bulk selection and bulk actions for tickets and
projects.

#### Scenario: Select multiple items

- **WHEN** a user checks the checkbox on multiple items in a table view
- **THEN** a bulk action bar appears showing the count of selected items
- **AND** available bulk actions are displayed based on user permissions

#### Scenario: Bulk status update

- **WHEN** a user with `ticket:edit` permission selects multiple tickets and
  chooses "Change Status"
- **THEN** all selected tickets are updated to the chosen status
- **AND** a success toast shows how many items were updated

#### Scenario: Bulk assign

- **WHEN** a user with `project:assign` permission selects multiple projects and
  chooses "Assign to"
- **THEN** a user selection dialog appears
- **AND** upon selection, all projects are assigned to the chosen user

#### Scenario: Bulk delete

- **WHEN** a user with `ticket:delete` permission selects multiple tickets and
  chooses "Delete"
- **THEN** a confirmation dialog shows the count of items to be deleted
- **AND** upon confirmation, all selected items are soft-deleted

#### Scenario: Bulk selection limit

- **WHEN** a user attempts to select more than 100 items
- **THEN** the selection is limited to 100 items
- **AND** a message informs the user of the limit

---

### Requirement: Audit Logging

The system SHALL log all CRUD operations with actor, timestamp, and change
details.

#### Scenario: Log creation

- **WHEN** a user creates a ticket, project, or client
- **THEN** an activity record is created with action='created', actor, and
  entity details

#### Scenario: Log update with change diff

- **WHEN** a user updates an entity
- **THEN** an activity record is created with action='updated' and a JSON diff
  of changed fields

#### Scenario: Log deletion

- **WHEN** a user deletes an entity
- **THEN** an activity record is created with action='deleted' before the
  soft-delete

#### Scenario: View activity feed

- **WHEN** a user views an entity's detail page
- **THEN** an activity feed shows all changes to that entity in reverse
  chronological order

#### Scenario: Activity feed pagination

- **WHEN** an entity has more than 20 activity entries
- **THEN** the activity feed shows pagination controls to load older entries

---

### Requirement: Optimistic Updates

The system SHALL provide optimistic UI updates for all mutations with automatic
rollback on failure.

#### Scenario: Optimistic create

- **WHEN** a user submits a create form
- **THEN** a loading state is shown during submission
- **AND** upon success, the user is navigated to the new entity

#### Scenario: Optimistic update with rollback

- **WHEN** a user saves changes in an edit dialog
- **THEN** the UI immediately reflects the changes
- **AND** if the server request fails, the UI reverts to the previous state
- **AND** an error toast is displayed

#### Scenario: Optimistic delete with rollback

- **WHEN** a user confirms a delete action
- **THEN** the item is immediately removed from the UI
- **AND** if the server request fails, the item reappears
- **AND** an error toast is displayed

---

### Requirement: Form Validation

The system SHALL validate all form inputs with clear error messages.

#### Scenario: Required field validation

- **WHEN** a user submits a form with empty required fields
- **THEN** error messages appear next to each invalid field
- **AND** the form is not submitted

#### Scenario: Format validation

- **WHEN** a user enters an invalid email format in the client form
- **THEN** an error message indicates the expected format

#### Scenario: Server-side validation

- **WHEN** server-side validation fails (e.g., duplicate email)
- **THEN** the error is displayed as a form-level or field-level error

---

### Requirement: Loading States

The system SHALL display appropriate loading states during all async operations.

#### Scenario: Page loading skeleton

- **WHEN** a create/edit page is loading
- **THEN** a skeleton matching the form layout is displayed

#### Scenario: Form submission loading

- **WHEN** a form is being submitted
- **THEN** the submit button shows a loading indicator
- **AND** the form inputs are disabled

#### Scenario: Dialog loading

- **WHEN** an edit dialog is loading entity data
- **THEN** a skeleton or spinner is displayed within the dialog

#### Scenario: Bulk operation progress

- **WHEN** a bulk operation is in progress
- **THEN** a progress indicator shows the operation status
- **AND** the bulk action bar is disabled until completion
