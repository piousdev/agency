/**
 * Email Templates for Intake Pipeline Notifications
 */

import { baseEmailTemplate } from './base-template';

/**
 * Aging request alert email template
 */
export function intakeAgingAlertTemplate(options: {
  recipientName: string;
  requestTitle: string;
  requestNumber: string;
  stage: string;
  daysInStage: number;
  priority: string;
  requesterName: string;
  requestUrl: string;
}): string {
  const {
    recipientName,
    requestTitle,
    requestNumber,
    stage,
    daysInStage,
    priority,
    requesterName,
    requestUrl,
  } = options;

  const stageLabels: Record<string, string> = {
    in_treatment: 'In Treatment',
    on_hold: 'On Hold',
    estimation: 'Estimation',
    ready: 'Ready',
  };

  const urgencyLevel = daysInStage >= 7 ? 'critical' : daysInStage >= 5 ? 'high' : 'medium';
  const urgencyColor =
    urgencyLevel === 'critical' ? '#dc2626' : urgencyLevel === 'high' ? '#f59e0b' : '#3b82f6';

  const content = `
    <div class="header">
      <h1 style="color: ${urgencyColor};">Request Aging Alert</h1>
    </div>

    <div class="content">
      <p>Hi ${recipientName},</p>

      <p>The following intake request has been in the <strong>${stageLabels[stage] || stage}</strong> stage for <strong>${daysInStage} days</strong> and requires attention:</p>

      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 120px;">Request:</td>
            <td style="padding: 8px 0; font-weight: 600;">${requestNumber} - ${requestTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Stage:</td>
            <td style="padding: 8px 0;">${stageLabels[stage] || stage}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Days in Stage:</td>
            <td style="padding: 8px 0; color: ${urgencyColor}; font-weight: 600;">${daysInStage} days</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Priority:</td>
            <td style="padding: 8px 0; text-transform: capitalize;">${priority}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Requester:</td>
            <td style="padding: 8px 0;">${requesterName}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center;">
        <a href="${requestUrl}" class="button">View Request</a>
      </div>

      <div class="warning">
        <p><strong>Recommended Action:</strong> Review this request and take appropriate action to move it through the pipeline or provide a status update.</p>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated notification from the Intake Pipeline system.</p>
      <p>&copy; ${new Date().getFullYear()} Skyll Platform. All rights reserved.</p>
    </div>
  `;

  return baseEmailTemplate(content);
}

/**
 * Plain text version of aging alert
 */
export function intakeAgingAlertText(options: {
  recipientName: string;
  requestTitle: string;
  requestNumber: string;
  stage: string;
  daysInStage: number;
  priority: string;
  requesterName: string;
  requestUrl: string;
}): string {
  const stageLabels: Record<string, string> = {
    in_treatment: 'In Treatment',
    on_hold: 'On Hold',
    estimation: 'Estimation',
    ready: 'Ready',
  };

  return `
Hi ${options.recipientName},

REQUEST AGING ALERT

The following intake request has been in the ${stageLabels[options.stage] || options.stage} stage for ${options.daysInStage} days and requires attention:

Request: ${options.requestNumber} - ${options.requestTitle}
Stage: ${stageLabels[options.stage] || options.stage}
Days in Stage: ${options.daysInStage} days
Priority: ${options.priority}
Requester: ${options.requesterName}

View Request: ${options.requestUrl}

Recommended Action: Review this request and take appropriate action to move it through the pipeline or provide a status update.

This is an automated notification from the Intake Pipeline system.
  `.trim();
}

/**
 * Stage change notification email template
 */
