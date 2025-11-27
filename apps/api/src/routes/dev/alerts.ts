/**
 * Development/Test Alerts Routes
 * These endpoints are for testing the real-time alerts system.
 * Should only be enabled in development mode.
 */

import { Hono } from 'hono';
import { nanoid } from 'nanoid';

import { broadcastAlert, broadcastCriticalAlert, type AlertPayload } from '../../lib/socket.js';

const app = new Hono();

// Sample alert templates
const SAMPLE_ALERTS: Record<string, Omit<AlertPayload, 'id' | 'createdAt'>> = {
  'sla-breach': {
    type: 'critical',
    title: 'SLA Breach Detected',
    message: 'Ticket #TKT-1234 has exceeded its response time SLA by 2 hours',
    entityType: 'ticket',
    entityId: 'ticket-123',
    entityName: 'Fix login authentication bug',
    actionUrl: '/dashboard/business-center/intake/ticket-123',
  },
  'project-deadline': {
    type: 'critical',
    title: 'Project Deadline at Risk',
    message: 'Acme Website Redesign is 3 days behind schedule with 2 blockers',
    entityType: 'project',
    entityId: 'proj-456',
    entityName: 'Acme Website Redesign',
    actionUrl: '/dashboard/business-center/projects/proj-456',
  },
  'budget-warning': {
    type: 'warning',
    title: 'Budget Alert',
    message: 'TechCorp Mobile App has used 85% of budget with 30% work remaining',
    entityType: 'project',
    entityId: 'proj-789',
    entityName: 'TechCorp Mobile App',
    actionUrl: '/dashboard/business-center/projects/proj-789',
  },
  'sprint-blocked': {
    type: 'warning',
    title: 'Sprint Blocked',
    message: '3 tasks in Sprint 12 are blocked waiting for client approval',
    entityType: 'sprint',
    entityId: 'sprint-12',
    entityName: 'Sprint 12',
    actionUrl: '/dashboard/business-center/sprints/sprint-12',
  },
  'client-overdue': {
    type: 'warning',
    title: 'Invoice Overdue',
    message: 'Acme Corp has an overdue invoice of $12,500 (45 days past due)',
    entityType: 'client',
    entityId: 'client-001',
    entityName: 'Acme Corp',
    actionUrl: '/dashboard/business-center/clients/client-001',
  },
  'new-intake': {
    type: 'info',
    title: 'New Intake Request',
    message: 'New high-priority request submitted: "E-commerce Platform Upgrade"',
    entityType: 'ticket',
    entityId: 'req-999',
    entityName: 'E-commerce Platform Upgrade',
    actionUrl: '/dashboard/business-center/intake/req-999',
  },
  'system-update': {
    type: 'info',
    title: 'System Maintenance',
    message: 'Scheduled maintenance window tonight from 2:00 AM - 4:00 AM EST',
    entityType: 'system',
    entityName: 'System Maintenance',
  },
};

/**
 * POST /dev/alerts/broadcast
 * Broadcast a specific alert type or a random one
 */
app.post('/broadcast', async (c) => {
  const body: unknown = await c.req.json().catch(() => ({}));
  const alertType = (body as Record<string, unknown>).type as string | undefined;

  let alertTemplate: Omit<AlertPayload, 'id' | 'createdAt'>;

  type AlertType = keyof typeof SAMPLE_ALERTS;
  const validAlertTypes: AlertType[] = [
    'sla-breach',
    'project-deadline',
    'budget-warning',
    'sprint-blocked',
    'client-overdue',
    'new-intake',
    'system-update',
  ];

  const isValidAlertType = (type: string): type is AlertType => {
    return (validAlertTypes as readonly string[]).includes(type);
  };

  if (alertType !== undefined && alertType !== '' && isValidAlertType(alertType)) {
    alertTemplate = SAMPLE_ALERTS[alertType];
  } else {
    // Pick a random alert
    const randomIndex = Math.floor(Math.random() * validAlertTypes.length);
    const randomType = validAlertTypes[randomIndex];
    if (randomType === undefined) {
      return c.json({ success: false, error: 'No sample alerts available' }, 500);
    }
    alertTemplate = SAMPLE_ALERTS[randomType];
  }

  const alert: AlertPayload = {
    ...alertTemplate,
    id: nanoid(),
    createdAt: new Date().toISOString(),
  };

  // Broadcast to all internal users
  broadcastAlert(alert, { roles: ['internal'] });

  return c.json({
    success: true,
    message: 'Alert broadcasted',
    alert,
  });
});

/**
 * POST /dev/alerts/broadcast-critical
 * Broadcast a critical alert (goes to admin and PM roles)
 */
app.post('/broadcast-critical', (c) => {
  const alert: AlertPayload = {
    id: nanoid(),
    type: 'critical',
    title: 'Critical System Alert',
    message: 'Multiple SLA breaches detected across 3 projects. Immediate attention required.',
    entityType: 'system',
    entityName: 'System Alert',
    actionUrl: '/dashboard/business-center/analytics',
    createdAt: new Date().toISOString(),
  };

  broadcastCriticalAlert(alert);

  return c.json({
    success: true,
    message: 'Critical alert broadcasted to admin and PM roles',
    alert,
  });
});

/**
 * POST /dev/alerts/broadcast-all
 * Broadcast all sample alerts (for testing)
 */
app.post('/broadcast-all', (c) => {
  const alerts: AlertPayload[] = [];
  let delay = 0;

  for (const template of Object.values(SAMPLE_ALERTS)) {
    const alert: AlertPayload = {
      ...template,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };

    // Stagger alerts by 500ms each
    setTimeout(() => {
      broadcastAlert(alert, { roles: ['internal'] });
    }, delay);

    delay += 500;
    alerts.push(alert);
  }

  return c.json({
    success: true,
    message: `Broadcasting ${String(alerts.length)} alerts (staggered)`,
    alerts,
  });
});

/**
 * GET /dev/alerts/types
 * List available alert types for testing
 */
app.get('/types', (c) => {
  return c.json({
    success: true,
    types: Object.keys(SAMPLE_ALERTS),
    descriptions: Object.entries(SAMPLE_ALERTS).map(([key, alert]) => ({
      type: key,
      severity: alert.type,
      title: alert.title,
    })),
  });
});

export default app;
