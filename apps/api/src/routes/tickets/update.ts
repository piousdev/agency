import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { ticket } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { updateTicketSchema } from '../../schemas/ticket';
import { eq } from 'drizzle-orm';
import { logEntityChange, EntityTypes } from '../../utils/activity';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /:id
 * Update a ticket
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateTicketSchema),
  async (c) => {
    const ticketId = c.req.param('id');
    const body = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

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

      // Update the ticket
      await db
        .update(ticket)
        .set({
          ...body,
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

      // Log activity for ticket update
      await logEntityChange({
        entityType: EntityTypes.TICKET,
        entityId: ticketId,
        actorId: currentUser.id,
        ticketId: ticketId,
        before: existingTicket,
        after: updatedTicket!,
      });

      return c.json({
        success: true,
        data: updatedTicket,
        message: 'Ticket updated successfully',
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to update ticket',
      });
    }
  }
);

export default app;
