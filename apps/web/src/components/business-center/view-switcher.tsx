'use client';

import { IconLayoutGrid, IconList, IconLayoutKanban } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'table' | 'cards' | 'kanban';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  showKanban?: boolean; // Some pages might not have kanban view
}

export function ViewSwitcher({ currentView, onViewChange, showKanban = true }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={currentView === 'table' ? 'default' : 'outline'}
        size="sm"
        className="h-9 gap-2"
        onClick={() => onViewChange('table')}
      >
        <IconList className="h-4 w-4" />
        Table
      </Button>
      <Button
        variant={currentView === 'cards' ? 'default' : 'outline'}
        size="sm"
        className="h-9 gap-2"
        onClick={() => onViewChange('cards')}
      >
        <IconLayoutGrid className="h-4 w-4" />
        Cards
      </Button>
      {showKanban && (
        <Button
          variant={currentView === 'kanban' ? 'default' : 'outline'}
          size="sm"
          className="h-9 gap-2"
          onClick={() => onViewChange('kanban')}
        >
          <IconLayoutKanban className="h-4 w-4" />
          Kanban
        </Button>
      )}
    </div>
  );
}
