# Overview Navigation - Specification Document

## Document Information

- **Component**: Overview (Role-Based Dashboard)
- **Version**: 1.0
- **Last Updated**: November 23, 2025
- **Status**: Draft

---

## 1. Purpose & Objectives

### 1.1 Primary Purpose

The Overview navigation serves as a role-based command center that provides each user with a personalized dashboard displaying the most relevant information, actions, and metrics for their specific role within the Skyll platform.

### 1.2 Core Objectives

- Reduce time-to-action by surfacing critical information immediately upon login
- Eliminate navigation complexity by providing role-specific views
- Enable quick decision-making through real-time data and visual indicators
- Provide contextual awareness of team status, project health, and pending actions
- Support multiple work styles through customizable widget arrangements

### 1.3 Success Metrics

- Users can identify their top priority within 5 seconds of viewing Overview
- 80% of daily actions are accessible from Overview without additional navigation
- Dashboard load time under 2 seconds
- Users customize their dashboard within first week of use
- Reduction in "where do I find X?" support requests by 60%

---

## 2. User Roles & Access Levels

### 2.1 Supported Roles

1. **Admin/Project Owner (PO)** - Full system visibility and control
2. **Project Manager (PM)** - Cross-project coordination and team management
3. **Developer** - Individual contributor focused on engineering tasks
4. **Designer** - Individual contributor focused on creative tasks
5. **QA Tester** - Quality assurance and testing focus
6. **Client** - External stakeholder with limited project visibility

### 2.2 Role-Based Permissions

- Each role sees only data relevant to their scope of work
- Admins can switch between role views for testing and support
- Clients have read-only access with restricted data visibility
- Team members cannot view financial data unless explicitly granted
- All users can customize their personal dashboard layout

---

## 3. Core Features & Components

### 3.1 Quick Actions Bar

**Purpose**: Provide immediate access to the most common actions for each role

**Capabilities**:

- Contextual action buttons based on user role
- Single-click access to frequently used functions
- Dynamic button availability based on user permissions
- Visual confirmation of action completion
- Keyboard shortcuts for power users

**Role-Specific Actions**:

- **Admin**: New Request, Create Task, Create Invoice, Add User, Generate Report
- **PM**: New Request, Create Task, Assign Sprint, Schedule Meeting, Send Update
- **Developer**: Start Timer, Log Time, Create Task, View Sprint, Push Code
- **Designer**: Start Timer, Log Time, Upload Asset, Request Feedback
- **QA**: Create Bug, Start Test, Log Time, Request Retest
- **Client**: New Request, View Invoice, Download Deliverable

### 3.2 Organization Health (Admin/PM Only)

**Purpose**: Provide high-level system health indicators

**Metrics Displayed**:

- Active Projects count with trend indicator
- Active Tasks count with distribution
- Team Utilization percentage with capacity analysis
- Revenue Month-to-Date with comparison to target
- Client satisfaction score (if implemented)
- System resource usage and performance

**Visual Indicators**:

- Green: Healthy (90-100% target)
- Yellow: Warning (70-89% target)
- Red: Critical (below 70% target)
- Trend arrows showing 7-day and 30-day movement

### 3.3 Performance Trends

**Purpose**: Show directional movement of key metrics over time

**Trend Types**:

- Velocity trend (last 6 sprints) - Story points completed
- Completion rate trend - Tasks completed vs created
- Budget utilization trend - Spend rate vs plan
- Team productivity trend - Output per team member
- Client response time trend - Average feedback turnaround

**Visualization**:

- Mini line charts with last 30 days of data
- Percentage change indicators with directional arrows
- Color-coded performance zones
- Clickable to expand to full analytics view

### 3.4 Critical Alerts

**Purpose**: Surface urgent issues requiring immediate attention

**Alert Types**:

