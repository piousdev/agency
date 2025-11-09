import { HELP_SECTIONS } from './config';
import { Content } from './content';
import { Sidebar } from './sidebar';
import { TableOfContents } from './table-of-contents';

interface HelpProps {
  children: React.ReactNode;
}

/**
 * Help Component
 * Server component that orchestrates the help page layout
 * Combines sidebar navigation, MDX content, and table of contents
 */
export function Help({ children }: HelpProps) {
  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar - Navigation */}
      <Sidebar sections={HELP_SECTIONS} className="shrink-0 py-6 pl-6" />

      {/* Main Content Area */}
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
