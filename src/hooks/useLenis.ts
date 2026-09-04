import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

/**
 * useLenis - Initializes Lenis smooth scrolling and syncs with GSAP ScrollTrigger
 * Should be called ONCE at the Layout/App level
 */
export function useLenisInit() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    lenisInstance = lenis;

    // Sync Lenis with GSAP ScrollTrigger
    const updateScrollTrigger = () => ScrollTrigger.update();
    lenis.on('scroll', updateScrollTrigger);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);

    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off('scroll', updateScrollTrigger);
      lenis.destroy();
      lenisRef.current = null;
      lenisInstance = null;
    };
  }, []);

  return lenisRef;
}

/**
 * Get the current Lenis instance (for scrollTo, etc.)
 */
export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Scroll to a target element or position
 */
export function scrollTo(target: string | HTMLElement | number, options?: {
  offset?: number;
  duration?: number;
  immediate?: boolean;
}) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, {
      offset: options?.offset || 0,
      duration: options?.duration || 1.2,
      immediate: options?.immediate || false,
    });
  } else {
    // Fallback without Lenis
    if (typeof target === 'string') {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  }
}
