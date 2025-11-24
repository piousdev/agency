import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';
import { db } from '../../db';
import { request, requestHistory } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { bulkTransitionSchema, bulkAssignSchema } from '../../schemas/request';
import { inArray } from 'drizzle-orm';

const app = new Hono<{ Variables: AuthVariables }>();

// Valid stage transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  in_treatment: ['on_hold', 'estimation'],
  on_hold: ['in_treatment', 'estimation'],
  estimation: ['in_treatment', 'on_hold', 'ready'],
  ready: ['in_treatment', 'on_hold', 'estimation'],
};

interface BulkOperationResult {
  successIds: string[];
  failedIds: { id: string; error: string }[];
}

/**
 * POST /bulk/transition
 * Bulk transition requests to a different stage
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/bulk/transition',
  requireAuth(),
  requireInternal(),
  zValidator('json', bulkTransitionSchema),
  async (c) => {
    const { requestIds, toStage, reason } = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    // Require reason for on_hold transition
    if (toStage === 'on_hold' && !reason) {
      throw new HTTPException(400, {
        message: 'Reason is required when moving to on_hold stage',
      });
    }

    const result: BulkOperationResult = {
      successIds: [],
      failedIds: [],
    };

    try {
      // Fetch all requests at once
      const requests = await db.query.request.findMany({
        where: inArray(request.id, requestIds),
      });

      // Create a map for quick lookup
      const requestMap = new Map(requests.map((r) => [r.id, r]));

      const now = new Date();
      const historyEntries: Array<{
        id: string;
        requestId: string;
        actorId: string;
        action: 'stage_changed' | 'put_on_hold';
        metadata: Record<string, unknown>;
      }> = [];

      // Process each request
      for (const requestId of requestIds) {
        const existingRequest = requestMap.get(requestId);

        if (!existingRequest) {
          result.failedIds.push({ id: requestId, error: 'Request not found' });
          continue;
        }

        if (existingRequest.isConverted) {
          result.failedIds.push({
            id: requestId,
            error: 'Cannot transition a converted request',
          });
          continue;
        }

        if (existingRequest.isCancelled) {
          result.failedIds.push({
            id: requestId,
            error: 'Cannot transition a cancelled request',
          });
          continue;
        }

        const fromStage = existingRequest.stage;

        // Validate transition
        const validTargets = VALID_TRANSITIONS[fromStage];
        if (!validTargets?.includes(toStage)) {
          result.failedIds.push({
            id: requestId,
            error: `Invalid transition from ${fromStage} to ${toStage}`,
          });
          continue;
        }

        // If already in target stage, skip but count as success
        if (fromStage === toStage) {
          result.successIds.push(requestId);
          continue;
        }

        result.successIds.push(requestId);

        // Prepare history entry
        historyEntries.push({
          id: nanoid(),
          requestId,
          actorId: currentUser.id,
          action: toStage === 'on_hold' ? 'put_on_hold' : 'stage_changed',
          metadata: {
            oldStage: fromStage,
            newStage: toStage,
            holdReason: toStage === 'on_hold' ? reason : undefined,
            description: `Stage changed from ${fromStage} to ${toStage}`,
            bulkOperation: true,
          },
        });
      }

      // Perform bulk update for successful requests
      if (result.successIds.length > 0) {
        await db
          .update(request)
          .set({
            stage: toStage,
            stageEnteredAt: now,
            holdReason: toStage === 'on_hold' ? reason : null,
            holdStartedAt: toStage === 'on_hold' ? now : null,
            updatedAt: now,
          })
          .where(inArray(request.id, result.successIds));

        // Insert history entries
        if (historyEntries.length > 0) {
          await db.insert(requestHistory).values(historyEntries);
        }
      }

      return c.json({
        success: true,
        data: result,
        message: `Transitioned ${result.successIds.length} requests to ${toStage}${
          result.failedIds.length > 0 ? `, ${result.failedIds.length} failed` : ''
        }`,
      });
    } catch (error) {
      console.error('Error in bulk transition:', error);
      throw new HTTPException(500, { message: 'Failed to perform bulk transition' });
    }
  }
);

/**
 * POST /bulk/assign
 * Bulk assign PM to requests
 * Protected: Requires authentication and internal team member status
 */
app.post(
  '/bulk/assign',
  requireAuth(),
  requireInternal(),
  zValidator('json', bulkAssignSchema),
  async (c) => {
    const { requestIds, assignedPmId } = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    const result: BulkOperationResult = {
      successIds: [],
      failedIds: [],
    };

    try {
      // Fetch all requests at once
      const requests = await db.query.request.findMany({
        where: inArray(request.id, requestIds),
      });

      // Create a map for quick lookup
      const requestMap = new Map(requests.map((r) => [r.id, r]));

      const now = new Date();
      const historyEntries: Array<{
        id: string;
        requestId: string;
        actorId: string;
        action: 'assigned_pm';
        metadata: Record<string, unknown>;
      }> = [];

      // Validate each request
      for (const requestId of requestIds) {
        const existingRequest = requestMap.get(requestId);

        if (!existingRequest) {
          result.failedIds.push({ id: requestId, error: 'Request not found' });
          continue;
        }

        if (existingRequest.isConverted) {
          result.failedIds.push({
            id: requestId,
            error: 'Cannot assign PM to a converted request',
          });
          continue;
        }

        if (existingRequest.isCancelled) {
          result.failedIds.push({
            id: requestId,
            error: 'Cannot assign PM to a cancelled request',
          });
          continue;
        }

        result.successIds.push(requestId);

        // Only create history entry if PM is actually changing
        if (existingRequest.assignedPmId !== assignedPmId) {
          historyEntries.push({
            id: nanoid(),
            requestId,
            actorId: currentUser.id,
            action: 'assigned_pm',
            metadata: {
              oldPmId: existingRequest.assignedPmId,
              newPmId: assignedPmId,
              description: 'PM assigned via bulk operation',
              bulkOperation: true,
            },
          });
        }
      }

      // Perform bulk update for successful requests
      if (result.successIds.length > 0) {
        await db
          .update(request)
          .set({
            assignedPmId,
            updatedAt: now,
          })
          .where(inArray(request.id, result.successIds));

        // Insert history entries
        if (historyEntries.length > 0) {
          await db.insert(requestHistory).values(historyEntries);
        }
      }

      return c.json({
        success: true,
        data: result,
        message: `Assigned PM to ${result.successIds.length} requests${
          result.failedIds.length > 0 ? `, ${result.failedIds.length} failed` : ''
        }`,
      });
    } catch (error) {
      console.error('Error in bulk assign:', error);
      throw new HTTPException(500, { message: 'Failed to perform bulk PM assignment' });
    }
  }
);

export default app;
