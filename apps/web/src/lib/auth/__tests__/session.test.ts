/**
 * Unit tests for server-side session auth utilities
 * Tests requireAuth, requireRole, requireUser, isAuthenticated, etc.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  getSession,
  requireAuth,
  requireRole,
  requireUser,
  isAuthenticated,
  type SessionData,
} from '../session';

// Mock Next.js modules
vi.mock('next/headers');
vi.mock('next/navigation');

describe('Session Auth Utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Reset fetch mock
    global.fetch = vi.fn();
    // Configure redirect to throw (simulates Next.js behavior)
    vi.mocked(redirect).mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT: ${url}`);
    });
  });

  describe('getSession', () => {
    it('should return session data when authenticated', async () => {
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
          isInternal: true,
        },
      };

      // Mock headers
      vi.mocked(headers).mockResolvedValue(
        new Map([['cookie', 'auth_session=valid-session-cookie']]) as unknown as Headers
      );

      // Mock successful API response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessionData),
      } as Response);

      const session = await getSession();

      expect(session).toEqual(mockSessionData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/auth/get-session',
        expect.objectContaining({
          headers: {
            cookie: 'auth_session=valid-session-cookie',
          },
          cache: 'no-store',
        })
      );
    });

    it('should return null when not authenticated', async () => {
      vi.mocked(headers).mockResolvedValue(new Map() as unknown as Headers);

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      const session = await getSession();

      expect(session).toBeNull();
    });

    it('should return null when session data is invalid', async () => {
      vi.mocked(headers).mockResolvedValue(
        new Map([['cookie', 'auth_session=invalid']]) as unknown as Headers
      );

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' }),
      } as Response);

      const session = await getSession();

      expect(session).toBeNull();
    });

    it('should return null and log error when fetch fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        /* empty */
      });

      vi.mocked(headers).mockResolvedValue(new Map() as unknown as Headers);
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const session = await getSession();

      expect(session).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to get session:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('requireAuth', () => {
    it('should return session when authenticated', async () => {
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
        },
      };

      vi.mocked(headers).mockResolvedValue(
        new Map([['cookie', 'auth_session=valid']]) as unknown as Headers
      );
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessionData),
      } as Response);

      const session = await requireAuth();

      expect(session).toEqual(mockSessionData);
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should redirect to /login when not authenticated', async () => {
      vi.mocked(headers).mockResolvedValue(new Map() as unknown as Headers);
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(requireAuth()).rejects.toThrow();
      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('should redirect to /login with returnUrl when provided', async () => {
      vi.mocked(headers).mockResolvedValue(new Map() as unknown as Headers);
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(requireAuth('/dashboard')).rejects.toThrow();
      expect(redirect).toHaveBeenCalledWith('/login?returnUrl=%2Fdashboard');
    });
  });

  describe('requireRole', () => {
    it('should return session when user has internal role', async () => {
      const mockSessionData: SessionData = {
        session: {
          id: 'session-123',
          userId: 'user-123',
          expiresAt: '2025-12-31T23:59:59.000Z',
          token: 'token-abc',
        },
        user: {
          id: 'user-123',
          name: 'Internal User',
          email: 'internal@example.com',
          emailVerified: true,
          image: null,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          isInternal: true,
          role: 'internal',
        },
      };

      vi.mocked(headers).mockResolvedValue(
        new Map([['cookie', 'auth_session=valid']]) as unknown as Headers
      );
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessionData),
      } as Response);

      const session = await requireRole('internal');

      expect(session).toEqual(mockSessionData);
    });

    it('should throw error when user does not have internal role', async () => {
      const mockSessionData: SessionData = {
        session: {
          id: 'session-123',
          userId: 'user-123',
          expiresAt: '2025-12-31T23:59:59.000Z',
          token: 'token-abc',
        },
        user: {
          id: 'user-123',
          name: 'External User',
          email: 'external@example.com',
          emailVerified: true,
          image: null,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          isInternal: false,
        },
      };

      vi.mocked(headers).mockResolvedValue(
        new Map([['cookie', 'auth_session=valid']]) as unknown as Headers
      );
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessionData),
      } as Response);

      await expect(requireRole('internal')).rejects.toThrow('Insufficient permissions');
    });

    it('should redirect when not authenticated', async () => {
      vi.mocked(headers).mockResolvedValue(new Map() as unknown as Headers);
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(requireRole('internal')).rejects.toThrow();
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('requireUser', () => {
    it('should return user object when authenticated', async () => {
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
        },
      };

      vi.mocked(headers).mockResolvedValue(
        new Map([['cookie', 'auth_session=valid']]) as unknown as Headers
      );
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessionData),
      } as Response);

      const user = await requireUser();

      expect(user).toEqual(mockSessionData.user);
      expect(user).not.toHaveProperty('session');
    });

    it('should redirect when not authenticated', async () => {
      vi.mocked(headers).mockResolvedValue(new Map() as unknown as Headers);
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(requireUser()).rejects.toThrow();
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when authenticated', async () => {
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
        },
      };

      vi.mocked(headers).mockResolvedValue(
        new Map([['cookie', 'auth_session=valid']]) as unknown as Headers
      );
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessionData),
      } as Response);

      const authenticated = await isAuthenticated();

      expect(authenticated).toBe(true);
    });

    it('should return false when not authenticated', async () => {
      vi.mocked(headers).mockResolvedValue(new Map() as unknown as Headers);
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      const authenticated = await isAuthenticated();

      expect(authenticated).toBe(false);
    });
  });
});