- Projects over budget (threshold: 10% or more)
- Projects behind schedule (threshold: 2+ days overdue)
- Team members overloaded (threshold: 110%+ capacity)
- Overdue tasks (any task past due date)
- Requests on hold exceeding threshold (5+ days)
- Invoices overdue (30+ days)
- System errors or downtime
- Security alerts or unauthorized access attempts

**Alert Prioritization**:

- Critical (red): Immediate action required
- Warning (yellow): Attention needed soon
- Info (blue): Awareness only

**Alert Actions**:

- Click to navigate to relevant item
- Dismiss temporarily (snooze)
- Mark as resolved
- Assign to team member
- Bulk actions for multiple alerts

### 3.5 My Work Today (Individual Contributors)

**Purpose**: Show user's immediate work queue with priority order

**Task Display Elements**:

- Task title with clickable link
- Current status with color indicator
- Story point estimate
- Due date with urgency indicator
- Time logged today
- Blocker indicators
- Related project/client name
- Assigned team members (if collaborative)

**Sorting Options**:

- Due date (default)
- Priority level
- Story points
- Project grouping
- Custom manual ordering

**Filtering**:

- Show only high priority
- Show only due today
- Show only blocked items
- Show specific project tasks

### 3.6 Current Sprint Information

**Purpose**: Provide sprint context and progress tracking

**Sprint Metrics**:

- Sprint number and name
- Start and end dates
- Days remaining
- Story points completed vs committed
- Progress bar visualization
- Velocity comparison to team average
- Sprint goal statement
- Burndown chart (mini view)

**Sprint Health Indicators**:

- On track (green): Progress matches timeline
- At risk (yellow): Behind by 10-20%
- Critical (red): Behind by 20%+ or scope change needed

### 3.7 Upcoming Deadlines Calendar

**Purpose**: Visual timeline of approaching due dates

**Calendar Display**:

- Next 7-14 days visible
- Color-coded by item type (project/task/meeting/invoice)
- Multiple items per date collapsed with count
- Hover to see details
- Click to navigate to item
- Export to external calendar option

**Event Types**:

- Project delivery dates
- Task due dates
- Sprint milestones (start/end/demo/retro)
- Client meetings
- Invoice due dates
- Team member availability (PTO, holidays)
- System maintenance windows

### 3.8 Recent Activity Feed

**Purpose**: Real-time stream of relevant system activity

**Activity Types**:

- Task completions
- Status changes
- New comments and mentions
- File uploads
- Approvals granted/denied
- Time logged
- Sprint started/completed
- Invoice sent/paid
- User assignments

**Feed Features**:

- Last 15-20 activities shown
- Auto-refresh every 30 seconds
- Filter by activity type
- Filter by project
- Filter by team member
- "Mark all as read" functionality
- Click activity to navigate to source

**Visibility Rules**:

- Users see activities related to their projects/tasks
- PMs see activities for all projects they manage
- Admins see all system activities
- Clients see only activities for their projects

### 3.9 Team Status (PM/Admin)

**Purpose**: Real-time team capacity and availability overview

**Team Member Display**:

- Name with avatar
- Current status (available/busy/overloaded/on leave)
- Capacity utilization percentage
- Active task count
- Current sprint allocation
- Availability calendar (hover to see)
- Contact options (chat/email/call)

**Status Definitions**:

- Available: 0-70% capacity (green)
- Busy: 71-100% capacity (yellow)
- Overloaded: 101%+ capacity (red)
- On Leave: Scheduled time off (gray)

**Team Metrics**:

- Total team size
- Currently available count
- Overloaded count
- On leave count
- Aggregate utilization percentage

### 3.10 Communication Hub

**Purpose**: Centralize all communication requiring attention

**Notification Types**:

- Unread messages count
- @mentions needing response
- Pending approvals (design/code/budget)
- Client feedback awaiting action
- Comment threads user is following
- Direct messages
- System announcements

**Hub Features**:

- Grouped by urgency (now/today/this week)
- Mark as read/unread
- Archive notifications
- Quick reply without leaving Overview
- Filter by source (comments/messages/mentions)
- Notification preferences link

