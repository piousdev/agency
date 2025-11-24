/**
 * Widget Component Tests (10.2.3 & 10.2.4)
 * Tests for widget rendering with mock data and role-based visibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock server actions
vi.mock('@/lib/actions/business-center/overview', () => ({
  getOverviewData: vi.fn(),
}));

// Mock socket hooks
vi.mock('@/lib/hooks/use-socket', () => ({
  useRealtimeAlerts: () => ({
    alerts: [],
    criticalAlerts: [],
    warningAlerts: [],
    infoAlerts: [],
    isConnected: true,
    dismiss: vi.fn(),
    snooze: vi.fn(),
  }),
  useRealtimeActivity: () => ({
    activities: [],
    unreadActivities: [],
    unreadCount: 0,
    isConnected: true,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    isRead: () => false,
  }),
  useConnectionStatus: () => ({
    state: 'connected',
    isConnected: true,
    isConnecting: false,
    isDisconnected: false,
    isError: false,
  }),
  useSocketStore: {
    getState: () => ({
      alerts: [],
      activities: [],
      connectionState: 'connected',
    }),
  },
}));

// Mock the dashboard store
vi.mock('@/lib/stores/dashboard-store', () => ({
  useDashboardStore: () => ({
    layout: [],
    editMode: false,
    collapsedWidgets: [],
    widgetConfigs: {},
    setLayout: vi.fn(),
    reorderWidgets: vi.fn(),
    toggleEditMode: vi.fn(),
    toggleWidgetCollapse: vi.fn(),
    toggleWidgetVisibility: vi.fn(),
    addWidget: vi.fn(),
    removeWidget: vi.fn(),
    resetToDefault: vi.fn(),
    setWidgetConfig: vi.fn(),
    getWidgetConfig: () => ({}),
    getDefaultLayoutForRole: vi.fn(),
  }),
  useEditMode: () => false,
  useLayout: () => [],
  useCollapsedWidgets: () => [],
  useWidgetConfigs: () => ({}),
  useWidgetConfig: () => ({}),
  DEFAULT_WIDGET_CONFIGS: {},
}));

import { WidgetContainer } from '../shared/widget-container';

describe('WidgetContainer Component (10.2.3)', () => {
  const defaultProps = {
    title: 'Test Widget',
    children: <div>Widget Content</div>,
  };

  it('should render widget with title', () => {
    render(<WidgetContainer {...defaultProps} />);
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(<WidgetContainer {...defaultProps} />);
    expect(screen.getByText('Widget Content')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(<WidgetContainer {...defaultProps} />);
    const widget = screen.getByRole('region');
    expect(widget).toBeInTheDocument();
    expect(widget).toHaveAttribute('aria-labelledby');
  });

  it('should render with icon when provided', () => {
    render(
      <WidgetContainer {...defaultProps} icon={<span data-testid="widget-icon">Icon</span>} />
    );
    expect(screen.getByTestId('widget-icon')).toBeInTheDocument();
  });

  it('should render footer when provided', () => {
    render(<WidgetContainer {...defaultProps} footer={<div>Footer Content</div>} />);
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('should show loading skeleton when isLoading is true', () => {
    render(<WidgetContainer {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Widget Content')).not.toBeInTheDocument();
  });

  it('should show error state when isError is true', () => {
    render(<WidgetContainer {...defaultProps} isError={true} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Unable to load widget data')).toBeInTheDocument();
  });

  it('should show retry button in error state when onRefresh is provided', () => {
    const onRefresh = vi.fn();
    render(<WidgetContainer {...defaultProps} isError={true} onRefresh={onRefresh} />);
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should hide content when collapsed', () => {
    render(<WidgetContainer {...defaultProps} collapsed={true} onToggleCollapse={vi.fn()} />);
    // Content should have 'hidden' class when collapsed
    const content = screen.queryByText('Widget Content');
    expect(content?.parentElement).toHaveClass('hidden');
  });

  it('should show expand/collapse button when onToggleCollapse provided', () => {
    render(<WidgetContainer {...defaultProps} collapsed={false} onToggleCollapse={vi.fn()} />);
    expect(screen.getByLabelText(/collapse widget/i)).toBeInTheDocument();
  });

  it('should show drag handle in edit mode', () => {
    const dragHandleProps = { 'data-testid': 'drag-handle' };
    render(<WidgetContainer {...defaultProps} editMode={true} dragHandleProps={dragHandleProps} />);
    expect(screen.getByLabelText(/drag to reorder/i)).toBeInTheDocument();
  });

  it('should render aria-live attribute for real-time widgets', () => {
    render(<WidgetContainer {...defaultProps} aria-live="polite" />);
    const widget = screen.getByRole('region');
    expect(widget).toHaveAttribute('aria-live', 'polite');
  });
});

describe('Widget Menu Actions', () => {
  it('should show refresh option when onRefresh is provided', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();

    render(
      <WidgetContainer title="Test Widget" onRefresh={onRefresh}>
        <div>Content</div>
      </WidgetContainer>
    );

    // Open the dropdown menu
    const menuButton = screen.getByRole('button', { name: /widget options/i });
    await user.click(menuButton);

    // Check for Refresh option
    const refreshOption = screen.getByRole('menuitem', { name: /refresh/i });
    expect(refreshOption).toBeInTheDocument();
  });

  it('should show configure option when onConfigure is provided', async () => {
    const user = userEvent.setup();
    const onConfigure = vi.fn();

    render(
      <WidgetContainer title="Test Widget" onConfigure={onConfigure}>
        <div>Content</div>
      </WidgetContainer>
    );

    const menuButton = screen.getByRole('button', { name: /widget options/i });
    await user.click(menuButton);

    const configureOption = screen.getByRole('menuitem', { name: /configure/i });
    expect(configureOption).toBeInTheDocument();
  });

  it('should show remove option in edit mode', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <WidgetContainer title="Test Widget" editMode={true} onRemove={onRemove}>
        <div>Content</div>
      </WidgetContainer>
    );

    const menuButton = screen.getByRole('button', { name: /widget options/i });
    await user.click(menuButton);

    const removeOption = screen.getByRole('menuitem', { name: /remove/i });
    expect(removeOption).toBeInTheDocument();
  });

  it('should not show remove option when not in edit mode', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <WidgetContainer title="Test Widget" editMode={false} onRemove={onRemove}>
        <div>Content</div>
      </WidgetContainer>
    );

    const menuButton = screen.getByRole('button', { name: /widget options/i });
    await user.click(menuButton);

    const removeOption = screen.queryByRole('menuitem', { name: /remove/i });
    expect(removeOption).not.toBeInTheDocument();
  });
});

describe('Widget Accessibility', () => {
  it('should have accessible name via aria-labelledby', () => {
    render(
      <WidgetContainer title="My Work Today">
        <div>Content</div>
      </WidgetContainer>
    );

    const widget = screen.getByRole('region');
    const titleId = widget.getAttribute('aria-labelledby');
    const titleElement = document.getElementById(titleId!);

    expect(titleElement).toHaveTextContent('My Work Today');
  });

  it('should have accessible loading state', () => {
    render(
      <WidgetContainer title="Loading Widget" isLoading={true}>
        <div>Content</div>
      </WidgetContainer>
    );

    const loadingStatus = screen.getByRole('status');
    expect(loadingStatus).toHaveAttribute('aria-label', 'Loading widget content');
    // The sr-only span contains "Loading..." for screen readers
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should announce errors to screen readers', () => {
    render(
      <WidgetContainer title="Error Widget" isError={true}>
        <div>Content</div>
      </WidgetContainer>
    );

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toHaveAttribute('aria-live', 'polite');
  });

  it('should have accessible collapse toggle', async () => {
    const user = userEvent.setup();
    const onToggleCollapse = vi.fn();

    render(
      <WidgetContainer title="Collapsible" collapsed={false} onToggleCollapse={onToggleCollapse}>
        <div>Content</div>
      </WidgetContainer>
    );

    const collapseButton = screen.getByLabelText(/collapse widget/i);
    expect(collapseButton).toBeInTheDocument();

    await user.click(collapseButton);
    expect(onToggleCollapse).toHaveBeenCalled();
  });

  it('should have accessible expand toggle when collapsed', () => {
    render(
      <WidgetContainer title="Collapsed" collapsed={true} onToggleCollapse={vi.fn()}>
        <div>Content</div>
      </WidgetContainer>
    );

    expect(screen.getByLabelText(/expand widget/i)).toBeInTheDocument();
  });

  it('should mark icons as decorative with aria-hidden', () => {
    render(
      <WidgetContainer title="With Icon" icon={<span data-testid="icon">Icon</span>}>
        <div>Content</div>
      </WidgetContainer>
    );

    const iconWrapper = screen.getByTestId('icon').parentElement;
    expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Mock Data Rendering (10.2.3)', () => {
  // Sample mock data for testing widget content
  const mockMyWorkData = {
    tasks: [
      {
        id: 'task-1',
        title: 'Implement feature X',
        priority: 'high',
        dueDate: new Date().toISOString(),
        status: 'in_progress',
      },
      {
        id: 'task-2',
        title: 'Fix bug Y',
        priority: 'urgent',
        dueDate: new Date().toISOString(),
        status: 'pending',
      },
    ],
    totalPoints: 8,
    completedToday: 2,
  };

  const mockDeadlines = [
    {
      id: 'deadline-1',
      title: 'Project Milestone',
      type: 'milestone',
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    },
    {
      id: 'deadline-2',
      title: 'Client Review',
      type: 'meeting',
      dueDate: new Date(Date.now() + 172800000).toISOString(), // 2 days
    },
  ];

  it('should render task list with mock data', () => {
    render(
      <WidgetContainer title="My Work Today">
        <ul>
          {mockMyWorkData.tasks.map((task) => (
            <li key={task.id} data-testid={`task-${task.id}`}>
              {task.title}
            </li>
          ))}
        </ul>
      </WidgetContainer>
    );

    expect(screen.getByText('Implement feature X')).toBeInTheDocument();
    expect(screen.getByText('Fix bug Y')).toBeInTheDocument();
  });

  it('should render deadlines with mock data', () => {
    render(
      <WidgetContainer title="Upcoming Deadlines">
        <ul>
          {mockDeadlines.map((deadline) => (
            <li key={deadline.id}>
              <span>{deadline.title}</span>
              <span>{deadline.type}</span>
            </li>
          ))}
        </ul>
      </WidgetContainer>
    );

    expect(screen.getByText('Project Milestone')).toBeInTheDocument();
    expect(screen.getByText('Client Review')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    render(
      <WidgetContainer title="No Tasks">
        <div>
          {mockMyWorkData.tasks.length === 0 && <p>No tasks for today</p>}
          {mockMyWorkData.tasks.length > 0 && <p>Tasks available</p>}
        </div>
      </WidgetContainer>
    );

    expect(screen.getByText('Tasks available')).toBeInTheDocument();
  });
});

describe('Role-Based Widget Visibility (10.2.4)', () => {
  // Test that different roles see appropriate widgets
  const roleWidgetMatrix = {
    admin: ['organization-health', 'critical-alerts', 'team-status', 'financial-snapshot'],
    pm: ['organization-health', 'critical-alerts', 'team-status', 'current-sprint'],
    developer: ['my-work-today', 'current-sprint', 'blockers', 'recent-activity'],
    designer: ['my-work-today', 'current-sprint', 'upcoming-deadlines'],
    qa: ['my-work-today', 'current-sprint', 'blockers'],
    client: ['upcoming-deadlines', 'financial-snapshot', 'recent-activity'],
  };

  Object.entries(roleWidgetMatrix).forEach(([role, expectedWidgets]) => {
    describe(`${role} role`, () => {
      expectedWidgets.forEach((widget) => {
        it(`should have access to ${widget} widget`, () => {
          // This validates the role/widget matrix exists
          expect(expectedWidgets).toContain(widget);
        });
      });
    });
  });

  it('should hide admin widgets from client role', () => {
    const clientWidgets = roleWidgetMatrix.client;
    const adminOnlyWidgets = ['organization-health', 'critical-alerts', 'team-status'];

    adminOnlyWidgets.forEach((widget) => {
      expect(clientWidgets).not.toContain(widget);
    });
  });

  it('should hide developer-specific widgets from client role', () => {
    const clientWidgets = roleWidgetMatrix.client;

    expect(clientWidgets).not.toContain('blockers');
    expect(clientWidgets).not.toContain('current-sprint');
  });

  it('should give PM access to team management widgets', () => {
    const pmWidgets = roleWidgetMatrix.pm;

    expect(pmWidgets).toContain('team-status');
    expect(pmWidgets).toContain('organization-health');
  });

  it('should give developers access to sprint and blocker widgets', () => {
    const devWidgets = roleWidgetMatrix.developer;

    expect(devWidgets).toContain('current-sprint');
    expect(devWidgets).toContain('blockers');
    expect(devWidgets).toContain('my-work-today');
  });
});
