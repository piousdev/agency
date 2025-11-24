# Change: Add Role-Based Overview Dashboard

## Why

The Business Center currently lacks a centralized command center. Users must navigate through multiple pages to find critical information, leading to:

1. **Inefficient workflows** - No quick overview of daily priorities
2. **Delayed response to issues** - Critical alerts buried in different views
3. **Role mismatch** - All users see the same interface regardless of their needs
4. **No customization** - Users cannot arrange widgets to match their workflow

This feature addresses these gaps by providing a role-based, customizable dashboard that surfaces the most relevant information for each user.

## What Changes

### New Overview Dashboard

- Create `/dashboard/business-center/overview` as the default landing page
- Implement role-based widget system with 12+ widgets
- Add drag-and-drop customization with layout persistence
- Implement real-time data refresh (30-second intervals)
- Add responsive grid system (12/8/4 columns for desktop/tablet/mobile)

### Widget System

- **Quick Actions Bar** - Role-specific action buttons
- **Organization Health** - Admin/PM system health metrics
- **My Work Today** - Individual contributor task queue
- **Critical Alerts** - Urgent issues requiring attention
- **Current Sprint** - Sprint progress and burndown
- **Upcoming Deadlines** - Calendar view of deadlines
- **Recent Activity** - Activity feed with filtering
- **Team Status** - Team capacity and utilization
- **Communication Hub** - Notifications and mentions
- **Financial Snapshot** - Role-appropriate financial data
- **Intake Pipeline** - Request queue status
- **Risk Indicators** - Project risk assessment

### State Management

- TanStack Query v5 for server state with 30s auto-refresh
- Zustand v5 with persist middleware for layout preferences
- Socket.IO for critical real-time alerts

### Database Additions

- `user_dashboard_preferences` table for layout persistence
- `widget_configurations` table for widget-specific settings

## Impact

### Affected Specs

- `business-center` - Add Overview as primary navigation item (new capability)

### Affected Code

**New Routes:**

- `apps/web/src/app/(default)/dashboard/business-center/overview/page.tsx`
- `apps/web/src/app/(default)/dashboard/business-center/overview/layout.tsx`
- `apps/web/src/app/(default)/dashboard/business-center/overview/client.tsx`

**New Components:**

- `apps/web/src/components/overview/` - All dashboard widgets and shared components
- `apps/web/src/components/overview/widgets/` - Individual widget implementations
- `apps/web/src/components/overview/shared/` - Widget container, grid, etc.

**New State:**

- `apps/web/src/lib/stores/dashboard-store.ts` - Zustand store
- `apps/web/src/lib/api/overview/` - TanStack Query hooks

**New API Routes:**

- `apps/api/src/routes/overview/` - Widget data endpoints

**Database:**

- New Drizzle schema in `apps/api/src/db/schema/dashboard-preferences.ts`
- Migration for new tables

### Dependencies on Other Changes

- Builds on completed `add-business-center-crud` (Phases 1-13)
- Uses existing permission system from RBAC implementation
- Integrates with existing activity logging system

### Technology Stack

| Category      | Technology        | Rationale                                 |
| ------------- | ----------------- | ----------------------------------------- |
| Server State  | TanStack Query v5 | Auto-refresh, caching, optimistic updates |
| Client State  | Zustand v5        | Persist middleware for layout preferences |
| Drag-and-Drop | @dnd-kit          | Modern hooks API, WCAG accessibility      |
| Charts        | Recharts          | SSR-safe, responsive, lightweight         |
| Real-time     | Socket.IO         | Critical alerts with <5s latency          |
