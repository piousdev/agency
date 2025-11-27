# Intake Pipeline - Design Document

## Overview

The Intake Pipeline provides a visual workflow for processing incoming work
requests. This document covers the UI/UX design decisions and component
architecture.

## Layout Structure

```
┌────────────────────────────────────────────────────────────────┐
│ Business Center > Intake Pipeline                    [+ New]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────┬──────────┬────────────┬─────────┐               │
│  │In Treatmt│ On Hold  │ Estimation │  Ready  │               │
│  │   (12)   │   (5)    │    (8)     │   (3)   │               │
│  └──────────┴──────────┴────────────┴─────────┘               │
│                                                                │
│  ┌─────────────┐  ┌─────────────────────────────────────────┐ │
│  │   Filters   │  │                                         │ │
│  │             │  │   Request Cards / Table View            │ │
│  │  □ Urgent   │  │                                         │ │
│  │  □ High     │  │   ┌─────────────────────────────────┐   │ │
│  │  □ Medium   │  │   │ [!] Feature: Dark Mode Toggle   │   │ │
│  │  □ Low      │  │   │ Type: New Feature               │   │ │
│  │             │  │   │ Priority: High                  │   │ │
│  │  Type       │  │   │ Requester: John Smith           │   │ │
│  │  □ New      │  │   │ Age: 2 days (warning)           │   │ │
│  │  □ Change   │  │   └─────────────────────────────────┘   │ │
│  │  □ Bug      │  │                                         │ │
│  │             │  │   [More cards...]                       │ │
│  │  [Clear]    │  │                                         │ │
│  └─────────────┘  └─────────────────────────────────────────┘ │
│                                                                │
│  [1] [2] [3] ... [Next]                                       │
└────────────────────────────────────────────────────────────────┘
```

## Stage Navigation

### Stage Tabs

Each stage shows a badge with the count of requests in that stage. Active stage
is highlighted with primary color underline.

### Aging Indicators

- **Green**: Within threshold
- **Yellow**: 75%+ of threshold elapsed
- **Red**: Threshold exceeded (aging)

| Stage        | Warning (75%) | Critical (100%) |
| ------------ | ------------- | --------------- |
| In Treatment | 36 hours      | 48 hours        |
| On Hold      | 4.5 days      | 6 days          |
| Estimation   | 18 hours      | 24 hours        |
| Ready        | 9 hours       | 12 hours        |

## Request Card Design