### 3.11 Financial Snapshot (Admin/PM/Client)

**Purpose**: High-level financial health indicators

**Metrics by Role**:

**Admin/PM View**:

- Outstanding invoices (total amount)
- Billed month-to-date
- Top client by revenue
- Profit margin percentage
- Budget burn rate by project
- Overdue payments
- Upcoming invoice schedule

**Client View**:

- Current balance owed
- Payment history
- Invoices pending approval
- Next payment due date
- Project budget status
- Download invoice links

### 3.12 Intake Pipeline Status (Admin/PM)

**Purpose**: Monitor request flow through intake process

**Pipeline Stages**:

- In Treatment: Request count with average age
- On Hold: Request count with average wait time
- Estimation: Request count with pending estimator
- Ready: Request count awaiting routing decision

**Pipeline Health**:

- Average time per stage
- Bottleneck identification
- Aging requests (color-coded by days waiting)
- Capacity to accept new requests

### 3.13 Risk Indicators & Health Scores

**Purpose**: Proactive identification of potential issues

**Project Health Score Components**:

- Schedule performance (on time delivery rate)
- Budget performance (spend vs plan)
- Quality metrics (bug rate, client satisfaction)
- Team morale (if captured)
- Scope stability (change request frequency)

**Scoring System**:

- 90-100%: Green (healthy)
- 70-89%: Yellow (monitor)
- Below 70%: Red (intervention needed)

**Calculated Indices**:

- Schedule Performance Index (SPI): Earned value / Planned value
- Cost Performance Index (CPI): Earned value / Actual cost
- Budget Burn Rate: % budget used / % timeline elapsed

### 3.14 Blockers & Notifications

**Purpose**: Surface impediments preventing work progress

**Blocker Types**:

- Waiting on external dependency (API docs, client feedback)
- Code review requested
- Merge conflicts requiring resolution
- Build/deployment failures
- Resource unavailability
- Approval bottlenecks

**Blocker Display**:

- Item title with blocking issue description
- Days blocked count
- Who/what is blocking
- Escalation options
- Quick resolution actions where possible

### 3.15 Customizable Widgets

**Purpose**: Allow users to personalize their dashboard layout

**Customization Options**:

- Add/remove widgets from available library
- Resize widgets (small/medium/large)
- Rearrange via drag-and-drop
- Create multiple dashboard views (tabs)
- Save custom configurations
- Share configurations with team
- Reset to default layout

**Widget Library**:

- All standard dashboard components
- Custom reports (if created)
- External integrations (calendar, time tracking)
- Announcement/message boards
- Quick links to frequent destinations

**Persistence**:

- User preferences saved per account
- Synced across devices
- Version controlled for rollback
- Export/import configurations

### 3.16 Focus Mode

**Purpose**: Minimize distractions for deep work

**Focus Mode Features**:

- Hides all widgets except "My Work Today"
- Displays only the single active task
- Silences non-critical notifications
- Shows timer for active task
- Optional Pomodoro timer integration
- Keyboard shortcut to toggle (F11 or custom)
- Scheduled focus times (e.g., 2-4pm daily)

**Exit Conditions**:

- Manual disable by user
- Scheduled end time reached
- Critical alert received (budget/security)

### 3.17 System Health (Admin Only)

**Purpose**: Monitor platform technical health

**System Metrics**:

- Platform status (operational/degraded/down)
- Active user count vs license limit
- Database backup status and timestamp
- System uptime percentage
- API response times
- Storage utilization
- Scheduled maintenance notices

---

## 4. User Scenarios

### 4.1 Admin/Project Owner Scenarios

#### Scenario 1: Morning Check-In

**When** the Admin logs in at start of day  
**Then** the Overview displays critical alerts at the top  
**And** shows overnight activity in Recent Activity feed  
**And** highlights any projects that moved to "at risk" status  
**And** displays team members who are overloaded  
**And** shows requests that aged beyond threshold in Intake

#### Scenario 2: Resource Reallocation

