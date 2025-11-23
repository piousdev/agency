'use client';

import { useRef, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

export interface CardAnimationConfig {
  /** Hover lift distance in pixels */
  hoverY?: number;
  /** Hover scale factor */
  hoverScale?: number;
  /** Press scale factor */
  pressScale?: number;
  /** Animation durations */
  durations?: {
    hover?: number;
    press?: number;
    release?: number;
    rest?: number;
    entry?: number;
    focus?: number;
  };
  /** Shadow configurations */
  shadows?: {
    rest?: string;
    hover?: string;
    focus?: string;
  };
  /** Stagger delay for entry animation (in seconds) */
  staggerDelay?: number;
  /** Index for stagger calculation */
  index?: number;
  /** Whether to animate on mount */
  animateOnMount?: boolean;
}

const DEFAULT_CONFIG: Required<CardAnimationConfig> = {
  hoverY: -8,
  hoverScale: 1.02,
  pressScale: 0.98,
  durations: {
    hover: 0.3,
    press: 0.1,
    release: 0.15,
    rest: 0.4,
    entry: 0.6,
    focus: 0.2,
  },
  shadows: {
    rest: '0 1px 3px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.02)',
    hover: '0 8px 25px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.04)',
    focus: '0 4px 12px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.03)',
  },
  staggerDelay: 0.08,
  index: 0,
  animateOnMount: true,
};

export interface UseCardAnimationReturn {
  /** Ref to attach to the card element */
  cardRef: React.RefObject<HTMLElement | null>;
  /** Ref for gradient overlay element */
  gradientRef: React.RefObject<HTMLDivElement | null>;
  /** Ref for border glow element */
  borderGlowRef: React.RefObject<HTMLDivElement | null>;
  /** Handler for mouse enter */
  handleMouseEnter: () => void;
  /** Handler for mouse leave */
  handleMouseLeave: () => void;
  /** Handler for mouse down */
  handleMouseDown: () => void;
  /** Handler for mouse up */
  handleMouseUp: () => void;
  /** Handler for focus */
  handleFocus: () => void;
  /** Handler for blur */
  handleBlur: () => void;
  /** Whether reduced motion is preferred */
  prefersReducedMotion: boolean;
  /** Merged configuration */
  config: Required<CardAnimationConfig>;
}

/**
 * Custom hook for GSAP-powered card animations.
 * Provides handlers for hover, press, focus, and entry animations
 * with full accessibility support (reduced motion).
 *
 * @example
 * ```tsx
 * function MyCard() {
 *   const {
 *     cardRef,
 *     gradientRef,
 *     handleMouseEnter,
 *     handleMouseLeave,
 *     // ... other handlers
 *   } = useCardAnimation({ index: 0 });
 *
 *   return (
 *     <article
 *       ref={cardRef}
 *       onMouseEnter={handleMouseEnter}
 *       onMouseLeave={handleMouseLeave}
 *     >
 *       <div ref={gradientRef} className="gradient-overlay" />
 *       Content
 *     </article>
 *   );
 * }
 * ```
 */
export function useCardAnimation(userConfig: CardAnimationConfig = {}): UseCardAnimationReturn {
  const cardRef = useRef<HTMLElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const borderGlowRef = useRef<HTMLDivElement>(null);

  // Merge user config with defaults
  const config = useMemo<Required<CardAnimationConfig>>(() => {
    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
      durations: { ...DEFAULT_CONFIG.durations, ...userConfig.durations },
      shadows: { ...DEFAULT_CONFIG.shadows, ...userConfig.shadows },
    };
  }, [userConfig]);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  // Set up entry animation
  const { contextSafe } = useGSAP(
    () => {
      if (!cardRef.current || prefersReducedMotion || !config.animateOnMount) return;

      gsap.from(cardRef.current, {
        opacity: 0,
        y: 30,
        duration: config.durations.entry,
        delay: config.index * config.staggerDelay,
        ease: 'power3.out',
        clearProps: 'all',
      });
    },
    {
      scope: cardRef,
      dependencies: [
        config.animateOnMount,
        config.index,
        config.staggerDelay,
        config.durations.entry,
        prefersReducedMotion,
      ],
    }
  );

  // Hover start animation
  const handleMouseEnter = contextSafe(
    useCallback(() => {
      if (!cardRef.current || prefersReducedMotion) return;

      gsap.to(cardRef.current, {
        y: config.hoverY,
        scale: config.hoverScale,
        boxShadow: config.shadows.hover,
        duration: config.durations.hover,
        ease: 'power2.out',
        force3D: true,
      });

      if (gradientRef.current) {
        gsap.to(gradientRef.current, {
          opacity: 1,
          duration: config.durations.hover,
          ease: 'power2.out',
        });
      }

      if (borderGlowRef.current) {
        gsap.to(borderGlowRef.current, {
          opacity: 1,
          duration: config.durations.hover,
          ease: 'power2.out',
        });
      }
    }, [config, prefersReducedMotion])
  );

  // Hover end animation
  const handleMouseLeave = contextSafe(
    useCallback(() => {
      if (!cardRef.current || prefersReducedMotion) return;

      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        boxShadow: config.shadows.rest,
        duration: config.durations.rest,
        ease: 'power2.out',
      });

      if (gradientRef.current) {
        gsap.to(gradientRef.current, {
          opacity: 0,
          duration: config.durations.rest,
          ease: 'power2.out',
        });
      }

      if (borderGlowRef.current) {
        gsap.to(borderGlowRef.current, {
          opacity: 0,
          duration: config.durations.rest,
          ease: 'power2.out',
        });
      }
    }, [config, prefersReducedMotion])
  );

  // Press animation
  const handleMouseDown = contextSafe(
    useCallback(() => {
      if (!cardRef.current || prefersReducedMotion) return;

      gsap.to(cardRef.current, {
        scale: config.pressScale,
        duration: config.durations.press,
        ease: 'power2.inOut',
      });
    }, [config, prefersReducedMotion])
  );

  // Release animation
  const handleMouseUp = contextSafe(
    useCallback(() => {
      if (!cardRef.current || prefersReducedMotion) return;

      gsap.to(cardRef.current, {
        scale: config.hoverScale,
        duration: config.durations.release,
        ease: 'back.out(1.7)',
      });
    }, [config, prefersReducedMotion])
  );

  // Focus animation
  const handleFocus = contextSafe(
    useCallback(() => {
      if (!cardRef.current || prefersReducedMotion) return;

      gsap.to(cardRef.current, {
        boxShadow: config.shadows.focus,
        duration: config.durations.focus,
        ease: 'power2.out',
      });
    }, [config, prefersReducedMotion])
  );

  // Blur animation
  const handleBlur = contextSafe(
    useCallback(() => {
      if (!cardRef.current || prefersReducedMotion) return;

      gsap.to(cardRef.current, {
        boxShadow: config.shadows.rest,
        duration: config.durations.focus,
        ease: 'power2.out',
      });
    }, [config, prefersReducedMotion])
  );

  return {
    cardRef,
    gradientRef,
    borderGlowRef,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp,
    handleFocus,
    handleBlur,
    prefersReducedMotion,
    config,
  };
}

