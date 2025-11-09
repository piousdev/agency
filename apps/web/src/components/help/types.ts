/**
 * Help Section Types
 * Defines the structure for help documentation sections and content
 */

export interface HelpSection {
  id: string;
  title: string;
  slug: string;
  file?: string; // File path for leaf nodes
  icon?: string;
  children?: HelpSection[];
}

export interface HelpContent {
  slug: string[];
  title: string;
  content: string;
  headings: ContentHeading[];
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
