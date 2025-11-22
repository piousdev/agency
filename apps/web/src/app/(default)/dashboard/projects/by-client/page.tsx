import Link from 'next/link';
import { Building2, FolderOpen, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { requireUser } from '@/lib/auth/session';
import { listProjects } from '@/lib/api/projects';
import type { ProjectWithRelations } from '@/lib/api/projects/types';

interface ClientGroup {
  id: string;
  name: string;
  type: string;
  projects: ProjectWithRelations[];
  totalProjects: number;
  activeProjects: number;
  avgCompletion: number;
}

export default async function ProjectsByClientPage() {
  await requireUser();

  const projectsResponse = await listProjects({ pageSize: 100 });
  const projects = projectsResponse.data;

  // Group projects by client
  const clientGroups = projects.reduce<Record<string, ClientGroup>>((acc, project) => {
    const clientId = project.client?.id ?? 'unknown';
    const clientName = project.client?.name ?? 'Unknown Client';
    const clientType = project.client?.type ?? 'unknown';

    if (!acc[clientId]) {
      acc[clientId] = {
        id: clientId,
        name: clientName,
        type: clientType,
        projects: [],
        totalProjects: 0,
        activeProjects: 0,
        avgCompletion: 0,
      };
    }

    acc[clientId].projects.push(project);
    acc[clientId].totalProjects++;

    if (['in_development', 'in_review', 'proposal'].includes(project.status)) {
      acc[clientId].activeProjects++;
    }

    return acc;
  }, {});

  // Calculate average completion for each client
  Object.values(clientGroups).forEach((group) => {
    const totalCompletion = group.projects.reduce((sum, p) => sum + p.completionPercentage, 0);
    group.avgCompletion = Math.round(totalCompletion / group.projects.length);
  });

  // Sort by total projects descending
  const sortedGroups = Object.values(clientGroups).sort(
    (a, b) => b.totalProjects - a.totalProjects
  );

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-full overflow-hidden px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Projects by Client</h1>
          <p className="text-muted-foreground mt-2">Projects grouped by client organization</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold">{sortedGroups.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg Projects/Client</p>
              <p className="text-2xl font-bold">
                {sortedGroups.length > 0
                  ? Math.round((projects.length / sortedGroups.length) * 10) / 10
                  : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No projects found</p>
              <Link href="/dashboard/projects/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first project
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription className="capitalize">{group.type}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{group.totalProjects} projects</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Active</p>
                    <p className="font-semibold text-blue-600">{group.activeProjects}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Completion</p>
                    <p className="font-semibold">{group.avgCompletion}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Overall Progress</span>
                    <span>{group.avgCompletion}%</span>
                  </div>
                  <Progress value={group.avgCompletion} className="h-2" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Recent Projects</p>
                  <div className="space-y-1">
                    {group.projects.slice(0, 3).map((project) => (
                      <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className="flex items-center gap-2 text-sm hover:underline"
                      >
                        <FolderOpen className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{project.name}</span>
                      </Link>
                    ))}
                    {group.projects.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{group.projects.length - 3} more projects
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
