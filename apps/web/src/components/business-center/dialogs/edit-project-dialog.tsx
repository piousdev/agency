'use client';

import { useState } from 'react';

import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';

import { ClientSelect, type ClientOption } from '@/components/business-center/forms/client-select';
import { PrioritySelect } from '@/components/business-center/forms/priority-select';
import { StatusSelect } from '@/components/business-center/forms/status-select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { updateProjectFullAction } from '@/lib/actions/business-center/projects';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority?: string;
  clientId: string;
  completionPercentage: number;
  repositoryUrl?: string | null;
  productionUrl?: string | null;
  stagingUrl?: string | null;
  notes?: string | null;
}

interface EditProjectDialogProps {
  project: Project;
  clients: ClientOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditProjectDialog({
  project,
  clients,
  open,
  onOpenChange,
  onSuccess,
}: EditProjectDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [status, setStatus] = useState(project.status);
  const [priority, setPriority] = useState(project.priority ?? 'medium');
  const [clientId, setClientId] = useState(project.clientId);
  const [completionPercentage, setCompletionPercentage] = useState([project.completionPercentage]);
  const [repositoryUrl, setRepositoryUrl] = useState(project.repositoryUrl);
  const [productionUrl, setProductionUrl] = useState(project.productionUrl);
  const [stagingUrl, setStagingUrl] = useState(project.stagingUrl);
  const [notes, setNotes] = useState(project.notes);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData();
    formData.set('name', name);
    formData.set('description', description);
    formData.set('status', status);
    formData.set('priority', priority);
    formData.set('clientId', clientId);
    formData.set('completionPercentage', completionPercentage[0]?.toString() ?? '0');
    if (repositoryUrl) formData.set('repositoryUrl', repositoryUrl);
    if (productionUrl) formData.set('productionUrl', productionUrl);
    if (stagingUrl) formData.set('stagingUrl', stagingUrl);
    if (notes) formData.set('notes', notes);

    try {
      const result = await updateProjectFullAction(project.id, formData);
      if (result.success) {
        onOpenChange(false);
        onSuccess?.();
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update the project details below</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project"
              rows={3}
            />
          </div>

          {/* Client */}
          <div className="space-y-2">
            <Label htmlFor="clientId">Client *</Label>
            <ClientSelect
              value={clientId}
              onValueChange={setClientId}
              clients={clients}
              placeholder="Select client"
              showType
            />
          </div>

          {/* Status & Priority */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <StatusSelect
                type="project"
                value={status}
                onValueChange={setStatus}
                placeholder="Select status"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <PrioritySelect
                type="project"
                value={priority}
                onValueChange={setPriority}
                placeholder="Select priority"
              />
            </div>
          </div>

          {/* Completion */}
          <div className="space-y-2">
            <Label htmlFor="completionPercentage">Completion: {completionPercentage[0]}%</Label>
            <Slider
              id="completionPercentage"
              value={completionPercentage}
              onValueChange={setCompletionPercentage}
              max={100}
              step={5}
            />
          </div>

          {/* Links */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repositoryUrl">Repository URL</Label>
              <Input
                id="repositoryUrl"
                type="url"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productionUrl">Production URL</Label>
              <Input
                id="productionUrl"
                type="url"
                value={productionUrl}
                onChange={(e) => setProductionUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stagingUrl">Staging URL</Label>
              <Input
                id="stagingUrl"
                type="url"
                value={stagingUrl}
                onChange={(e) => setStagingUrl(e.target.value)}
                placeholder="https://staging..."
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes..."
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
