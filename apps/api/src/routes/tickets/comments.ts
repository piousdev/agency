import { zValidator } from '@hono/zod-validator';
import { eq, desc } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { db } from '../../db';
import { comment, ticket, ticketActivity } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  isInternal: z.boolean().default(false),
});

/**
 * GET /:id/comments
 * Get all comments for a ticket
 */
app.get('/:id/comments', requireAuth(), requireInternal(), async (c) => {
  const ticketId = c.req.param('id');

  try {
    const comments = await db.query.comment.findMany({
      where: eq(comment.ticketId, ticketId),
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
      orderBy: [desc(comment.createdAt)],
    });

    return c.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new HTTPException(500, {
      message: 'Failed to fetch comments',
    });
  }
});

/**
 * POST /:id/comments
 * Add a comment to a ticket
 */
app.post(
  '/:id/comments',
  requireAuth(),
  requireInternal(),
  zValidator('json', createCommentSchema),
  async (c) => {
    const ticketId = c.req.param('id');
    const { content, isInternal } = c.req.valid('json');
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Verify ticket exists
      const ticketData = await db.query.ticket.findFirst({
        where: eq(ticket.id, ticketId),
      });

      if (!ticketData) {
        throw new HTTPException(404, {
          message: 'Ticket not found',
        });
      }

      const commentId = nanoid();

      // Create comment and activity in transaction
      await db.transaction(async (tx) => {
        await tx.insert(comment).values({
          id: commentId,
          content,
          isInternal,
          ticketId,
          authorId: user.id,
        });

        // Record activity
        await tx.insert(ticketActivity).values({
          id: nanoid(),
          ticketId,
          actorId: user.id,
          type: 'comment_added',
          metadata: {
            commentId,
            description: isInternal ? 'Added internal note' : 'Added comment',
          },
        });
      });

      // Fetch the created comment with author
      const newComment = await db.query.comment.findFirst({
        where: eq(comment.id, commentId),
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
      });

      return c.json({
        success: true,
        data: newComment,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error('Error creating comment:', error);
      throw new HTTPException(500, {
        message: 'Failed to create comment',
      });
    }
  }
);

export default app;
