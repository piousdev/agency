import { getChangelogVersions } from '@/lib/changelog';

import type { ChangelogSection } from './types';

/**
 * Get Changelog Sections
 * Dynamically generates the changelog navigation tree from versioned directories
 */
export function getChangelogSections(): ChangelogSection[] {
  const versions = getChangelogVersions();

  return [
    {
      id: 'changelog',
      title: 'Changelog',
      slug: '', // Empty slug so children don't inherit "changelog" in path
      children: versions.map((version) => ({
        id: version.dateSlug,
        title: version.title,
        slug: version.dateSlug,
        version: version.version,
        date: version.date.toISOString().split('T')[0],
        file: version.filePath,
      })),
    },
  ];
}

/**
 * Cached changelog sections (generated once per build/request)
 */
export const CHANGELOG_SECTIONS = getChangelogSections();

/**
 * Get the full path to a section by its slug
 */
export function getSectionPath(sections: ChangelogSection[], targetSlug: string): string[] | null {
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
export function findSectionByPath(
  sections: ChangelogSection[],
  path: string[]
): ChangelogSection | null {
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
