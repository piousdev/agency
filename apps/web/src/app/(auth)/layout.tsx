import type React from 'react';

/**
 * Auth Layout
 * Layout for authentication-related pages (login, signup, verify-email, etc.)
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
