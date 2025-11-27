# Technical Design: Overview Dashboard

## Context

The Overview Dashboard is a role-based command center for the Business Center.
It requires complex state management, real-time updates, and customizable
layouts while maintaining the Server-First architecture defined in
`apps/web/ARCHITECTURE.md`.

### Stakeholders

- Internal team (Admin, PM, Developer, Designer, QA roles)
- External clients (read-only, limited widget visibility)

### Constraints

- Must follow Server-First architecture with Client Islands
- Use existing UI components (Card, Dialog, Skeleton, etc.)
- Integrate with existing Better-Auth session system
- Maintain <2s initial load time
- Support WCAG 2.1 AA accessibility standards

## Goals / Non-Goals

### Goals

- Provide role-based dashboard with personalized widgets
- Enable drag-and-drop widget customization
- Implement 30-second data auto-refresh
- Support real-time critical alerts
- Persist user preferences across sessions
- Responsive design for all viewport sizes

### Non-Goals

- Real-time collaboration on shared dashboards
- Widget marketplace or third-party widgets
- Mobile native app (web responsive only)
- Offline mode support

## Decisions

### 1. Architecture: Server-First with Islands

**Decision**: Use Server Components for data fetching with Client Islands for
interactivity.

```
┌─────────────────────────────────────────────────────────────┐
│ Server Components (page.tsx, layout.tsx)                    │
│ - Role-based access control                                 │
│ - Initial data fetching                                     │
│ - Widget visibility determination                           │
├─────────────────────────────────────────────────────────────┤
│ Client Island (client.tsx)                                  │
│ - DndContext for drag-drop                                  │
│ - QueryClientProvider for TanStack Query                    │
│ - Zustand store access                                      │
│ - Real-time socket connection                               │
└─────────────────────────────────────────────────────────────┘
```

**Rationale**: Reduces client bundle size, enables server-side role checks,
follows existing architecture patterns.

### 2. State Management: TanStack Query + Zustand

**Decision**: Separate server and client state concerns.

| State Type   | Solution          | Purpose                              |
| ------------ | ----------------- | ------------------------------------ |
| Server State | TanStack Query v5 | Widget data, caching, mutations      |
| Client State | Zustand v5        | Layout, edit mode, collapsed widgets |
| Session      | Better-Auth       | User role, permissions               |

**Query Pattern**:

```typescript
export function useOrganizationHealth() {
  return useQuery({
    queryKey: ['widget', 'organization-health'],
    queryFn: fetchOrganizationHealth,
    refetchInterval: 30000, // 30 seconds per spec
    staleTime: 25000,
  });
}
```

**Store Pattern**:

```typescript
export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set) => ({
        layout: getDefaultLayoutForRole(),
        editMode: false,
        collapsedWidgets: new Set(),
        setLayout: (layout) => set({ layout }),
        toggleEditMode: () => set((s) => ({ editMode: !s.editMode })),
      }),
      { name: 'dashboard-preferences' }
    )
  )
);
```

### 3. Drag-and-Drop: @dnd-kit

**Decision**: Use @dnd-kit/core + @dnd-kit/sortable for widget reordering.

**Rationale**:

- Modern React hooks API
- Built-in keyboard accessibility (WCAG requirement)
- Grid sorting strategy for dashboard layouts
- Touch device support
- Small bundle size (~15KB)

**Alternatives Considered**:

- react-beautiful-dnd: Deprecated, no longer maintained
- Pragmatic DnD: Newer but less battle-tested
- react-dnd: Lower-level, requires more setup

### 4. Real-Time Updates: Hybrid Approach

**Decision**: Polling for widgets, WebSocket for critical alerts.

| Update Type     | Method                 | Interval   |
| --------------- | ---------------------- | ---------- |
| Widget data     | TanStack Query polling | 30 seconds |
| Critical alerts | Socket.IO              | <5 seconds |
| Activity feed   | Socket.IO              | Real-time  |

**Rationale**: Most widget data tolerates 30s staleness. Critical alerts need
immediate delivery.

### 5. Responsive Grid: CSS Grid with Tailwind

**Decision**: 12/8/4 column grid with breakpoints.

```typescript
const WIDGET_SIZES = {
  small: { desktop: 'col-span-3', tablet: 'col-span-4', mobile: 'col-span-4' },
  medium: { desktop: 'col-span-6', tablet: 'col-span-8', mobile: 'col-span-4' },
  large: { desktop: 'col-span-12', tablet: 'col-span-8', mobile: 'col-span-4' },
};
```

### 6. Charts: Recharts

**Decision**: Use Recharts for all visualizations.

**Rationale**:

- Declarative React components
- ResponsiveContainer for widget sizing
- SSR-safe (important for Next.js)
- Lightweight (~45KB)
- Perfect for sparklines and trend charts

## Database Schema

```sql
CREATE TABLE user_dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  layout JSONB NOT NULL DEFAULT '[]',
  collapsed_widgets TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE widget_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, widget_type)
);
```

## Risks / Trade-offs

### Risk: Widget data load causing slow initial render

**Mitigation**: Skeleton loading states, parallel data fetching, prioritize
above-fold widgets.

### Risk: Socket connection instability

**Mitigation**: Auto-reconnect with exponential backoff, fallback to polling.

### Risk: Layout persistence conflicts across devices

**Mitigation**: Store layout per-device or prompt user to sync.

### Trade-off: Polling vs WebSocket for all data

**Decision**: Polling for most data (simpler, more reliable), WebSocket only for
critical alerts.

## Migration Plan

1. **Phase 1**: Database schema and API endpoints
2. **Phase 2**: Base widget framework and layout system
3. **Phase 3**: Core widgets (Quick Actions, My Work Today, Critical Alerts)
4. **Phase 4**: Additional widgets and customization
5. **Phase 5**: Real-time updates and polish
6. **Phase 6**: Accessibility audit and testing

### Rollback

- Feature flag for entire Overview section
- Database migrations are additive (no breaking changes)
- Existing Business Center views remain functional

## Open Questions

1. Should widget preferences sync across devices?
2. Should we support "Focus Mode" that hides non-essential widgets?
3. What is the retention policy for activity feed data?
