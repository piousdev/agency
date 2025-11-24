# Intake Pipeline - Legacy Code Cleanup Tracker

## Overview

This document tracks all files that need to be **DELETED** or **UPDATED** as part of the Intake refactoring. The existing "Intake Queue" implementation must be completely removed before the new "Intake Pipeline" is built.

---

## Files to DELETE

### Route Files (Delete Entire Directory)

```
apps/web/src/app/(default)/dashboard/business-center/intake-queue/
├── page.tsx
├── client.tsx
├── error.tsx
├── ticket-detail.tsx
├── new/
│   ├── page.tsx
│   └── loading.tsx
├── [id]/
│   ├── page.tsx
│   ├── ticket-activity.tsx
│   ├── comments-section.tsx
│   └── actions-client.tsx
└── views/
    ├── cards-view.tsx
    ├── table-view.tsx
    └── kanban-view.tsx
```

### Component Files

| File                      | Location                                                           |
| ------------------------- | ------------------------------------------------------------------ |
| `intake-queue.tsx`        | `apps/web/src/components/business-center/`                         |
| `intake-form.tsx`         | `apps/web/src/components/business-center/`                         |
| `intake-detail-modal.tsx` | `apps/web/src/components/business-center/`                         |
| `intake-queue-hero.tsx`   | `apps/web/src/app/(default)/dashboard/business-center/components/` |
| `intake-trend-chart.tsx`  | `apps/web/src/app/(default)/dashboard/business-center/components/` |
| `intake-pipeline.tsx`     | `apps/web/src/components/dashboard/overview/widgets/`              |

---

## Files to UPDATE

### Component Updates

#### `components/business-center/index.tsx`

**Remove:**

```typescript
import { IntakeQueue } from './intake-queue';
// ...
<IntakeQueue tickets={data.intakeTickets} teamMembers={data.teamMembers} />
```

**Also remove** `intakeTickets` from `BusinessCenterData` interface

#### `components/dashboard/overview/widgets/index.ts`

**Remove:** Export for `intake-pipeline`

#### `components/dashboard/overview/widgets/lazy-widgets.tsx`

**Remove:** Lazy import for IntakePipeline widget

#### `lib/stores/dashboard-store.ts`

**Remove:** `intake-pipeline` from widget configurations and default layouts

#### `lib/actions/business-center/overview.ts`

**Remove:** Intake-related data fetching logic

---

### Navigation Updates

#### `config/navigation.ts`

**Update** the Intake Queue nav item to point to new route:

```typescript
// Before
{
  title: 'Intake Queue',
  description: 'Manage incoming client requests',
  url: '/dashboard/business-center/intake-queue',
}

// After
{
  title: 'Intake Pipeline',  // Updated name
  description: 'Request management pipeline',
  url: '/dashboard/business-center/intake',  // New URL
}
```

---

### Test Updates

| File                                                            | Action                           |
| --------------------------------------------------------------- | -------------------------------- |
| `components/business-center/__tests__/business-center.test.tsx` | Remove intake tests              |
| `lib/stores/__tests__/dashboard-store.test.ts`                  | Remove intake widget references  |
| `tests/e2e/business-center.spec.ts`                             | Remove/update intake-queue tests |
| `tests/e2e/business-center-crud.spec.ts`                        | Remove intake references         |
| `tests/e2e/business-center-a11y.spec.ts`                        | Remove intake references         |
| `tests/e2e/business-center-responsive.spec.ts`                  | Remove intake references         |

---

### Types Cleanup

| File                                  | Action                          |
| ------------------------------------- | ------------------------------- |
| `components/business-center/types.ts` | Remove intake-related types     |
| `lib/api/tickets/types.ts`            | Check for intake-specific types |

---

## Cascade Impact Analysis

### Components Using IntakeQueue

1. `components/business-center/index.tsx` → Uses `IntakeQueue` component
2. Dashboard overview widgets → `intake-pipeline` widget

### Data Dependencies

1. `BusinessCenterData.intakeTickets` → Used by IntakeQueue
2. Server action `getOverviewData` → Fetches intake data

### Navigation Dependencies

1. Sidebar navigation → Links to `/dashboard/business-center/intake-queue`
2. Quick actions → May reference intake routes

---

## Verification Checklist

After cleanup, run these commands to verify:

```bash
# Check for broken imports
pnpm build

# Check for unused imports/variables
pnpm lint

# Run all tests
pnpm test

# Search for remaining intake references
grep -r "intake" apps/web/src --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```

---

## Notes

- The new Intake Pipeline will be at `/dashboard/business-center/intake` (not `intake-queue`)
- New implementation uses `request` entity (not `ticket` for intake items)
- Old implementation used tickets with `status: 'intake'` filter
- New implementation has dedicated `request` table with stage workflow
