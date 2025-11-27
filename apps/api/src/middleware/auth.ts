/**
 * Authentication Middleware Module
 *
 * Provides a comprehensive set of middleware functions for protecting API endpoints
 * with authentication and authorization checks.
 *
 * **Architecture - Defense in Depth**:
 * This middleware implements a multi-layered security model:
 *
 * 1. **Layer 1 - Global Context** (`authContext`)
 *    - Runs on all routes via `app.use("*", authContext)`
 *    - Extracts Better-Auth session from request headers
 *    - Attaches user/session to Hono context (or null if unauthenticated)
 *    - Non-blocking: Allows unauthenticated requests to proceed
 *
 * 2. **Layer 2 - Authentication** (`requireAuth`)
 *    - Enforces that user is authenticated
 *    - Returns 401 Unauthorized if no session
 *    - Logs failed attempts to Sentry
 *
 * 3. **Layer 3 - Authorization** (role/permission/type checks)
 *    - `requireRole()` - Check user has specific role(s)
 *    - `requireClientType()` - Check user's client has specific type(s)
 *    - `requirePermission()` - Check user has fine-grained permission(s)
 *    - `requireInternal()` - Check user is internal team member
 *    - All return 403 Forbidden if authorization fails
 *    - All log security events to Sentry
 *
 * **Usage Pattern**:
 * ```typescript
 * // Public endpoint - no middleware
 * app.get('/api/public/status', async (c) => { ... });
 *
 * // Protected endpoint - requires authentication
 * app.get('/api/user/profile', requireAuth(), async (c) => {
 *   const user = c.get('user'); // TypeScript knows this is not null
 *   return c.json({ name: user.name });
 * });
 *
 * // Role-protected endpoint - requires admin role
 * app.post('/api/admin/users', requireAuth(), requireRole('admin'), async (c) => {
 *   // Only admins can access
 * });
 *
 * // Internal-only endpoint - requires internal team member flag
 * app.get('/api/internal/analytics', requireAuth(), requireInternal(), async (c) => {
 *   // Only internal team members can access
 * });
 *
 * // Multi-role endpoint - requires any of the specified roles
 * app.get('/api/team/projects', requireAuth(), requireRole('admin', 'project_manager'), async (c) => {
 *   // Admins OR project managers can access
 * });
 *
 * // Permission-based endpoint - fine-grained control
 * app.post('/api/projects/approve', requireAuth(), requirePermission('can_approve_projects'), async (c) => {
 *   // Only users with can_approve_projects permission
 * });
 *
 * // Client type endpoint - requires specific client type
 * app.get('/api/software-features', requireAuth(), requireClientType('software', 'full_service'), async (c) => {
 *   // Only software or full-service clients
 * });
 * ```
 *
 * **Error Handling**:
 * - 401 Unauthorized: No authentication (user not signed in)
 * - 403 Forbidden: Authenticated but insufficient permissions
 * - All errors include descriptive messages for debugging
 * - All security events logged to Sentry with full context
 *
 * **Performance Considerations**:
 * - `authContext` uses Better-Auth's cookie cache (5min) to reduce DB queries
 * - Role/permission checks query database on each request (consider caching for high-traffic endpoints)
 * - Middleware is composable: chain only the checks you need
 *
 * **Security Best Practices**:
 * - Always use `requireAuth()` before any authorization middleware
 * - Log all security events (unauthorized access, permission denials)
 * - Include IP address, user agent, and endpoint in logs
 * - Use specific error messages for debugging, generic for production
 *
 * @module middleware/auth
 */
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

import { db } from '../db';
import { roleAssignment, role, userToClient, client } from '../db/schema';
import { auth } from '../lib/auth.js';
import { logSecurityEvent, AuthEventType } from '../lib/sentry.js';

import type { Context, Next } from 'hono';

/**
 * Types for auth context variables
 *
 * These types are extracted from Better-Auth's session inference.
 * They represent the authenticated user and their session data.
 */
export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session.session;

export interface AuthVariables {
  user: AuthUser | null;
  session: AuthSession | null;
}

/**
 * Global middleware to attach user and session to context
 * Add this to your Hono app: app.use("*", authContext)
 */
export const authContext = async (c: Context, next: Next): Promise<void> => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    // eslint-disable-next-line n/callback-return
    await next();
    return;
  }

  c.set('user', session.user);
  c.set('session', session.session);
  // eslint-disable-next-line n/callback-return
  await next();
};

/**
 * Middleware to require authentication
 * Throws 401 if user is not authenticated
 *
 * @example
 * app.post('/api/protected', requireAuth(), async (c) => {
 *   const user = c.get('user'); // TypeScript knows this is not null
 *   return c.json({ message: `Hello ${user.name}` });
 * });
 */
