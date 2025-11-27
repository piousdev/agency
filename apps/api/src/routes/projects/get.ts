import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { project } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /:id
 * Get a single project by ID with all details
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id', requireAuth(), requireInternal(), async (c) => {
  const projectId = c.req.param('id');

  try {
    const projectData = await db.query.project.findFirst({
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
        tickets: {
          with: {
            assignedTo: {
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

    if (!projectData) {
      throw new HTTPException(404, {
        message: 'Project not found',
      });
    }

    // Transform data
    const transformedProject = {
      ...projectData,
      assignees: projectData.projectAssignments.map((pa) => pa.user),
      projectAssignments: undefined,
    };

    return c.json({
      success: true,
      data: transformedProject,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, {
      message: 'Failed to fetch project',
    });
  }
});

export default app;
