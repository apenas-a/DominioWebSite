import { ReactNode, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "@/components/PageTransition";
import MobileActionBar from "./MobileActionBar";
import { useLenisInit, getLenis } from "@/hooks/useLenis";
import { useLocation } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useLenisInit();
  const location = useLocation();

  // Reset scroll and refresh ScrollTrigger on route change
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }

    // Delay refresh to let the new page render
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <MobileActionBar />
    </div>
  );
};

export default Layout;
