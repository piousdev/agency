import type React from 'react';

/**
 * Home Layout
 * Layout for the landing/home page
 */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* TODO: Add header/footer when needed */}
      {children}
    </div>
  );
}
