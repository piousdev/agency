import { eq, desc } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { user } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /team
 * List all internal team members with capacity and project count
 * Protected: Requires authentication and internal team member status
 */
app.get('/team', requireAuth(), requireInternal(), async (c) => {
  try {
    // Get all internal users
    const teamMembers = await db.query.user.findMany({
      where: eq(user.isInternal, true),
      orderBy: desc(user.createdAt),
      with: {
        projectAssignments: {
          with: {
            project: {
              columns: {
                id: true,
                name: true,
                status: true,
                clientId: true,
              },
              with: {
                client: {
                  columns: {
                    id: true,
                    name: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transform data to include capacity status and project count
    const transformedTeamMembers = teamMembers.map((member) => {
      const capacity = member.capacityPercentage;
      let status: 'available' | 'at_capacity' | 'overloaded';

      if (capacity < 80) {
        status = 'available';
      } else if (capacity < 100) {
        status = 'at_capacity';
      } else {
        status = 'overloaded';
      }

      // Filter to only active projects
      const activeProjects = member.projectAssignments
        .filter((pa) => pa.project.status === 'in_development' || pa.project.status === 'in_review')
        .map((pa) => ({
          id: pa.project.id,
          name: pa.project.name,
          status: pa.project.status,
          client: pa.project.client,
        }));

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        image: member.image,
        capacityPercentage: capacity,
        availableCapacity: Math.max(0, 100 - capacity),
        status,
        projectCount: activeProjects.length,
        projects: activeProjects,
      };
    });

    return c.json({
      success: true,
      data: transformedTeamMembers,
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw new HTTPException(500, {
      message: 'Failed to fetch team members',
    });
  }
});

export default app;
