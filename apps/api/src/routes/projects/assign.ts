import { zValidator } from '@hono/zod-validator';
import { eq, and, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';

import { db } from '../../db';
import { project, projectAssignment, user } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { assignProjectSchema, removeProjectAssignmentSchema } from '../../schemas/project';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /:id/assign
 * Assign team members to a project
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id/assign',
  requireAuth(),
  requireInternal(),
  zValidator('json', assignProjectSchema),
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

      // Verify all users exist
      const users = await db.query.user.findMany({
        where: inArray(user.id, body.userIds),
      });

      if (users.length !== body.userIds.length) {
        throw new HTTPException(404, {
          message: 'One or more users not found',
        });
      }

      // Get existing assignments
      const existingAssignments = await db.query.projectAssignment.findMany({
        where: eq(projectAssignment.projectId, projectId),
      });

      const existingUserIds = existingAssignments.map((a) => a.userId);

      // Determine which assignments to add (new users not already assigned)
      const usersToAdd = body.userIds.filter((userId) => !existingUserIds.includes(userId));

      // Create new assignments
      if (usersToAdd.length > 0) {
        await db.insert(projectAssignment).values(
          usersToAdd.map((userId) => ({
            id: nanoid(),
            projectId,
            userId,
          }))
        );
      }

      // Fetch updated project with assignments
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
                  isInternal: true,
                  capacityPercentage: true,
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
        message: 'Team members assigned successfully',
      });
    } catch (error) {
      console.error('Error assigning project:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to assign team members to project',
      });
    }
  }
);

/**
 * DELETE /:id/assign
 * Remove a team member from a project
 * Protected: Requires authentication and internal team member status
 */
app.delete(
  '/:id/assign',
  requireAuth(),
  requireInternal(),
  zValidator('json', removeProjectAssignmentSchema),
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

      // Delete the assignment
      await db
        .delete(projectAssignment)
        .where(
          and(eq(projectAssignment.projectId, projectId), eq(projectAssignment.userId, body.userId))
        );

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
                  isInternal: true,
                  capacityPercentage: true,
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
        message: 'Team member removed successfully',
      });
    } catch (error) {
      console.error('Error removing assignment:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to remove team member from project',
      });
    }
  }
);

export default app;
