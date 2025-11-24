'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sprintStatusOptions, type SprintStatus } from '@/lib/schemas/sprint';
import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';

interface SprintFormData {
  id: string;
  projectId: string;
  name: string;
  goal?: string | null;
  status: SprintStatus;
  startDate?: string | null;
  endDate?: string | null;
  plannedPoints: number;
  sprintNumber?: number | null;
}

interface SprintFormProps {
  sprint?: SprintFormData;
  projectId: string;
  mode: 'create' | 'edit';
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string; sprintId?: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SprintForm({
  sprint,
  projectId,
  mode,
  onSubmit,
  onSuccess,
  onCancel,
}: SprintFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SprintStatus>(sprint?.status ?? 'planning');

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
    return isoString.split('T')[0] ?? '';
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
        <Label htmlFor="name">Sprint Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={sprint?.name ?? ''}
          placeholder="e.g., Sprint 1, January Sprint"
          required
          maxLength={200}
        />
      </div>

      {/* Goal */}
      <div className="space-y-2">
        <Label htmlFor="goal">Sprint Goal</Label>
        <Textarea
          id="goal"
          name="goal"
          defaultValue={sprint?.goal ?? ''}
          placeholder="What is the objective of this sprint?"
          rows={3}
          maxLength={2000}
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as SprintStatus)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {sprintStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={formatDateForInput(sprint?.startDate)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={formatDateForInput(sprint?.endDate)}
          />
        </div>
      </div>

      {/* Planned Points */}
      <div className="space-y-2">
        <Label htmlFor="plannedPoints">Planned Story Points</Label>
        <Input
          id="plannedPoints"
          name="plannedPoints"
          type="number"
          min={0}
          defaultValue={sprint?.plannedPoints ?? 0}
        />
        <p className="text-xs text-muted-foreground">Total story points planned for this sprint</p>
      </div>

      {/* Sprint Number */}
      <div className="space-y-2">
        <Label htmlFor="sprintNumber">Sprint Number</Label>
        <Input
          id="sprintNumber"
          name="sprintNumber"
          type="number"
          min={1}
          defaultValue={sprint?.sprintNumber ?? ''}
          placeholder="Auto-generated if empty"
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to auto-generate based on existing sprints
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Sprint' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