export const requireAuth = () => {
  return async (c: Context, next: Next): Promise<void> => {
    const user = c.get('user') as AuthUser | null;

    if (user === null) {
      // Log unauthorized access attempt to Sentry
      const forwardedFor = c.req.header('x-forwarded-for');
      const realIp = c.req.header('x-real-ip');
      logSecurityEvent(
        AuthEventType.UNAUTHORIZED_ACCESS,
        {
          ipAddress:
            forwardedFor !== undefined && forwardedFor !== ''
              ? forwardedFor
              : realIp !== undefined && realIp !== ''
                ? realIp
                : undefined,
          userAgent: c.req.header('user-agent'),
          endpoint: c.req.path,
          reason: 'No authentication token provided',
        },
        'warning'
      );

      throw new HTTPException(401, {
        message: 'Unauthorized - Please sign in to access this resource',
      });
    }

    // eslint-disable-next-line n/callback-return
    await next();
  };
};

/**
 * Middleware to require specific roles
 * Checks if user has at least one of the specified roles
 *
 * @param roles - Array of role names to check
 *
 * @example
 * app.post('/api/admin', requireAuth(), requireRole('admin'), async (c) => {
 *   // Only admins can access this endpoint
 * });
 *
 * @example
 * app.post('/api/team', requireAuth(), requireRole('admin', 'project_manager'), async (c) => {
 *   // Admins or project managers can access
 * });
 */
export const requireRole = (...roles: string[]) => {
  return async (c: Context, next: Next): Promise<void> => {
    const user = c.get('user') as AuthUser | null;

    if (user === null) {
      throw new HTTPException(401, {
        message: 'Unauthorized - Please sign in',
      });
    }

    // Get user's roles from database
    const userRoles = await db
      .select({
        roleName: role.name,
      })
      .from(roleAssignment)
      .innerJoin(role, eq(roleAssignment.roleId, role.id))
      .where(eq(roleAssignment.userId, user.id));

    const userRoleNames = userRoles.map((r) => r.roleName);

    // Check if user has at least one of the required roles
    const hasRole = roles.some((requiredRole) => userRoleNames.includes(requiredRole));

    if (!hasRole) {
      // Log permission denied to Sentry
      const forwardedFor = c.req.header('x-forwarded-for');
      const realIp = c.req.header('x-real-ip');
      logSecurityEvent(
        AuthEventType.PERMISSION_DENIED,
        {
          userId: user.id,
          email: user.email,
          ipAddress:
            forwardedFor !== undefined && forwardedFor !== ''
              ? forwardedFor
              : realIp !== undefined && realIp !== ''
                ? realIp
                : undefined,
          userAgent: c.req.header('user-agent'),
          endpoint: c.req.path,
          reason: `User lacks required role(s): ${roles.join(', ')}. User roles: ${userRoleNames.join(', ') || 'none'}`,
        },
        'warning'
      );

      throw new HTTPException(403, {
        message: `Forbidden - Requires one of the following roles: ${roles.join(', ')}`,
      });
    }

    // eslint-disable-next-line n/callback-return
    await next();
  };
};

/**
 * Middleware to require specific client types
 * Checks if user is associated with a client of the specified type
 *
 * @param types - Array of client types to check ('creative', 'software', 'full_service', 'one_time')
 *
 * @example
 * app.get('/api/software-features', requireAuth(), requireClientType('software', 'full_service'), async (c) => {
 *   // Only software or full-service clients can access
 * });
 */
export const requireClientType = (
  ...types: ('creative' | 'software' | 'full_service' | 'one_time')[]
) => {
  return async (c: Context, next: Next): Promise<void> => {
    const user = c.get('user') as AuthUser | null;

    if (user === null) {
      throw new HTTPException(401, {
        message: 'Unauthorized - Please sign in',
      });
    }

    // Get user's associated clients
    const userClients = await db
      .select({
        clientType: client.type,
      })
      .from(userToClient)
      .innerJoin(client, eq(userToClient.clientId, client.id))
      .where(eq(userToClient.userId, user.id));

    const clientTypes = userClients.map((c) => c.clientType);

    // Check if user has at least one client with the required type
    const hasClientType = types.some((requiredType) => clientTypes.includes(requiredType));

    if (!hasClientType) {
      // Log permission denied to Sentry
      const forwardedFor = c.req.header('x-forwarded-for');
      const realIp = c.req.header('x-real-ip');
      logSecurityEvent(
        AuthEventType.PERMISSION_DENIED,
        {
          userId: user.id,
          email: user.email,
          ipAddress:
            forwardedFor !== undefined && forwardedFor !== ''
              ? forwardedFor
              : realIp !== undefined && realIp !== ''
                ? realIp
                : undefined,
          userAgent: c.req.header('user-agent'),
          endpoint: c.req.path,
          reason: `User lacks required client type(s): ${types.join(', ')}. User types: ${clientTypes.join(', ') || 'none'}`,
        },
        'warning'
      );

      throw new HTTPException(403, {
        message: `Forbidden - Requires client type: ${types.join(' or ')}`,
      });
    }

    // eslint-disable-next-line n/callback-return
    await next();
  };
};

