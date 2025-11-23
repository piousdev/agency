'use client';

import { IconChevronDown, IconChevronRight, IconHistory } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ChangelogSection } from './types';

interface SidebarProps {
  sections: ChangelogSection[];
  className?: string;
}

/**
 * Changelog Sidebar Component
 * Client component for version navigation with active states
 * Manages expand/collapse state with localStorage persistence
 */
export function Sidebar({ sections, className }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem('changelog-expanded-sections');
    if (stored) {
      try {
        setExpandedSections(new Set(JSON.parse(stored)));
      } catch {
        // Ignore parse errors
      }
    } else {
      // Expand all sections by default for changelog
      const allIds = sections.map((s) => s.id);
      setExpandedSections(new Set(allIds));
    }
    setMounted(true);
  }, [sections]);

  // Save to localStorage when changed
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('changelog-expanded-sections', JSON.stringify([...expandedSections]));
    }
  }, [expandedSections, mounted]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const isExpanded = (sectionId: string) => expandedSections.has(sectionId);

  const renderSection = (
    section: ChangelogSection,
    depth: number = 0,
    parentPath: string[] = []
  ): React.ReactNode => {
    const hasChildren = section.children && section.children.length > 0;
    const expanded = isExpanded(section.id);
    // Build path, filtering out empty slugs
    const fullPath = section.slug ? [...parentPath, section.slug] : parentPath;
    const pathString = fullPath.filter(Boolean).join('/');
    const isActive =
      pathname === `/dashboard/changelog/${pathString}` ||
      (pathname === '/dashboard/changelog' && depth === 0);

    return (
      <div key={section.id} className="relative">
        {/* Vertical line for nested items */}
        {depth > 0 && (
          <div
            className="absolute left-2 top-0 h-full w-px bg-border"
            style={{ left: `${depth * 16 - 8}px` }}
          />
        )}

        <div className="relative" style={{ paddingLeft: `${depth * 16}px` }}>
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                isActive && 'bg-accent font-medium'
              )}
            >
              {expanded ? (
                <IconChevronDown className="size-4 shrink-0" />
              ) : (
                <IconChevronRight className="size-4 shrink-0" />
              )}
              <IconHistory className="size-4 shrink-0" />
              <span className="flex-1 text-left">{section.title}</span>
            </button>
          ) : (
            <Link
              href={`/dashboard/changelog/${pathString}`}
              className={cn(
                'flex flex-col gap-1 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                isActive && 'bg-accent font-medium'
              )}
            >
              <span className="font-medium">{section.title}</span>
              {section.date && (
                <span className="text-xs text-muted-foreground">{section.date}</span>
              )}
            </Link>
          )}
        </div>

        {/* Render children if expanded */}
        {hasChildren && expanded && (
          <div className="mt-1 space-y-1">
            {section.children?.map((child) => renderSection(child, depth + 1, fullPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn('w-64 border-r bg-background', className)}>
      <div className="sticky top-0">
        <div className="px-3 py-4">
          <h2 className="mb-2 px-3 text-lg font-semibold">Changelog</h2>
          <p className="px-3 text-xs text-muted-foreground">Release history</p>
        </div>
        <nav className="space-y-1 px-3 pb-4">
          {sections.map((section) => renderSection(section))}
        </nav>
      </div>
    </aside>
  );
}
