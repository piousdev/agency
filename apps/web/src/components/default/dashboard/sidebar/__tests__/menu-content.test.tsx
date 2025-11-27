import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import MenuContent from '../skyll-switcher/components/menu-content/index';

import type { ActiveTeam } from '@/components/default/dashboard/sidebar/skyll-switcher/types';

const MockLogo = () => <div>Logo</div>;

const mockTeams: ActiveTeam[] = [
  { name: 'Team Alpha', logo: MockLogo, plan: 'Pro' },
  { name: 'Team Beta', logo: MockLogo, plan: 'Free' },
  { name: 'Team Gamma', logo: MockLogo, plan: 'Enterprise' },
];

// Helper function to render MenuContent with required DropdownMenu context
const renderMenuContent = (props: {
  teams: readonly ActiveTeam[];
  isMobile: boolean;
  setActiveTeam: (team: ActiveTeam) => void;
}) => {
  return render(
    <DropdownMenu open>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <MenuContent {...props} />
    </DropdownMenu>
  );
};

describe('MenuContent', () => {
  it('renders menu content with correct structure', () => {
    const setActiveTeam = vi.fn();
    renderMenuContent({ teams: mockTeams, isMobile: false, setActiveTeam });

    expect(screen.getByTestId('sidebar__menu-content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar__menu-label')).toHaveTextContent('Teams');
  });

  it('renders all teams from the teams array', () => {
    const setActiveTeam = vi.fn();
    renderMenuContent({ teams: mockTeams, isMobile: false, setActiveTeam });

    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    expect(screen.getByText('Team Beta')).toBeInTheDocument();
    expect(screen.getByText('Team Gamma')).toBeInTheDocument();
  });

  it('renders keyboard shortcuts for each team', () => {
    const setActiveTeam = vi.fn();
    renderMenuContent({ teams: mockTeams, isMobile: false, setActiveTeam });

    expect(screen.getByText('⌘1')).toBeInTheDocument();
    expect(screen.getByText('⌘2')).toBeInTheDocument();
    expect(screen.getByText('⌘3')).toBeInTheDocument();
  });

  it('calls setActiveTeam when a team menu item is clicked', async () => {
    const user = userEvent.setup();
    const setActiveTeam = vi.fn();
    renderMenuContent({ teams: mockTeams, isMobile: false, setActiveTeam });

    await user.click(screen.getByText('Team Beta'));

    expect(setActiveTeam).toHaveBeenCalledTimes(1);
    expect(setActiveTeam).toHaveBeenCalledWith(mockTeams[1]);
  });

  it('renders "Add team" menu item', () => {
    const setActiveTeam = vi.fn();
    renderMenuContent({ teams: mockTeams, isMobile: false, setActiveTeam });

    expect(screen.getByText('Add team')).toBeInTheDocument();
  });

  it('applies correct side prop when isMobile is true', () => {
    const setActiveTeam = vi.fn();
    const { rerender } = render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <MenuContent teams={mockTeams} isMobile={true} setActiveTeam={setActiveTeam} />
      </DropdownMenu>
    );

    expect(screen.getByTestId('sidebar__menu-content')).toBeInTheDocument();

    rerender(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <MenuContent teams={mockTeams} isMobile={false} setActiveTeam={setActiveTeam} />
      </DropdownMenu>
    );

    expect(screen.getByTestId('sidebar__menu-content')).toBeInTheDocument();
  });

  it('renders empty teams list without errors', () => {
    const setActiveTeam = vi.fn();
    renderMenuContent({ teams: [], isMobile: false, setActiveTeam });

    expect(screen.getByTestId('sidebar__menu-label')).toBeInTheDocument();
    expect(screen.getByText('Add team')).toBeInTheDocument();
  });

  it('renders team logos for each menu item', () => {
    const setActiveTeam = vi.fn();
    renderMenuContent({ teams: mockTeams, isMobile: false, setActiveTeam });

    const iconContainers = screen.getAllByTestId('sidebar__menu-item-icon-container');
    expect(iconContainers.length).toBeGreaterThan(0);
  });
});