```
┌─────────────────────────────────────────────────────┐
│ [●] Feature: Dark Mode Toggle for Settings     [⋮] │
│                                                     │
│ Type: New Feature    Priority: ████ High           │
│ Requester: John Smith (Acme Corp)                  │
│ Submitted: Nov 15, 2025                            │
│                                                     │
│ "Users have requested a dark mode option for..."   │
│                                                     │
│ ┌─────────┐  ┌─────────────┐  ┌──────────────────┐ │
│ │ 2 days  │  │ Related: ━━ │  │ Assigned: Jane D │ │
│ │ ⚠ aging │  │             │  │                  │ │
│ └─────────┘  └─────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Card States

- **Default**: Normal border
- **Selected**: Primary color border (for bulk operations)
- **Warning**: Yellow left border (aging soon)
- **Critical**: Red left border (aged out)

## Request Submission Form

### Multi-Step Flow

```
Step 1          Step 2          Step 3          Step 4
[●]────────────[○]────────────[○]────────────[○]
Basic Info      Description     Context        Timeline

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Basic Information
┌─────────────────────────────────────────────────────┐
│ Title *                                             │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Brief title for your request                    │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Request Type *                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▼ Select type...                                │ │
│ └─────────────────────────────────────────────────┘ │
│ • New Feature - Brand new functionality             │
│ • Change Request - Modify existing feature          │
│ • Bug Report - Something isn't working              │
│ • Technical Debt - Internal improvement             │
│                                                     │
│ Priority *                                          │
│ ○ Low  ○ Medium  ○ High  ○ Urgent                   │
│                                                     │
│                              [Cancel] [Next →]      │
└─────────────────────────────────────────────────────┘
```

### Type-Dependent Fields

| Field                  | New Feature | Change Request | Bug Report | Tech Debt |
| ---------------------- | ----------- | -------------- | ---------- | --------- |
| Related Project        | Optional    | Required       | Required   | Optional  |
| Business Justification | Required    | Required       | Optional   | Required  |
| Steps to Reproduce     | Hidden      | Hidden         | Required   | Hidden    |
| Affected Version       | Hidden      | Hidden         | Required   | Hidden    |

## Estimation Form

```
┌─────────────────────────────────────────────────────┐
│ Estimate: Feature - Dark Mode Toggle                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Story Points (T-Shirt Sizing)                       │
│                                                     │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ XS  │ │  S  │ │  M  │ │  L  │ │ XL  │ │ XXL │   │
│ │  1  │ │  2  │ │  3  │ │  5  │ │  8  │ │ 13  │   │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘   │
│                         ▲ Selected                  │
│                                                     │
│ Estimation Confidence                               │
│ ○ Low - Many unknowns, spike needed                 │
│ ● Medium - Some assumptions, reasonable estimate    │
│ ○ High - Well understood, confident                 │
│                                                     │
│ Notes (optional)                                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ May need design input for color schemes...      │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│                    [Cancel] [Submit Estimation]     │
└─────────────────────────────────────────────────────┘
```

## Routing Decision Modal

```
┌─────────────────────────────────────────────────────┐
│ Route Request                                   [×] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Request: Dark Mode Toggle                           │
│ Story Points: 5 │ Confidence: Medium                │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │  Recommended: Create as Ticket                  │ │
│ │  Based on: 5 story points (≤8 = Ticket)         │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Override recommendation?                            │
│ ○ Create as Ticket (recommended)                    │
│ ○ Create as Project                                 │
│                                                     │
│ Destination Project (if Ticket)                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▼ Select project...                             │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│                      [Cancel] [Convert to Ticket]   │
└─────────────────────────────────────────────────────┘
```

## Mobile Responsive Design

### Breakpoints

- **Desktop**: 1280px+ (full layout)
- **Tablet**: 768px-1279px (collapsed sidebar)
- **Mobile**: <768px (stacked, bottom sheet filters)

### Mobile Stage Navigation

```
┌─────────────────────────────────────┐
│ ◀ │ In Treatment (12) │ ▶           │
│     ━━━━━━━━━━━━━━━━━━━             │
└─────────────────────────────────────┘
```

### Mobile Card View

Full-width cards with swipe actions:

- Swipe right: Move to next stage
- Swipe left: Move to previous stage

## Component Architecture

```
intake/
├── page.tsx                    # Server Component (data fetching)
├── client.tsx                  # Client Component (interactivity)
├── views/
│   ├── cards-view.tsx          # Card grid layout
│   ├── table-view.tsx          # Table layout
│   └── kanban-view.tsx         # Kanban board (future)
├── new/
│   └── page.tsx                # Multi-step submission form
└── [id]/
    └── page.tsx                # Request details page

components/intake/
├── stage-tabs.tsx              # Stage navigation with counts
├── request-card.tsx            # Request card component
├── request-details.tsx         # Details panel/page
├── filters/
│   ├── filter-sidebar.tsx      # Desktop filter sidebar
│   └── filter-sheet.tsx        # Mobile bottom sheet
└── forms/
    ├── request-form.tsx        # Multi-step submission
    ├── estimation-form.tsx     # Story points form
    └── routing-form.tsx        # Routing decision

lib/stores/
└── intake-store.ts             # Zustand store (filters, drafts, view mode)

lib/api/intake/
├── queries.ts                  # TanStack Query queries
└── mutations.ts                # TanStack Query mutations
```

## Accessibility Requirements

1. **Keyboard Navigation**
   - Tab through stage tabs, cards, and actions
   - Enter/Space to select, Escape to cancel
   - Arrow keys for stage navigation

2. **Screen Readers**
   - Stage counts announced: "In Treatment, 12 requests"
   - Aging status announced: "Warning, request aging, 2 days old"
   - Live regions for real-time updates

3. **Focus Management**
   - Focus trapped in modals
   - Focus restored after modal close
   - Skip links for main content

4. **Color Independence**
   - Icons + text for priority (not just color)
   - Patterns/icons for aging status
   - High contrast mode support
