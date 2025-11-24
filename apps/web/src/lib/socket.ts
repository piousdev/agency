'use client';

import { io, type Socket } from 'socket.io-client';

// Types matching the API server
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

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

// Socket configuration
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Singleton socket instance
let socket: SocketClient | null = null;

/**
 * Get or create the socket connection
 */
export function getSocket(): SocketClient {
  if (!socket) {
    socket = io(SOCKET_URL, {
      // Don't connect automatically - we'll connect when the user is authenticated
      autoConnect: false,
      // Use websocket transport for better performance
      transports: ['websocket', 'polling'],
      // Include credentials (cookies) for authentication
      withCredentials: true,
      // Reconnection settings
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // Timeout settings
      timeout: 20000,
    });
  }
  return socket;
}

/**
 * Connect to the socket server
 */
export function connectSocket(): SocketClient {
  const sock = getSocket();
  if (!sock.connected) {
    sock.connect();
  }
  return sock;
}

/**
 * Disconnect from the socket server
 */
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Subscribe to a project room for real-time updates
 */
export function subscribeToProject(projectId: string): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('subscribe:project', projectId);
  }
}

/**
 * Unsubscribe from a project room
 */
export function unsubscribeFromProject(projectId: string): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('unsubscribe:project', projectId);
  }
}

/**
 * Dismiss an alert
 */
export function dismissAlert(alertId: string): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('alert:dismiss', alertId);
  }
}

/**
 * Snooze an alert for a specified duration
 */
export function snoozeAlert(alertId: string, durationMs: number): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('alert:snooze', { alertId, duration: durationMs });
  }
}

/**
 * Mark an activity as read
 */
export function markActivityRead(activityId: string): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('activity:mark-read', activityId);
  }
}

// Connection state type
export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';
