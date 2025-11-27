import Link from 'next/link';

import {
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconList,
  IconDots,
  IconPlayerPause,
  IconPlus,
  IconUsers,
  IconAlertCircle,
  IconArchive,
  IconTool,
} from '@tabler/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { listProjects } from '@/lib/api/projects';
import { requireUser } from '@/lib/auth/session';

const statusConfig: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    icon: React.ElementType;
  }
> = {
  proposal: { label: 'Proposal', variant: 'secondary', icon: IconAlertCircle },
  in_development: { label: 'In Development', variant: 'default', icon: IconClock },
  in_review: { label: 'In Review', variant: 'secondary', icon: IconClock },
  delivered: { label: 'Delivered', variant: 'outline', icon: IconCircleCheck },
  on_hold: { label: 'On Hold', variant: 'destructive', icon: IconPlayerPause },
  maintenance: { label: 'Maintenance', variant: 'outline', icon: IconTool },
  archived: { label: 'Archived', variant: 'outline', icon: IconArchive },
};

function getStatusConfig(status: string) {
  return statusConfig[status] ?? { label: status, variant: 'outline' as const, icon: IconClock };
}

export default async function ProjectListViewPage() {
  await requireUser();

  const projectsResponse = await listProjects({ pageSize: 100 });
  const projects = projectsResponse.data;

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-full overflow-hidden px-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <IconList className="h-6 w-6" />
            <h1 className="text-4xl font-bold">List View</h1>
          </div>
          <p className="text-muted-foreground mt-2">Detailed project list with all information</p>
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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-muted-foreground">No projects found</p>
                        <Link href="/dashboard/projects/new">
                          <Button variant="outline" size="sm">
                            <IconPlus className="h-4 w-4 mr-2" />
                            Create your first project
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => {
                    const config = getStatusConfig(project.status);
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <Link
                            href={`/dashboard/projects/${project.id}`}
                            className="space-y-1 block"
                          >
                            <div className="font-semibold hover:underline">{project.name}</div>
                            {project.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {project.description}
                              </div>
                            )}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconUsers className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{project.client.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2 min-w-[120px]">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Completion</span>
                              <span className="font-medium">{project.completionPercentage}%</span>
                            </div>
                            <Progress value={project.completionPercentage} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {project.assignees.slice(0, 3).map((member) => (
                              <Avatar
                                key={member.id}
                                className="h-8 w-8 border-2 border-background"
                              >
                                <AvatarImage src={member.image ?? undefined} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                                  {member.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {(project.assignees.length) === 0 && (
                              <span className="text-xs text-muted-foreground">No team</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs">
                            {project.deliveredAt && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <IconCalendar className="h-3 w-3" />
                                <span>
                                  Due: {new Date(project.deliveredAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <IconClock className="h-3 w-3" />
                              <span>
                                Updated: {new Date(project.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <IconDots className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/projects/${project.id}/edit`}>
                                  Edit Project
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {projects.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
