import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';
import { db } from '../../db';
import { request, requestHistory, project, ticket } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import {
  transitionRequestSchema,
  estimateRequestSchema,
  convertRequestSchema,
  holdRequestSchema,
} from '../../schemas/request';
import { eq, sql } from 'drizzle-orm';
import {
  broadcastIntakeStageChanged,
  broadcastIntakeEstimated,
  broadcastIntakeConverted,
} from '../../lib/socket.js';
import {
  sendStageChangeNotification,
  sendEstimationNotification,
  sendConversionNotification,
} from '../../lib/intake-notifications.js';

const app = new Hono<{ Variables: AuthVariables }>();

// Valid stage transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  in_treatment: ['on_hold', 'estimation'],
  on_hold: ['in_treatment', 'estimation'],
  estimation: ['in_treatment', 'on_hold', 'ready'],
  ready: ['in_treatment', 'on_hold', 'estimation'],
};

/**
 * POST /:id/transition
 * Transition a request to a different stage
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/:id/transition',
  requireAuth(),
  requireInternal(),
  zValidator('json', transitionRequestSchema),
  async (c) => {
    const id = c.req.param('id');
    const { toStage, reason } = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Get current request
      const existingRequest = await db.query.request.findFirst({
        where: eq(request.id, id),
      });

      if (!existingRequest) {
        throw new HTTPException(404, { message: 'Request not found' });
      }

      if (existingRequest.isConverted) {
        throw new HTTPException(400, { message: 'Cannot transition a converted request' });
      }

      if (existingRequest.isCancelled) {
        throw new HTTPException(400, { message: 'Cannot transition a cancelled request' });
      }

      const fromStage = existingRequest.stage;

      // Validate transition
      const validTargets = VALID_TRANSITIONS[fromStage];
      if (!validTargets?.includes(toStage)) {
        throw new HTTPException(400, {
          message: `Invalid transition from ${fromStage} to ${toStage}`,
        });
      }

      // Require reason for on_hold transition
      if (toStage === 'on_hold' && !reason) {
        throw new HTTPException(400, {
          message: 'Reason is required when moving to on_hold stage',
        });
      }

      const now = new Date();

      // Update the request
      await db
        .update(request)
        .set({
          stage: toStage,
          stageEnteredAt: now,
          holdReason: toStage === 'on_hold' ? reason : null,
          holdStartedAt: toStage === 'on_hold' ? now : null,
          updatedAt: now,
        })
        .where(eq(request.id, id));

      // Create history entry
      await db.insert(requestHistory).values({
        id: nanoid(),
        requestId: id,
        actorId: currentUser.id,
        action: 'stage_changed',
        metadata: {
          oldStage: fromStage,
          newStage: toStage,
          holdReason: toStage === 'on_hold' ? reason : undefined,
          description: `Stage changed from ${fromStage} to ${toStage}`,
        },
      });

      // Fetch the updated request
      const result = await db.query.request.findFirst({
        where: eq(request.id, id),
        with: {
          requester: {
            columns: { id: true, name: true, email: true, image: true },
          },
          assignedPm: {
            columns: { id: true, name: true, email: true, image: true },
          },
          client: true,
        },
      });

      // Broadcast real-time event
      if (result) {
        broadcastIntakeStageChanged(
          {
            requestId: result.id,
            requestTitle: result.title,
            fromStage,
            toStage,
            actorId: currentUser.id,
            actorName: currentUser.name || 'Unknown',
            holdReason: toStage === 'on_hold' ? reason : undefined,
            timestamp: now.toISOString(),
          },
          { excludeUserId: currentUser.id }
        );

        // Send email notification to requester for significant stage changes
        if (result.requester?.email && (toStage === 'estimation' || toStage === 'on_hold')) {
          sendStageChangeNotification({
            requestId: result.id,
            requestNumber: result.requestNumber || result.id,
            requestTitle: result.title,
            requesterEmail: result.requester.email,
            requesterName: result.requester.name || 'User',
            fromStage,
            toStage,
            actorName: currentUser.name || 'Unknown',
            reason: toStage === 'on_hold' ? reason : undefined,
          }).catch((err) => console.error('Failed to send stage change notification:', err));
        }
      }

      return c.json({
        success: true,
        data: result,
        message: `Request transitioned to ${toStage}`,
      });
    } catch (error) {
      console.error('Error transitioning request:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to transition request' });
    }
  }
);

/**
 * POST /:id/hold
 * Put a request on hold
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/:id/hold',
  requireAuth(),
  requireInternal(),
  zValidator('json', holdRequestSchema),
  async (c) => {
    const id = c.req.param('id');
    const { reason } = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      const existingRequest = await db.query.request.findFirst({
        where: eq(request.id, id),
      });

      if (!existingRequest) {
        throw new HTTPException(404, { message: 'Request not found' });
      }

      if (existingRequest.stage === 'on_hold') {
        throw new HTTPException(400, { message: 'Request is already on hold' });
      }

      const fromStage = existingRequest.stage;
      const now = new Date();

      await db
        .update(request)
        .set({
          stage: 'on_hold',
          stageEnteredAt: now,
          holdReason: reason,
          holdStartedAt: now,
          updatedAt: now,
        })
        .where(eq(request.id, id));

      await db.insert(requestHistory).values({
        id: nanoid(),
        requestId: id,
        actorId: currentUser.id,
        action: 'put_on_hold',
        metadata: {
          oldStage: fromStage,
          holdReason: reason,
          description: `Put on hold: ${reason}`,
        },
      });

      const result = await db.query.request.findFirst({
        where: eq(request.id, id),
        with: {
          requester: { columns: { id: true, name: true, email: true, image: true } },
          client: true,
        },
      });

      return c.json({
        success: true,
        data: result,
        message: 'Request put on hold',
      });
    } catch (error) {
      console.error('Error putting request on hold:', error);
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, { message: 'Failed to put request on hold' });
    }
  }
);

/**
 * POST /:id/resume
 * Resume a request from hold
 * Protected: Requires authentication and internal team member status
 */
