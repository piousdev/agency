import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { ticket, user } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { assignTicketSchema } from '../../schemas/ticket';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /:id/assign
 * Assign a ticket to a team member
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id/assign',
  requireAuth(),
  requireInternal(),
  zValidator('json', assignTicketSchema),
  async (c) => {
    const ticketId = c.req.param('id');
    const body = c.req.valid('json');

    try {
      // Check if ticket exists
      const existingTicket = await db.query.ticket.findFirst({
        where: eq(ticket.id, ticketId),
      });

      if (!existingTicket) {
        throw new HTTPException(404, {
          message: 'Ticket not found',
        });
      }

      // If assigning (not null), verify the user exists
      if (body.assignedToId !== null) {
        const assignedUser = await db.query.user.findFirst({
          where: eq(user.id, body.assignedToId),
        });

        if (!assignedUser) {
          throw new HTTPException(404, {
            message: 'User not found',
          });
        }
      }

      // Update the ticket with assignment/unassignment
      await db
        .update(ticket)
        .set({
          assignedToId: body.assignedToId,
          // Auto-change status to in_progress when assigned, keep status when unassigned
          ...(body.assignedToId !== null && { status: 'in_progress' }),
          updatedAt: new Date(),
        })
        .where(eq(ticket.id, ticketId));

      // Fetch the updated ticket with relations
      const updatedTicket = await db.query.ticket.findFirst({
        where: eq(ticket.id, ticketId),
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

      return c.json({
        success: true,
        data: updatedTicket,
        message: 'Ticket assigned successfully',
      });
    } catch (error) {
      console.error('Error assigning ticket:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to assign ticket',
      });
    }
  }
);

export default app;
