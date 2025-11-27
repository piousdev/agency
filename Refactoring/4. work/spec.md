# Work Navigation - Specification Document

## Document Information

- **Component**: Work (Task Management & Execution)
- **Version**: 1.0
- **Last Updated**: November 23, 2025
- **Status**: Draft

---

## 1. Purpose & Objectives

### 1.1 Primary Purpose

The Work navigation serves as the central workspace where all executable tasks
(0-8 story points) are managed, tracked, and completed. It consolidates tasks
from both standalone requests and project breakdowns into a unified workflow for
team execution.

### 1.2 Core Objectives

- Provide a unified view of all tasks regardless of origin (standalone or
  project-related)
- Enable efficient task workflow from backlog to completion
- Support agile/sprint-based work methodology
- Facilitate team collaboration and task handoffs
- Track individual and team progress
- Support multiple work states and transitions
- Enable quick task creation and updates
- Maintain visibility of task context and dependencies

### 1.3 Success Metrics

- Average task cycle time: <5 days from To Do to Done
- Task completion rate: 95%+ of committed sprint tasks
- Team velocity stability: ±10% variance sprint-to-sprint
- Time tracking accuracy: 90%+ of tasks have logged time
- Zero tasks lost or unassigned
- User satisfaction with work interface: 4.5/5+
- Sprint planning efficiency: <30 minutes per sprint

---

## 2. User Roles & Access Levels

### 2.1 Supported Roles

**Admin/Project Owner (PO)**:

- Full visibility across all tasks
- Can create, edit, delete any task
- Can assign tasks to anyone
- Can override assignments and priorities
- Access to all work analytics
- Can configure workflow states

**Project Manager (PM)**:

- Create and assign tasks
- View all tasks they manage
- Assign tasks to sprints
- Monitor team progress
- Cannot delete tasks (Admin only)
- Access to team analytics

**Team Members (Developer, Designer, QA)**:

- View tasks assigned to them
- View tasks in their specialty (optional filter)
- Update task status
- Log time on tasks
- Add comments and updates
- Cannot reassign tasks without permission
- Cannot delete tasks

**Clients**:

- No direct access to Work section
- Can view task progress through Projects/Intake
- Cannot see Work section navigation

### 2.2 Permission Matrix

| Action              | Admin | PM  | Team | Client |
| ------------------- | ----- | --- | ---- | ------ |
| Create task         | ✓     | ✓   | ✗    | ✗      |
| View all tasks      | ✓     | ✓   | ✗    | ✗      |
| View assigned tasks | ✓     | ✓   | ✓    | ✗      |
| Update task status  | ✓     | ✓   | ✓\*  | ✗      |
| Assign tasks        | ✓     | ✓   | ✗    | ✗      |
| Assign to sprint    | ✓     | ✓   | ✗    | ✗      |
| Log time            | ✓     | ✓   | ✓    | ✗      |
| Delete tasks        | ✓     | ✗   | ✗    | ✗      |
| Configure workflow  | ✓     | ✗   | ✗    | ✗      |

\*Team members can only update status of tasks assigned to them

---

## 3. Task Sources

### 3.1 Tasks from Intake

**Routed Standalone Requests** (0-8 story points):

- Request estimated at 0-8 points in Intake
- Routed to Work section as task
- Becomes single task in Backlog
- Inherits all request data

**Request Data Transferred**:

- Title
- Description
- Priority
- Story points
- Requester/Client
- Due date
- Attachments
- Related information
- Original request ID (linked)

---

### 3.2 Tasks from Projects

**Project Breakdown Tasks**:

- Created during project breakdown in Projects section
- Each task 0-8 story points
- Linked to parent project
- Appears in Work section Backlog
- Shows "Part of Project: [Name]"

**Project Task Attributes**:

- All standard task fields
- Parent project link
- Project context visible
- Task completion updates project progress

---

### 3.3 Tasks from Change Requests

**Change Request Tasks**:

- Change requests always become tasks (even if 13+ points)
- Linked to parent project
- Flagged as "Change Request"
- May impact project timeline/budget
- Appears in Work section

---

### 3.4 Ad-Hoc Task Creation

**Direct Task Creation**:

- PM/Admin can create tasks directly in Work
- For internal work, maintenance, tech debt
- Not linked to request or project (optional)
- Follows same workflow as other tasks

---

## 4. Work Workflow States

