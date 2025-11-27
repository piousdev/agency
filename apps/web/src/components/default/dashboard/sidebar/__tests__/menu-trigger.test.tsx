import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import MenuTrigger from '../skyll-switcher/components/menu-trigger/index';

import type { ActiveTeam } from '@/components/default/dashboard/sidebar/skyll-switcher/types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    // Mock Image as a div to avoid img element warning in tests
    <div
      data-testid={props['data-testid']}
      data-src={src}
      data-alt={alt}
      role="img"
      aria-label={alt}
      {...props}
    />
  ),
}));

// Mock UI components
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenuTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenuButton: ({ children, className, ...props }: any) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@tabler/icons-react', () => ({
  IconSelector: (props: any) => <svg {...props} />,
}));

describe('MenuTrigger', () => {
  const MockLogoComponent = () => <div data-testid="mock-logo">Logo</div>;

  const mockActiveTeamWithStringLogo: ActiveTeam = {
    name: 'Test Team',
    logo: '/test-logo.png',
    plan: 'Pro Plan',
  };

  const mockActiveTeamWithComponentLogo: ActiveTeam = {
    name: 'Test Team',
    logo: MockLogoComponent,
    plan: 'Free Plan',
  };

  it('renders the menu trigger with correct test ids', () => {
    render(<MenuTrigger activeTeam={mockActiveTeamWithStringLogo} />);

    expect(screen.getByTestId('sidebar__menu-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar__menu-trigger-button')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar__menu-trigger-icon-container')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar__menu-trigger-text-container')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar__menu-trigger-icon')).toBeInTheDocument();
  });

  it('displays team name and plan correctly', () => {
    render(<MenuTrigger activeTeam={mockActiveTeamWithStringLogo} />);

    expect(screen.getByTestId('sidebar__menu-trigger-text-name')).toHaveTextContent('Test Team');
    expect(screen.getByTestId('sidebar__menu-trigger-text-plan')).toHaveTextContent('Pro Plan');
  });

  it('renders Image component when logo is provided', () => {
    render(<MenuTrigger activeTeam={mockActiveTeamWithStringLogo} />);

    const image = screen.getByTestId('sidebar__menu-trigger-icon-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('data-src', '/test-logo.png');
    expect(image).toHaveAttribute('data-alt', 'Test Team logo');
  });

  it('renders fallback text when logo is not a string', () => {
    render(<MenuTrigger activeTeam={mockActiveTeamWithComponentLogo} />);

    const fallback = screen.getByTestId('sidebar__menu-trigger-icon-fallback');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent('T');
  });

  it('applies correct className to SidebarMenuButton', () => {
    render(<MenuTrigger activeTeam={mockActiveTeamWithStringLogo} />);

    const button = screen.getByTestId('sidebar__menu-trigger-button');
    expect(button).toHaveClass(
      'data-[state=open]:bg-sidebar-accent',
      'data-[state=open]:text-sidebar-accent-foreground'
    );
  });

  it('renders IconSelector component', () => {
    render(<MenuTrigger activeTeam={mockActiveTeamWithStringLogo} />);

    const icon = screen.getByTestId('sidebar__menu-trigger-icon');
    expect(icon).toBeInTheDocument();
  });
});
