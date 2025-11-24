/**
 * Intake Pipeline Notification Service
 *
 * Handles:
 * - Aging request alerts (cron-based)
 * - Stage change notifications
 * - Email notifications to PMs and requesters
 */

import cron, { ScheduledTask } from 'node-cron';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { request, user } from '../db/schema';
import { eq, and, lt, isNull, or, sql, inArray } from 'drizzle-orm';
import { sendEmail } from './email';
import {
  intakeAgingAlertTemplate,
  intakeAgingAlertText,
  intakeStageChangeTemplate,
  intakeConvertedTemplate,
  intakeEstimatedTemplate,
} from './email/intake-templates';
import { broadcastAlert, type AlertPayload } from './socket';

// Aging thresholds in days
const AGING_THRESHOLDS: Record<string, number> = {
  in_treatment: 3, // 3 days
  on_hold: 5, // 5 days
  estimation: 2, // 2 days
  ready: 7, // 7 days (should be converted)
};

// Track sent alerts to avoid duplicates within a time window
const sentAlertCache = new Map<string, Date>();
const ALERT_COOLDOWN_HOURS = 24; // Don't send duplicate alerts within 24 hours

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Get aging requests that exceed their stage thresholds
 */
export async function getAgingRequests() {
  const now = new Date();
  const results: Array<{
    request: typeof request.$inferSelect;
    requester: { id: string; name: string | null; email: string } | null;
    assignedPm: { id: string; name: string | null; email: string } | null;
    daysInStage: number;
    threshold: number;
  }> = [];

  for (const [stage, thresholdDays] of Object.entries(AGING_THRESHOLDS)) {
    const thresholdDate = new Date(now);
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

    const agingRequests = await db.query.request.findMany({
      where: and(
        eq(request.stage, stage as 'in_treatment' | 'on_hold' | 'estimation' | 'ready'),
        lt(request.stageEnteredAt, thresholdDate),
        eq(request.isConverted, false),
        eq(request.isCancelled, false)
      ),
      with: {
        requester: {
          columns: { id: true, name: true, email: true },
        },
        assignedPm: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    for (const req of agingRequests) {
      const stageEnteredAt = req.stageEnteredAt;
      const daysInStage = Math.floor(
        (now.getTime() - stageEnteredAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      results.push({
        request: req,
        requester: req.requester,
        assignedPm: req.assignedPm,
        daysInStage,
        threshold: thresholdDays,
      });
    }
  }

  return results;
}

/**
 * Check if an alert has been sent recently (within cooldown period)
 */
function wasAlertRecentlySent(requestId: string, alertType: string): boolean {
  const cacheKey = `${requestId}-${alertType}`;
  const lastSent = sentAlertCache.get(cacheKey);

  if (!lastSent) return false;

  const now = new Date();
  const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastSent < ALERT_COOLDOWN_HOURS;
}

/**
 * Mark an alert as sent
 */
function markAlertSent(requestId: string, alertType: string): void {
  const cacheKey = `${requestId}-${alertType}`;
  sentAlertCache.set(cacheKey, new Date());

  // Clean up old cache entries (older than 48 hours)
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 48);
  for (const [key, date] of sentAlertCache.entries()) {
    if (date < cutoff) {
      sentAlertCache.delete(key);
    }
  }
}

/**
 * Send aging alert for a request
 */
async function sendAgingAlert(agingRequest: {
  request: typeof request.$inferSelect;
  requester: { id: string; name: string | null; email: string } | null;
  assignedPm: { id: string; name: string | null; email: string } | null;
  daysInStage: number;
  threshold: number;
}): Promise<void> {
  const { request: req, requester, assignedPm, daysInStage, threshold } = agingRequest;

  // Check cooldown
  if (wasAlertRecentlySent(req.id, 'aging')) {
    return;
  }

  const requestUrl = `${APP_URL}/dashboard/business-center/intake/${req.id}`;

  // Determine alert type based on how far over threshold
  const overThresholdDays = daysInStage - threshold;
  const alertType: 'critical' | 'warning' | 'info' =
    overThresholdDays >= 4 ? 'critical' : overThresholdDays >= 2 ? 'warning' : 'info';

  // Create socket alert
  const socketAlert: AlertPayload = {
    id: nanoid(),
    type: alertType,
    title: `Request Aging: ${req.requestNumber}`,
    message: `"${req.title}" has been in ${req.stage.replace('_', ' ')} for ${daysInStage} days`,
    entityType: 'system',
    entityId: req.id,
    entityName: req.title,
    actionUrl: requestUrl,
    createdAt: new Date().toISOString(),
  };

  // Broadcast to PMs and admins
  broadcastAlert(socketAlert, { roles: ['admin', 'pm'] });

  // Send email to assigned PM (or all PMs if unassigned)
  if (assignedPm?.email) {
    try {
      await sendEmail({
        to: assignedPm.email,
        subject: `[Action Required] Request ${req.requestNumber} aging alert`,
        html: intakeAgingAlertTemplate({
          recipientName: assignedPm.name || 'Project Manager',
          requestTitle: req.title,
          requestNumber: req.requestNumber || req.id,
          stage: req.stage,
          daysInStage,
          priority: req.priority,
          requesterName: requester?.name || 'Unknown',
          requestUrl,
        }),
        text: intakeAgingAlertText({
          recipientName: assignedPm.name || 'Project Manager',
          requestTitle: req.title,
          requestNumber: req.requestNumber || req.id,
          stage: req.stage,
          daysInStage,
          priority: req.priority,
          requesterName: requester?.name || 'Unknown',
          requestUrl,
        }),
      });
    } catch (error) {
      console.error(`Failed to send aging alert email to ${assignedPm.email}:`, error);
    }
  }

  markAlertSent(req.id, 'aging');
  console.log(
    `Sent aging alert for request ${req.requestNumber} (${daysInStage} days in ${req.stage})`
  );
}

/**
 * Run the aging check and send alerts
 */
export async function runAgingCheck(): Promise<{ checked: number; alerted: number }> {
  console.log('Running intake aging check...');

  const agingRequests = await getAgingRequests();
  let alertedCount = 0;

  for (const agingRequest of agingRequests) {
    await sendAgingAlert(agingRequest);
    alertedCount++;
  }

  console.log(
    `Aging check complete: ${agingRequests.length} requests checked, ${alertedCount} alerts sent`
  );

  return {
    checked: agingRequests.length,
    alerted: alertedCount,
  };
}

/**
 * Send stage change notification to requester
 */
export async function sendStageChangeNotification(options: {
  requestId: string;
  requestNumber: string;
  requestTitle: string;
  requesterEmail: string;
  requesterName: string;
  fromStage: string;
  toStage: string;
  actorName: string;
  reason?: string;
}): Promise<void> {
  const {
    requestId,
    requestNumber,
    requestTitle,
    requesterEmail,
    requesterName,
    fromStage,
    toStage,
    actorName,
    reason,
  } = options;

  const requestUrl = `${APP_URL}/dashboard/business-center/intake/${requestId}`;

  try {
    await sendEmail({
      to: requesterEmail,
      subject: `Request ${requestNumber} moved to ${toStage.replace('_', ' ')}`,
      html: intakeStageChangeTemplate({
        recipientName: requesterName,
        requestTitle,
        requestNumber,
        fromStage,
        toStage,
        actorName,
        reason,
        requestUrl,
      }),
    });
  } catch (error) {
    console.error(`Failed to send stage change notification to ${requesterEmail}:`, error);
  }
}

/**
 * Send conversion notification to requester
 */
export async function sendConversionNotification(options: {
  requesterEmail: string;
  requesterName: string;
  requestNumber: string;
  requestTitle: string;
  convertedToType: 'project' | 'ticket';
  convertedToId: string;
  actorName: string;
}): Promise<void> {
  const {
    requesterEmail,
    requesterName,
    requestNumber,
    requestTitle,
    convertedToType,
    convertedToId,
    actorName,
  } = options;

  const convertedItemUrl =
    convertedToType === 'project'
      ? `${APP_URL}/dashboard/business-center/projects/${convertedToId}`
      : `${APP_URL}/dashboard/business-center/intake-queue/${convertedToId}`;

  try {
    await sendEmail({
      to: requesterEmail,
      subject: `Your request ${requestNumber} has been converted to a ${convertedToType}`,
      html: intakeConvertedTemplate({
        recipientName: requesterName,
        requestTitle,
        requestNumber,
        convertedToType,
        actorName,
        convertedItemUrl,
      }),
    });
  } catch (error) {
    console.error(`Failed to send conversion notification to ${requesterEmail}:`, error);
  }
}

/**
 * Send estimation notification to requester
 */
export async function sendEstimationNotification(options: {
  requestId: string;
  requesterEmail: string;
  requesterName: string;
  requestNumber: string;
  requestTitle: string;
  storyPoints: number;
  confidence: string;
  estimatorName: string;
  routingRecommendation: 'project' | 'ticket';
}): Promise<void> {
  const {
    requestId,
    requesterEmail,
    requesterName,
    requestNumber,
    requestTitle,
    storyPoints,
    confidence,
    estimatorName,
    routingRecommendation,
  } = options;

  const requestUrl = `${APP_URL}/dashboard/business-center/intake/${requestId}`;

  try {
    await sendEmail({
      to: requesterEmail,
      subject: `Request ${requestNumber} has been estimated`,
      html: intakeEstimatedTemplate({
        recipientName: requesterName,
        requestTitle,
        requestNumber,
        storyPoints,
        confidence,
        estimatorName,
        routingRecommendation,
        requestUrl,
      }),
    });
  } catch (error) {
    console.error(`Failed to send estimation notification to ${requesterEmail}:`, error);
  }
}

// Cron job instance
let agingCheckJob: ScheduledTask | null = null;

/**
 * Start the aging check cron job
 * Runs every hour by default
 */
export function startAgingCheckCron(schedule = '0 * * * *'): void {
  if (agingCheckJob) {
    console.log('Aging check cron job already running');
    return;
  }

  agingCheckJob = cron.schedule(schedule, async () => {
    try {
      await runAgingCheck();
    } catch (error) {
      console.error('Error running aging check:', error);
    }
  });

  console.log(`Intake aging check cron job started (schedule: ${schedule})`);
}

/**
 * Stop the aging check cron job
 */
export function stopAgingCheckCron(): void {
  if (agingCheckJob) {
    agingCheckJob.stop();
    agingCheckJob = null;
    console.log('Intake aging check cron job stopped');
  }
}

/**
 * Check if the aging cron job is running
 */
export function isAgingCheckRunning(): boolean {
  return agingCheckJob !== null;
}
