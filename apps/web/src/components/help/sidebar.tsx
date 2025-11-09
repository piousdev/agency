'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem('help-expanded-sections');
    if (stored) {
      try {
        setExpandedSections(new Set(JSON.parse(stored)));
      } catch {
        // Ignore parse errors
      }
    } else {
      // Expand the first section by default
      if (sections.length > 0 && sections[0]) {
        setExpandedSections(new Set([sections[0].id]));
      }
    }
    setMounted(true);
  }, [sections]);

  // Save to localStorage when changed
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('help-expanded-sections', JSON.stringify([...expandedSections]));
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
    section: HelpSection,
    depth: number = 0,
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
                <ChevronDown className="size-4 shrink-0" />
              ) : (
                <ChevronRight className="size-4 shrink-0" />
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
