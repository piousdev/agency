import { Hono } from 'hono';
import { desc, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { ticket, ticketActivity } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /:id
 * Get a single ticket by ID with all relations
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id', requireAuth(), requireInternal(), async (c) => {
  const id = c.req.param('id');

  try {
    const ticketData = await db.query.ticket.findFirst({
      where: eq(ticket.id, id),
      with: {
        client: true,
        project: {
          columns: {
            id: true,
            name: true,
            status: true,
          },
        },
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
            image: true,
          },
        },
        comments: {
          with: {
            author: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: (comments, { asc }) => [asc(comments.createdAt)],
        },
        files: {
          with: {
            uploadedBy: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: (files, { desc }) => [desc(files.createdAt)],
        },
        activities: {
          with: {
            actor: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: (activities, { desc }) => [desc(activities.createdAt)],
          limit: 50, // Limit activity feed
        },
        childTickets: {
          columns: {
            id: true,
            ticketNumber: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        parentTicket: {
          columns: {
            id: true,
            ticketNumber: true,
            title: true,
          },
        },
      },
    });

    if (!ticketData) {
      throw new HTTPException(404, {
        message: 'Ticket not found',
      });
    }

    return c.json({
      success: true,
      data: ticketData,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error fetching ticket:', error);
    throw new HTTPException(500, {
      message: 'Failed to fetch ticket',
    });
  }
});

/**
 * GET /:id/activity
 * Get activity feed for a ticket
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id/activity', requireAuth(), requireInternal(), async (c) => {
  const id = c.req.param('id');

  try {
    const activities = await db.query.ticketActivity.findMany({
      where: eq(ticketActivity.ticketId, id),
      with: {
        actor: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [desc(ticketActivity.createdAt)],
      limit: 100,
    });

    return c.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error('Error fetching ticket activity:', error);
    throw new HTTPException(500, {
      message: 'Failed to fetch ticket activity',
    });
  }
});

export default app;