**When** the Admin sees a team member is overloaded (red indicator)  
**Then** they can click the team member name  
**And** see all assigned tasks with story points  
**And** identify tasks to reassign  
**And** drag-drop task to available team member  
**And** system recalculates capacity immediately

#### Scenario 3: Financial Urgency

**When** an invoice becomes 30+ days overdue  
**Then** a critical alert appears in Financial Snapshot  
**And** the alert includes client name and amount  
**And** clicking the alert navigates to invoice details  
**And** Quick Action appears to "Send Reminder"

#### Scenario 4: Client Escalation

**When** a client request has been on hold for 5+ days  
**Then** a warning alert appears  
**And** the alert shows request title and days waiting  
**And** Quick Action appears to "Resume" or "Contact Client"  
**And** clicking navigates to Intake with request highlighted

### 4.2 Project Manager Scenarios

#### Scenario 1: Sprint Planning

**When** a PM prepares for sprint planning meeting  
**Then** Overview shows Current Sprint completion percentage  
**And** displays Available capacity in Team Status  
**And** shows Ready tasks in Intake Pipeline  
**And** highlights team members available for new assignments  
**And** provides Quick Action to "Plan Next Sprint"

#### Scenario 2: At-Risk Project Response

**When** a project health score drops below 70% (red)  
**Then** the project appears in Critical Alerts  
**And** shows specific risk factors (schedule/budget/quality)  
**And** PM can click to see detailed project view  
**And** Recent Activity shows recent issues on that project  
**And** Team Status shows if resource constraints exist

#### Scenario 3: Client Communication

**When** client feedback is received  
**Then** notification appears in Communication Hub  
**And** shows client name and project  
**And** indicates if response is required  
**And** PM can quick reply from Overview  
**And** Activity Feed updates to show response sent

#### Scenario 4: Capacity Management

**When** a PM needs to assign new work  
**Then** Team Status widget shows current utilization  
**And** available team members are highlighted (green)  
**And** overloaded members are flagged (red)  
**And** clicking a team member shows their task list  
**And** PM can balance workload from Overview

### 4.3 Developer Scenarios

#### Scenario 1: Starting Daily Work

**When** a Developer logs in  
**Then** "My Work Today" shows prioritized task list  
**And** displays due today tasks at the top  
**And** shows time already logged today  
**And** indicates any blockers on tasks  
**And** provides "Start Timer" Quick Action for top task

#### Scenario 2: Sprint Progress Check

**When** Developer wants to check sprint status  
**Then** Current Sprint widget shows points completed  
**And** displays days remaining in sprint  
**And** shows progress bar with percentage  
**And** indicates if velocity is on track  
**And** lists remaining tasks in sprint

#### Scenario 3: Blocker Resolution

**When** Developer is blocked waiting on API documentation  
**Then** blocker appears in "Blockers & Notifications"  
**And** shows days blocked counter  
**And** indicates who can unblock (PM, external team)  
**And** provides Quick Action to "Escalate Blocker"  
**And** sends notification to responsible party

#### Scenario 4: Code Review Request

**When** another developer requests code review  
**Then** notification appears immediately  
**And** shows in Recent Activity feed  
**And** displays in Communication Hub with priority  
**And** clicking navigates to pull request  
**And** after review, removes from notifications

#### Scenario 5: Focus Time

**When** Developer activates Focus Mode  
**Then** Overview hides all widgets except active task  
**And** silences non-critical notifications  
**And** displays timer for current task  
**And** shows only task details and description  
**And** provides "Exit Focus" button

### 4.4 Designer Scenarios

#### Scenario 1: Feedback Management

**When** Designer logs in after client review  
**Then** Communication Hub shows approval notifications  
**And** indicates which deliverables need revisions  
**And** displays client comments inline  
**And** provides Quick Action to "Start Revisions"  
**And** updates status to "In Progress" automatically

#### Scenario 2: Multiple Project Juggling