### 4.1 State 1: Backlog

**Purpose**: Holding area for planned but not yet started tasks.

**Entry Criteria**:

- Task created from Intake routing
- Task created from project breakdown
- Task created manually
- Not yet assigned to sprint

**Characteristics**:

- No sprint assignment
- May or may not have assignee
- Prioritized order maintained
- Can be refined/groomed

**Activities**:

- PM prioritizes tasks
- Team members review upcoming work
- Tasks estimated/re-estimated if needed
- Tasks assigned to team members
- Tasks refined with acceptance criteria

**Exit Criteria**:

- Task assigned to sprint
- Moves to To Do when sprint starts

**Transitions**:

- To **To Do**: Assigned to active sprint
- To **Rejected/Closed**: If cancelled before start

---

### 4.2 State 2: To Do

**Purpose**: Tasks ready to be worked on in current sprint.

**Entry Criteria**:

- Task assigned to active sprint
- Sprint has started
- Task has assignee
- All dependencies met (if any)

**Characteristics**:

- Part of active sprint
- Team member assigned
- Ready to start immediately
- No blockers

**Activities**:

- Team member picks up task
- Reviews requirements
- Plans approach
- Begins work

**Exit Criteria**:

- Team member starts work
- Moves to In Progress

**Transitions**:

- To **In Progress**: Work started
- To **Backlog**: If removed from sprint
- To **Blocked**: If blocker discovered

**Aging Alert**: Warning if task sits in To Do >3 days

---

### 4.3 State 3: In Progress

**Purpose**: Active work being performed.

**Entry Criteria**:

- Task in To Do
- Team member begins work
- Timer started (optional)

**Characteristics**:

- Work actively happening
- Time being logged
- Progress updates added
- Assignee working on it

**Activities**:

- Development/design/writing
- Implementation
- Time tracking
- Progress updates
- Collaboration with team

**Exit Criteria**:

- Work complete and ready for review
- Moves to next stage (Code Review or In Review)

**Transitions**:

- To **Code Review**: If development task needing peer review
- To **In Review**: If ready for QA/client review
- To **Blocked**: If blocker encountered
- To **To Do**: If paused/deprioritized

**Limits**: Team member should have max 2-3 tasks In Progress simultaneously

---

### 4.4 State 4: Code Review (Development Tasks Only)

**Purpose**: Peer review of code before QA.

**Entry Criteria**:

- Development task completed
- Code committed
- Pull request created

**Characteristics**:

- Assigned to reviewer
- Code changes visible
- Automated tests run
- Review comments added

**Activities**:

- Peer reviews code
- Provides feedback
- Requests changes if needed
- Approves if satisfactory

**Exit Criteria**:

- Code approved by reviewer
- No pending change requests
- Moves to In Review for QA

**Transitions**:

- To **In Review**: Code approved
- To **In Progress**: Changes requested, back to developer

**Aging Alert**: Warning if Code Review >2 days

---

### 4.5 State 5: In Review

**Purpose**: Quality assurance and approval before completion.

**Entry Criteria**:

- Work completed
- Code merged (if development)
- Ready for QA or client review

**Characteristics**:

- QA testing in progress
- Client reviewing (if applicable)
- Validation against acceptance criteria
- Bug reports filed if issues found

**Activities**:

- QA tests functionality
- Client reviews deliverable
- Acceptance criteria verified
- Issues documented

**Exit Criteria**:

- All acceptance criteria met
- No blocking issues
- Approved by QA and/or client

**Transitions**:

- To **Done**: Approved, task complete
- To **In Progress**: Issues found, needs rework

**Aging Alert**: Warning if In Review >5 days

---

### 4.6 State 6: Done

**Purpose**: Task completed successfully.

**Entry Criteria**:

- Approved by QA/client
- All acceptance criteria met
- Work deployed/delivered
- Documentation complete

**Characteristics**:

- No further work needed
- Counted toward velocity
- Time fully logged
- Visible in completed view

**Activities**:

- None (terminal state)
- Task archived after sprint ends

**Final State**: Task remains in Done indefinitely

---

### 4.7 Special State: Blocked

**Purpose**: Task cannot progress due to blocker.

**Entry Criteria**:

- Task encounters blocker
- Cannot continue until resolved

**Blocker Types**:

- Waiting on dependency (other task, external team)
- Waiting on information (client, stakeholder)
- Technical blocker (infrastructure, tools, access)
- Resource unavailable

**Characteristics**:

- Blocker clearly documented
- Owner of blocker identified
- Resolution plan in place
- Daily status updates

**Activities**:

- PM works to remove blocker
- Escalation if needed
- Assignee may work on other tasks meanwhile

**Exit Criteria**:

- Blocker removed
- Returns to previous state (usually In Progress)

**Transitions**:

- To **In Progress**: Blocker resolved
- To **To Do**: If completely blocked before work started

**Alerts**: Immediate alert when task blocked, daily reminders until resolved

---

## 5. Task Attributes

### 5.1 Core Attributes (Required)

**Task ID**: Unique identifier (auto-generated, sequential)

**Title**: Short description of task (max 100 characters)

**Description**: Detailed description with rich text formatting

**Story Points**: Estimate using Fibonacci (0, 1, 2, 3, 5, 8)

**Status**: Current workflow state

**Assignee**: Team member responsible

**Priority**: Low, Medium, High, Urgent

**Created Date**: When task was created

**Created By**: User who created task

---

### 5.2 Optional Attributes

**Sprint**: Sprint assignment (if applicable)

**Due Date**: Target completion date

**Labels/Tags**: Categorization (e.g., "bug", "enhancement", "frontend")

**Parent Project**: If task is part of project

**Original Request**: If task came from Intake

**Change Request Flag**: If task is a change request

**Subtasks**: Checklist items within task

**Acceptance Criteria**: Conditions for task completion

**Attachments**: Files related to task

**Dependencies**: Other tasks this depends on or blocks

**Estimated Hours**: Time estimate

**Time Logged**: Actual time spent

---

### 5.3 Calculated Attributes

**Age**: Days since created

**Cycle Time**: Days from To Do to Done

**Lead Time**: Days from created to Done

**Time in State**: Days in current status

**Progress**: Percentage complete (based on subtasks)

---

## 6. Sprint Management

### 6.1 Sprint Structure

**Sprint Attributes**:

- Sprint number/name
- Start date
- End date
- Duration (typically 1-2 weeks)
- Goal/objective
- Capacity (total story points team can commit)
- Committed tasks
- Team members

**Sprint States**:

- **Planning**: Not yet started, tasks being assigned
- **Active**: In progress, team working
- **Completed**: Ended, retrospective held

---

### 6.2 Sprint Planning

**Planning Process**:

1. PM creates new sprint
2. Team reviews Backlog
3. Team selects tasks based on capacity
4. Tasks move from Backlog to sprint
5. Team commits to sprint goal
6. Sprint starts

**Capacity Planning**:

- Calculate team capacity (hours available)
- Convert to story points (based on velocity)
- Commit only what team can deliver
- Leave buffer (80% rule)

**Task Selection Criteria**:

- Priority
- Dependencies
- Team member availability
- Task size fits in sprint
- Alignment with sprint goal

---

### 6.3 Sprint Execution

**Daily Activities**:

- Team members work on assigned tasks
- Tasks move through workflow states
- Daily standups (optional, external to system)
- Progress tracked automatically
- Burndown updated

**Mid-Sprint Adjustments**:

- Add tasks if team ahead
- Remove tasks if team behind
- Rebalance workload
- Address blockers

---

### 6.4 Sprint Completion

**End of Sprint**:

- All In Progress tasks reviewed
- Incomplete tasks moved to next sprint or Backlog
- Sprint marked as Completed
- Velocity calculated (points completed)
- Sprint retrospective held (external)
- Metrics archived

**Sprint Metrics**:

- Planned points vs completed points
- Completion rate percentage
- Velocity (points per sprint)
- Average cycle time
- Blocker count and resolution time

---

## 7. Task Views & Filters

### 7.1 Default Views

**My Work** (Default for team members):

- Shows only tasks assigned to logged-in user
- Grouped by status
- Sorted by priority and due date

**Team Board** (Default for PM):

- Shows all team tasks
- Grouped by status
- Filtered by current sprint

**Backlog View**:

- Shows all tasks not in sprint
- Sorted by priority
- Available for sprint planning

**Sprint View**:

- Shows tasks in specific sprint
- Burndown chart
- Sprint progress

---

### 7.2 Grouping Options

Tasks can be grouped by:

