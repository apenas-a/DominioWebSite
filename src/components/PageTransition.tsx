import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [displayChildren, setDisplayChildren] = useState(children);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplayChildren(children);
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (!overlay || !content || prefersReduced) {
      setDisplayChildren(children);
      return;
    }

    // Transition timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setDisplayChildren(children);
      },
    });

    // Phase 1: Overlay clips in from bottom
    tl.set(overlay, { clipPath: "inset(100% 0 0 0)", display: "block" })
      .to(overlay, {
        clipPath: "inset(0% 0 0 0)",
        duration: 0.35,
        ease: "power3.inOut",
      })
      // Phase 2: Content swap happens in onComplete above
      // Phase 3: Overlay clips out upward
      .to(overlay, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.35,
        ease: "power3.inOut",
        delay: 0.1,
      })
      .set(overlay, { display: "none" });

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // When displayChildren changes, animate content in
  useEffect(() => {
    const content = contentRef.current;
    if (!content || isFirstRender.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    gsap.fromTo(
      content,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.1 }
    );
  }, [displayChildren]);

  return (
    <>
      {/* Transition overlay */}
      <div
        ref={overlayRef}
        className="page-transition-overlay"
        style={{ display: "none" }}
      >
        {/* Subtle accent line at the leading edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] gradient-molten" />
      </div>

      {/* Page content */}
      <div ref={contentRef}>{displayChildren}</div>
    </>
  );
};

export default PageTransition;
