'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';

import { SectionItem } from './section-item';

import type { HelpSection } from './types';

interface SidebarProps {
  sections: HelpSection[];
  className?: string;
}

/**
 * Help Sidebar Component
 * Client component for collapsible navigation with active states
 * Manages expand/collapse state with localStorage persistence
 */
export function Sidebar({ sections, className }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSectionsList, setExpandedSectionsList] = useLocalStorage<string[]>(
    'help-expanded-sections',
    sections.length > 0 && sections[0] ? [sections[0].id] : []
  );

  const expandedSections = new Set(expandedSectionsList);

  const toggleSection = (sectionId: string) => {
    const next = new Set(expandedSections);
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    setExpandedSectionsList(Array.from(next));
  };

  const isExpanded = (sectionId: string) => expandedSections.has(sectionId);

  const renderSection = (
    section: HelpSection,
    depth = 0,
    parentPath: string[] = []
  ): React.ReactNode => {
    const hasChildren = section.children && section.children.length > 0;
    const expanded = isExpanded(section.id);
    const fullPath = [...parentPath, section.slug];
    const pathString = fullPath.join('/');
    const isActive = pathname === `/dashboard/help/${pathString}`;

    return (
      <div key={section.id} className="relative">
        {/* Vertical line for nested items */}
        {depth > 0 && (
          <div
            className="absolute left-2 top-0 h-full w-px bg-border"
            style={{ left: `${String(depth * 16 - 8)}px` }}
          />
        )}

        <div className="relative" style={{ paddingLeft: `${String(depth * 16)}px` }}>
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
              <span className="flex-1 text-left">{section.title}</span>
            </button>
          ) : (
            <SectionItem
              section={section}
              depth={depth}
              isActive={isActive}
              parentPath={parentPath}
            />
          )}
        </div>

        {/* Render children if expanded */}
        {hasChildren && expanded && (
          <div className="mt-1">
            {section.children?.map((child) => renderSection(child, depth + 1, fullPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={cn('w-64 space-y-1', className)}>
      {/* Home/Overview link */}
      <div className="mb-4">
        <SectionItem
          section={{
            id: 'home',
            title: 'Help Home',
            slug: '',
          }}
          depth={0}
          isActive={pathname === '/dashboard/help'}
          parentPath={[]}
        />
      </div>
      <div className="space-y-1">{sections.map((section) => renderSection(section, 0))}</div>
    </nav>
  );
}
