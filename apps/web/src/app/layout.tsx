import '@/styles/globals.css';

import { ThemeProvider } from '@/components/provider/theme';
import { SentryInit } from '@/components/sentry-init';
import { Toaster } from '@/components/ui/sonner';
import { dmsans, fraunces, jetbrainMono } from '@/config/font';
import { cn } from '@/lib/utils';

import type { Metadata, Viewport } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Skyll - We Build What You Imagine',
    template: '%s | Skyll',
  },
  description:
    'Skyll is a creative agency providing web development, software development, and creative services globally. We build what you imagine.',
  keywords: [
    'Skyll',
    'creative agency',
    'web development',
    'software development',
    'creative services',
    'digital solutions',
  ],
  authors: [{ name: 'Skyll' }],
  creator: 'Skyll',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_BE',
    url: '/',
    title: 'Skyll - We Build What You Imagine',
    description:
      'Skyll is a creative agency providing web development, software development, and creative services globally. We build what you imagine.',
    siteName: 'Skyll',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skyll - We Build What You Imagine',
    description:
      'Skyll is a creative agency providing web development, software development, and creative services globally. We build what you imagine.',
  },
  robots: {
    index: false, // Not ready for public indexing yet
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          dmsans.variable,
          fraunces.variable,
          jetbrainMono.variable,
          'font-body antialiased'
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SentryInit />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
