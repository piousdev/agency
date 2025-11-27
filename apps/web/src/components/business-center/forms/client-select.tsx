'use client';

import { forwardRef } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface ClientOption {
  id: string;
  name: string;
  type?: string;
  active?: boolean;
}

interface ClientSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  clients: ClientOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showType?: boolean;
  filterActive?: boolean;
}

export const ClientSelect = forwardRef<HTMLButtonElement, ClientSelectProps>(
  (
    {
      value,
      onValueChange,
      clients,
      placeholder = 'Select client',
      disabled = false,
      className,
      showType = false,
      filterActive = true,
    },
    ref
  ) => {
    const filteredClients = filterActive ? clients.filter((c) => c.active !== false) : clients;

    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger ref={ref} className={cn('w-full', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredClients.length === 0 ? (
            <div className="text-muted-foreground px-2 py-1.5 text-sm">No clients available</div>
          ) : (
            filteredClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <div className="flex items-center gap-2">
                  <span>{client.name}</span>
                  {showType && client.type && (
                    <span className="text-muted-foreground text-xs capitalize">
                      ({client.type.replace('_', ' ')})
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    );
  }
);

ClientSelect.displayName = 'ClientSelect';
