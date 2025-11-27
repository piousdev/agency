/**
 * Socket Hooks Tests (10.2.2)
 * Tests for useSocketStore, useRealtimeAlerts, useRealtimeActivity, useConnectionStatus
 */

import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  useSocketStore,
  useRealtimeAlerts,
  useRealtimeActivity,
  useConnectionStatus,
} from '../use-socket';

import type { AlertPayload, ActivityPayload } from '@/lib/socket';

// Mock socket module
vi.mock('@/lib/socket', () => ({
  getSocket: vi.fn(() => ({
    connected: true,
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    io: {
      on: vi.fn(),
      off: vi.fn(),
    },
  })),
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn(),
}));

describe('useSocketStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSocketStore.setState({
      connectionState: 'disconnected',
      alerts: [],
      activities: [],
      unreadActivityCount: 0,
      readActivityIds: new Set(),
    });
  });

  describe('Connection State', () => {
    it('should start with disconnected state', () => {
      const { connectionState } = useSocketStore.getState();
      expect(connectionState).toBe('disconnected');
    });

    it('should update connection state', () => {
      const { setConnectionState } = useSocketStore.getState();

      act(() => {
        setConnectionState('connecting');
      });

      expect(useSocketStore.getState().connectionState).toBe('connecting');
    });

    it('should handle all connection states', () => {
      const { setConnectionState } = useSocketStore.getState();
      const states = ['connected', 'connecting', 'disconnected', 'error'] as const;

      states.forEach((state) => {
        act(() => {
          setConnectionState(state);
        });
        expect(useSocketStore.getState().connectionState).toBe(state);
      });
    });
  });

  describe('Alert Management', () => {
    const createAlert = (overrides: Partial<AlertPayload> = {}): AlertPayload => ({
      id: `alert-${String(Date.now())}`,
      type: 'warning',
      title: 'Test Alert',
      message: 'This is a test alert',
      entityType: 'project',
      entityId: 'proj-1',
      entityName: 'Test Project',
      actionUrl: '/projects/proj-1',
      createdAt: new Date().toISOString(),
      ...overrides,
    });

    it('should add an alert to the store', () => {
      const { addAlert } = useSocketStore.getState();
      const alert = createAlert({ id: 'alert-1' });

      act(() => {
        addAlert(alert);
      });

      const { alerts } = useSocketStore.getState();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe('alert-1');
    });

    it('should prepend new alerts (newest first)', () => {
      const { addAlert } = useSocketStore.getState();

      act(() => {
        addAlert(createAlert({ id: 'alert-1' }));
        addAlert(createAlert({ id: 'alert-2' }));
      });

      const { alerts } = useSocketStore.getState();
      expect(alerts[0].id).toBe('alert-2');
      expect(alerts[1].id).toBe('alert-1');
    });

    it('should limit alerts to 50', () => {
      const { addAlert } = useSocketStore.getState();

      act(() => {
        for (let i = 0; i < 60; i++) {
          addAlert(createAlert({ id: `alert-${String(i)}` }));
        }
      });

      const { alerts } = useSocketStore.getState();
      expect(alerts).toHaveLength(50);
    });

    it('should dismiss an alert by id', () => {
      const { addAlert, dismissAlert } = useSocketStore.getState();

      act(() => {
        addAlert(createAlert({ id: 'alert-1' }));
        addAlert(createAlert({ id: 'alert-2' }));
        dismissAlert('alert-1');
      });

      const { alerts } = useSocketStore.getState();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe('alert-2');
    });

    it('should clear all alerts', () => {
      const { addAlert, clearAlerts } = useSocketStore.getState();

      act(() => {
        addAlert(createAlert({ id: 'alert-1' }));
        addAlert(createAlert({ id: 'alert-2' }));
        clearAlerts();
      });

      const { alerts } = useSocketStore.getState();
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Activity Management', () => {
    const createActivity = (overrides: Partial<ActivityPayload> = {}): ActivityPayload => ({
      id: `activity-${String(Date.now())}`,
      type: 'ticket_created',
      userId: 'user-1',
      userName: 'Test User',
      userAvatar: '/avatars/test.png',
      entityType: 'ticket',
      entityId: 'ticket-1',
      entityName: 'Test Ticket',
      action: 'created',
      metadata: {},
      createdAt: new Date().toISOString(),
      ...overrides,
    });

    it('should add activity to the store', () => {
      const { addActivity } = useSocketStore.getState();
      const activity = createActivity({ id: 'activity-1' });

      act(() => {
        addActivity(activity);
      });

      const { activities } = useSocketStore.getState();
      expect(activities).toHaveLength(1);
      expect(activities[0].id).toBe('activity-1');
    });

    it('should increment unread count when adding activity', () => {
      const { addActivity } = useSocketStore.getState();

      act(() => {
        addActivity(createActivity({ id: 'activity-1' }));
        addActivity(createActivity({ id: 'activity-2' }));
      });

      const { unreadActivityCount } = useSocketStore.getState();
      expect(unreadActivityCount).toBe(2);
    });

    it('should limit activities to 100', () => {
      const { addActivity } = useSocketStore.getState();

      act(() => {
        for (let i = 0; i < 110; i++) {
          addActivity(createActivity({ id: `activity-${String(i)}` }));
        }
      });

      const { activities } = useSocketStore.getState();
      expect(activities).toHaveLength(100);
    });

    it('should mark activity as read', () => {
      const { addActivity, markActivityRead } = useSocketStore.getState();

      act(() => {
        addActivity(createActivity({ id: 'activity-1' }));
        markActivityRead('activity-1');
      });

      const { readActivityIds, unreadActivityCount } = useSocketStore.getState();
      expect(readActivityIds.has('activity-1')).toBe(true);
      expect(unreadActivityCount).toBe(0);
    });

    it('should not go below 0 unread count', () => {
      const { markActivityRead } = useSocketStore.getState();

      act(() => {
        markActivityRead('nonexistent');
        markActivityRead('another-nonexistent');
      });

      const { unreadActivityCount } = useSocketStore.getState();
      expect(unreadActivityCount).toBe(0);
    });

    it('should clear activities and reset state', () => {
      const { addActivity, clearActivities } = useSocketStore.getState();

      act(() => {
        addActivity(createActivity({ id: 'activity-1' }));
        addActivity(createActivity({ id: 'activity-2' }));
        clearActivities();
      });

      const state = useSocketStore.getState();
      expect(state.activities).toHaveLength(0);
      expect(state.unreadActivityCount).toBe(0);
      expect(state.readActivityIds.size).toBe(0);
    });
  });
});

