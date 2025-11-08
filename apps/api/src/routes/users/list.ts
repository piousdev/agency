import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, asc, and, or, like, count } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { user } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { listUsersQuerySchema } from '../../schemas/user';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /
 * List all users with pagination, filtering, and search
 * Protected: Requires authentication and internal team member status
 */
app.get(
  '/',
  requireAuth(),
  requireInternal(),
  zValidator('query', listUsersQuerySchema),
  async (c) => {
    const query = c.req.valid('query');
    const { page, pageSize, sortBy, sortOrder, search, isInternal } = query;

    try {
      // Build WHERE clause
      const whereConditions = [];

      // Filter by internal status
      if (isInternal === 'true') {
        whereConditions.push(eq(user.isInternal, true));
      } else if (isInternal === 'false') {
        whereConditions.push(eq(user.isInternal, false));
      }

      // Search by name or email
      if (search && search.length > 0) {
        whereConditions.push(or(like(user.name, `%${search}%`), like(user.email, `%${search}%`)));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Determine sort column
      const sortColumn = {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }[sortBy];

      // Query users with pagination
      const offset = (page - 1) * pageSize;
      const users = await db.query.user.findMany({
        where: whereClause,
        orderBy: sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn),
        limit: pageSize,
        offset,
        with: {
          roleAssignments: {
            with: {
              role: true,
            },
          },
        },
      });

      // Get total count for pagination
      const result = await db.select({ value: count() }).from(user).where(whereClause);

      const totalCount = result[0]?.value ?? 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return c.json({
        success: true,
        data: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          emailVerified: u.emailVerified,
          image: u.image,
          role: u.role,
          isInternal: u.isInternal,
          expiresAt: u.expiresAt,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          roles: u.roleAssignments.map((ra) => ({
            id: ra.role.id,
            name: ra.role.name,
            description: ra.role.description,
            roleType: ra.role.roleType,
            assignedAt: ra.assignedAt,
          })),
        })),
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new HTTPException(500, {
        message: 'Failed to fetch users',
      });
    }
  }
);

export default app;
