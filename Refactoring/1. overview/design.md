# Overview Navigation - Design Document

## Document Information

- **Component**: Overview (Role-Based Dashboard)
- **Version**: 1.0
- **Last Updated**: November 23, 2025
- **Status**: Draft

---

## 1. Design Overview

### 1.1 Purpose of This Document

This document describes the structural design, layout, and feature organization of the Overview navigation without specifying visual styling, colors, or specific implementation details. It serves as a blueprint for UI/UX designers and developers.

### 1.2 Design Principles

- **Clarity**: Information hierarchy must be immediately apparent
- **Efficiency**: Common actions require minimal clicks
- **Flexibility**: Users can customize their view
- **Consistency**: Similar elements behave similarly across roles
- **Responsiveness**: Layout adapts intelligently to screen sizes
- **Accessibility**: Design accommodates all users regardless of ability

---

## 2. Global Layout Structure

### 2.1 Page Container

The Overview page consists of a fixed header area and a scrollable content area.

```
┌─────────────────────────────────────────────────────┐
│ FIXED HEADER AREA                                   │
│ - Page title "Overview"                             │
│ - Role indicator                                    │
│ - View switcher (Admin only)                        │
│ - Customization controls                            │
│ - Quick Actions bar                                 │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│                                                     │
│ SCROLLABLE CONTENT AREA                            │
│ - Widget grid layout                                │
│ - Customizable arrangement                          │
│ - Responsive columns                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2.2 Header Area Components

#### Page Title Section

- Text: "Overview" or "Dashboard"
- Breadcrumb navigation showing current location
- Last updated timestamp
- Refresh button (manual refresh trigger)

#### Role Indicator

- Current user name
- Current role display
- Avatar or initials icon
- For Admins: Dropdown to switch role view for testing

#### Customization Controls

- Button: "Customize Dashboard"
- Button: "Reset to Default"
- Button: "Save Layout"
- Toggle: "Edit Mode" (enables drag-and-drop)

### 2.3 Grid System

The content area uses a responsive grid system:

**Desktop (1920px+)**:

- 12-column grid
- Widgets can span 3, 4, 6, or 12 columns
- Minimum widget height: 200px
- Gutter space between widgets: 16px

**Tablet (768px - 1919px)**:

- 8-column grid
- Widgets can span 4 or 8 columns
- Some widgets may stack automatically
- Gutter space: 12px

**Mobile (below 768px)**:

- 4-column grid (essentially single column)
- All widgets span full width
- Widgets stack vertically
- Gutter space: 8px

---

## 3. Widget Architecture

### 3.1 Standard Widget Structure

All widgets follow a consistent internal structure:

```
┌─────────────────────────────────────────────────────┐
│ WIDGET HEADER                                       │
│ - Icon (optional)                                   │
│ - Title                                             │
│ - Action menu (⋮)                                   │
│   - Refresh                                         │
│   - Expand/Collapse                                 │
│   - Remove from view                                │
│   - Configure                                       │
├─────────────────────────────────────────────────────┤
│ WIDGET BODY                                         │
│ - Primary content area                              │
│ - Varies by widget type                             │
│ - Scrollable if content exceeds height              │
├─────────────────────────────────────────────────────┤
│ WIDGET FOOTER (optional)                            │
│ - "View More" link                                  │
│ - Secondary actions                                 │
│ - Summary information                               │
└─────────────────────────────────────────────────────┘
```

### 3.2 Widget Sizes

Widgets come in three standard sizes that can be selected during customization:

**Small Widget** (3 columns wide):

- Suitable for: Single metrics, status indicators, quick stats
- Height: 200-300px
- Examples: Team member count, current sprint name

**Medium Widget** (4-6 columns wide):

- Suitable for: Lists, small charts, notifications
- Height: 300-500px
- Examples: My Work Today, Recent Activity

**Large Widget** (6-12 columns wide):

- Suitable for: Tables, detailed charts, multiple sections
- Height: 400-600px
- Examples: Organization Health, Team Status

### 3.3 Widget States

**Default State**: Normal display with all information visible

**Loading State**:

- Skeleton screen showing widget outline
- Loading indicator centered
- Maintains widget dimensions

**Error State**:

- Error message displayed
- Retry button provided
- Option to report issue

**Empty State**:

- Message indicating no data available
- Helpful text suggesting what to do
- Action button if applicable

**Collapsed State**:

- Only header visible
- Body content hidden
- Expand icon in header

---

## 4. Detailed Widget Designs

### 4.1 Quick Actions Bar

**Layout**: Horizontal bar spanning full width of header

**Structure**:

```
┌─────────────────────────────────────────────────────┐
│ [Icon + Label] [Icon + Label] [Icon + Label] ...   │
└─────────────────────────────────────────────────────┘
```

**Button Elements**:

- Icon representing action (consistent with action type)
- Text label below or beside icon
- Hover state shows tooltip with additional context
- Click triggers action or opens modal
- Keyboard shortcuts displayed in tooltip

**Responsive Behavior**:

- Desktop: All actions visible
- Tablet: Most used actions visible, rest in overflow menu
- Mobile: Top 3 actions visible, rest in hamburger menu

---

### 4.2 Organization Health Widget

**Widget Size**: Large (12 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ 🏢 ORGANIZATION HEALTH                              │
├──────────────┬──────────────────────────────────────┤
│ METRICS      │ TRENDS                               │
│ SECTION      │ SECTION                              │
│              │                                      │
│ • Metric 1   │ [Mini line chart]                    │
│ • Metric 2   │ [Mini line chart]                    │
│ • Metric 3   │ [Mini line chart]                    │
│ • Metric 4   │ [Mini line chart]                    │
└──────────────┴──────────────────────────────────────┘
```

