import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { user } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /:id
 * Get a single user by ID with their roles
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id', requireAuth(), requireInternal(), async (c) => {
  const userId = c.req.param('id');

  try {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
      with: {
        roleAssignments: {
          with: {
            role: true,
            assignedBy: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!userRecord) {
      throw new HTTPException(404, {
        message: 'User not found',
      });
    }

    return c.json({
      success: true,
      data: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        image: userRecord.image,
        role: userRecord.role,
        isInternal: userRecord.isInternal,
        expiresAt: userRecord.expiresAt,
        createdAt: userRecord.createdAt,
        updatedAt: userRecord.updatedAt,
        roles: userRecord.roleAssignments.map((ra) => ({
          id: ra.role.id,
          name: ra.role.name,
          description: ra.role.description,
          roleType: ra.role.roleType,
          permissions: ra.role.permissions,
          assignedAt: ra.assignedAt,
          assignedBy: ra.assignedBy
            ? {
                id: ra.assignedBy.id,
                name: ra.assignedBy.name,
                email: ra.assignedBy.email,
              }
            : null,
        })),
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error fetching user:', error);
    throw new HTTPException(500, {
      message: 'Failed to fetch user',
    });
  }
});

export default app;
