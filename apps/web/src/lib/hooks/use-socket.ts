'use client';

import { useEffect, useCallback, useRef } from 'react';
import { create } from 'zustand';
import {
  getSocket,
  connectSocket,
  disconnectSocket,
  type SocketClient,
  type AlertPayload,
  type ActivityPayload,
  type ConnectionState,
  type IntakeRequestPayload,
  type IntakeStageChangedPayload,
  type IntakeEstimatedPayload,
  type IntakeConvertedPayload,
  type IntakeAssignedPayload,
} from '@/lib/socket';

// Socket store for global state
interface SocketState {
  connectionState: ConnectionState;
  alerts: AlertPayload[];
  activities: ActivityPayload[];
  unreadActivityCount: number;
  readActivityIds: Set<string>;
  setConnectionState: (state: ConnectionState) => void;
  addAlert: (alert: AlertPayload) => void;
  dismissAlert: (alertId: string) => void;
  addActivity: (activity: ActivityPayload) => void;
  markActivityRead: (activityId: string) => void;
  clearAlerts: () => void;
  clearActivities: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  connectionState: 'disconnected',
  alerts: [],
  activities: [],
  unreadActivityCount: 0,
  readActivityIds: new Set(),

  setConnectionState: (state) => set({ connectionState: state }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 50), // Keep last 50 alerts
    })),

  dismissAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== alertId),
    })),

  addActivity: (activity) =>
    set((state) => ({
      activities: [activity, ...state.activities].slice(0, 100), // Keep last 100
      unreadActivityCount: state.unreadActivityCount + 1,
    })),

  markActivityRead: (activityId) =>
    set((state) => {
      const newReadIds = new Set(state.readActivityIds);
      newReadIds.add(activityId);
      return {
        readActivityIds: newReadIds,
        unreadActivityCount: Math.max(0, state.unreadActivityCount - 1),
      };
    }),

  clearAlerts: () => set({ alerts: [] }),
  clearActivities: () =>
    set({ activities: [], unreadActivityCount: 0, readActivityIds: new Set() }),
}));

/**
 * Hook to manage socket connection lifecycle
 * Automatically connects when authenticated and disconnects on unmount
 */
export function useSocket(enabled: boolean = true) {
  const socketRef = useRef<SocketClient | null>(null);
  const { setConnectionState, addAlert, dismissAlert, addActivity, markActivityRead } =
    useSocketStore();

  useEffect(() => {
    if (!enabled) {
      disconnectSocket();
      setConnectionState('disconnected');
      return;
    }

    const socket = getSocket();
    socketRef.current = socket;

    // Connection event handlers
    const onConnect = () => {
      console.log('Socket connected');
      setConnectionState('connected');
    };

    const onDisconnect = (reason: string) => {
      console.log('Socket disconnected:', reason);
      setConnectionState('disconnected');
    };

    const onConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
      setConnectionState('error');
    };

    const onReconnectAttempt = () => {
      setConnectionState('connecting');
    };

    // Data event handlers
    const onAlert = (payload: AlertPayload) => {
      console.log('Received alert:', payload);
      addAlert(payload);
    };

    const onAlertDismiss = (alertId: string) => {
      dismissAlert(alertId);
    };

    const onActivity = (payload: ActivityPayload) => {
      console.log('Received activity:', payload);
      addActivity(payload);
    };

    const onActivityRead = (activityId: string) => {
      markActivityRead(activityId);
    };

    const onConnected = (data: { userId: string; rooms: string[] }) => {
      console.log('Socket authenticated:', data);
    };

    const onError = (message: string) => {
      console.error('Socket error:', message);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.on('alert', onAlert);
    socket.on('alert:dismiss', onAlertDismiss);
    socket.on('activity', onActivity);
    socket.on('activity:read', onActivityRead);
    socket.on('connected', onConnected);
    socket.on('error', onError);

    // Connect
    setConnectionState('connecting');
    connectSocket();

    // Cleanup
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.off('alert', onAlert);
      socket.off('alert:dismiss', onAlertDismiss);
      socket.off('activity', onActivity);
      socket.off('activity:read', onActivityRead);
      socket.off('connected', onConnected);
      socket.off('error', onError);
    };
  }, [enabled, setConnectionState, addAlert, dismissAlert, addActivity, markActivityRead]);

  return socketRef.current;
}

