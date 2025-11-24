# Change: Add Interactive Functionality to Business Center

## Why

The Business Center currently only displays read-only data views (tables, cards, kanban boards). Internal users cannot perform any actual work - they can't assign tickets, update project status, manage team capacity, or take any actions. This makes the Business Center non-functional for its intended purpose of managing agency operations.

The spec already defines all required interactive features, but the implementation is incomplete - only the data display layer has been built.

## What Changes

- Add clickable interactions to all views (click ticket/project → open detail modal)
- Implement detail modals/side panels for viewing full context
- Add forms for creating and editing intake requests
- Implement Server Actions for all mutations (assign, update status, change capacity)
- Add assignment dialogs with team member selection
- Add status update workflows (drag-and-drop in kanban, quick actions)
- Implement capacity management interface
- Add project reassignment functionality
- Implement proper error handling and loading states
- Add confirmation dialogs for destructive actions

All changes follow existing spec requirements - no spec modifications needed, only implementation of already-defined behavior.

## Impact

- Affected specs: business-center (implementation only, no requirement changes)
- Affected code:
  - `/apps/web/src/app/(default)/dashboard/business-center/**/*` - Add interactive features to all views
  - `/apps/web/src/lib/actions/business-center/` - New Server Actions directory
  - `/apps/web/src/components/business-center/` - New shared components (modals, dialogs, forms)
  - API endpoints may need modifications to support update operations
