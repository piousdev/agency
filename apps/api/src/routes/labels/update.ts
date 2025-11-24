import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { label } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { logEntityChange, EntityTypes } from '../../utils/activity';

const updateLabelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  description: z.string().max(500).optional().nullable(),
  scope: z.enum(['global', 'project', 'ticket']).optional(),
});

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /:id
 * Update an existing label
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateLabelSchema),
  async (c) => {
    const labelId = c.req.param('id');
    const data = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Check if label exists
      const existingLabel = await db.query.label.findFirst({
        where: eq(label.id, labelId),
      });

      if (!existingLabel) {
        throw new HTTPException(404, {
          message: 'Label not found',
        });
      }

      // Build update object with only provided fields
      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.scope !== undefined) updateData.scope = data.scope;

      // Update the label
      const [updatedLabel] = await db
        .update(label)
        .set(updateData)
        .where(eq(label.id, labelId))
        .returning();

      // Log activity for label update
      await logEntityChange(
        {
          entityType: EntityTypes.LABEL,
          entityId: labelId,
          actorId: currentUser.id,
        },
        existingLabel,
        updatedLabel!
      );

      return c.json({
        success: true,
        data: updatedLabel,
        message: 'Label updated successfully',
      });
    } catch (error) {
      console.error('Error updating label:', error);
      if (error instanceof HTTPException) {
        throw error;
      }

      // Check for unique constraint violation
      if (error instanceof Error && error.message.includes('unique constraint')) {
        throw new HTTPException(409, {
          message: 'A label with this name already exists',
        });
      }

      throw new HTTPException(500, {
        message: 'Failed to update label',
      });
    }
  }
);

export default app;
