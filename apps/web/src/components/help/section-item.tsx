'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';

import type { HelpSection } from './types';

interface SectionItemProps {
  section: HelpSection;
  depth: number;
  isActive: boolean;
  parentPath?: string[];
}

const DEFAULT_PARENT_PATH: string[] = [];

/**
 * Section Item Component
 * Renders individual sidebar navigation items
 * Client component for link navigation and active state
 */
export function SectionItem({ section, isActive, parentPath = DEFAULT_PARENT_PATH }: SectionItemProps) {
  // Build the full URL path from parent path and section slug
  const fullPath = [...parentPath, section.slug];
  const href = `/dashboard/help/${fullPath.join('/')}`;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
        isActive && 'bg-accent font-medium text-accent-foreground',
        !isActive && 'text-muted-foreground hover:text-foreground'
      )}
    >
      <span className="flex-1">{section.title}</span>
    </Link>
  );
}