- **Status**: Backlog, To Do, In Progress, etc.
- **Assignee**: All tasks per team member
- **Sprint**: All tasks per sprint
- **Priority**: Urgent, High, Medium, Low
- **Project**: All tasks from same project
- **Label**: Custom labels/tags
- **None**: Flat list

---

### 7.3 Filtering Options

Tasks can be filtered by:

- **Status**: Select one or more states
- **Assignee**: Select team member(s)
- **Sprint**: Select sprint(s) or "No sprint"
- **Priority**: Select priority level(s)
- **Story Points**: Range (e.g., 3-5 points)
- **Project**: Select parent project(s)
- **Labels**: Select one or more labels
- **Date Range**: Created or Due date ranges
- **Search**: Text search in title/description
- **Has Blocker**: Show only blocked tasks
- **Overdue**: Show only past due date

---

### 7.4 Sorting Options

Tasks can be sorted by:

- **Priority**: Urgent → Low (default)
- **Due Date**: Soonest first
- **Story Points**: Smallest/Largest first
- **Age**: Oldest/Newest first
- **Last Updated**: Most recently changed
- **Manual**: Drag-and-drop custom order (in Backlog)

---

## 8. Task Board Layouts

### 8.1 Kanban Board Layout

**Columns**: Backlog | To Do | In Progress | Code Review | In Review | Done

**Features**:

- Drag-and-drop between columns
- WIP (Work In Progress) limits optional
- Swimlanes (group by assignee, priority, project)
- Collapsible columns
- Card compact or expanded view

**Card Display**:

- Task ID and title
- Assignee avatar
- Story points badge
- Priority indicator
- Sprint label (if assigned)
- Blocker icon (if blocked)
- Time logged
- Comments count
- Attachments count

---

### 8.2 List View Layout

**Table Format**: Columns: Checkbox, ID, Title, Assignee, Status, Points,
Sprint, Due Date, Actions

**Features**:

- Sortable columns
- Bulk selection
- Inline editing (some fields)
- Expandable rows for details
- Pagination

---

### 8.3 Calendar View Layout

**Calendar Display**:

- Tasks plotted by due date
- Color-coded by status or priority
- Day/Week/Month view
- Drag to adjust due date
- Multiple tasks per date

---

### 8.4 Timeline View Layout

**Gantt-Style Timeline**:

- Tasks with duration bars
- Dependencies shown
- Current sprint highlighted
- Milestones marked
- Today indicator

---

## 9. Task Creation

### 9.1 Quick Task Creation

**Quick Add** (Minimal fields):

- Title (required)
- Assignee
- Priority
- Story points
- Click "Create" → Task goes to Backlog

**Use Case**: Rapid task creation during grooming or standup

---

### 9.2 Full Task Creation

**Detailed Form**:

**Basic Information**:

- Title (required)
- Description (rich text)
- Story points (required)
- Priority (required)
- Assignee (required)

**Context**:

- Related project (optional)
- Related request (optional)
- Labels/tags

**Planning**:

- Sprint assignment
- Due date
- Estimated hours

**Details**:

- Acceptance criteria
- Subtasks checklist
- Dependencies
- Attachments

**Action**: "Create Task" or "Create & Add Another"

---

### 9.3 Task from Template

**Common Task Types**:

- Bug fix template
- Feature development template
- Design task template
- QA test template
- Documentation template

**Template Includes**:

- Pre-filled description structure
- Standard acceptance criteria
- Typical subtasks
- Estimated story points

---

## 10. Task Details Panel

### 10.1 Task Detail View

**Opens when clicking task card/row**

**Layout**:

```
Task Header
- Task ID and Title
- Status badge
- Priority indicator
- Edit button
- More actions (...)

Main Content (Tabs or Sections)
- Details
- Activity
- Time Tracking
- Subtasks
- Related Items

Sidebar
- Assignee
- Story points
- Sprint
- Due date
- Labels
- Parent project
- Quick actions
```

---

### 10.2 Details Section

**Task Information**:

- Full description (editable)
- Acceptance criteria (checklist)
- Attachments (upload/download)
- Dependencies (list of blocking/blocked tasks)
- Metadata (created date, created by, last updated)

---

### 10.3 Activity Section

**Activity Stream**:

- Chronological list of all events
- Status changes
- Assignments
- Comments
- Time logs
- Attachments added
- Field edits

**Comment Thread**:

