import React from 'react';

/**
 * MDX Components Customization
 *
 * This file is used by @next/mdx to provide custom React components
 * for markdown elements. These components are used when rendering MDX
 * content in the changelog and documentation pages.
 *
 * All styling uses the design system from globals.css via CSS custom properties.
 *
 * For more info: https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components
 */

type MDXComponentsType = Record<string, React.ComponentType<unknown>>;

/**
 * Generate a URL-friendly slug from heading text
 * Used for heading IDs and anchor links
 */
function slugify(children: React.ReactNode): string {
  // Convert React children to plain text
  const text =
    typeof children === 'string'
      ? children
      : React.Children.toArray(children)
          .map((child) =>
            typeof child === 'string' || typeof child === 'number' ? String(child) : ''
          )
          .join('');

  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

export function useMDXComponents(components: MDXComponentsType): MDXComponentsType {
  return {
    // Headings with auto-generated IDs for anchor links
    h1: ({ children }: { children?: React.ReactNode }) => {
      const id = slugify(children);
      return (
        <h1
          id={id}
          className="mb-4 mt-8 scroll-mt-20 text-4xl font-bold tracking-tight text-foreground"
        >
          {children}
        </h1>
      );
    },
    h2: ({ children }: { children?: React.ReactNode }) => {
      const id = slugify(children);
      return (
        <h2
          id={id}
          className="mb-3 mt-6 scroll-mt-20 text-3xl font-semibold tracking-tight text-foreground"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }: { children?: React.ReactNode }) => {
      const id = slugify(children);
      return (
        <h3
          id={id}
          className="mb-3 mt-5 scroll-mt-20 text-2xl font-semibold tracking-tight text-foreground"
        >
          {children}
        </h3>
      );
    },
    h4: ({ children }: { children?: React.ReactNode }) => {
      const id = slugify(children);
      return (
        <h4
          id={id}
          className="mb-2 mt-4 scroll-mt-20 text-xl font-semibold tracking-tight text-foreground"
        >
          {children}
        </h4>
      );
    },
    h5: ({ children }) => (
      <h5 className="mb-2 mt-3 scroll-mt-20 text-lg font-semibold tracking-tight text-foreground">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="mb-2 mt-3 scroll-mt-20 text-base font-semibold tracking-tight text-foreground">
        {children}
      </h6>
    ),

    // Paragraphs
    p: ({ children }) => <p className="mb-4 leading-7 text-muted-foreground">{children}</p>,

    // Links
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 ml-6 list-decimal space-y-2 text-muted-foreground">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-7">{children}</li>,

    // Code blocks
    pre: ({ children }) => (
      <pre className="mb-4 overflow-x-auto rounded-lg border bg-muted p-4">{children}</pre>
    ),
    code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
      // Check if this is an inline code block
      const isInline = !className;

      if (isInline) {
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
            {children}
          </code>
        );
      }

      // Code block (inside pre)
      return (
        <code
          className={`font-mono text-sm ${className}`}
          data-language={className.replace('language-', '')}
        >
          {children}
        </code>
      );
    },

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="mb-4 border-l-4 border-primary bg-accent p-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),

    // Horizontal rule
    hr: () => <hr className="my-8 border-border" />,

    // Tables
    table: ({ children }) => (
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-border">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-border bg-card">{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">{children}</th>
    ),
    td: ({ children }) => <td className="px-4 py-3 text-sm text-muted-foreground">{children}</td>,

    // Strong and emphasis
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,

    // Allow custom components to be passed in
    ...components,
  };
}