/**
 * Middleware to require specific permissions
 * Checks if user has at least one of the specified permissions through their roles
 *
 * @param permissions - Array of permission keys to check
 *
 * @example
 * app.post('/api/projects/approve', requireAuth(), requirePermission('can_approve_projects'), async (c) => {
 *   // Only users with can_approve_projects permission
 * });
 *
 * @example
 * app.delete('/api/users/:id', requireAuth(), requirePermission('can_delete_users', 'can_manage_all'), async (c) => {
 *   // Users with either permission can access
 * });
 */
export const requirePermission = (...permissions: string[]) => {
  return async (c: Context, next: Next): Promise<void> => {
    const user = c.get('user') as AuthUser | null;

    if (user === null) {
      throw new HTTPException(401, {
        message: 'Unauthorized - Please sign in',
      });
    }

    // Get user's roles with permissions
    const userRoles = await db
      .select({
        permissions: role.permissions,
      })
      .from(roleAssignment)
      .innerJoin(role, eq(roleAssignment.roleId, role.id))
      .where(eq(roleAssignment.userId, user.id));

    // Collect all permissions from all roles
    const allPermissions = new Set<string>();
    for (const userRole of userRoles) {
      // Permissions is a JSONB object like { "can_approve_projects": true, "can_view_all": true }
      for (const [key, value] of Object.entries(userRole.permissions)) {
        if (value) {
          allPermissions.add(key);
        }
      }
    }

    // Check if user has at least one of the required permissions
    const hasPermission = permissions.some((requiredPermission) =>
      allPermissions.has(requiredPermission)
    );

    if (!hasPermission) {
      // Log permission denied to Sentry
      const forwardedFor = c.req.header('x-forwarded-for');
      const realIp = c.req.header('x-real-ip');
      logSecurityEvent(
        AuthEventType.PERMISSION_DENIED,
        {
          userId: user.id,
          email: user.email,
          ipAddress:
            forwardedFor !== undefined && forwardedFor !== ''
              ? forwardedFor
              : realIp !== undefined && realIp !== ''
                ? realIp
                : undefined,
          userAgent: c.req.header('user-agent'),
          endpoint: c.req.path,
          reason: `User lacks required permission(s): ${permissions.join(', ')}. User permissions: ${Array.from(allPermissions).join(', ') || 'none'}`,
        },
        'warning'
      );

      throw new HTTPException(403, {
        message: `Forbidden - Requires one of the following permissions: ${permissions.join(', ')}`,
      });
    }

    // eslint-disable-next-line n/callback-return
    await next();
  };
};

/**
 * Helper function to check if user is internal team member
 * Internal users have is_internal = true flag
 *
 * @example
 * app.get('/api/internal/analytics', requireAuth(), requireInternal(), async (c) => {
 *   // Only internal team members can access
 * });
 */
export const requireInternal = () => {
  return async (c: Context, next: Next): Promise<void> => {
    const user = c.get('user') as AuthUser | null;

    if (user === null) {
      throw new HTTPException(401, {
        message: 'Unauthorized - Please sign in',
      });
    }

    // Get user details to check is_internal flag
    const userDetails = await db.query.user.findFirst({
      where: (fields, { eq }) => eq(fields.id, user.id),
      columns: {
        isInternal: true,
      },
    });

    if (userDetails?.isInternal !== true) {
      // Log permission denied to Sentry
      const forwardedFor = c.req.header('x-forwarded-for');
      const realIp = c.req.header('x-real-ip');
      logSecurityEvent(
        AuthEventType.PERMISSION_DENIED,
        {
          userId: user.id,
          email: user.email,
          ipAddress:
            forwardedFor !== undefined && forwardedFor !== ''
              ? forwardedFor
              : realIp !== undefined && realIp !== ''
                ? realIp
                : undefined,
          userAgent: c.req.header('user-agent'),
          endpoint: c.req.path,
          reason: 'User is not an internal team member',
        },
        'warning'
      );

      throw new HTTPException(403, {
        message: 'Forbidden - This resource is only available to internal team members',
      });
    }

    // eslint-disable-next-line n/callback-return
    await next();
  };
};
