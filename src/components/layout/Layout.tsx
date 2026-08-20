import { useEffect, ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "@/components/PageTransition";
import MobileActionBar from "./MobileActionBar";
import { useLenisInit, getLenis } from "@/hooks/useLenis";
import { useLocation, Outlet } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface LayoutProps {
  children?: ReactNode;
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

    const t1 = setTimeout(() => {
      ScrollTrigger.update();
      ScrollTrigger.refresh();
    }, 50);

    const t2 = setTimeout(() => {
      ScrollTrigger.update();
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <PageTransition>
          {children ?? <Outlet />}
        </PageTransition>
      </main>
      <Footer />
      <MobileActionBar />
    </div>
  );
};

export default Layout;
