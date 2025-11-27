import { describe, it, expect, vi, beforeEach } from 'vitest';

import { serverFetch } from '../../api-client';
import { getUserPermissions } from '../permission-checks';

// Mock the api-client module
vi.mock('../../api-client');

describe('getUserPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return permissions on success', async () => {
    vi.mocked(serverFetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ permissions: ['ticket:create'] }),
    } as Response);

    const permissions = await getUserPermissions('user-123');
    expect(permissions).toEqual(['ticket:create']);
    expect(serverFetch).toHaveBeenCalledWith('/api/users/user-123/permissions');
  });

  it('should return empty array on API failure (fail closed)', async () => {
    // Simulate 500 error
    vi.mocked(serverFetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    const permissions = await getUserPermissions('user-123');

    // Should return empty array, NOT fallback to editor permissions
    expect(permissions).toEqual([]);
  });

  it('should return empty array on network error', async () => {
    vi.mocked(serverFetch).mockRejectedValue(new Error('Network error'));

    const permissions = await getUserPermissions('user-123');
    expect(permissions).toEqual([]);
  });

  it('should return empty array if response has no permissions', async () => {
    vi.mocked(serverFetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}), // No permissions field
    } as Response);

    const permissions = await getUserPermissions('user-123');
    expect(permissions).toEqual([]);
  });
});