- Add comments
- @mention team members
- Attach files
- Format text
- Reply to comments

---

### 10.4 Time Tracking Section

**Time Logs**:

- List of all time entries
- Date, duration, user, notes
- Running timer for active work
- Total time logged
- Time remaining (if estimated)

**Time Entry Actions**:

- Start timer
- Stop timer
- Manual time entry
- Edit/delete entries (own entries only)

---

### 10.5 Subtasks Section

**Subtask Checklist**:

- List of smaller steps within task
- Checkbox for completion
- Add/remove subtasks
- Progress percentage based on completed subtasks
- Reorder subtasks

**Subtask Attributes**:

- Title
- Assignee (optional, can differ from parent)
- Completion status

---

### 10.6 Related Items Section

**Relationships**:

- Parent project (if applicable)
- Original request (if from Intake)
- Dependencies (blocks/blocked by)
- Related tasks (similar or connected work)
- Change requests linked to this task

**Navigation**:

- Click to view related item
- Breadcrumb trail
- Back to task list

---

## 11. Bulk Operations

### 11.1 Bulk Selection

**Selection Methods**:

- Checkbox column in list view
- Select all visible
- Select by filter
- Shift-click range selection

**Selected Indicator**: "X tasks selected" with count

---

### 11.2 Bulk Actions Available

**Status Changes**:

- Move to [Status]
- Assign to sprint
- Remove from sprint

**Assignments**:

- Assign to [Team Member]
- Reassign to [Team Member]
- Unassign

**Attributes**:

- Change priority
- Add label
- Remove label
- Set due date

**Other**:

- Export selected tasks
- Delete tasks (Admin only)

---

## 12. Time Tracking

### 12.1 Time Logging Methods

**Timer-Based**:

- Click "Start Timer" on task
- Timer runs in background
- Click "Stop Timer" to log time
- System records duration automatically
- Add notes on what was done

**Manual Entry**:

- Click "Log Time"
- Enter duration (hours/minutes)
- Select date (today default)
- Add notes (optional)
- Save entry

**External Integration** (Optional):

- Import from time tracking tools
- Sync with calendar
- API for external timers

---

### 12.2 Time Tracking Views

**Per Task**:

- Total time logged on task
- Time by user (if multiple)
- Time entries list
- Compare to estimate

**Per User**:

- Today's logged time
- This week's logged time
- Time by task
- Time by project

**Per Sprint**:

- Total time logged in sprint
- Time by team member
- Time by task
- Burnup/burndown by hours

---

### 12.3 Time Reports

**Individual Time Report**:

- User's time for date range
- Breakdown by task
- Breakdown by project
- Total billable hours

**Team Time Report**:

- All team time for date range
- By team member
- By task/project
- Utilization percentage

**Project Time Report**:

- All time on project tasks
- By team member
- By task
- Compare to budget

---

## 13. Sprint Analytics

### 13.1 Burndown Chart

**Purpose**: Show remaining work over sprint duration

**Axes**:

- X-axis: Days in sprint
- Y-axis: Story points remaining

**Lines**:

- Ideal burndown (linear from start to zero)
- Actual burndown (real progress)
- Scope changes (if scope added/removed)

**Indicators**:

- Today marker
- Projected completion date
- Ahead/behind schedule

---

### 13.2 Burnup Chart

**Purpose**: Show work completed over time

**Axes**:

- X-axis: Days in sprint
- Y-axis: Story points completed

**Lines**:

- Target line (total committed points)
- Actual completed (cumulative)
- Scope line (if scope changed)

**Indicators**:

- Completion percentage
- Velocity trend

---

### 13.3 Velocity Chart

**Purpose**: Show team velocity over multiple sprints

**Display**:

- Bar chart per sprint
- Planned vs Completed story points
- Average velocity line
- Trend indicator

**Insights**:

- Velocity stability
- Over/under commitment patterns
- Team capacity trends

---

### 13.4 Cycle Time Distribution

**Purpose**: Show how long tasks take to complete

**Display**:

- Histogram of cycle times
- Average cycle time
- Median cycle time
- By story point size

**Insights**:

- Identify bottlenecks
- Predictability of delivery
- Outliers requiring attention

---

### 13.5 Cumulative Flow Diagram

**Purpose**: Show distribution of tasks across states over time

**Display**:

- Area chart with time on X-axis
- Stacked areas per state
- See accumulation in any state

