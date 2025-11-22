import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { format, formatDistanceToNow, isPast, differenceInMinutes } from 'date-fns';
import {
  ChevronLeft,
  Building2,
  Calendar,
  User,
  AlertCircle,
  FileText,
  Clock,
  Tag,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  MessageSquare,
  Paperclip,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Link2,
} from 'lucide-react';
import { requireUser } from '@/lib/auth/session';
import { getTicket } from '@/lib/api/tickets';
import { listTeamMembers } from '@/lib/api/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TicketActions } from './actions-client';
import { ActivityFeed } from './activity-feed';
import { CommentsSection } from './comments-section';

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

const priorityConfig = {
  low: { label: 'Low', variant: 'secondary' as const, color: 'text-muted-foreground' },
  medium: { label: 'Medium', variant: 'default' as const, color: 'text-blue-600' },
  high: { label: 'High', variant: 'default' as const, color: 'text-orange-600' },
  critical: { label: 'Critical', variant: 'destructive' as const, color: 'text-red-600' },
};

const statusConfig = {
  open: { label: 'Open', variant: 'secondary' as const },
  in_progress: { label: 'In Progress', variant: 'default' as const },
  pending_client: { label: 'Pending Client', variant: 'outline' as const },
  resolved: { label: 'Resolved', variant: 'default' as const },
  closed: { label: 'Closed', variant: 'secondary' as const },
};

const typeConfig = {
  intake: { label: 'Intake', icon: FileText },
  bug: { label: 'Bug', icon: AlertCircle },
  support: { label: 'Support', icon: MessageSquare },
  incident: { label: 'Incident', icon: AlertTriangle },
  change_request: { label: 'Change Request', icon: FileText },
};

const sourceConfig = {
  web_form: { label: 'Web Form', icon: Globe },
  email: { label: 'Email', icon: Mail },
  phone: { label: 'Phone', icon: Phone },
  chat: { label: 'Chat', icon: MessageSquare },
  api: { label: 'API', icon: Globe },
  internal: { label: 'Internal', icon: Building2 },
};

const slaStatusConfig = {
  on_track: { label: 'On Track', variant: 'default' as const, icon: CheckCircle2 },
  at_risk: { label: 'At Risk', variant: 'outline' as const, icon: AlertTriangle },
  breached: { label: 'Breached', variant: 'destructive' as const, icon: AlertCircle },
};