/**
 * Hook for real-time alerts
 */
export function useRealtimeAlerts() {
  const { alerts, connectionState } = useSocketStore();

  const dismiss = useCallback((alertId: string) => {
    useSocketStore.getState().dismissAlert(alertId);
    // Also notify server
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('alert:dismiss', alertId);
    }
  }, []);

  const snooze = useCallback((alertId: string, durationMs: number) => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('alert:snooze', { alertId, duration: durationMs });
    }
    // Remove from local state temporarily
    useSocketStore.getState().dismissAlert(alertId);
  }, []);

  // Filter alerts by type
  const criticalAlerts = alerts.filter((a) => a.type === 'critical');
  const warningAlerts = alerts.filter((a) => a.type === 'warning');
  const infoAlerts = alerts.filter((a) => a.type === 'info');

  return {
    alerts,
    criticalAlerts,
    warningAlerts,
    infoAlerts,
    isConnected: connectionState === 'connected',
    dismiss,
    snooze,
  };
}

/**
 * Hook for real-time activity updates
 */
export function useRealtimeActivity() {
  const { activities, unreadActivityCount, readActivityIds, connectionState } = useSocketStore();

  const markAsRead = useCallback((activityId: string) => {
    useSocketStore.getState().markActivityRead(activityId);
    // Also notify server
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('activity:mark-read', activityId);
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    activities.forEach((activity) => {
      if (!readActivityIds.has(activity.id)) {
        markAsRead(activity.id);
      }
    });
  }, [activities, readActivityIds, markAsRead]);

  // Get unread activities
  const unreadActivities = activities.filter((a) => !readActivityIds.has(a.id));

  return {
    activities,
    unreadActivities,
    unreadCount: unreadActivityCount,
    isConnected: connectionState === 'connected',
    markAsRead,
    markAllAsRead,
    isRead: (activityId: string) => readActivityIds.has(activityId),
  };
}

/**
 * Hook for connection status
 */
export function useConnectionStatus() {
  const { connectionState } = useSocketStore();

  return {
    state: connectionState,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    isDisconnected: connectionState === 'disconnected',
    isError: connectionState === 'error',
  };
}

/**
 * Hook for project-specific subscriptions
 */
export function useProjectSubscription(projectId: string | null) {
  useEffect(() => {
    if (!projectId) return;

    const socket = getSocket();
    if (socket.connected) {
      socket.emit('subscribe:project', projectId);
    }

    return () => {
      if (socket.connected) {
        socket.emit('unsubscribe:project', projectId);
      }
    };
  }, [projectId]);
}

// ============================================
// Intake Pipeline Socket Hooks
// ============================================

export type IntakeEventType =
  | 'created'
  | 'updated'
  | 'stage-changed'
  | 'estimated'
  | 'converted'
  | 'assigned';

export interface IntakeEvent {
  type: IntakeEventType;
  payload:
    | IntakeRequestPayload
    | IntakeStageChangedPayload
    | IntakeEstimatedPayload
    | IntakeConvertedPayload
    | IntakeAssignedPayload;
  timestamp: Date;
}

// Intake store for managing real-time intake events
interface IntakeSocketState {
  events: IntakeEvent[];
  lastEventTimestamp: Date | null;
  addEvent: (event: IntakeEvent) => void;
  clearEvents: () => void;
}

export const useIntakeSocketStore = create<IntakeSocketState>((set) => ({
  events: [],
  lastEventTimestamp: null,
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 50), // Keep last 50 events
      lastEventTimestamp: event.timestamp,
    })),
  clearEvents: () => set({ events: [], lastEventTimestamp: null }),
}));

/**
 * Hook for subscribing to intake pipeline real-time events
 * @param stage - Optional stage to filter events by (e.g., 'in_treatment', 'estimation')
 * @param onEvent - Callback function when an event is received
 */
