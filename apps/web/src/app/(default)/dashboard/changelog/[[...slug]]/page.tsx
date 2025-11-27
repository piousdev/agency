import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';

import { Changelog } from '@/components/changelog';
import { getChangelogVersions, getAdjacentVersions } from '@/lib/changelog';
import { loadMDXFile } from '@/lib/mdx';

interface ChangelogPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

/**
 * Dynamic Changelog Page
 * Server component that renders versioned changelog entries
 * Route: /dashboard/changelog/[[...slug]]
 */
export default async function ChangelogPage({ params }: ChangelogPageProps) {
  const { slug } = await params;

  // Get all versions
  const versions = getChangelogVersions();

  // If no slug, redirect to latest version
  if (!slug || slug.length === 0) {
    if (versions.length === 0) {
      return (
        <Changelog>
          <h1>Changelog</h1>
          <p>No changelog entries found. Create your first version to get started.</p>
        </Changelog>
      );
    }

    // Redirect to latest version (we know versions has at least one element here)
    const latestVersion = versions[0];
    if (latestVersion) {
      redirect(`/dashboard/changelog/${latestVersion.dateSlug}`);
    }
  }

  const dateSlug = slug[0]; // We know slug has at least one element here
  if (!dateSlug) {
    notFound();
  }

  // Find the version
  const version = versions.find((v) => v.dateSlug === dateSlug);

  if (!version) {
    notFound();
  }

  // Get adjacent versions for navigation
  const { prev, next } = getAdjacentVersions(dateSlug);

  try {
    // Load the changelog MDX content
    const { content } = await loadMDXFile(version.filePath);

    return (
      <Changelog>
        {content}

        {/* Next/Previous Navigation */}
        {(prev ?? next) && (
          <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
            <div className="flex-1">
              {prev ? (
                <Link
                  href={`/dashboard/changelog/${prev.dateSlug}`}
                  className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <IconArrowLeft className="size-4" />
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider">Previous</span>
                    <span className="font-medium">{prev.title}</span>
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>

            <div className="flex-1 text-right">
              {next ? (
                <Link
                  href={`/dashboard/changelog/${next.dateSlug}`}
                  className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider">Next</span>
                    <span className="font-medium">{next.title}</span>
                  </div>
                  <IconArrowRight className="size-4" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        )}
      </Changelog>
    );
  } catch (error) {
    console.error(`Error loading changelog for ${dateSlug}:`, error);

    // Fallback for missing content
    return (
      <Changelog>
        <h1>{version.title}</h1>
        <p>Content coming soon...</p>
      </Changelog>
    );
  }
}

/**
 * Generate static params for known changelog pages
 * This enables static generation at build time for better performance
 */
export function generateStaticParams() {
  // Return at least one param for the root changelog page
  // Additional versions can be added dynamically
  return [{ slug: [] }];
}

/**
 * Metadata for changelog pages
 */
export function generateMetadata() {
  return {
    title: 'Changelog - Skyll Platform',
    description: 'Release history and updates for the Skyll Platform monorepo',
  };
}
