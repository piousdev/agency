'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconEdit,
  IconArrowRight,
  IconUserPlus,
  IconClock,
  IconCalendarEvent,
  IconTag,
  IconUser,
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconLoader2,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RequestWithRelations } from '@/lib/api/requests/types';
import type { RequestStage } from '@/lib/schemas/request';
import {
  transitionRequest,
  holdRequest,
  resumeRequest,
  assignPm,
  cancelRequest,
} from '@/lib/actions/business-center/requests';
import {
  REQUEST_TYPE_LABELS,
  REQUEST_STAGE_LABELS,
  PRIORITY_LABELS,
  CONFIDENCE_LABELS,
  STAGE_THRESHOLDS,
} from '@/lib/schemas/request';

interface RequestDetailClientProps {
  request: RequestWithRelations;
  availablePMs?: Array<{ id: string; name: string }>;
}

const VALID_TRANSITIONS: Record<RequestStage, RequestStage[]> = {
  in_treatment: ['on_hold', 'estimation'],
  on_hold: ['in_treatment', 'estimation'],
  estimation: ['in_treatment', 'on_hold', 'ready'],
  ready: ['in_treatment', 'on_hold', 'estimation'],
};

function getAgingStatus(stage: string, stageEnteredAt: string): 'normal' | 'warning' | 'critical' {
  const threshold = STAGE_THRESHOLDS[stage as keyof typeof STAGE_THRESHOLDS];
  if (!threshold) return 'normal';

  const hoursInStage = (Date.now() - new Date(stageEnteredAt).getTime()) / (1000 * 60 * 60);

  if (hoursInStage >= threshold.critical) return 'critical';
  if (hoursInStage >= threshold.warning) return 'warning';
  return 'normal';
}

