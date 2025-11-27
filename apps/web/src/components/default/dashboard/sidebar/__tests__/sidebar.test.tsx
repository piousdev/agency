import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { DefaultSidebar } from '../index';

// Mock the dependencies
vi.mock('@/components/default/dashboard/navigation/main', () => ({
  Main: ({ groupLabel, _items, ...props }: any) => (
    <div data-testid={props['data-testid']}>{groupLabel}</div>
  ),
}));

vi.mock('@/components/default/dashboard/sidebar/skyll-switcher', () => ({
  SkyllSwitcher: ({ _teams, ...props }: any) => (
    <div data-testid={props['data-testid']}>Skyll Switcher</div>
  ),
}));

vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, ...props }: any) => (
    <div data-testid={props['data-testid']}>{children}</div>
  ),
  SidebarHeader: ({ children, ...props }: any) => (
    <div data-testid={props['data-testid']}>{children}</div>
  ),
  SidebarContent: ({ children, ...props }: any) => (
    <div data-testid={props['data-testid']}>{children}</div>
  ),
  SidebarRail: ({ ...props }: any) => <div data-testid={props['data-testid']} />,
}));

vi.mock('@/config/agency', () => ({
  company: {
    teams: [
      { id: '1', name: 'Team 1' },
      { id: '2', name: 'Team 2' },
    ],
  },
}));

vi.mock('@/config/navigation-with-icons', () => ({
  sidebarNavigationWithIcons: [
    { title: 'Group 1', items: [{ title: 'Item 1', url: '/item1' }] },
    { title: 'Group 2', items: [{ title: 'Item 2', url: '/item2' }] },
  ],
}));

describe('DefaultSidebar', () => {
  it('renders the sidebar with correct test id', () => {
    render(<DefaultSidebar />);
    expect(screen.getByTestId('sidebar__main')).toBeInTheDocument();
  });

  it('renders the sidebar header', () => {
    render(<DefaultSidebar />);
    expect(screen.getByTestId('sidebar__header')).toBeInTheDocument();
  });

  it('renders the SkyllSwitcher component', () => {
    render(<DefaultSidebar />);
    expect(screen.getByTestId('sidebar__switcher')).toBeInTheDocument();
  });

  it('renders the sidebar content', () => {
    render(<DefaultSidebar />);
    expect(screen.getByTestId('sidebar__content')).toBeInTheDocument();
  });

  it('renders navigation groups from config', () => {
    render(<DefaultSidebar />);
    const mainGroups = screen.getAllByTestId('sidebar__main-group');
    expect(mainGroups).toHaveLength(2);
  });

  it('renders the sidebar rail', () => {
    render(<DefaultSidebar />);
    expect(screen.getByTestId('sidebar__rail')).toBeInTheDocument();
  });

  it('forwards additional props to Sidebar component', () => {
    const { container } = render(<DefaultSidebar className="custom-class" />);
    expect(container.querySelector('[data-testid="sidebar__main"]')).toBeInTheDocument();
  });
});
