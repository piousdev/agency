import { zValidator } from '@hono/zod-validator';
import { desc, eq, and } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { db } from '../../db';
import { activity, comment, project } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

// Validation schemas
const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  isInternal: z.boolean().default(false),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(10000),
});

/**
 * GET /:id/comments
 * Get all comments for a project
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id/comments', requireAuth(), requireInternal(), async (c) => {
  const projectId = c.req.param('id');

  try {
    // Verify project exists
    const projectData = await db.query.project.findFirst({
      where: eq(project.id, projectId),
    });

    if (!projectData) {
      throw new HTTPException(404, { message: 'Project not found' });
    }

    const comments = await db.query.comment.findMany({
      where: eq(comment.projectId, projectId),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        files: true,
      },
      orderBy: [desc(comment.createdAt)],
    });

    return c.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error fetching project comments:', error);
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Failed to fetch comments' });
  }
});

/**
 * POST /:id/comments
 * Create a new comment on a project
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/:id/comments',
  requireAuth(),
  requireInternal(),
  zValidator('json', createCommentSchema),
  async (c) => {
    const projectId = c.req.param('id');
    const user = c.get('user');
    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }
    const body = c.req.valid('json');

    try {
      // Verify project exists
      const projectData = await db.query.project.findFirst({
        where: eq(project.id, projectId),
      });

      if (!projectData) {
        throw new HTTPException(404, { message: 'Project not found' });
      }

      const commentId = nanoid();

      // Create comment and activity in transaction
      await db.transaction(async (tx) => {
        await tx.insert(comment).values({
          id: commentId,
          projectId,
          authorId: user.id,
          content: body.content,
          isInternal: body.isInternal,
        });

        // Log activity
        await tx.insert(activity).values({
          id: nanoid(),
          projectId,
          actorId: user.id,
          type: 'comment_added',
          metadata: { commentId, isInternal: body.isInternal },
        });
      });

      // Fetch created comment with author
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

      return c.json(
        {
          success: true,
          data: newComment,
          message: 'Comment created successfully',
        },
        201
      );
    } catch (error) {
      console.error('Error creating comment:', error);
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, { message: 'Failed to create comment' });
    }
  }
);

/**
 * PATCH /:id/comments/:commentId
 * Update a comment (only author can update)
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id/comments/:commentId',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateCommentSchema),
  async (c) => {
    const projectId = c.req.param('id');
    const commentId = c.req.param('commentId');
    const user = c.get('user');
    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }
    const body = c.req.valid('json');

    try {
      // Verify comment exists and belongs to this project
      const existingComment = await db.query.comment.findFirst({
        where: and(eq(comment.id, commentId), eq(comment.projectId, projectId)),
      });

      if (!existingComment) {
        throw new HTTPException(404, { message: 'Comment not found' });
      }

      // Only author can update their comment
      if (existingComment.authorId !== user.id) {
        throw new HTTPException(403, { message: 'You can only edit your own comments' });
      }

      await db.update(comment).set({ content: body.content }).where(eq(comment.id, commentId));

      const updatedComment = await db.query.comment.findFirst({
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
        data: updatedComment,
        message: 'Comment updated successfully',
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, { message: 'Failed to update comment' });
    }
  }
);

/**
 * DELETE /:id/comments/:commentId
 * Delete a comment (only author can delete)
 * Protected: Requires authentication and internal team member status
 */
app.delete('/:id/comments/:commentId', requireAuth(), requireInternal(), async (c) => {
  const projectId = c.req.param('id');
  const commentId = c.req.param('commentId');
  const user = c.get('user');
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  try {
    // Verify comment exists and belongs to this project
    const existingComment = await db.query.comment.findFirst({
      where: and(eq(comment.id, commentId), eq(comment.projectId, projectId)),
    });

    if (!existingComment) {
      throw new HTTPException(404, { message: 'Comment not found' });
    }

    // Only author can delete their comment
    if (existingComment.authorId !== user.id) {
      throw new HTTPException(403, { message: 'You can only delete your own comments' });
    }

    await db.delete(comment).where(eq(comment.id, commentId));

    return c.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Failed to delete comment' });
  }
});

export default app;