function formatDuration(minutes: number | null): string {
  if (!minutes) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;

  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  let ticket;
  let teamMembers;

  try {
    const [ticketResponse, teamResponse] = await Promise.all([getTicket(id), listTeamMembers()]);
    ticket = ticketResponse.data;
    teamMembers = teamResponse.data;
  } catch {
    notFound();
  }

  const priorityInfo = priorityConfig[ticket.priority];
  const statusInfo = statusConfig[ticket.status];
  const typeInfo = typeConfig[ticket.type];
  const sourceInfo = sourceConfig[ticket.source] || sourceConfig.web_form;
  const slaInfo = ticket.slaStatus ? slaStatusConfig[ticket.slaStatus] : null;

  const isOverdue =
    ticket.dueAt &&
    isPast(new Date(ticket.dueAt)) &&
    ticket.status !== 'resolved' &&
    ticket.status !== 'closed';
  const timeToSla = ticket.dueAt ? differenceInMinutes(new Date(ticket.dueAt), new Date()) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/business-center/intake-queue">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          {ticket.ticketNumber && (
            <Badge variant="outline" className="font-mono">
              {ticket.ticketNumber}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Description Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-muted ${priorityInfo.color}`}>
                  <typeInfo.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-xl">{ticket.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                    {ticket.createdBy && (
                      <>
                        <span>by</span>
                        <span className="font-medium">{ticket.createdBy.name}</span>
                      </>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h3>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                  {ticket.description || 'No description provided'}
                </div>
              </div>

              {/* Tags */}
              {ticket.tags && ticket.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Context */}
              {(ticket.environment || ticket.affectedUrl || ticket.browserInfo) && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Technical Context
                  </h3>
                  <div className="grid gap-2 text-sm">
                    {ticket.environment && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Environment:</span>
                        <Badge variant="outline">{ticket.environment}</Badge>
                      </div>
                    )}
                    {ticket.affectedUrl && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">URL:</span>
                        <a
                          href={ticket.affectedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {ticket.affectedUrl.substring(0, 50)}
                          {ticket.affectedUrl.length > 50 && '...'}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {ticket.browserInfo && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Browser:</span>
                        <span>{ticket.browserInfo}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for Comments, Files, Activity */}
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments
                {ticket.comments && ticket.comments.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {ticket.comments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Files
                {ticket.files && ticket.files.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {ticket.files.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="mt-4">
              <CommentsSection ticketId={ticket.id} comments={ticket.comments || []} />
            </TabsContent>

            <TabsContent value="files" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {ticket.files && ticket.files.length > 0 ? (
                    <div className="space-y-2">
                      {ticket.files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded by {file.uploadedBy.name}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No files attached</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <ActivityFeed activities={ticket.activities || []} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SLA Card */}
          {(ticket.dueAt || ticket.slaStatus) && (
            <Card className={isOverdue ? 'border-destructive' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  SLA Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {slaInfo && (
                  <div className="flex items-center gap-2">
                    <slaInfo.icon className={`h-4 w-4 ${isOverdue ? 'text-destructive' : ''}`} />
                    <Badge variant={isOverdue ? 'destructive' : slaInfo.variant}>
                      {isOverdue ? 'Overdue' : slaInfo.label}
                    </Badge>
                  </div>
                )}
                {ticket.dueAt && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Due Date</span>
                      <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                        {format(new Date(ticket.dueAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {timeToSla !== null && !isOverdue && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Time remaining</span>
                          <span>{formatDuration(timeToSla)}</span>
                        </div>
                        <Progress
                          value={Math.max(0, Math.min(100, 100 - (timeToSla / (24 * 60)) * 100))}
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </div>
                )}
                {ticket.firstResponseAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">First Response</span>
                    <span>{format(new Date(ticket.firstResponseAt), 'MMM d, h:mm a')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Time Tracking Card */}
          {(ticket.estimatedTime || ticket.timeSpent) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated</span>
                  <span>{formatDuration(ticket.estimatedTime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time Spent</span>
                  <span>{formatDuration(ticket.timeSpent)}</span>
                </div>
                {ticket.estimatedTime && ticket.timeSpent && (
                  <Progress
                    value={Math.min(100, (ticket.timeSpent / ticket.estimatedTime) * 100)}
                    className="h-1.5"
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{ticket.client?.name || 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <typeInfo.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline">{typeInfo.label}</Badge>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <sourceInfo.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Source</p>
                  <Badge variant="outline">{sourceInfo.label}</Badge>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  {ticket.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={ticket.assignedTo.image || undefined} />
                        <AvatarFallback>{ticket.assignedTo.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{ticket.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">{ticket.createdBy?.name || 'Unknown'}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{format(new Date(ticket.updatedAt), 'MMM d, yyyy')}</p>
                </div>
              </div>

              {ticket.project && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Related Project</p>
                      <Link
                        href={`/dashboard/business-center/projects/${ticket.project.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {ticket.project.name}
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {ticket.parentTicket && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Parent Ticket</p>
                      <Link
                        href={`/dashboard/business-center/intake-queue/${ticket.parentTicket.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {ticket.parentTicket.ticketNumber || ticket.parentTicket.title}
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Card */}
          {(ticket.contactName || ticket.contactEmail || ticket.contactPhone) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ticket.contactName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{ticket.contactName}</span>
                  </div>
                )}
                {ticket.contactEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${ticket.contactEmail}`}
                      className="text-primary hover:underline"
                    >
                      {ticket.contactEmail}
                    </a>
                  </div>
                )}
                {ticket.contactPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${ticket.contactPhone}`} className="text-primary hover:underline">
                      {ticket.contactPhone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketActions
                ticketId={ticket.id}
                currentAssigneeId={ticket.assignedTo?.id}
                currentStatus={ticket.status}
                currentPriority={ticket.priority}
                teamMembers={teamMembers}
              />
            </CardContent>
          </Card>

          {/* Linked Tickets */}
          {ticket.childTickets && ticket.childTickets.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Linked Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ticket.childTickets.map((child) => (
                    <Link
                      key={child.id}
                      href={`/dashboard/business-center/intake-queue/${child.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{child.ticketNumber || child.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {child.title}
                        </p>
                      </div>
                      <Badge variant={statusConfig[child.status].variant} className="text-xs">
                        {statusConfig[child.status].label}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
