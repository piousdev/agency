import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import matter from 'gray-matter';

import { mdxComponents } from './mdx-components';

/**
 * MDX Content Metadata
 * Extracted from frontmatter
 */
export interface MDXMetadata {
  title: string;
  description?: string;
  order?: number;
  [key: string]: unknown;
}

/**
 * MDX File Information
 */
export interface MDXFile {
  slug: string; // relative path without extension, e.g., "fundamentals/basics"
  filePath: string; // full path from content root, e.g., "help/fundamentals/basics.mdx"
  metadata: MDXMetadata;
}

/**
 * Navigation Item (generated from directory structure + frontmatter)
 */
export interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  filePath?: string; // Only for leaf nodes with actual content
  children?: NavigationItem[];
}

/**
 * Scan a directory for MDX files and extract their metadata
 */
export function scanMDXDirectory(contentRoot: string, baseDir = ''): MDXFile[] {
  const fullPath = join(process.cwd(), 'content', contentRoot, baseDir);
  const files: MDXFile[] = [];

  try {
    const entries = readdirSync(fullPath);

    for (const entry of entries) {
      const entryPath = join(fullPath, entry);
      const stat = statSync(entryPath);
      const relativePath = baseDir ? join(baseDir, entry) : entry;

      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        files.push(...scanMDXDirectory(contentRoot, relativePath));
      } else if (entry.endsWith('.mdx')) {
        // Read and parse MDX file
        const fileContents = readFileSync(entryPath, 'utf8');
        const { data } = matter(fileContents);

        // Generate slug (remove .mdx extension)
        const slug = relativePath.replace(/\.mdx$/, '');

        files.push({
          slug,
          filePath: join(contentRoot, relativePath),
          metadata: data as MDXMetadata,
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning MDX directory ${contentRoot}/${baseDir}:`, error);
  }

  return files;
}

/**
 * Build navigation tree from MDX files
 * Uses directory structure + frontmatter metadata
 */
export function buildNavigationTree(files: MDXFile[], _rootPath = ''): NavigationItem[] {
  const tree: NavigationItem[] = [];
  const pathMap = new Map<string, NavigationItem>();

  // First pass: create all nodes
  for (const file of files) {
    const parts = file.slug.split('/');
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      // Skip if we've already created this node
      if (pathMap.has(currentPath)) {
        continue;
      }

      const isLeaf = i === parts.length - 1;
      const id = currentPath.replace(/\//g, '-');

      // Create navigation item
      const item: NavigationItem = {
        id,
        title: isLeaf ? file.metadata.title || part : part,
        slug: part,
        description: isLeaf ? file.metadata.description : undefined,
        order: isLeaf ? (file.metadata.order ?? 999) : 0,
        filePath: isLeaf ? file.filePath : undefined,
        children: [],
      };

      pathMap.set(currentPath, item);

      // Add to parent or root
      if (parentPath) {
        const parent = pathMap.get(parentPath);
        if (parent?.children) {
          parent.children.push(item);
        }
      } else {
        tree.push(item);
      }
    }
  }

  // Second pass: sort children by order
  const sortTree = (items: NavigationItem[]): NavigationItem[] => {
    return items
      .sort((a, b) => {
        // Sort by order first, then by title
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return a.title.localeCompare(b.title);
      })
      .map((item) => ({
        ...item,
        children: item.children ? sortTree(item.children) : undefined,
      }));
  };

  return sortTree(tree);
}

/**
 * Get all MDX files from a content directory
 */
export function getContentFiles(contentRoot: string): MDXFile[] {
  return scanMDXDirectory(contentRoot);
}

/**
 * Get navigation tree for a content directory
 */
export function getContentNavigation(contentRoot: string): NavigationItem[] {
  const files = getContentFiles(contentRoot);
  return buildNavigationTree(files);
}

/**
 * Find a specific file by slug
 */
export function findFileBySlug(files: MDXFile[], slugParts: string[]): MDXFile | null {
  const targetSlug = slugParts.join('/');
  return files.find((file) => file.slug === targetSlug) ?? null;
}

/**
 * Load and compile an MDX file using next-mdx-remote
 * Returns the compiled MDX source ready for rendering
 */
export async function loadMDXFile(filePath: string) {
  try {
    // Read the MDX file from filesystem
    const fullPath = join(process.cwd(), 'content', filePath);
    const fileContents = readFileSync(fullPath, 'utf8');

    // Parse frontmatter
    const { content, data } = matter(fileContents);

    // Compile MDX (this is done on the server at request time)
    const { compileMDX } = await import('next-mdx-remote/rsc');

    const result = await compileMDX({
      source: content,
      components: mdxComponents,
      options: {
        parseFrontmatter: false, // We already parsed it with gray-matter
        mdxOptions: {
          remarkPlugins: [],
          rehypePlugins: [],
        },
      },
    });

    return {
      content: result.content,
      frontmatter: data as MDXMetadata,
    };
  } catch (error) {
    console.error(`Error loading MDX file ${filePath}:`, error);
    throw error;
  }
}
