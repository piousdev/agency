'use client';

import { useRef, useCallback, useMemo } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

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
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  const animateHoverEnter = contextSafe(
    (
      card: HTMLElement,
      gradient: HTMLDivElement | null,
      border: HTMLDivElement | null,
      conf: Required<CardAnimationConfig>
    ) => {
      gsap.to(card, {
        y: conf.hoverY,
        scale: conf.hoverScale,
        boxShadow: conf.shadows.hover,
        duration: conf.durations.hover,
        ease: 'power2.out',
        force3D: true,
      });

      if (gradient) {
        gsap.to(gradient, {
          opacity: 1,
          duration: conf.durations.hover,
          ease: 'power2.out',
        });
      }

      if (border) {
        gsap.to(border, {
          opacity: 1,
          duration: conf.durations.hover,
          ease: 'power2.out',
        });
      }
    }
  );

  const handleMouseEnter = useCallback(() => {
    if (!cardRef.current || prefersReducedMotion) return;
    animateHoverEnter(cardRef.current, gradientRef.current, borderGlowRef.current, config);
  }, [config, prefersReducedMotion, animateHoverEnter]);

  // Hover end animation
  const animateHoverLeave = contextSafe(
    (
      card: HTMLElement,
      gradient: HTMLDivElement | null,
      border: HTMLDivElement | null,
      conf: Required<CardAnimationConfig>
    ) => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: conf.shadows.rest,
        duration: conf.durations.rest,
        ease: 'power2.out',
      });

      if (gradient) {
        gsap.to(gradient, {
          opacity: 0,
          duration: conf.durations.rest,
          ease: 'power2.out',
        });
      }

      if (border) {
        gsap.to(border, {
          opacity: 0,
          duration: conf.durations.rest,
          ease: 'power2.out',
        });
      }
    }
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current || prefersReducedMotion) return;
    animateHoverLeave(cardRef.current, gradientRef.current, borderGlowRef.current, config);
  }, [config, prefersReducedMotion, animateHoverLeave]);

  // Press animation
  const animatePress = contextSafe((card: HTMLElement, conf: Required<CardAnimationConfig>) => {
    gsap.to(card, {
      scale: conf.pressScale,
      duration: conf.durations.press,
      ease: 'power2.inOut',
    });
  });

  const handleMouseDown = useCallback(() => {
    if (!cardRef.current || prefersReducedMotion) return;
    animatePress(cardRef.current, config);
  }, [config, prefersReducedMotion, animatePress]);

  // Release animation
  const animateRelease = contextSafe((card: HTMLElement, conf: Required<CardAnimationConfig>) => {
    gsap.to(card, {
      scale: conf.hoverScale,
      duration: conf.durations.release,
      ease: 'back.out(1.7)',
    });
  });

  const handleMouseUp = useCallback(() => {
    if (!cardRef.current || prefersReducedMotion) return;
    animateRelease(cardRef.current, config);
  }, [config, prefersReducedMotion, animateRelease]);

  // Focus animation
  const animateFocus = contextSafe((card: HTMLElement, conf: Required<CardAnimationConfig>) => {
    gsap.to(card, {
      boxShadow: conf.shadows.focus,
      duration: conf.durations.focus,
      ease: 'power2.out',
    });
  });

  const handleFocus = useCallback(() => {
    if (!cardRef.current || prefersReducedMotion) return;
    animateFocus(cardRef.current, config);
  }, [config, prefersReducedMotion, animateFocus]);

  // Blur animation
  const animateBlur = contextSafe((card: HTMLElement, conf: Required<CardAnimationConfig>) => {
    gsap.to(card, {
      boxShadow: conf.shadows.rest,
      duration: conf.durations.focus,
      ease: 'power2.out',
    });
  });

  const handleBlur = useCallback(() => {
    if (!cardRef.current || prefersReducedMotion) return;
    animateBlur(cardRef.current, config);
  }, [config, prefersReducedMotion, animateBlur]);

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
  selector = '[data-slot="animated-card"]',
  staggerDelay = 0.08,
  prefersReducedMotion = false
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