export function useIntakeSocket(
  options: {
    enabled?: boolean;
    stage?: string;
    onCreated?: (payload: IntakeRequestPayload) => void;
    onUpdated?: (payload: IntakeRequestPayload) => void;
    onStageChanged?: (payload: IntakeStageChangedPayload) => void;
    onEstimated?: (payload: IntakeEstimatedPayload) => void;
    onConverted?: (payload: IntakeConvertedPayload) => void;
    onAssigned?: (payload: IntakeAssignedPayload) => void;
  } = {}
) {
  const {
    enabled = true,
    stage,
    onCreated,
    onUpdated,
    onStageChanged,
    onEstimated,
    onConverted,
    onAssigned,
  } = options;

  const { addEvent } = useIntakeSocketStore();
  const { connectionState } = useSocketStore();

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();

    // Subscribe to intake events when connected
    const subscribeToIntake = () => {
      socket.emit('subscribe:intake');
      if (stage) {
        socket.emit('subscribe:intake-stage', stage);
      }
    };

    // Event handlers
    const handleCreated = (payload: IntakeRequestPayload) => {
      console.log('Intake request created:', payload);
      addEvent({ type: 'created', payload, timestamp: new Date() });
      onCreated?.(payload);
    };

    const handleUpdated = (payload: IntakeRequestPayload) => {
      console.log('Intake request updated:', payload);
      addEvent({ type: 'updated', payload, timestamp: new Date() });
      onUpdated?.(payload);
    };

    const handleStageChanged = (payload: IntakeStageChangedPayload) => {
      console.log('Intake stage changed:', payload);
      addEvent({ type: 'stage-changed', payload, timestamp: new Date() });
      onStageChanged?.(payload);
    };

    const handleEstimated = (payload: IntakeEstimatedPayload) => {
      console.log('Intake request estimated:', payload);
      addEvent({ type: 'estimated', payload, timestamp: new Date() });
      onEstimated?.(payload);
    };

    const handleConverted = (payload: IntakeConvertedPayload) => {
      console.log('Intake request converted:', payload);
      addEvent({ type: 'converted', payload, timestamp: new Date() });
      onConverted?.(payload);
    };

    const handleAssigned = (payload: IntakeAssignedPayload) => {
      console.log('Intake request assigned:', payload);
      addEvent({ type: 'assigned', payload, timestamp: new Date() });
      onAssigned?.(payload);
    };

    // Register event listeners
    socket.on('intake:created', handleCreated);
    socket.on('intake:updated', handleUpdated);
    socket.on('intake:stage-changed', handleStageChanged);
    socket.on('intake:estimated', handleEstimated);
    socket.on('intake:converted', handleConverted);
    socket.on('intake:assigned', handleAssigned);

    // Subscribe if already connected
    if (socket.connected) {
      subscribeToIntake();
    }

    // Subscribe on reconnect
    socket.on('connect', subscribeToIntake);

    // Cleanup
    return () => {
      socket.off('intake:created', handleCreated);
      socket.off('intake:updated', handleUpdated);
      socket.off('intake:stage-changed', handleStageChanged);
      socket.off('intake:estimated', handleEstimated);
      socket.off('intake:converted', handleConverted);
      socket.off('intake:assigned', handleAssigned);
      socket.off('connect', subscribeToIntake);

      // Unsubscribe from rooms
      if (socket.connected) {
        socket.emit('unsubscribe:intake');
        if (stage) {
          socket.emit('unsubscribe:intake-stage', stage);
        }
      }
    };
  }, [
    enabled,
    stage,
    addEvent,
    onCreated,
    onUpdated,
    onStageChanged,
    onEstimated,
    onConverted,
    onAssigned,
  ]);

  return {
    events: useIntakeSocketStore((state) => state.events),
    lastEventTimestamp: useIntakeSocketStore((state) => state.lastEventTimestamp),
    isConnected: connectionState === 'connected',
    clearEvents: useIntakeSocketStore((state) => state.clearEvents),
  };
}

/**
 * Hook to subscribe to a specific intake stage
 */
export function useIntakeStageSubscription(stage: string | null) {
  useEffect(() => {
    if (!stage) return;

    const socket = getSocket();
    if (socket.connected) {
      socket.emit('subscribe:intake-stage', stage);
    }

    return () => {
      if (socket.connected) {
        socket.emit('unsubscribe:intake-stage', stage);
      }
    };
  }, [stage]);
}
