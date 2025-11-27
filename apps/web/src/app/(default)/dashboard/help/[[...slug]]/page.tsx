import { notFound } from 'next/navigation';

import { Help } from '@/components/help';
import { findSectionByPath, HELP_SECTIONS } from '@/components/help/config';
import { loadMDXFile } from '@/lib/mdx';

interface HelpPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

/**
 * Get the default help slug (first section with content)
 */
function getDefaultSlug(): string[] {
  const firstSection = HELP_SECTIONS[0];
  if (!firstSection) return [];

  // Navigate to first leaf node
  let current = firstSection;
  const path: string[] = [current.slug];

  while (current.children && current.children.length > 0) {
    const next = current.children[0];
    if (!next) break;
    current = next;
    path.push(current.slug);
  }

  return path;
}

/**
 * Dynamic Help Page
 * Server component that handles all help documentation routes
 * Route: /dashboard/help/[[...slug]]
 *
 * MDX files are dynamically loaded based on route
 */
export default async function HelpPage({ params }: HelpPageProps) {
  const { slug } = await params;

  // Use provided slug or get default
  const helpSlug = slug && slug.length > 0 ? slug : getDefaultSlug();

  // Find the section in config
  const section = findSectionByPath(HELP_SECTIONS, helpSlug);

  if (!section?.file) {
    notFound();
  }

  try {
    // Dynamically load and compile the MDX file
    const { content } = await loadMDXFile(section.file);

    return <Help>{content}</Help>;
  } catch (error) {
    console.error(`Error loading help content for ${section.file}:`, error);

    // Fallback for missing content
    return (
      <Help>
        <h1>{section.title}</h1>
        <p>Content coming soon...</p>
      </Help>
    );
  }
}

/**
 * Generate static params for known help pages
 * This enables static generation at build time for better performance
 */
export function generateStaticParams() {
  // Return at least one param for the root help page
  return [{ slug: [] }];
}

/**
 * Metadata for help pages
 */
export function generateMetadata() {
  return {
    title: 'Help & Documentation',
    description: 'Browse our comprehensive help documentation and guides',
  };
}
