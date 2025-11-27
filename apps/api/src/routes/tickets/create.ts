import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';

import { db } from '../../db';
import { ticket, client, user } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { createTicketSchema } from '../../schemas/ticket';
import { logActivity, ActivityTypes, EntityTypes } from '../../utils/activity';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * POST /
 * Create a new ticket (intake request)
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/',
  requireAuth(),
  requireInternal(),
  zValidator('json', createTicketSchema),
  async (c) => {
    const body = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Verify client exists
      const clientExists = await db.query.client.findFirst({
        where: eq(client.id, body.clientId),
      });

      if (!clientExists) {
        throw new HTTPException(404, {
          message: 'Client not found',
        });
      }

      // If assignedToId provided, verify user exists
      if (body.assignedToId !== undefined && body.assignedToId !== '') {
        const assignedUser = await db.query.user.findFirst({
          where: eq(user.id, body.assignedToId),
        });

        if (!assignedUser) {
          throw new HTTPException(404, {
            message: 'Assigned user not found',
          });
        }
      }

      // Create the ticket
      const newTicket = await db
        .insert(ticket)
        .values({
          id: nanoid(),
          title: body.title,
          description: body.description,
          type: body.type,
          priority: body.priority,
          status:
            body.assignedToId !== undefined && body.assignedToId !== '' ? 'in_progress' : 'open',
          clientId: body.clientId,
          projectId: body.projectId,
          assignedToId: body.assignedToId,
          createdById: currentUser.id,
        })
        .returning();

      // Fetch the complete ticket with relations
      const firstTicket = newTicket[0];
      if (!firstTicket) {
        throw new HTTPException(500, { message: 'Failed to create ticket' });
      }

      const createdTicket = await db.query.ticket.findFirst({
        where: eq(ticket.id, firstTicket.id),
        with: {
          client: true,
          project: true,
          assignedTo: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Log activity for ticket creation
      await logActivity({
        type: ActivityTypes.CREATED,
        entityType: EntityTypes.TICKET,
        entityId: firstTicket.id,
        actorId: currentUser.id,
        metadata: {
          title: body.title,
          type: body.type,
          priority: body.priority,
        },
      });

      return c.json(
        {
          success: true,
          data: createdTicket,
          message: 'Ticket created successfully',
        },
        201
      );
    } catch (error) {
      console.error('Error creating ticket:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to create ticket',
      });
    }
  }
);

export default app;
