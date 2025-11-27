import { desc, eq, and } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';

import { db } from '../../db';
import { activity, file, project } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /:id/files
 * Get all files/attachments for a project
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id/files', requireAuth(), requireInternal(), async (c) => {
  const projectId = c.req.param('id');

  try {
    // Verify project exists
    const projectData = await db.query.project.findFirst({
      where: eq(project.id, projectId),
    });

    if (!projectData) {
      throw new HTTPException(404, { message: 'Project not found' });
    }

    const files = await db.query.file.findMany({
      where: eq(file.projectId, projectId),
      with: {
        uploadedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [desc(file.createdAt)],
    });

    return c.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error('Error fetching project files:', error);
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Failed to fetch files' });
  }
});

/**
 * DELETE /:id/files/:fileId
 * Delete a file (only uploader can delete)
 * Protected: Requires authentication and internal team member status
 */
app.delete('/:id/files/:fileId', requireAuth(), requireInternal(), async (c) => {
  const projectId = c.req.param('id');
  const fileId = c.req.param('fileId');
  const user = c.get('user');
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  try {
    // Verify file exists and belongs to this project
    const existingFile = await db.query.file.findFirst({
      where: and(eq(file.id, fileId), eq(file.projectId, projectId)),
    });

    if (!existingFile) {
      throw new HTTPException(404, { message: 'File not found' });
    }

    // Only uploader can delete the file
    if (existingFile.uploadedById !== user.id) {
      throw new HTTPException(403, { message: 'You can only delete your own files' });
    }

    // Delete file and log activity in transaction
    await db.transaction(async (tx) => {
      await tx.delete(file).where(eq(file.id, fileId));

      await tx.insert(activity).values({
        id: nanoid(),
        projectId,
        actorId: user.id,
        type: 'file_deleted',
        metadata: { fileName: existingFile.name, fileId },
      });
    });

    // TODO: Also delete from R2 storage

    return c.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Failed to delete file' });
  }
});

export default app;
