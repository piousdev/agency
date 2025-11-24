import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { request } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { eq } from 'drizzle-orm';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /:id
 * Get a single request by ID
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id', requireAuth(), requireInternal(), async (c) => {
  const id = c.req.param('id');

  try {
    const foundRequest = await db.query.request.findFirst({
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
        relatedProject: {
          columns: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignedPm: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        estimator: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        attachments: {
          with: {
            file: true,
          },
        },
        history: {
          orderBy: (history, { desc }) => [desc(history.createdAt)],
          limit: 50,
          with: {
            actor: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!foundRequest) {
      throw new HTTPException(404, { message: 'Request not found' });
    }

    return c.json({
      success: true,
      data: foundRequest,
    });
  } catch (error) {
    console.error('Error getting request:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to get request' });
  }
});

export default app;