**Metrics Section** (Left half):

- List of 4-6 key metrics
- Each metric shows:
  - Label
  - Current value
  - Target value (if applicable)
  - Status indicator icon
  - Percentage or delta from target

**Trends Section** (Right half):

- Mini line charts for each metric
- Time period indicator (e.g., "Last 30 days")
- Hover on chart shows data point values
- Trend direction arrow and percentage change
- Click chart to expand to full analytics view

---

### 4.3 Critical Alerts Widget

**Widget Size**: Large (12 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ 🔴 CRITICAL ALERTS (6)                              │
├─────────────────────────────────────────────────────┤
│ [!] Alert Title 1                          [Action] │
│     Alert description or details                    │
│     Timestamp • Category                            │
├─────────────────────────────────────────────────────┤
│ [!] Alert Title 2                          [Action] │
│     Alert description or details                    │
│     Timestamp • Category                            │
└─────────────────────────────────────────────────────┘
```

**Alert Item Structure**:

- Priority indicator icon at left
- Alert title (bold, clickable)
- Brief description (1-2 lines)
- Metadata: Timestamp, category, affected item
- Action button(s) at right:
  - Primary action (e.g., "View", "Resolve")
  - Secondary actions in dropdown
- Snooze/dismiss option

**Alert Grouping**:

- Alerts grouped by severity: Critical, Warning, Info
- Each group collapsible
- Count badge shows total per group
- Sort options: Time (newest first), Priority, Category

**Responsive Behavior**:

- Desktop: Shows 5-10 alerts
- Tablet: Shows 5 alerts
- Mobile: Shows 3 alerts with "View All" link

---

### 4.4 My Work Today Widget

**Widget Size**: Medium (6 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ 📋 MY WORK TODAY (3 tasks)                          │
│                              [Filter ▼] [Sort ▼]    │
├─────────────────────────────────────────────────────┤
│ [●] Task Title 1                                    │
│     Status Badge • 2 pts • Due today                │
│     Project Name • 2h logged                        │
│     [Start Timer] [View Details]                    │
├─────────────────────────────────────────────────────┤
│ [●] Task Title 2                                    │
│     Status Badge • 5 pts • Due Nov 26               │
│     Project Name                                    │
│     [Start Timer] [View Details]                    │
├─────────────────────────────────────────────────────┤
│                          [+ Add Task] [View All]    │
└─────────────────────────────────────────────────────┘
```

**Task Card Structure**:

- Status indicator (color dot or icon)
- Task title (clickable link)
- Metadata row:
  - Current status badge
  - Story points
  - Due date with urgency indicator
- Second metadata row:
  - Related project/client
  - Time logged today
  - Blocker icon (if applicable)
- Action buttons:
  - Start/Stop Timer
  - View Details
  - More actions (dropdown)

**Filter Options**:

- Due today
- High priority only
- Blocked items
- Specific project

**Sort Options**:

- Due date (default)
- Priority
- Story points
- Recently updated

**Empty State**:

- Message: "No tasks assigned for today"
- Action: "Browse backlog" or "Create task"

---

### 4.5 Current Sprint Widget

**Widget Size**: Medium (4-6 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ 🚀 CURRENT SPRINT - Sprint 24                       │
├─────────────────────────────────────────────────────┤
│ Sprint Goal: [Goal statement displayed here]        │
├─────────────────────────────────────────────────────┤
│ PROGRESS                                            │
│ ████████████░░░░ 8/13 pts (62%)                     │
│                                                     │
│ Days Remaining: 3                                   │
│ Ends: Nov 28, 2025                                  │
├─────────────────────────────────────────────────────┤
│ VELOCITY                                            │
│ Current: 8 pts    Average: 11 pts                  │
│ Status: [At Risk - behind pace]                     │
├─────────────────────────────────────────────────────┤
│ TASKS                                               │
│ Completed: 2    In Progress: 1    To Do: 3         │
├─────────────────────────────────────────────────────┤
│                 [View Sprint Board] [Burndown]      │
└─────────────────────────────────────────────────────┘
```

**Components**:

**Sprint Header**:

- Sprint number and name
- Link to sprint details page

**Sprint Goal**:

- Text display of sprint objective
- Editable by PM/Admin

**Progress Section**:

- Visual progress bar
- Numerical display: completed/total points
- Percentage completion
- Days remaining counter
- End date

**Velocity Section**:

- Current sprint velocity
- Team average velocity for comparison
- Status indicator based on comparison

**Task Breakdown**:

- Count of tasks by status
- Clickable to filter sprint tasks by status

**Action Buttons**:

- View Sprint Board (navigates to Work section filtered by sprint)
- View Burndown Chart (opens chart modal or page)

---

### 4.6 Upcoming Deadlines Widget

**Widget Size**: Medium (4-6 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ 📅 UPCOMING (Next 7 Days)                           │
├─────────────────────────────────────────────────────┤
│ TODAY - Nov 23                                      │
│ [●] Task: Fix login bug (Due 5:00 PM)              │
│ [●] Task: Update homepage                          │
├─────────────────────────────────────────────────────┤
│ TOMORROW - Nov 24                                   │
│ [●] Meeting: Sprint Demo (2:00 PM)                 │
├─────────────────────────────────────────────────────┤
│ NOV 26                                              │
│ [●] Delivery: Mobile App Beta                      │
│ [●] Task: Deploy to staging                        │
├─────────────────────────────────────────────────────┤
│ NOV 28                                              │
│ [●] Sprint: Sprint 24 ends                         │
├─────────────────────────────────────────────────────┤
│                    [Export Calendar] [View More]    │
└─────────────────────────────────────────────────────┘
```

**Date Group Structure**:

- Date header (relative: Today, Tomorrow, or absolute: Nov 26)
- Items under date sorted by time if available
- Each item shows:
  - Type indicator icon
  - Item title
  - Time (if applicable)
  - Click to navigate to item details

**Item Types** (with distinct icons):

- Tasks
- Project deliveries
- Meetings
- Sprint milestones
- Invoices due
- Team member PTO

**Interactive Features**:

- Hover on item shows full details tooltip
- Click item navigates to relevant page
- Drag-and-drop to reschedule (if permissions allow)

**Footer Actions**:

- Export to external calendar (iCal, Google Calendar)
- View More (extends date range to 14 days)

---

### 4.7 Recent Activity Feed Widget

**Widget Size**: Medium (4-6 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ 💬 RECENT ACTIVITY                                  │
│                           [Filter ▼] [Mark All Read]│
├─────────────────────────────────────────────────────┤
│ [Avatar] Emma completed "Fix login bug"             │
│          2 minutes ago • Customer Portal            │
├─────────────────────────────────────────────────────┤
│ [Avatar] Noah added comment to "API Integration"    │
│          15 minutes ago • Mobile App                │
├─────────────────────────────────────────────────────┤
│ [Avatar] Client approved "Homepage Mockup"          │
│          1 hour ago • Website Redesign              │
├─────────────────────────────────────────────────────┤
│ [Avatar] Ava moved "User Auth" to Code Review       │
│          2 hours ago • Customer Portal              │
├─────────────────────────────────────────────────────┤
│                              [View All Activity]    │
└─────────────────────────────────────────────────────┘
```

**Activity Item Structure**:

- User avatar or system icon
- Activity description (actor + action + object)
- Timestamp (relative: "2 minutes ago")
- Related project/client name
- Click to navigate to activity source
- Unread indicator (bold text or dot)

**Filter Options**:

- All activities
- By type: Comments, Status changes, Completions, Uploads
- By project
- By team member
- Only @mentions

**Auto-Refresh**:

- New activities appear at top automatically
- Smooth animation for new items
- Refresh every 30 seconds

**Footer**:

- "View All Activity" links to full activity log page
- Shows count of total activities available

---

### 4.8 Team Status Widget

**Widget Size**: Large (8-12 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ 👥 TEAM STATUS                                      │
│    Available: 2 • Busy: 3 • Overloaded: 1 • Leave: 1│
├──────────────┬──────────────┬──────────────┬────────┤
│ [Avatar]     │ [Avatar]     │ [Avatar]     │ [More] │
│ Emma Miller  │ Noah R.      │ Ava Jones    │ [3]    │
│              │              │              │        │
│ Available    │ Overloaded   │ Busy         │        │
│ 65% util.    │ 130% util.   │ 85% util.    │        │
│ 5 tasks      │ 12 tasks     │ 7 tasks      │        │
│              │              │              │        │
│ [Contact]    │ [View Tasks] │ [Contact]    │        │
└──────────────┴──────────────┴──────────────┴────────┘
```

**Team Member Card**:

- Avatar image or initials
- Full name
- Role/title
- Current status indicator:
  - Available (green)
  - Busy (yellow)
  - Overloaded (red)
  - On Leave (gray)
- Capacity utilization percentage
- Active task count
- Contact button (opens chat or email)
- View Tasks button (shows modal with task list)

**Header Summary**:

- Count of team members by status
- Total team size
- Overall team utilization percentage

**Responsive Layout**:

- Desktop: 4-6 cards visible in grid
- Tablet: 3 cards visible
- Mobile: 2 cards visible with horizontal scroll
- "View More" expands to show all team members

**Hover State**:

- Shows additional details:
  - Current task being worked on
  - Availability calendar (next 7 days)
  - Last activity timestamp

---

### 4.9 Communication Hub Widget

**Widget Size**: Medium (4-6 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ 💬 COMMUNICATION HUB                                │
│    Total: 12 unread                                 │
├─────────────────────────────────────────────────────┤
│ URGENT (3)                              [Collapse ▼]│
│ [!] @mentioned in "API Design" discussion           │
│     Noah: Can you review the approach?              │
│     5 minutes ago                       [Reply]     │
├─────────────────────────────────────────────────────┤
│ [!] Approval needed: Homepage Mockup                │
│     Ava requesting design approval                  │
│     2 hours ago                      [Approve/Deny] │
├─────────────────────────────────────────────────────┤
│ TODAY (5)                               [Collapse ▼]│
│ [●] New comment on "User Authentication"            │
│     Client feedback received                        │
│     3 hours ago                         [View]      │
├─────────────────────────────────────────────────────┤
│ THIS WEEK (4)                           [Collapse ▼]│
│ [●] Code review requested on PR #89                 │
│     Emma needs your review                          │
│     Yesterday                           [Review]    │
├─────────────────────────────────────────────────────┤
│              [Mark All Read] [Notification Settings]│
└─────────────────────────────────────────────────────┘
```

**Notification Groups**:

- Urgent: Requires immediate action
- Today: Recent notifications
- This Week: Older but unread
- Each group collapsible independently

**Notification Item Structure**:

- Priority indicator
- Brief description
- Sender/source
- Timestamp
- Quick action button(s)
- Click to navigate to source

**Quick Actions**:

- Reply (opens inline compose)
- Approve/Deny (for approval requests)
- View (navigates to item)
- Dismiss

**Footer Actions**:

- Mark All Read
- Notification Settings (configure preferences)

**Badge Behavior**:

- Unread count in widget header
- Updates in real-time
- Cleared when notification clicked or dismissed

---

### 4.10 Financial Snapshot Widget

**Widget Size**: Medium (6 columns)

**Layout for Admin/PM**:

```
┌─────────────────────────────────────────────────────┐
│ 💰 FINANCIAL SNAPSHOT                               │
├─────────────────────────────────────────────────────┤
│ OUTSTANDING INVOICES                                │
│ $45,000                                             │
│ 8 invoices • 1 overdue                              │
├─────────────────────────────────────────────────────┤
│ BILLED THIS MONTH                                   │
│ $120,000 / $150,000 target (80%)                    │
│ [Progress bar]                                      │
├─────────────────────────────────────────────────────┤
│ TOP CLIENT                                          │
│ Acme Studios - $35,000 YTD                          │
├─────────────────────────────────────────────────────┤
│ PROFIT MARGIN                                       │
│ 34% (Target: 30%)                                   │
│ [↗ +2% from last month]                             │
├─────────────────────────────────────────────────────┤
│         [View Invoices] [Generate Report]           │
└─────────────────────────────────────────────────────┘
```

**Layout for Client**:

```
┌─────────────────────────────────────────────────────┐
│ 💰 YOUR ACCOUNT                                     │
├─────────────────────────────────────────────────────┤
│ CURRENT BALANCE                                     │
│ $12,500 due                                         │
│ Next payment: Nov 30, 2025                          │
├─────────────────────────────────────────────────────┤
│ RECENT INVOICES                                     │
│ Invoice #1234 - $8,000 [Paid]                       │
│ Invoice #1235 - $12,500 [Due Nov 30]                │
├─────────────────────────────────────────────────────┤
│ PROJECT BUDGETS                                     │
│ Mobile App: $45K spent / $50K total (90%)           │
│ [Progress bar]                                      │
├─────────────────────────────────────────────────────┤
│         [Pay Now] [View Invoice] [Download]         │
└─────────────────────────────────────────────────────┘
```

**Metric Displays**:

- Large number for primary value
- Contextual information below
- Progress bars where applicable
- Status indicators for targets
- Trend arrows showing change

**Interactive Elements**:

- Click metrics to see detailed breakdown
- Hover to see historical data
- Action buttons for common tasks

---

### 4.11 Intake Pipeline Widget

**Widget Size**: Medium (6 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ 📊 INTAKE PIPELINE                                  │
├─────────────────────────────────────────────────────┤
│ IN TREATMENT                      8 requests        │
│ [████████░░] Avg age: 2 days                        │
├─────────────────────────────────────────────────────┤
│ ON HOLD                           3 requests        │
│ [███░░░░░░░] Avg wait: 6 days ⚠️                    │
├─────────────────────────────────────────────────────┤
│ ESTIMATION                        12 requests       │
│ [████████████████░░] Avg time: 1 day                │
├─────────────────────────────────────────────────────┤
│ READY                             5 requests        │
│ [█████░░░░░] Awaiting routing                       │
├─────────────────────────────────────────────────────┤
│ CAPACITY: Can accept 8 more requests               │
│                              [View Intake Board]    │
└─────────────────────────────────────────────────────┘
```

**Stage Display**:

- Stage name
- Request count
- Progress bar showing relative volume
- Average time in stage
- Warning indicators if threshold exceeded

**Capacity Indicator**:

- Calculated based on team availability
- Shows how many new requests can be accepted
- Updates in real-time

**Click Behavior**:

- Click stage to navigate to Intake filtered by that stage
- Click request count to see list of requests in that stage

---

### 4.12 Performance Trends Widget

**Widget Size**: Medium (6 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ 📊 TRENDS (Last 30 Days)                            │
├─────────────────────────────────────────────────────┤
│ VELOCITY                                            │
│ [Mini line chart showing trend]                     │
│ ↗ +12% increase                                     │
│ Current: 13 pts/sprint • Avg: 11 pts/sprint         │
├─────────────────────────────────────────────────────┤
│ REVENUE                                             │
│ [Mini line chart showing trend]                     │
│ ↗ +8% increase                                      │
│ Current: $120K/mo • Target: $150K/mo                │
├─────────────────────────────────────────────────────┤
│ DELIVERY TIME                                       │
│ [Mini line chart showing trend]                     │
│ ↗ -2 days improvement                               │
│ Current: 5 days avg • Target: 7 days               │
├─────────────────────────────────────────────────────┤
│                          [View Full Analytics]      │
└─────────────────────────────────────────────────────┘
```

**Trend Section Structure**:

- Metric name
- Mini sparkline chart (30 days)
- Trend direction arrow and percentage change
- Current value
- Target or average for comparison
- Color coding: Green (improving), Yellow (stable), Red (declining)

**Chart Interaction**:

- Hover to see specific data points
- Click to expand to full chart view
- Zoom controls for date range

---

### 4.13 Risk Indicators Widget

**Widget Size**: Medium (6 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ ⚠️ PROJECT HEALTH SCORES                            │
├─────────────────────────────────────────────────────┤
│ Customer Portal                                     │
│ [██████████████████░░] 88% - Healthy ✓              │
│ Schedule: On track • Budget: On track               │
├─────────────────────────────────────────────────────┤
│ Mobile App                                          │
│ [█████████████░░░░░░] 64% - At Risk ⚠️               │
│ Schedule: Behind • Budget: On track                 │
│ Issue: Resource constraint                          │
├─────────────────────────────────────────────────────┤
│ CMS System                                          │
│ [████████████████░░░░] 80% - Monitor                 │
│ Schedule: On track • Budget: 90% spent              │
├─────────────────────────────────────────────────────┤
│ E-Commerce Platform                                 │
│ [██████░░░░░░░░░░░░░░] 30% - Critical 🔴             │
│ Schedule: 3 weeks behind • Budget: Over by 15%      │
│ Multiple blockers identified                        │
├─────────────────────────────────────────────────────┤
│                           [View Risk Report]        │
└─────────────────────────────────────────────────────┘
```

**Project Health Display**:

- Project name (clickable to project details)
- Health score progress bar
- Percentage score with status label
- Status icon (checkmark, warning, critical)
- Key indicators: Schedule status, Budget status
- Issue description if at risk

**Health Score Calculation**:

- Displayed formula in tooltip on hover
- Factors: Schedule performance, Budget performance, Quality metrics
- Weighted average shown

**Sorting**:

- Default: Worst health scores at top
- Can toggle to show best scores first
- Filter to show only at-risk projects

---

### 4.14 Blockers & Notifications Widget

**Widget Size**: Medium (4 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ ⚠️ BLOCKERS & NOTIFICATIONS (4)                     │
├─────────────────────────────────────────────────────┤
│ [⛔] Waiting on API docs (#234)                     │
│      Blocked for: 3 days                            │
│      Blocking: Emma, Noah                           │
│      [Escalate] [View Task]                         │
├─────────────────────────────────────────────────────┤
│ [👁] Code review requested (PR #89)                 │
│      Waiting for: Ava Jones                         │
│      Age: 6 hours                                   │
│      [Review Now] [Dismiss]                         │
├─────────────────────────────────────────────────────┤
│ [⚠] Merge conflict on feature branch                │
│      Branch: feature/user-auth                      │
│      Conflicts: 3 files                             │
│      [Resolve] [View Details]                       │
├─────────────────────────────────────────────────────┤
│ [🔴] Build failing on staging                       │
│      Last success: 2 hours ago                      │
│      Error: Database connection                     │
│      [View Logs] [Retry Build]                      │
└─────────────────────────────────────────────────────┘
```

**Blocker Item Structure**:

- Blocker type icon
- Blocker description
- Duration/age information
- Who/what is blocked
- Quick action buttons
- Severity indicator

**Blocker Types** (with icons):

- External dependency
- Code review pending
- Merge conflict
- Build/deployment failure
- Resource unavailable
- Approval needed

**Action Buttons**:

- Primary action (resolve, review, escalate)
- Secondary action (view details, dismiss)

---

### 4.15 System Health Widget (Admin Only)

**Widget Size**: Small (3 columns)

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ ⚙️ SYSTEM HEALTH                                    │
├─────────────────────────────────────────────────────┤
│ STATUS                                              │
│ ✅ All Systems Operational                          │
├─────────────────────────────────────────────────────┤
│ USERS                                               │
│ 18/20 active (90%)                                  │
├─────────────────────────────────────────────────────┤
│ BACKUP                                              │
│ ✓ Last: 2 hours ago                                 │
│ Next: In 22 hours                                   │
├─────────────────────────────────────────────────────┤
│ UPTIME                                              │
│ 99.8% (30 days)                                     │
├─────────────────────────────────────────────────────┤
│        [View Logs] [Status Page]                    │
└─────────────────────────────────────────────────────┘
```

**Status Indicator**:

- Large status message with icon
- Color: Green (operational), Yellow (degraded), Red (down)

**Metrics**:

- Simple label-value pairs
- Icons for quick scanning
- Timestamps for time-based data

**Quick Links**:

- System logs
- Public status page
- Admin controls

---

### 4.16 Focus Mode Interface

**Activation**: Click "Enable Focus Mode" button in Quick Actions or keyboard shortcut

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ [Exit Focus Mode]                       [Timer: 0:45]│
└─────────────────────────────────────────────────────┘

        ┌─────────────────────────────────────────┐
        │                                         │
        │         YOUR CURRENT TASK               │
        │                                         │
        │  Fix login bug                          │
        │  Customer Portal Project                │
        │  Due: Today at 5:00 PM                  │
        │                                         │
        │  [Task description displayed here       │
        │   with full details and acceptance      │
        │   criteria...]                          │
        │                                         │
        │                                         │
        │  Time logged: 2h 34m                    │
        │  Story points: 2                        │
        │                                         │
        │                                         │
        │  [Pause Timer]  [Mark Complete]         │
        │                                         │
        └─────────────────────────────────────────┘
```

**Focus Mode Characteristics**:

- Centered single task card
- Large, readable text
- Minimal UI chrome
- Timer displayed prominently
- Only essential task information shown
- All other widgets hidden
- Notifications silenced (except critical system alerts)
- Distraction-free background

**Exit Options**:

- Exit Focus Mode button (returns to full Overview)
- Keyboard shortcut (ESC or F11)
- Automatic exit when task marked complete
- Scheduled end time

---

## 5. Responsive Design Breakpoints

### 5.1 Desktop (1920px and above)

**Grid**: 12 columns

**Widget Layout**:

- Organization Health: 12 columns (full width)
- Critical Alerts: 12 columns (full width)
- My Work Today: 6 columns
- Current Sprint: 6 columns
- Upcoming Deadlines: 4 columns
- Recent Activity: 4 columns
- Team Status: 4 columns
- Communication Hub: 6 columns
- Financial Snapshot: 6 columns

**Navigation**:

- Full horizontal Quick Actions bar
- All action buttons visible

### 5.2 Tablet (768px - 1919px)

**Grid**: 8 columns

**Widget Layout**:

- Organization Health: 8 columns (full width)
- Critical Alerts: 8 columns (full width)
- My Work Today: 8 columns (full width)
- Current Sprint: 8 columns (full width)
- All other widgets: 8 columns (stacked vertically)

**Navigation**:

- Quick Actions bar with overflow menu
- Top 5-6 actions visible, rest in "More" menu

**Adjustments**:

- Team Status cards: 2-3 visible with horizontal scroll
- Charts may be simplified
- Some widget sections may collapse by default

### 5.3 Mobile (below 768px)

**Grid**: 4 columns (effectively single column)

**Widget Layout**:

- All widgets: 4 columns (full width)
- All widgets stack vertically
- Widget height may be reduced (show top items only)

**Navigation**:

- Quick Actions: Hamburger menu
- Top 3 actions visible as icon-only buttons
- Rest accessible via menu drawer

**Adjustments**:

- Tables become lists
- Charts may be hidden or very simplified
- "View More" links more prominent
- Horizontal scrolling for team member cards
- Collapsible sections default to collapsed
- Reduced information density per widget

**Gestures**:

- Swipe to refresh dashboard
- Pull to see more items in widget
- Tap and hold for quick actions menu

---

## 6. Customization Interface

### 6.1 Edit Mode Activation

**Method 1**: Click "Customize Dashboard" button in header

**Method 2**: Long-press (or right-click) on any widget to enter edit mode

**Visual Changes When Edit Mode Active**:

- All widgets show drag handle icon
- Widget borders become more prominent
- "Add Widget" button appears
- "Done Editing" button replaces "Customize" button
- Slight background color change to indicate edit mode

### 6.2 Widget Manipulation

**Drag and Drop**:

- Click and hold drag handle on widget header
- Widget lifts with shadow effect
- Other widgets shift to show drop zones
- Drop zone indicators show valid placement areas
- Release to place widget in new position
- Other widgets reflow automatically

**Resize**:

- Resize handle appears in widget bottom-right corner
- Click and drag to resize
- Grid snapping ensures alignment
- Minimum and maximum sizes enforced
- Content reflows within new size

**Remove**:

- Click "X" icon in widget header action menu
- Confirmation dialog: "Remove [Widget Name] from dashboard?"
- Options: "Remove" or "Cancel"
- Widget fades out and surrounding widgets reflow

### 6.3 Add Widget Interface

**Activation**: Click "Add Widget" button (appears when in edit mode)

**Interface**:

```
┌─────────────────────────────────────────────────────┐
│ Add Widget to Dashboard                    [Close X]│
├─────────────────────────────────────────────────────┤
│ Search widgets...                          [Search] │
├─────────────────────────────────────────────────────┤
│ AVAILABLE WIDGETS                                   │
│                                                     │
│ [Preview]  Organization Health                      │
│            Shows key org metrics and trends         │
│            Size: Large           [+ Add]            │
│                                                     │
│ [Preview]  My Work Today                            │
│            Your assigned tasks                      │
│            Size: Medium          [+ Add]            │
│                                                     │
│ [Preview]  Team Status                              │
│            Team capacity overview                   │
│            Size: Large           [+ Add]            │
│                                                     │
│ [...additional widgets...]                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Widget Catalog**:

- List of all available widgets
- Preview image/icon
- Widget name
- Brief description
- Default size
- "Add" button
- Widgets already on dashboard are disabled with "Added" label

**Search/Filter**:

- Search by widget name
- Filter by category
- Filter by size
- Filter by role (shows only relevant widgets)

### 6.4 Save and Reset

**Save Changes**:

- "Done Editing" button in header
- Clicking saves layout to user profile
- Confirmation message: "Dashboard layout saved"
- Exits edit mode

**Reset to Default**:

- "Reset to Default" button available in customization mode
- Confirmation dialog: "This will restore default layout. Continue?"
- Options: "Reset" or "Cancel"
- Resets to role-specific default layout
- Does not delete widgets, just restores default arrangement

### 6.5 Layout Presets (Future Enhancement)

**Interface for saving multiple layouts**:

```
┌─────────────────────────────────────────────────────┐
│ Dashboard Layouts                                   │
├─────────────────────────────────────────────────────┤
│ [●] Default View (Current)                          │
│ [ ] Sprint Focus                                    │
│ [ ] Financial Review                                │
│ [ ] Team Management                                 │
│                                                     │
│ [+ Create New Layout]                               │
└─────────────────────────────────────────────────────┘
```

---

## 7. Interaction Patterns

### 7.1 Loading States

**Initial Page Load**:

- Header loads first
- Skeleton screens for all widgets
- Widgets load independently as data arrives
- Loading indicator in widget header while loading
- No blocking - user can interact with loaded widgets

**Widget Refresh**:

- Small loading spinner in widget header
- Content remains visible (not replaced by spinner)
- Smooth transition when new data arrives
- Error state if refresh fails

### 7.2 Error Handling

**Widget Error**:

```
┌─────────────────────────────────────────────────────┐
│ ❌ Widget Title                                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│              [Error Icon]                           │
│                                                     │
│     Unable to load widget data                      │
│     Error: Connection timeout                       │
│                                                     │
│              [Retry]  [Report Issue]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Partial Data Error**:

- Widget loads with available data
- Warning banner at top: "Some data unavailable"
- Retry button in banner

**Complete System Error**:

- Full-screen error message
- Error details
- Retry button
- Link to status page
- Contact support option

### 7.3 Empty States

**No Data Available**:

```
┌─────────────────────────────────────────────────────┐
│ Widget Title                                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│            [Illustration]                           │
│                                                     │
│         No tasks assigned yet                       │
│                                                     │
│     Tasks will appear here once assigned            │
│                                                     │
│            [Browse Backlog]                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**First-Time User**:

- Welcome message overlay
- Guided tour option
- Sample data displayed with labels
- "Dismiss" or "Take Tour" buttons

### 7.4 Real-Time Updates

**New Activity Indicator**:

- Badge appears on relevant widget
- Number shows count of new items
- Click to scroll to new items
- Items highlighted briefly then fade to normal

**Auto-Refresh**:

- Occurs every 30 seconds automatically
- No page reload
- Smooth data replacement
- User's scroll position maintained

**Notification Toast**:

- Appears in top-right corner
- Brief message (e.g., "New comment on Task #123")
- Auto-dismisses after 5 seconds
- Click to navigate to source
- Queue multiple notifications

### 7.5 Navigation from Widgets

**Click Behaviors**:

- Widget title: Often no action (static)
- Widget body content: Navigates to relevant detail page
- "View More" links: Navigate to full list/detail page
- Action buttons: Execute action or open modal
- Chart/metric: Opens analytics view

**Link Styling**:

- Clickable items have hover state
- Cursor changes to pointer
- Subtle underline or color change
- Consistent across all widgets

---

## 8. Accessibility Features

### 8.1 Keyboard Navigation

**Tab Order**:

1. Quick Actions bar (left to right)
2. Widget grid (top to bottom, left to right)
3. Within each widget: Header actions → Body content → Footer actions

**Keyboard Shortcuts**:

- `Tab`: Move to next interactive element
- `Shift + Tab`: Move to previous element
- `Enter`: Activate focused element
- `Space`: Toggle checkboxes, expand/collapse
- `Escape`: Close modals, exit edit mode
- `F11`: Toggle Focus Mode
- `Ctrl/Cmd + R`: Refresh dashboard
- `Ctrl/Cmd + F`: Search within page

**Focus Indicators**:

- Clear outline around focused element
- High contrast focus indicator
- Visible on all interactive elements

### 8.2 Screen Reader Support

**ARIA Labels**:

- All interactive elements have descriptive labels
- Icons have text alternatives
- Charts have text summaries
- Dynamic content updates announced

**Landmarks**:

- Header region defined
- Main content region defined
- Widget regions with labels
- Navigation structures clearly marked

**Live Regions**:

- Activity feed updates announced
- Alert notifications announced
- Timer updates announced (at intervals)

### 8.3 Visual Accessibility

**Color Blindness**:

- Status not conveyed by color alone
- Icons accompany color indicators
- Patterns used in charts
- Text labels for all states

**Contrast**:

- Text meets WCAG AA contrast ratio (4.5:1)
- Interactive elements meet contrast requirements
- Focus indicators have sufficient contrast

**Text Sizing**:

- Support for browser text zoom up to 200%
- Layout remains functional when zoomed
- No horizontal scrolling when text enlarged
- Minimum font size: 14px

**Reduced Motion**:

- Respect prefers-reduced-motion setting
- Disable animations for users who prefer
- Instant transitions instead of animated
- Keep critical animations only

---

## 9. Performance Considerations

### 9.1 Optimization Strategies

**Lazy Loading**:

- Widgets below fold load on demand
- Large datasets paginated
- Images lazy loaded
- Charts render on viewport entry

**Caching**:

- Widget data cached for 30 seconds
- User preferences cached locally
- Static assets cached aggressively

**Efficient Rendering**:

- Virtual scrolling for long lists
- Debounced search inputs
- Throttled scroll events
- Memoized components

### 9.2 Data Loading Priority

**Critical Path**:

1. User authentication and role detection
2. Quick Actions bar
3. Critical Alerts widget
4. My Work Today widget
5. Other widgets in viewport
6. Widgets below fold

**Background Loading**:

- Real-time updates after initial load
- Analytics data loads last
- Non-essential widgets deferred

---

## 10. Design Tokens and Standards

### 10.1 Spacing System

**Base Unit**: 8px

**Spacing Scale**:

- xs: 4px (0.5 units)
- sm: 8px (1 unit)
- md: 16px (2 units)
- lg: 24px (3 units)
- xl: 32px (4 units)
- 2xl: 48px (6 units)
- 3xl: 64px (8 units)

**Application**:

- Widget padding: md (16px)
- Widget gap: md (16px)
- Section spacing: lg (24px)
- Page margins: xl (32px)

### 10.2 Typography Hierarchy

**Levels**:

- H1: Page title (Overview)
- H2: Widget titles
- H3: Section headers within widgets
- Body: Regular content
- Small: Metadata, timestamps
- Caption: Helper text

**Line Heights**:

- Headers: 1.2
- Body: 1.5
- Tight: 1.3 (for lists)

### 10.3 Icon System

**Icon Sizes**:

- Small: 16px (inline with text)
- Medium: 24px (standalone icons)
- Large: 32px (feature icons)

**Icon Usage**:

- Consistent icons for same concepts
- Icons always accompanied by labels (or aria-labels)
- Icon library predefined
- Custom icons match style

### 10.4 Interactive Elements

**Buttons**:

- Minimum touch target: 44x44px
- Padding: sm to md depending on importance
- Border radius: 4px
- Clear hover and active states

**Links**:

- Underline on hover
- Sufficient color contrast
- Visited state (for external links)

**Form Inputs**:

- Clear labels
- Error states with messages
- Helper text when needed
- Consistent sizing

---

## 11. Component Library Reference

### 11.1 Shared Components

**Avatar Component**:

- Displays user image or initials
- Fallback to initials if no image
- Size variants: sm, md, lg
- Status indicator optional

**Badge Component**:

- Small label for status/count
- Variants: default, success, warning, error, info
- Position: standalone or attached to element

**Button Component**:

- Variants: primary, secondary, tertiary, danger
- Sizes: sm, md, lg
- States: default, hover, active, disabled, loading
- Icon support: left, right, icon-only

**Card Component**:

- Container for widget content
- Header, body, footer sections
- Shadow/elevation variants
- Hover states optional

**Progress Bar Component**:

- Linear progress indicator
- Percentage label optional
- Color variants based on status
- Animated or static

**Tooltip Component**:

- Shows on hover or focus
- Position: top, right, bottom, left (auto-adjust)
- Max width: 300px
- Arrow pointing to target

**Modal/Dialog Component**:

- Centered on screen
- Backdrop overlay
- Close button (X) in header
- Keyboard accessible (ESC to close)
- Focus trap within modal

**Dropdown Menu Component**:

- Triggered by button or icon
- List of actions
- Icons optional
- Dividers for grouping
- Keyboard navigable

### 11.2 Widget-Specific Components

**Metric Display**:

- Large number
- Label
- Trend indicator
- Target comparison

**List Item**:

- Icon/avatar
- Primary text
- Secondary text
- Metadata
- Actions (right-aligned)

**Timeline Item**:

- Timestamp
- Event description
- Actor information
- Related object link

**Status Indicator**:

- Dot or icon
- Label
- Color-coded
- Tooltip with details

**Chart Wrapper**:

- Title
- Time period selector
- Chart area
- Legend
- Zoom/pan controls

---

## 12. Future Design Considerations

### 12.1 Planned Enhancements

**Dark Mode**:

- Alternative color scheme
- Reduced eye strain
- Toggle in user settings
- Respects system preference

**Advanced Customization**:

- Custom widget builder
- Formula-based metrics
- Conditional formatting
- Data source selection

**Collaboration Features**:

- Shared dashboards
- Comments on widgets
- Real-time co-viewing
- Dashboard templates

**AI-Powered Features**:

- Smart widget suggestions
- Anomaly detection alerts
- Predictive insights
- Natural language queries

### 12.2 Mobile App Considerations

**Native Mobile Design**:

- Bottom navigation for primary actions
- Swipe gestures for quick actions
- Native notifications
- Offline mode with sync

**Widget Adaptations**:

- Simplified mobile widgets
- Prioritized information
- Swipeable cards
- Pull-to-refresh

---

## 13. Approval & Version Control

**Design Document Prepared By**: [Name]  
**Date**: [Date]

**Reviewed By**: [Name]  
**Date**: [Date]

**Approved By**: [Name]  
**Date**: [Date]

**Revision History**:

- v1.0 - Initial design document - [Date]

---

**End of Design Document**
