import { randomBytes } from 'crypto';

import { zValidator } from '@hono/zod-validator';
import { eq, and } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { user, roleAssignment, role } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { assignRoleSchema } from '../../schemas/user';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * POST /:id/assign-role
 * Assign a role to a user
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/:id/assign-role',
  requireAuth(),
  requireInternal(),
  zValidator('json', assignRoleSchema),
  async (c) => {
    const userId = c.req.param('id');
    const body = c.req.valid('json');
    const authenticatedUser = c.get('user');

    if (!authenticatedUser) {
      throw new HTTPException(401, {
        message: 'Authenticated user not found in context',
      });
    }

    try {
      // Check if user exists
      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, userId),
      });

      if (!userRecord) {
        throw new HTTPException(404, {
          message: 'User not found',
        });
      }

      // Check if role exists
      const roleRecord = await db.query.role.findFirst({
        where: eq(role.id, body.roleId),
      });

      if (!roleRecord) {
        throw new HTTPException(404, {
          message: 'Role not found',
        });
      }

      // Check if role is already assigned
      const existingAssignment = await db.query.roleAssignment.findFirst({
        where: and(eq(roleAssignment.userId, userId), eq(roleAssignment.roleId, body.roleId)),
      });

      if (existingAssignment) {
        throw new HTTPException(409, {
          message: 'Role is already assigned to this user',
        });
      }

      // Create role assignment
      const assignmentId = `ra_${randomBytes(16).toString('hex')}`;
      const [newAssignment] = await db
        .insert(roleAssignment)
        .values({
          id: assignmentId,
          userId,
          roleId: body.roleId,
          assignedById: authenticatedUser.id,
        })
        .returning();

      if (!newAssignment) {
        throw new HTTPException(500, {
          message: 'Failed to assign role',
        });
      }

      return c.json(
        {
          success: true,
          message: 'Role assigned successfully',
          data: {
            id: newAssignment.id,
            userId: newAssignment.userId,
            roleId: newAssignment.roleId,
            assignedAt: newAssignment.assignedAt,
          },
        },
        201
      );
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error('Error assigning role:', error);
      throw new HTTPException(500, {
        message: 'Failed to assign role',
      });
    }
  }
);

/**
 * DELETE /:id/roles/:roleId
 * Remove a role from a user
 * Protected: Requires authentication and internal team member status
 */
app.delete('/:id/roles/:roleId', requireAuth(), requireInternal(), async (c) => {
  const userId = c.req.param('id');
  const roleId = c.req.param('roleId');

  try {
    // Check if role assignment exists
    const existingAssignment = await db.query.roleAssignment.findFirst({
      where: and(eq(roleAssignment.userId, userId), eq(roleAssignment.roleId, roleId)),
    });

    if (!existingAssignment) {
      throw new HTTPException(404, {
        message: 'Role assignment not found',
      });
    }

    // Delete the role assignment
    await db
      .delete(roleAssignment)
      .where(and(eq(roleAssignment.userId, userId), eq(roleAssignment.roleId, roleId)));

    return c.json({
      success: true,
      message: 'Role removed successfully',
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error removing role:', error);
    throw new HTTPException(500, {
      message: 'Failed to remove role',
    });
  }
});

export default app;
