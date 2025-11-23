'use client';

import * as React from 'react';
import { useRef, useCallback, useId } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

// Animation configuration
const ANIMATION_CONFIG = {
  hover: {
    y: -8,
    scale: 1.02,
    duration: 0.3,
    ease: 'power2.out',
  },
  press: {
    scale: 0.98,
    duration: 0.1,
    ease: 'power2.inOut',
  },
  release: {
    duration: 0.15,
    ease: 'back.out(1.7)',
  },
  rest: {
    y: 0,
    scale: 1,
    duration: 0.4,
    ease: 'power2.out',
  },
  entry: {
    opacity: 0,
    y: 30,
    duration: 0.6,
    ease: 'power3.out',
  },
  focus: {
    duration: 0.2,
    ease: 'power2.out',
  },
} as const;

// Shadow configurations for different states
const SHADOWS = {
  rest: '0 1px 3px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.02)',
  hover: '0 8px 25px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.04)',
  focus: '0 4px 12px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.03)',
} as const;

export interface MotionCardProps extends React.HTMLAttributes<HTMLElement> {
  /** Unique identifier for accessibility */
  cardId?: string;
  /** Animation delay for staggered entry (in seconds) */
  index?: number;
  /** Whether to animate on mount */
  animateOnMount?: boolean;
  /** Whether the card is currently selected */
  isSelected?: boolean;
  /** Whether the card is interactive (clickable/focusable) */
  interactive?: boolean;
  /** Callback when card is activated (Enter/Space or click) */
  onActivate?: () => void;
  /** Whether to show the hover gradient overlay */
  showGradientOverlay?: boolean;
  /** Custom aria-label for the card */
  'aria-label'?: string;
  /** ID of the element that labels this card */
  'aria-labelledby'?: string;
  /** ID of the element that describes this card */
  'aria-describedby'?: string;
}