app.post('/:id/resume', requireAuth(), requireInternal(), async (c) => {
  const id = c.req.param('id');
  const currentUser = c.get('user');

  if (!currentUser) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  try {
    const existingRequest = await db.query.request.findFirst({
      where: eq(request.id, id),
    });

    if (!existingRequest) {
      throw new HTTPException(404, { message: 'Request not found' });
    }

    if (existingRequest.stage !== 'on_hold') {
      throw new HTTPException(400, { message: 'Request is not on hold' });
    }

    const now = new Date();

    await db
      .update(request)
      .set({
        stage: 'in_treatment',
        stageEnteredAt: now,
        holdReason: null,
        holdStartedAt: null,
        updatedAt: now,
      })
      .where(eq(request.id, id));

    await db.insert(requestHistory).values({
      id: nanoid(),
      requestId: id,
      actorId: currentUser.id,
      action: 'resumed',
      metadata: {
        oldStage: 'on_hold',
        newStage: 'in_treatment',
        description: 'Resumed from hold',
      },
    });

    const result = await db.query.request.findFirst({
      where: eq(request.id, id),
      with: {
        requester: { columns: { id: true, name: true, email: true, image: true } },
        client: true,
      },
    });

    return c.json({
      success: true,
      data: result,
      message: 'Request resumed',
    });
  } catch (error) {
    console.error('Error resuming request:', error);
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Failed to resume request' });
  }
});

/**
 * POST /:id/estimate
 * Submit estimation for a request
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/:id/estimate',
  requireAuth(),
  requireInternal(),
  zValidator('json', estimateRequestSchema),
  async (c) => {
    const id = c.req.param('id');
    const { storyPoints, confidence, estimationNotes } = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      const existingRequest = await db.query.request.findFirst({
        where: eq(request.id, id),
      });

      if (!existingRequest) {
        throw new HTTPException(404, { message: 'Request not found' });
      }

      if (existingRequest.stage !== 'estimation') {
        throw new HTTPException(400, {
          message: 'Request must be in estimation stage to submit an estimate',
        });
      }

      const now = new Date();

      // Update request with estimation and move to ready stage
      await db
        .update(request)
        .set({
          storyPoints,
          confidence,
          estimationNotes,
          estimatedAt: now,
          estimatorId: currentUser.id,
          stage: 'ready',
          stageEnteredAt: now,
          updatedAt: now,
        })
        .where(eq(request.id, id));

      await db.insert(requestHistory).values({
        id: nanoid(),
        requestId: id,
        actorId: currentUser.id,
        action: 'estimated',
        metadata: {
          storyPoints,
          confidence,
          description: `Estimated: ${storyPoints} story points (${confidence} confidence)`,
        },
      });

      const result = await db.query.request.findFirst({
        where: eq(request.id, id),
        with: {
          requester: { columns: { id: true, name: true, email: true, image: true } },
          estimator: { columns: { id: true, name: true, email: true, image: true } },
          client: true,
        },
      });

      // Broadcast real-time event
      if (result) {
        const routingRecommendation =
          existingRequest.type === 'change_request' || storyPoints <= 8 ? 'ticket' : 'project';

        broadcastIntakeEstimated(
          {
            requestId: result.id,
            requestTitle: result.title,
            storyPoints,
            confidence,
            estimatorId: currentUser.id,
            estimatorName: currentUser.name || 'Unknown',
            routingRecommendation,
            timestamp: now.toISOString(),
          },
          { excludeUserId: currentUser.id }
        );

        // Send email notification to requester about estimation
        if (result.requester?.email) {
          sendEstimationNotification({
            requestId: result.id,
            requesterEmail: result.requester.email,
            requesterName: result.requester.name || 'User',
            requestNumber: result.requestNumber || result.id,
            requestTitle: result.title,
            storyPoints,
            confidence,
            estimatorName: currentUser.name || 'Unknown',
            routingRecommendation,
          }).catch((err) => console.error('Failed to send estimation notification:', err));
        }
      }

      return c.json({
        success: true,
        data: result,
        message: 'Estimation submitted successfully',
      });
    } catch (error) {
      console.error('Error submitting estimation:', error);
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, { message: 'Failed to submit estimation' });
    }
  }
);

/**
 * Helper to generate unique project/ticket number
 */
