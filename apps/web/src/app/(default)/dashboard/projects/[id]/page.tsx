import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconPencil,
  IconClock,
  IconUsers,
  IconArrowUpRight,
  IconGitBranch,
  IconWorld,
  IconServer,
  IconFileText,
  IconBuilding,
  IconCalendar,
  IconCalendarCheck,
  IconTrendingUp,
  IconLink,
} from '@tabler/icons-react';
import { requireUser } from '@/lib/auth/session';
import {
  getProject,
  getProjectComments,
  getProjectFiles,
  getProjectActivity,
} from '@/lib/api/projects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectDetailSections } from '@/components/projects';
import { projectStatusOptions } from '@/lib/schemas/project';
import { cn } from '@/lib/utils';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  intake: { bg: 'bg-slate-500/10', text: 'text-slate-400', dot: 'bg-slate-400' },
  proposal: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  in_development: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  in_review: { bg: 'bg-violet-500/10', text: 'text-violet-400', dot: 'bg-violet-400' },
  delivered: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  on_hold: { bg: 'bg-rose-500/10', text: 'text-rose-400', dot: 'bg-rose-400' },
};

function formatDate(date: string | null | undefined, fallback = 'Not set') {
  if (!date) return fallback;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInitials(name: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
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

  // Fetch comments, files, and activity in parallel
  const [commentsResponse, filesResponse, activityResponse] = await Promise.all([
    getProjectComments(id).catch(() => ({ success: false, data: [] })),
    getProjectFiles(id).catch(() => ({ success: false, data: [] })),
    getProjectActivity(id).catch(() => ({
      success: false,
      data: [],
      pagination: { page: 1, pageSize: 50, totalCount: 0, totalPages: 0, hasMore: false },
    })),
  ]);

  const comments = commentsResponse.data;
  const files = filesResponse.data;
  const activities = activityResponse.data;

  const statusLabel =
    projectStatusOptions.find((s) => s.value === project.status)?.label ?? project.status;
  const status = statusConfig[project.status as keyof typeof statusConfig] ?? {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
  };

  const hasLinks = project.repositoryUrl || project.stagingUrl || project.productionUrl;

  return (
    <div className="min-h-screen">
      {/* Subtle gradient header */}
      <div className="border-b border-border/40 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-full px-6 py-6">
          {/* Breadcrumb */}
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <IconArrowLeft className="h-4 w-4" />
            <span>Projects</span>
          </Link>

          {/* Title Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
                <Badge
                  variant="secondary"
                  className={cn('gap-1.5 font-medium', status.bg, status.text)}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                  {statusLabel}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <IconBuilding className="h-3.5 w-3.5" />
                  {project.client?.name ?? 'No client'}
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1.5">
                  <IconUsers className="h-3.5 w-3.5" />
                  {project.assignees?.length ?? 0} member
                  {(project.assignees?.length ?? 0) !== 1 ? 's' : ''}
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1.5">
                  <IconClock className="h-3.5 w-3.5" />
                  Updated {formatDate(project.updatedAt)}
                </span>
              </div>
            </div>
            <Link href={`/dashboard/projects/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <IconPencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-full px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Progress
                </h2>
                <div className="flex items-center gap-2">
                  <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-semibold tabular-nums">
                    {project.completionPercentage}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
                  style={{ width: `${project.completionPercentage}%` }}
                />
              </div>
              {/* Progress milestones */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Started</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>Complete</span>
              </div>
            </section>

            {/* Description */}
            {project.description && (
              <section className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Description
                </h2>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </section>
            )}

            {/* Project Links */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <IconLink className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Links
                </h2>
              </div>

              {hasLinks ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {project.repositoryUrl && (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-4 transition-all hover:border-border hover:bg-card"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <IconGitBranch className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Repository</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {new URL(project.repositoryUrl).hostname}
                        </p>
                      </div>
                      <IconArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  )}

                  {project.stagingUrl && (
                    <a
                      href={project.stagingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-4 transition-all hover:border-border hover:bg-card"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <IconServer className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Staging</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {new URL(project.stagingUrl).hostname}
                        </p>
                      </div>
                      <IconArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  )}

                  {project.productionUrl && (
                    <a
                      href={project.productionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-4 transition-all hover:border-border hover:bg-card"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <IconWorld className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Production</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {new URL(project.productionUrl).hostname}
                        </p>
                      </div>
                      <IconArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 py-8">
                  <div className="text-center">
                    <IconLink className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">No links configured</p>
                    <Link href={`/dashboard/projects/${id}/edit`}>
                      <Button variant="link" size="sm" className="mt-1">
                        Add project links
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* Internal Notes */}
            {project.notes && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <IconFileText className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Internal Notes
                  </h2>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {project.notes}
                  </p>
                </div>
              </section>
            )}

            {/* Comments, Attachments, Activity Tabs */}
            <section className="space-y-4">
              <ProjectDetailSections
                projectId={id}
                currentUserId={user.id}
                comments={comments}
                files={files}
                activities={activities}
              />
            </section>
          </div>

          {/* Right Column - 1/3 Sidebar */}
          <div className="space-y-6">
            {/* Timeline Card */}
            <div className="rounded-xl border border-border/60 bg-card/30 p-5">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconCalendar className="h-4 w-4" />
                    <span className="text-sm">Started</span>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      project.startedAt ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {formatDate(project.startedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconCalendarCheck className="h-4 w-4" />
                    <span className="text-sm">Delivered</span>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      project.deliveredAt ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {formatDate(project.deliveredAt)}
                  </span>
                </div>
                <div className="h-px bg-border/60" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {formatDate(project.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Team Card */}
            <div className="rounded-xl border border-border/60 bg-card/30 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Team
                </h3>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {project.assignees?.length ?? 0} member
                  {(project.assignees?.length ?? 0) !== 1 ? 's' : ''}
                </span>
              </div>

              {project.assignees && project.assignees.length > 0 ? (
                <div className="space-y-3">
                  {project.assignees.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border/40">
                        <AvatarImage src={member.image ?? undefined} />
                        <AvatarFallback className="text-xs font-medium bg-muted">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <IconUsers className="h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No members assigned</p>
                  <Link href={`/dashboard/projects/${id}/edit`}>
                    <Button variant="link" size="sm" className="mt-1">
                      Assign team
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Client Card */}
            <div className="rounded-xl border border-border/60 bg-card/30 p-5">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Client
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <IconBuilding className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{project.client?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {project.client?.type ?? 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
