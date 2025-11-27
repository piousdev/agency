# Overview Navigation - Technology Recommendations

## Document Information

- **Component**: Overview (Role-Based Dashboard)
- **Version**: 1.0
- **Last Updated**: November 23, 2025
- **Status**: Research Complete
- **Research Method**: Context7 Documentation Analysis

---

## Executive Summary

The Overview Navigation is a complex role-based dashboard with 500+ tasks across
15 phases. Based on thorough research of the specification, design documents,
and current 2025 best practices via Context7, this document outlines the
recommended technology stack that aligns with the existing architecture
(Next.js, TypeScript, shadcn/ui, Tailwind CSS, Better-Auth).

---

## 1. Core Architecture Pattern

### Server-First with Islands Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Server Components (Default)                                  │
│ - Layout, Page shells, Widget containers                     │
│ - Data fetching with async/await                            │
│ - Role-based access control                                  │
├─────────────────────────────────────────────────────────────┤
│ Client Components (Islands)                                  │
│ - Interactive widgets (drag-drop, charts)                   │
│ - Real-time updates                                          │
│ - User customization                                         │
└─────────────────────────────────────────────────────────────┘
```

**Pattern**: Pass Server Component data to Client Components via props (slot
pattern from Next.js 15 docs)

**Rationale**:

- Reduces client JavaScript bundle size
- Enables server-side role checks before rendering
- Allows parallel data fetching at the server level
- Follows existing apps/web/ARCHITECTURE.md patterns

---

## 2. Technology Stack

### 2.1 State Management

| Layer            | Technology             | Purpose                                     | Benchmark Score |
| ---------------- | ---------------------- | ------------------------------------------- | --------------- |
| **Server State** | TanStack Query v5      | Widget data fetching, caching, mutations    | 87.3            |
| **Client State** | Zustand v5             | Dashboard layout, UI preferences, edit mode | 89.3            |
| **Session**      | Better-Auth (existing) | User role, permissions                      | N/A             |

#### Why This Combination

**TanStack Query v5**:

- 30-second auto-refresh capability (matches spec requirement)
- Optimistic updates for mutations
- Query prefetching for performance
- Built-in cache invalidation
- Query key management for widget data

**Zustand v5**:

- Persist middleware for layout preferences
- DevTools integration for debugging
- Slices pattern for organized state
- Minimal boilerplate
- SSR-safe

#### Implementation Pattern

```typescript
// lib/stores/dashboard-store.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface DashboardState {
  layout: WidgetLayout[];
  editMode: boolean;
  collapsedWidgets: Set<string>;
  setLayout: (layout: WidgetLayout[]) => void;
  toggleEditMode: () => void;
  toggleWidgetCollapse: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set) => ({
        layout: getDefaultLayoutForRole(),
        editMode: false,
        collapsedWidgets: new Set(),
        setLayout: (layout) => set({ layout }),
        toggleEditMode: () => set((s) => ({ editMode: !s.editMode })),
        toggleWidgetCollapse: (id) =>
          set((s) => {
            const collapsed = new Set(s.collapsedWidgets);
            collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id);
            return { collapsedWidgets: collapsed };
          }),
      }),
      { name: 'dashboard-preferences' }
    )
  )
);
```

```typescript
// lib/api/overview/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useOrganizationHealth() {
  return useQuery({
    queryKey: ['widget', 'organization-health'],
    queryFn: fetchOrganizationHealth,
    refetchInterval: 30000, // 30 seconds per spec
    staleTime: 25000,
  });
}