function getPriorityVariant(priority: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (priority) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimeInStage(stageEnteredAt: string): string {
  const now = new Date();
  const entered = new Date(stageEnteredAt);
  const diffMs = now.getTime() - entered.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}, ${diffHours % 24} hour${diffHours % 24 !== 1 ? 's' : ''}`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  }
  return 'Less than an hour';
}

export function RequestDetailClient({ request, availablePMs = [] }: RequestDetailClientProps) {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const agingStatus = getAgingStatus(request.stage, request.stageEnteredAt);
  const validTargetStages = VALID_TRANSITIONS[request.stage] || [];

  const handleAssignPm = async (pmId: string) => {
    setIsTransitioning(true);
    try {
      const result = await assignPm(request.id, pmId);
      if (result.success) {
        const pm = availablePMs.find((p) => p.id === pmId);
        toast.success(`${pm?.name || 'PM'} assigned to request`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to assign PM');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleCancel = async () => {
    setIsTransitioning(true);
    try {
      const result = await cancelRequest(request.id);
      if (result.success) {
        toast.success('Request cancelled');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to cancel request');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleTransition = async (toStage: RequestStage) => {
    setIsTransitioning(true);
    try {
      const result = await transitionRequest(request.id, toStage);
      if (result.success) {
        toast.success(`Request moved to ${REQUEST_STAGE_LABELS[toStage]}`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to transition request');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleHold = async () => {
    setIsTransitioning(true);
    try {
      const result = await holdRequest(request.id, { reason: 'Placed on hold' });
      if (result.success) {
        toast.success('Request placed on hold');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to hold request');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleResume = async () => {
    setIsTransitioning(true);
    try {
      const result = await resumeRequest(request.id);
      if (result.success) {
        toast.success('Request resumed');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to resume request');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/business-center/intake')}
            className="mb-2"
          >
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Intake
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">{request.requestNumber}</span>
            <Badge variant={getPriorityVariant(request.priority)}>
              {PRIORITY_LABELS[request.priority]}
            </Badge>
            {request.isConverted && (
              <Badge variant="outline" className="bg-green-50">
                <IconCircleCheck className="mr-1 h-3 w-3" />
                Converted
              </Badge>
            )}
            {request.isCancelled && (
              <Badge variant="destructive">
                <IconCircleX className="mr-1 h-3 w-3" />
                Cancelled
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold mt-1">{request.title}</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/business-center/intake/${request.id}/edit`}>
              <IconEdit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          {!request.isConverted && !request.isCancelled && (
            <>
              {/* Assign PM dropdown */}
              {availablePMs.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={isTransitioning}>
                      <IconUserPlus className="mr-2 h-4 w-4" />
                      Assign PM
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {availablePMs.map((pm) => (
                      <DropdownMenuItem key={pm.id} onClick={() => handleAssignPm(pm.id)}>
                        {pm.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Stage transition dropdown */}
              {validTargetStages.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button disabled={isTransitioning}>
                      {isTransitioning && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <IconArrowRight className="mr-2 h-4 w-4" />
                      Move to Stage
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {validTargetStages.map((stage) => (
                      <DropdownMenuItem key={stage} onClick={() => handleTransition(stage)}>
                        {REQUEST_STAGE_LABELS[stage]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Cancel button */}
              <Button variant="destructive" onClick={handleCancel} disabled={isTransitioning}>
                <IconCircleX className="mr-2 h-4 w-4" />
                Cancel Request
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stage & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Stage</span>
                <Badge
                  variant={
                    agingStatus === 'critical'
                      ? 'destructive'
                      : agingStatus === 'warning'
                        ? 'outline'
                        : 'secondary'
                  }
                  className="text-base"
                >
                  {agingStatus !== 'normal' && <IconAlertTriangle className="mr-1 h-4 w-4" />}
                  {REQUEST_STAGE_LABELS[request.stage]}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <IconClock className="h-4 w-4" />
                  <span>Time in stage: {formatTimeInStage(request.stageEnteredAt)}</span>
                </div>
              </div>

              {/* Stage-specific actions */}
              {request.stage === 'on_hold' && (
                <div className="mt-4 p-4 rounded-lg border bg-muted/50">
                  <p className="text-sm font-medium mb-2">On Hold</p>
                  {request.holdReason && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Reason: {request.holdReason}
                    </p>
                  )}
                  <Button size="sm" onClick={handleResume} disabled={isTransitioning}>
                    Resume Request
                  </Button>
                </div>
              )}

              {request.stage === 'estimation' && request.storyPoints === null && (
                <div className="mt-4 p-4 rounded-lg border bg-muted/50">
                  <p className="text-sm font-medium mb-2">Awaiting Estimation</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    This request needs to be estimated before it can be marked as ready.
                  </p>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/business-center/intake/${request.id}/estimate`}>
                      Submit Estimation
                    </Link>
                  </Button>
                </div>
              )}

              {request.stage === 'ready' && (
                <div className="mt-4 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                  <p className="text-sm font-medium mb-2">Ready for Conversion</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    This request is estimated and ready to be converted to a Project or Ticket.
                  </p>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/business-center/intake/${request.id}/convert`}>
                      Convert Request
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{request.description}</p>
            </CardContent>
          </Card>

          {/* Business Justification */}
          {request.businessJustification && (
            <Card>
              <CardHeader>
                <CardTitle>Business Justification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{request.businessJustification}</p>
              </CardContent>
            </Card>
          )}

          {/* Steps to Reproduce (for bugs) */}
          {request.stepsToReproduce && (
            <Card>
              <CardHeader>
                <CardTitle>Steps to Reproduce</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{request.stepsToReproduce}</p>
              </CardContent>
            </Card>
          )}

          {/* Dependencies */}
          {request.dependencies && (
            <Card>
              <CardHeader>
                <CardTitle>Dependencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{request.dependencies}</p>
              </CardContent>
            </Card>
          )}

          {/* History Timeline */}
          {request.history && request.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.history.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.actor.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(entry.actor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{entry.actor.name}</span>{' '}
                          <span className="text-muted-foreground">{entry.action}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Metadata */}
        <div className="space-y-6">
          {/* Request Info */}
          <Card>
            <CardHeader>
              <CardTitle>Request Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <Badge variant="outline">{REQUEST_TYPE_LABELS[request.type]}</Badge>
              </div>

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <div className="flex items-center gap-1 text-sm">
                  <IconCalendarEvent className="h-4 w-4 text-muted-foreground" />
                  {formatDate(request.createdAt)}
                </div>
              </div>

              {request.desiredDeliveryDate && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">Desired Delivery</p>
                    <div className="flex items-center gap-1 text-sm">
                      <IconCalendarEvent className="h-4 w-4 text-muted-foreground" />
                      {new Date(request.desiredDeliveryDate).toLocaleDateString()}
                    </div>
                  </div>
                </>
              )}

              {request.tags && request.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {request.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <IconTag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Estimation */}
          {request.storyPoints !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Estimation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Story Points</p>
                  <p className="text-2xl font-bold">{request.storyPoints}</p>
                </div>

                {request.confidence && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <Badge variant="outline">{CONFIDENCE_LABELS[request.confidence]}</Badge>
                    </div>
                  </>
                )}

                {request.estimationNotes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="text-sm">{request.estimationNotes}</p>
                    </div>
                  </>
                )}

                {request.estimatedAt && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated On</p>
                      <p className="text-sm">{formatDate(request.estimatedAt)}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* People */}
          <Card>
            <CardHeader>
              <CardTitle>People</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Requester</p>
                {request.requester ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={request.requester.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(request.requester.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{request.requester.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unknown</span>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground mb-2">Assigned PM</p>
                {request.assignedPm ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={request.assignedPm.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(request.assignedPm.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{request.assignedPm.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconUser className="h-4 w-4" />
                    <span className="text-sm">Unassigned</span>
                  </div>
                )}
              </div>

              {request.estimator && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Estimator</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={request.estimator.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(request.estimator.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{request.estimator.name}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Related Entities */}
          {(request.client || request.relatedProject) && (
            <Card>
              <CardHeader>
                <CardTitle>Related</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.client && (
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="text-sm font-medium">{request.client.name}</p>
                  </div>
                )}

                {request.relatedProject && (
                  <>
                    {request.client && <Separator />}
                    <div>
                      <p className="text-xs text-muted-foreground">Related Project</p>
                      <Link
                        href={`/dashboard/business-center/projects/${request.relatedProject.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {request.relatedProject.name}
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
