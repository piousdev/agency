import Link from 'next/link';

import {
  IconCalendar,
  IconCircleCheck,
  IconClock,
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
    color: string;
  }
> = {
  proposal: {
    label: 'Proposal',
    variant: 'secondary',
    icon: IconAlertCircle,
    color: 'bg-yellow-500',
  },
  in_development: {
    label: 'In Development',
    variant: 'default',
    icon: IconClock,
    color: 'bg-blue-500',
  },
  in_review: {
    label: 'In Review',
    variant: 'secondary',
    icon: IconClock,
    color: 'bg-purple-500',
  },
  delivered: {
    label: 'Delivered',
    variant: 'outline',
    icon: IconCircleCheck,
    color: 'bg-green-500',
  },
  on_hold: {
    label: 'On Hold',
    variant: 'destructive',
    icon: IconPlayerPause,
    color: 'bg-red-500',
  },
  maintenance: {
    label: 'Maintenance',
    variant: 'outline',
    icon: IconTool,
    color: 'bg-gray-500',
  },
  archived: {
    label: 'Archived',
    variant: 'outline',
    icon: IconArchive,
    color: 'bg-slate-500',
  },
};

function getStatusConfig(status: string) {
  return (
    statusConfig[status] ?? {
      label: status,
      variant: 'outline' as const,
      icon: IconClock,
      color: 'bg-gray-500',
    }
  );
}

export default async function ProjectsPage() {
  await requireUser();

  // Fetch real projects from the API
  const projectsResponse = await listProjects({ pageSize: 100 });
  const projects = projectsResponse.data;

  // Calculate stats
  const inDevelopmentCount = projects.filter((p) => p.status === 'in_development').length;
  const deliveredCount = projects.filter((p) => p.status === 'delivered').length;
  const onHoldCount = projects.filter((p) => p.status === 'on_hold').length;

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-full overflow-hidden px-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your projects in one place
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="gap-2">
            <IconPlus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">In Development</p>
              <p className="text-2xl font-bold text-blue-600">{inDevelopmentCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">On Hold</p>
              <p className="text-2xl font-bold text-red-600">{onHoldCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Project</TableHead>
                  <TableHead className="hidden md:table-cell">Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="hidden xl:table-cell">Team</TableHead>
                  <TableHead className="hidden lg:table-cell">Timeline</TableHead>
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
                        <TableCell className="hidden md:table-cell">
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
                        <TableCell className="hidden xl:table-cell">
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
                            {(project.assignees.length) > 3 && (
                              <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                                +{(project.assignees.length) - 3}
                              </div>
                            )}
                            {(project.assignees.length) === 0 && (
                              <span className="text-xs text-muted-foreground">No team</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
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

      {/* Pagination */}
      {projects.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{projects.length}</span> project
            {projects.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
