import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useGSAP - Core hook for GSAP animations with proper cleanup
 * Respects prefers-reduced-motion
 */
export function useGSAP(
  callback: (ctx: gsap.Context) => void,
  deps: React.DependencyList = [],
  scope?: React.RefObject<HTMLElement>
) {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      callback(ctx as unknown as gsap.Context);
    }, scope?.current || undefined);

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ctxRef;
}

/**
 * useScrollReveal - Simple scroll-triggered reveal animation
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  y?: number;
  x?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  start?: string;
  childSelector?: string;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const {
      y = 40,
      x = 0,
      opacity = 0,
      duration = 0.8,
      delay = 0,
      stagger = 0.1,
      start = 'top 85%',
      childSelector,
    } = options || {};

    const targets = childSelector ? el.querySelectorAll(childSelector) : el;

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y,
        x,
        opacity,
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: 'play none none none',
        },
      });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

/**
 * useParallax - Parallax effect on scroll
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed: number = 0.3,
  direction: 'y' | 'x' = 'y'
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        [direction]: () => speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, direction]);

  return ref;
}

/**
 * useCountUp - Animate number counting up when element enters viewport
 */
export function useCountUp(
  target: number,
  options?: { duration?: number; start?: string; suffix?: string; prefix?: string }
) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.textContent = `${options?.prefix || ''}${target}${options?.suffix || ''}`;
      return;
    }

    const obj = { val: 0 };

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: target,
        duration: options?.duration || 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: options?.start || 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          el.textContent = `${options?.prefix || ''}${Math.round(obj.val)}${options?.suffix || ''}`;
        },
      });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return ref;
}

/**
 * Refresh ScrollTrigger (useful after route changes)
 */
export function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}

export { gsap, ScrollTrigger };
