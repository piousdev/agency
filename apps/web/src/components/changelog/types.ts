/**
 * Changelog Section Types
 * Defines the structure for changelog sections and content
 */

export interface ChangelogSection {
  id: string;
  title: string;
  slug: string;
  file?: string; // File path for MDX content
  date?: string; // Release date
  version?: string; // Version number (e.g., "0.1.0")
  children?: ChangelogSection[];
}

export interface ChangelogContent {
  slug: string[];
  title: string;
  content: string;
  headings: ContentHeading[];
  version?: string;
  date?: string;
}

export interface ContentHeading {
  id: string;
  text: string;
  level: number; // 1-6 for h1-h6
}

export interface NavigationState {
  activeSlug: string[];
  expandedSections: Set<string>;
}
