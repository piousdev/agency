import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { project } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { updateProjectSchema } from '../../schemas/project';
import { logEntityChange, EntityTypes } from '../../utils/activity';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /:id
 * Update an existing project
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateProjectSchema),
  async (c) => {
    const projectId = c.req.param('id');
    const data = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Check if project exists
      const existingProject = await db.query.project.findFirst({
        where: eq(project.id, projectId),
      });

      if (!existingProject) {
        throw new HTTPException(404, {
          message: 'Project not found',
        });
      }

      // Build update object with only provided fields
      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.clientId !== undefined) updateData.clientId = data.clientId;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.completionPercentage !== undefined)
        updateData.completionPercentage = data.completionPercentage;
      if (data.repositoryUrl !== undefined) updateData.repositoryUrl = data.repositoryUrl !== '' ? data.repositoryUrl : null;
      if (data.productionUrl !== undefined) updateData.productionUrl = data.productionUrl !== '' ? data.productionUrl : null;
      if (data.stagingUrl !== undefined) updateData.stagingUrl = data.stagingUrl !== '' ? data.stagingUrl : null;
      if (data.notes !== undefined) updateData.notes = data.notes !== '' ? data.notes : null;
      if (data.startedAt !== undefined)
        updateData.startedAt = data.startedAt !== '' ? new Date(data.startedAt) : null;
      if (data.deliveredAt !== undefined)
        updateData.deliveredAt = data.deliveredAt !== '' ? new Date(data.deliveredAt) : null;

      // Update the project
      await db.update(project).set(updateData).where(eq(project.id, projectId));

      // Fetch the updated project with relations
      const projectWithRelations = await db.query.project.findFirst({
        where: eq(project.id, projectId),
        with: {
          client: true,
          projectAssignments: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      const transformedProject = {
        ...projectWithRelations,
        assignees: projectWithRelations?.projectAssignments.map((pa) => pa.user) ?? [],
        projectAssignments: undefined,
      };

      // Log activity for project update
      if (projectWithRelations) {
        await logEntityChange(
          {
            entityType: EntityTypes.PROJECT,
            entityId: projectId,
            actorId: currentUser.id,
            projectId: projectId,
          },
          existingProject,
          projectWithRelations
        );
      }

      return c.json({
        success: true,
        data: transformedProject,
        message: 'Project updated successfully',
      });
    } catch (error) {
      console.error('Error updating project:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to update project',
      });
    }
  }
);

export default app;