export function useMyWorkToday(filters: TaskFilters) {
  return useQuery({
    queryKey: ['widget', 'my-work-today', filters],
    queryFn: () => fetchMyWorkToday(filters),
    refetchInterval: 30000,
  });
}
```

---

### 2.2 Drag-and-Drop (Widget Customization)

| Library                   | Benchmark Score | Accessibility        | Maintenance   |
| ------------------------- | --------------- | -------------------- | ------------- |
| **@dnd-kit**              | 87.6            | ✅ Full WCAG support | ✅ Active     |
| Pragmatic DnD (Atlassian) | 89.7            | ✅ Good              | ✅ Active     |
| react-beautiful-dnd       | N/A             | ✅ Good              | ❌ Deprecated |
| react-dnd                 | N/A             | ⚠️ Basic             | ⚠️ Minimal    |

#### Recommended: `@dnd-kit/core` + `@dnd-kit/sortable`

**Why dnd-kit**:

- Modern React hooks API
- Built-in keyboard accessibility (WCAG 2.1 AA requirement)
- Grid sorting strategy for dashboard layouts
- Drag handles support for widget headers
- Touch device support
- Collision detection algorithms
- Small bundle size (~15KB)

#### Implementation Pattern

```typescript
// components/overview/widget-grid.tsx
'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

export function WidgetGrid({ widgets, onReorder }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      onReorder(arrayMove(widgets, oldIndex, newIndex));
    }
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgets} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-12 gap-4">
          {widgets.map((widget) => (
            <SortableWidget key={widget.id} widget={widget} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? <WidgetPreview id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

```typescript
// components/overview/sortable-widget.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableWidget({ widget }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(widgetSizeClasses[widget.size])}
    >
      <WidgetContainer
        widget={widget}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
```

---

### 2.3 Charting Library

| Library       | Benchmark Score | Bundle Size       | SSR Support       | React Native |
| ------------- | --------------- | ----------------- | ----------------- | ------------ |
| **Recharts**  | 86.6            | ~45KB             | ✅ Yes            | ✅ Yes       |
| Chart.js      | 88.2            | ~65KB             | ⚠️ Wrapper needed | ❌ No        |
| Tremor Charts | 68.9            | Built on Recharts | ✅ Yes            | ✅ Yes       |
| ApexCharts    | 76.8            | ~150KB            | ⚠️ Limited        | ❌ No        |
| ECharts       | 80.2            | ~300KB            | ⚠️ Limited        | ❌ No        |

#### Recommended: `Recharts` v2.x

**Why Recharts**:

- Declarative React components
- ResponsiveContainer for dashboard widgets
- Built-in accessibility in v3.0
- Lightweight bundle
- Perfect for mini sparklines and trend charts
- SSR-safe (important for Next.js)
- Active maintenance

#### Implementation Patterns

```typescript
// Mini sparkline for trend widgets
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

export function SparklineTrend({ data, dataKey, stroke = '#8884d8' }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={2}
          dot={false}
        />
        <Tooltip
          contentStyle={{ fontSize: '12px' }}
          labelFormatter={(label) => `Date: ${label}`}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

```typescript
// Organization Health metrics chart
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function HealthTrendsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="revenue"
          fill="hsl(var(--chart-1))"
          stroke="hsl(var(--chart-1))"
          fillOpacity={0.3}
        />
        <Bar dataKey="tasks" fill="hsl(var(--chart-2))" />
        <Line type="monotone" dataKey="velocity" stroke="hsl(var(--chart-3))" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
```

---

### 2.4 Real-Time Updates

| Method                     | Use Case                       | Latency | Complexity |
| -------------------------- | ------------------------------ | ------- | ---------- |
| **TanStack Query Polling** | Widget data                    | 30s     | Low        |
| **Socket.IO**              | Critical alerts, activity feed | <5s     | Medium     |
| **Server-Sent Events**     | One-way notifications          | <5s     | Low        |

#### Recommended: Hybrid Approach

**Polling (TanStack Query)** for:

- Widget data refresh (30-second intervals per spec)
- Organization health metrics
- Team status
- Sprint information

**Socket.IO** for:

- Critical alerts (immediate)
- Activity feed (real-time)
- Notification updates
- Presence indicators

#### Implementation Pattern

```typescript
// lib/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
}

// hooks/use-realtime-alerts.ts
export function useRealtimeAlerts() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    socket.on('critical-alert', (alert: Alert) => {
      // Update cache immediately
      queryClient.setQueryData(['alerts'], (old: Alert[] = []) => [
        alert,
        ...old,
      ]);

      // Show toast notification
      toast.error(alert.message, {
        action: {
          label: 'View',
          onClick: () => router.push(alert.href),
        },
      });
    });

    socket.on('activity', (activity: Activity) => {
      queryClient.setQueryData(
        ['activity-feed'],
        (old: Activity[] = []) => [activity, ...old].slice(0, 20) // Keep last 20
      );
    });

    // Join user-specific room
    socket.emit('join', { userId: user.id, role: user.role });

    return () => {
      socket.off('critical-alert');
      socket.off('activity');
      socket.disconnect();
    };
  }, [queryClient]);
}
```

```typescript
// API: apps/api/src/routes/ws/index.ts
import { Server } from 'socket.io';

