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

export interface ClientsListResponse {
  success: boolean;
  data: Client[];
}
