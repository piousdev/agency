'use client';

import { useActionState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';

import {
  createProjectAction,
  updateProjectAction,
} from '@/app/(default)/dashboard/projects/actions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { projectStatusOptions } from '@/lib/schemas/project';

import type { ProjectActionState } from '@/app/(default)/dashboard/projects/actions';
import type { Client } from '@/lib/api/clients/types';
import type { ProjectWithRelations } from '@/lib/api/projects/types';

interface ProjectFormProps {
  project?: ProjectWithRelations & {
    repositoryUrl?: string | null;
    productionUrl?: string | null;
    stagingUrl?: string | null;
    notes?: string | null;
    startedAt?: string | null;
  };
  clients: Client[];
  mode: 'create' | 'edit';
}

const initialState: ProjectActionState = {
  success: false,
  message: '',
};

export function ProjectForm({ project, clients, mode }: ProjectFormProps) {
  const router = useRouter();

  // Bind the action with projectId for edit mode
  const boundAction =
    mode === 'edit' && project ? updateProjectAction.bind(null, project.id) : createProjectAction;

  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  // Redirect on success
  useEffect(() => {
    if (state.success && state.projectId) {
      router.push(`/dashboard/projects/${state.projectId}`);
    }
  }, [state.success, state.projectId, router]);

  return (
    <form action={formAction} className="space-y-8">
      {/* Error Alert */}
      {state.message && !state.success && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the project details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={project?.name}
              placeholder="Enter project name"
              required
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description}
              placeholder="Project description..."
              rows={4}
            />
            {state.errors?.description && (
              <p className="text-sm text-destructive">{state.errors.description[0]}</p>
            )}
          </div>

          {/* Client */}
          <div className="space-y-2">
            <Label htmlFor="clientId">Client *</Label>
            <Select name="clientId" defaultValue={project?.clientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.clientId && (
              <p className="text-sm text-destructive">{state.errors.clientId[0]}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={project?.status ?? 'proposal'}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {projectStatusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.status && (
              <p className="text-sm text-destructive">{state.errors.status[0]}</p>
            )}
          </div>

          {/* Completion Percentage */}
          <div className="space-y-2">
            <Label htmlFor="completionPercentage">
              Completion: {project?.completionPercentage}%
            </Label>
            <Input
              type="range"
              id="completionPercentage"
              name="completionPercentage"
              min={0}
              max={100}
              defaultValue={project?.completionPercentage}
              className="w-full"
            />
            {state.errors?.completionPercentage && (
              <p className="text-sm text-destructive">{state.errors.completionPercentage[0]}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* URLs */}
      <Card>
        <CardHeader>
          <CardTitle>Project URLs</CardTitle>
          <CardDescription>Links to repositories and deployed environments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Repository URL */}
          <div className="space-y-2">
            <Label htmlFor="repositoryUrl">Repository URL</Label>
            <Input
              id="repositoryUrl"
              name="repositoryUrl"
              type="url"
              defaultValue={project?.repositoryUrl}
              placeholder="https://github.com/..."
            />
            {state.errors?.repositoryUrl && (
              <p className="text-sm text-destructive">{state.errors.repositoryUrl[0]}</p>
            )}
          </div>

          {/* Staging URL */}
          <div className="space-y-2">
            <Label htmlFor="stagingUrl">Staging URL</Label>
            <Input
              id="stagingUrl"
              name="stagingUrl"
              type="url"
              defaultValue={project?.stagingUrl}
              placeholder="https://staging.example.com"
            />
            {state.errors?.stagingUrl && (
              <p className="text-sm text-destructive">{state.errors.stagingUrl[0]}</p>
            )}
          </div>

          {/* Production URL */}
          <div className="space-y-2">
            <Label htmlFor="productionUrl">Production URL</Label>
            <Input
              id="productionUrl"
              name="productionUrl"
              type="url"
              defaultValue={project?.productionUrl}
              placeholder="https://example.com"
            />
            {state.errors?.productionUrl && (
              <p className="text-sm text-destructive">{state.errors.productionUrl[0]}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Project start and delivery dates</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {/* Started At */}
          <div className="space-y-2">
            <Label htmlFor="startedAt">Start Date</Label>
            <Input
              id="startedAt"
              name="startedAt"
              type="date"
              defaultValue={
                project?.startedAt ? new Date(project.startedAt).toISOString().split('T')[0] : ''
              }
            />
            {state.errors?.startedAt && (
              <p className="text-sm text-destructive">{state.errors.startedAt[0]}</p>
            )}
          </div>

          {/* Delivered At */}
          <div className="space-y-2">
            <Label htmlFor="deliveredAt">Delivery Date</Label>
            <Input
              id="deliveredAt"
              name="deliveredAt"
              type="date"
              defaultValue={
                project?.deliveredAt
                  ? new Date(project.deliveredAt).toISOString().split('T')[0]
                  : ''
              }
            />
            {state.errors?.deliveredAt && (
              <p className="text-sm text-destructive">{state.errors.deliveredAt[0]}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Internal Notes</CardTitle>
          <CardDescription>Notes visible only to internal team</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={project?.notes}
            placeholder="Internal notes..."
            rows={4}
          />
          {state.errors?.notes && (
            <p className="text-sm text-destructive">{state.errors.notes[0]}</p>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Project' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
