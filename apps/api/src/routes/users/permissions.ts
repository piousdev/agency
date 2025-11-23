import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { user, roleAssignment } from '../../db/schema';
import { requireAuth, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * Default permission sets for roles
 * These are used as fallback when roles don't have permissions seeded
 */
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'ticket:create',
    'ticket:edit',
    'ticket:delete',
    'ticket:assign',
    'ticket:view',
    'project:create',
    'project:edit',
    'project:delete',
    'project:assign',
    'project:view',
    'client:create',
    'client:edit',
    'client:delete',
    'client:view',
    'bulk:operations',
    'admin:users',
    'admin:roles',
  ],
  editor: [
    'ticket:create',
    'ticket:edit',
    'ticket:assign',
    'ticket:view',
    'project:create',
    'project:edit',
    'project:assign',
    'project:view',
    'client:create',
    'client:edit',
    'client:view',
    'bulk:operations',
  ],
  viewer: ['ticket:view', 'project:view', 'client:view'],
  client: ['ticket:create', 'ticket:view', 'project:view'],
};

/**
 * GET /:id/permissions
 * Get all permissions for a user based on their assigned roles
 * Protected: Requires authentication
 */
app.get('/:id/permissions', requireAuth(), async (c) => {
  const userId = c.req.param('id');
  const authenticatedUser = c.get('user');

  if (!authenticatedUser) {
    throw new HTTPException(401, {
      message: 'Authenticated user not found in context',
    });
  }

  // Users can only view their own permissions unless they're internal
  if (userId !== authenticatedUser.id && !authenticatedUser.isInternal) {
    throw new HTTPException(403, {
      message: 'Cannot view permissions of other users',
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

    // Get all role assignments for the user with their roles
    const assignments = await db.query.roleAssignment.findMany({
      where: eq(roleAssignment.userId, userId),
      with: {
        role: true,
      },
    });

    // Aggregate all permissions from assigned roles
    const permissionsSet = new Set<string>();

    for (const assignment of assignments) {
      const rolePermissions = assignment.role.permissions as Record<string, boolean> | null;

      if (rolePermissions && typeof rolePermissions === 'object') {
        // Add permissions that are set to true
        for (const [permission, enabled] of Object.entries(rolePermissions)) {
          if (enabled === true) {
            permissionsSet.add(permission);
          }
        }
      }

      // Fallback: if role has no permissions defined, use default based on role name
      if (!rolePermissions || Object.keys(rolePermissions).length === 0) {
        const roleName = assignment.role.name.toLowerCase();
        const defaultPerms = DEFAULT_ROLE_PERMISSIONS[roleName];
        if (defaultPerms) {
          defaultPerms.forEach((p) => permissionsSet.add(p));
        }
      }
    }

    // Fallback for internal users without any role assignments
    if (assignments.length === 0 && userRecord.isInternal) {
      // Internal users get editor permissions by default
      const editorPerms = DEFAULT_ROLE_PERMISSIONS.editor;
      if (editorPerms) {
        editorPerms.forEach((p) => permissionsSet.add(p));
      }
    }

    const permissions = Array.from(permissionsSet).sort();

    return c.json({
      success: true,
      data: {
        userId,
        permissions,
        roleCount: assignments.length,
        roles: assignments.map((a) => ({
          id: a.role.id,
          name: a.role.name,
        })),
      },
      // Also expose just the permissions array for simpler access
      permissions,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error fetching user permissions:', error);
    throw new HTTPException(500, {
      message: 'Failed to fetch user permissions',
    });
  }
});

export default app;
