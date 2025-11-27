import { zValidator } from '@hono/zod-validator';
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { project, projectAssignment } from '../../db/schema';
import { type AuthVariables, requireAuth, requireInternal } from '../../middleware/auth';
import { listProjectsQuerySchema } from '../../schemas/project';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /
 * List all projects with pagination and filtering
 * Protected: Requires authentication and internal team member status
 */
app.get(
  '/',
  requireAuth(),
  requireInternal(),
  zValidator('query', listProjectsQuerySchema),
  async (c) => {
    const query = c.req.valid('query');
    const { page, pageSize, sortBy, sortOrder, status, clientId, assignedToId } = query;

    try {
      // Build WHERE clause
      const whereConditions = [];

      if (status !== undefined && status !== '') {
        whereConditions.push(eq(project.status, status));
      }
      if (clientId !== undefined && clientId !== '') {
        whereConditions.push(eq(project.clientId, clientId));
      }

      let whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Determine sort column
      const sortColumnMap: Record<
        string,
        | typeof project.name
        | typeof project.createdAt
        | typeof project.updatedAt
        | typeof project.deliveredAt
      > = {
        name: project.name,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        deliveredAt: project.deliveredAt,
      };

      const sortColumn = sortColumnMap[sortBy];

      if (assignedToId !== undefined && assignedToId !== '') {
        // Get project IDs assigned to this user
        const assignments = await db.query.projectAssignment.findMany({
          where: eq(projectAssignment.userId, assignedToId),
          columns: {
            projectId: true,
          },
        });

        const projectIds = assignments.map((a) => a.projectId);

        if (projectIds.length === 0) {
          // No projects assigned to this user
          return c.json({
            success: true,
            data: [],
            pagination: {
              page,
              pageSize,
              totalCount: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        }

        // Add project ID filter
        whereConditions.push(inArray(project.id, projectIds));
        whereClause = and(...whereConditions);
      }

      // Query projects with pagination
      const offset = (page - 1) * pageSize;
      const projects = await db.query.project.findMany({
        where: whereClause,
        orderBy: sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn),
        limit: pageSize,
        offset,
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

      // Get total count for pagination
      // Get total count for pagination
      const result = await db.select({ value: count() }).from(project).where(whereClause);

      const totalCount = result[0]?.value ?? 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      // Transform data to include assignees array
      const transformedProjects = projects.map((p) => ({
        ...p,
        assignees: p.projectAssignments.map((pa) => pa.user),
        projectAssignments: undefined, // Remove the nested structure
      }));

      return c.json({
        success: true,
        data: transformedProjects,
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
      console.error('Error fetching projects:', error);
      throw new HTTPException(500, {
        message: 'Failed to fetch projects',
      });
    }
  }
);

export default app;
