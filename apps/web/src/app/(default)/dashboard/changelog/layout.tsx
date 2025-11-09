import type React from 'react';

/**
 * Changelog Layout
 * Custom layout for changelog pages that removes default margin
 * Applies negative margin to counteract parent's m-4
 */
export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return <div className="-m-4 flex h-full flex-col">{children}</div>;
}
