import * as React from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
}

/**
 * BentoGrid - A CSS Grid container for asymmetric card layouts
 *
 * Uses auto-rows for consistent row heights with flexible column spans.
 * Based on Magic UI bento grid pattern.
 */
function BentoGrid({ children, className, ...props }: BentoGridProps) {
  return (
    <div
      className={cn('grid w-full grid-cols-1 gap-4', 'sm:grid-cols-2', 'lg:grid-cols-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

type BentoCardSpan = '1' | '2' | '3' | '4';

interface BentoCardProps extends React.ComponentProps<'div'> {
  /** Number of columns to span (1-4) */
  colSpan?: BentoCardSpan;
  /** Number of rows to span (1-4) */
  rowSpan?: BentoCardSpan;
  /** Whether this is a hero/featured card */
  isHero?: boolean;
  children: React.ReactNode;
}

const colSpanClasses: Record<BentoCardSpan, string> = {
  '1': 'sm:col-span-1',
  '2': 'sm:col-span-2',
  '3': 'sm:col-span-3',
  '4': 'sm:col-span-4',
};

const rowSpanClasses: Record<BentoCardSpan, string> = {
  '1': 'row-span-1',
  '2': 'row-span-2',
  '3': 'row-span-3',
  '4': 'row-span-4',
};

/**
 * BentoCard - A grid item with configurable span and focus management
 *
 * Supports keyboard navigation with visible focus indicators.
 * Use colSpan/rowSpan for asymmetric layouts.
 */
function BentoCard({
  colSpan = '1',
  rowSpan = '1',
  isHero = false,
  children,
  className,
  ...props
}: BentoCardProps) {
  return (
    <div
      tabIndex={0}
      className={cn(
        // Base styles - h-full and flex column for proper content distribution
        'relative overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm',
        'h-full flex flex-col',
        'transition-all duration-300 motion-reduce:transition-none',
        'hover:shadow-md hover:border-border/60',
        // Focus styles for keyboard navigation
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        // Span classes
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        // Hero variant
        isHero && 'border-primary/20 bg-gradient-to-br from-card to-primary/5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface BentoCardHeaderProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
}

function BentoCardHeader({ children, className, ...props }: BentoCardHeaderProps) {
  return (
    <div
      className={cn(
        'shrink-0 flex items-start justify-between gap-2 p-4 pb-0 sm:p-5 sm:pb-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface BentoCardContentProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
}

function BentoCardContent({ children, className, ...props }: BentoCardContentProps) {
  return (
    <div className={cn('flex-1 p-4 sm:p-5', className)} {...props}>
      {children}
    </div>
  );
}

interface BentoCardFooterProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
}

function BentoCardFooter({ children, className, ...props }: BentoCardFooterProps) {
  return (
    <div
      className={cn('shrink-0 p-3 sm:p-4 border-t border-border/40 bg-muted/5', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { BentoGrid, BentoCard, BentoCardHeader, BentoCardContent, BentoCardFooter };
export type { BentoGridProps, BentoCardProps, BentoCardSpan };
