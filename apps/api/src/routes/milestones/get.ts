/**
 * Get milestone API route
 */

import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { milestone } from '../../db/schema/milestone.js';
import { requireAuth, requireInternal } from '../../middleware/auth.js';

const app = new Hono();

/**
 * GET /:id - Get a single milestone
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id', requireAuth(), requireInternal(), async (c) => {
  const id = c.req.param('id');

  try {
    const result = await db.query.milestone.findFirst({
      where: eq(milestone.id, id),
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
      return c.json({ success: false, message: 'Milestone not found' }, 404);
    }

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error getting milestone:', error);
    return c.json({ success: false, message: 'Failed to get milestone' }, 500);
  }
});

export default app;