describe('useRealtimeAlerts Hook', () => {
  beforeEach(() => {
    useSocketStore.setState({
      connectionState: 'connected',
      alerts: [],
      activities: [],
      unreadActivityCount: 0,
      readActivityIds: new Set(),
    });
  });

  it('should return alerts from store', () => {
    useSocketStore.setState({
      alerts: [
        {
          id: 'alert-1',
          type: 'critical',
          title: 'Test',
          message: 'Test message',
          entityType: 'project',
          entityId: 'proj-1',
          entityName: 'Project',
          actionUrl: '/test',
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const { result } = renderHook(() => useRealtimeAlerts());
    expect(result.current.alerts).toHaveLength(1);
  });

  it('should filter alerts by type', () => {
    useSocketStore.setState({
      alerts: [
        {
          id: 'critical-1',
          type: 'critical',
          title: 'Critical',
          message: 'Critical message',
          entityType: 'system',
          entityId: 'sys-1',
          entityName: 'System',
          actionUrl: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'warning-1',
          type: 'warning',
          title: 'Warning',
          message: 'Warning message',
          entityType: 'project',
          entityId: 'proj-1',
          entityName: 'Project',
          actionUrl: '/test',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'info-1',
          type: 'info',
          title: 'Info',
          message: 'Info message',
          entityType: 'ticket',
          entityId: 'ticket-1',
          entityName: 'Ticket',
          actionUrl: '/tickets/1',
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const { result } = renderHook(() => useRealtimeAlerts());

    expect(result.current.criticalAlerts).toHaveLength(1);
    expect(result.current.warningAlerts).toHaveLength(1);
    expect(result.current.infoAlerts).toHaveLength(1);
    expect(result.current.criticalAlerts[0].id).toBe('critical-1');
  });

  it('should return connection status', () => {
    const { result } = renderHook(() => useRealtimeAlerts());
    expect(result.current.isConnected).toBe(true);

    act(() => {
      useSocketStore.setState({ connectionState: 'disconnected' });
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('should provide dismiss function', () => {
    useSocketStore.setState({
      alerts: [
        {
          id: 'alert-1',
          type: 'warning',
          title: 'Test',
          message: 'Test',
          entityType: 'project',
          entityId: 'proj-1',
          entityName: 'Project',
          actionUrl: null,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const { result } = renderHook(() => useRealtimeAlerts());

    act(() => {
      result.current.dismiss('alert-1');
    });

    expect(useSocketStore.getState().alerts).toHaveLength(0);
  });
});

describe('useRealtimeActivity Hook', () => {
  beforeEach(() => {
    useSocketStore.setState({
      connectionState: 'connected',
      alerts: [],
      activities: [],
      unreadActivityCount: 0,
      readActivityIds: new Set(),
    });
  });

  it('should return activities from store', () => {
    useSocketStore.setState({
      activities: [
        {
          id: 'activity-1',
          type: 'ticket_created',
          userId: 'user-1',
          userName: 'Test User',
          userAvatar: '/avatar.png',
          entityType: 'ticket',
          entityId: 'ticket-1',
          entityName: 'Test Ticket',
          action: 'created',
          metadata: {},
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const { result } = renderHook(() => useRealtimeActivity());
    expect(result.current.activities).toHaveLength(1);
  });

  it('should return unread count', () => {
    useSocketStore.setState({
      unreadActivityCount: 5,
    });

    const { result } = renderHook(() => useRealtimeActivity());
    expect(result.current.unreadCount).toBe(5);
  });

  it('should return unread activities', () => {
    useSocketStore.setState({
      activities: [
        {
          id: 'activity-1',
          type: 'ticket_created',
          userId: 'user-1',
          userName: 'Test User',
          userAvatar: '/avatar.png',
          entityType: 'ticket',
          entityId: 'ticket-1',
          entityName: 'Ticket 1',
          action: 'created',
          metadata: {},
          createdAt: new Date().toISOString(),
        },
        {
          id: 'activity-2',
          type: 'comment_added',
          userId: 'user-2',
          userName: 'User 2',
          userAvatar: '/avatar2.png',
          entityType: 'ticket',
          entityId: 'ticket-2',
          entityName: 'Ticket 2',
          action: 'commented',
          metadata: {},
          createdAt: new Date().toISOString(),
        },
      ],
      readActivityIds: new Set(['activity-1']),
    });

    const { result } = renderHook(() => useRealtimeActivity());
    expect(result.current.unreadActivities).toHaveLength(1);
    expect(result.current.unreadActivities[0].id).toBe('activity-2');
  });

  it('should check if activity is read', () => {
    useSocketStore.setState({
      activities: [
        {
          id: 'activity-1',
          type: 'ticket_created',
          userId: 'user-1',
          userName: 'Test',
          userAvatar: '/avatar.png',
          entityType: 'ticket',
          entityId: 'ticket-1',
          entityName: 'Ticket',
          action: 'created',
          metadata: {},
          createdAt: new Date().toISOString(),
        },
      ],
      readActivityIds: new Set(['activity-1']),
    });

    const { result } = renderHook(() => useRealtimeActivity());
    expect(result.current.isRead('activity-1')).toBe(true);
    expect(result.current.isRead('activity-2')).toBe(false);
  });
});

describe('useConnectionStatus Hook', () => {
  it('should return current connection state', () => {
    useSocketStore.setState({ connectionState: 'connected' });

    const { result } = renderHook(() => useConnectionStatus());

    expect(result.current.state).toBe('connected');
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.isDisconnected).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('should correctly identify connecting state', () => {
    useSocketStore.setState({ connectionState: 'connecting' });

    const { result } = renderHook(() => useConnectionStatus());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(true);
  });

  it('should correctly identify error state', () => {
    useSocketStore.setState({ connectionState: 'error' });

    const { result } = renderHook(() => useConnectionStatus());

    expect(result.current.isError).toBe(true);
    expect(result.current.isConnected).toBe(false);
  });
});
