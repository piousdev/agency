import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { eq, and, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { label, projectLabel, ticketLabel, project, ticket } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { logActivity, ActivityTypes, EntityTypes } from '../../utils/activity';

const assignLabelsSchema = z.object({
  labelIds: z.array(z.string()).min(1),
});

const removeLabelsSchema = z.object({
  labelIds: z.array(z.string()).min(1),
});

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * POST /tickets/:ticketId/assign
 * Assign labels to a ticket
 */
app.post(
  '/tickets/:ticketId/assign',
  requireAuth(),
  requireInternal(),
  zValidator('json', assignLabelsSchema),
  async (c) => {
    const ticketId = c.req.param('ticketId');
    const { labelIds } = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Verify ticket exists
      const ticketExists = await db.query.ticket.findFirst({
        where: eq(ticket.id, ticketId),
      });

      if (!ticketExists) {
        throw new HTTPException(404, { message: 'Ticket not found' });
      }

      // Verify all labels exist
      const labels = await db.query.label.findMany({
        where: inArray(label.id, labelIds),
      });

      if (labels.length !== labelIds.length) {
        throw new HTTPException(400, { message: 'Some labels do not exist' });
      }

      // Get existing label assignments to avoid duplicates
      const existingAssignments = await db.query.ticketLabel.findMany({
        where: eq(ticketLabel.ticketId, ticketId),
      });
      const existingLabelIds = new Set(existingAssignments.map((a) => a.labelId));

      // Filter out already assigned labels
      const newLabelIds = labelIds.filter((id) => !existingLabelIds.has(id));

      if (newLabelIds.length > 0) {
        await db.insert(ticketLabel).values(
          newLabelIds.map((labelId) => ({
            ticketId,
            labelId,
          }))
        );

        // Log activity
        await logActivity({
          type: ActivityTypes.UPDATED,
          entityType: EntityTypes.TICKET,
          entityId: ticketId,
          actorId: currentUser.id,
          metadata: {
            action: 'labels_added',
            labelIds: newLabelIds,
            labelNames: labels.filter((l) => newLabelIds.includes(l.id)).map((l) => l.name),
          },
        });
      }

      return c.json({
        success: true,
        message: 'Labels assigned successfully',
        assignedCount: newLabelIds.length,
      });
    } catch (error) {
      console.error('Error assigning labels to ticket:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to assign labels',
      });
    }
  }
);

/**
 * POST /tickets/:ticketId/remove
 * Remove labels from a ticket
 */
app.post(
  '/tickets/:ticketId/remove',
  requireAuth(),
  requireInternal(),
  zValidator('json', removeLabelsSchema),
  async (c) => {
    const ticketId = c.req.param('ticketId');
    const { labelIds } = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Get label names before removing
      const labels = await db.query.label.findMany({
        where: inArray(label.id, labelIds),
      });

      // Remove the labels
      await db
        .delete(ticketLabel)
        .where(and(eq(ticketLabel.ticketId, ticketId), inArray(ticketLabel.labelId, labelIds)));

      // Log activity
      await logActivity({
        type: ActivityTypes.UPDATED,
        entityType: EntityTypes.TICKET,
        entityId: ticketId,
        actorId: currentUser.id,
        metadata: {
          action: 'labels_removed',
          labelIds,
          labelNames: labels.map((l) => l.name),
        },
      });

      return c.json({
        success: true,
        message: 'Labels removed successfully',
      });
    } catch (error) {
      console.error('Error removing labels from ticket:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to remove labels',
      });
    }
  }
);

/**
 * POST /projects/:projectId/assign
 * Assign labels to a project
 */
