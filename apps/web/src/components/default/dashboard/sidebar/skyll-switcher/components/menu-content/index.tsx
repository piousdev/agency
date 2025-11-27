import { IconPlus } from '@tabler/icons-react';

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';

import type { ActiveTeam } from '@/components/default/dashboard/sidebar/skyll-switcher/types';

interface MenuContentProps {
  readonly teams: readonly ActiveTeam[];
  readonly isMobile: boolean;
  readonly setActiveTeam: (team: ActiveTeam) => void;
}

export default function MenuContent({ teams, isMobile, setActiveTeam }: MenuContentProps) {
  return (
    <DropdownMenuContent
      className="min-w-56 rounded-lg"
      style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      align="start"
      side={isMobile ? 'bottom' : 'right'}
      sideOffset={4}
      data-testid="sidebar__menu-content"
    >
      <DropdownMenuLabel
        className="text-muted-foreground text-xs"
        data-testid="sidebar__menu-label"
      >
        Teams
      </DropdownMenuLabel>
      {teams.map((team, index) => (
        <DropdownMenuItem
          key={team.name}
          onClick={() => setActiveTeam(team)}
          className="gap-2 p-2"
          data-testid="sidebar__menu-item"
        >
          <div
            className="flex size-6 items-center justify-center rounded-md border"
            data-testid="sidebar__menu-item-icon-container"
          >
            <team.logo className="size-3.5 shrink-0" data-testid="sidebar__menu-item-icon-image" />
          </div>
          {team.name}
          <DropdownMenuShortcut data-testid="sidebar__menu-item-shortcut">
            ⌘{index + 1}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      {/* No onClick handler for "Add team" menu item. Add one if needed. */}
      <DropdownMenuItem className="gap-2 p-2" data-testid="sidebar__menu-item">
        <div
          className="flex size-6 items-center justify-center rounded-md border bg-transparent"
          data-testid="sidebar__menu-item-icon-container"
        >
          <IconPlus className="size-4" data-testid="sidebar__menu-item-icon-image" />
        </div>
        <div className="text-muted-foreground font-medium" data-testid="sidebar__menu-item-text">
          Add team
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