const MotionCard = React.forwardRef<HTMLElement, MotionCardProps>(
  (
    {
      className,
      children,
      cardId,
      index = 0,
      animateOnMount = true,
      isSelected = false,
      interactive = true,
      onActivate,
      showGradientOverlay = true,
      onClick,
      onKeyDown,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLElement>(null);
    const cardRef = (forwardedRef as React.RefObject<HTMLElement>) || internalRef;
    const gradientRef = useRef<HTMLDivElement>(null);
    const borderGlowRef = useRef<HTMLDivElement>(null);

    const generatedId = useId();
    const uniqueId = cardId || generatedId;

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // GSAP context for animations
    const { contextSafe } = useGSAP(
      () => {
        if (!cardRef.current || prefersReducedMotion) return;

        // Entry animation with stagger
        if (animateOnMount) {
          gsap.from(cardRef.current, {
            ...ANIMATION_CONFIG.entry,
            delay: index * 0.08,
            clearProps: 'all',
          });
        }
      },
      { scope: cardRef, dependencies: [animateOnMount, index, prefersReducedMotion] }
    );

    // Hover start animation
    const handleMouseEnter = contextSafe(() => {
      if (!cardRef.current || prefersReducedMotion) return;

      gsap.to(cardRef.current, {
        ...ANIMATION_CONFIG.hover,
        boxShadow: SHADOWS.hover,
        force3D: true,
      });

      // Animate gradient overlay
      if (gradientRef.current && showGradientOverlay) {
        gsap.to(gradientRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }

      // Animate border glow
      if (borderGlowRef.current) {
        gsap.to(borderGlowRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    });

    // Hover end animation
    const handleMouseLeave = contextSafe(() => {
      if (!cardRef.current || prefersReducedMotion) return;

      gsap.to(cardRef.current, {
        ...ANIMATION_CONFIG.rest,
        boxShadow: SHADOWS.rest,
      });

      // Hide gradient overlay
      if (gradientRef.current) {
        gsap.to(gradientRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }

      // Hide border glow
      if (borderGlowRef.current) {
        gsap.to(borderGlowRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    });

    // Press animation
    const handleMouseDown = contextSafe(() => {
      if (!cardRef.current || prefersReducedMotion || !interactive) return;

      gsap.to(cardRef.current, {
        ...ANIMATION_CONFIG.press,
      });
    });

    // Release animation
    const handleMouseUp = contextSafe(() => {
      if (!cardRef.current || prefersReducedMotion || !interactive) return;

      gsap.to(cardRef.current, {
        scale: ANIMATION_CONFIG.hover.scale,
        ...ANIMATION_CONFIG.release,
      });
    });

    // Focus animation
    const handleFocus = contextSafe(() => {
      if (!cardRef.current || prefersReducedMotion) return;

      gsap.to(cardRef.current, {
        boxShadow: SHADOWS.focus,
        ...ANIMATION_CONFIG.focus,
      });
    });

    // Blur animation
    const handleBlur = contextSafe(() => {
      if (!cardRef.current || prefersReducedMotion) return;

      gsap.to(cardRef.current, {
        boxShadow: SHADOWS.rest,
        ...ANIMATION_CONFIG.focus,
      });
    });

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLElement>) => {
        if (!interactive) {
          onKeyDown?.(event);
          return;
        }

        switch (event.key) {
          case 'Enter':
          case ' ':
            event.preventDefault();
            onActivate?.();
            break;
          case 'Escape':
            // Allow parent to handle escape
            break;
        }

        onKeyDown?.(event);
      },
      [interactive, onActivate, onKeyDown]
    );

    // Handle click
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (interactive) {
          onActivate?.();
        }
        onClick?.(event);
      },
      [interactive, onActivate, onClick]
    );

    return (
      <article
        ref={cardRef as React.RefObject<HTMLElement>}
        id={uniqueId}
        role="article"
        tabIndex={interactive ? 0 : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-selected={isSelected}
        data-slot="motion-card"
        data-selected={isSelected}
        className={cn(
          // Base styles
          'relative',
          'bg-card text-card-foreground',
          'flex flex-col gap-6 rounded-xl border py-6',
          'overflow-hidden',
          // Initial shadow
          'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_6px_rgba(0,0,0,0.02)]',
          // Focus visible styles (for keyboard navigation)
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Cursor for interactive cards
          interactive && 'cursor-pointer',
          // Selection state
          isSelected && 'ring-2 ring-primary ring-offset-2',
          // Transform origin for animations
          'origin-center',
          // Will-change for performance (applied sparingly)
          'will-change-transform',
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        {...props}
      >
        {/* Gradient overlay for luxury effect */}
        {showGradientOverlay && (
          <div
            ref={gradientRef}
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-0 rounded-xl',
              'bg-gradient-to-br from-white/[0.08] via-transparent to-transparent',
              'opacity-0'
            )}
          />
        )}

        {/* Border glow */}
        <div
          ref={borderGlowRef}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 rounded-xl',
            'border border-primary/0',
            'opacity-0',
            'transition-[border-color] duration-300',
            '[&[style*="opacity: 1"]]:border-primary/20'
          )}
        />

        {/* Card content */}
        {children}
      </article>
    );
  }
);

MotionCard.displayName = 'MotionCard';

// Sub-components for consistent structure
function MotionCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="motion-card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6',
        'has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        '[.border-b]:pb-6',
        className
      )}
      {...props}
    />
  );
}

function MotionCardTitle({
  className,
  id,
  ...props
}: React.ComponentProps<'h3'> & { id?: string }) {
  return (
    <h3
      id={id}
      data-slot="motion-card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
}

function MotionCardDescription({
  className,
  id,
  ...props
}: React.ComponentProps<'p'> & { id?: string }) {
  return (
    <p
      id={id}
      data-slot="motion-card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function MotionCardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="motion-card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function MotionCardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="motion-card-content" className={cn('px-6', className)} {...props} />;
}

function MotionCardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="motion-card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}

// Container component for staggered entry animations
interface MotionCardContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stagger delay between cards (in seconds) */
  staggerDelay?: number;
}

function MotionCardContainer({
  className,
  children,
  staggerDelay = 0.08,
  ...props
}: MotionCardContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useGSAP(
    () => {
      if (!containerRef.current || prefersReducedMotion) return;

      // Entry animation with stagger for all cards in container
      gsap.from('[data-slot="motion-card"]', {
        ...ANIMATION_CONFIG.entry,
        stagger: staggerDelay,
        clearProps: 'all',
      });
    },
    { scope: containerRef, dependencies: [staggerDelay, prefersReducedMotion] }
  );

  return (
    <div ref={containerRef} className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export {
  MotionCard,
  MotionCardHeader,
  MotionCardTitle,
  MotionCardDescription,
  MotionCardAction,
  MotionCardContent,
  MotionCardFooter,
  MotionCardContainer,
};