app.post(
  '/projects/:projectId/assign',
  requireAuth(),
  requireInternal(),
  zValidator('json', assignLabelsSchema),
  async (c) => {
    const projectId = c.req.param('projectId');
    const { labelIds } = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Verify project exists
      const projectExists = await db.query.project.findFirst({
        where: eq(project.id, projectId),
      });

      if (!projectExists) {
        throw new HTTPException(404, { message: 'Project not found' });
      }

      // Verify all labels exist
      const labels = await db.query.label.findMany({
        where: inArray(label.id, labelIds),
      });

      if (labels.length !== labelIds.length) {
        throw new HTTPException(400, { message: 'Some labels do not exist' });
      }

      // Get existing label assignments to avoid duplicates
      const existingAssignments = await db.query.projectLabel.findMany({
        where: eq(projectLabel.projectId, projectId),
      });
      const existingLabelIds = new Set(existingAssignments.map((a) => a.labelId));

      // Filter out already assigned labels
      const newLabelIds = labelIds.filter((id) => !existingLabelIds.has(id));

      if (newLabelIds.length > 0) {
        await db.insert(projectLabel).values(
          newLabelIds.map((labelId) => ({
            projectId,
            labelId,
          }))
        );

        // Log activity
        await logActivity({
          type: ActivityTypes.UPDATED,
          entityType: EntityTypes.PROJECT,
          entityId: projectId,
          actorId: currentUser.id,
          projectId,
          metadata: {
            action: 'labels_added',
            labelIds: newLabelIds,
            labelNames: labels.filter((l) => newLabelIds.includes(l.id)).map((l) => l.name),
          },
        });
      }

      return c.json({
        success: true,
        message: 'Labels assigned successfully',
        assignedCount: newLabelIds.length,
      });
    } catch (error) {
      console.error('Error assigning labels to project:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to assign labels',
      });
    }
  }
);

/**
 * POST /projects/:projectId/remove
 * Remove labels from a project
 */
app.post(
  '/projects/:projectId/remove',
  requireAuth(),
  requireInternal(),
  zValidator('json', removeLabelsSchema),
  async (c) => {
    const projectId = c.req.param('projectId');
    const { labelIds } = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
      // Get label names before removing
      const labels = await db.query.label.findMany({
        where: inArray(label.id, labelIds),
      });

      // Remove the labels
      await db
        .delete(projectLabel)
        .where(and(eq(projectLabel.projectId, projectId), inArray(projectLabel.labelId, labelIds)));

      // Log activity
      await logActivity({
        type: ActivityTypes.UPDATED,
        entityType: EntityTypes.PROJECT,
        entityId: projectId,
        actorId: currentUser.id,
        projectId,
        metadata: {
          action: 'labels_removed',
          labelIds,
          labelNames: labels.map((l) => l.name),
        },
      });

      return c.json({
        success: true,
        message: 'Labels removed successfully',
      });
    } catch (error) {
      console.error('Error removing labels from project:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to remove labels',
      });
    }
  }
);

/**
 * GET /tickets/:ticketId
 * Get labels for a ticket
 */
app.get('/tickets/:ticketId', requireAuth(), requireInternal(), async (c) => {
  const ticketId = c.req.param('ticketId');

  try {
    const assignments = await db.query.ticketLabel.findMany({
      where: eq(ticketLabel.ticketId, ticketId),
      with: {
        label: true,
      },
    });

    return c.json({
      success: true,
      data: assignments.map((a) => a.label),
    });
  } catch (error) {
    console.error('Error getting ticket labels:', error);
    throw new HTTPException(500, {
      message: 'Failed to get ticket labels',
    });
  }
});

/**
 * GET /projects/:projectId
 * Get labels for a project
 */
app.get('/projects/:projectId', requireAuth(), requireInternal(), async (c) => {
  const projectId = c.req.param('projectId');

  try {
    const assignments = await db.query.projectLabel.findMany({
      where: eq(projectLabel.projectId, projectId),
      with: {
        label: true,
      },
    });

    return c.json({
      success: true,
      data: assignments.map((a) => a.label),
    });
  } catch (error) {
    console.error('Error getting project labels:', error);
    throw new HTTPException(500, {
      message: 'Failed to get project labels',
    });
  }
});

export default app;
