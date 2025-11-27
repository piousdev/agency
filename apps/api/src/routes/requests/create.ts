import { zValidator } from '@hono/zod-validator';
import { eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';

import { db } from '../../db';
import { request, requestHistory, client, project } from '../../db/schema';
import { broadcastIntakeCreated } from '../../lib/socket.js';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { createRequestSchema } from '../../schemas/request';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * Generate unique request number (REQ-0001, REQ-0002, etc.)
 */
async function generateRequestNumber(): Promise<string> {
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(request);
  const count = result[0]?.count ?? 0;
  return `REQ-${String(count + 1).padStart(4, '0')}`;
}

/**
 * POST /
 * Create a new intake request
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/',
  requireAuth(),
  requireInternal(),
  zValidator('json', createRequestSchema),
  async (c) => {
    const body = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Verify client exists if provided
      if (body.clientId !== undefined && body.clientId !== '') {
        const clientExists = await db.query.client.findFirst({
          where: eq(client.id, body.clientId),
        });
        if (!clientExists) {
          throw new HTTPException(404, { message: 'Client not found' });
        }
      }

      // Verify related project exists if provided
      if (body.relatedProjectId !== undefined && body.relatedProjectId !== '') {
        const projectExists = await db.query.project.findFirst({
          where: eq(project.id, body.relatedProjectId),
        });
        if (!projectExists) {
          throw new HTTPException(404, { message: 'Related project not found' });
        }
      }

      const requestNumber = await generateRequestNumber();
      const now = new Date();

      // Create the request
      const newRequest = await db
        .insert(request)
        .values({
          id: nanoid(),
          requestNumber,
          title: body.title,
          description: body.description,
          type: body.type,
          priority: body.priority,
          stage: 'in_treatment',
          stageEnteredAt: now,
          businessJustification: body.businessJustification,
          desiredDeliveryDate: body.desiredDeliveryDate,
          stepsToReproduce: body.stepsToReproduce,
          dependencies: body.dependencies,
          additionalNotes: body.additionalNotes,
          clientId: body.clientId,
          relatedProjectId: body.relatedProjectId,
          requesterId: currentUser.id,
          tags: body.tags,
        })
        .returning();

      const firstRequest = newRequest[0];
      if (!firstRequest) {
        throw new HTTPException(500, { message: 'Failed to create request' });
      }

      // Create history entry
      await db.insert(requestHistory).values({
        id: nanoid(),
        requestId: firstRequest.id,
        actorId: currentUser.id,
        action: 'created',
        metadata: {
          description: `Created request "${body.title}"`,
        },
      });

      // Fetch the complete request with relations
      const createdRequest = await db.query.request.findFirst({
        where: eq(request.id, firstRequest.id),
        with: {
          requester: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          client: true,
          relatedProject: true,
          assignedPm: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      // Broadcast real-time event
      if (createdRequest) {
        broadcastIntakeCreated(
          {
            id: createdRequest.id,
            title: createdRequest.title,
            type: createdRequest.type,
            priority: createdRequest.priority,
            stage: createdRequest.stage,
            requesterId: createdRequest.requesterId,
            requesterName: createdRequest.requester.name,
            clientId: createdRequest.clientId ?? undefined,
            clientName: createdRequest.client?.name,
            createdAt: createdRequest.createdAt.toISOString(),
            updatedAt: createdRequest.updatedAt.toISOString(),
          },
          { excludeUserId: currentUser.id }
        );
      }

      return c.json(
        {
          success: true,
          data: createdRequest,
          message: 'Request created successfully',
        },
        201
      );
    } catch (error) {
      console.error('Error creating request:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to create request' });
    }
  }
);

export default app;
