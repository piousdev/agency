import type { ReactNode } from 'react';

interface ContentProps {
  children: ReactNode;
}

/**
 * Changelog Content Component
 * Server component for rendering MDX changelog content
 * Wraps the MDX content in a styled article container
 */
export function Content({ children }: ContentProps) {
  return (
    <article className="prose prose-gray max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:font-medium prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-blue-400">
      {children}
    </article>
  );
}
