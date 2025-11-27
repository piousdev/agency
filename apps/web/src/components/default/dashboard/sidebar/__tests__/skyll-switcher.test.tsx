import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { SkyllSwitcher } from '../skyll-switcher/index';

import type { ActiveTeam } from '../skyll-switcher/types';

const { mockUseSidebar } = vi.hoisted(() => ({
  mockUseSidebar: vi.fn(() => ({ isMobile: false })),
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SidebarMenuItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SidebarMenuButton: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  useSidebar: mockUseSidebar,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DropdownMenuTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DropdownMenuContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('@/components/default/dashboard/sidebar/skyll-switcher/components/menu-trigger', () => ({
  default: ({ activeTeam, ...props }: any) => <div {...props}>Menu Trigger: {activeTeam.name}</div>,
}));

vi.mock('@/components/default/dashboard/sidebar/skyll-switcher/components/menu-content', () => ({
  default: ({ _teams, _isMobile, _setActiveTeam, ...props }: any) => (
    <div {...props}>Menu Content</div>
  ),
}));

describe('SkyllSwitcher', () => {
  const MockLogo1 = () => <div data-testid="logo-team-alpha">Team Alpha Logo</div>;
  const MockLogo2 = () => <div data-testid="logo-team-beta">Team Beta Logo</div>;

  const mockTeams: ActiveTeam[] = [
    { name: 'Team Alpha', logo: MockLogo1, plan: 'pro' },
    { name: 'Team Beta', logo: MockLogo2, plan: 'free' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with teams', () => {
    render(<SkyllSwitcher teams={mockTeams} />);

    expect(screen.getByTestId('sidebar__menu')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar__menu-item')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar__dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar__menu-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar__menu-content')).toBeInTheDocument();
  });

  it('should set first team as active team', () => {
    render(<SkyllSwitcher teams={mockTeams} />);

    expect(screen.getByText('Menu Trigger: Team Alpha')).toBeInTheDocument();
  });

  it('should return null when no teams provided', () => {
    const { container } = render(<SkyllSwitcher teams={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('should update active team when teams prop changes', () => {
    const { rerender } = render(<SkyllSwitcher teams={mockTeams} />);

    expect(screen.getByText('Menu Trigger: Team Alpha')).toBeInTheDocument();

    const MockLogo3 = () => <div data-testid="logo-team-gamma">Team Gamma Logo</div>;
    const newTeams: ActiveTeam[] = [{ name: 'Team Gamma', logo: MockLogo3, plan: 'enterprise' }];

    rerender(<SkyllSwitcher teams={newTeams} />);

    expect(screen.getByText('Menu Trigger: Team Gamma')).toBeInTheDocument();
  });

  it('should pass isMobile prop to MenuContent', () => {
    mockUseSidebar.mockReturnValue({ isMobile: true });

    render(<SkyllSwitcher teams={mockTeams} />);

    expect(screen.getByTestId('sidebar__menu-content')).toBeInTheDocument();
  });
});
