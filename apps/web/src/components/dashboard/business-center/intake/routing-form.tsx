'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowLeft, IconLoader2, IconBriefcase, IconTicket } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { convertRequest } from '@/lib/actions/business-center/requests';
import type { RequestWithRelations } from '@/lib/api/requests/types';
import type { Project } from '@/lib/api/projects/types';

// Routing threshold: requests with more story points become projects
const PROJECT_THRESHOLD = 5;

type ConvertTo = 'project' | 'ticket';

interface RoutingFormProps {
  request: RequestWithRelations;
  availableProjects: Project[];
}

function getRecommendedRoute(storyPoints: number): ConvertTo {
  return storyPoints >= PROJECT_THRESHOLD ? 'project' : 'ticket';
}

export function RoutingForm({ request, availableProjects }: RoutingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recommendedRoute = getRecommendedRoute(request.storyPoints ?? 0);
  const [convertTo, setConvertTo] = useState<ConvertTo>(recommendedRoute);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const handleConvert = async () => {
    if (convertTo === 'ticket' && !selectedProjectId) {
      toast.error('Please select a project for the ticket');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await convertRequest(request.id, {
        destinationType: convertTo,
        projectId: convertTo === 'ticket' ? selectedProjectId : undefined,
        overrideRouting: convertTo !== recommendedRoute,
      });

      if (result.success) {
        toast.success(`Request converted to ${convertTo === 'project' ? 'Project' : 'Ticket'}`);

        // Redirect to the created entity
        if (result.data.convertedToType === 'project') {
          router.push(`/dashboard/business-center/projects/${result.data.convertedToId}`);
        } else if (result.data.convertedToType === 'ticket') {
          router.push('/dashboard/business-center/intake-queue');
        } else {
          router.push('/dashboard/business-center/intake');
        }
      } else {
        toast.error(result.error || 'Failed to convert request');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/business-center/intake/${request.id}`)}
          className="mb-4"
        >
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back to Request
        </Button>
        <h1 className="text-2xl font-bold">Convert Request</h1>
        <p className="text-muted-foreground">
          Convert &quot;{request.title}&quot; to a Project or Ticket
        </p>
      </div>

      {/* Request Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Request Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Story Points:</span>
              <span className="ml-2 font-medium">{request.storyPoints}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Confidence:</span>
              <span className="ml-2 font-medium capitalize">{request.confidence}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Priority:</span>
              <span className="ml-2 font-medium capitalize">{request.priority}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 font-medium capitalize">{request.type.replace('_', ' ')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Routing Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle>Routing Recommendation</CardTitle>
          <CardDescription>
            Based on {request.storyPoints} story points, this request is recommended to become a{' '}
            <span className="font-medium">
              {recommendedRoute === 'project' ? 'Project' : 'Ticket'}
            </span>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-muted/50 text-sm">
            <p>
              <strong>Routing Rule:</strong> Requests with {PROJECT_THRESHOLD}+ story points become
              Projects. Smaller requests become Tickets attached to an existing Project.
            </p>
          </div>

          {/* Conversion Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Convert To</Label>
            <RadioGroup
              value={convertTo}
              onValueChange={(value) => setConvertTo(value as ConvertTo)}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="relative">
                <RadioGroupItem value="project" id="project" className="peer sr-only" />
                <Label
                  htmlFor="project"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <IconBriefcase className="mb-3 h-6 w-6" />
                  <span className="font-medium">Project</span>
                  <span className="text-xs text-muted-foreground">Standalone work item</span>
                  {recommendedRoute === 'project' && (
                    <Badge variant="secondary" className="mt-2">
                      Recommended
                    </Badge>
                  )}
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem value="ticket" id="ticket" className="peer sr-only" />
                <Label
                  htmlFor="ticket"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <IconTicket className="mb-3 h-6 w-6" />
                  <span className="font-medium">Ticket</span>
                  <span className="text-xs text-muted-foreground">Part of existing project</span>
                  {recommendedRoute === 'ticket' && (
                    <Badge variant="secondary" className="mt-2">
                      Recommended
                    </Badge>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Project Selection (for Ticket) */}
          {convertTo === 'ticket' && (
            <div className="space-y-2">
              <Label>Select Project *</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No projects available
                    </SelectItem>
                  ) : (
                    availableProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {availableProjects.length === 0 && (
                <p className="text-sm text-destructive">
                  No projects available. Please create a project first or convert to Project
                  instead.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/business-center/intake/${request.id}`)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConvert}
              disabled={isSubmitting || (convertTo === 'ticket' && !selectedProjectId)}
            >
              {isSubmitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Convert to {convertTo === 'project' ? 'Project' : 'Ticket'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
