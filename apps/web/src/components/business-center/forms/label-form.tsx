'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { IconLoader2, IconAlertCircle, IconCheck } from '@tabler/icons-react';

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
import { labelColors, labelScopes, type LabelScope } from '@/lib/schemas/label';
import { cn } from '@/lib/utils';

interface LabelFormData {
  id: string;
  name: string;
  color: string;
  description?: string | null;
  scope: LabelScope;
}

interface LabelFormProps {
  label?: LabelFormData;
  mode: 'create' | 'edit';
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string; labelId?: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LabelForm({ label, mode, onSubmit, onSuccess, onCancel }: LabelFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(label?.color ?? '#6B7280');
  const [scope, setScope] = useState<LabelScope>(label?.scope ?? 'global');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('color', selectedColor);
    formData.set('scope', scope);

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
        <Label htmlFor="name">Label Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={label?.name}
          placeholder="e.g., High Priority, In Review"
          required
          maxLength={100}
        />
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {labelColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(color.value)}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-all hover:scale-110',
                selectedColor === color.value
                  ? 'border-foreground ring-2 ring-offset-2'
                  : 'border-transparent'
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {selectedColor === color.value && (
                <IconCheck
                  className="h-4 w-4 mx-auto"
                  style={{
                    color: isLightColor(color.value) ? '#000' : '#fff',
                  }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Label htmlFor="customColor" className="text-sm text-muted-foreground">
            Custom:
          </Label>
          <Input
            id="customColor"
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="h-8 w-16 p-1 cursor-pointer"
          />
          <span className="text-sm text-muted-foreground">{selectedColor}</span>
        </div>
      </div>

      {/* Scope */}
      <div className="space-y-2">
        <Label htmlFor="scope">Scope</Label>
        <Select value={scope} onValueChange={(value) => setScope(value as LabelScope)}>
          <SelectTrigger>
            <SelectValue placeholder="Select scope" />
          </SelectTrigger>
          <SelectContent>
            {labelScopes.map((scopeOption) => (
              <SelectItem key={scopeOption} value={scopeOption}>
                {scopeOption.charAt(0).toUpperCase() + scopeOption.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Global labels can be used on both tickets and projects
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={label?.description}
          placeholder="Optional description for this label"
          rows={2}
          maxLength={500}
        />
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: selectedColor,
              color: isLightColor(selectedColor) ? '#000' : '#fff',
            }}
          >
            {label?.name ?? 'Label Name'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Label' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

/**
 * Determine if a color is light (for text contrast)
 */
function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
