import Link from 'next/link';

import {
  IconBuilding,
  IconCalendarTime,
  IconLayoutGrid,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { listProjects } from '@/lib/api/projects';
import { requireUser } from '@/lib/auth/session';

import type { ProjectWithRelations } from '@/lib/api/projects/types';

const statuses = ['proposal', 'in_development', 'in_review', 'delivered'] as const;
type ProjectStatus = (typeof statuses)[number];

const statusLabels: Record<ProjectStatus, string> = {
  proposal: 'Proposal',
  in_development: 'In Development',
  in_review: 'In Review',
  delivered: 'Delivered',
};

const statusColors: Record<ProjectStatus, string> = {
  proposal: 'bg-yellow-500',
  in_development: 'bg-blue-500',
  in_review: 'bg-purple-500',
  delivered: 'bg-green-500',
};

export default async function ProjectBoardViewPage() {
  await requireUser();

  // TODO: Implement pagination or infinite scroll for scalability
  const projectsResponse = await listProjects({ pageSize: 20 });
  const projects = projectsResponse.data;
  // Create a safely typed object for status grouping
  const projectsByStatus: Record<ProjectStatus, ProjectWithRelations[]> = {
    proposal: projects.filter((p) => p.status === 'proposal'),
    in_development: projects.filter((p) => p.status === 'in_development'),
    in_review: projects.filter((p) => p.status === 'in_review'),
    delivered: projects.filter((p) => p.status === 'delivered'),
  };

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-full overflow-hidden px-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <IconLayoutGrid className="h-6 w-6" />
            <h1 className="text-4xl font-bold">Board View</h1>
          </div>
          <p className="text-muted-foreground mt-2">Kanban-style project visualization</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/projects">
            <Button variant="outline">List View</Button>
          </Link>
          <Link href="/dashboard/projects/new">
            <Button className="gap-2">
              <IconPlus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map((status: ProjectStatus) => {
          const statusProjects: ProjectWithRelations[] = projectsByStatus[status];
          const label = statusLabels[status];
          const color = statusColors[status];

          return (
            <div key={status} className="shrink-0 w-80">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${color}`} />
                    <h3 className="font-semibold">{label}</h3>
                  </div>
                  <Badge variant="secondary">{statusProjects.length}</Badge>
                </div>

                <div className="space-y-3 min-h-[400px] bg-muted/30 rounded-lg p-3">
                  {statusProjects.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No projects</div>
                  ) : (
                    statusProjects.map((project) => {
                      const isOverdue =
                        project.deliveredAt &&
                        new Date(project.deliveredAt) < new Date() &&
                        project.status !== 'delivered';

                      return (
                        <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-sm line-clamp-2">
                                  {project.name}
                                </CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <IconBuilding className="h-3 w-3" />
                                <span className="truncate">
                                  {project.client.name || 'No client'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <IconCalendarTime className="h-3 w-3" />
                                <span className={isOverdue ? 'text-destructive' : ''}>
                                  {project.deliveredAt
                                    ? format(new Date(project.deliveredAt), 'MMM d, yyyy')
                                    : 'No due date'}
                                  {isOverdue && ' (overdue)'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <IconUsers className="h-3 w-3" />
                                <span>
                                  {Array.isArray(project.teamMembers)
                                    ? project.teamMembers.length
                                    : 0}{' '}
                                  members
                                </span>
                              </div>
                              <div className="pt-1">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span>{project.completionPercentage}%</span>
                                </div>
                                <Progress value={project.completionPercentage} className="h-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {projects.length} projects distributed across {statuses.length} columns (some
        columns may be empty)
      </div>
    </div>
  );
}
