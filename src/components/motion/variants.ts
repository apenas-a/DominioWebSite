/**
 * GSAP Animation Presets
 * Centralized animation configurations for consistent motion across the site.
 * These are used with gsap.from() / gsap.to() calls.
 */

export const gsapPresets = {
  /** Fade up from below */
  revealUp: {
    from: { opacity: 0, y: 40 },
    config: { duration: 0.7, ease: "power3.out" },
  },

  /** Fade up with blur */
  revealBlur: {
    from: { opacity: 0, y: 20, filter: "blur(8px)" },
    config: { duration: 0.8, ease: "power2.out" },
  },

  /** Slide from left */
  slideLeft: {
    from: { opacity: 0, x: -40 },
    config: { duration: 0.7, ease: "power3.out" },
  },

  /** Slide from right */
  slideRight: {
    from: { opacity: 0, x: 40 },
    config: { duration: 0.7, ease: "power3.out" },
  },

  /** Scale up from smaller */
  scaleUp: {
    from: { opacity: 0, scale: 0.95 },
    config: { duration: 0.6, ease: "power2.out" },
  },

  /** Stagger children defaults */
  stagger: {
    amount: 0.1,
    from: "start" as const,
  },

  /** Easing presets */
  easing: {
    smooth: "power3.out",
    bounce: "back.out(1.2)",
    sharp: "power4.inOut",
    linear: "none",
    elastic: "elastic.out(1, 0.5)",
  },

  /** ScrollTrigger defaults */
  scrollTrigger: {
    start: "top 85%",
    toggleActions: "play none none none" as const,
  },
} as const;
