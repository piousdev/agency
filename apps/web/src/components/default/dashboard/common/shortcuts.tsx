'use client';

import * as React from 'react';

import { IconCommand } from '@tabler/icons-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
      { keys: ['⌘', '/'], description: 'Show keyboard shortcuts' },
      { keys: ['ESC'], description: 'Close dialog or menu' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['⌘', 'S'], description: 'Save changes' },
      { keys: ['⌘', 'Enter'], description: 'Submit form' },
      { keys: ['⌘', 'N'], description: 'Create new item' },
      { keys: ['⌘', 'E'], description: 'Edit current item' },
      { keys: ['⌘', 'D'], description: 'Duplicate item' },
    ],
  },
  {
    title: 'Selection',
    shortcuts: [
      { keys: ['⌘', 'A'], description: 'Select all items' },
      { keys: ['Shift', '↑/↓'], description: 'Select multiple items' },
      { keys: ['⌘', 'Click'], description: 'Select individual items' },
    ],
  },
  {
    title: 'View',
    shortcuts: [
      { keys: ['⌘', 'T'], description: 'Toggle theme' },
      { keys: ['⌘', '['], description: 'Go back' },
      { keys: ['⌘', ']'], description: 'Go forward' },
      { keys: ['⌘', 'R'], description: 'Refresh view' },
    ],
  },
  {
    title: 'Search',
    shortcuts: [
      { keys: ['⌘', 'F'], description: 'Search in current view' },
      { keys: ['⌘', 'G'], description: 'Find next' },
      { keys: ['⌘', 'Shift', 'G'], description: 'Find previous' },
    ],
  },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCommand className="size-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Boost your productivity with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-sm font-semibold text-foreground">{group.title}</h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={`${group.title}-${shortcut.description}`}
                      className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2.5"
                    >
                      <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                      <KbdGroup>
                        {shortcut.keys.map((key) => (
                          <Kbd key={`${group.title}-${shortcut.description}-${key}`}>{key}</Kbd>
                        ))}
                      </KbdGroup>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
          Press{' '}
          <KbdGroup className="inline-flex">
            <Kbd>⌘</Kbd>
            <Kbd>/</Kbd>
          </KbdGroup>{' '}
          to toggle this dialog
        </div>
      </DialogContent>
    </Dialog>
  );
}