**When** Designer works across multiple projects  
**Then** "My Work Today" groups tasks by project  
**And** color-codes by project for quick identification  
**And** shows due dates for each project  
**And** Designer can filter view to single project  
**And** time tracking shows hours per project

#### Scenario 3: Asset Upload

**When** Designer completes a deliverable  
**Then** Quick Action "Upload Asset" is prominent  
**And** clicking opens upload modal  
**And** Designer selects file and links to task  
**And** task status auto-updates to "In Review"  
**And** notification sent to PM and client

### 4.5 QA Tester Scenarios

#### Scenario 1: Test Queue Management

**When** QA Tester logs in  
**Then** "Ready for Testing" widget shows available tests  
**And** displays priority order  
**And** shows story point estimates  
**And** indicates which developer completed the work  
**And** provides Quick Action to "Start Test"

#### Scenario 2: Bug Tracking

**When** QA discovers a bug  
**Then** Quick Action "Create Bug" is available  
**And** bug links automatically to related task  
**And** developer receives notification immediately  
**And** bug appears in "Active Bugs" widget  
**And** team's bug count updates in real-time

#### Scenario 3: Regression Testing

**When** a bug fix is deployed  
**Then** notification appears in "Bugs to Verify"  
**And** shows original bug details  
**And** links to fix commit/PR  
**And** provides Quick Action to "Verify Fix"  
**And** status updates after verification

### 4.6 Client Scenarios

#### Scenario 1: Project Progress Check

**When** Client logs in to check status  
**Then** "Your Projects" widget shows all active projects  
**And** displays completion percentage  
**And** shows upcoming delivery dates  
**And** indicates if any action is required  
**And** provides Recent Updates feed

#### Scenario 2: Approval Required

**When** a deliverable awaits client approval  
**Then** "Action Required" section highlights it  
**And** shows preview of deliverable  
**And** provides Quick Action to "Approve" or "Request Changes"  
**And** approval triggers notification to team  
**And** project timeline updates automatically

#### Scenario 3: Invoice Payment

**When** Client receives new invoice  
**Then** Financial Snapshot shows balance owed  
**And** displays invoice due date  
**And** provides Quick Action to "View Invoice"  
**And** clicking shows itemized charges  
**And** payment link is prominently displayed

#### Scenario 4: New Request Submission

**When** Client wants to request new work  
**Then** Quick Action "New Request" is available  
**And** clicking opens request form  
**And** form pre-fills client information  
**And** submission creates Intake item immediately  
**And** Client receives confirmation message

---

## 5. Technical Requirements

### 5.1 Performance Requirements

- Dashboard must load within 2 seconds on standard connection
- Widget data must refresh automatically every 30 seconds
- Real-time updates must appear within 5 seconds of occurrence
- Search and filter operations must complete within 1 second
- Customization changes must save within 1 second

### 5.2 Data Requirements

- All data must reflect current system state accurately
- Historical trend data must cover minimum 30 days
- Activity feed must retain 30 days of history
- User customizations must persist indefinitely
- Data must sync across devices within 10 seconds

### 5.3 Security Requirements

- Users can only view data within their permission scope
- Role-based access control strictly enforced
- Client data must be isolated and not visible to other clients
- Financial data requires additional permission grants
- All API calls must be authenticated and authorized

### 5.4 Scalability Requirements

- System must support 1000+ concurrent users on Overview
- Widget loading must be asynchronous and independent
- Failed widget loads must not block other widgets
- System must handle 100,000+ activities in feed history
- Dashboard must support 50+ customizable widgets in library

### 5.5 Accessibility Requirements

- Full keyboard navigation support required
- Screen reader compatibility (WCAG 2.1 AA)
- Color-blind friendly status indicators (not relying on color alone)
- High contrast mode available
- Adjustable text sizes up to 200%

### 5.6 Responsive Design Requirements

- Functional on desktop (1920x1080 and above)
- Functional on tablet (768x1024)
- Functional on mobile (375x667 minimum)
- Widget layout must adapt to screen size
- Mobile view may prioritize/hide certain widgets

