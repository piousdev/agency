interface ContentProps {
  children: React.ReactNode;
}

/**
 * Content Component
 * Server component wrapper for MDX help documentation content
 * Provides consistent article styling for all help pages
 */
export function Content({ children }: ContentProps) {
  return <article className="prose prose-slate max-w-none dark:prose-invert">{children}</article>;
}
