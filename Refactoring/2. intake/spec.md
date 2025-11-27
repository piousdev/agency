# Intake Navigation - Specification Document

## Document Information

- **Component**: Intake (Request Management Pipeline)
- **Version**: 1.0
- **Last Updated**: November 23, 2025
- **Status**: Draft

---

## 1. Purpose & Objectives

### 1.1 Primary Purpose

The Intake navigation serves as the centralized gateway where all new work
requests enter the Skyll platform. It provides a structured workflow for
reviewing, triaging, estimating, and routing requests to the appropriate
execution pipeline (Projects or Work sections).

### 1.2 Core Objectives

- Standardize how all work requests enter the system
- Enable efficient triage and prioritization by Project Managers
- Facilitate accurate story point estimation by technical teams
- Automate routing decisions based on estimation (Projects vs Work)
- Maintain visibility and prevent requests from aging indefinitely
- Provide clients with transparent request status tracking
- Support both new requests and change requests for existing work

### 1.3 Success Metrics

- Average time in Intake pipeline: Under 3 days
- Percentage of requests with estimates within 24 hours: 90%+
- Zero requests aging beyond 7 days without action
- Client satisfaction with request submission process: 4.5/5+
- Accurate routing (correct classification as Project vs Task): 95%+
- Reduction in "lost" or forgotten requests: 100%

---

## 2. User Roles & Access Levels

### 2.1 Supported Roles

**Admin/Project Owner (PO)**:

- Full visibility across all Intake stages
- Can review, triage, estimate, and route any request
- Can override PM decisions
- Can configure Intake workflows and thresholds
- Can view capacity and pipeline analytics

**Project Manager (PM)**:

- Primary Intake managers
- Review and triage new requests
- Assign requests for estimation
- Make routing decisions (Projects vs Work)
- Move requests between stages
- Communicate with clients for clarification
- Monitor aging requests and capacity

**Team Members (Developer, Designer, QA)**:

- View requests in Estimation stage assigned to them
- Submit story point estimates
- Add technical notes and clarifications
- Flag technical blockers or dependencies
- Cannot move requests between stages (except estimation submission)

**Clients**:

- Submit new requests via form
- View status of their submitted requests
- Respond to information requests (On Hold stage)
- Receive notifications on request progress
- Cannot view other clients' requests
- Limited to read-only access except for submission and responses

### 2.2 Permission Matrix

| Action                 | Admin | PM  | Team | Client |
| ---------------------- | ----- | --- | ---- | ------ |
| Submit new request     | ✓     | ✓   | ✓    | ✓      |
| View all requests      | ✓     | ✓   | ✗    | ✗      |
| View own requests      | ✓     | ✓   | ✓    | ✓      |
| Review/Triage requests | ✓     | ✓   | ✗    | ✗      |
| Move to On Hold        | ✓     | ✓   | ✗    | ✗      |
| Assign for estimation  | ✓     | ✓   | ✗    | ✗      |
| Submit estimates       | ✓     | ✓   | ✓    | ✗      |
| Route to Projects/Work | ✓     | ✓   | ✗    | ✗      |
| Delete requests        | ✓     | ✓   | ✗    | ✗      |
| Configure workflows    | ✓     | ✗   | ✗    | ✗      |

---

## 3. Intake Pipeline Stages

### 3.1 Stage 1: In Treatment

**Purpose**: Initial holding area for all newly submitted requests awaiting PM
review and triage.

**Entry Criteria**:

- Request submitted via form (client or internal)
- All required fields completed
- Request automatically assigned to default PM or PM pool

**Activities**:

- PM reviews request details
- PM assesses urgency and priority
- PM categorizes request type (new feature, bug fix, change request, content,
  etc.)
- PM may contact requester for clarification
- PM makes initial feasibility assessment
- PM may reject/close obviously out-of-scope requests

**Exit Criteria**:

- PM confirms request is valid and in scope
- All necessary context is gathered
- Request ready for estimation OR needs more information

**Transitions**:

- To **On Hold**: If more information needed from requester
- To **Estimation**: If request is clear and ready for story points
- To **Rejected/Closed**: If request is invalid or out of scope

**Aging Threshold**: 2 days

- Alerts triggered if request remains in In Treatment beyond 2 days

---

### 3.2 Stage 2: On Hold

**Purpose**: Temporary parking for requests awaiting additional information or
decisions from requesters or external dependencies.

**Entry Criteria**:

