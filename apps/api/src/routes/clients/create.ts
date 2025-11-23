import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { nanoid } from 'nanoid';
import { db } from '../../db';
import { client } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { createClientSchema } from '../../schemas/client';

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
