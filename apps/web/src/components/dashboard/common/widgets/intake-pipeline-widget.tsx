'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  IconArrowRight,
  IconAlertTriangle,
  IconTrendingUp,
  IconClock,
  IconLoader2,
} from '@tabler/icons-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getIntakeAnalytics, type IntakeAnalytics } from '@/lib/actions/business-center/analytics';
import { REQUEST_STAGE_LABELS } from '@/lib/schemas/request';

const STAGE_COLORS: Record<string, string> = {
  in_treatment: 'bg-blue-500',
  on_hold: 'bg-amber-500',
  estimation: 'bg-purple-500',
  ready: 'bg-green-500',
};

export function IntakePipelineWidget() {
  const [analytics, setAnalytics] = useState<IntakeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      const result = await getIntakeAnalytics();
      if (result.success && result.data) {
        setAnalytics(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load analytics');
      }
      setLoading(false);
    }

    fetchAnalytics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconLoader2 className="h-5 w-5 animate-spin" />
            Intake Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <span className="text-muted-foreground">Loading analytics...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Intake Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <span className="text-destructive">{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const totalRequests = analytics.stageDistribution.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Intake Pipeline</CardTitle>
            <CardDescription>Active work requests by stage</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/business-center/intake">
              View All
              <IconArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-2xl font-bold">{analytics.summary.totalActive}</p>
            <p className="text-xs text-muted-foreground">Active Requests</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold flex items-center gap-1">
              {analytics.summary.totalAging}
              {analytics.summary.totalAging > 0 && (
                <IconAlertTriangle className="h-5 w-5 text-amber-500" />
              )}
            </p>
            <p className="text-xs text-muted-foreground">Aging Requests</p>
          </div>
        </div>

        {/* Stage Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Stage Distribution</h4>
          {analytics.stageDistribution.map((stage) => {
            const percentage =
              totalRequests > 0 ? Math.round((stage.count / totalRequests) * 100) : 0;
            const agingCount = analytics.agingRequests[stage.stage] || 0;

            return (
              <div key={stage.stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${STAGE_COLORS[stage.stage] || 'bg-gray-500'}`}
                    />
                    {REQUEST_STAGE_LABELS[stage.stage as keyof typeof REQUEST_STAGE_LABELS] ||
                      stage.stage}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{stage.count}</span>
                    {agingCount > 0 && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                        {agingCount} aging
                      </Badge>
                    )}
                  </span>
                </div>
                <Progress value={percentage} className="h-1.5" />
              </div>
            );
          })}
        </div>

        {/* Throughput Trend */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <IconTrendingUp className="h-4 w-4" />
            Weekly Throughput
          </h4>
          <div className="flex gap-1 h-16 items-end">
            {analytics.throughput.map((week, i) => {
              const maxCount = Math.max(...analytics.throughput.map((t) => t.count), 1);
              const height = Math.max(10, (week.count / maxCount) * 100);

              return (
                <div key={week.week} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/80 rounded-t transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Avg: {analytics.summary.avgThroughputPerWeek} requests/week
          </p>
        </div>

        {/* Average Time in Stage */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <IconClock className="h-4 w-4" />
            Avg. Time in Stage
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(analytics.avgTimeInStage).map(([stage, hours]) => (
              <div
                key={stage}
                className="flex items-center justify-between p-2 rounded bg-muted/50"
              >
                <span className="text-muted-foreground">
                  {REQUEST_STAGE_LABELS[stage as keyof typeof REQUEST_STAGE_LABELS]?.split(
                    ' '
                  )[0] || stage}
                </span>
                <span className="font-medium">
                  {hours < 24 ? `${Math.round(hours)}h` : `${Math.round(hours / 24)}d`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
