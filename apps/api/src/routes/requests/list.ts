import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { request } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { listRequestsQuerySchema } from '../../schemas/request';
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /
 * List requests with filtering and pagination
 * Protected: Requires authentication and internal team member status
 */
app.get(
  '/',
  requireAuth(),
  requireInternal(),
  zValidator('query', listRequestsQuerySchema),
  async (c) => {
    const query = c.req.valid('query');

    try {
      // Build where conditions
      const conditions = [];

      if (query.stage) {
        conditions.push(eq(request.stage, query.stage));
      }

      if (query.type) {
        conditions.push(eq(request.type, query.type));
      }

      if (query.priority) {
        conditions.push(eq(request.priority, query.priority));
      }

      if (query.assignedPmId) {
        conditions.push(eq(request.assignedPmId, query.assignedPmId));
      }

      if (query.clientId) {
        conditions.push(eq(request.clientId, query.clientId));
      }

      if (query.isConverted !== undefined) {
        conditions.push(eq(request.isConverted, query.isConverted === 'true'));
      }

      if (query.isCancelled !== undefined) {
        conditions.push(eq(request.isCancelled, query.isCancelled === 'true'));
      }

      if (query.search) {
        conditions.push(
          or(
            ilike(request.title, `%${query.search}%`),
            ilike(request.description, `%${query.search}%`),
            ilike(request.requestNumber, `%${query.search}%`)
          )
        );
      }

      // Build order by
      const orderColumn = {
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        priority: request.priority,
        stageEnteredAt: request.stageEnteredAt,
      }[query.sortBy || 'createdAt'];

      const orderDirection = query.sortOrder === 'asc' ? asc : desc;

      // Calculate offset
      const offset = (query.page - 1) * query.limit;

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(request)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = countResult[0]?.count ?? 0;

      // Get paginated results
      const requests = await db.query.request.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: orderDirection(orderColumn),
        limit: query.limit,
        offset,
        with: {
          requester: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          client: {
            columns: {
              id: true,
              name: true,
            },
          },
          assignedPm: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          estimator: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return c.json({
        success: true,
        data: requests,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
          hasMore: offset + requests.length < total,
        },
      });
    } catch (error) {
      console.error('Error listing requests:', error);
      throw new HTTPException(500, { message: 'Failed to list requests' });
    }
  }
);

/**
 * GET /stage-counts
 * Get count of requests per stage
 * Protected: Requires authentication and internal team member status
 */
app.get('/stage-counts', requireAuth(), requireInternal(), async (c) => {
  try {
    const counts = await db
      .select({
        stage: request.stage,
        count: sql<number>`count(*)::int`,
      })
      .from(request)
      .where(and(eq(request.isConverted, false), eq(request.isCancelled, false)))
      .groupBy(request.stage);

    // Create a map with all stages initialized to 0
    const stageCounts: Record<string, number> = {
      in_treatment: 0,
      on_hold: 0,
      estimation: 0,
      ready: 0,
    };

    // Fill in actual counts
    for (const row of counts) {
      stageCounts[row.stage] = row.count;
    }

    return c.json({
      success: true,
      data: stageCounts,
    });
  } catch (error) {
    console.error('Error getting stage counts:', error);
    throw new HTTPException(500, { message: 'Failed to get stage counts' });
  }
});

export default app;