**Insights**:

- Identify bottlenecks (expanding areas)
- Stable flow vs unstable
- WIP trends

---

## 14. Task Dependencies

### 14.1 Dependency Types

**Blocks**: This task must complete before another can start

**Blocked By**: This task cannot start until another completes

**Related**: Tasks are connected but not dependent

---

### 14.2 Dependency Management

**Creating Dependencies**:

- In task details, add dependency
- Search for task by ID or title
- Select dependency type
- Save

**Dependency Validation**:

- Prevent circular dependencies
- Warn if blocking task not started
- Alert if dependency causing delay

**Dependency Visualization**:

- Dependency graph (network diagram)
- Shows all related tasks
- Highlights critical path
- Identify blocked tasks

---

### 14.3 Dependency Alerts

**Blocker Alerts**:

- Task cannot start (blocked by incomplete task)
- Blocking task delayed (impacts dependent tasks)
- Dependency chain at risk

**Actions**:

- Remove dependency (if no longer needed)
- Escalate blocker
- Adjust timeline

---

## 15. Labels & Tags

### 15.1 Label System

**Label Types**:

- **Category**: frontend, backend, design, qa, devops
- **Type**: bug, feature, enhancement, chore
- **Tech Stack**: react, python, aws, database
- **Custom**: team-defined labels

**Label Attributes**:

- Name
- Color (for visual distinction)
- Description

---

### 15.2 Label Usage

**Applying Labels**:

- Add multiple labels per task
- Search/autocomplete label names
- Create new label on-the-fly

**Filtering by Labels**:

- Filter tasks by one or more labels
- Boolean operations (AND/OR)
- Exclude labels

**Label Management**:

- Admin can create/edit/delete labels
- Rename label (updates all tasks)
- Merge labels
- Archive unused labels

---

## 16. Notifications & Alerts

### 16.1 Task Assignment Notifications

**When**: Task assigned to user

**Recipients**: Assignee

**Content**: Task ID, title, assigner, due date, sprint

**Actions**: View task, Accept, Request clarification

---

### 16.2 Status Change Notifications

**When**: Task status changes

**Recipients**: Assignee, PM, stakeholders (if significant state like Done)

**Content**: Task ID, title, old status → new status, who changed it

---

### 16.3 @Mention Notifications

**When**: User @mentioned in comment

**Recipients**: Mentioned user

**Content**: Comment text, task context, commenter

**Actions**: Reply, View task

---

### 16.4 Blocker Notifications

**When**: Task marked as blocked

**Recipients**: Assignee, PM, blocker owner

**Content**: Task blocked, reason, who can unblock

**Actions**: View task, Address blocker, Escalate

**Frequency**: Immediate, then daily reminders until unblocked

---

### 16.5 Due Date Notifications

**When**: Task approaching due date or overdue

**Recipients**: Assignee, PM

**Content**: Task ID, title, due date

**Schedule**:

- 2 days before due
- Day of due date
- Daily after due date (overdue)

---

### 16.6 Sprint Notifications

**Sprint Start**: Notify team when sprint begins

**Sprint End**: Notify team 1 day before sprint ends

**Mid-Sprint**: Alert if sprint appears at risk (velocity behind)

---

## 17. Search & Quick Find

### 17.1 Global Search

**Search Scope**: All tasks user can access

**Search Fields**:

- Task ID (exact match)
- Title (partial match)
- Description (full text)
- Comments

**Search Features**:

- Auto-suggest as typing
- Recent searches saved
- Advanced search with operators

---

### 17.2 Quick Jump

**Jump to Task**: Type task ID to open directly

**Keyboard Shortcut**: Cmd/Ctrl + K opens quick finder

**Recent Tasks**: Shows recently viewed tasks

---

### 17.3 Saved Searches

**Save Filters**: Save complex filter combinations

**Named Searches**: "My High Priority", "Bugs in Sprint"

**Quick Access**: Dropdown or sidebar for saved searches

---

## 18. Integration Points

### 18.1 Integration with Intake

**Task Creation**:

- Tasks created from Intake routing (0-8 pts)
- All request data transferred
- Original request linked

**Bidirectional Visibility**:

- View original request from task
- View task from request (in Intake archive)

---

### 18.2 Integration with Projects

**Project Task Creation**:

- Tasks created from project breakdown
- Parent project linked
- Task completion updates project progress

