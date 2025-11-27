/**
 * Get sprint API route
 */

import { eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../../db/index.js';
import { sprint } from '../../db/schema/sprint.js';
import { requireAuth, requireInternal } from '../../middleware/auth.js';

const app = new Hono();

/**
 * GET /:id - Get a single sprint with related data
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id', requireAuth(), requireInternal(), async (c) => {
  const id = c.req.param('id');

  try {
    const result = await db.query.sprint.findFirst({
      where: eq(sprint.id, id),
      with: {
        project: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!result) {
      return c.json({ success: false, message: 'Sprint not found' }, 404);
    }

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error getting sprint:', error);
    return c.json({ success: false, message: 'Failed to get sprint' }, 500);
  }
});

export default app;
