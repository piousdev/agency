import { eq, desc } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { client, project, ticket } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /:id
 * Get a single client by ID with related data
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id', requireAuth(), requireInternal(), async (c) => {
  const clientId = c.req.param('id');

  try {
    // Get the client
    const clientData = await db.query.client.findFirst({
      where: eq(client.id, clientId),
    });

    if (!clientData) {
      throw new HTTPException(404, {
        message: 'Client not found',
      });
    }

    // Get related projects
    const projects = await db.query.project.findMany({
      where: eq(project.clientId, clientId),
      orderBy: [desc(project.updatedAt)],
      columns: {
        id: true,
        name: true,
        status: true,
        completionPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get recent tickets
    const tickets = await db.query.ticket.findMany({
      where: eq(ticket.clientId, clientId),
      orderBy: [desc(ticket.createdAt)],
      limit: 10,
      columns: {
        id: true,
        ticketNumber: true,
        title: true,
        status: true,
        priority: true,
        type: true,
        createdAt: true,
      },
    });

    // Calculate summary stats
    const projectStats = {
      total: projects.length,
      active: projects.filter((p) => p.status === 'in_development' || p.status === 'in_review')
        .length,
      delivered: projects.filter((p) => p.status === 'delivered').length,
    };

    const ticketStats = {
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
    };

    return c.json({
      success: true,
      data: {
        ...clientData,
        projects,
        tickets,
        stats: {
          projects: projectStats,
          tickets: ticketStats,
        },
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error getting client:', error);
    throw new HTTPException(500, {
      message: 'Failed to get client',
    });
  }
});

export default app;