**Context Visibility**:

- Task shows "Part of Project: [Name]"
- Click to view project details
- Project milestones visible in task context

---

### 18.3 Integration with Team

**Capacity Tracking**:

- Tasks assigned to team members
- Workload calculated from assigned tasks
- Capacity alerts when overloaded

**Availability**:

- Respect team member PTO/unavailability
- Don't assign tasks when unavailable

---

### 18.4 Integration with Financials

**Time Tracking**:

- Time logged on tasks feeds into budget
- Calculate cost based on time × rate
- Track billable vs non-billable time

**Budget Alerts**:

- Warn if task time exceeds estimate
- Project budget impacts from task time

---

## 19. Mobile Experience

### 19.1 Mobile Task Board

**Simplified Board**:

- Swipeable columns
- Tap to view task details
- Long-press for quick actions
- Pull to refresh

**Quick Actions**:

- Swipe right: Start work (To Do → In Progress)
- Swipe left: More options
- Tap timer icon: Start/stop timer

---

### 19.2 Mobile Task Details

**Optimized Layout**:

- Bottom sheet or full screen
- Key info at top
- Collapsible sections
- Large touch targets

**Mobile-Specific Features**:

- Voice comments
- Photo attachments from camera
- Quick time logging
- Offline mode with sync

---

## 20. Technical Requirements

### 20.1 Performance Requirements

**Page Load**:

- Task board loads in <2 seconds
- Task details loads in <1 second
- Board refresh in <500ms

**Real-Time Updates**:

- Status changes appear within 5 seconds
- New tasks appear within 10 seconds
- Timer updates every second

**Data Volume**:

- Support 10,000+ tasks in system
- Support 500+ tasks per sprint
- Board performs with 100+ tasks visible

---

### 20.2 Data Requirements

**Task Storage**:

- All tasks retained indefinitely
- Full history preserved
- Comments archived
- Time logs preserved

**Audit Trail**:

- All task changes logged
- Status transitions recorded
- Assignments tracked
- Time logs cannot be deleted (only marked as error)

---

### 20.3 Security Requirements

**Access Control**:

- Users see only tasks they can access
- Team members see assigned tasks
- PM sees team tasks
- Admin sees all tasks

**Data Protection**:

- Task data encrypted at rest
- Time logs protected from tampering
- Audit trail immutable

---

## 21. User Scenarios

### 21.1 Team Member Daily Workflow

**Scenario: Developer Starts Day**

**When** developer logs in  
**Then** navigates to Work section  
**And** sees "My Work" view (default)  
**And** tasks grouped by status  
**And** sees 3 tasks: 1 In Progress, 2 To Do  
**And** clicks on In Progress task  
**Then** task details open  
**And** reviews yesterday's progress  
**And** clicks "Start Timer"  
**And** timer begins running  
**And** developer continues work

**When** task complete  
**Then** developer stops timer  
**And** clicks "Move to Code Review"  
**And** assigns reviewer (Noah)  
**And** task moves to Code Review column  
**And** Noah receives notification

---

### 21.2 Sprint Planning

**Scenario: PM Plans Sprint**

**When** PM ready to plan Sprint 25  
**Then** navigates to Work section  
**And** clicks "Plan Sprint"  
**And** creates Sprint 25 (Nov 27 - Dec 11)  
**And** sets sprint goal: "Complete payment integration"  
**And** calculates team capacity: 40 points  
**Then** views Backlog  
**And** filters by High priority  
**And** reviews top tasks with team  
**And** drags tasks from Backlog to Sprint 25  
**And** system shows running total: 38 points  
**And** team commits to sprint  
**And** PM clicks "Start Sprint"  
**Then** sprint status: Active  
**And** all tasks move to To Do  
**And** team receives sprint start notification

---

### 21.3 Task Blocked

**Scenario: Developer Encounters Blocker**

**When** developer working on task #234  
**And** realizes API documentation needed  
**And** cannot proceed without it  
**Then** clicks "Mark as Blocked"  
**And** modal opens: "What's blocking this task?"  
**And** developer types: "Waiting on API documentation from backend team"  
**And** selects blocker type: "Waiting on dependency"  
**And** assigns blocker owner: Backend Team  
**And** clicks "Save"  
**Then** task moves to Blocked status  
**And** task shows red blocker indicator  
**And** PM receives notification immediately  
**And** backend team receives notification  
**And** developer picks up different task meanwhile

