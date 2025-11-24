import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, inArray } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { db } from '../../db';
import { notification } from '../../db/schema';
import { requireAuth, type AuthVariables } from '../../middleware/auth';
import {
  markNotificationReadSchema,
  markAllNotificationsReadSchema,
} from '../../schemas/notification';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /:id/read
 * Mark a single notification as read/unread
 * Protected: Requires authentication
 */
app.patch(
  '/:id/read',
  requireAuth(),
  zValidator('param', z.object({ id: z.string() })),
  zValidator('json', markNotificationReadSchema),
  async (c) => {
    const user = c.get('user')!;
    const { id } = c.req.valid('param');
    const { read } = c.req.valid('json');

    try {
      // First verify the notification belongs to this user
      const existingNotification = await db.query.notification.findFirst({
        where: and(eq(notification.id, id), eq(notification.recipientId, user.id)),
      });

      if (!existingNotification) {
        throw new HTTPException(404, {
          message: 'Notification not found',
        });
      }

      // Update the notification
      const [updated] = await db
        .update(notification)
        .set({
          read,
          updatedAt: new Date(),
        })
        .where(and(eq(notification.id, id), eq(notification.recipientId, user.id)))
        .returning();

      return c.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error('Error updating notification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HTTPException(500, {
        message: `Failed to update notification: ${errorMessage}`,
      });
    }
  }
);

/**
 * PATCH /read-all
 * Mark all notifications as read for the authenticated user
 * Optionally accepts an array of notification IDs to mark as read
 * Protected: Requires authentication
 */
app.patch(
  '/read-all',
  requireAuth(),
  zValidator('json', markAllNotificationsReadSchema),
  async (c) => {
    const user = c.get('user')!;
    const { notificationIds } = c.req.valid('json');

    try {
      let whereClause;

      if (notificationIds && notificationIds.length > 0) {
        // Mark specific notifications as read
        whereClause = and(
          eq(notification.recipientId, user.id),
          inArray(notification.id, notificationIds)
        );
      } else {
        // Mark all unread notifications as read
        whereClause = and(eq(notification.recipientId, user.id), eq(notification.read, false));
      }

      const updatedNotifications = await db
        .update(notification)
        .set({
          read: true,
          updatedAt: new Date(),
        })
        .where(whereClause)
        .returning();

      return c.json({
        success: true,
        updatedCount: updatedNotifications.length,
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HTTPException(500, {
        message: `Failed to mark notifications as read: ${errorMessage}`,
      });
    }
  }
);

/**
 * DELETE /:id
 * Delete a notification
 * Protected: Requires authentication
 */
app.delete('/:id', requireAuth(), zValidator('param', z.object({ id: z.string() })), async (c) => {
  const user = c.get('user')!;
  const { id } = c.req.valid('param');

  try {
    // First verify the notification belongs to this user
    const existingNotification = await db.query.notification.findFirst({
      where: and(eq(notification.id, id), eq(notification.recipientId, user.id)),
    });

    if (!existingNotification) {
      throw new HTTPException(404, {
        message: 'Notification not found',
      });
    }

    // Delete the notification
    await db
      .delete(notification)
      .where(and(eq(notification.id, id), eq(notification.recipientId, user.id)));

    return c.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error deleting notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new HTTPException(500, {
      message: `Failed to delete notification: ${errorMessage}`,
    });
  }
});

export default app;
