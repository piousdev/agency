import { zValidator } from '@hono/zod-validator';
import { eq, desc, asc, and, count } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { ticket } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { listTicketsQuerySchema } from '../../schemas/ticket';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /
 * List all tickets with pagination and filtering
 * Protected: Requires authentication and internal team member status
 */
app.get(
  '/',
  requireAuth(),
  requireInternal(),
  zValidator('query', listTicketsQuerySchema),
  async (c) => {
    const query = c.req.valid('query');
    const {
      page,
      pageSize,
      sortBy,
      sortOrder,
      type,
      status,
      priority,
      assignedToId,
      clientId,
      projectId,
    } = query;

    try {
      // Build WHERE clause
      const whereConditions = [];

      if (type !== undefined && type !== '') {
        whereConditions.push(eq(ticket.type, type));
      }
      if (status !== undefined && status !== '') {
        whereConditions.push(eq(ticket.status, status));
      }
      if (priority !== undefined && priority !== '') {
        whereConditions.push(eq(ticket.priority, priority));
      }
      if (assignedToId !== undefined && assignedToId !== '') {
        whereConditions.push(eq(ticket.assignedToId, assignedToId));
      }
      if (clientId !== undefined && clientId !== '') {
        whereConditions.push(eq(ticket.clientId, clientId));
      }
      if (projectId !== undefined && projectId !== '') {
        whereConditions.push(eq(ticket.projectId, projectId));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Determine sort column safely
      let sortColumn;
      switch (sortBy) {
        case 'createdAt':
          sortColumn = ticket.createdAt;
          break;
        case 'updatedAt':
          sortColumn = ticket.updatedAt;
          break;
        case 'priority':
          sortColumn = ticket.priority;
          break;
        case 'status':
          sortColumn = ticket.status;
          break;
      }

      // Query tickets with pagination
      const offset = (page - 1) * pageSize;
      const tickets = await db.query.ticket.findMany({
        where: whereClause,
        orderBy: sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn),
        limit: pageSize,
        offset,
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

      // Get total count for pagination
      const result = await db.select({ value: count() }).from(ticket).where(whereClause);

      const totalCount = result[0]?.value ?? 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return c.json({
        success: true,
        data: tickets,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HTTPException(500, {
        message: `Failed to fetch tickets: ${errorMessage}`,
      });
    }
  }
);

export default app;