- PM identifies missing information or clarification needed
- External dependency blocks progress
- Awaiting stakeholder decision
- Budget approval needed

**Activities**:

- PM documents what information is needed
- System sends notification to requester
- PM sets follow-up date
- Requester provides additional details
- PM monitors aging and follows up

**Exit Criteria**:

- All required information received
- External dependency resolved
- Stakeholder decision made
- Request can proceed to next stage

**Transitions**:

- To **In Treatment**: If significant new information requires re-review
- To **Estimation**: If information complete and ready for estimation
- To **Rejected/Closed**: If requester doesn't respond or decides not to proceed

**Aging Threshold**: 5 days

- Warning alerts at 5 days
- Critical alerts at 7 days
- Auto-follow-up emails sent at thresholds

---

### 3.3 Stage 3: Estimation

**Purpose**: Team assigns story points to requests to determine scope and enable
routing decisions.

**Entry Criteria**:

- Request confirmed as valid and in scope
- All necessary context available
- PM assigns to specific team member(s) for estimation

**Activities**:

- Assigned team member reviews request details
- Team member analyzes technical complexity
- Team member considers unknowns and dependencies
- Team member assigns story points using Fibonacci scale (0, 1, 2, 3, 5, 8, 13,
  20, 40, 100)
- Multiple estimates may be gathered and averaged if needed
- Team member adds technical notes or concerns
- PM reviews and approves estimate

**Story Point Guidelines** (from story-points.md):

- **0 points**: Minimal to none (already done, trivial change)
- **1 point**: Very small/trivial (< 1 hour)
- **2 points**: Small/straightforward (few hours)
- **3 points**: Moderate (< 1 day)
- **5 points**: Larger/manageable (few days)
- **8 points**: Complex (up to 1 week)
- **13+ points**: Very complex/high uncertainty (needs breakdown)
- **20, 40, 100 points**: Epic (must be broken down)

**Exit Criteria**:

- Story points assigned and approved
- Technical notes documented
- PM ready to make routing decision

**Transitions**:

- To **On Hold**: If estimation reveals need for more information
- To **Ready**: Once estimate is approved and ready for routing

**Aging Threshold**: 1 day

- Alerts if estimation not submitted within 24 hours of assignment

---

### 3.4 Stage 4: Ready

**Purpose**: Estimated requests awaiting PM's routing decision to Projects or
Work sections.

**Entry Criteria**:

- Story points assigned and approved
- All context and technical notes documented
- Request ready for execution planning

**Activities**:

- PM reviews estimate and request details
- PM makes routing decision based on story points:
  - **0-8 points** → Create as Task, route to Work section
  - **13+ points** → Create as Project, route to Projects section
  - **Change requests** → Always create as Task (regardless of points)
- PM assigns to sprint (for tasks) or project planning (for projects)
- PM may adjust priority before routing
- System creates work item in target section

**Routing Decision Logic**:

```
IF Change Request:
    Create Task → Work Section
ELSE IF Story Points >= 13:
    Create Project → Projects Section
    (Project will be broken down into smaller tasks)
ELSE IF Story Points 0-8:
    Create Task → Work Section
```

**Exit Criteria**:

- Routing decision made
- Work item created in target section
- Original request linked to created work item

**Transitions**:

- To **Work Section**: As Task (0-8 points or change request)
- To **Projects Section**: As Project (13+ points)
- To **On Hold**: If additional information needed before routing
- To **Rejected/Closed**: If decision made not to proceed

**Aging Threshold**: 0.5 days (12 hours)

- Ready requests should be routed quickly to avoid bottleneck

---

## 4. Request Submission

### 4.1 Request Submission Form

**Accessible By**: All users (Client, Admin, PM, Team Members)

**Form Fields**:

**Basic Information** (Required):

- Request Title (max 100 characters)
- Request Description (rich text, max 5000 characters)
- Request Type (dropdown):
  - New Feature
  - Bug Fix
  - Change Request
  - Content Creation (Design/Video/Copy)
  - Infrastructure
  - Other
- Priority (dropdown):
  - Low
  - Medium
  - High
  - Urgent
- Related Project (dropdown, optional):
  - Existing project name
  - "New standalone request"
  - Auto-populates if change request

**Context** (Required):

- Business Justification (text area)
- Success Criteria (text area)
- Target Audience/Users (text area)

**Attachments** (Optional):

- File uploads (designs, mockups, documents)
- Maximum 10 files, 25MB total
- Supported formats: PDF, DOCX, PNG, JPG, GIF, ZIP

