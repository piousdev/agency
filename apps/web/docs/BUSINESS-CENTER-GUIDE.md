# Business Center User Guide

**Version**: 1.0.0
**Last Updated**: November 9, 2025
**Audience**: Internal Agency Team Members

---

## Table of Contents

1. [Overview](#overview)
2. [Accessing the Business Center](#accessing-the-business-center)
3. [Dashboard Sections](#dashboard-sections)
4. [Common Workflows](#common-workflows)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [Capacity Management Guide](#capacity-management-guide)
9. [FAQ](#faq)
10. [Support & Feedback](#support--feedback)
11. [Release Notes](#release-notes)
12. [Appendix: Technical Details](#appendix-technical-details)

---

## Overview

The **Business Center** is the central command hub for internal agency operations. It provides a unified dashboard for:

- **Intake Management**: Process and assign new client requests
- **Active Work Tracking**: Monitor ongoing content and software projects
- **Team Capacity Planning**: Visualize and manage team member workload
- **Delivery Scheduling**: Track upcoming project milestones
- **Performance Insights**: Review recently completed work

### Who Can Access?

- **Internal Team Members Only** (agency staff with `isInternal = true`)
- Requires active authentication session

### Key Features

- **Real-time Updates**: Server-rendered data ensures accuracy
- **Stage-Based Grouping**: Projects organized by production/development stage
- **Capacity Warnings**: Visual indicators for overloaded team members
- **Bulk Operations**: Assign multiple team members to projects
- **Responsive Design**: Works on desktop, tablet, and mobile devices

---

## Accessing the Business Center

### URL

```
https://your-domain.com/dashboard/business-center
```

### Navigation

1. Log in to the agency dashboard
2. Click **Business Center** in the main navigation sidebar
3. If you don't see this option, you may not have internal access (contact your administrator)

### Access Control

**Server-Side Protection**:

- Unauthenticated users → Redirected to `/login`
- Authenticated external users → Redirected to `/dashboard`
- Internal team members → Full access

**Client-Side Optimization**:

- Uses `useBusinessCenterAccess()` hook for immediate feedback
- Prevents unnecessary page loads for unauthorized users

---

## Dashboard Sections

The Business Center is divided into six key sections:

### 1. Intake Queue

**Purpose**: Manage new client requests awaiting assignment

**Features**:

- Priority-based color coding (Critical, High, Medium, Low)
- Client name and request details
- Submission date tracking
- Single-click assignment to team members

**Empty State**: "No pending intake requests"

**Actions**:

- **Assign**: Click to assign ticket to a team member (single-select)

**Priority Levels**:

- **Critical**: Red badge - Immediate attention required
- **High**: Orange badge - Address within 24 hours
- **Medium**: Blue badge - Standard priority
- **Low**: Gray badge - Address when capacity allows

---

### 2. Active Work - Content

**Purpose**: Track creative/media production projects

**Stage Groups**:

- **Pre-Production**: Projects in planning/early development (<30% complete)
- **In-Production**: Active content creation (30-79% complete)
- **Post-Production**: Final review and delivery (≥80% complete)

**Features**:

- Client name and project title
- Completion percentage progress bars
- Assigned team members (avatars/initials)
- Status badges
- Change Assignee button

**Empty State**: "No active content projects"

**Filters**: Only shows projects where `client.type === 'creative'`

---

### 3. Active Work - Software

**Purpose**: Track software development projects

**Stage Groups**:

- **Design**: Initial architecture and UX design (<20% complete)
- **Development**: Active coding (20-69% complete)
- **Testing**: QA and bug fixes (70-94% complete)
- **Delivery**: Final deployment prep (≥95% complete)

**Features**:

- Same as Active Work - Content
- Different stage grouping logic optimized for software workflows

**Empty State**: "No active software projects"

**Filters**: Shows projects where `client.type IN ('software', 'full_service')`

---

### 4. Team Capacity

**Purpose**: Monitor and manage team member workload

**Features**:

- Team member name and role
- Current capacity percentage (0-200%)
- Active project count
- Status indicator with color coding
- Update Capacity button

**Capacity Status Levels**:

- **Available** (0-79%): Green indicator - Can take on more work
- **At Capacity** (80-99%): Yellow indicator - Near maximum workload
- **Overloaded** (100%+): Red indicator - Over capacity, avoid new assignments

**Empty State**: "No team members"

**Actions**:

- **Update Capacity**: Adjust team member's capacity percentage

---

### 5. Delivery Calendar

**Purpose**: View upcoming project deliverables

**Features**:

- Chronological list of projects due in the next 30 days
- Client name and project title
- Delivery date
- Status badge
- Assigned team members

**Empty State**: "No upcoming deliveries"

**Sorting**: Ordered by delivery date (earliest first)

---

### 6. Recently Completed

**Purpose**: Track completed work for reporting and retrospectives

**Features**:

- Projects completed in the last 30 days
- Client name and project title
- Completion date
- Status badge (should show "Completed")
- Assigned team members

**Empty State**: "No recently completed projects"

**Sorting**: Ordered by completion date (most recent first)

---

## Common Workflows

### Workflow 1: Assigning an Intake Ticket

1. Navigate to the **Intake Queue** section
2. Identify the ticket to assign (check priority and description)
3. Click **Assign** button for that ticket
4. **Assign Modal** opens (single-select radio buttons)
5. Review team member capacity indicators:
   - Green: Available
   - Yellow: At capacity
   - Red: Overloaded (warning message displayed)
6. Select one team member
7. Click **Assign** button in modal
8. Success message appears
9. Modal closes automatically
10. Ticket moves out of Intake Queue

**Tip**: Avoid assigning to overloaded team members unless urgent.

---

### Workflow 2: Changing Project Assignees

1. Go to **Active Work - Content** or **Active Work - Software**
2. Locate the project to reassign
3. Click **Change Assignee** button
4. **Assign Modal** opens (multi-select checkboxes)
5. Check/uncheck team members as needed
6. Review capacity warnings (if any)
7. Click **Assign** button
8. Success message appears
9. Modal closes automatically
10. Project card updates with new assignees

**Tip**: Projects can have multiple assignees.

---

### Workflow 3: Updating Team Member Capacity

1. Navigate to **Team Capacity** section
2. Find the team member to update
3. Click **Update Capacity** button
4. **Capacity Modal** opens
5. Enter new capacity percentage (0-200%)
6. Review capacity guidelines in modal:
   - 0-79%: Available
   - 80-99%: At capacity
   - 100%+: Overloaded
7. Click **Update** button
8. Success message appears
9. Modal closes automatically
10. Team member row updates with new capacity

**Tip**: Update capacity at the start of each sprint or when priorities shift.

---

### Workflow 4: Monitoring Project Progress

1. Check **Active Work** sections for current projects
2. Review completion percentages and stage groupings
3. Identify projects in Post-Production (≥80%) or Delivery (≥95%)
4. Contact assigned team members for status updates
5. Use completion % to estimate time to delivery
6. Cross-reference with **Delivery Calendar** for due dates

**Tip**: Projects stuck in one stage for too long may need intervention.

---

### Workflow 5: Planning New Assignments

1. Review **Team Capacity** section
2. Identify team members with <80% capacity (Available status)
3. Check **Intake Queue** for pending requests
4. Match ticket priority with team member availability
5. Consider team member skills/experience (not shown in UI, use your knowledge)
6. Assign tickets to available team members
7. Monitor capacity changes in real-time

**Tip**: Balance workload across team to avoid bottlenecks.

---

## Keyboard Shortcuts

Currently, the Business Center does not implement custom keyboard shortcuts. Standard browser shortcuts apply:

- **Refresh Page**: `Cmd+R` (Mac) / `Ctrl+R` (Windows)
- **Focus Search**: Use browser's "Find on Page" (`Cmd+F` / `Ctrl+F`)
- **Tab Navigation**: Use `Tab` to navigate between interactive elements
- **Modal Close**: `Esc` to close open modals

**Future Enhancement**: Custom shortcuts may be added in a future release.

---

## Troubleshooting

### Issue: "Cannot Access Business Center" (Redirected to Dashboard)

**Cause**: You are not marked as an internal team member.

**Solution**:

1. Contact your administrator
2. Request internal access (`isInternal = true` in user account)
3. Log out and log back in after access is granted

---

### Issue: "No Data Showing" (All Sections Empty)

**Cause**: No data exists in the system OR data hasn't loaded yet.

**Solution**:

1. Refresh the page (`Cmd+R` / `Ctrl+R`)
2. Check browser console for errors (Developer Tools → Console)
3. Verify you have an active internet connection
4. If issue persists, contact technical support

---

### Issue: "Assign Modal Not Opening"

**Cause**: JavaScript error or slow network connection.

**Solution**:

1. Hard refresh the page (`Cmd+Shift+R` / `Ctrl+Shift+R`)
2. Clear browser cache
3. Try a different browser (Chrome, Firefox, Safari)
4. Check browser console for error messages

---

### Issue: "Capacity Update Not Saving"

**Cause**: Validation error OR server connection issue.

**Solution**:

1. Ensure capacity is between 0-200%
2. Check for error messages in the modal
3. Verify you have permission to update capacity
4. Try again with a different value
5. If issue persists, check your network connection

---

### Issue: "Projects Not Moving Between Stages"

**Cause**: Completion percentage threshold not met.

**Solution**:

1. Check current completion % of the project
2. Review stage threshold rules (see Appendix)
3. Update project completion % if needed (use project management tools)
4. Refresh the Business Center page to see updated grouping

**Example**: A content project at 75% completion is in "In-Production". To move it to "Post-Production", update completion to ≥80%.

---

## Best Practices

### For Intake Management

- **Triage Daily**: Review Intake Queue at the start of each day
- **Prioritize Correctly**: Use Critical/High for urgent client needs
- **Balance Workload**: Check capacity before assigning
- **Document Context**: Add notes to tickets before assigning (if feature available)

### For Project Tracking

- **Update Completion Weekly**: Keep completion % current for accurate stage grouping
- **Review Stuck Projects**: Investigate projects in same stage >2 weeks
- **Monitor Delivery Dates**: Check Delivery Calendar daily for upcoming deadlines
- **Celebrate Completions**: Review Recently Completed section for team wins

### For Capacity Planning

- **Weekly Capacity Reviews**: Update capacity every Monday
- **Account for Non-Project Work**: Include meetings, admin tasks in capacity %
- **Avoid Chronic Overload**: Address 100%+ capacity immediately (redistribute work)
- **Plan for Time Off**: Reduce capacity in advance for vacations/holidays

### For Team Collaboration

- **Communicate Changes**: Notify team members when reassigning projects
- **Respect Capacity Limits**: Don't override warnings without discussion
- **Use Multi-Assign**: Assign pairs/teams to complex projects
- **Track Patterns**: Note which team members excel at which project types

---

## Capacity Management Guide

### Understanding Capacity Percentages

**Capacity** represents the % of a team member's work hours allocated to active projects.

- **0%**: No active assignments (available for new work)
- **50%**: Half of work hours allocated
- **100%**: Fully allocated (no room for new work)
- **150%**: Overallocated (working overtime or juggling priorities)

### Calculating Capacity

**Formula**: `(Total Project Hours Assigned / Available Work Hours) × 100`

**Example**:

- Team member works 40 hours/week
- Assigned to Project A (20 hours/week) and Project B (15 hours/week)
- Total assigned: 35 hours
- Capacity: `(35 / 40) × 100 = 87.5%` → **At Capacity**

### When to Update Capacity

- **New Assignment**: Increase by estimated project hours
- **Project Completion**: Decrease by completed project hours
- **Scope Change**: Adjust based on new project requirements
- **Time Off**: Reduce available hours temporarily
- **Team Member Request**: Adjust based on feedback (burnout, bandwidth)

### Capacity Status Meanings

| Status      | Range  | Color  | Meaning               | Action                                |
| ----------- | ------ | ------ | --------------------- | ------------------------------------- |
| Available   | 0-79%  | Green  | Can take on more work | Assign new projects                   |
| At Capacity | 80-99% | Yellow | Near maximum workload | Avoid new assignments unless critical |
| Overloaded  | 100%+  | Red    | Over capacity         | Redistribute work or extend deadlines |

### Best Practices

1. **Buffer Zone**: Aim for 70-80% capacity to allow for unexpected tasks
2. **Update Regularly**: Review and adjust capacity weekly
3. **Communicate**: Discuss capacity with team members directly
4. **Be Realistic**: Account for meetings, admin work, context switching
5. **Address Overload**: Never leave team members at 100%+ for extended periods

---

## FAQ

### General

**Q: Who can access the Business Center?**
A: Only internal team members (agency staff with `isInternal = true`). Clients and external users cannot access this page.

**Q: How often is data refreshed?**
A: Data is server-rendered on every page load. Refresh the page to see the latest updates.

**Q: Can I filter or search within sections?**
A: Not currently. Future versions may include search/filter functionality.

**Q: Can I export data to CSV or Excel?**
A: Not currently. This is a planned feature for a future release.

---

### Intake Queue

**Q: What happens to a ticket after it's assigned?**
A: It moves out of the Intake Queue and becomes a tracked project (visible in Active Work sections).

**Q: Can I assign a ticket to multiple team members?**
A: No, tickets use single-select assignment. Once assigned, it becomes a project that can have multiple assignees.

**Q: How do I change the priority of a ticket?**
A: Priority is set when the ticket is created. Contact your administrator or use the project management system to update it.

---

### Active Work

**Q: Why is my project in the wrong stage?**
A: Stage grouping is automatic based on completion %. Check the thresholds in the Appendix and update the project's completion percentage.

**Q: Can I manually move a project between stages?**
A: No, stage grouping is automatic. Update the completion % to move projects.

**Q: What's the difference between Content and Software sections?**
A: They use different stage grouping logic optimized for each workflow type. Projects are filtered by client type.

---

### Team Capacity

**Q: What does 150% capacity mean?**
A: The team member is assigned 1.5x their normal work hours. This indicates overallocation and potential burnout risk.

**Q: Can capacity be over 200%?**
A: The system allows up to 200%, but this should never happen in practice. Address immediately.

**Q: How do I reduce someone's capacity?**
A: Click "Update Capacity" and enter a lower percentage. Then reassign or postpone some of their projects.

---

### Delivery Calendar

**Q: How far ahead does the calendar show?**
A: 30 days from today.

**Q: Can I change a project's delivery date here?**
A: No, delivery dates are managed in the project management system. This is a read-only view.

**Q: What if a project is late?**
A: It will still show in the calendar until the status is updated to "Completed" or the delivery date is changed in the source system.

---

## Support & Feedback

### Getting Help

- **Technical Issues**: Contact IT Support at `it@agency.com`
- **Access Problems**: Contact your administrator
- **Feature Requests**: Submit via internal feedback form
- **Bug Reports**: Create a ticket in the issue tracker

### Providing Feedback

We welcome your input on improving the Business Center. Please include:

1. **What you were trying to do**: Describe the task or workflow
2. **What happened**: Specific behavior or error
3. **What you expected**: Desired outcome
4. **Screenshots**: If applicable (remove sensitive data)
5. **Browser & OS**: e.g., "Chrome 120 on macOS 14.5"

### Training Resources

- **Video Walkthrough**: Available in the internal knowledge base
- **Live Training Sessions**: Held monthly (check internal calendar)
- **Quick Reference Card**: Downloadable PDF (link in dashboard)

---

## Release Notes

### Version 1.0.0 (November 9, 2025)

**Initial Release**

**Features**:

- Intake Queue with priority-based color coding
- Active Work tracking for Content and Software projects
- Team Capacity management with status indicators
- Delivery Calendar (30-day view)
- Recently Completed projects tracking
- Single-select ticket assignment
- Multi-select project assignment
- Capacity warnings for overloaded team members
- Responsive design for all device sizes

**Access Control**:

- Server-side authentication with Better-Auth
- Internal team member restriction
- Client-side UX optimization hooks

**Testing**:

- Backend unit tests for all server actions
- Frontend component tests
- E2E Playwright tests for critical workflows

**Known Limitations**:

- No search/filter functionality
- No export to CSV/Excel
- No custom keyboard shortcuts
- No bulk operations (multi-ticket assignment)

---

## Appendix: Technical Details

### Stage Grouping Logic

#### Content Projects (Creative)

| Stage           | Completion % | Description                              |
| --------------- | ------------ | ---------------------------------------- |
| Pre-Production  | <30%         | Planning, scripting, storyboarding       |
| In-Production   | 30-79%       | Active content creation, filming, design |
| Post-Production | ≥80%         | Editing, review, final delivery          |

**Code**:

```typescript
if (
  project.status === 'proposal' ||
  (project.status === 'in_development' && project.completionPercentage < 30)
) {
  return 'Pre-Production';
} else if (
  project.status === 'in_review' ||
  (project.status === 'in_development' && project.completionPercentage >= 80)
) {
  return 'Post-Production';
} else {
  return 'In-Production';
}
```

#### Software Projects (Software/Full-Service)

| Stage       | Completion % | Description                             |
| ----------- | ------------ | --------------------------------------- |
| Design      | <20%         | Architecture, UX design, planning       |
| Development | 20-69%       | Active coding, feature implementation   |
| Testing     | 70-94%       | QA, bug fixes, performance optimization |
| Delivery    | ≥95%         | Final deployment, documentation         |

**Code**:

```typescript
if (
  project.status === 'proposal' ||
  (project.status === 'in_development' && project.completionPercentage < 20)
) {
  return 'Design';
} else if (project.status === 'in_development' && project.completionPercentage >= 70) {
  if (project.completionPercentage >= 95) {
    return 'Delivery';
  }
  return 'Testing';
} else {
  return 'Development';
}
```

---

### Data Interfaces

#### BusinessCenterData

```typescript
interface BusinessCenterData {
  intakeTickets: TicketWithRelations[];
  activeProjects: ProjectWithRelations[];
  teamMembers: TeamMember[];
  upcomingDeliveries: ProjectWithRelations[];
  recentlyCompleted: ProjectWithRelations[];
}
```

#### TicketWithRelations

```typescript
interface TicketWithRelations {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  clientId: string;
  client: {
    id: string;
    name: string;
    type: 'creative' | 'software' | 'full_service';
  };
  assignedToId?: string;
  assignedTo?: TeamMember;
  createdAt: Date;
  updatedAt: Date;
}
```

#### ProjectWithRelations

```typescript
interface ProjectWithRelations {
  id: string;
  name: string;
  description?: string;
  status: 'proposal' | 'in_development' | 'in_review' | 'completed';
  completionPercentage: number;
  deliveryDate?: Date;
  clientId: string;
  client: {
    id: string;
    name: string;
    type: 'creative' | 'software' | 'full_service';
  };
  assignees: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

#### TeamMember

```typescript
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  isInternal: boolean;
  capacityPercentage: number;
  activeProjectCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Server Actions

| Action                          | Purpose                        | Input                                             | Output                         |
| ------------------------------- | ------------------------------ | ------------------------------------------------- | ------------------------------ |
| `createIntakeAction`            | Create new intake ticket       | FormData (clientId, title, description, priority) | Success/Error with ticket data |
| `assignTicketAction`            | Assign ticket to team member   | ticketId, FormData (assignedToId)                 | Success/Error                  |
| `assignProjectAction`           | Assign project to team members | projectId, FormData (userIds[])                   | Success/Error                  |
| `updateProjectStatusAction`     | Update project status          | projectId, FormData (status)                      | Success/Error                  |
| `updateProjectCompletionAction` | Update completion %            | projectId, FormData (completionPercentage)        | Success/Error                  |
| `updateCapacityAction`          | Update team member capacity    | userId, FormData (capacityPercentage)             | Success/Error                  |

All actions use `useActionState` hook and revalidate `/dashboard/business-center` on success.

---

### CSS Variables

The Business Center uses semantic CSS variables defined in `globals.css`:

```css
--success: 142 76% 36%; /* Green - Available status */
--warning: 38 92% 50%; /* Yellow - At capacity */
--error: 0 84% 60%; /* Red - Overloaded */
--info: 217 91% 60%; /* Blue - Informational */
--primary: 222 47% 11%; /* Brand color */
--muted: 210 40% 96%; /* Background/borders */
```

**Usage**: `className="text-success bg-success/10 border-success/20"`

---

### Performance Considerations

- **Server Components**: All display components are Server Components for optimal performance
- **Client Components**: Only interactive elements (modals, triggers) use 'use client'
- **Data Fetching**: Single data fetch in page.tsx, props passed down
- **Filtering**: Client-side filtering of activeProjects (minimal overhead)
- **Revalidation**: Cache revalidation on mutations ensures fresh data

---

### Security

- **Authentication**: Better-Auth session validation
- **Authorization**: `requireUser()` + `isInternal` check on every page load
- **CSRF Protection**: Built into Next.js Server Actions
- **Input Validation**: Zod schemas for all form inputs
- **SQL Injection**: Protected by Drizzle ORM parameterized queries

---

### Browser Compatibility

**Supported Browsers**:

- Chrome/Edge 120+
- Firefox 120+
- Safari 17+

**Not Supported**:

- Internet Explorer (end of life)
- Browsers with JavaScript disabled

---

### Accessibility

**Current Implementation**:

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliant with WCAG 2.1 AA

**Future Improvements**:

- Screen reader optimizations
- Focus indicators
- Skip navigation links
- High contrast mode support

---

**End of User Guide**

For the latest version of this document, visit the internal knowledge base or check the repository at `apps/web/docs/BUSINESS-CENTER-GUIDE.md`.
