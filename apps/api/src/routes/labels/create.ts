import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { db } from '../../db';
import { label } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { logActivity, ActivityTypes, EntityTypes } from '../../utils/activity';

const createLabelSchema = z.object({
  name: z.string().min(1).max(100),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default('#6B7280'),
  description: z.string().max(500).optional(),
  scope: z.enum(['global', 'project', 'ticket']).default('global'),
});

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * POST /
 * Create a new label
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/',
  requireAuth(),
  requireInternal(),
  zValidator('json', createLabelSchema),
  async (c) => {
    const data = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      const labelId = nanoid();

      const [newLabel] = await db
        .insert(label)
        .values({
          id: labelId,
          name: data.name,
          color: data.color,
          description: data.description ?? null,
          scope: data.scope,
        })
        .returning();

      // Log activity for label creation
      await logActivity({
        type: ActivityTypes.CREATED,
        entityType: EntityTypes.LABEL,
        entityId: labelId,
        actorId: currentUser.id,
        metadata: {
          name: data.name,
          scope: data.scope,
        },
      });

      return c.json(
        {
          success: true,
          data: newLabel,
          message: 'Label created successfully',
        },
        201
      );
    } catch (error) {
      console.error('Error creating label:', error);

      // Check for unique constraint violation
      if (error instanceof Error && error.message.includes('unique constraint')) {
        throw new HTTPException(409, {
          message: 'A label with this name already exists',
        });
      }

      throw new HTTPException(500, {
        message: 'Failed to create label',
      });
    }
  }
);

export default app;
