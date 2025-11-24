import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';
import { db } from '../../db';
import { request, requestHistory, client, project, user } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { updateRequestSchema, assignPmSchema, assignEstimatorSchema } from '../../schemas/request';
import { eq } from 'drizzle-orm';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /:id
 * Update a request
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateRequestSchema),
  async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Check if request exists
      const existingRequest = await db.query.request.findFirst({
        where: eq(request.id, id),
      });

      if (!existingRequest) {
        throw new HTTPException(404, { message: 'Request not found' });
      }

      // Verify client exists if provided
      if (body.clientId) {
        const clientExists = await db.query.client.findFirst({
          where: eq(client.id, body.clientId),
        });
        if (!clientExists) {
          throw new HTTPException(404, { message: 'Client not found' });
        }
      }

      // Verify related project exists if provided
      if (body.relatedProjectId) {
        const projectExists = await db.query.project.findFirst({
          where: eq(project.id, body.relatedProjectId),
        });
        if (!projectExists) {
          throw new HTTPException(404, { message: 'Related project not found' });
        }
      }

      // Update the request
      const updatedRequest = await db
        .update(request)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(request.id, id))
        .returning();

      // Create history entry
      await db.insert(requestHistory).values({
        id: nanoid(),
        requestId: id,
        actorId: currentUser.id,
        action: 'updated',
        metadata: {
          description: 'Updated request fields',
        },
      });

      // Fetch the complete request with relations
      const result = await db.query.request.findFirst({
        where: eq(request.id, id),
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

      return c.json({
        success: true,
        data: result,
        message: 'Request updated successfully',
      });
    } catch (error) {
      console.error('Error updating request:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to update request' });
    }
  }
);

/**
 * POST /:id/assign-pm
 * Assign a PM to the request
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/:id/assign-pm',
  requireAuth(),
  requireInternal(),
  zValidator('json', assignPmSchema),
  async (c) => {
    const id = c.req.param('id');
    const { assignedPmId } = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Check if request exists
      const existingRequest = await db.query.request.findFirst({
        where: eq(request.id, id),
      });

      if (!existingRequest) {
        throw new HTTPException(404, { message: 'Request not found' });
      }

      // Verify PM exists
      const pmUser = await db.query.user.findFirst({
        where: eq(user.id, assignedPmId),
      });

      if (!pmUser) {
        throw new HTTPException(404, { message: 'PM user not found' });
      }

      // Update the request
      await db
        .update(request)
        .set({
          assignedPmId,
          updatedAt: new Date(),
        })
        .where(eq(request.id, id));

      // Create history entry
      await db.insert(requestHistory).values({
        id: nanoid(),
        requestId: id,
        actorId: currentUser.id,
        action: 'assigned_pm',
        metadata: {
          newValue: assignedPmId,
          description: `Assigned PM: ${pmUser.name}`,
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

      return c.json({
        success: true,
        data: result,
        message: 'PM assigned successfully',
      });
    } catch (error) {
      console.error('Error assigning PM:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to assign PM' });
    }
  }
);

/**
 * POST /:id/assign-estimator
 * Assign an estimator to the request
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/:id/assign-estimator',
  requireAuth(),
  requireInternal(),
  zValidator('json', assignEstimatorSchema),
  async (c) => {
    const id = c.req.param('id');
    const { estimatorId } = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Check if request exists
      const existingRequest = await db.query.request.findFirst({
        where: eq(request.id, id),
      });

      if (!existingRequest) {
        throw new HTTPException(404, { message: 'Request not found' });
      }

      // Verify estimator exists
      const estimatorUser = await db.query.user.findFirst({
        where: eq(user.id, estimatorId),
      });

      if (!estimatorUser) {
        throw new HTTPException(404, { message: 'Estimator user not found' });
      }

      // Update the request
      await db
        .update(request)
        .set({
          estimatorId,
          updatedAt: new Date(),
        })
        .where(eq(request.id, id));

      // Create history entry
      await db.insert(requestHistory).values({
        id: nanoid(),
        requestId: id,
        actorId: currentUser.id,
        action: 'assigned_estimator',
        metadata: {
          newValue: estimatorId,
          description: `Assigned estimator: ${estimatorUser.name}`,
        },
      });

      // Fetch the updated request
      const result = await db.query.request.findFirst({
        where: eq(request.id, id),
        with: {
          requester: {
            columns: { id: true, name: true, email: true, image: true },
          },
          estimator: {
            columns: { id: true, name: true, email: true, image: true },
          },
          client: true,
        },
      });

      return c.json({
        success: true,
        data: result,
        message: 'Estimator assigned successfully',
      });
    } catch (error) {
      console.error('Error assigning estimator:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to assign estimator' });
    }
  }
);

/**
 * DELETE /:id
 * Cancel (soft delete) a request
 * Protected: Requires authentication and internal team member status
 */
app.delete('/:id', requireAuth(), requireInternal(), async (c) => {
  const id = c.req.param('id');
  const currentUser = c.get('user');

  if (!currentUser) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  try {
    // Check if request exists
    const existingRequest = await db.query.request.findFirst({
      where: eq(request.id, id),
    });

    if (!existingRequest) {
      throw new HTTPException(404, { message: 'Request not found' });
    }

    if (existingRequest.isCancelled) {
      throw new HTTPException(400, { message: 'Request is already cancelled' });
    }

    // Soft delete by setting isCancelled
    await db
      .update(request)
      .set({
        isCancelled: true,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(request.id, id));

    // Create history entry
    await db.insert(requestHistory).values({
      id: nanoid(),
      requestId: id,
      actorId: currentUser.id,
      action: 'cancelled',
      metadata: {
        description: 'Request cancelled',
      },
    });

    return c.json({
      success: true,
      message: 'Request cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling request:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to cancel request' });
  }
});

export default app;
