'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClientSelect, type ClientOption } from './client-select';
import { StatusSelect } from './status-select';
import { PrioritySelect } from './priority-select';
import type { ProjectWithRelations } from '@/lib/api/projects/types';
import type { ProjectActionState } from '@/app/(default)/dashboard/projects/actions';
import {
  createProjectAction,
  updateProjectAction,
} from '@/app/(default)/dashboard/projects/actions';
import {
  IconLoader2,
  IconAlertCircle,
  IconFolder,
  IconLink,
  IconNote,
  IconSettings,
} from '@tabler/icons-react';

interface ProjectFormProps {
  project?: ProjectWithRelations & {
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    repositoryUrl?: string | null;
    productionUrl?: string | null;
    stagingUrl?: string | null;
    notes?: string | null;
    startedAt?: string | null;
  };
  clients: ClientOption[];
  mode: 'create' | 'edit';
  redirectPath?: string;
}

const initialState: ProjectActionState = {
  success: false,
  message: '',
};

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b mb-6">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ProjectForm({ project, clients, mode, redirectPath }: ProjectFormProps) {
  const router = useRouter();

  // Controlled state for selects (using string type for compatibility with Select components)
  const [clientId, setClientId] = useState(project?.clientId ?? '');
  const [status, setStatus] = useState<string>(project?.status ?? 'proposal');
  const [priority, setPriority] = useState<string>(project?.priority ?? 'medium');
  const [completion, setCompletion] = useState([project?.completionPercentage ?? 0]);

  // Bind the action with projectId for edit mode
  const boundAction =
    mode === 'edit' && project ? updateProjectAction.bind(null, project.id) : createProjectAction;

  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  // Redirect on success
  useEffect(() => {
    if (state.success && state.projectId) {
      router.push(redirectPath || `/dashboard/business-center/projects/${state.projectId}`);
    }
  }, [state.success, state.projectId, router, redirectPath]);

  return (
    <form action={formAction} className="space-y-10">
      {/* Error Alert */}
      {state.message && !state.success && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Hidden inputs for controlled values */}
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="priority" value={priority} />
      <input type="hidden" name="completionPercentage" value={completion[0]} />

      {/* Project Details Section */}
      <section>
        <SectionHeader
          icon={IconFolder}
          title="Project Details"
          description="Basic information about the project"
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={project?.name ?? ''}
                placeholder="Enter project name"
                className="h-11"
                required
              />
              {state.errors?.name && (
                <p className="text-destructive text-sm">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">Client *</Label>
              <ClientSelect
                value={clientId}
                onValueChange={setClientId}
                clients={clients}
                placeholder="Select client"
                showType
                className="h-11"
              />
              {state.errors?.clientId && (
                <p className="text-destructive text-sm">{state.errors.clientId[0]}</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description ?? ''}
              placeholder="Describe the project scope and objectives..."
              className="min-h-[136px] resize-none"
            />
            {state.errors?.description && (
              <p className="text-destructive text-sm">{state.errors.description[0]}</p>
            )}
          </div>
        </div>
      </section>

      {/* Status & Progress Section */}
      <section>
        <SectionHeader
          icon={IconSettings}
          title="Status & Progress"
          description="Track project status, priority, and completion"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <StatusSelect
              type="project"
              value={status}
              onValueChange={setStatus}
              placeholder="Select status"
              className="h-11"
            />
            {state.errors?.status && (
              <p className="text-destructive text-sm">{state.errors.status[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <PrioritySelect
              type="project"
              value={priority}
              onValueChange={setPriority}
              placeholder="Select priority"
              className="h-11"
            />
            {state.errors?.priority && (
              <p className="text-destructive text-sm">{state.errors.priority[0]}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="completionPercentage">Completion</Label>
              <span className="text-sm font-medium tabular-nums">{completion[0]}%</span>
            </div>
            <Slider
              id="completionPercentage"
              value={completion}
              onValueChange={setCompletion}
              max={100}
              step={5}
              className="py-2"
            />
          </div>
        </div>
      </section>

      {/* Project Links Section */}
      <section>
        <SectionHeader
          icon={IconLink}
          title="Project Links"
          description="Repository and deployment URLs"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="repositoryUrl">Repository URL</Label>
            <Input
              id="repositoryUrl"
              name="repositoryUrl"
              type="url"
              defaultValue={project?.repositoryUrl ?? ''}
              placeholder="https://github.com/..."
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stagingUrl">Staging URL</Label>
            <Input
              id="stagingUrl"
              name="stagingUrl"
              type="url"
              defaultValue={project?.stagingUrl ?? ''}
              placeholder="https://staging.example.com"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productionUrl">Production URL</Label>
            <Input
              id="productionUrl"
              name="productionUrl"
              type="url"
              defaultValue={project?.productionUrl ?? ''}
              placeholder="https://example.com"
              className="h-11"
            />
          </div>
        </div>
      </section>

      {/* Internal Notes Section */}
      <section>
        <SectionHeader
          icon={IconNote}
          title="Internal Notes"
          description="Private notes visible only to your team"
        />
        <Textarea
          id="notes"
          name="notes"
          defaultValue={project?.notes ?? ''}
          placeholder="Add any internal notes, context, or important details about this project..."
          className="min-h-[120px]"
        />
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Project' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
