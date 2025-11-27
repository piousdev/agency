/**
 * Unit tests for requirePermission in session.ts
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { checkUserPermission } from '../permission-checks';
import { Permissions } from '../permissions-constants';
import { requirePermission, type SessionData } from '../session';

// Mock Next.js modules
vi.mock('next/headers');
vi.mock('next/navigation');

// Mock permission checks
vi.mock('../permission-checks', () => ({
  checkUserPermission: vi.fn(),
}));

describe('requirePermission (session.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.mocked(redirect).mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT: ${url}`);
    });
  });

  const mockSessionData: SessionData = {
    session: {
      id: 'session-123',
      userId: 'user-123',
      expiresAt: '2025-12-31T23:59:59.000Z',
      token: 'token-abc',
    },
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      image: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      isInternal: false,
    },
  };

  const setupAuthenticatedSession = (isInternal = false) => {
    const session = {
      ...mockSessionData,
      user: {
        ...mockSessionData.user,
        isInternal,
      },
    };

    vi.mocked(headers).mockResolvedValue(
      new Map([['cookie', 'auth_session=valid']]) as unknown as Headers
    );
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(session),
    } as Response);

    return session;
  };

  it('should return session when user is internal (bypass check)', async () => {
    const session = setupAuthenticatedSession(true);

    const result = await requirePermission(Permissions.TICKET_CREATE);

    expect(result).toEqual(session);
    // Should NOT call checkUserPermission
    expect(checkUserPermission).not.toHaveBeenCalled();
  });

  it('should return session when user has permission', async () => {
    const session = setupAuthenticatedSession(false);
    vi.mocked(checkUserPermission).mockResolvedValue(true);

    const result = await requirePermission(Permissions.TICKET_CREATE);

    expect(result).toEqual(session);
    expect(checkUserPermission).toHaveBeenCalledWith(session.user.id, Permissions.TICKET_CREATE);
  });

  it('should throw error when user lacks permission', async () => {
    const session = setupAuthenticatedSession(false);
    vi.mocked(checkUserPermission).mockResolvedValue(false);

    await expect(requirePermission(Permissions.TICKET_CREATE)).rejects.toThrow(
      `Permission denied: ${Permissions.TICKET_CREATE}`
    );

    expect(checkUserPermission).toHaveBeenCalledWith(session.user.id, Permissions.TICKET_CREATE);
  });

  it('should redirect when not authenticated', async () => {
    vi.mocked(headers).mockResolvedValue(new Map() as unknown as Headers);
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(requirePermission(Permissions.TICKET_CREATE)).rejects.toThrow();
    expect(redirect).toHaveBeenCalledWith('/login');
    expect(checkUserPermission).not.toHaveBeenCalled();
  });
});