export function setupWebSocket(io: Server) {
  io.on('connection', (socket) => {
    socket.on('join', ({ userId, role }) => {
      socket.join(`user:${userId}`);
      socket.join(`role:${role}`);
    });
  });

  // Broadcast to specific rooms
  function broadcastAlert(alert: Alert, targetRoles: string[]) {
    targetRoles.forEach((role) => {
      io.to(`role:${role}`).emit('critical-alert', alert);
    });
  }

  return { broadcastAlert };
}
```

---

### 2.5 UI Components

#### Base: shadcn/ui (Existing)

Already integrated components to use:

- `Card`, `CardHeader`, `CardContent`, `CardFooter` - Widget containers
- `Dialog` - Modals for configuration
- `Skeleton` - Loading states
- `Button`, `Input`, `Select` - Form elements
- `DropdownMenu` - Widget action menus
- `Tooltip` - Help text and shortcuts
- `Badge` - Status indicators
- `Progress` - Progress bars

#### Dashboard-Specific Components to Build

| Component         | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `WidgetContainer` | Base widget wrapper with header/body/footer |
| `WidgetGrid`      | Drag-drop sortable grid                     |
| `MetricCard`      | KPI display with trend indicator            |
| `SparklineChart`  | Mini trend visualization                    |
| `AlertItem`       | Critical alert with actions                 |
| `TaskCard`        | Task display for "My Work Today"            |
| `TeamMemberCard`  | Team status display                         |
| `QuickActionsBar` | Role-based action buttons                   |

#### Component Structure

```typescript
// components/overview/widget-container.tsx
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, RefreshCw, Settings, X, GripVertical } from 'lucide-react';

interface WidgetContainerProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRefresh?: () => void;
  onRemove?: () => void;
  onConfigure?: () => void;
  dragHandleProps?: any;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function WidgetContainer({
  title,
  icon,
  children,
  footer,
  isLoading,
  isError,
  onRefresh,
  onRemove,
  onConfigure,
  dragHandleProps,
  collapsed,
  onToggleCollapse,
}: WidgetContainerProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              className="cursor-grab hover:bg-muted rounded p-1"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {icon}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Widget options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRefresh && (
                <DropdownMenuItem onClick={onRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </DropdownMenuItem>
              )}
              {onConfigure && (
                <DropdownMenuItem onClick={onConfigure}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </DropdownMenuItem>
              )}
              {onRemove && (
                <DropdownMenuItem onClick={onRemove} className="text-destructive">
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      <CardContent className={cn('flex-1', collapsed && 'hidden')}>
        {isLoading ? (
          <WidgetSkeleton />
        ) : isError ? (
          <WidgetError onRetry={onRefresh} />
        ) : (
          children
        )}
      </CardContent>

      {footer && !collapsed && (
        <CardFooter className="pt-0">{footer}</CardFooter>
      )}
    </Card>
  );
}

function WidgetSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function WidgetError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-sm text-muted-foreground mb-2">
        Unable to load widget data
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}
```

---

### 2.6 Responsive Grid System

#### CSS Grid with Tailwind

```typescript
// lib/constants/grid.ts
export const GRID_BREAKPOINTS = {
  desktop: 1920, // 12 columns
  tablet: 768, // 8 columns
  mobile: 0, // 4 columns (single column effectively)
};

export const WIDGET_SIZES = {
  small: {
    desktop: 'col-span-3', // 1/4 width
    tablet: 'col-span-4', // 1/2 width
    mobile: 'col-span-4', // full width
  },
  medium: {
    desktop: 'col-span-6', // 1/2 width
    tablet: 'col-span-8', // full width
    mobile: 'col-span-4', // full width
  },
  large: {
    desktop: 'col-span-12', // full width
    tablet: 'col-span-8', // full width
    mobile: 'col-span-4', // full width
  },
} as const;

