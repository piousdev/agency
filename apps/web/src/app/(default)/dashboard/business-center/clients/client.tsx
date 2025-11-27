'use client';

import { useState, useMemo, useCallback } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { IconPlus, IconChevronDown } from '@tabler/icons-react';

import { EditClientDialog, DeleteClientDialog } from '@/components/business-center/dialogs';
import { ViewSwitcher, type ViewMode } from '@/components/business-center/view-switcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGate, Permissions } from '@/lib/hooks/use-permissions';
import { clientTypeOptions } from '@/lib/schemas';

import { BusinessCenterHeader } from '../components/header';
import { ClientsCardsView } from './views/cards-view';
import { ClientsKanbanView } from './views/kanban-view';
import { ClientsTableView } from './views/table-view';

import type { Client } from '@/lib/api/clients/types';

type ClientType = 'all' | 'software' | 'creative' | 'full_service';

interface ClientsClientProps {
  clients: Client[];
  allClients: Client[];
}

const CLIENT_TYPES = [
  { value: 'software', label: 'Software' },
  { value: 'creative', label: 'Creative' },
  { value: 'full_service', label: 'Full Service' },
];

export function ClientsClient({ clients, allClients }: ClientsClientProps) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>('table');
  const [clientType, setClientType] = useState<ClientType>('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeFilterOpen, setTypeFilterOpen] = useState(true);

  // Get the base clients list (with or without inactive)
  const baseClients = showInactive ? allClients : clients;

  // Filter clients based on all criteria
  const filteredClients = useMemo(() => {
    return baseClients.filter((client) => {
      // Filter by client type tab
      if (clientType !== 'all' && client.type !== clientType) {
        return false;
      }

      // Filter by selected types (from filter panel)
      if (selectedTypes.length > 0 && !selectedTypes.includes(client.type)) {
        return false;
      }

      return true;
    });
  }, [baseClients, clientType, selectedTypes]);

  const activeFiltersCount = (selectedTypes.length > 0 ? 1 : 0) + (showInactive ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setShowInactive(false);
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Count clients by type for tab badges
  const softwareCount = baseClients.filter((c) => c.type === 'software').length;
  const creativeCount = baseClients.filter((c) => c.type === 'creative').length;
  const fullServiceCount = baseClients.filter((c) => c.type === 'full_service').length;

  const handleEdit = useCallback((client: Client) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  }, []);

  const handleViewDetail = useCallback(
    (client: Client) => {
      router.push(`/dashboard/business-center/clients/${client.id}`);
    },
    [router]
  );

  const handleDelete = useCallback((client: Client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleExport = () => {
    const headers = ['Name', 'Type', 'Email', 'Phone', 'Website', 'Status', 'Created'];
    const rows = filteredClients.map((c) => [
      c.name,
      clientTypeOptions.find((opt) => opt.value === c.type)?.label ?? c.type,
      c.email,
      c.phone,
      c.website,
      c.active ? 'Active' : 'Inactive',
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell ?? ''}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().split('T')[0] ?? 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterContent = (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h4 className="text-sm font-semibold">Filters</h4>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Include Inactive Toggle */}
      <div className="flex items-center justify-between py-3">
        <Label htmlFor="show-inactive" className="text-sm font-medium cursor-pointer">
          Include inactive
        </Label>
        <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
      </div>

      <Separator />

      {/* Type Section - Collapsible */}
      <Collapsible open={typeFilterOpen} onOpenChange={setTypeFilterOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-medium hover:text-foreground transition-colors">
          <span className="flex items-center gap-2">
            Type
            {selectedTypes.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {selectedTypes.length}
              </Badge>
            )}
          </span>
          <IconChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${typeFilterOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-3">
          <div className="flex flex-wrap gap-2">
            {CLIENT_TYPES.map((type) => {
              const isSelected = selectedTypes.includes(type.value);
              return (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <BusinessCenterHeader
        viewSwitcher={<ViewSwitcher currentView={view} onViewChange={setView} />}
        filterContent={filterContent}
        activeFilterCount={activeFiltersCount}
        onExport={handleExport}
        primaryAction={
          <PermissionGate permission={Permissions.CLIENT_CREATE} behavior="disable">
            <Button asChild>
              <Link href="/dashboard/business-center/clients/new">
                <IconPlus className="mr-2 h-4 w-4" />
                New Client
              </Link>
            </Button>
          </PermissionGate>
        }
      />

      {/* Client Type Tabs */}
      <Tabs value={clientType} onValueChange={(v: string) => setClientType(v as ClientType)}>
        <TabsList>
          <TabsTrigger value="all">
            All Clients
            <Badge variant="secondary" className="ml-2">
              {baseClients.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="software">
            Software
            <Badge variant="secondary" className="ml-2">
              {softwareCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="creative">
            Creative
            <Badge variant="secondary" className="ml-2">
              {creativeCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="full_service">
            Full Service
            <Badge variant="secondary" className="ml-2">
              {fullServiceCount}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Total Clients</p>
          <p className="text-2xl font-bold">{allClients.length}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Active</p>
          <p className="text-2xl font-bold">{clients.length}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Inactive</p>
          <p className="text-2xl font-bold">{allClients.length - clients.length}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Filtered</p>
          <p className="text-2xl font-bold">{filteredClients.length}</p>
        </div>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <ClientsTableView clients={filteredClients} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {/* Cards View */}
      {view === 'cards' && (
        <ClientsCardsView clients={filteredClients} onClientClick={handleViewDetail} />
      )}

      {/* Kanban View - grouped by type */}
      {view === 'kanban' && (
        <ClientsKanbanView
          clients={filteredClients}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
        />
      )}

      {/* Dialogs */}
      {selectedClient && (
        <>
          <EditClientDialog
            client={selectedClient}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={handleSuccess}
          />
          <DeleteClientDialog
            clientId={selectedClient.id}
            clientName={selectedClient.name}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  );
}
