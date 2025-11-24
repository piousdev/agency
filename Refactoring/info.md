Excellent! So **Overview** is a **role-based dashboard** that shows contextually relevant information based on who's logged in.

## Overview (Role-Based Dashboard)

### For **Project Owner (PO)**:

```
┌─────────────────────────────────────────────────────┐
│ OVERVIEW - Project Owner                            │
├─────────────────────────────────────────────────────┤
│ 🔴 NEEDS ATTENTION                                   │
│ • 5 Requests needing review (Intake)                │
│ • 3 Projects at risk (over budget/behind schedule)  │
│ • 2 Estimates pending your approval                 │
│                                                      │
│ 📊 THIS WEEK                                         │
│ • 4 Projects delivering this week                   │
│ • 12 Tasks in review awaiting approval             │
│ • Sprint 24 ends in 3 days (78% complete)          │
│                                                      │
│ 💰 FINANCIALS                                        │
│ • $45K pending invoices                            │
│ • Team utilization: 82%                            │
│ • 3 Projects over budget                           │
│                                                      │
│ 👥 TEAM STATUS                                       │
│ • Emma Miller: 5 active tasks                      │
│ • Noah Rodriguez: Overloaded (12 story points)    │
│ • Ava Jones: Available capacity                    │
└─────────────────────────────────────────────────────┘
```

### For **Developer**:

```
┌─────────────────────────────────────────────────────┐
│ OVERVIEW - Emma Miller (Developer)                  │
├─────────────────────────────────────────────────────┤
│ 📋 MY WORK TODAY                                     │
│ • [In Progress] Fix login bug (2 pts) - 2h logged  │
│ • [To Do] Add payment gateway (5 pts) - Due today  │
│ • [Code Review] User profile page - Awaiting review│
│                                                      │
│ 🚀 THIS SPRINT (Sprint 24)                          │
│ • 8/13 story points completed                       │
│ • 3 tasks remaining                                 │
│ • Sprint ends in 3 days                            │
│                                                      │
│ ⚠️ BLOCKERS & NOTIFICATIONS                          │
│ • Waiting on API docs for task #234               │
│ • @mentioned in 2 comments                         │
│ • Code review requested on your PR                │
│                                                      │
│ ⏱️ TIME TRACKING                                     │
│ • This week: 28h logged / 40h capacity            │
│ • Today: 6h logged                                 │
└─────────────────────────────────────────────────────┘
```

### For **Designer**:

```
┌─────────────────────────────────────────────────────┐
│ OVERVIEW - Sophia Johnson (Designer)                │
├─────────────────────────────────────────────────────┤
│ 📋 MY WORK TODAY                                     │
│ • [In Progress] Homepage mockup (3 pts)            │
│ • [In Review] Logo concepts - Client feedback      │
│ • [To Do] Social media templates (2 pts)           │
│                                                      │
│ 💬 FEEDBACK & APPROVALS                              │
│ • 3 design reviews pending                         │
│ • Client approved Brand Guide v2                   │
│ • 2 revision requests from PM                      │
│                                                      │
│ 📅 UPCOMING DEADLINES                                │
│ • Mobile App mockups - Due Nov 28                  │
│ • Video editing - Due Nov 30                       │
│                                                      │
│ ⏱️ TIME TRACKING                                     │
│ • This week: 32h logged / 40h capacity            │
└─────────────────────────────────────────────────────┘
```

### For **Project Manager**:

```
┌─────────────────────────────────────────────────────┐
│ OVERVIEW - Project Manager                          │
├─────────────────────────────────────────────────────┤
│ 🔴 CRITICAL                                          │
│ • 2 Projects behind schedule                        │
│ • 4 Tasks overdue                                   │
│ • 1 Client waiting 3+ days for response            │
│                                                      │
│ 📊 ACTIVE PROJECTS (8)                               │
│ • Customer Portal - 88% (on track)                 │
│ • Mobile App - 64% (at risk - resource issue)      │
│ • CMS System - 80% (on track)                      │
│                                                      │
│ 👥 TEAM CAPACITY                                     │
│ • 3 developers: 85% utilized                       │
│ • 2 designers: 95% utilized (overloaded)           │
│ • 1 QA: 60% utilized (available)                   │
│                                                      │
│ 📋 PENDING ACTIONS                                   │
│ • 6 Estimates need assignment                      │
│ • 3 Tasks need sprint assignment                   │
│ • 5 Invoices ready to send                        │
└─────────────────────────────────────────────────────┘
```

### For **QA Tester**:

```
┌─────────────────────────────────────────────────────┐
│ OVERVIEW - QA Tester                                │
├─────────────────────────────────────────────────────┤
│ 🧪 READY FOR TESTING                                │
│ • 5 tasks in "Ready for Test" status               │
│ • 2 bug fixes to verify                            │
│                                                      │
│ 🐛 ACTIVE BUGS                                       │
│ • 3 bugs assigned to me (Priority: High)           │
│ • 12 open bugs across all projects                 │
│                                                      │
│ ✅ TODAY'S TESTING                                   │
│ • Test payment integration (5 pts)                 │
│ • Verify mobile responsiveness (3 pts)             │
└─────────────────────────────────────────────────────┘
```

### For **Client** (if they have access):

```
┌─────────────────────────────────────────────────────┐
│ OVERVIEW - Acme Studios (Client)                    │
├─────────────────────────────────────────────────────┤
│ 📊 YOUR PROJECTS                                     │
│ • E-commerce Platform - 75% complete                │
│ • Brand Redesign - In Review (awaiting approval)   │
│                                                      │
│ 💬 ACTION REQUIRED                                   │
│ • 2 deliverables awaiting your approval            │
│ • 1 request needs more information                 │
│                                                      │
│ 📅 UPCOMING DELIVERIES                               │
│ • Mobile App Beta - Nov 26, 2025                   │
│ • Marketing Assets - Nov 30, 2025                  │
│                                                      │
│ 📧 RECENT UPDATES                                    │
│ • Homepage mockups uploaded - 2 hours ago          │
│ • Sprint 24 completed - yesterday                  │
└─────────────────────────────────────────────────────┘
```

---

## So the Complete Navigation Structure:

```
1. Overview (Role-based dashboard)
   - Shows different widgets based on user role
   - Customizable (users can add/remove widgets)
   - Real-time updates

2. Intake
   ├─ In Treatment
   ├─ On Hold
   ├─ Estimation
   └─ Ready (to be routed)

3. Projects (13+ story points)
   ├─ Planning
   ├─ Active
   ├─ In Review
   └─ Completed

4. Work (0-8 story points)
   ├─ Backlog
   ├─ To Do
   ├─ In Progress
   ├─ Code Review
   ├─ In Review
   └─ Done

5. Clients
   - Client list & details
   - Communication history
   - Projects per client

6. Team
   - Team members
   - Capacity & workload
   - Time tracking
   - Availability calendar

7. Financials
   - Invoices
   - Budgets
   - Time reports
   - Profitability per project
```

---

## Does this capture the vision?

The key being:

- **Overview** = Personalized command center (different for each role)
- Rest of navigation = Functional areas

Should I now create the full user stories document with this structure?
