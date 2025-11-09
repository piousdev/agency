import { readdirSync, statSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { scanMDXDirectory, type MDXFile } from './mdx';

/**
 * Changelog Version Entry
 * Represents a single version in the changelog
 */
export interface ChangelogVersion {
  /** Date slug in DD-MM-YYYY format */
  dateSlug: string;
  /** Parsed date object */
  date: Date;
  /** Version number (e.g., "0.1.0") */
  version?: string;
  /** Release name (e.g., "Alpha Release") */
  releaseName?: string;
  /** Full title (e.g., "v0.1.0 Alpha Release - 9th November 2025") */
  title: string;
  /** Path to the MDX file */
  filePath: string;
}

/**
 * Parse date from DD-MM-YYYY format
 */
function parseDateSlug(slug: string): Date | null {
  const parts = slug.split('-');
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;

  // Month is 0-indexed in JavaScript Date
  const date = new Date(year, month - 1, day);

  // Validate the date
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return null;
  }

  return date;
}

/**
 * Format date as "9th November 2025"
 */
function formatDateLong(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleDateString('en-GB', { month: 'long' });
  const year = date.getFullYear();

  // Add ordinal suffix
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = day % 100;
  const ordinal = suffix[(v - 20) % 10] || suffix[v] || suffix[0];

  return `${day}${ordinal} ${month} ${year}`;
}

/**
 * Get current date in DD-MM-YYYY format
 */
export function getCurrentDateSlug(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Scan changelog directory for all versions
 * Returns versions sorted by date (newest first)
 */
export function getChangelogVersions(): ChangelogVersion[] {
  const changelogDir = join(process.cwd(), 'content', 'changelog');

  if (!existsSync(changelogDir)) {
    return [];
  }

  const versions: ChangelogVersion[] = [];

  try {
    const entries = readdirSync(changelogDir);

    for (const entry of entries) {
      const entryPath = join(changelogDir, entry);
      const stat = statSync(entryPath);

      // Only process directories that match DD-MM-YYYY format
      if (!stat.isDirectory()) continue;

      const date = parseDateSlug(entry);
      if (!date) continue;

      // Check if index.mdx exists
      const mdxPath = join(entryPath, 'index.mdx');
      if (!existsSync(mdxPath)) continue;

      // Scan for metadata
      const files = scanMDXDirectory('changelog', entry);
      const indexFile = files.find((f) => f.slug === `${entry}/index`);

      if (!indexFile) continue;

      const version = indexFile.metadata.version as string | undefined;
      const releaseName = indexFile.metadata.releaseName as string | undefined;
      const title = indexFile.metadata.title as string;

      versions.push({
        dateSlug: entry,
        date,
        version,
        releaseName,
        title: title || `Release - ${formatDateLong(date)}`,
        filePath: `changelog/${entry}/index.mdx`,
      });
    }
  } catch (error) {
    console.error('Error scanning changelog versions:', error);
  }

  // Sort by date, newest first
  return versions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Find a specific version by date slug
 */
export function findVersionBySlug(slug: string): ChangelogVersion | null {
  const versions = getChangelogVersions();
  return versions.find((v) => v.dateSlug === slug) || null;
}

/**
 * Get next and previous versions for navigation
 */
export function getAdjacentVersions(slug: string): {
  prev: ChangelogVersion | null;
  next: ChangelogVersion | null;
} {
  const versions = getChangelogVersions();
  const currentIndex = versions.findIndex((v) => v.dateSlug === slug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: versions[currentIndex + 1] || null, // Older version
    next: versions[currentIndex - 1] || null, // Newer version
  };
}

/**
 * Generate changelog MDX template
 * Creates a new dated changelog entry with the current package version
 */
export function generateChangelogTemplate(options: {
  version: string;
  releaseName?: string;
  date?: Date;
}): { dateSlug: string; content: string } {
  const { version, releaseName = 'Release', date = new Date() } = options;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const dateSlug = `${day}-${month}-${year}`;

  const formattedDate = formatDateLong(date);
  const title = `v${version} ${releaseName}`;

  const content = `---
title: ${title}
version: ${version}
releaseName: ${releaseName}
date: ${date.toISOString().split('T')[0]}
description: ${releaseName} for version ${version}
---

# ${title}

**Released:** ${formattedDate}

## Overview

Brief overview of this release.

## What's New

### Features

- New feature 1
- New feature 2

### Improvements

- Improvement 1
- Improvement 2

### Bug Fixes

- Fix 1
- Fix 2

## Breaking Changes

None.

## Migration Guide

No migration needed for this release.

---

_Released on ${formattedDate}_
`;

  return { dateSlug, content };
}

/**
 * Create a new changelog entry
 * Writes the MDX file to the filesystem
 */
export function createChangelogEntry(options: {
  version: string;
  releaseName?: string;
  date?: Date;
}): { success: boolean; dateSlug: string; error?: string } {
  try {
    const { dateSlug, content } = generateChangelogTemplate(options);
    const changelogDir = join(process.cwd(), 'content', 'changelog', dateSlug);
    const mdxPath = join(changelogDir, 'index.mdx');

    // Check if already exists
    if (existsSync(mdxPath)) {
      return {
        success: false,
        dateSlug,
        error: `Changelog for ${dateSlug} already exists`,
      };
    }

    // Create directory
    mkdirSync(changelogDir, { recursive: true });

    // Write MDX file
    writeFileSync(mdxPath, content, 'utf8');

    return { success: true, dateSlug };
  } catch (error) {
    return {
      success: false,
      dateSlug: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
