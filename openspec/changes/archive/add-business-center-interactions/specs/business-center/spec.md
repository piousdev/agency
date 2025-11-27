# Business Center - Implementation Notes

**Note**: This change implements interactive functionality for existing
requirements. No new requirements are being added - only implementing the
behavior already specified in the base spec.

## ADDED Requirements

### Requirement: Interactive UI Components

The Business Center UI components SHALL provide interactive elements (modals,
dialogs, forms) following shadcn/ui patterns and Server-First architecture.

#### Scenario: Click to view details

- **WHEN** user clicks on any ticket, project, or team member in any view
  (table, cards, kanban)
- **THEN** detail modal/sheet opens showing full context
- **AND** modal provides action buttons relevant to the entity type

#### Scenario: Server Actions for mutations

- **WHEN** user performs any mutation (assign, update status, change capacity)
- **THEN** action is handled by Server Action using Next.js server-side
  execution
- **AND** Server Action makes authenticated API call to Hono backend
- **AND** page revalidates using revalidatePath() to show updated data

#### Scenario: Optimistic UI updates

- **WHEN** user performs quick actions (status change, assignment)
- **THEN** UI updates optimistically before server confirmation
- **AND** reverts if server action fails
- **AND** displays error message on failure

### Requirement: Form Validation and Error Handling

All forms and Server Actions SHALL include comprehensive validation and
user-friendly error messages.

#### Scenario: Client-side form validation

- **WHEN** user submits form with invalid data
- **THEN** validation errors display inline at field level
- **AND** submit button remains disabled until errors resolved
- **AND** no server request is made

#### Scenario: Server Action error handling

- **WHEN** Server Action encounters error (network, validation, business logic)
- **THEN** error is caught and formatted for user display
- **AND** toast notification shows specific error message
- **AND** form state is preserved for retry

#### Scenario: Capacity warning on assignment

- **WHEN** assigning work to team member at or above 80% capacity
- **THEN** warning dialog shows "Team member approaching/at capacity. Continue?"
- **AND** displays current capacity percentage and project count
- **AND** allows override with confirmation

## MODIFIED Requirements

None - all existing requirements remain unchanged. This change provides the
implementation layer for already-specified behavior.

## REMOVED Requirements

None