**Timeline** (Required):

- Desired Delivery Date (date picker)
- Flexibility (dropdown):
  - Hard deadline (critical)
  - Preferred date (flexible)
  - No deadline (whenever possible)

**Additional Information** (Optional):

- Technical Constraints (text area)
- Dependencies (text area)
- Related Requests (searchable multi-select)
- Budget Estimate (if client knows)

**Auto-Populated Fields**:

- Requester Name (from logged-in user)
- Requester Email
- Submission Date/Time
- Client/Organization (from user profile)

**Form Validation**:

- All required fields must be completed
- Title must be unique (system checks for duplicates)
- File size limits enforced
- Date must be future date (if provided)
- System shows inline validation errors

**Submission Actions**:

- **Submit Request**: Sends to In Treatment stage
- **Save as Draft**: Saves incomplete form for later
- **Cancel**: Discards form

**Post-Submission**:

- Confirmation message displayed
- Confirmation email sent to requester
- Request ID generated and shown
- Link to track request status provided
- Notification sent to PM pool

---

### 4.2 Change Request Workflow

**Definition**: A change request is a modification to existing work (project or
task).

**Identification**:

- Requester selects "Change Request" as type
- Requester links to existing project or task
- System flags as change request automatically

**Special Handling**:

- Change requests ALWAYS become Tasks (never Projects)
- Even if estimated at 13+ points, still routed to Work section
- System links change request task to parent project
- Parent project tracks all associated change requests
- Completion of change request updates parent project history

**Scope Control**:

- PM evaluates if change is within original scope
- Out-of-scope changes may require budget approval
- Significant scope changes may trigger renegotiation

---

### 4.3 Bulk Request Submission

**Use Case**: PM or Admin needs to enter multiple requests at once (e.g., from
client meeting)

**Process**:

- CSV import functionality
- Template provided with required columns
- System validates each row
- Errors reported with line numbers
- Valid requests imported to In Treatment
- Invalid requests listed for correction

---

## 5. Estimation Interface

### 5.1 Estimation Dashboard

**Purpose**: Centralized view for team members to see and complete estimation
assignments.

**Access**: Team members see only their assigned estimates; PM/Admin see all

**Layout**:

- List of requests awaiting estimation
- Sorted by: Assignment date (oldest first)
- Grouped by: Estimator name

**Request Card Display**:

- Request ID and Title
- Request Description (collapsible)
- Request Type and Priority
- Assigned by (PM name)
- Assignment date
- Days waiting for estimate
- Attachments (if any)
- "Estimate Now" button

---

### 5.2 Estimation Form

**Opened when team member clicks "Estimate Now"**

**Fields**:

**Story Points** (Required):

- Radio buttons or dropdown with Fibonacci values
- 0, 1, 2, 3, 5, 8, 13, 20, 40, 100
- Tooltip on each value showing guidelines from story-points.md
- If 13+ selected, warning: "This will become a Project requiring breakdown"

**Confidence Level** (Required):

- High: Clear requirements, low unknowns
- Medium: Some uncertainties
- Low: Significant unknowns, research needed

**Technical Notes** (Optional):

- Text area for technical considerations
- Risks or dependencies
- Questions for PM or requester
- Suggested approach

**Assumptions** (Optional):

- Text area for estimation assumptions
- What's included and excluded
- Prerequisites needed

**Breakdown Preview** (For 13+ points):

- Suggest potential subtasks
- Preliminary breakdown
- Helps PM understand complexity

**Actions**:

- **Submit Estimate**: Sends to PM for approval
- **Save Draft**: Saves progress
- **Request Clarification**: Moves request to On Hold with questions
- **Cancel**: Returns to estimation dashboard

**Collaborative Estimation**:

- If multiple people assigned, each submits estimate independently
- PM sees all estimates and can average, choose one, or discuss with team
- System shows variance if estimates differ significantly (e.g., 3 vs 13)

---

### 5.3 Estimation Approval (PM)

**PM Review Interface**:

- View submitted estimate
- See story points, confidence, notes
- Compare with any other estimates (if multiple assigned)
- View estimation history (previous similar requests)

**PM Actions**:

- **Approve**: Accept estimate, move to Ready
- **Request Re-estimate**: Send back to estimator with feedback
- **Override**: Change story points with justification
- **Discuss**: Open conversation with estimator

**Override Tracking**:

- System logs all estimate overrides
- Reason required for overrides
- Used for historical accuracy analysis

---

## 6. Intake Views & Filters

### 6.1 Stage Views

**In Treatment View**:

- List of all requests in In Treatment stage
- Sortable columns: Submission date, Priority, Requester, Type
- Filterable by: Priority, Type, Assigned PM, Date range
- Bulk actions: Assign to PM, Move to Estimation, Move to On Hold
- Aging indicators (visual colors)

**On Hold View**:

- List of all requests on hold
- Additional columns: Reason for hold, Follow-up date, Days waiting
- Alert indicators for aging requests
- Filterable by: Reason, Days waiting, Assigned PM
- Quick action: Send reminder to requester

**Estimation View**:

- List of all requests awaiting estimation
- Additional columns: Assigned to, Assignment date, Estimate status
- Filterable by: Estimator, Days waiting, Request type
- Shows which estimates are overdue (>24 hours)
- Bulk actions: Reassign estimator, Send reminder

**Ready View**:

- List of all estimated requests ready for routing
- Additional columns: Story points, Confidence level, Days in ready
- Filterable by: Story points range, Date estimated
- Quick routing: One-click to create Project or Task
- Bulk actions: Route selected to Work, Route selected to Projects

---

### 6.2 Global Filters (All Views)

**Filter Panel** (Collapsible sidebar):

- Date Range: Submission date, Last updated
- Priority: Low, Medium, High, Urgent
- Type: All types from dropdown
- Requester: Search by name or client
- Assigned PM: Filter by PM name
- Aging Status: Not aging, Warning (yellow), Critical (red)
- Related Project: Filter by existing project

**Search**:

- Global search bar searches: Title, Description, Request ID
- Auto-suggest as user types
- Recent searches saved

**Saved Filters**:

- Users can save custom filter combinations
- Named filters (e.g., "My High Priority", "Aging Requests")
- Quick toggle between saved filters

---

### 6.3 Custom Views

**Admin/PM Can Create**:

- Custom views with specific filter combinations
- Share views with team
- Set default view per role
- Examples:
  - "This Week's Submissions"
  - "Urgent Items"
  - "Client X Requests"
  - "Overdue Estimates"

---

## 7. Routing & Work Item Creation

### 7.1 Task Creation (0-8 Story Points)

**When PM routes request to Work section**:

**Automatic Actions**:

- Task created in Work section → Backlog status
- Task inherits request details:
  - Title
  - Description
  - Priority
  - Story points
  - Attachments
  - Related project (if applicable)
- Requester added as stakeholder
- PM assigned as task owner
- Original request ID linked to task
- Request marked as "Routed to Work"

**PM Additional Actions**:

- Assign to specific team member
- Assign to sprint (if planned)
- Add to current backlog
- Set task due date based on client deadline

**Notifications Sent**:

- To requester: "Your request has been converted to task #XXX"
- To assigned team member: "New task assigned to you"
- To PM: Confirmation of routing

---

### 7.2 Project Creation (13+ Story Points)

**When PM routes request to Projects section**:

**Automatic Actions**:

- Project created in Projects section → Planning status
- Project inherits request details:
  - Title
  - Description
  - Budget estimate (if provided)
  - Target delivery date
  - Attachments
- Requester added as client/stakeholder
- PM assigned as project manager
- Original request ID linked to project
- Request marked as "Routed to Projects"

**PM Next Steps** (In Projects section):

- Break down project into smaller tasks (0-8 points each)
- Each subtask goes through normal task workflow
- Set project milestones
- Assign team members
- Create sprint plan

**Notifications Sent**:

- To requester: "Your request has been converted to project #XXX"
- To PM: "New project created requiring breakdown"
- To team: "New project in planning phase"

---

### 7.3 Change Request Routing

**Always routed to Work section as Task**, even if 13+ points:

**Task Creation**:

- Linked to parent project
- Flagged as "Change Request"
- Story points recorded (even if 13+)
- Parent project updated with change request
- May trigger scope/budget discussion if large

**Parent Project Impact**:

- Change request appears in project history
- Project timeline may be adjusted
- Project scope tracked (original vs current)
- Budget impact calculated if out of scope

---

## 8. Aging & Thresholds

### 8.1 Aging Indicators

**Visual System**:

- **Green**: Within threshold (normal)
- **Yellow**: Approaching threshold (warning)
- **Red**: Exceeded threshold (critical)
- **Days counter**: Shows age prominently

