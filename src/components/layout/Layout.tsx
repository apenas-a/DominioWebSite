import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "@/components/PageTransition";
import MobileActionBar from "./MobileActionBar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-20 md:pb-0">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <MobileActionBar />
    </div>
  );
};

export default Layout;
