import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';

import {
  IconEdit,
  IconCalendar,
  IconMail,
  IconPhone,
  IconWorld,
  IconMapPin,
  IconFolder,
  IconTicket,
  IconExternalLink,
  IconBuilding,
  IconFileText,
} from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getClient } from '@/lib/api/clients';
import { requireUser } from '@/lib/auth/session';

import { ClientActivity } from './client-activity';
import { DetailPageHeader } from '../../components/header';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

const clientTypeLabels: Record<string, string> = {
  creative: 'Creative',
  software: 'Software',
  full_service: 'Full Service',
};

const projectStatusColors: Record<string, string> = {
  proposal: 'bg-yellow-100 text-yellow-800',
  in_development: 'bg-blue-100 text-blue-800',
  in_review: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  on_hold: 'bg-red-100 text-red-800',
  maintenance: 'bg-gray-100 text-gray-800',
  archived: 'bg-slate-100 text-slate-800',
};

const ticketStatusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  pending_client: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const ticketPriorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  let client;
  try {
    const response = await getClient(id);
    client = response.data;
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailPageHeader
        title={
          <div className="flex items-center gap-3">
            {client.name}
            <Badge variant={client.active ? 'default' : 'secondary'}>
              {client.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        }
        description={`${clientTypeLabels[client.type] ?? client.type} Client`}
        backUrl="/dashboard/business-center/clients"
        backLabel="Back to Clients"
      >
        <Link href={`/dashboard/business-center/clients?edit=${id}`}>
          <Button>
            <IconEdit className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
        </Link>
      </DetailPageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <IconFolder className="h-4 w-4" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{client.stats.projects.total}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {client.stats.projects.active} active, {client.stats.projects.delivered} delivered
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <IconTicket className="h-4 w-4" />
                  Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{client.stats.tickets.total}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {client.stats.tickets.open} open, {client.stats.tickets.resolved} resolved
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconFolder className="h-4 w-4" />
                Projects ({client.projects.length})
              </CardTitle>
              <CardDescription>All projects for this client</CardDescription>
            </CardHeader>
            <CardContent>
              {client.projects.length > 0 ? (
                <div className="space-y-3">
                  {client.projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/business-center/projects/${project.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{project.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={projectStatusColors[project.status] ?? 'bg-gray-100'}
                          >
                            {project.status.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {project.completionPercentage}% complete
                          </span>
                        </div>
                      </div>
                      <IconExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No projects yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Tickets Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTicket className="h-4 w-4" />
                Recent Tickets
              </CardTitle>
              <CardDescription>Latest tickets from this client</CardDescription>
            </CardHeader>
            <CardContent>
              {client.tickets.length > 0 ? (
                <div className="space-y-3">
                  {client.tickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/dashboard/business-center/intake-queue/${ticket.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {ticket.ticketNumber && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {ticket.ticketNumber}
                            </Badge>
                          )}
                          <p className="font-medium truncate">{ticket.title}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={ticketStatusColors[ticket.status] ?? 'bg-gray-100'}
                          >
                            {ticket.status.replace(/_/g, ' ')}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={ticketPriorityColors[ticket.priority] ?? 'bg-gray-100'}
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>
                      <IconExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No tickets yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IconBuilding className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <IconMail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${client.email}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {client.email}
                  </a>
                </div>
              </div>

              {client.phone && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <IconPhone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${client.phone}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>
                </>
              )}

              {client.website && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <IconWorld className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        {client.website.replace(/^https?:\/\//, '')}
                        <IconExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </>
              )}

              {client.address && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <IconMapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-sm font-medium">{client.address}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconFileText className="h-4 w-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{new Date(client.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <ClientActivity clientId={id} />
        </div>
      </div>
    </div>
  );
}
