'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

/**
 * Table of Contents Component
 * Client component for "On This Page" navigation with scroll-based active state
 * Automatically extracts headings from the article element
 */
export function TableOfContents({ className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from the article element
    const articleElement = document.querySelector('article');
    if (!articleElement) return;

    const headingElements = articleElement.querySelectorAll('h1, h2, h3, h4');
    const extractedHeadings: Heading[] = [];

    for (const element of headingElements) {
      const id = element.id;
      const text = element.textContent || '';
      const level = Number.parseInt(element.tagName.slice(1), 10);

      if (id && text) {
        extractedHeadings.push({ id, text, level });
      }
    }

    setHeadings(extractedHeadings);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    // Get all heading elements
    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    // Set initial active state to first heading
    if (headingElements[0]) {
      setActiveId(headingElements[0].id);
    }

    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      // Debounce scroll events
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Get scroll position with offset for header
        const scrollY = window.scrollY + 150;

        // Find the heading that's currently in view
        let currentHeading = headingElements[0];

        for (const heading of headingElements) {
          const headingTop = heading.offsetTop;

          if (scrollY >= headingTop) {
            currentHeading = heading;
          } else {
            break;
          }
        }

        if (currentHeading) {
          setActiveId(currentHeading.id);
        }
      }, 50);
    };

    // Initial check
    handleScroll();

    // Listen to scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headings]);

  const handleClick = (headingId: string) => {
    // Immediately update active state
    setActiveId(headingId);

    // Scroll to the heading
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Show all headings from h1-h4 in the table of contents
  const tocHeadings = headings.filter((h) => h.level >= 1 && h.level <= 4);

  if (tocHeadings.length === 0) {
    return null;
  }

  return (
    <nav className={cn('sticky top-20 w-64 self-start', className)}>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">ON THIS PAGE</p>
        <div className="relative">
          {/* Continuous vertical line */}
          <div className="absolute left-0 top-0 h-full w-px bg-border" />

          <ul className="relative space-y-2">
            {tocHeadings.map((heading) => {
              const isActive = activeId === heading.id;
              const indent = (heading.level - 1) * 16; // 0px for h1, 16px for h2, 32px for h3, 48px for h4

              return (
                <li key={heading.id}>
                  <Link
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleClick(heading.id);
                    }}
                    style={{ paddingLeft: `${indent + 16}px` }}
                    className={cn(
                      'relative block border-l-2 py-1 text-sm transition-colors hover:text-foreground',
                      isActive
                        ? 'border-primary font-medium text-primary'
                        : 'border-transparent text-muted-foreground'
                    )}
                  >
                    {heading.text}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
