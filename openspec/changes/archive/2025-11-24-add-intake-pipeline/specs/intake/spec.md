# Intake Pipeline - Specification

## Overview

The Intake Pipeline is a request management system that provides a structured workflow for capturing, evaluating, estimating, and routing incoming work requests before they become Projects or Tickets.

## Request Entity

### ADDED Requirement: Request Data Model

The system SHALL store requests with the following fields:

| Field                 | Type        | Required | Description                                             |
| --------------------- | ----------- | -------- | ------------------------------------------------------- |
| id                    | string      | Yes      | Unique identifier (nanoid)                              |
| title                 | string(100) | Yes      | Brief title for the request                             |
| description           | text        | Yes      | Detailed description                                    |
| type                  | enum        | Yes      | new_feature, change_request, bug_report, technical_debt |
| priority              | enum        | Yes      | low, medium, high, urgent                               |
| stage                 | enum        | Yes      | in_treatment, on_hold, estimation, ready                |
| storyPoints           | integer     | No       | Fibonacci: 1, 2, 3, 5, 8, 13                            |
| confidence            | enum        | No       | low, medium, high                                       |
| businessJustification | text        | No       | Justification for the request                           |
| desiredDeliveryDate   | date        | No       | Requested delivery date                                 |
| flexibility           | enum        | No       | fixed, flexible, negotiable                             |
| requesterId           | string      | Yes      | User who submitted the request                          |
| assignedPmId          | string      | No       | PM assigned to triage                                   |
| estimatorId           | string      | No       | Team member assigned to estimate                        |
| relatedProjectId      | string      | No       | Related existing project                                |
| clientId              | string      | No       | Associated client                                       |
| stageEnteredAt        | timestamp   | Yes      | When request entered current stage                      |
| createdAt             | timestamp   | Yes      | Creation timestamp                                      |
| updatedAt             | timestamp   | Yes      | Last update timestamp                                   |
| convertedToType       | enum        | No       | project, ticket (after conversion)                      |
| convertedToId         | string      | No       | ID of created Project/Ticket                            |

## Pipeline Stages

### ADDED Requirement: Stage Definitions

The system SHALL implement the following pipeline stages:

#### Scenario: In Treatment Stage

WHEN a new request is created
THEN it SHALL be placed in the "In Treatment" stage
AND the stageEnteredAt timestamp SHALL be set to the current time
AND the aging threshold SHALL be 48 hours (2 days)

#### Scenario: On Hold Stage

WHEN a PM moves a request to "On Hold"
THEN the system SHALL require a hold reason
AND the aging threshold SHALL be 5-7 days (configurable)
AND the request SHALL remain assigned to the PM

#### Scenario: Estimation Stage

WHEN a PM sends a request for estimation
THEN the system SHALL require an estimator to be assigned
AND the stage SHALL change to "Estimation"
AND the aging threshold SHALL be 24 hours (1 day)

#### Scenario: Ready Stage

WHEN an estimation is submitted
THEN the stage SHALL automatically change to "Ready"
AND the aging threshold SHALL be 12 hours
AND the request SHALL be ready for routing decision

### ADDED Requirement: Stage Transitions

The system SHALL enforce valid stage transitions:

| From         | To           | Conditions                  |
| ------------ | ------------ | --------------------------- |
| in_treatment | on_hold      | PM must provide hold reason |
| in_treatment | estimation   | Estimator must be assigned  |
| on_hold      | in_treatment | Resume action taken         |
| on_hold      | cancelled    | Cancel action taken         |
| estimation   | ready        | Estimation submitted        |
| estimation   | in_treatment | Estimation rejected         |
| ready        | converted    | Routing decision made       |

## Aging Thresholds

### ADDED Requirement: Aging Indicators

The system SHALL display aging status based on time in stage:

#### Scenario: Normal Status

WHEN time in stage < 75% of threshold
THEN display green indicator

#### Scenario: Warning Status

WHEN time in stage >= 75% AND < 100% of threshold
THEN display yellow/amber indicator

#### Scenario: Critical Status

WHEN time in stage >= 100% of threshold
THEN display red indicator
AND create an alert notification for assigned PM

## Request Submission

### ADDED Requirement: Multi-Step Form

The system SHALL provide a multi-step submission form with the following steps:

#### Step 1: Basic Information

- Title (required, max 100 chars)
- Request Type (required)
- Priority (required)

#### Step 2: Description

- Description (required)
- Business Justification (required for new_feature, change_request, technical_debt)
- Steps to Reproduce (required for bug_report only)

#### Step 3: Context

- Related Project (required for change_request)
- Dependencies
- Attachments (optional, max 10MB each)

#### Step 4: Timeline

- Desired Delivery Date (optional)
- Flexibility (optional)
- Additional Notes (optional)

### ADDED Requirement: Type-Dependent Validation

#### Scenario: Change Request Validation

WHEN request type is "change_request"
THEN related project field SHALL be required
AND the project selector SHALL only show active projects

#### Scenario: Bug Report Validation

WHEN request type is "bug_report"
THEN steps to reproduce field SHALL be required
AND affected version field SHALL be displayed

## Estimation

### ADDED Requirement: Story Point Estimation

The system SHALL provide T-shirt sizing for estimation:

| Size | Points | Description                  |
| ---- | ------ | ---------------------------- |
| XS   | 1      | Trivial change, < 1 hour     |
| S    | 2      | Simple change, 1-4 hours     |
| M    | 3      | Moderate change, 1 day       |
| L    | 5      | Significant change, 2-3 days |
| XL   | 8      | Large change, 1 week         |
| XXL  | 13     | Epic-sized, needs breakdown  |

### ADDED Requirement: Confidence Levels

#### Scenario: Low Confidence

WHEN estimator selects "Low" confidence
THEN the system SHALL recommend a spike task
AND display a warning icon on the request

#### Scenario: Medium Confidence

WHEN estimator selects "Medium" confidence
THEN the estimation SHALL be accepted with notes

#### Scenario: High Confidence

WHEN estimator selects "High" confidence
THEN the estimation SHALL be accepted as reliable

## Routing

### ADDED Requirement: Routing Rules

The system SHALL route requests based on story points and type:

#### Scenario: Route to Ticket

WHEN story points <= 8
AND type is NOT change_request
THEN recommend routing to Ticket (Work section)
AND require destination project selection

#### Scenario: Route to Project

WHEN story points >= 13
THEN recommend routing to Project (Projects section)
AND pre-populate project from request data

#### Scenario: Change Request Routing

WHEN type is "change_request"
THEN always route to Ticket regardless of story points
AND associate with the related project

### ADDED Requirement: Manual Override

#### Scenario: Override Routing Recommendation

WHEN PM selects "Override recommendation"
THEN allow routing to either Project or Ticket
AND log the override in request history

## Permissions

### ADDED Requirement: Role-Based Access

| Action                | Admin | PM  | Developer | Designer | QA  | Client |
| --------------------- | ----- | --- | --------- | -------- | --- | ------ |
| View Pipeline         | Yes   | Yes | No        | No       | No  | No     |
| Submit Request        | Yes   | Yes | Yes       | Yes      | Yes | Yes    |
| Triage (assign PM)    | Yes   | Yes | No        | No       | No  | No     |
| Move to On Hold       | Yes   | Yes | No        | No       | No  | No     |
| Assign Estimator      | Yes   | Yes | No        | No       | No  | No     |
| Submit Estimation     | Yes   | Yes | Yes       | Yes      | Yes | No     |
| Make Routing Decision | Yes   | Yes | No        | No       | No  | No     |
| Bulk Operations       | Yes   | Yes | No        | No       | No  | No     |
| View Own Requests     | Yes   | Yes | Yes       | Yes      | Yes | Yes    |

## API Endpoints

### ADDED Requirement: Request API

```
POST   /api/requests              Create new request
GET    /api/requests              List requests (with filters)
GET    /api/requests/:id          Get single request
PATCH  /api/requests/:id          Update request fields
DELETE /api/requests/:id          Soft delete request

POST   /api/requests/:id/transition   Change request stage
POST   /api/requests/:id/estimate     Submit estimation
POST   /api/requests/:id/convert      Convert to Project/Ticket

POST   /api/requests/bulk/transition  Bulk stage transition
POST   /api/requests/bulk/assign      Bulk PM assignment

GET    /api/requests/stage-counts     Get counts per stage
GET    /api/requests/aging            Get aging requests
```

### ADDED Requirement: API Query Parameters

| Parameter    | Type   | Description                                      |
| ------------ | ------ | ------------------------------------------------ |
| stage        | string | Filter by stage                                  |
| priority     | string | Filter by priority (comma-separated)             |
| type         | string | Filter by type (comma-separated)                 |
| requesterId  | string | Filter by requester                              |
| assignedPmId | string | Filter by assigned PM                            |
| search       | string | Search in title and description                  |
| sort         | string | Sort field (createdAt, priority, stageEnteredAt) |
| order        | string | Sort order (asc, desc)                           |
| page         | number | Page number (1-based)                            |
| limit        | number | Items per page (default: 25, max: 100)           |

## Real-Time Events

### ADDED Requirement: Socket Events

The system SHALL emit the following WebSocket events:

| Event                        | Payload                         | When                        |
| ---------------------------- | ------------------------------- | --------------------------- |
| intake:request:created       | Request object                  | New request submitted       |
| intake:request:updated       | Request object                  | Request fields updated      |
| intake:request:stage-changed | {requestId, from, to}           | Stage transition            |
| intake:request:estimated     | {requestId, points, confidence} | Estimation submitted        |
| intake:request:converted     | {requestId, type, entityId}     | Converted to Project/Ticket |
| intake:alert:aging           | Alert object                    | Request exceeds threshold   |

## Notifications

### ADDED Requirement: Notification Rules

#### Scenario: Aging Alert

WHEN a request exceeds its stage threshold
THEN send in-app alert to assigned PM
AND send email notification if PM has email alerts enabled
AND display request in Critical Alerts widget

#### Scenario: Estimation Request

WHEN a request is moved to Estimation stage
THEN send notification to assigned estimator
AND include request summary in notification

#### Scenario: Routing Ready

WHEN an estimation is submitted
THEN send notification to assigned PM
AND include estimation summary and routing recommendation

## Data Migration

### ADDED Requirement: Backward Compatibility

#### Scenario: Existing Data

WHEN the feature is deployed
THEN no existing data SHALL be modified
AND new tables SHALL be created without affecting existing tables
AND the feature SHALL be behind a feature flag initially
