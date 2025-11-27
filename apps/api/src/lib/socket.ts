import { Server as SocketIOServer, type Socket } from 'socket.io';

import { auth } from './auth.js';

import type { Server as HTTPServer } from 'node:http';

// Socket.IO server instance
let io: SocketIOServer | null = null;

// Types for socket events
export interface AlertPayload {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  entityType: 'project' | 'ticket' | 'client' | 'sprint' | 'system';
  entityId?: string;
  entityName?: string;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ActivityPayload {
  id: string;
  type: 'ticket' | 'project' | 'client' | 'file' | 'comment';
  action: 'created' | 'updated' | 'deleted' | 'assigned' | 'completed';
  title: string;
  description: string;
  userId: string;
  userName: string;
  userImage?: string;
  entityId: string;
  entityName: string;
  createdAt: string;
}

// Intake Pipeline specific payloads
export interface IntakeRequestPayload {
  id: string;
  title: string;
  type: string;
  priority: string;
  stage: string;
  requesterId: string;
  requesterName: string;
  assignedPmId?: string;
  assignedPmName?: string;
  clientId?: string;
  clientName?: string;
  storyPoints?: number;
  confidence?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeStageChangedPayload {
  requestId: string;
  requestTitle: string;
  fromStage: string;
  toStage: string;
  actorId: string;
  actorName: string;
  holdReason?: string;
  timestamp: string;
}

export interface IntakeEstimatedPayload {
  requestId: string;
  requestTitle: string;
  storyPoints: number;
  confidence: string;
  estimatorId: string;
  estimatorName: string;
  routingRecommendation: 'ticket' | 'project';
  timestamp: string;
}

export interface IntakeConvertedPayload {
  requestId: string;
  requestTitle: string;
  convertedToType: 'ticket' | 'project';
  convertedToId: string;
  actorId: string;
  actorName: string;
  timestamp: string;
}

export interface IntakeAssignedPayload {
  requestId: string;
  requestTitle: string;
  assignedPmId: string;
  assignedPmName: string;
  actorId: string;
  actorName: string;
  timestamp: string;
}

export interface ServerToClientEvents {
  alert: (payload: AlertPayload) => void;
  activity: (payload: ActivityPayload) => void;
  'alert:dismiss': (alertId: string) => void;
  'activity:read': (activityId: string) => void;
  connected: (data: { userId: string; rooms: string[] }) => void;
  error: (message: string) => void;
  // Intake Pipeline events
  'intake:created': (payload: IntakeRequestPayload) => void;
  'intake:updated': (payload: IntakeRequestPayload) => void;
  'intake:stage-changed': (payload: IntakeStageChangedPayload) => void;
  'intake:estimated': (payload: IntakeEstimatedPayload) => void;
  'intake:converted': (payload: IntakeConvertedPayload) => void;
  'intake:assigned': (payload: IntakeAssignedPayload) => void;
}

export interface ClientToServerEvents {
  'subscribe:role': (role: string) => void;
  'subscribe:project': (projectId: string) => void;
  'unsubscribe:project': (projectId: string) => void;
  'alert:dismiss': (alertId: string) => void;
  'alert:snooze': (data: { alertId: string; duration: number }) => void;
  'activity:mark-read': (activityId: string) => void;
  // Intake Pipeline subscriptions
  'subscribe:intake': () => void;
  'unsubscribe:intake': () => void;
  'subscribe:intake-stage': (stage: string) => void;
  'unsubscribe:intake-stage': (stage: string) => void;
}

export interface SocketData {
  userId: string;
  userRole: string;
  userName: string;
}

/**
 * Initialize Socket.IO server with the HTTP server
 */
export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, object, SocketData>(
    httpServer,
    {
      cors: {
        origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
        credentials: true,
      },
      // Connection settings
      pingTimeout: 60000,
      pingInterval: 25000,
    }
  );

  // Authentication middleware - using async IIFE with explicit handling
  /* eslint-disable @typescript-eslint/no-misused-promises, n/callback-return */
  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (cookies === undefined || cookies === '') {
        next(new Error('Authentication required'));
        return;
      }

      // Parse session from cookies using Better-Auth
      const request = new Request('http://localhost/api/auth/get-session', {
        headers: {
          cookie: cookies,
        },
      });

      const session = await auth.api.getSession({ headers: request.headers });

      if (session?.user === undefined) {
        next(new Error('Invalid session'));
        return;
      }

      // Attach user data to socket - session.user is typed from Better-Auth
      const user = session.user as {
        id: string;
        isInternal?: boolean;
        name?: string | null;
      };
      const socketData = socket.data as SocketData;
      socketData.userId = user.id;
      socketData.userRole = user.isInternal === true ? 'internal' : 'user';
      socketData.userName = user.name ?? 'Unknown';

