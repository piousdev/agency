'use client';

import { IconMoon, IconSun } from '@tabler/icons-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full cursor-pointer"
    >
      <IconSun
        className={cn(
          'size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0',
          className
        )}
      />
      <IconMoon
        className={cn(
          'absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100',
          className
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
