/**
 * Projects API Endpoint Tests
 * Tests project management endpoints for active work tracking
 *
 * Covers:
 * - List projects with service type filter
 * - Get single project details
 * - Assign/remove team members
 * - Update project status
 * - Update project completion percentage
 * - Auth protection (internal team only)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { nanoid } from 'nanoid';
import app from '../../../index.js';
import { db } from '../../../db/index.js';
import { client, project, projectAssignment, user } from '../../../db/schema/index.js';
import { eq } from 'drizzle-orm';

// Test data
const testClients = {
  creative: {
    id: nanoid(),
    name: 'Creative Test Client',
    email: 'creative.test@example.com',
    type: 'creative' as const,
  },
  software: {
    id: nanoid(),
    name: 'Software Test Client',
    email: 'software.test@example.com',
    type: 'software' as const,
  },
};

const testProject = {
  id: nanoid(),
  name: 'Test Project',
  description: 'Test project description',
  status: 'in_development' as const,
  clientId: testClients.creative.id,
};

const testInternalUser1 = {
  email: 'projects.internal1@example.com',
  password: 'SecurePassword123!',
  name: 'Projects Internal User 1',
};

const testInternalUser2 = {
  email: 'projects.internal2@example.com',
  password: 'SecurePassword123!',
  name: 'Projects Internal User 2',
};

const testClientUser = {
  email: 'projects.client@example.com',
  password: 'SecurePassword123!',
  name: 'Projects Client User',
};

let internalUser1Cookie: string | null = null;
let internalUser1Id: string | null = null;
let internalUser2Id: string | null = null;
let clientUserCookie: string | null = null;

describe('Projects API Endpoints', () => {
  // Setup: Create test clients, users, and project
  beforeAll(async () => {
    // Cleanup existing test data first
    await db.delete(user).where(eq(user.email, testInternalUser1.email));
    await db.delete(user).where(eq(user.email, testInternalUser2.email));
    await db.delete(user).where(eq(user.email, testClientUser.email));
    await db.delete(client).where(eq(client.email, testClients.creative.email));
    await db.delete(client).where(eq(client.email, testClients.software.email));

    // Create test clients (ignore if already exist)
    await db
      .insert(client)
      .values([testClients.creative, testClients.software])
      .onConflictDoNothing();

    // Create internal team users
    const user1SignUp = await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testInternalUser1),
    });
    const user1Data = await user1SignUp.json();
    internalUser1Id = user1Data.user?.id;

    // Set user1 as internal and verify email (required for authentication)
    if (internalUser1Id) {
      await db
        .update(user)
        .set({
          isInternal: true,
          emailVerified: true,
        })
        .where(eq(user.id, internalUser1Id));
    }

    // Sign in user1 to get session cookie
    const user1SignIn = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testInternalUser1.email,
        password: testInternalUser1.password,
      }),
    });
    const user1Cookie = user1SignIn.headers.get('set-cookie');
    if (user1Cookie) {
      internalUser1Cookie = user1Cookie.split(';')[0];
    }

    const user2SignUp = await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testInternalUser2),
    });
    const user2Data = await user2SignUp.json();
    internalUser2Id = user2Data.user?.id;

    // Set user2 as internal and verify email (required for authentication)
    if (internalUser2Id) {
      await db
        .update(user)
        .set({
          isInternal: true,
          emailVerified: true,
        })
        .where(eq(user.id, internalUser2Id));
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

    // Sign in client user to get session cookie
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

    // Create test project
    await db.insert(project).values(testProject);
  });

  // Cleanup
  afterAll(async () => {
    // Delete project assignments
    await db.delete(projectAssignment).where(eq(projectAssignment.projectId, testProject.id));

    // Delete test project
    await db.delete(project).where(eq(project.id, testProject.id));

    // Delete test users
    await db.delete(user).where(eq(user.email, testInternalUser1.email));
    await db.delete(user).where(eq(user.email, testInternalUser2.email));
    await db.delete(user).where(eq(user.email, testClientUser.email));

    // Delete test clients
    await db.delete(client).where(eq(client.id, testClients.creative.id));
    await db.delete(client).where(eq(client.id, testClients.software.id));
  });

  describe('GET /api/projects - List with Filters', () => {
    it('should list all projects for internal user', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      const res = await app.request('/api/projects', {
        headers: { Cookie: internalUser1Cookie! },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data).toHaveProperty('pagination');
    });

    it('should filter projects by status', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      const res = await app.request('/api/projects?status=in_development', {
        headers: { Cookie: internalUser1Cookie! },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      data.data.forEach((p: { status: string }) => {
        expect(p.status).toBe('in_development');
      });
    });

    it('should filter projects by client ID', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      const res = await app.request(`/api/projects?clientId=${testClients.creative.id}`, {
        headers: { Cookie: internalUser1Cookie! },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      data.data.forEach((p: { clientId: string }) => {
        expect(p.clientId).toBe(testClients.creative.id);
      });
    });

    it('should reject listing for unauthenticated users', async () => {
      const res = await app.request('/api/projects');
      expect(res.status).toBe(401);
    });

    it('should reject listing for non-internal users', async () => {
      expect(clientUserCookie).toBeTruthy();

      const res = await app.request('/api/projects', {
        headers: { Cookie: clientUserCookie! },
      });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/projects/:id - Get Single Project', () => {
    it('should get project details with relations', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      const res = await app.request(`/api/projects/${testProject.id}`, {
        headers: { Cookie: internalUser1Cookie! },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.id).toBe(testProject.id);
      expect(data.data).toHaveProperty('client');
      expect(data.data).toHaveProperty('assignees');
    });

    it('should return 404 for nonexistent project', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      const res = await app.request('/api/projects/nonexistent-id', {
        headers: { Cookie: internalUser1Cookie! },
      });

      expect(res.status).toBe(404);
    });

    it('should reject access for non-internal users', async () => {
      expect(clientUserCookie).toBeTruthy();

      const res = await app.request(`/api/projects/${testProject.id}`, {
        headers: { Cookie: clientUserCookie! },
      });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/projects/:id/assign - Assign Team Members', () => {
    it('should assign team members to project', async () => {
      expect(internalUser1Cookie).toBeTruthy();
      expect(internalUser1Id).toBeTruthy();
      expect(internalUser2Id).toBeTruthy();

      const res = await app.request(`/api/projects/${testProject.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUser1Cookie!,
        },
        body: JSON.stringify({
          userIds: [internalUser1Id, internalUser2Id],
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.assignees).toHaveLength(2);
      expect(data.data.assignees.map((a: { id: string }) => a.id)).toContain(internalUser1Id);
      expect(data.data.assignees.map((a: { id: string }) => a.id)).toContain(internalUser2Id);
    });

    it('should preserve existing assignments when adding new ones', async () => {
      expect(internalUser1Cookie).toBeTruthy();
      expect(internalUser1Id).toBeTruthy();

      // First, ensure user1 is assigned
      await app.request(`/api/projects/${testProject.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUser1Cookie!,
        },
        body: JSON.stringify({ userIds: [internalUser1Id] }),
      });

      // Try to assign the same user again (should be idempotent)
      const res = await app.request(`/api/projects/${testProject.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUser1Cookie!,
        },
        body: JSON.stringify({ userIds: [internalUser1Id] }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      // Should still have the assignment
      expect(data.success).toBe(true);
      expect(data.data.assignees.some((a: { id: string }) => a.id === internalUser1Id)).toBe(true);
    });

    it('should return 404 for nonexistent project', async () => {
      expect(internalUser1Cookie).toBeTruthy();
      expect(internalUser1Id).toBeTruthy();

      const res = await app.request('/api/projects/nonexistent-id/assign', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUser1Cookie!,
        },
        body: JSON.stringify({ userIds: [internalUser1Id] }),
      });

      expect(res.status).toBe(404);
    });

    it('should reject assignment for non-internal users', async () => {
      expect(clientUserCookie).toBeTruthy();
      expect(internalUser1Id).toBeTruthy();

      const res = await app.request(`/api/projects/${testProject.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: clientUserCookie!,
        },
        body: JSON.stringify({ userIds: [internalUser1Id] }),
      });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/projects/:id/assign - Remove Assignment', () => {
    beforeAll(async () => {
      // Ensure users are assigned for removal tests
      if (internalUser1Id && internalUser2Id) {
        await db
          .insert(projectAssignment)
          .values([
            { id: nanoid(), projectId: testProject.id, userId: internalUser1Id },
            { id: nanoid(), projectId: testProject.id, userId: internalUser2Id },
          ])
          .onConflictDoNothing();
      }
    });

    it('should remove team member from project', async () => {
      expect(internalUser1Cookie).toBeTruthy();
      expect(internalUser2Id).toBeTruthy();

      const res = await app.request(`/api/projects/${testProject.id}/assign`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUser1Cookie!,
        },
        body: JSON.stringify({ userId: internalUser2Id }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.assignees.map((a: { id: string }) => a.id)).not.toContain(internalUser2Id);
    });

    it('should return 404 for nonexistent project', async () => {
      expect(internalUser1Cookie).toBeTruthy();
      expect(internalUser1Id).toBeTruthy();

      const res = await app.request('/api/projects/nonexistent-id/assign', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUser1Cookie!,
        },
        body: JSON.stringify({ userId: internalUser1Id }),
      });

      expect(res.status).toBe(404);
    });

    it('should reject removal for non-internal users', async () => {
      expect(clientUserCookie).toBeTruthy();
      expect(internalUser1Id).toBeTruthy();

      const res = await app.request(`/api/projects/${testProject.id}/assign`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Cookie: clientUserCookie!,
        },
        body: JSON.stringify({ userId: internalUser1Id }),
      });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/projects/:id/status - Update Status', () => {
    it('should update project status', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      const res = await app.request(`/api/projects/${testProject.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUser1Cookie!,
        },
        body: JSON.stringify({ status: 'in_review' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.status).toBe('in_review');
    });

    it('should allow valid status transitions', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      const statuses = ['proposal', 'in_development', 'in_review', 'delivered', 'on_hold'];

      for (const status of statuses) {
        const res = await app.request(`/api/projects/${testProject.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Cookie: internalUser1Cookie!,
          },
          body: JSON.stringify({ status }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.data.status).toBe(status);
      }
    });

    it('should return 404 for nonexistent project', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      const res = await app.request('/api/projects/nonexistent-id/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUser1Cookie!,
        },
        body: JSON.stringify({ status: 'in_review' }),
      });

      expect(res.status).toBe(404);
    });

    it('should reject status update for non-internal users', async () => {
      expect(clientUserCookie).toBeTruthy();

      const res = await app.request(`/api/projects/${testProject.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: clientUserCookie!,
        },
        body: JSON.stringify({ status: 'in_review' }),
      });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/projects/:id/completion - Update Completion Percentage', () => {
    it('should update project completion percentage', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      const res = await app.request(`/api/projects/${testProject.id}/completion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUser1Cookie!,
        },
        body: JSON.stringify({ completionPercentage: 75 }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.completionPercentage).toBe(75);
    });

    it('should accept valid completion percentages (0-100)', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      for (const percentage of [0, 25, 50, 100]) {
        const res = await app.request(`/api/projects/${testProject.id}/completion`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Cookie: internalUser1Cookie!,
          },
          body: JSON.stringify({ completionPercentage: percentage }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.data.completionPercentage).toBe(percentage);
      }
    });

    it('should reject completion percentage > 100', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      const res = await app.request(`/api/projects/${testProject.id}/completion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUser1Cookie!,
        },
        body: JSON.stringify({ completionPercentage: 150 }),
      });

      expect(res.status).toBe(400);
    });

    it('should reject negative completion percentage', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      const res = await app.request(`/api/projects/${testProject.id}/completion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUser1Cookie!,
        },
        body: JSON.stringify({ completionPercentage: -10 }),
      });

      expect(res.status).toBe(400);
    });

    it('should return 404 for nonexistent project', async () => {
      expect(internalUser1Cookie).toBeTruthy();

      const res = await app.request('/api/projects/nonexistent-id/completion', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: internalUser1Cookie!,
        },
        body: JSON.stringify({ completionPercentage: 50 }),
      });

      expect(res.status).toBe(404);
    });

    it('should reject completion update for non-internal users', async () => {
      expect(clientUserCookie).toBeTruthy();

      const res = await app.request(`/api/projects/${testProject.id}/completion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: clientUserCookie!,
        },
        body: JSON.stringify({ completionPercentage: 50 }),
      });

      expect(res.status).toBe(403);
    });
  });
});
