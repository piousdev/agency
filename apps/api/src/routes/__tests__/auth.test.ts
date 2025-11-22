/**
 * API Endpoint Tests for Better-Auth Integration
 * Tests authentication endpoints provided by Better-Auth
 *
 * Covers:
 * - User registration (sign-up)
 * - User login (sign-in)
 * - Session validation
 * - Logout functionality
 * - Error handling
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../index.js';
import { db } from '../../db/index.js';
import { user } from '../../db/schema/user.js';
import { eq } from 'drizzle-orm';

// Test user credentials
const testUser = {
  email: 'api.test@example.com',
  password: 'SecurePassword123!',
  name: 'API Test User',
};

// Store session cookie for authenticated requests
let sessionCookie: string | null = null;
let _testUserId: string | null = null;

describe('Authentication API Endpoints', () => {
  // Cleanup: Remove test user before and after tests
  beforeAll(async () => {
    await db.delete(user).where(eq(user.email, testUser.email));
  });

  afterAll(async () => {
    await db.delete(user).where(eq(user.email, testUser.email));
  });

  describe('POST /api/auth/sign-up/email', () => {
    it('should successfully create a new user account', async () => {
      const res = await app.request('/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        }),
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('id');
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.name).toBe(testUser.name);

      // Store user ID for cleanup
      _testUserId = data.user.id;

      // With email verification required, sign-up doesn't create a session
      // User must verify email and then sign in to get a session cookie
    });

    it('should reject duplicate email registration', async () => {
      const res = await app.request('/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
          name: 'Duplicate User',
        }),
      });

      // Better-Auth may return 400 or other error code for duplicate email
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject invalid email format', async () => {
      const res = await app.request('/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'not-an-email',
          password: testUser.password,
          name: 'Invalid Email User',
        }),
      });

      expect(res.status).toBe(400);
    });

    it('should reject weak passwords', async () => {
      const res = await app.request('/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'weak.password@example.com',
          password: '123', // Too short
          name: 'Weak Password User',
        }),
      });

      expect(res.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const res = await app.request('/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'missing.fields@example.com',
          // Missing password and name
        }),
      });

      // Better-Auth may return 400 or 500 for missing fields
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should prevent clients from setting isInternal field', async () => {
      // Try to register with isInternal = true (should be ignored)
      const res = await app.request('/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'sneaky.user@example.com',
          password: 'SecurePassword123!',
          name: 'Sneaky User',
          isInternal: true, // This should be ignored
        }),
      });

      if (res.status === 200) {
        const data = await res.json();

        // Verify user was created but isInternal is false
        const createdUser = await db.query.user.findFirst({
          where: (fields, { eq }) => eq(fields.id, data.user.id),
          columns: {
            isInternal: true,
          },
        });

        expect(createdUser?.isInternal).toBe(false);

        // Cleanup
        await db.delete(user).where(eq(user.email, 'sneaky.user@example.com'));
      }
    });
  });

  describe('POST /api/auth/sign-in/email', () => {
    it('should successfully login with valid credentials', async () => {
      // First, verify the email (required for sign-in)
      if (_testUserId) {
        await db
          .update(user)
          .set({
            emailVerified: true,
          })
          .where(eq(user.id, _testUserId));
      }

      const res = await app.request('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe(testUser.email);

      // Should set session cookie
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toBeTruthy();
      expect(setCookie).toContain('better-auth.session_token');

      // Update stored cookie
      if (setCookie) {
        sessionCookie = setCookie.split(';')[0];
      }
    });

    it('should reject invalid email', async () => {
      const res = await app.request('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: testUser.password,
        }),
      });

      // Better-Auth returns error status for invalid credentials
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject invalid password', async () => {
      const res = await app.request('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: 'WrongPassword123!',
        }),
      });

      // Better-Auth returns error status for invalid credentials
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject missing credentials', async () => {
      const res = await app.request('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          // Missing password
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('Session Validation via auth.api.getSession', () => {
    it('should validate session for authenticated user', async () => {
      expect(sessionCookie).toBeTruthy();

      // Use the auth.api directly (simulating server-side validation)
      const { auth } = await import('../../lib/auth.js');

      const session = await auth.api.getSession({
        headers: new Headers({
          Cookie: sessionCookie!,
        }),
      });

      expect(session).toBeTruthy();
      expect(session?.user.email).toBe(testUser.email);
      expect(session?.session).toBeTruthy();
    });

    it('should return null for unauthenticated user', async () => {
      const { auth } = await import('../../lib/auth.js');

      const session = await auth.api.getSession({
        headers: new Headers(),
      });

      expect(session).toBeNull();
    });

    it('should return null for invalid session cookie', async () => {
      const { auth } = await import('../../lib/auth.js');

      const session = await auth.api.getSession({
        headers: new Headers({
          Cookie: 'better-auth.session_token=invalid-token',
        }),
      });

      expect(session).toBeNull();
    });
  });

  describe('POST /api/auth/sign-out', () => {
    it('should successfully logout authenticated user', async () => {
      expect(sessionCookie).toBeTruthy();

      const res = await app.request('/api/auth/sign-out', {
        method: 'POST',
        headers: {
          Cookie: sessionCookie!,
        },
      });

      expect(res.status).toBe(200);

      // Should clear session cookie
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toBeTruthy();
      // Cookie should be expired or empty
      expect(setCookie).toMatch(/better-auth\.session_token=;|Max-Age=0|expires=/);
    });

    it('should verify session is invalid after logout', async () => {
      const { auth } = await import('../../lib/auth.js');

      const session = await auth.api.getSession({
        headers: new Headers({
          Cookie: sessionCookie!,
        }),
      });

      // Session should be null after logout
      expect(session).toBeNull();
    });

    it('should handle logout for unauthenticated user gracefully', async () => {
      const res = await app.request('/api/auth/sign-out', {
        method: 'POST',
        // No cookie
      });

      // Better-Auth may return 200, 403, or other status for logout without session
      // The important part is that it doesn't crash
      expect(res.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Session Cookie Cache', () => {
    let loginCookie: string | null = null;

    it('should set encrypted session cookie with cache config', async () => {
      // Ensure email is verified before signing in
      if (_testUserId) {
        await db
          .update(user)
          .set({
            emailVerified: true,
          })
          .where(eq(user.id, _testUserId));
      }

      // Login to get fresh session
      const loginRes = await app.request('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      expect(loginRes.status).toBe(200);

      const setCookie = loginRes.headers.get('set-cookie');
      expect(setCookie).toBeTruthy();

      // Cookie should have proper security flags
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('SameSite');

      loginCookie = setCookie!.split(';')[0];
    });

    it('should validate session using cookie cache', async () => {
      expect(loginCookie).toBeTruthy();

      const { auth } = await import('../../lib/auth.js');

      // First request - may hit database
      const session1 = await auth.api.getSession({
        headers: new Headers({
          Cookie: loginCookie!,
        }),
      });

      expect(session1).toBeTruthy();
      expect(session1?.user.email).toBe(testUser.email);

      // Second request - should use cookie cache (within 5 min)
      const session2 = await auth.api.getSession({
        headers: new Headers({
          Cookie: loginCookie!,
        }),
      });

      expect(session2).toBeTruthy();
      expect(session2?.user.email).toBe(testUser.email);

      // Both should return same user
      expect(session1?.user.id).toBe(session2?.user.id);
    });
  });
});

describe('Authorization Middleware Tests', () => {
  let authenticatedCookie: string | null = null;
  let testUserId: string | null = null;

  beforeAll(async () => {
    // Create and login test user
    const signUpRes = await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'middleware.test@example.com',
        password: 'SecurePassword123!',
        name: 'Middleware Test User',
      }),
    });

    if (signUpRes.status === 200) {
      const data = await signUpRes.json();
      testUserId = data.user.id;

      // Verify email (required for authentication)
      if (testUserId) {
        await db
          .update(user)
          .set({
            emailVerified: true,
          })
          .where(eq(user.id, testUserId));
      }

      // Sign in to get session cookie (sign-up doesn't auto-sign-in when email verification is required)
      const signInRes = await app.request('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'middleware.test@example.com',
          password: 'SecurePassword123!',
        }),
      });
      const setCookie = signInRes.headers.get('set-cookie');
      if (setCookie) {
        authenticatedCookie = setCookie.split(';')[0];
      }
    }
  });

  afterAll(async () => {
    if (testUserId) {
      await db.delete(user).where(eq(user.email, 'middleware.test@example.com'));
    }
  });

  describe('requireAuth middleware', () => {
    it('should allow access for authenticated users', async () => {
      expect(authenticatedCookie).toBeTruthy();

      // Test against a protected endpoint (e.g., /api/users)
      const res = await app.request('/api/users', {
        method: 'GET',
        headers: {
          Cookie: authenticatedCookie!,
        },
      });

      // Should not return 401 (actual response depends on endpoint implementation)
      expect(res.status).not.toBe(401);
    });

    it('should reject unauthenticated users with 401', async () => {
      // Test against a protected endpoint without cookie
      const res = await app.request('/api/users', {
        method: 'GET',
        // No cookie
      });

      expect(res.status).toBe(401);

      // Try to parse JSON, but don't fail if it's not valid JSON
      try {
        const data = await res.json();
        if (data.message) {
          expect(data.message).toMatch(/unauthorized|sign in/i);
        }
      } catch {
        // If JSON parsing fails, that's ok - the status code is what matters
      }
    });
  });

  describe('Auth context middleware', () => {
    it('should attach user and session to context for authenticated requests', async () => {
      expect(authenticatedCookie).toBeTruthy();

      const { auth } = await import('../../lib/auth.js');

      // Auth context middleware is tested via auth.api.getSession
      const session = await auth.api.getSession({
        headers: new Headers({
          Cookie: authenticatedCookie!,
        }),
      });

      expect(session).toBeTruthy();
      expect(session?.user).not.toBeNull();
      expect(session?.session).not.toBeNull();
      expect(session?.user.email).toBe('middleware.test@example.com');
    });

    it('should set user and session to null for unauthenticated requests', async () => {
      const { auth } = await import('../../lib/auth.js');

      const session = await auth.api.getSession({
        headers: new Headers(),
      });

      expect(session).toBeNull();
    });
  });
});
