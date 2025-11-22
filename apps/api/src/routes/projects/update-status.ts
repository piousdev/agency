import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { project } from '../../db/schema';
import { type AuthVariables, requireAuth, requireInternal } from '../../middleware/auth';
import {
  updateProjectCompletionSchema,
  updateProjectDeliverySchema,
  updateProjectStatusSchema,
} from '../../schemas/project';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /:id/status
 * Update project status
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id/status',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateProjectStatusSchema),
  async (c) => {
    const projectId = c.req.param('id');
    const body = c.req.valid('json');

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

      // Update project status
      await db
        .update(project)
        .set({
          status: body.status,
          updatedAt: new Date(),
        })
        .where(eq(project.id, projectId));

      // Fetch updated project
      const updatedProject = await db.query.project.findFirst({
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

      return c.json({
        success: true,
        data: {
          ...updatedProject,
          assignees: updatedProject?.projectAssignments.map((pa) => pa.user),
          projectAssignments: undefined,
        },
        message: 'Project status updated successfully',
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to update project status',
      });
    }
  }
);

/**
 * PATCH /:id/completion
 * Update project completion percentage
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id/completion',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateProjectCompletionSchema),
  async (c) => {
    const projectId = c.req.param('id');
    const body = c.req.valid('json');

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

      // Update completion percentage
      await db
        .update(project)
        .set({
          completionPercentage: body.completionPercentage,
          updatedAt: new Date(),
        })
        .where(eq(project.id, projectId));

      // Fetch updated project
      const updatedProject = await db.query.project.findFirst({
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

      return c.json({
        success: true,
        data: {
          ...updatedProject,
          assignees: updatedProject?.projectAssignments.map((pa) => pa.user),
          projectAssignments: undefined,
        },
        message: 'Project completion updated successfully',
      });
    } catch (error) {
      console.error('Error updating project completion:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to update project completion',
      });
    }
  }
);

/**
 * PATCH /:id/delivery
 * Update project delivery date
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id/delivery',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateProjectDeliverySchema),
  async (c) => {
    const projectId = c.req.param('id');
    const body = c.req.valid('json');

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

      // Update delivery date
      await db
        .update(project)
        .set({
          deliveredAt: body.deliveredAt ? new Date(body.deliveredAt) : null,
          updatedAt: new Date(),
        })
        .where(eq(project.id, projectId));

      // Fetch updated project
      const updatedProject = await db.query.project.findFirst({
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

      return c.json({
        success: true,
        data: {
          ...updatedProject,
          assignees: updatedProject?.projectAssignments.map((pa) => pa.user),
          projectAssignments: undefined,
        },
        message: 'Project delivery date updated successfully',
      });
    } catch (error) {
      console.error('Error updating project delivery date:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to update project delivery date',
      });
    }
  }
);

export default app;
