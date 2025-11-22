# Implementation Tasks

## 1. Shared Components & Infrastructure

- [ ] 1.1 Create shared modal/sheet component for detail views
- [ ] 1.2 Create shared assignment dialog component
- [ ] 1.3 Create shared status update dialog component
- [ ] 1.4 Set up Server Actions directory structure
- [ ] 1.5 Create error handling utilities for Server Actions

## 2. Intake Queue Interactive Features

- [ ] 2.1 Add click handlers to open ticket detail modal
- [ ] 2.2 Create ticket detail modal component
- [ ] 2.3 Implement "Create Intake Request" form and modal
- [ ] 2.4 Create Server Action: assign ticket to team member
- [ ] 2.5 Create Server Action: update ticket status
- [ ] 2.6 Add assignment dialog with team member selection
- [ ] 2.7 Add form validation and error handling
- [ ] 2.8 Add success/error toast notifications

## 3. Active Projects (Content & Software) Interactive Features

- [ ] 3.1 Add click handlers to open project detail modal
- [ ] 3.2 Create project detail modal component
- [ ] 3.3 Implement drag-and-drop status updates in kanban view
- [ ] 3.4 Create Server Action: update project status
- [ ] 3.5 Create Server Action: assign team member to project
- [ ] 3.6 Create Server Action: remove team member from project
- [ ] 3.7 Add quick action menus to project cards
- [ ] 3.8 Add status update dialog with validation
- [ ] 3.9 Add team assignment dialog with capacity warnings
- [ ] 3.10 Implement optimistic updates for better UX

## 4. Team Capacity Interactive Features

- [ ] 4.1 Add click handlers to open team member detail modal
- [ ] 4.2 Create team member detail modal showing all projects
- [ ] 4.3 Create Server Action: update user capacity percentage
- [ ] 4.4 Create Server Action: reassign project between team members
- [ ] 4.5 Add capacity edit dialog with validation (0-150% with warnings)
- [ ] 4.6 Add project reassignment interface
- [ ] 4.7 Add capacity status indicators and warnings

## 5. Recently Completed Interactive Features

- [ ] 5.1 Add click handlers to open project detail modal (read-only)
- [ ] 5.2 Create Server Action: reopen completed project
- [ ] 5.3 Add reopen confirmation dialog
- [ ] 5.4 Add filtering and search functionality

## 6. Server Actions Implementation

- [ ] 6.1 Implement `assignTicket(ticketId, userId)` Server Action
- [ ] 6.2 Implement `updateTicketStatus(ticketId, status)` Server Action
- [ ] 6.3 Implement `createIntakeRequest(data)` Server Action
- [ ] 6.4 Implement `updateProjectStatus(projectId, status)` Server Action
- [ ] 6.5 Implement `assignProjectMember(projectId, userId, role)` Server Action
- [ ] 6.6 Implement `removeProjectMember(assignmentId)` Server Action
- [ ] 6.7 Implement `updateUserCapacity(userId, percentage)` Server Action
- [ ] 6.8 Implement `reopenProject(projectId)` Server Action
- [ ] 6.9 Add proper error handling and validation to all Server Actions
- [ ] 6.10 Add revalidation paths to update UI after mutations

## 7. API Endpoint Modifications (if needed)

- [ ] 7.1 Verify PATCH /api/tickets/:id supports status updates
- [ ] 7.2 Verify PATCH /api/projects/:id supports status updates
- [ ] 7.3 Verify POST /api/projects/:id/assignments supports team assignment
- [ ] 7.4 Verify DELETE /api/projects/assignments/:id supports removal
- [ ] 7.5 Verify PATCH /api/users/:id/capacity supports capacity updates
- [ ] 7.6 Add any missing API endpoints as needed

## 8. Testing & Polish

- [ ] 8.1 Test all workflows end-to-end
- [ ] 8.2 Verify error states display properly
- [ ] 8.3 Test loading states and optimistic updates
- [ ] 8.4 Verify accessibility (keyboard navigation, screen readers)
- [ ] 8.5 Test with actual seed data
- [ ] 8.6 Verify capacity warnings work correctly
- [ ] 8.7 Test all modals and dialogs on mobile viewports
- [ ] 8.8 Add confirmation dialogs for destructive actions
