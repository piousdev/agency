import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { nanoid } from 'nanoid';
import { db } from '../../db';
import { project } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { createProjectSchema } from '../../schemas/project';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * POST /
 * Create a new project
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/',
  requireAuth(),
  requireInternal(),
  zValidator('json', createProjectSchema),
  async (c) => {
    const data = c.req.valid('json');

    try {
      const projectId = nanoid();

      await db
        .insert(project)
        .values({
          id: projectId,
          name: data.name,
          description: data.description || null,
          clientId: data.clientId,
          status: data.status,
          completionPercentage: data.completionPercentage,
          repositoryUrl: data.repositoryUrl || null,
          productionUrl: data.productionUrl || null,
          stagingUrl: data.stagingUrl || null,
          notes: data.notes || null,
          startedAt: data.startedAt ? new Date(data.startedAt) : null,
          deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : null,
        })
        .returning();

      // Fetch the project with relations
      const projectWithRelations = await db.query.project.findFirst({
        where: (p, { eq }) => eq(p.id, projectId),
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

      const transformedProject = {
        ...projectWithRelations,
        assignees: projectWithRelations?.projectAssignments.map((pa) => pa.user) || [],
        projectAssignments: undefined,
      };

      return c.json(
        {
          success: true,
          data: transformedProject,
          message: 'Project created successfully',
        },
        201
      );
    } catch (error) {
      console.error('Error creating project:', error);
      throw new HTTPException(500, {
        message: 'Failed to create project',
      });
    }
  }
);

export default app;
