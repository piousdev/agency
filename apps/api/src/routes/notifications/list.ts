import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, asc, and, count } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { notification } from '../../db/schema';
import { requireAuth, type AuthVariables } from '../../middleware/auth';
import { listNotificationsQuerySchema } from '../../schemas/notification';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /
 * List notifications for the authenticated user
 * Protected: Requires authentication
 */
app.get('/', requireAuth(), zValidator('query', listNotificationsQuerySchema), async (c) => {
  const user = c.get('user')!;
  const query = c.req.valid('query');
  const { page, pageSize, sortOrder, type, unreadOnly, entityType } = query;

  try {
    // Build WHERE clause
    const whereConditions = [eq(notification.recipientId, user.id)];

    if (type) {
      whereConditions.push(eq(notification.type, type));
    }
    if (unreadOnly) {
      whereConditions.push(eq(notification.read, false));
    }
    if (entityType) {
      whereConditions.push(eq(notification.entityType, entityType));
    }

    const whereClause = and(...whereConditions);

    // Query notifications with pagination
    const offset = (page - 1) * pageSize;
    const notifications = await db.query.notification.findMany({
      where: whereClause,
      orderBy: sortOrder === 'asc' ? asc(notification.createdAt) : desc(notification.createdAt),
      limit: pageSize,
      offset,
      with: {
        sender: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Get total count for pagination
    const result = await db.select({ value: count() }).from(notification).where(whereClause);

    const totalCount = result[0]?.value ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get unread count
    const unreadResult = await db
      .select({ value: count() })
      .from(notification)
      .where(and(eq(notification.recipientId, user.id), eq(notification.read, false)));

    const unreadCount = unreadResult[0]?.value ?? 0;

    return c.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new HTTPException(500, {
      message: `Failed to fetch notifications: ${errorMessage}`,
    });
  }
});

/**
 * GET /unread-count
 * Get the count of unread notifications for the authenticated user
 * Protected: Requires authentication
 */
app.get('/unread-count', requireAuth(), async (c) => {
  const user = c.get('user')!;

  try {
    const result = await db
      .select({ value: count() })
      .from(notification)
      .where(and(eq(notification.recipientId, user.id), eq(notification.read, false)));

    const unreadCount = result[0]?.value ?? 0;

    return c.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new HTTPException(500, {
      message: `Failed to fetch unread count: ${errorMessage}`,
    });
  }
});

export default app;