**Stage-Specific Thresholds**:

- In Treatment: 2 days
- On Hold: 5 days (warning), 7 days (critical)
- Estimation: 1 day
- Ready: 0.5 days (12 hours)

**Display**:

- Color-coded badges on request cards
- Days counter turns red when critical
- Sort by aging to surface oldest first
- Dashboard widget shows aging count by stage

---

### 8.2 Automated Alerts

**Alert Rules**:

**In Treatment**:

- Day 2: Alert to assigned PM
- Day 3: Escalate to Admin

**On Hold**:

- Day 3: Reminder to PM to follow up
- Day 5: Warning alert to PM and requester
- Day 7: Critical alert to PM and Admin
- Day 10: Auto-close with notification (configurable)

**Estimation**:

- 12 hours: Reminder to assigned estimator
- 24 hours: Alert to estimator and PM
- 48 hours: Escalation to Admin

**Ready**:

- 6 hours: Reminder to PM
- 12 hours: Alert to PM
- 24 hours: Escalation to Admin

**Alert Delivery**:

- In-app notifications
- Email notifications
- Dashboard alert widget
- Slack integration (if configured)

---

### 8.3 Capacity Management

**Purpose**: Prevent intake bottleneck by monitoring capacity to accept new
requests

**Capacity Calculation**:

```
Available Capacity = (Team Available Hours) - (Current Sprint Commitments + In Progress Tasks)
Intake Capacity = Available Capacity / Average Story Points per Request
```

**Capacity Indicator**:

- Displayed prominently in Intake overview
- "Can accept X more requests this week"
- Color-coded: Green (healthy), Yellow (limited), Red (at capacity)

**Actions When At Capacity**:

- PM can pause new request acceptance
- Auto-notification to clients about wait times
- Priority requests can override capacity limits
- Admin can adjust capacity thresholds

---

## 9. Notifications & Communication

### 9.1 Requester Notifications

**Automatic Notifications Sent**:

**On Submission**:

- Confirmation email with request ID
- Estimated review timeline
- Link to track status

**Status Updates**:

