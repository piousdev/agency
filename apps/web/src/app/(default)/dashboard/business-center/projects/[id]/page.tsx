import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  IconChevronLeft,
  IconEdit,
  IconCalendar,
  IconUsers,
  IconExternalLink,
  IconGitBranch,
  IconWorld,
  IconServer,
  IconFileText,
} from '@tabler/icons-react';
import { requireUser } from '@/lib/auth/session';
import { getProject } from '@/lib/api/projects';
import { listMilestones } from '@/lib/api/milestones';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { projectStatusOptions } from '@/lib/schemas/project';
import { DetailPageHeader } from '../../components/header';
import { ProjectActivity } from './project-activity';
import { MilestoneList } from '@/components/business-center/milestone-list';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<string, string> = {
  proposal: 'bg-yellow-100 text-yellow-800',
  in_development: 'bg-blue-100 text-blue-800',
  in_review: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  on_hold: 'bg-red-100 text-red-800',
  maintenance: 'bg-gray-100 text-gray-800',
  archived: 'bg-slate-100 text-slate-800',
};

export default async function BusinessCenterProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  let project;
  try {
    const response = await getProject(id);
    project = response.data;
  } catch {
    notFound();
  }

  // Fetch milestones for this project
  const milestonesResponse = await listMilestones(id);
  const milestones = milestonesResponse.success ? milestonesResponse.data : [];

  const statusLabel =
    projectStatusOptions.find((s) => s.value === project.status)?.label ?? project.status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailPageHeader
        title={
          <div className="flex items-center gap-3">
            {project.name}
            <Badge className={statusColors[project.status] ?? 'bg-gray-100'}>{statusLabel}</Badge>
          </div>
        }
        description={`Client: ${project.client?.name ?? 'Unknown'}`}
        backUrl="/dashboard/business-center/projects"
        backLabel="Back to Projects"
      >
        <Link href={`/dashboard/projects/${id}/edit`}>
          <Button>
            <IconEdit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </Link>
      </DetailPageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span className="font-medium">{project.completionPercentage}%</span>
                </div>
                <Progress value={project.completionPercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {project.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{project.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          <MilestoneList milestones={milestones} projectId={id} canEdit={user.isInternal} />

          {/* URLs */}
          <Card>
            <CardHeader>
              <CardTitle>Project Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.repositoryUrl && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <IconGitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Repository</span>
                  </div>
                  <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">
                      <IconExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              )}
              {project.stagingUrl && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <IconServer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Staging</span>
                  </div>
                  <a href={project.stagingUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">
                      <IconExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              )}
              {project.productionUrl && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <IconWorld className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Production</span>
                  </div>
                  <a href={project.productionUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">
                      <IconExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              )}
              {!project.repositoryUrl && !project.stagingUrl && !project.productionUrl && (
                <p className="text-sm text-muted-foreground">No project links configured</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconCalendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Delivery Date</p>
                <p className="font-medium">
                  {project.deliveredAt
                    ? new Date(project.deliveredAt).toLocaleDateString()
                    : 'Not set'}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{new Date(project.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconUsers className="h-4 w-4" />
                Team ({project.assignees?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.assignees && project.assignees.length > 0 ? (
                <div className="space-y-2">
                  {project.assignees.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {member.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase() ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No team members assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <ProjectActivity projectId={id} />

          {/* View Full Details Link */}
          <Card>
            <CardContent className="pt-6">
              <Link href={`/dashboard/projects/${id}`}>
                <Button variant="outline" className="w-full">
                  View Full Details
                  <IconExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