/**
 * Utility function to animate multiple cards with stagger effect.
 * Use this for container-level animations.
 *
 * @example
 * ```tsx
 * useGSAP(() => {
 *   animateCardsEntry(containerRef.current, '.card', 0.08);
 * }, { scope: containerRef });
 * ```
 */
export function animateCardsEntry(
  container: HTMLElement | null,
  selector: string = '[data-slot="animated-card"]',
  staggerDelay: number = 0.08,
  prefersReducedMotion: boolean = false
): gsap.core.Tween | null {
  if (!container || prefersReducedMotion) return null;

  return gsap.from(container.querySelectorAll(selector), {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: staggerDelay,
    ease: 'power3.out',
    clearProps: 'all',
  });
}

/**
 * Utility function to create a press/release animation timeline.
 * Useful for custom button-like card interactions.
 */
export function createPressTimeline(
  element: HTMLElement,
  config: Pick<CardAnimationConfig, 'pressScale' | 'hoverScale' | 'durations'> = {}
): gsap.core.Timeline {
  const mergedConfig = {
    pressScale: config.pressScale ?? DEFAULT_CONFIG.pressScale,
    hoverScale: config.hoverScale ?? DEFAULT_CONFIG.hoverScale,
    durations: { ...DEFAULT_CONFIG.durations, ...config.durations },
  };

  const tl = gsap.timeline({ paused: true });

  tl.to(element, {
    scale: mergedConfig.pressScale,
    duration: mergedConfig.durations.press,
    ease: 'power2.inOut',
  }).to(element, {
    scale: mergedConfig.hoverScale,
    duration: mergedConfig.durations.release,
    ease: 'back.out(1.7)',
  });

  return tl;
}
