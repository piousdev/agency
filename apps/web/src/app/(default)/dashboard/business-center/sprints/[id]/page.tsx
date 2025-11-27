import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import {
  IconArrowLeft,
  IconRun,
  IconCalendar,
  IconTarget,
  IconClock,
  IconPlayerPlay,
  IconCircleCheck,
  IconBan,
  IconEdit,
} from '@tabler/icons-react';
import { format } from 'date-fns';

import { SprintBurndown } from '@/components/business-center/sprint-burndown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSprint } from '@/lib/api/sprints';
import { requireUser } from '@/lib/auth/session';
import {
  getSprintStatusColor,
  calculateSprintProgress,
  calculateDaysRemaining,
} from '@/lib/schemas/sprint';
import { cn } from '@/lib/utils';

interface SprintDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SprintDetailPage({ params }: SprintDetailPageProps) {
  const { id } = await params;
  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  try {
    const response = await getSprint(id);
    if (!response.success) {
      notFound();
    }

    const sprint = response.data;
    const progress = calculateSprintProgress(sprint.plannedPoints, sprint.completedPoints);
    const daysRemaining = calculateDaysRemaining(sprint.endDate);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Link
                href="/dashboard/business-center/sprints"
                className="hover:text-foreground flex items-center gap-1"
              >
                <IconArrowLeft className="h-4 w-4" />
                Sprints
              </Link>
              <span>/</span>
              {sprint.project && (
                <>
                  <Link
                    href={`/dashboard/business-center/projects/${sprint.project.id}`}
                    className="hover:text-foreground"
                  >
                    {sprint.project.name}
                  </Link>
                  <span>/</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <IconRun className="h-6 w-6" />
              {sprint.name}
              {sprint.sprintNumber && (
                <span className="text-lg text-muted-foreground">#{sprint.sprintNumber}</span>
              )}
              <Badge
                variant="outline"
                className={cn('text-sm', getSprintStatusColor(sprint.status))}
              >
                {sprint.status}
              </Badge>
            </h1>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/business-center/projects/${sprint.projectId}`}>
              <IconEdit className="h-4 w-4 mr-2" />
              Edit in Project
            </Link>
          </Button>
        </div>

        {/* Sprint Goal */}
        {sprint.goal && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <IconTarget className="h-4 w-4" />
                Sprint Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{sprint.goal}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats & Burndown */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sprint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={cn('text-sm', getSprintStatusColor(sprint.status))}
                  >
                    {sprint.status === 'planning' && <IconClock className="h-3 w-3 mr-1" />}
                    {sprint.status === 'active' && <IconPlayerPlay className="h-3 w-3 mr-1" />}
                    {sprint.status === 'completed' && <IconCircleCheck className="h-3 w-3 mr-1" />}
                    {sprint.status === 'cancelled' && <IconBan className="h-3 w-3 mr-1" />}
                    {sprint.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-xl font-bold">{progress}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Story Points</p>
                  <p className="text-lg font-semibold">
                    {sprint.completedPoints} / {sprint.plannedPoints}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Time Remaining</p>
                  <p
                    className={cn(
                      'text-lg font-semibold',
                      daysRemaining !== null && daysRemaining < 0 && 'text-destructive'
                    )}
                  >
                    {daysRemaining !== null
                      ? daysRemaining < 0
                        ? `${String(Math.abs(daysRemaining))} days overdue`
                        : daysRemaining === 0
                          ? 'Ends today'
                          : `${String(daysRemaining)} days`
                      : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <IconCalendar className="h-4 w-4" />
                    Start Date
                  </span>
                  <span>
                    {sprint.startDate
                      ? format(new Date(sprint.startDate), 'MMM d, yyyy')
                      : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <IconCalendar className="h-4 w-4" />
                    End Date
                  </span>
                  <span>
                    {sprint.endDate ? format(new Date(sprint.endDate), 'MMM d, yyyy') : 'Not set'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Burndown Chart */}
          <SprintBurndown sprint={sprint} />
        </div>

        {/* Sprint Board placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sprint Board</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <IconRun className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Sprint board will display tickets assigned to this sprint.</p>
              <p className="text-xs mt-1">
                Ticket sprint assignment will be available in Phase 17 (Enhanced Form Fields).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch {
    notFound();
  }
}