**When** backend team provides documentation (3 days later)  
**Then** backend lead clicks "Resolve Blocker"  
**And** task returns to In Progress  
**And** developer receives notification  
**And** developer resumes work

---

### 21.4 Code Review Workflow

**Scenario: Peer Review Process**

**When** Emma completes task and moves to Code Review  
**Then** assigns Noah as reviewer  
**And** Noah receives notification  
**And** Noah navigates to Code Review column  
**And** sees Emma's task  
**And** clicks to view details  
**And** sees link to pull request  
**And** reviews code in GitHub/GitLab

**When** Noah finds issues  
**Then** Noah adds comments in code review  
**And** clicks "Request Changes" in task  
**And** task returns to In Progress  
**And** Emma receives notification with feedback  
**And** Emma addresses feedback  
**And** moves task back to Code Review

**When** Noah approves  
**Then** clicks "Approve" in task  
**And** task moves to In Review (for QA)  
**And** QA receives notification

---

### 21.5 Sprint Completion

**Scenario: End of Sprint**

**When** Sprint 25 end date reached  
**Then** PM reviews sprint status  
**And** sees 7 of 8 tasks Done (1 still In Progress)  
**And** sees velocity: 35 points (committed 38)  
**And** PM marks incomplete task  
**And** moves task to Sprint 26  
**And** clicks "Complete Sprint"  
**Then** system calculates final metrics:

- Completion rate: 88%
- Velocity: 35 points
- Average cycle time: 4.2 days  
  **And** sprint marked as Completed  
  **And** tasks archived in completed sprint  
  **And** retrospective scheduled (external)

---

### 21.6 Change Request Impact

**Scenario: Change Request Added Mid-Sprint**

**When** change request approved in Intake  
**And** routed to Work as task  
**And** task appears in Backlog  
**And** client marks as urgent  
**Then** PM reviews change request task  
**And** sees 5 story points  
**And** realizes this impacts current sprint  
**And** PM discusses with team  
**And** team agrees to add to Sprint 25  
**And** PM moves task from Backlog to Sprint 25  
**And** task assigned to Ava  
**And** sprint total now: 43 points (was 38)  
**And** team aware of increased commitment  
**And** PM monitors sprint health closely

---

## 22. Acceptance Criteria

### 22.1 Functional Acceptance

- [ ] Tasks created from Intake appear in Backlog
- [ ] Tasks created from Projects appear in Backlog with project link
- [ ] All workflow states functional (6 states + Blocked)
- [ ] Sprint planning workflow complete
- [ ] Drag-and-drop works in Kanban board
- [ ] Time tracking (timer and manual) works
- [ ] Task dependencies prevent circular references
- [ ] Bulk operations work on selected tasks
- [ ] Filters and sorting function correctly
- [ ] Mobile app is functional

### 22.2 Performance Acceptance

- [ ] Board loads in <2 seconds
- [ ] Task details load in <1 second
- [ ] Supports 10,000+ tasks
- [ ] Board with 100+ tasks performs well
- [ ] Real-time updates within 5 seconds

### 22.3 Integration Acceptance

- [ ] Tasks from Intake integrate correctly
- [ ] Project tasks link properly
- [ ] Time tracking feeds into budgets
- [ ] Team capacity calculated from tasks

### 22.4 Usability Acceptance

- [ ] Team members find assigned tasks easily
- [ ] Sprint planning completes in <30 minutes
- [ ] Task status updates in <3 clicks
- [ ] Mobile experience is intuitive

---

## 23. Glossary

**Task**: Executable work item (0-8 story points)

**Sprint**: Fixed time period for completing committed tasks

**Backlog**: Collection of tasks not yet assigned to sprint

**Velocity**: Story points completed per sprint

**Cycle Time**: Duration from To Do to Done

**Lead Time**: Duration from created to Done

**WIP (Work In Progress)**: Tasks currently being worked on

**Burndown**: Chart showing remaining work over sprint

**Blocker**: Impediment preventing task progress

**Story Points**: Estimate unit using Fibonacci sequence

---

## 24. Approval & Sign-Off

**Specification Prepared By**: [Name]  
**Date**: [Date]

**Reviewed By**: [Name]  
**Date**: [Date]

**Approved By**: [Name]  
**Date**: [Date]

---

**End of Specification Document**
