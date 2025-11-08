import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { role } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /:id
 * Get a single role by ID
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id', requireAuth(), requireInternal(), async (c) => {
  const roleId = c.req.param('id');

  try {
    const roleRecord = await db.query.role.findFirst({
      where: eq(role.id, roleId),
    });

    if (!roleRecord) {
      throw new HTTPException(404, {
        message: 'Role not found',
      });
    }

    return c.json({
      success: true,
      data: {
        id: roleRecord.id,
        name: roleRecord.name,
        description: roleRecord.description,
        permissions: roleRecord.permissions,
        roleType: roleRecord.roleType,
        createdAt: roleRecord.createdAt,
        updatedAt: roleRecord.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error fetching role:', error);
    throw new HTTPException(500, {
      message: 'Failed to fetch role',
    });
  }
});

export default app;
