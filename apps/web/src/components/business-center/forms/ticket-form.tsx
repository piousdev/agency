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
import { ClientSelect, type ClientOption } from './client-select';
import { UserSelect, type UserOption } from './user-select';
import { StatusSelect } from './status-select';
import { PrioritySelect } from './priority-select';
import { ticketTypeOptions } from '@/lib/schemas';
import {
  IconLoader2,
  IconAlertCircle,
  IconTicket,
  IconUserCircle,
  IconSettings,
  IconCode,
} from '@tabler/icons-react';

interface TicketFormProps {
  ticket?: {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    priority: string;
    clientId: string;
    projectId?: string | null;
    assignedToId?: string | null;
    dueAt?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    contactName?: string | null;
    environment?: string | null;
    affectedUrl?: string | null;
  };
  clients: ClientOption[];
  users: UserOption[];
  mode: 'create' | 'edit';
  redirectPath?: string;
  defaultPriority?: string;
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string; ticketId?: string }>;
}

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

export function TicketForm({
  ticket,
  clients,
  users,
  mode,
  redirectPath,
  defaultPriority,
  onSubmit,
}: TicketFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Form state for controlled selects (using string type for compatibility)
  const [clientId, setClientId] = useState(ticket?.clientId ?? '');
  const [assignedToId, setAssignedToId] = useState(ticket?.assignedToId ?? '');
  const [type, setType] = useState<string>(ticket?.type ?? 'intake');
  const [status, setStatus] = useState<string>(ticket?.status ?? 'open');
  const [priority, setPriority] = useState<string>(ticket?.priority ?? defaultPriority ?? 'medium');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    // Add select values
    formData.set('clientId', clientId);
    formData.set('assignedToId', assignedToId);
    formData.set('type', type);
    formData.set('status', status);
    formData.set('priority', priority);

    try {
      const result = await onSubmit(formData);
      if (result.success && result.ticketId) {
        router.push(redirectPath || `/dashboard/business-center/intake-queue`);
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
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Ticket Details Section */}
      <section>
        <SectionHeader
          icon={IconTicket}
          title="Ticket Details"
          description="Basic information about the support request"
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={ticket?.title ?? ''}
                placeholder="Brief summary of the issue"
                className="h-11"
                required
              />
              {errors?.title && <p className="text-destructive text-sm">{errors.title[0]}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                {errors?.clientId && (
                  <p className="text-destructive text-sm">{errors.clientId[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={ticket?.description ?? ''}
              placeholder="Detailed description of the issue or request..."
              className="min-h-[136px] resize-none"
              required
            />
            {errors?.description && (
              <p className="text-destructive text-sm">{errors.description[0]}</p>
            )}
          </div>
        </div>
      </section>

      {/* Status & Assignment Section */}
      <section>
        <SectionHeader
          icon={IconSettings}
          title="Status & Assignment"
          description="Set status, priority, and assign team members"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mode === 'edit' && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <StatusSelect
                type="ticket"
                value={status}
                onValueChange={setStatus}
                placeholder="Select status"
                className="h-11"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <PrioritySelect
              type="ticket"
              value={priority}
              onValueChange={setPriority}
              placeholder="Select priority"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedToId">Assigned To</Label>
            <UserSelect
              value={assignedToId}
              onValueChange={setAssignedToId}
              users={users}
              placeholder="Select assignee"
              showCapacity
              allowUnassign
              className="h-11"
            />
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section>
        <SectionHeader
          icon={IconUserCircle}
          title="Contact Information"
          description="Contact details for external submissions"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              name="contactName"
              defaultValue={ticket?.contactName ?? ''}
              placeholder="John Doe"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={ticket?.contactEmail ?? ''}
              placeholder="john@example.com"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              defaultValue={ticket?.contactPhone ?? ''}
              placeholder="+1 234 567 8900"
              className="h-11"
            />
          </div>
        </div>
      </section>

      {/* Technical Context Section */}
      <section>
        <SectionHeader
          icon={IconCode}
          title="Technical Context"
          description="Environment and URL details for debugging"
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Input
              id="environment"
              name="environment"
              defaultValue={ticket?.environment ?? ''}
              placeholder="production, staging, development..."
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="affectedUrl">Affected URL</Label>
            <Input
              id="affectedUrl"
              name="affectedUrl"
              type="url"
              defaultValue={ticket?.affectedUrl ?? ''}
              placeholder="https://example.com/page"
              className="h-11"
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Ticket' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
