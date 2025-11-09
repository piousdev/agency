import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { findSectionByPath, HELP_SECTIONS } from './config';
import type { ContentHeading, HelpContent } from './types';

/**
 * Parse markdown-style content and extract headings
 * Server-side utility for processing help content
 */
export function parseContent(content: string, slug: string[]): HelpContent {
  const lines = content.split('\n');
  const headings: ContentHeading[] = [];

  // Extract title from first heading or use slug
  let title = slug[slug.length - 1] || 'Help';

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch?.[1] && headingMatch[2]) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();

      // Use first h1 as title
      if (level === 1 && !title) {
        title = text;
      }

      // Generate ID from heading text (kebab-case)
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      headings.push({ id, text, level });
    }
  }

  return {
    slug,
    title,
    content,
    headings,
  };
}

/**
 * Load content from file system
 * Server-side only - reads files from content/help directory
 */
export async function loadContent(slug: string[]): Promise<HelpContent> {
  // Find the section in config
  const section = findSectionByPath(HELP_SECTIONS, slug);

  if (!section?.file) {
    // Return default content if no file is specified
    return {
      slug,
      title: section?.title || 'Help',
      content: `# ${section?.title || 'Help'}\n\nContent coming soon...`,
      headings: [
        {
          id: section?.slug || 'help',
          text: section?.title || 'Help',
          level: 1,
        },
      ],
    };
  }

  try {
    // Read content file
    const contentPath = join(process.cwd(), 'content', 'help', section.file);
    const content = await readFile(contentPath, 'utf-8');

    return parseContent(content, slug);
  } catch (error) {
    console.error(`Error loading content for ${slug.join('/')}:`, error);

    // Return fallback content
    return {
      slug,
      title: section.title,
      content: `# ${section.title}\n\nContent not available.`,
      headings: [{ id: section.slug, text: section.title, level: 1 }],
    };
  }
}

/**
 * Get default content (first available section)
 */
export async function getDefaultContent(): Promise<HelpContent> {
  // Find first section with content
  const firstSection = HELP_SECTIONS[0];
  if (!firstSection) {
    return {
      slug: [],
      title: 'Help',
      content: '# Help\n\nWelcome to the help documentation.',
      headings: [{ id: 'help', text: 'Help', level: 1 }],
    };
  }

  // Navigate to first leaf node
  let current = firstSection;
  const path: string[] = [current.slug];

  while (current.children && current.children.length > 0) {
    const next = current.children[0];
    if (!next) break;
    current = next;
    path.push(current.slug);
  }

  return loadContent(path);
}
