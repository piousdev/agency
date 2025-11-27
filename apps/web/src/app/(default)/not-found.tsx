'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { IconHome, IconArrowLeft } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

/**
 * 404 Not Found page for the dashboard route group
 * Renders within the dashboard layout - smaller variant
 */
export default function DashboardNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12">
      <div className="w-full max-w-md text-center">
        {/* Large Error Code */}
        <h1 className="font-display text-[6rem] sm:text-[8rem] font-bold leading-none tracking-tighter text-foreground/10 select-none">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Page not found
        </h2>

        {/* Description */}
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          This page doesn&apos;t exist in the dashboard.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">
              <IconHome className="size-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            <IconArrowLeft className="size-4" />
            Go back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-10 pt-6 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            <Link
              href="/dashboard/projects"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/dashboard/changelog"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Changelog
            </Link>
            <Link
              href="/dashboard/help"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
