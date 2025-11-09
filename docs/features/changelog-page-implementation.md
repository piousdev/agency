# Changelog Page Implementation Plan

**Date:** 2025-11-09
**Status:** Planning
**Feature:** Unified Changelog Page in Dashboard

## Overview

Implement a changelog page in the `/dashboard` sidebar (general section) that displays a unified changelog for the entire monorepo (both `@repo/web` and `@repo/api` packages). The changelog will be rendered from MDX files using the official `@next/mdx` package, following the existing help documentation pattern.

## Why This Approach

### @next/mdx (Official Next.js Integration)

**Selected Package:** `@next/mdx` v16.0.1 (official)

**Rationale:**

1. **Local Content** - CHANGELOG.md files already exist in the repository
2. **Server-First** - Aligns with Next.js App Router and Server Components architecture
3. **Zero Runtime Overhead** - No client-side JavaScript for rendering
4. **Official Support** - Maintained by Vercel, guaranteed Next.js 16 compatibility
5. **Existing Pattern** - Reuses the help documentation implementation pattern
6. **Plugin Ecosystem** - Supports remark/rehype plugins for extended features

**Alternatives Considered:**

- `next-mdx-remote-client` - Overkill for local files, adds runtime overhead
- Simple markdown parser (`marked`, `remark`) - Less features, manual component mapping

### Research Summary

**Next.js 16 Documentation:**

- Official `@next/mdx` supports App Router with Server Components
- Can import MDX files directly as React components
- Supports dynamic imports with `generateStaticParams`
- Integrates seamlessly with `mdx-components.tsx` for custom styling

**2025 Best Practices:**

- Use `.mjs` or `.ts` for `next.config` when using ESM-only plugins (like `remark-gfm`)
- Place `mdx-components.tsx` at root for global component customization
- Leverage `@tailwindcss/typography` for markdown styling
- Use Server Components to avoid shipping MDX runtime to client

## Architecture Integration

### Server-First Principle Alignment

```
┌─────────────────────────────────────────────────────────┐
│ Browser                                                 │
│ - Static HTML rendered from MDX                         │
│ - No client JavaScript for content rendering            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Next.js Server (Server Components)                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Changelog Page (Server Component)                    │ │
│ │ - Imports MDX files directly                         │ │
│ │ - Processes MDX at build time                        │ │
│ │ - Renders to static HTML                             │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ File System                                             │
│ - content/changelog/*.mdx                               │
│ - Processed at build time                               │
└─────────────────────────────────────────────────────────┘
```

### Reusing Help Documentation Pattern

The changelog page will follow the exact same pattern as the help documentation:

**Help Pattern (`/dashboard/help`):**

- Route: `app/(default)/dashboard/help/[[...slug]]/page.tsx`
- Layout: 3-column (sidebar, content, table of contents)
- Config: `components/help/config.ts` with `HELP_SECTIONS`
- Utils: Server-side content loading from `content/help/`
- Component: Reusable `<Help>` component with sub-components

**Changelog Pattern (`/dashboard/changelog`):**

- Route: `app/(default)/dashboard/changelog/[[...slug]]/page.tsx`
- Layout: Same 3-column layout (reuse or adapt)
- Config: `components/changelog/config.ts` with `CHANGELOG_SECTIONS`
- Content: MDX files in `content/changelog/`
- Component: `<Changelog>` component (similar to `<Help>`)

## File Structure

```
apps/web/
├── src/
│   ├── app/
│   │   └── (default)/
│   │       └── dashboard/
│   │           └── changelog/
│   │               ├── [[...slug]]/
│   │               │   └── page.tsx          # Dynamic changelog route
│   │               └── layout.tsx            # Changelog layout (-m-4)
│   │
│   └── components/
│       └── changelog/
│           ├── index.tsx                     # Main Changelog component
│           ├── config.ts                     # Navigation structure
│           ├── sidebar.tsx                   # Left sidebar navigation
│           ├── content.tsx                   # Main content area
│           ├── table-of-contents.tsx         # Right sidebar TOC
│           ├── types.ts                      # TypeScript types
│           └── utils.ts                      # Server-side utilities
│
├── content/
│   └── changelog/
│       ├── index.mdx                         # Unified changelog
│       ├── web.mdx                           # Web-specific (future)
│       └── api.mdx                           # API-specific (future)
│
├── mdx-components.tsx                        # Root-level MDX components
└── next.config.mjs                           # MDX configuration

Root:
└── docs/
    └── features/
        └── changelog-page-implementation.md  # This file
```

## Implementation Steps

### Phase 1: Setup & Configuration

1. **Install Dependencies**

   ```bash
   pnpm --filter @repo/web add @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
   pnpm --filter @repo/web add remark-gfm rehype-prism-plus  # Optional plugins
   ```

