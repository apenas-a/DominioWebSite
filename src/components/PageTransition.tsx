import { ReactNode, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const content = contentRef.current;

    if (!content || prefersReduced) return;

    // Animate content entrance cleanly on route change
    gsap.fromTo(
      content,
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
        clearProps: "all",
      }
    );
  }, [location.pathname]);

  return <div ref={contentRef}>{children}</div>;
};

export default PageTransition;
