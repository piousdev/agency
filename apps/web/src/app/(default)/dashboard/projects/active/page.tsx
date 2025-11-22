import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Pause,
  Plus,
  Users,
  AlertCircle,
  Archive,
  Wrench,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { requireUser } from '@/lib/auth/session';
import { listProjects } from '@/lib/api/projects';

const statusConfig: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    icon: React.ElementType;
  }
> = {
  proposal: { label: 'Proposal', variant: 'secondary', icon: AlertCircle },
  in_development: { label: 'In Development', variant: 'default', icon: Clock },
  in_review: { label: 'In Review', variant: 'secondary', icon: Clock },
  delivered: { label: 'Delivered', variant: 'outline', icon: CheckCircle2 },
  on_hold: { label: 'On Hold', variant: 'destructive', icon: Pause },
  maintenance: { label: 'Maintenance', variant: 'outline', icon: Wrench },
  archived: { label: 'Archived', variant: 'outline', icon: Archive },
};

function getStatusConfig(status: string) {
  return statusConfig[status] ?? { label: status, variant: 'outline' as const, icon: Clock };
}

export default async function ActiveProjectsPage() {
  await requireUser();

  const projectsResponse = await listProjects({ pageSize: 100 });
  // Filter for active projects (in_development, in_review, proposal)
  const projects = projectsResponse.data.filter((p) =>
    ['in_development', 'in_review', 'proposal'].includes(p.status)
  );

  const inDevelopmentCount = projects.filter((p) => p.status === 'in_development').length;
  const inReviewCount = projects.filter((p) => p.status === 'in_review').length;
  const proposalCount = projects.filter((p) => p.status === 'proposal').length;

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-full overflow-hidden px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Active Projects</h1>
          <p className="text-muted-foreground mt-2">Currently ongoing projects</p>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">In Development</p>
              <p className="text-2xl font-bold text-blue-600">{inDevelopmentCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">In Review</p>
              <p className="text-2xl font-bold text-purple-600">{inReviewCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Proposals</p>
              <p className="text-2xl font-bold text-yellow-600">{proposalCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-muted-foreground">No active projects</p>
                        <Link href="/dashboard/projects/new">
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Create a project
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
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{project.client?.name ?? 'Unknown'}</span>
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
                            {project.assignees?.slice(0, 3).map((member) => (
                              <Avatar
                                key={member.id}
                                className="h-8 w-8 border-2 border-background"
                              >
                                <AvatarImage src={member.image ?? undefined} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                                  {member.name
                                    ?.split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase() ?? '?'}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {(project.assignees?.length ?? 0) === 0 && (
                              <span className="text-xs text-muted-foreground">No team</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="space-y-1 text-xs">
                            {project.deliveredAt && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Due: {new Date(project.deliveredAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
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
                                <MoreHorizontal className="h-4 w-4" />
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{projects.length}</span> active project
            {projects.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
