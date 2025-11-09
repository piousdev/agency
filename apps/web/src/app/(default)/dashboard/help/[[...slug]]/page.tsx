import { notFound } from 'next/navigation';
import { Help } from '@/components/help';
import { getDefaultContent, loadContent } from '@/components/help/utils';

interface HelpPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

/**
 * Dynamic Help Page
 * Server component that handles all help documentation routes
 * Route: /dashboard/help/[[...slug]]
 */
export default async function HelpPage({ params }: HelpPageProps) {
  const { slug } = await params;

  try {
    // Load content based on slug, or default content if no slug
    const content = slug && slug.length > 0 ? await loadContent(slug) : await getDefaultContent();

    return <Help content={content} />;
  } catch (error) {
    console.error('Error loading help content:', error);
    notFound();
  }
}

/**
 * Generate static params for known help pages
 * This enables static generation at build time for better performance
 */
export function generateStaticParams() {
  // Return empty array to enable dynamic routing
  // TODO: Add static paths when content structure is finalized
  return [];
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