async function generateProjectNumber(): Promise<string> {
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(project);
  const count = result[0]?.count ?? 0;
  return `PRJ-${String(count + 1).padStart(4, '0')}`;
}

async function generateTicketNumber(): Promise<string> {
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(ticket);
  const count = result[0]?.count ?? 0;
  return `TKT-${String(count + 1).padStart(4, '0')}`;
}

/**
 * POST /:id/convert
 * Convert a request to a project or ticket
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/:id/convert',
  requireAuth(),
  requireInternal(),
  zValidator('json', convertRequestSchema),
  async (c) => {
    const id = c.req.param('id');
    const { destinationType, projectId, overrideRouting } = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      const existingRequest = await db.query.request.findFirst({
        where: eq(request.id, id),
        with: {
          requester: {
            columns: { id: true, name: true, email: true },
          },
        },
      });

      if (!existingRequest) {
        throw new HTTPException(404, { message: 'Request not found' });
      }

      if (existingRequest.stage !== 'ready') {
        throw new HTTPException(400, {
          message: 'Request must be in ready stage to convert',
        });
      }

      if (existingRequest.isConverted) {
        throw new HTTPException(400, { message: 'Request is already converted' });
      }

      // Apply routing rules if not overriding
      let finalDestination = destinationType;
      if (!overrideRouting && existingRequest.storyPoints) {
        // Change requests always go to tickets
        if (existingRequest.type === 'change_request') {
          finalDestination = 'ticket';
        } else if (existingRequest.storyPoints <= 8) {
          finalDestination = 'ticket';
        } else {
          finalDestination = 'project';
        }
      }

      const now = new Date();
      let convertedToId: string;

      if (finalDestination === 'project') {
        // Validate clientId is required for project conversion
        if (!existingRequest.clientId) {
          throw new HTTPException(400, {
            message: 'Request must have a client assigned to convert to a project',
          });
        }
        // Map request priority to project priority (critical -> urgent)
        const projectPriority =
          existingRequest.priority === 'critical' ? 'urgent' : existingRequest.priority;

        // Create a new project
        const newProject = await db
          .insert(project)
          .values({
            id: nanoid(),
            name: existingRequest.title,
            description: existingRequest.description,
            status: 'proposal',
            priority: projectPriority,
            clientId: existingRequest.clientId,
            ownerId: currentUser.id,
          })
          .returning();

        convertedToId = newProject[0]!.id;
      } else {
        // Create a new ticket
        const ticketNumber = await generateTicketNumber();
        const newTicket = await db
          .insert(ticket)
          .values({
            id: nanoid(),
            ticketNumber,
            title: existingRequest.title,
            description: existingRequest.description,
            type: existingRequest.type === 'bug' ? 'bug' : 'task',
            status: 'open',
            priority: existingRequest.priority,
            clientId: existingRequest.clientId!,
            projectId: projectId || existingRequest.relatedProjectId,
            createdById: currentUser.id,
            storyPoints: existingRequest.storyPoints,
          })
          .returning();

        convertedToId = newTicket[0]!.id;
      }

      // Update the request
      await db
        .update(request)
        .set({
          isConverted: true,
          convertedToType: finalDestination,
          convertedToId,
          convertedAt: now,
          updatedAt: now,
        })
        .where(eq(request.id, id));

      await db.insert(requestHistory).values({
        id: nanoid(),
        requestId: id,
        actorId: currentUser.id,
        action: 'converted',
        metadata: {
          convertedToType: finalDestination,
          convertedToId,
          description: `Converted to ${finalDestination}`,
        },
      });

      // Broadcast real-time event
      broadcastIntakeConverted(
        {
          requestId: id,
          requestTitle: existingRequest.title,
          convertedToType: finalDestination,
          convertedToId,
          actorId: currentUser.id,
          actorName: currentUser.name || 'Unknown',
          timestamp: now.toISOString(),
        },
        { excludeUserId: currentUser.id }
      );

      // Send email notification to requester about conversion
      if (existingRequest.requester?.email) {
        sendConversionNotification({
          requesterEmail: existingRequest.requester.email,
          requesterName: existingRequest.requester.name || 'User',
          requestNumber: existingRequest.requestNumber || existingRequest.id,
          requestTitle: existingRequest.title,
          convertedToType: finalDestination,
          convertedToId,
          actorName: currentUser.name || 'Unknown',
        }).catch((err) => console.error('Failed to send conversion notification:', err));
      }

      return c.json({
        success: true,
        data: {
          convertedToType: finalDestination,
          convertedToId,
        },
        message: `Request converted to ${finalDestination}`,
      });
    } catch (error) {
      console.error('Error converting request:', error);
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, { message: 'Failed to convert request' });
    }
  }
);

export default app;
