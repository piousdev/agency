'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import { milestoneStatusOptions, type MilestoneStatus } from '@/lib/schemas/milestone';


interface MilestoneFormData {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  status: MilestoneStatus;
  dueDate?: string | null;
  sortOrder: number;
}

interface MilestoneFormProps {
  milestone?: MilestoneFormData;
  projectId: string;
  mode: 'create' | 'edit';
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string; milestoneId?: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MilestoneForm({
  milestone,
  projectId,
  mode,
  onSubmit,
  onSuccess,
  onCancel,
}: MilestoneFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<MilestoneStatus>(milestone?.status ?? 'pending');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('projectId', projectId);
    formData.set('status', status);

    try {
      const result = await onSubmit(formData);
      if (result.success) {
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const isoString = date.toISOString();
    return isoString.split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Milestone Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={milestone?.name}
          placeholder="e.g., MVP Launch, Beta Release"
          required
          maxLength={200}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={milestone?.description}
          placeholder="Optional description of milestone goals and deliverables"
          rows={3}
          maxLength={2000}
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as MilestoneStatus)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {milestoneStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          defaultValue={formatDateForInput(milestone?.dueDate)}
        />
        <p className="text-xs text-muted-foreground">When this milestone should be completed</p>
      </div>

      {/* Sort Order */}
      <div className="space-y-2">
        <Label htmlFor="sortOrder">Sort Order</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={milestone?.sortOrder}
        />
        <p className="text-xs text-muted-foreground">Lower numbers appear first in the list</p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Milestone' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
