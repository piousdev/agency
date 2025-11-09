import type React from 'react';

/**
 * Help Layout
 * Custom layout for help pages that removes default margin
 * Applies negative margin to counteract parent's m-4
 */
export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <div className="-m-4 flex h-full flex-col">{children}</div>;
}