- Moved to On Hold (with reason and what's needed)
- Moved to Estimation (update: being evaluated)
- Estimate completed (story points, expected timeline)
- Routed to Projects/Work (work item created, link provided)
- Request rejected/closed (with reason)

**Reminders**:

- On Hold: Reminder if response needed
- Follow-up: After X days of inactivity

**Notification Preferences**:

- Clients can choose: Email only, In-app only, Both
- Frequency: Immediate, Daily digest, Weekly digest

---

### 9.2 Team Notifications

**Estimation Assignments**:

- Notification when request assigned for estimation
- Reminder after 24 hours if not completed
- Notification when estimate approved or sent back

**PM Notifications**:

- New request submitted
- Request moved to On Hold by system (auto-aged)
- Estimate submitted (needs approval)
- Request aging beyond threshold
- Capacity warnings

**Admin Notifications**:

- Escalated aging requests
- Capacity reached
- System errors in intake processing

---

### 9.3 In-App Communication

**Comment Thread**:

- Each request has comment thread
- PM, requester, estimators can comment
- @mentions notify specific users
- File attachments in comments
- Comment history preserved

**Status Update Messages**:

- Automated messages when stage changes
- Manual messages from PM to requester
- Clarification questions from estimators
- All messages threaded chronologically

---

## 10. Analytics & Reporting

### 10.1 Intake Pipeline Metrics

**Key Metrics Tracked**:

- Total requests by stage
- Average time per stage
- Aging requests count
- Throughput (requests routed per week)
- Capacity utilization
- Bottleneck identification

**Pipeline Health Dashboard**:

- Visual funnel showing flow through stages
- Identify where requests accumulate
- Trend lines for each metric
- Week-over-week comparison

---

### 10.2 Estimation Accuracy

**Tracking**:

- Compare estimated vs actual story points (after completion)
- Track estimation variance by estimator
- Identify patterns in under/over-estimation
- Use data to improve future estimates

**Reports**:

- Estimator accuracy scorecard
- Most accurate request types
- Areas needing better scoping

---

### 10.3 Request Analysis

**Request Type Distribution**:

- Breakdown by type (feature, bug, change, content)
- Trend over time
- Client patterns

**Priority Distribution**:

- How many urgent vs normal requests
- Alert if too many urgent (may indicate planning issues)

**Client Request Patterns**:

- Requests per client
- Average story points per client
- Client response time (On Hold stage)

**Rejection Analysis**:

- Reasons for rejection
- Patterns in rejected requests
- Opportunity to improve intake form or client education

---

## 11. Automation Rules

### 11.1 Auto-Assignment

**PM Assignment**:

- New requests auto-assign to PM pool (round-robin)
- Or assign based on client relationship
- Or assign based on request type/specialty

**Estimator Assignment**:

- PM can set rules: "All React requests → Senior Dev"
- Auto-assign based on availability/capacity
- Load balancing across team

---

### 11.2 Auto-Routing

**Simple Requests**:

- 0-2 story points with high confidence → Auto-route to Work
- PM approval not required (configurable)

**Critical Aging**:

- Requests in On Hold > 10 days → Auto-close with notification
- Requests in Estimation > 3 days → Auto-reassign or escalate

---

### 11.3 Smart Suggestions

**Duplicate Detection**:

- System searches for similar past requests
- Suggests duplicates to PM during triage
- PM can link or merge duplicates

**Historical Estimates**:

- When estimating, show similar past requests
- Display their story points
- Help calibrate estimates

---

## 12. Mobile Experience

### 12.1 Mobile Request Submission

**Simplified Form**:

- Progressive disclosure (show fields as needed)
- Mobile-optimized inputs
- Voice-to-text for description
- Photo attachments from camera
- Location tagging (if relevant)

---

### 12.2 Mobile Intake Management (PM)

**Quick Triage**:

- Swipe gestures for stage changes
- Swipe right: Approve/Estimate
- Swipe left: On Hold/Reject
- Tap to expand full details
- One-tap routing decisions

**Notifications**:

- Push notifications for new requests
- Quick actions from notification
- Badge counts on app icon

---

### 12.3 Mobile Estimation

**Simplified Estimation**:

- Large story point buttons
- Swipe between requests
- Quick notes via voice
- Submit estimate in 2 taps

---

## 13. Integration Points

### 13.1 Integration with Other Sections

**With Work Section**:

- Tasks created from routed requests (0-8 points)
- Link maintained between request and task
- Task status updates visible in request history

**With Projects Section**:

- Projects created from routed requests (13+ points)
- Link maintained between request and project
- Project breakdown tasks link back to original request

**With Clients Section**:

- Client information auto-populated in requests
- Request history visible in client profile
- Client communication history linked

**With Financials**:

- Budget estimates captured in intake
- Actual costs compared to estimates
- Invoice triggers when work completed

---

### 13.2 External Integrations

**Email**:

- Email-to-request (send email to special address creates request)
- Email notifications for all status changes
- Email replies append to comment threads

**Calendar**:

- Deadlines sync to calendar
- Follow-up dates create calendar reminders
- Sprint planning dates visible

**Slack** (if configured):

- New request notifications to channel
- Aging request alerts
- Estimate reminders
- Status updates

**Third-Party Forms**:

- Embed request form on client websites
- API for form submissions
- Webhook notifications

---

## 14. Technical Requirements

### 14.1 Performance Requirements

**Page Load**:

- Intake dashboard loads in under 2 seconds
- Request form loads in under 1 second
- Stage transitions complete in under 500ms

**Real-Time Updates**:

- New requests appear within 10 seconds
- Status changes reflect within 5 seconds
- Notification delivery within 5 seconds

**Search**:

- Search results return in under 1 second
- Auto-suggest responds within 300ms

---

### 14.2 Data Requirements

**Request Storage**:

- All requests retained indefinitely
- Searchable archive of completed/rejected requests
- Attachments stored with version control
- Comment history preserved

**Audit Trail**:

- All stage transitions logged
- All edits tracked with user and timestamp
- Estimation changes logged
- Routing decisions recorded

---

### 14.3 Security Requirements

**Data Isolation**:

- Clients see only their requests
- Team members see only relevant requests
- PM/Admin see all within scope

**Authentication**:

- All API calls authenticated
- Session timeout after inactivity
- Two-factor authentication support

**Authorization**:

- Role-based permissions strictly enforced
- Actions logged for accountability
- Sensitive data encrypted at rest

---

### 14.4 Scalability Requirements

**Volume Handling**:

- Support 1000+ requests in pipeline simultaneously
- Handle 100+ new requests per day
- Support 50+ concurrent estimators
- Maintain performance with 10,000+ historical requests

---

## 15. User Scenarios

### 15.1 Client Request Submission

**Scenario: Client Submits New Feature Request**

**When** client logs into platform  
**Then** they see "Submit New Request" button prominently  
**And** click to open request form  
**And** fill out title: "Add shopping cart to website"  
**And** select type: "New Feature"  
**And** select priority: "High"  
**And** write description with acceptance criteria  
**And** upload wireframe mockup  
**And** set desired delivery: 30 days from now  
**And** click "Submit Request"  
**Then** confirmation message appears with request ID  
**And** confirmation email sent to client  
**And** request appears in PM's In Treatment queue

---

### 15.2 PM Triage Workflow

**Scenario: PM Reviews Morning Requests**

**When** PM logs in and navigates to Intake  
**Then** sees 8 requests in In Treatment  
**And** sees 2 are aging (yellow indicator)  
**And** clicks first request to review details  
**And** reads description and attachments  
**And** confirms request is valid and in scope  
**And** assigns to senior developer for estimation  
**And** request moves to Estimation stage  
**And** developer receives notification  
**And** PM moves to next request

---

### 15.3 On Hold Management

**Scenario: Request Needs Clarification**

**When** PM reviews request for "redesign dashboard"  
**Then** realizes mockups are missing  
**And** clicks "Move to On Hold"  
**And** modal opens asking for reason  
**And** PM types: "Need wireframes or mockups to estimate accurately"  
**And** PM sets follow-up date: 3 days  
**And** clicks "Notify Client"  
**Then** request moves to On Hold  
**And** client receives email explaining what's needed  
**And** request shows "Waiting for: Wireframes" in On Hold view

**When** client uploads wireframes 2 days later  
**Then** request automatically moves back to In Treatment  
**And** PM receives notification  
**And** PM assigns for estimation

---

### 15.4 Team Estimation

**Scenario: Developer Estimates Request**

**When** developer navigates to Intake  
**Then** sees "Estimation" tab with badge showing "3"  
**And** clicks to open Estimation dashboard  
**And** sees 3 requests assigned to them  
**And** sees oldest is 18 hours old (yellow warning)  
**And** clicks "Estimate Now" on that request  
**Then** estimation form opens  
**And** developer reads description and attachments  
**And** considers: API integration, UI work, testing  
**And** selects "5 story points" (few days of work)  
**And** selects confidence: "Medium"  
**And** adds technical notes: "Need API key from client before starting"  
**And** clicks "Submit Estimate"  
**Then** estimate sent to PM for approval  
**And** request badge shows "Estimate Pending Approval"

---

### 15.5 PM Routing Decision

**Scenario: PM Routes Simple Task**

**When** PM receives notification: "Estimate submitted"  
**Then** navigates to Ready stage  
**And** sees request with 5 story points  
**And** reviews estimate and technical notes  
**And** clicks "Approve Estimate"  
**And** request moves to Ready  
**And** PM clicks "Route to Work"  
**Then** routing modal appears showing:

- Story points: 5
- Recommended: Task (Work section)
- Reason: 0-8 points → Task  
  **And** PM confirms routing  
  **Then** task created in Work section → Backlog  
  **And** developer assigned to task  
  **And** client notified: "Your request is now Task #234"  
  **And** request removed from Intake (archived)

---

### 15.6 PM Routes Large Project

**Scenario: PM Routes Complex Feature**

**When** PM reviews request estimated at 21 story points  
**Then** sees warning: "This will become a Project"  
**And** clicks "Route to Projects"  
**Then** routing modal shows:

- Story points: 21
- Recommended: Project (Projects section)
- Reason: 13+ points → Requires breakdown  
  **And** PM confirms routing  
  **Then** project created in Projects section → Planning status  
  **And** PM receives notification to break down project  
  **And** client notified: "Your request is now Project #12"  
  **And** request archived in Intake

**When** PM navigates to Projects section  
**Then** sees new project in Planning  
**And** clicks to open project  
**And** begins breaking into smaller tasks:

- User authentication (5 pts)
- Product catalog (8 pts)
- Shopping cart (5 pts)
- Payment gateway (8 pts)  
  **And** each task goes through normal workflow

---

### 15.7 Change Request Handling

**Scenario: Client Requests Change to Existing Project**

**When** client submits request  
**And** selects type: "Change Request"  
**And** links to existing project: "E-commerce Platform"  
**And** describes: "Add gift wrapping option to checkout"  
**And** submits request  
**Then** request flagged as change request automatically  
**And** PM reviews and assigns for estimation

**When** developer estimates at 8 story points  
**And** PM routes request  
**Then** system automatically routes to Work (not Projects)  
**And** creates task linked to parent project  
**And** parent project shows: "1 change request in progress"  
**And** task marked as "Change Request" in Work section

---

### 15.8 Aging Request Escalation

**Scenario: Request Ages Beyond Threshold**

**When** request sits in On Hold for 5 days  
**Then** warning alert triggered  
**And** PM receives notification  
**And** request shows yellow indicator

**When** 2 more days pass (7 days total)  
**Then** critical alert triggered  
**And** Admin receives escalation notification  
**And** request shows red indicator  
**And** system sends auto-follow-up email to client

**When** client still doesn't respond after 10 days  
**Then** system prompts PM: "Auto-close this request?"  
**And** PM can choose: "Close" or "Extend deadline"  
**And** if closed, client receives notification with reason

---

### 15.9 Bulk Request Import

**Scenario: PM Imports Multiple Requests**

**When** PM has 20 requests from client meeting  
**Then** navigates to Intake  
**And** clicks "Bulk Import"  
**And** downloads CSV template  
**And** fills template with request details  
**And** uploads completed CSV  
**Then** system validates all rows  
**And** shows: "18 valid, 2 errors"  
**And** displays errors: "Row 5: Missing description", "Row 12: Invalid date"  
**And** PM fixes errors in CSV  
**And** re-uploads  
**Then** all 20 requests imported to In Treatment  
**And** PM receives confirmation  
**And** can begin triaging in bulk

---

### 15.10 Mobile Quick Triage

**Scenario: PM Triages on Mobile**

**When** PM receives push notification: "3 new requests"  
**Then** taps notification  
**And** app opens to In Treatment view  
**And** sees 3 request cards  
**And** swipes right on first request (simple change)  
**Then** swipe action menu appears  
**And** taps "Send to Estimation"  
**And** selects estimator from list  
**And** request moves to Estimation

**And** swipes left on second request (unclear)  
**Then** swipe action shows "On Hold" option  
**And** taps "On Hold"  
**And** dictates reason via voice: "Need mockups"  
**And** request moves to On Hold  
**And** notification sent to client

---

## 16. Acceptance Criteria

### 16.1 Functional Acceptance

- [ ] All users can submit requests via form
- [ ] PM can move requests through all stages
- [ ] Team members can submit estimates
- [ ] Routing creates correct work items (Task or Project)
- [ ] Change requests always become tasks
- [ ] Aging indicators display correctly
- [ ] Notifications sent at correct triggers
- [ ] Comments and attachments work
- [ ] Filters and search return accurate results
- [ ] Mobile submission and triage functional

### 16.2 Performance Acceptance

- [ ] Dashboard loads under 2 seconds
- [ ] Form submission completes under 1 second
- [ ] Search returns results under 1 second
- [ ] Real-time updates appear within 10 seconds
- [ ] Supports 1000+ requests without performance degradation

### 16.3 Security Acceptance

- [ ] Client data isolation verified
- [ ] Role permissions enforced
- [ ] Unauthorized access blocked
- [ ] Audit trail captures all actions
- [ ] File uploads scanned for malware

### 16.4 Usability Acceptance

- [ ] Users can submit request in under 3 minutes
- [ ] PM can triage request in under 1 minute
- [ ] Estimator can estimate in under 5 minutes
- [ ] No training required for request submission
- [ ] Mobile experience intuitive and efficient

---

## 17. Glossary

**Intake**: The process and system for receiving, evaluating, and routing new
work requests

**Request**: A submission for new work, changes, or services

**Triage**: The process of reviewing and categorizing requests

**Story Points**: Estimation unit using Fibonacci sequence indicating
effort/complexity

**Routing**: Decision to send request to Projects (13+ points) or Work (0-8
points)

**Change Request**: Request to modify existing work (always becomes Task)

**Aging**: Time a request spends in a stage without progress

**Threshold**: Maximum acceptable time in stage before alerts trigger

**Capacity**: Team's ability to accept and process new requests

**Estimation**: Process of assigning story points to requests

**Confidence Level**: Estimator's certainty about their estimate
(High/Medium/Low)

---

## 18. Approval & Sign-Off

**Specification Prepared By**: [Name]  
**Date**: [Date]

**Reviewed By**: [Name]  
**Date**: [Date]

**Approved By**: [Name]  
**Date**: [Date]

---

**End of Specification Document**
