'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Global 404 Not Found page
 * Modern minimalist design with large typography and clear CTAs
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 bg-background">
      <div className="w-full max-w-lg text-center">
        {/* Large Error Code - Display Font */}
        <h1 className="font-display text-[8rem] sm:text-[10rem] font-bold leading-none tracking-tighter text-foreground/10 select-none">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Page not found
        </h2>

        {/* Description */}
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or
          deleted.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/dashboard">
              <Home className="size-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Go back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Or try one of these pages:</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/dashboard/projects"
              className="text-foreground hover:text-primary transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/dashboard/changelog"
              className="text-foreground hover:text-primary transition-colors"
            >
              Changelog
            </Link>
            <Link
              href="/dashboard/help"
              className="text-foreground hover:text-primary transition-colors"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
