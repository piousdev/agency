# Intake Pipeline - Change Proposal

> **REFACTORING**: This proposal replaces the existing "Intake Queue" feature with a new "Intake Pipeline" implementation. All legacy code must be removed before building the new system.

## Why

The existing Intake Queue implementation has limitations:

1. **Tied to Tickets**: Uses ticket entities instead of dedicated request entities
2. **No Stage Workflow**: Missing formal pipeline stages
3. **No Estimation**: No story point estimation or confidence tracking
4. **No Routing Logic**: Manual conversion to Projects/Tickets
5. **No Aging Alerts**: No threshold-based notifications

The Business Center currently manages Projects, Clients, and Tickets but lacks a formal intake process for new work requests. Users submit requests through informal channels (email, chat, verbal), leading to:

1. **Lost Requests**: No centralized system to track incoming work
2. **Delayed Triage**: PMs manually track and prioritize requests
3. **Inconsistent Estimation**: No standardized estimation workflow
4. **Poor Visibility**: Requesters have no way to track request status
5. **Capacity Blindness**: No insight into incoming work volume

The Intake Pipeline provides a structured workflow to capture, evaluate, estimate, and route all incoming work requests before they become Projects or Tickets.

## What Changes

### New Capability: Request Management Pipeline

A 4-stage pipeline for processing incoming work requests:

1. **In Treatment** (2-day threshold) - Initial triage by PM
2. **On Hold** (5-7 day threshold) - Awaiting information/decision
3. **Estimation** (1-day threshold) - Story point estimation by team
4. **Ready** (12-hour threshold) - Estimated, awaiting conversion

### New Features

- **Request Submission Form**: Multi-step form with type-dependent validation
- **Stage-Based Views**: Filtered views by pipeline stage with aging indicators
- **Estimation Workflow**: T-shirt sizing with confidence levels (Low/Medium/High)
- **Routing Decision**: Automatic routing based on story points:
  - 0-8 points → Ticket (Work section)
  - 13+ points → Project (Projects section)
  - Change Requests → Always Ticket regardless of points
- **Bulk Operations**: Multi-select for bulk stage transitions
- **Real-Time Updates**: Socket.IO for stage changes and aging alerts
- **Notifications**: Email/in-app alerts for aging requests

### Database Changes

- New `request` table with stage workflow tracking
- New `request_attachment` table for file uploads
- New enums: `request_type`, `request_stage`, `confidence_level`
- Relations to `user`, `project`, `client` tables

### API Endpoints

- `POST /requests` - Create new request
- `GET /requests` - List with filtering/pagination
- `GET /requests/:id` - Get request details
- `PATCH /requests/:id` - Update request fields
- `POST /requests/:id/transition` - Stage transitions
- `POST /requests/:id/estimate` - Submit estimation
- `POST /requests/:id/convert` - Convert to Project/Ticket

### Frontend Pages

- `/dashboard/business-center/intake` - Main pipeline view
- `/dashboard/business-center/intake/new` - Request submission form
- `/dashboard/business-center/intake/[id]` - Request details

## Impact

### Low Risk

- New feature, no changes to existing Business Center functionality
- Additive database schema changes (new tables only)
- Isolated routing under `/intake` path

### Integration Points

- **Projects**: Requests can convert to new Projects
- **Tickets**: Requests can convert to new Tickets
- **Clients**: Requests can be associated with existing Clients
- **Users**: PMs assigned for triage, team members for estimation
- **Notifications**: Integrates with existing notification system

### Performance Considerations

- Pagination required for high-volume intake (25 items/page)
- Real-time updates via Socket.IO rooms scoped by stage
- Server Components for initial data load, TanStack Query for client caching

### Migration

- Zero downtime deployment (new tables, no schema modifications)
- Feature flag for gradual rollout recommended
