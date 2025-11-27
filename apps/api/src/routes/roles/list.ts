import { zValidator } from '@hono/zod-validator';
import { eq, desc, asc, count } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { role } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { listRolesQuerySchema } from '../../schemas/role';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /
 * List all roles with pagination and filtering
 * Protected: Requires authentication and internal team member status
 */
app.get(
  '/',
  requireAuth(),
  requireInternal(),
  zValidator('query', listRolesQuerySchema),
  async (c) => {
    const query = c.req.valid('query');
    const { page, pageSize, sortBy, sortOrder, roleType } = query;

    try {
      // Build WHERE clause
      const whereClause = roleType !== 'all' ? eq(role.roleType, roleType) : undefined;

      // Determine sort column
      type ValidSortField = 'name' | 'roleType' | 'createdAt';
      const validSortFields: ValidSortField[] = ['name', 'roleType', 'createdAt'];
      const isValidSort = validSortFields.includes(sortBy as ValidSortField);
      const sortField: ValidSortField = isValidSort ? (sortBy as ValidSortField) : 'createdAt';

      const sortColumnMap = {
        name: role.name,
        roleType: role.roleType,
        createdAt: role.createdAt,
      } as const;
      const sortColumn = sortColumnMap[sortField];

      // Query roles with pagination
      const offset = (page - 1) * pageSize;
      const roles = await db.query.role.findMany({
        where: whereClause,
        orderBy: sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn),
        limit: pageSize,
        offset,
      });

      // Get total count for pagination
      const result = await db.select({ value: count() }).from(role).where(whereClause);

      const totalCount = result[0]?.value ?? 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return c.json({
        success: true,
        data: roles.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          permissions: r.permissions,
          roleType: r.roleType,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
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
      console.error('Error fetching roles:', error);
      throw new HTTPException(500, {
        message: 'Failed to fetch roles',
      });
    }
  }
);

export default app;
