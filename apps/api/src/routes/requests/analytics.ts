import { eq, and, sql, gte, lt, count, isNull, not } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../../db/index.js';
import { request } from '../../db/schema/index.js';
import { requireAuth } from '../../middleware/auth.js';

const app = new Hono();

// Aging thresholds in hours
const STAGE_THRESHOLDS = {
  in_treatment: 48, // 2 days
  on_hold: 120, // 5 days
  estimation: 24, // 1 day
  ready: 12, // 12 hours
};

/**
 * GET /api/requests/analytics
 * Returns comprehensive intake pipeline analytics
 */
app.get('/', requireAuth, async (c) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    // 1. Stage distribution (current active requests per stage)
    const stageDistribution = await db
      .select({
        stage: request.stage,
        count: count(),
      })
      .from(request)
      .where(and(eq(request.isConverted, false), eq(request.isCancelled, false)))
      .groupBy(request.stage);

    // 2. Requests by type (last 30 days)
    const requestsByType = await db
      .select({
        type: request.type,
        count: count(),
      })
      .from(request)
      .where(gte(request.createdAt, thirtyDaysAgo))
      .groupBy(request.type);

    // 3. Aging requests count per stage
    const agingRequests: Record<string, number> = {};
    type ValidStage = keyof typeof STAGE_THRESHOLDS;
    const stages: ValidStage[] = ['in_treatment', 'on_hold', 'estimation', 'ready'];
    for (const stage of stages) {
      const thresholdHours = STAGE_THRESHOLDS[stage];
      const thresholdDate = new Date(now.getTime() - thresholdHours * 60 * 60 * 1000);

      const result = await db
        .select({ count: count() })
        .from(request)
        .where(
          and(
            eq(request.stage, stage),
            lt(request.stageEnteredAt, thresholdDate),
            eq(request.isConverted, false),
            eq(request.isCancelled, false)
          )
        );

      agingRequests[stage] = result[0]?.count ?? 0;
    }

    // 4. Throughput - requests converted per week (last 4 weeks)
    const throughput: { week: string; count: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const result = await db
        .select({ count: count() })
        .from(request)
        .where(
          and(
            eq(request.isConverted, true),
            gte(request.convertedAt, weekStart),
            lt(request.convertedAt, weekEnd)
          )
        );

      throughput.unshift({
        week: `Week ${String(4 - i)}`,
        count: result[0]?.count ?? 0,
      });
    }

    // 5. Average time per stage (using history records, in hours)
    // Calculate average time in stage based on current stage entry time
    const avgTimeInStage: Record<string, number> = {};

    type Stage = keyof typeof STAGE_THRESHOLDS;
    const avgStages: Stage[] = ['in_treatment', 'on_hold', 'estimation', 'ready'];
    for (const stage of avgStages) {
      const result = await db
        .select({
          avgHours:
            sql<number>`AVG(EXTRACT(EPOCH FROM (NOW() - ${request.stageEnteredAt})) / 3600)`.as(
              'avg_hours'
            ),
        })
        .from(request)
        .where(
          and(
            eq(request.stage, stage),
            eq(request.isConverted, false),
            eq(request.isCancelled, false)
          )
        );

      avgTimeInStage[stage] = Math.round((result[0]?.avgHours ?? 0) * 10) / 10;
    }

    // 6. Estimation accuracy (compare estimated story points vs actual - using conversion data)
    // Note: This would require tracking actual effort after conversion, which isn't implemented
    // For now, we'll return distribution of confidence levels
    const estimationConfidence = await db
      .select({
        confidence: request.confidence,
        count: count(),
      })
      .from(request)
      .where(and(not(isNull(request.confidence)), gte(request.estimatedAt, thirtyDaysAgo)))
      .groupBy(request.confidence);

    // 7. Story points distribution
    const storyPointsDistribution = await db
      .select({
        storyPoints: request.storyPoints,
        count: count(),
      })
      .from(request)
      .where(and(not(isNull(request.storyPoints)), gte(request.estimatedAt, thirtyDaysAgo)))
      .groupBy(request.storyPoints)
      .orderBy(request.storyPoints);

    // 8. Weekly new requests (last 4 weeks)
    const weeklyNewRequests: { week: string; count: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const result = await db
        .select({ count: count() })
        .from(request)
        .where(and(gte(request.createdAt, weekStart), lt(request.createdAt, weekEnd)));

      weeklyNewRequests.unshift({
        week: `Week ${String(4 - i)}`,
        count: result[0]?.count ?? 0,
      });
    }

    // 9. Total counts summary
    const totalActive = stageDistribution.reduce((sum, s) => sum + s.count, 0);
    const totalAging = Object.values(agingRequests).reduce((sum, c) => sum + c, 0);

    const convertedCount = await db
      .select({ count: count() })
      .from(request)
      .where(and(eq(request.isConverted, true), gte(request.convertedAt, thirtyDaysAgo)));

    return c.json({
      success: true,
      data: {
        stageDistribution: stageDistribution.map((s) => ({
          stage: s.stage,
          count: s.count,
        })),
        requestsByType: requestsByType.map((r) => ({
          type: r.type,
          count: r.count,
        })),
        agingRequests,
        throughput,
        avgTimeInStage,
        estimationConfidence: estimationConfidence.map((e) => ({
          confidence: e.confidence,
          count: e.count,
        })),
        storyPointsDistribution: storyPointsDistribution.map((s) => ({
          storyPoints: s.storyPoints,
          count: s.count,
        })),
        weeklyNewRequests,
        summary: {
          totalActive,
          totalAging,
          convertedLast30Days: convertedCount[0]?.count ?? 0,
          avgThroughputPerWeek: Math.round(throughput.reduce((sum, t) => sum + t.count, 0) / 4),
        },
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return c.json({ success: false, error: 'Failed to fetch analytics' }, 500);
  }
});

export default app;
