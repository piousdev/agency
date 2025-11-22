/**
 * Tickets API Endpoint Tests
 * Tests ticket management endpoints for intake queue and ticket operations
 *
 * Covers:
 * - List tickets with filters
 * - Create intake tickets
 * - Update ticket details
 * - Assign tickets to team members
 * - Auth protection (internal team only)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { nanoid } from 'nanoid';
import app from '../../../index.js';
import { db } from '../../../db/index.js';
import { client, ticket, user } from '../../../db/schema/index.js';
import { eq } from 'drizzle-orm';

// Test data
const testClient = {
  id: nanoid(),
  name: 'Tickets Test Client',
  email: 'tickets.test@example.com',
  type: 'creative' as const,
};

const testInternalUser = {
  email: 'tickets.internal@example.com',
  password: 'SecurePassword123!',
  name: 'Tickets Internal User',
};

const testClientUser = {
  email: 'tickets.client@example.com',
  password: 'SecurePassword123!',
  name: 'Tickets Client User',
};

let internalUserCookie: string | null = null;
let internalUserId: string | null = null;
let clientUserCookie: string | null = null;
let testTicketId: string | null = null;

describe('Tickets API Endpoints', () => {
  // Setup: Create test client and users
  beforeAll(async () => {
    // Cleanup existing test data first
    await db.delete(user).where(eq(user.email, testInternalUser.email));
    await db.delete(user).where(eq(user.email, testClientUser.email));
    await db.delete(client).where(eq(client.email, testClient.email));

    // Create test client (ignore if already exists)
    await db.insert(client).values(testClient).onConflictDoNothing();

    // Create internal team user
    const internalSignUp = await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testInternalUser),
    });
    const internalData = await internalSignUp.json();
    internalUserId = internalData.user?.id;

    // Set user as internal and verify email (required for authentication)
    if (internalUserId) {
      await db
        .update(user)
        .set({
          isInternal: true,
          emailVerified: true,
        })
        .where(eq(user.id, internalUserId));
    }

    // Sign in to get session cookie (sign-up doesn't auto-sign-in when email verification is required)
    const internalSignIn = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testInternalUser.email,
        password: testInternalUser.password,
      }),
    });
    const internalCookie = internalSignIn.headers.get('set-cookie');
    if (internalCookie) {
      internalUserCookie = internalCookie.split(';')[0];
    }

    // Create client user
    const clientSignUp = await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testClientUser),
    });
    const clientData = await clientSignUp.json();
    const clientUserId = clientData.user?.id;

    // Verify client user's email (required for authentication)
    if (clientUserId) {
      await db
        .update(user)
        .set({
          emailVerified: true,
        })
        .where(eq(user.id, clientUserId));
    }

    // Sign in to get session cookie
    const clientSignIn = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testClientUser.email,
        password: testClientUser.password,
      }),
    });
    const clientCookie = clientSignIn.headers.get('set-cookie');
    if (clientCookie) {
      clientUserCookie = clientCookie.split(';')[0];
    }
  });

  // Cleanup
  afterAll(async () => {
    // Delete test tickets
    if (testTicketId) {
      await db.delete(ticket).where(eq(ticket.id, testTicketId));
    }
    await db.delete(ticket).where(eq(ticket.clientId, testClient.id));

    // Delete test users
    await db.delete(user).where(eq(user.email, testInternalUser.email));
    await db.delete(user).where(eq(user.email, testClientUser.email));

    // Delete test client
    await db.delete(client).where(eq(client.id, testClient.id));
  });

  describe('POST /api/tickets - Create Intake', () => {
    it('should create a new intake ticket as internal user', async () => {
      expect(internalUserCookie).toBeTruthy();

      const res = await app.request('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUserCookie!,
        },
        body: JSON.stringify({
          title: 'Test Intake Request',
          description: 'This is a test intake request',
          type: 'intake',
          priority: 'medium',
          clientId: testClient.id,
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data.title).toBe('Test Intake Request');
      expect(data.data.type).toBe('intake');
      expect(data.data.status).toBe('open');
      expect(data.data.clientId).toBe(testClient.id);
      expect(data.data.createdById).toBe(internalUserId);

      testTicketId = data.data.id;
    });

    it('should reject ticket creation without authentication', async () => {
      const res = await app.request('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthorized Ticket',
          description: 'Should fail',
          type: 'intake',
          clientId: testClient.id,
        }),
      });

      expect(res.status).toBe(401);
    });

    it('should reject ticket creation for non-internal users', async () => {
      expect(clientUserCookie).toBeTruthy();

      const res = await app.request('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: clientUserCookie!,
        },
        body: JSON.stringify({
          title: 'Client Ticket',
          description: 'Should fail',
          type: 'intake',
          clientId: testClient.id,
        }),
      });

      expect(res.status).toBe(403);
    });

    it('should reject ticket with invalid client ID', async () => {
      expect(internalUserCookie).toBeTruthy();

      const res = await app.request('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUserCookie!,
        },
        body: JSON.stringify({
          title: 'Invalid Client',
          description: 'Should fail',
          type: 'intake',
          clientId: 'nonexistent-id',
        }),
      });

      expect(res.status).toBe(404);
    });

    it('should reject ticket with missing required fields', async () => {
      expect(internalUserCookie).toBeTruthy();

      const res = await app.request('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUserCookie!,
        },
        body: JSON.stringify({
          title: 'Missing Fields',
          // Missing description, type, clientId
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tickets - List with Filters', () => {
    it('should list all tickets for internal user', async () => {
      expect(internalUserCookie).toBeTruthy();

      const res = await app.request('/api/tickets', {
        headers: { Cookie: internalUserCookie! },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('totalCount');
    });

    it('should filter tickets by type', async () => {
      expect(internalUserCookie).toBeTruthy();

      const res = await app.request('/api/tickets?type=intake', {
        headers: { Cookie: internalUserCookie! },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      data.data.forEach((t: { type: string }) => {
        expect(t.type).toBe('intake');
      });
    });

    it('should filter tickets by status', async () => {
      expect(internalUserCookie).toBeTruthy();

      const res = await app.request('/api/tickets?status=open', {
        headers: { Cookie: internalUserCookie! },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      data.data.forEach((t: { status: string }) => {
        expect(t.status).toBe('open');
      });
    });

    it('should filter tickets by priority', async () => {
      expect(internalUserCookie).toBeTruthy();

      const res = await app.request('/api/tickets?priority=medium', {
        headers: { Cookie: internalUserCookie! },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      data.data.forEach((t: { priority: string }) => {
        expect(t.priority).toBe('medium');
      });
    });

    it('should reject listing for unauthenticated users', async () => {
      const res = await app.request('/api/tickets');
      expect(res.status).toBe(401);
    });

    it('should reject listing for non-internal users', async () => {
      expect(clientUserCookie).toBeTruthy();

      const res = await app.request('/api/tickets', {
        headers: { Cookie: clientUserCookie! },
      });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/tickets/:id - Update Ticket', () => {
    it('should update ticket priority and status', async () => {
      expect(internalUserCookie).toBeTruthy();
      expect(testTicketId).toBeTruthy();

      const res = await app.request(`/api/tickets/${testTicketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUserCookie!,
        },
        body: JSON.stringify({
          priority: 'high',
          status: 'in_progress',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.priority).toBe('high');
      expect(data.data.status).toBe('in_progress');
    });

    it('should return 404 for nonexistent ticket', async () => {
      expect(internalUserCookie).toBeTruthy();

      const res = await app.request('/api/tickets/nonexistent-id', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUserCookie!,
        },
        body: JSON.stringify({ priority: 'high' }),
      });

      expect(res.status).toBe(404);
    });

    it('should reject update for non-internal users', async () => {
      expect(clientUserCookie).toBeTruthy();
      expect(testTicketId).toBeTruthy();

      const res = await app.request(`/api/tickets/${testTicketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: clientUserCookie!,
        },
        body: JSON.stringify({ priority: 'high' }),
      });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/tickets/:id/assign - Assign Ticket', () => {
    it('should assign ticket to internal user', async () => {
      expect(internalUserCookie).toBeTruthy();
      expect(testTicketId).toBeTruthy();
      expect(internalUserId).toBeTruthy();

      const res = await app.request(`/api/tickets/${testTicketId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUserCookie!,
        },
        body: JSON.stringify({
          assignedToId: internalUserId,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.assignedToId).toBe(internalUserId);
      expect(data.data.status).toBe('in_progress');
    });

    it('should unassign ticket when assignedToId is null', async () => {
      expect(internalUserCookie).toBeTruthy();
      expect(testTicketId).toBeTruthy();

      const res = await app.request(`/api/tickets/${testTicketId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUserCookie!,
        },
        body: JSON.stringify({
          assignedToId: null,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.assignedToId).toBeNull();
    });

    it('should return 404 for nonexistent ticket', async () => {
      expect(internalUserCookie).toBeTruthy();
      expect(internalUserId).toBeTruthy();

      const res = await app.request('/api/tickets/nonexistent-id/assign', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUserCookie!,
        },
        body: JSON.stringify({ assignedToId: internalUserId }),
      });

      expect(res.status).toBe(404);
    });

    it('should reject assignment for non-internal users', async () => {
      expect(clientUserCookie).toBeTruthy();
      expect(testTicketId).toBeTruthy();

      const res = await app.request(`/api/tickets/${testTicketId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: clientUserCookie!,
        },
        body: JSON.stringify({ assignedToId: internalUserId }),
      });

      expect(res.status).toBe(403);
    });
  });
});
