# Intake Pipeline User Guide

A comprehensive guide for using the Intake Pipeline to manage incoming work requests.

## Overview

The Intake Pipeline is a structured workflow for processing client requests before they become actionable tickets or projects. It ensures all requests are properly triaged, estimated, and routed to the appropriate destination.

## Pipeline Stages

### Stage Flow

```
Submission → In Treatment → Estimation → Ready → Converted
                  ↓
               On Hold (temporary)
```

### 1. In Treatment

The initial stage where PMs review and triage new requests.

**Actions available:**

- Review request details
- Assign to PM for ownership
- Move to Estimation (when ready for sizing)
- Put On Hold (waiting for information)

### 2. On Hold

Temporary holding stage for requests needing external input.

**When to use:**

- Waiting for client clarification
- Budget approval pending
- Resource availability uncertain
- Dependencies unresolved

**Required:** Hold reason must be provided

### 3. Estimation

Requests ready to be sized by the team.

**Actions available:**

- Submit story point estimate (1-100)
- Set confidence level (low/medium/high)
- Add estimator notes
- Auto-transitions to Ready when estimated

### 4. Ready

Estimated requests awaiting conversion to tickets/projects.

**Contains:**

- Story point estimate
- Confidence level
- Routing recommendation
- Ready for conversion

---

## User Workflows

### For Request Submitters

#### Submitting a New Request

1. Navigate to **Business Center → Intake**
2. Click **"New Request"**
3. Fill in required fields:
   - **Title**: Clear, descriptive name
   - **Type**: Select request type (see table below)
   - **Priority**: Set urgency level
4. Optional fields:
   - **Description**: Detailed requirements
   - **Client**: Associated client
   - **Tags**: Categorization labels
5. Click **"Create Request"**

#### Request Types

| Type            | Use When                     |
| --------------- | ---------------------------- |
| Bug Report      | Something is broken          |
| Feature Request | New functionality needed     |
| Enhancement     | Improve existing feature     |
| Change Request  | Modify current behavior      |
| Support Request | Help/assistance needed       |
| Other           | Doesn't fit other categories |

#### Priority Levels

| Priority | Response Time | Use For                          |
| -------- | ------------- | -------------------------------- |
| Critical | Immediate     | Production down, security issues |
| High     | Within 24h    | Major impact, time-sensitive     |
| Medium   | Within 1 week | Standard requests                |
| Low      | Backlog       | Nice-to-have, improvements       |

---

### For Project Managers (Triage)

#### Daily Triage Process

1. **Review In Treatment queue**
   - Sort by `stageEnteredAt` to see oldest first
   - Check for aging requests (warning indicators)

2. **For each request:**
   - Verify completeness
   - Check priority accuracy
   - Assign yourself as PM

3. **Take action:**
   - **Ready for estimation?** → Move to Estimation
   - **Need more info?** → Put On Hold with reason
   - **Invalid/duplicate?** → Cancel with explanation

#### Using Filters

Filter requests by:

- **Stage**: Focus on In Treatment or On Hold
- **Priority**: Critical items first
- **Type**: Group similar requests
- **Assigned PM**: See your assignments
- **Client**: Client-specific views

#### Bulk Operations

Select multiple requests for batch actions:

1. Check boxes on cards/rows
2. Bulk Actions bar appears
3. Choose action:
   - **Bulk Transition**: Move all to same stage
   - **Bulk Assign**: Assign same PM to all
4. Confirm action

---

### For Estimators

#### Estimation Process

1. **Navigate to Estimation stage**
   - Requests here are ready to size
   - May be assigned to you specifically

2. **Review request details**
   - Read title and description
   - Check type and priority
   - Note any dependencies/tags

3. **Submit estimate**
   - **Story Points**: Use Fibonacci (1, 2, 3, 5, 8, 13, 21...)
   - **Confidence**: How sure are you?
     - Low: Many unknowns, could vary significantly
     - Medium: Some clarity, reasonable estimate
     - High: Well-defined, confident in estimate
   - **Notes**: Document assumptions

4. **Submit**
   - Request auto-moves to Ready
   - Routing recommendation displayed

#### Estimation Guidelines

| Points | Complexity | Typical Duration |
| ------ | ---------- | ---------------- |
| 1-2    | Trivial    | Hours            |
| 3-5    | Small      | 1-2 days         |
| 8-13   | Medium     | 3-5 days         |
| 21-34  | Large      | 1-2 weeks        |
| 55+    | Epic       | Multiple weeks   |

---

### For Conversion

#### Routing Rules

Requests are routed based on estimate and type:

| Condition             | Destination   |
| --------------------- | ------------- |
| Type = Change Request | Always Ticket |
| 1-8 Story Points      | Ticket        |
| 9+ Story Points       | Project       |

#### Converting to Ticket

1. Click **"Convert"** on Ready request
2. Select **"Ticket"**
3. Optionally modify:
   - Title
   - Client assignment
   - Target project
4. Confirm conversion
5. New ticket created with request data

#### Converting to Project

1. Click **"Convert"** on Ready request
2. Select **"Project"**
3. Optionally modify:
   - Title
   - Client assignment
4. Confirm conversion
5. New project created
6. Request linked to project

---

## Aging Thresholds

Requests show warning/critical indicators when they've been in a stage too long:

| Stage        | Warning  | Critical           |
| ------------ | -------- | ------------------ |
| In Treatment | 24 hours | 48 hours           |
| On Hold      | 72 hours | 168 hours (1 week) |
| Estimation   | 24 hours | 48 hours           |
| Ready        | 72 hours | 168 hours (1 week) |

**Visual indicators:**

- Yellow/orange badge = Warning
- Red badge = Critical

---

## Tips & Best Practices

### For PMs

- Check Intake Pipeline daily
- Don't let requests age in In Treatment
- Use On Hold sparingly with clear reasons
- Set expected resume dates when putting on hold

### For Estimators

- Ask questions before estimating if unclear
- Use confidence levels honestly
- Document assumptions in notes
- Don't over-estimate to be safe

### For Everyone

- Keep titles descriptive
- Use tags for categorization
- Link related requests
- Update status promptly

---

## Keyboard Shortcuts

| Key             | Action                    |
| --------------- | ------------------------- |
| `Tab`           | Navigate through elements |
| `Enter`/`Space` | Activate button/checkbox  |
| `Escape`        | Close dialog/menu         |
| `Arrow Keys`    | Navigate tabs/menus       |

---

## Troubleshooting

### "Invalid stage transition"

You can only move requests between adjacent stages. Check the valid transitions diagram.

### "Request must be in ready stage to convert"

Estimate the request first. Only Ready requests can be converted.

### "Permission denied"

Contact your administrator. You may not have the required role for this action.

### Request not appearing

- Check your filters
- Clear all filters and search again
- Refresh the page
