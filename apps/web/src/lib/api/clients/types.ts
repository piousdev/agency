/**
 * Type definitions for clients API
 */

export interface Client {
  id: string;
  name: string;
  type: 'creative' | 'software' | 'full_service';
  email: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  notes?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProject {
  id: string;
  name: string;
  status: string;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientTicket {
  id: string;
  ticketNumber: string | null;
  title: string;
  status: string;
  priority: string;
  type: string;
  createdAt: string;
}

export interface ClientStats {
  projects: {
    total: number;
    active: number;
    delivered: number;
  };
  tickets: {
    total: number;
    open: number;
    resolved: number;
  };
}

export interface ClientDetail extends Client {
  projects: ClientProject[];
  tickets: ClientTicket[];
  stats: ClientStats;
}

export interface ClientsListResponse {
  success: boolean;
  data: Client[];
}

export interface ClientResponse {
  success: boolean;
  data: ClientDetail;
}
