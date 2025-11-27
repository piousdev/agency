import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { client } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { updateClientSchema } from '../../schemas/client';
import { logEntityChange, EntityTypes } from '../../utils/activity';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /:id
 * Update an existing client
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateClientSchema),
  async (c) => {
    const clientId = c.req.param('id');
    const data = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Check if client exists
      const existingClient = await db.query.client.findFirst({
        where: eq(client.id, clientId),
      });

      if (!existingClient) {
        throw new HTTPException(404, {
          message: 'Client not found',
        });
      }

      // Build update object with only provided fields
      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone ?? null;
      if (data.website !== undefined) updateData.website = data.website ?? null;
      if (data.address !== undefined) updateData.address = data.address ?? null;
      if (data.notes !== undefined) updateData.notes = data.notes ?? null;
      if (data.active !== undefined) updateData.active = data.active;

      // Update the client
      const [updatedClient] = await db
        .update(client)
        .set(updateData)
        .where(eq(client.id, clientId))
        .returning();

      // Log activity for client update
      if (updatedClient) {
        await logEntityChange(
          {
            entityType: EntityTypes.CLIENT,
            entityId: clientId,
            actorId: currentUser.id,
          },
          existingClient,
          updatedClient
        );
      }

      return c.json({
        success: true,
        data: updatedClient,
        message: 'Client updated successfully',
      });
    } catch (error) {
      console.error('Error updating client:', error);
      if (error instanceof HTTPException) {
        throw error;
      }

      // Check for unique constraint violation (email)
      if (error instanceof Error && error.message.includes('unique constraint')) {
        throw new HTTPException(409, {
          message: 'A client with this email already exists',
        });
      }

      throw new HTTPException(500, {
        message: 'Failed to update client',
      });
    }
  }
);

export default app;