// Helper function
export function getWidgetClasses(size: keyof typeof WIDGET_SIZES) {
  const sizes = WIDGET_SIZES[size];
  return cn(
    sizes.mobile, // Default (mobile)
    `md:${sizes.tablet}`, // Tablet
    `lg:${sizes.desktop}` // Desktop
  );
}
```

```typescript
// Grid container component
export function DashboardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(
      'grid gap-4',
      'grid-cols-4',      // Mobile: 4 columns
      'md:grid-cols-8',   // Tablet: 8 columns
      'lg:grid-cols-12'   // Desktop: 12 columns
    )}>
      {children}
    </div>
  );
}
```

---

## 3. Database Schema Additions

```sql
-- User dashboard preferences
CREATE TABLE user_dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  layout JSONB NOT NULL DEFAULT '[]',
  collapsed_widgets TEXT[] DEFAULT '{}',
  edit_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Widget configurations (for widget-specific settings)
CREATE TABLE widget_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, widget_type)
);

-- Dashboard layout presets (for sharing/templates)
CREATE TABLE dashboard_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  role TEXT NOT NULL, -- 'admin', 'pm', 'developer', etc.
  layout JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES "user"(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Package Installation

```bash
# State Management
pnpm --filter @repo/web add @tanstack/react-query zustand

# Drag and Drop
pnpm --filter @repo/web add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Charting
pnpm --filter @repo/web add recharts

# Real-time (Socket.IO)
pnpm --filter @repo/api add socket.io
pnpm --filter @repo/web add socket.io-client

# Utility (if not already installed)
pnpm --filter @repo/web add date-fns clsx tailwind-merge
```

---

## 5. File Structure

```
apps/web/src/
├── app/(default)/dashboard/
│   └── overview/
│       ├── page.tsx                 # Server Component - data fetching
│       ├── layout.tsx               # Dashboard layout with sidebar
│       └── client.tsx               # Client island with providers
│
├── components/overview/
│   ├── widgets/
│   │   ├── organization-health.tsx  # Admin/PM only
│   │   ├── my-work-today.tsx        # Individual contributors
│   │   ├── critical-alerts.tsx      # Admin/PM only
│   │   ├── current-sprint.tsx       # All roles
│   │   ├── upcoming-deadlines.tsx   # All roles
│   │   ├── recent-activity.tsx      # All roles
│   │   ├── team-status.tsx          # PM/Admin only
│   │   ├── communication-hub.tsx    # All roles
│   │   ├── financial-snapshot.tsx   # Admin/PM/Client
│   │   ├── intake-pipeline.tsx      # Admin/PM only
│   │   ├── risk-indicators.tsx      # Admin/PM only
│   │   ├── blockers.tsx             # Individual contributors
│   │   └── system-health.tsx        # Admin only
│   │
│   ├── shared/
│   │   ├── widget-container.tsx     # Base widget wrapper
│   │   ├── widget-grid.tsx          # Drag-drop grid
│   │   ├── sortable-widget.tsx      # Sortable wrapper
│   │   ├── metric-card.tsx          # KPI display
│   │   ├── sparkline-chart.tsx      # Mini trend chart
│   │   ├── alert-item.tsx           # Alert display
│   │   ├── task-card.tsx            # Task item
│   │   └── team-member-card.tsx     # Team member display
│   │
│   ├── quick-actions-bar.tsx        # Role-based actions
│   ├── customization-panel.tsx      # Add/remove widgets
│   ├── focus-mode.tsx               # Focus mode UI
│   └── providers.tsx                # TanStack Query + Socket provider
│
├── lib/
│   ├── stores/
│   │   └── dashboard-store.ts       # Zustand store
│   │
│   ├── api/overview/
│   │   ├── queries.ts               # TanStack Query hooks
│   │   ├── mutations.ts             # Mutation hooks
│   │   └── types.ts                 # TypeScript types
│   │
│   ├── hooks/
│   │   ├── use-realtime-alerts.ts   # Socket.IO alerts
│   │   └── use-widget-config.ts     # Widget configuration
│   │
│   └── constants/
│       ├── grid.ts                  # Grid breakpoints
│       ├── widgets.ts               # Widget definitions
│       └── roles.ts                 # Role-widget mapping
│
└── types/
    └── overview.ts                  # Overview-specific types
```

---

## 6. Implementation Phases

Based on the task.md, here's the recommended implementation order:

### Phase 1-2: Foundation (Weeks 1-3)

- [ ] Database schema for preferences
- [ ] API endpoints for widget data
- [ ] Base widget framework
- [ ] TanStack Query setup

### Phase 3-5: Core Widgets (Weeks 4-8)

- [ ] Quick Actions Bar
- [ ] Organization Health widget
- [ ] My Work Today widget
- [ ] Critical Alerts widget
- [ ] Current Sprint widget

### Phase 6-7: Customization (Weeks 9-11)

- [ ] Drag-and-drop with dnd-kit
- [ ] Layout persistence with Zustand
- [ ] Responsive breakpoints
- [ ] Widget add/remove UI

### Phase 8-10: Polish (Weeks 12-14)

- [ ] Accessibility (ARIA, keyboard)
- [ ] Performance optimization
- [ ] E2E testing with Playwright

---

## 7. Performance Targets

| Metric             | Target     | How to Achieve                      |
| ------------------ | ---------- | ----------------------------------- |
| Dashboard load     | <2 seconds | Code splitting, parallel data fetch |
| Widget refresh     | 30 seconds | TanStack Query refetchInterval      |
| Real-time updates  | <5 seconds | Socket.IO + optimistic updates      |
| Search/filter      | <1 second  | Client-side filtering               |
| Customization save | <1 second  | Zustand persist                     |

---

## 8. Accessibility Checklist (WCAG 2.1 AA)

- [ ] Full keyboard navigation (dnd-kit supports this)
- [ ] Tab order defined for widgets
- [ ] ARIA labels on all interactive elements
- [ ] ARIA landmarks for regions
- [ ] ARIA live regions for updates
- [ ] Color contrast 4.5:1 minimum
- [ ] Status not conveyed by color alone
- [ ] Reduced motion support (prefers-reduced-motion)
- [ ] Screen reader tested

---

## 9. Security Considerations

- [ ] Role-based widget visibility (Server Components)
- [ ] Client data isolation
- [ ] API authentication on all endpoints
- [ ] Input validation
- [ ] XSS prevention
- [ ] CSRF protection

---

## Appendix: Technology Comparison Details

### Drag-and-Drop Libraries

| Feature          | dnd-kit                | Pragmatic DnD | react-beautiful-dnd |
| ---------------- | ---------------------- | ------------- | ------------------- |
| Hooks API        | ✅                     | ✅            | ❌                  |
| Keyboard support | ✅ Built-in            | ✅ Manual     | ✅ Built-in         |
| Touch support    | ✅                     | ✅            | ✅                  |
| Grid layouts     | ✅ rectSortingStrategy | ✅            | ⚠️ Limited          |
| Tree structures  | ✅                     | ✅            | ⚠️                  |
| Bundle size      | ~15KB                  | ~8KB          | ~30KB               |
| Maintenance      | ✅ Active              | ✅ Active     | ❌ Deprecated       |

### Charting Libraries

| Feature       | Recharts | Chart.js   | Tremor | ApexCharts |
| ------------- | -------- | ---------- | ------ | ---------- |
| React native  | ✅       | ❌ Wrapper | ✅     | ❌ Wrapper |
| SSR support   | ✅       | ⚠️         | ✅     | ⚠️         |
| Declarative   | ✅       | ❌         | ✅     | ⚠️         |
| Accessibility | ✅ v3    | ⚠️         | ✅     | ⚠️         |
| Bundle        | ~45KB    | ~65KB      | ~45KB  | ~150KB     |

---

## Document History

| Version | Date       | Changes                              |
| ------- | ---------- | ------------------------------------ |
| 1.0     | 2025-11-23 | Initial research and recommendations |

---

**End of Technology Recommendations Document**
