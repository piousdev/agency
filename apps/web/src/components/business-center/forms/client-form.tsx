'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { clientTypeOptions } from '@/lib/schemas';
import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';

interface ClientFormProps {
  client?: {
    id: string;
    name: string;
    type: string;
    email: string;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
    notes?: string | null;
    active: boolean;
  };
  mode: 'create' | 'edit';
  redirectPath?: string;
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string; clientId?: string }>;
}

export function ClientForm({ client, mode, redirectPath, onSubmit }: ClientFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Form state for controlled inputs
  const [type, setType] = useState(client?.type ?? 'creative');
  const [active, setActive] = useState(client?.active ?? true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('type', type);
    formData.set('active', active.toString());

    try {
      const result = await onSubmit(formData);
      if (result.success && result.clientId) {
        router.push(redirectPath || `/dashboard/business-center/clients`);
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>Enter the client details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Client Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={client?.name ?? ''}
              placeholder="Company or organization name"
              required
            />
            {errors?.name && <p className="text-destructive text-sm">{errors.name[0]}</p>}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Client Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {clientTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={client?.email ?? ''}
              placeholder="contact@company.com"
              required
            />
            {errors?.email && <p className="text-destructive text-sm">{errors.email[0]}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={client?.phone ?? ''}
              placeholder="+1 234 567 8900"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={client?.website ?? ''}
              placeholder="https://company.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address & Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
          <CardDescription>Address and internal notes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={client?.address ?? ''}
              placeholder="Full mailing address"
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={client?.notes ?? ''}
              placeholder="Notes about this client (not visible to client)"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status (edit mode only) */}
      {mode === 'edit' && (
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Control client visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">Active</Label>
                <p className="text-muted-foreground text-sm">
                  Inactive clients are hidden from selectors
                </p>
              </div>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Client' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
