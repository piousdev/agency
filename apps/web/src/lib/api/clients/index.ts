/**
 * Clients API client
 * Centralized exports for all client-related API operations
 */

export { listClients } from './list';
export { getClient } from './get';
export { createClient, type CreateClientResponse } from './create';
export { updateClient, type UpdateClientResponse } from './update';
export type {
  Client,
  ClientDetail,
  ClientProject,
  ClientTicket,
  ClientStats,
  ClientsListResponse,
  ClientResponse,
} from './types';
