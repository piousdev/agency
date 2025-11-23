import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { IconTimeline, IconPlus } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { requireUser } from '@/lib/auth/session';
import { listProjects } from '@/lib/api/projects';

const statusColors: Record<string, string> = {
  proposal: 'bg-yellow-500',
  in_development: 'bg-blue-500',
  in_review: 'bg-purple-500',
  delivered: 'bg-green-500',
  on_hold: 'bg-red-500',
  maintenance: 'bg-gray-500',
  archived: 'bg-slate-500',
};

const statusLabels: Record<string, string> = {
  proposal: 'Proposal',
  in_development: 'In Development',
  in_review: 'In Review',
  delivered: 'Delivered',
  on_hold: 'On Hold',
  maintenance: 'Maintenance',
  archived: 'Archived',
};

export default async function ProjectTimelineViewPage() {
  await requireUser();

  const projectsResponse = await listProjects({ pageSize: 100 });
  const projects = projectsResponse.data;

  // Sort projects by delivery date (soonest first), then by created date
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.deliveredAt && b.deliveredAt) {
      return new Date(a.deliveredAt).getTime() - new Date(b.deliveredAt).getTime();
    }
    if (a.deliveredAt) return -1;
    if (b.deliveredAt) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const today = new Date();

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-full overflow-hidden px-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <IconTimeline className="h-6 w-6" />
            <h1 className="text-4xl font-bold">Timeline View</h1>
          </div>
          <p className="text-muted-foreground mt-2">Gantt-style project timeline</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/projects/views/board">
            <Button variant="outline">Board View</Button>
          </Link>
          <Link href="/dashboard/projects/new">
            <Button className="gap-2">
              <IconPlus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Timeline Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="text-sm font-medium text-muted-foreground">Status:</div>
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded ${color}`} />
                <span className="text-sm">{statusLabels[status]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedProjects.length === 0 ? (
              <div className="text-center py-12">
                <IconTimeline className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No projects to display</p>
                <Link href="/dashboard/projects/new">
                  <Button className="mt-4">
                    <IconPlus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </div>
            ) : (
              sortedProjects.map((project) => {
                const daysUntilDue = project.deliveredAt
                  ? differenceInDays(new Date(project.deliveredAt), today)
                  : null;

                const isOverdue =
                  daysUntilDue !== null && daysUntilDue < 0 && project.status !== 'delivered';
                const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;

                return (
                  <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                    <div className="group flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      {/* Status indicator */}
                      <div
                        className={`h-full w-1 rounded-full self-stretch ${
                          statusColors[project.status] ?? 'bg-gray-500'
                        }`}
                      />

                      {/* Project info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate group-hover:underline">
                              {project.name}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {project.client?.name ?? 'No client'}
                            </p>
                          </div>
                          <Badge
                            variant={
                              project.status === 'delivered'
                                ? 'outline'
                                : project.status === 'on_hold'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {statusLabels[project.status] ?? project.status}
                          </Badge>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{project.completionPercentage}%</span>
                          </div>
                          <Progress value={project.completionPercentage} className="h-2" />
                        </div>
                      </div>

                      {/* Timeline info */}
                      <div className="text-right text-sm shrink-0 w-32">
                        {project.deliveredAt ? (
                          <>
                            <div
                              className={`font-medium ${
                                isOverdue
                                  ? 'text-destructive'
                                  : isDueSoon
                                    ? 'text-yellow-600'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              {format(new Date(project.deliveredAt), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {isOverdue
                                ? `${Math.abs(daysUntilDue!)} days overdue`
                                : daysUntilDue === 0
                                  ? 'Due today'
                                  : `${daysUntilDue} days left`}
                            </div>
                          </>
                        ) : (
                          <div className="text-muted-foreground">No due date</div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Showing {projects.length} project{projects.length !== 1 ? 's' : ''} sorted by delivery date
      </div>
    </div>
  );
}