### 5.7 Integration Requirements

- Must integrate with authentication system for role detection
- Must connect to project management data store
- Must connect to time tracking system
- Must connect to financial/invoicing system
- Must support webhook notifications for real-time updates

### 5.8 Browser Compatibility

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- No Internet Explorer support required

---

## 6. Constraints & Limitations

### 6.1 Known Limitations

- Customization limited to provided widget library (no custom widgets initially)
- Activity feed limited to 30 days of history
- Real-time updates may have 5-second delay in high load
- Mobile view may have reduced functionality
- Export features limited to standard formats (PDF, CSV)

### 6.2 Technical Constraints

- Must work within existing technology stack (TypeScript, Next.js)
- Must use existing authentication/authorization system
- Must respect existing database schema
- Must maintain backward compatibility with existing APIs
- Must not exceed allocated server resources

### 6.3 Business Constraints

- Development must be completed in planned sprints
- Must not require additional third-party subscriptions
- Must work with current hosting infrastructure
- Must support existing user base without forced migration
- Must maintain data privacy compliance (GDPR, etc.)

---

## 7. Future Enhancements

### 7.1 Planned Features (Future Versions)

- AI-powered priority recommendations
- Predictive analytics for project risk
- Custom widget builder for power users
- Integration with external tools (Slack, JIRA, etc.)
- Mobile native applications
- Voice command interface
- Advanced reporting builder
- Gamification elements (achievements, streaks)

### 7.2 Consideration Items

- Multi-language support
- Dark mode theme
- Customizable color schemes
- Advanced notification rules engine
- Machine learning for workload balancing
- Client portal white-labeling
- Advanced time tracking with screenshots
- Video conferencing integration

---

## 8. Acceptance Criteria

### 8.1 Functional Acceptance

- All role-specific views display correctly
- All Quick Actions execute without errors
- All widgets load and refresh automatically
- Customization persists across sessions
- Notifications appear in real-time
- Navigation from Overview to target items works
- Filters and sorting function correctly

### 8.2 Performance Acceptance

- Dashboard loads in under 2 seconds
- Widget refresh occurs every 30 seconds
- No memory leaks after 8 hours of use
- Smooth animations (60fps)
- Concurrent user load testing passes

### 8.3 Security Acceptance

- Unauthorized access attempts blocked
- Role permissions strictly enforced
- Data isolation verified for clients
- SQL injection testing passes
- XSS vulnerability testing passes

### 8.4 Usability Acceptance

- Users can complete common tasks without training
- New users find critical information within 5 seconds
- Customization can be completed in under 2 minutes
- Mobile experience is functional and intuitive
- Accessibility audit passes with no critical issues

---

## 9. Glossary

**Widget**: A self-contained dashboard component displaying specific information or functionality

**Quick Action**: One-click button to perform common tasks directly from Overview

**Role-Based View**: Dashboard configuration that changes based on logged-in user's role

**Story Points**: Estimation unit using Fibonacci sequence (0, 1, 2, 3, 5, 8, 13, 20, 40, 100)

**Sprint**: Fixed time period (typically 1-2 weeks) for completing planned work

**Capacity**: Percentage of team member's available time allocated to tasks

**Utilization**: Percentage of capacity currently assigned/used

**Health Score**: Calculated metric (0-100%) indicating project status

**SPI (Schedule Performance Index)**: Ratio of earned value to planned value

**CPI (Cost Performance Index)**: Ratio of earned value to actual cost

**Blocker**: Impediment preventing task progress

**Critical Alert**: Highest priority notification requiring immediate attention

**Activity Feed**: Chronological list of recent system events

**Focus Mode**: Simplified view for distraction-free work

---

## 10. Approval & Sign-Off

**Specification Prepared By**: [Name]  
**Date**: [Date]

**Reviewed By**: [Name]  
**Date**: [Date]

**Approved By**: [Name]  
**Date**: [Date]

---

**End of Specification Document**
