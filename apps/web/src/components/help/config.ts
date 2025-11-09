import type { HelpSection } from './types';

/**
 * Help Documentation Structure Configuration
 * Defines the navigation tree for the help documentation
 */
export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'documentation',
    title: 'Documentation',
    slug: 'documentation',
    children: [
      {
        id: 'fundamentals',
        title: 'Fundamentals',
        slug: 'fundamentals',
        children: [
          {
            id: 'basics',
            title: 'The basics',
            slug: 'basics',
            file: 'fundamentals/basics.txt',
          },
          {
            id: 'methods',
            title: 'Methods and Parameters',
            slug: 'methods',
            file: 'fundamentals/methods.txt',
          },
        ],
      },
      {
        id: 'alternative-schemas',
        title: 'Alternative Schemas',
        slug: 'alternative-schemas',
        children: [
          {
            id: 'file-system',
            title: 'File system',
            slug: 'file-system',
            file: 'fundamentals/file-system.txt',
          },
          {
            id: 'describing-responses',
            title: 'Describing responses',
            slug: 'describing-responses',
            file: 'fundamentals/describing-responses.txt',
          },
        ],
      },
      {
        id: 'e-commerce',
        title: 'E-Commerce',
        slug: 'e-commerce',
        children: [
          {
            id: 'path-parameters',
            title: 'Path parameters',
            slug: 'path-parameters',
            file: 'e-commerce/path-parameters.txt',
          },
          {
            id: 'query-parameters',
            title: 'Query string parameters',
            slug: 'query-parameters',
            file: 'e-commerce/query-parameters.txt',
          },
        ],
      },
    ],
  },
  {
    id: 'guides',
    title: 'Guides / Tutorials',
    slug: 'guides',
    children: [
      {
        id: 'getting-started',
        title: 'Getting Started',
        slug: 'getting-started',
        file: 'guides/getting-started.txt',
      },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    slug: 'support',
    file: 'support/index.txt',
    children: [],
  },
];

/**
 * Get the full path to a section by its slug
 */
export function getSectionPath(sections: HelpSection[], targetSlug: string): string[] | null {
  for (const section of sections) {
    if (section.slug === targetSlug) {
      return [section.slug];
    }
    if (section.children) {
      const childPath = getSectionPath(section.children, targetSlug);
      if (childPath) {
        return [section.slug, ...childPath];
      }
    }
  }
  return null;
}

/**
 * Find a section by its path
 */
export function findSectionByPath(sections: HelpSection[], path: string[]): HelpSection | null {
  if (path.length === 0) return null;

  const [current, ...rest] = path;
  const section = sections.find((s) => s.slug === current);

  if (!section) return null;
  if (rest.length === 0) return section;
  if (!section.children) return null;

  return findSectionByPath(section.children, rest);
}

/**
 * Get all parent section IDs for a given path
 */
export function getParentIds(path: string[]): string[] {
  const parents: string[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    parents.push(path.slice(0, i + 1).join('-'));
  }
  return parents;
}
