import { getContentNavigation } from '@/lib/mdx';

import type { HelpSection } from './types';

/**
 * Help Documentation Structure Configuration
 * Auto-generated from content/help directory structure + frontmatter
 */
export function getHelpSections(): HelpSection[] {
  const navigationTree = getContentNavigation('help');

  // Convert NavigationItem[] to HelpSection[]
  const convertToHelpSections = (items: ReturnType<typeof getContentNavigation>): HelpSection[] => {
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      file: item.filePath,
      children: item.children ? convertToHelpSections(item.children) : [],
    }));
  };

  return convertToHelpSections(navigationTree);
}

/**
 * Cached help sections (generated once per build/request)
 */
export const HELP_SECTIONS = getHelpSections();

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