export function intakeStageChangeTemplate(options: {
  recipientName: string;
  requestTitle: string;
  requestNumber: string;
  fromStage: string;
  toStage: string;
  actorName: string;
  reason?: string;
  requestUrl: string;
}): string {
  const {
    recipientName,
    requestTitle,
    requestNumber,
    fromStage,
    toStage,
    actorName,
    reason,
    requestUrl,
  } = options;

  const stageLabels: Record<string, string> = {
    in_treatment: 'In Treatment',
    on_hold: 'On Hold',
    estimation: 'Estimation',
    ready: 'Ready',
  };

  const content = `
    <div class="header">
      <h1>Request Stage Updated</h1>
    </div>

    <div class="content">
      <p>Hi ${recipientName},</p>

      <p>A request you're tracking has been moved to a new stage:</p>

      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 120px;">Request:</td>
            <td style="padding: 8px 0; font-weight: 600;">${requestNumber} - ${requestTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">From Stage:</td>
            <td style="padding: 8px 0;">${stageLabels[fromStage] || fromStage}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">To Stage:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #2563eb;">${stageLabels[toStage] || toStage}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Changed By:</td>
            <td style="padding: 8px 0;">${actorName}</td>
          </tr>
          ${
            reason
              ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Reason:</td>
            <td style="padding: 8px 0;">${reason}</td>
          </tr>
          `
              : ''
          }
        </table>
      </div>

      <div style="text-align: center;">
        <a href="${requestUrl}" class="button">View Request</a>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated notification from the Intake Pipeline system.</p>
      <p>&copy; ${new Date().getFullYear()} Skyll Platform. All rights reserved.</p>
    </div>
  `;

  return baseEmailTemplate(content);
}

/**
 * Request converted notification email template
 */
export function intakeConvertedTemplate(options: {
  recipientName: string;
  requestTitle: string;
  requestNumber: string;
  convertedToType: 'project' | 'ticket';
  actorName: string;
  convertedItemUrl: string;
}): string {
  const {
    recipientName,
    requestTitle,
    requestNumber,
    convertedToType,
    actorName,
    convertedItemUrl,
  } = options;

  const content = `
    <div class="header">
      <h1 style="color: #059669;">Request Converted</h1>
    </div>

    <div class="content">
      <p>Hi ${recipientName},</p>

      <p>Great news! Your intake request has been processed and converted to a ${convertedToType}:</p>

      <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #059669;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 140px;">Original Request:</td>
            <td style="padding: 8px 0; font-weight: 600;">${requestNumber} - ${requestTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Converted To:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #059669; text-transform: capitalize;">${convertedToType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Converted By:</td>
            <td style="padding: 8px 0;">${actorName}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center;">
        <a href="${convertedItemUrl}" class="button" style="background-color: #059669;">View ${convertedToType === 'project' ? 'Project' : 'Ticket'}</a>
      </div>

      <p>You can now track the progress of your work in the ${convertedToType === 'project' ? 'Projects' : 'Tickets'} section.</p>
    </div>

    <div class="footer">
      <p>This is an automated notification from the Intake Pipeline system.</p>
      <p>&copy; ${new Date().getFullYear()} Skyll Platform. All rights reserved.</p>
    </div>
  `;

  return baseEmailTemplate(content);
}

/**
 * Request estimated notification email template
 */
export function intakeEstimatedTemplate(options: {
  recipientName: string;
  requestTitle: string;
  requestNumber: string;
  storyPoints: number;
  confidence: string;
  estimatorName: string;
  routingRecommendation: 'project' | 'ticket';
  requestUrl: string;
}): string {
  const {
    recipientName,
    requestTitle,
    requestNumber,
    storyPoints,
    confidence,
    estimatorName,
    routingRecommendation,
    requestUrl,
  } = options;

  const confidenceLabels: Record<string, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  const content = `
    <div class="header">
      <h1>Request Estimated</h1>
    </div>

    <div class="content">
      <p>Hi ${recipientName},</p>

      <p>Your intake request has been estimated and is ready for conversion:</p>

      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 160px;">Request:</td>
            <td style="padding: 8px 0; font-weight: 600;">${requestNumber} - ${requestTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Story Points:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #2563eb;">${storyPoints}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Confidence:</td>
            <td style="padding: 8px 0;">${confidenceLabels[confidence] || confidence}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Estimated By:</td>
            <td style="padding: 8px 0;">${estimatorName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Recommended:</td>
            <td style="padding: 8px 0; text-transform: capitalize;">${routingRecommendation}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center;">
        <a href="${requestUrl}" class="button">View Request</a>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated notification from the Intake Pipeline system.</p>
      <p>&copy; ${new Date().getFullYear()} Skyll Platform. All rights reserved.</p>
    </div>
  `;

  return baseEmailTemplate(content);
}
