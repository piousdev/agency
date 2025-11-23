import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { nanoid } from 'nanoid';
import { db } from '../../db';
import { client } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { createClientSchema } from '../../schemas/client';
import { logActivity, ActivityTypes, EntityTypes } from '../../utils/activity';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * POST /
 * Create a new client
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/',
  requireAuth(),
  requireInternal(),
  zValidator('json', createClientSchema),
  async (c) => {
    const data = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      const clientId = nanoid();

      const [newClient] = await db
        .insert(client)
        .values({
          id: clientId,
          name: data.name,
          type: data.type,
          email: data.email,
          phone: data.phone || null,
          website: data.website || null,
          address: data.address || null,
          notes: data.notes || null,
        })
        .returning();

      // Log activity for client creation
      await logActivity({
        type: ActivityTypes.CREATED,
        entityType: EntityTypes.CLIENT,
        entityId: clientId,
        actorId: currentUser.id,
        clientId: clientId,
        metadata: {
          name: data.name,
          type: data.type,
        },
      });

      return c.json(
        {
          success: true,
          data: newClient,
          message: 'Client created successfully',
        },
        201
      );
    } catch (error) {
      console.error('Error creating client:', error);

      // Check for unique constraint violation (email)
      if (error instanceof Error && error.message.includes('unique constraint')) {
        throw new HTTPException(409, {
          message: 'A client with this email already exists',
        });
      }

      throw new HTTPException(500, {
        message: 'Failed to create client',
      });
    }
  }
);

export default app;
