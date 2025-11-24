import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { label } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /:id
 * Get a single label by ID
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id', requireAuth(), requireInternal(), async (c) => {
  const labelId = c.req.param('id');

  try {
    const foundLabel = await db.query.label.findFirst({
      where: eq(label.id, labelId),
    });

    if (!foundLabel) {
      throw new HTTPException(404, {
        message: 'Label not found',
      });
    }

    return c.json({
      success: true,
      data: foundLabel,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error getting label:', error);
    throw new HTTPException(500, {
      message: 'Failed to get label',
    });
  }
});

export default app;
