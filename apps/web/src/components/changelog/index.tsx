import { CHANGELOG_SECTIONS } from './config';
import { Content } from './content';
import { Sidebar } from './sidebar';
import { TableOfContents } from './table-of-contents';

import type { ReactNode } from 'react';

interface ChangelogProps {
  children: ReactNode;
}

/**
 * Changelog Component
 * Server component that orchestrates the changelog page layout
 * Combines sidebar navigation, MDX content, and table of contents
 */
export function Changelog({ children }: ChangelogProps) {
  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar - Version Navigation */}
      <Sidebar sections={CHANGELOG_SECTIONS} className="shrink-0 py-6 pl-6" />

      {/* Main Content Area - MDX Content */}
      <main className="min-w-0 flex-1 px-8 py-6">
        <Content>{children}</Content>
      </main>

      {/* Right Sidebar - Table of Contents */}
      <aside className="hidden shrink-0 py-6 pr-6 xl:block">
        <TableOfContents />
      </aside>
    </div>
  );
}
