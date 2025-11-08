import type { Metadata } from 'next';
import { dmsans, fraunces, jetbrainMono } from '@/config/font';
import '@/styles/globals.css';
import type React from 'react';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { SentryInit } from '@/components/sentry-init';

export const metadata: Metadata = {
  title: 'Skyll Platform',
  description: 'Internal operations system for Skyll creative agency',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          dmsans.variable,
          fraunces.variable,
          jetbrainMono.variable,
          'font-body antialiased'
        )}
      >
        <SentryInit />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