      next();
    } catch (error: unknown) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });
  /* eslint-enable @typescript-eslint/no-misused-promises, n/callback-return */

  // Connection handler
  io.on(
    'connection',
    (socket: Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>) => {
      const { userId, userRole, userName } = socket.data;
      console.log(`Socket connected: ${userName} (${userId}) - role: ${userRole}`);

      // Join user-specific room
      void socket.join(`user:${userId}`);

      // Join role-based room
      void socket.join(`role:${userRole}`);

      // Emit connected event
      socket.emit('connected', {
        userId,
        rooms: [`user:${userId}`, `role:${userRole}`],
      });

      // Handle role subscription (for admin/pm switching views)
      socket.on('subscribe:role', (role: string) => {
        // Only allow subscription to own role or lower (security)
        const roleHierarchy = ['admin', 'pm', 'developer', 'designer', 'qa', 'client'];
        const userRoleIndex = roleHierarchy.indexOf(userRole);
        const targetRoleIndex = roleHierarchy.indexOf(role);

        if (targetRoleIndex >= userRoleIndex) {
          void socket.join(`role:${role}`);
          console.log(`${userName} subscribed to role: ${role}`);
        }
      });

      // Handle project subscription
      socket.on('subscribe:project', (projectId: string) => {
        void socket.join(`project:${projectId}`);
        console.log(`${userName} subscribed to project: ${projectId}`);
      });

      // Handle project unsubscription
      socket.on('unsubscribe:project', (projectId: string) => {
        void socket.leave(`project:${projectId}`);
        console.log(`${userName} unsubscribed from project: ${projectId}`);
      });

      // Handle intake pipeline subscription (internal users only)
      socket.on('subscribe:intake', () => {
        if (userRole === 'internal') {
          void socket.join('intake:all');
          console.log(`${userName} subscribed to intake pipeline`);
        }
      });

      // Handle intake pipeline unsubscription
      socket.on('unsubscribe:intake', () => {
        void socket.leave('intake:all');
        console.log(`${userName} unsubscribed from intake pipeline`);
      });

      // Handle intake stage-specific subscription
      socket.on('subscribe:intake-stage', (stage: string) => {
        if (userRole === 'internal') {
          void socket.join(`intake:stage:${stage}`);
          console.log(`${userName} subscribed to intake stage: ${stage}`);
        }
      });

      // Handle intake stage-specific unsubscription
      socket.on('unsubscribe:intake-stage', (stage: string) => {
        void socket.leave(`intake:stage:${stage}`);
        console.log(`${userName} unsubscribed from intake stage: ${stage}`);
      });

      // Handle alert dismissal
      socket.on('alert:dismiss', (alertId: string) => {
        // Broadcast to user's own rooms that alert was dismissed
        socket.to(`user:${userId}`).emit('alert:dismiss', alertId);
        console.log(`${userName} dismissed alert: ${alertId}`);
      });

      // Handle alert snooze
      socket.on('alert:snooze', ({ alertId, duration }) => {
        console.log(`${userName} snoozed alert ${alertId} for ${String(duration)}ms`);
        // Could store snooze state in Redis/DB and re-emit after duration
      });

      // Handle activity mark as read
      socket.on('activity:mark-read', (activityId: string) => {
        socket.to(`user:${userId}`).emit('activity:read', activityId);
        console.log(`${userName} marked activity as read: ${activityId}`);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${userName} (${userId}) - reason: ${reason}`);
      });
    }
  );

  console.log('Socket.IO initialized');
  return io;
}

/**
 * Get the Socket.IO server instance
 */
export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Broadcast an alert to specific rooms
 */
export function broadcastAlert(
  alert: AlertPayload,
  options: {
    roles?: string[];
    userIds?: string[];
    projectIds?: string[];
  }
): void {
  if (!io) {
    console.warn('Socket.IO not initialized, cannot broadcast alert');
    return;
  }

  const { roles, userIds, projectIds } = options;

  // Broadcast to roles
  if (roles !== undefined && roles.length > 0) {
    roles.forEach((role) => {
      io.to(`role:${role}`).emit('alert', alert);
    });
  }

  // Broadcast to specific users
  if (userIds !== undefined && userIds.length > 0) {
    userIds.forEach((userId) => {
      io.to(`user:${userId}`).emit('alert', alert);
    });
  }

  // Broadcast to project rooms
  if (projectIds !== undefined && projectIds.length > 0) {
    projectIds.forEach((projectId) => {
      io.to(`project:${projectId}`).emit('alert', alert);
    });
  }
}

/**
 * Broadcast activity to specific rooms
 */
export function broadcastActivity(
  activity: ActivityPayload,
  options: {
    roles?: string[];
    userIds?: string[];
    projectIds?: string[];
    excludeUserId?: string;
  }
): void {
  if (!io) {
    console.warn('Socket.IO not initialized, cannot broadcast activity');
    return;
  }

  const { roles, userIds, projectIds, excludeUserId } = options;

  // Broadcast to roles (excluding the user who triggered the activity)
  if (roles !== undefined && roles.length > 0) {
    roles.forEach((role) => {
      const room = io.to(`role:${role}`);
      if (excludeUserId !== undefined && excludeUserId !== '') {
        room.except(`user:${excludeUserId}`).emit('activity', activity);
      } else {
        room.emit('activity', activity);
      }
    });
  }

  // Broadcast to specific users
  if (userIds !== undefined && userIds.length > 0) {
    userIds.forEach((userId) => {
      if (userId !== excludeUserId) {
        io.to(`user:${userId}`).emit('activity', activity);
      }
    });
  }

  // Broadcast to project rooms
  if (projectIds !== undefined && projectIds.length > 0) {
    projectIds.forEach((projectId) => {
      const room = io.to(`project:${projectId}`);
      if (excludeUserId !== undefined && excludeUserId !== '') {
        room.except(`user:${excludeUserId}`).emit('activity', activity);
      } else {
        room.emit('activity', activity);
      }
    });
  }
}

/**
 * Send alert to admin and PM roles (for critical system alerts)
 */
export function broadcastCriticalAlert(alert: AlertPayload): void {
  broadcastAlert(alert, { roles: ['admin', 'pm'] });
}

/**
 * Send activity to all connected users in a role
 */
export function broadcastRoleActivity(activity: ActivityPayload, role: string): void {
  broadcastActivity(activity, { roles: [role] });
}

// ============================================
// Intake Pipeline Broadcast Functions
// ============================================

/**
 * Broadcast when a new request is created
 */
export function broadcastIntakeCreated(
  payload: IntakeRequestPayload,
  options?: { excludeUserId?: string }
): void {
  if (io === null) {
    console.warn('Socket.IO not initialized, cannot broadcast intake:created');
    return;
  }

  const room = io.to('intake:all').to(`intake:stage:${payload.stage}`);
  if (options?.excludeUserId !== undefined && options.excludeUserId !== '') {
    room.except(`user:${options.excludeUserId}`).emit('intake:created', payload);
  } else {
    room.emit('intake:created', payload);
  }
}

/**
 * Broadcast when a request is updated
 */
export function broadcastIntakeUpdated(
  payload: IntakeRequestPayload,
  options?: { excludeUserId?: string }
): void {
  if (io === null) {
    console.warn('Socket.IO not initialized, cannot broadcast intake:updated');
    return;
  }

  const room = io.to('intake:all').to(`intake:stage:${payload.stage}`);
  if (options?.excludeUserId !== undefined && options.excludeUserId !== '') {
    room.except(`user:${options.excludeUserId}`).emit('intake:updated', payload);
  } else {
    room.emit('intake:updated', payload);
  }
}

/**
 * Broadcast when a request's stage changes
 */
export function broadcastIntakeStageChanged(
  payload: IntakeStageChangedPayload,
  options?: { excludeUserId?: string }
): void {
  if (io === null) {
    console.warn('Socket.IO not initialized, cannot broadcast intake:stage-changed');
    return;
  }

  // Broadcast to all intake subscribers and both the old and new stage rooms
  const room = io
    .to('intake:all')
    .to(`intake:stage:${payload.fromStage}`)
    .to(`intake:stage:${payload.toStage}`);

  if (options?.excludeUserId !== undefined && options.excludeUserId !== '') {
    room.except(`user:${options.excludeUserId}`).emit('intake:stage-changed', payload);
  } else {
    room.emit('intake:stage-changed', payload);
  }
}

/**
 * Broadcast when a request is estimated
 */
export function broadcastIntakeEstimated(
  payload: IntakeEstimatedPayload,
  options?: { excludeUserId?: string }
): void {
  if (io === null) {
    console.warn('Socket.IO not initialized, cannot broadcast intake:estimated');
    return;
  }

  // Broadcast to all intake subscribers and the ready stage (auto-transitions to ready)
  const room = io.to('intake:all').to('intake:stage:estimation').to('intake:stage:ready');

  if (options?.excludeUserId !== undefined && options.excludeUserId !== '') {
    room.except(`user:${options.excludeUserId}`).emit('intake:estimated', payload);
  } else {
    room.emit('intake:estimated', payload);
  }
}

/**
 * Broadcast when a request is converted to project/ticket
 */
export function broadcastIntakeConverted(
  payload: IntakeConvertedPayload,
  options?: { excludeUserId?: string }
): void {
  if (io === null) {
    console.warn('Socket.IO not initialized, cannot broadcast intake:converted');
    return;
  }

  const room = io.to('intake:all').to('intake:stage:ready');
  if (options?.excludeUserId !== undefined && options.excludeUserId !== '') {
    room.except(`user:${options.excludeUserId}`).emit('intake:converted', payload);
  } else {
    room.emit('intake:converted', payload);
  }
}

/**
 * Broadcast when a PM is assigned to a request
 */
export function broadcastIntakeAssigned(
  payload: IntakeAssignedPayload,
  options?: { excludeUserId?: string; notifyAssignee?: boolean }
): void {
  if (io === null) {
    console.warn('Socket.IO not initialized, cannot broadcast intake:assigned');
    return;
  }

  const room = io.to('intake:all');
  if (options?.excludeUserId !== undefined && options.excludeUserId !== '') {
    room.except(`user:${options.excludeUserId}`).emit('intake:assigned', payload);
  } else {
    room.emit('intake:assigned', payload);
  }

  // Also notify the assigned PM directly
  if (options?.notifyAssignee === true && payload.assignedPmId !== '') {
    io.to(`user:${payload.assignedPmId}`).emit('intake:assigned', payload);
  }
}