2. **Configure Next.js for MDX**
   - Update `next.config.mjs` to enable MDX support
   - Add `pageExtensions` to include `.mdx` files
   - Configure remark/rehype plugins (GitHub Flavored Markdown, syntax highlighting)

3. **Create MDX Components File**
   - Create `apps/web/mdx-components.tsx` at root
   - Map HTML elements to styled components
   - Use `@tailwindcss/typography` classes

### Phase 2: Content Preparation

4. **Create Unified Changelog**
   - Combine `apps/web/CHANGELOG.md` and `apps/api/CHANGELOG.md`
   - Convert to MDX format (`content/changelog/index.mdx`)
   - Add frontmatter metadata (title, description, date)
   - Organize by version with clear sections
   - Add package tags to distinguish web vs API changes

### Phase 3: Component Implementation

5. **Create Changelog Route**
   - `app/(default)/dashboard/changelog/[[...slug]]/page.tsx`
   - Server Component with dynamic MDX import
   - Use `generateStaticParams()` for static generation
   - Add metadata generation

6. **Create Changelog Layout**
   - `app/(default)/dashboard/changelog/layout.tsx`
   - Apply `-m-4` to counteract dashboard padding
   - Full-height flex layout

7. **Build Changelog Components**
   - `components/changelog/index.tsx` - Main component (3-column layout)
   - `components/changelog/config.ts` - Navigation structure
   - `components/changelog/sidebar.tsx` - Left navigation (versions)
   - `components/changelog/content.tsx` - Main MDX content area
   - `components/changelog/table-of-contents.tsx` - Right TOC
   - `components/changelog/types.ts` - TypeScript interfaces
   - `components/changelog/utils.ts` - Content loading utilities

### Phase 4: Navigation Integration

8. **Update Dashboard Sidebar**
   - Locate sidebar configuration file
   - Add "Changelog" item in general section
   - Position: After "Get Help"
   - Order: Search → Get Help → Changelog

### Phase 5: Styling & Enhancement

9. **Add Typography Styling**
   - Ensure `@tailwindcss/typography` is configured
   - Apply `prose` classes to content area
   - Customize heading styles
   - Add proper spacing for version sections

10. **Add Syntax Highlighting**
    - Configure `rehype-prism-plus` for code blocks
    - Add Prism theme CSS
    - Test with code snippets in changelog

### Phase 6: Testing & Documentation

11. **Test Changelog Page**
    - Verify route `/dashboard/changelog` works
    - Test navigation between versions
    - Verify table of contents scrolling
    - Check responsive layout
    - Test build process (`pnpm build`)

12. **Update Documentation**
    - Update `apps/web/README.md` - Add changelog page info
    - Update `apps/web/ARCHITECTURE.md` - Document MDX integration
    - Update `CONTRIBUTING.md` - Explain how to update changelogs
    - Update `VERSIONING.md` - Reference changelog page

## Content Structure (Unified Changelog)

### Frontmatter

```yaml
---
title: Changelog
description: Release history for the Skyll Platform
lastUpdated: 2025-11-09
---
```

### Version Format

```markdown
## [0.1.0] - 2025-11-07

### Web App (`@repo/web`)

#### Added

- Authentication flow with Better-Auth
- Dashboard with project management
- User profile management

#### Fixed

- Login form validation issues

### API (`@repo/api`)

#### Added

- User management endpoints
- Authentication with Better-Auth
- Health check endpoint

#### Changed

- Database schema improvements
```

## Configuration Details

### next.config.mjs

```javascript
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // ... existing config
};

export default withMDX(nextConfig);
```

### mdx-components.tsx

```typescript
import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-semibold mt-6 mb-3">{children}</h2>
    ),
    // ... more custom components
    ...components,
  }
}
```

## Benefits of This Approach

1. **Performance** - Static generation at build time, no runtime overhead
2. **Maintainability** - Simple MDX files, easy to update
3. **Consistency** - Follows existing help documentation pattern
4. **Extensibility** - Can add interactive components later if needed
5. **SEO** - Server-rendered HTML with proper metadata
6. **Developer Experience** - Familiar markdown syntax with JSX power

## Future Enhancements

- Add search functionality for changelogs
- Add filtering by package (web/api) or change type (feat/fix)
- Add RSS feed for changelog updates
- Integrate with GitHub releases
- Add changelog entry form for maintainers
- Automatic changelog generation from git commits

## References

- [Next.js MDX Documentation](https://nextjs.org/docs/app/guides/mdx)
- [@next/mdx Package](https://www.npmjs.com/package/@next/mdx)
- [MDX Documentation](https://mdxjs.com/)
- [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

**Next Steps:** Begin Phase 1 - Setup & Configuration
