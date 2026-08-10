import { useEffect, useState, useRef, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import logo from "@/assets/logoNavbar.png";
import { cn } from "@/lib/utils";
import gsap from "gsap";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Scroll handling — shrink + auto-hide
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 60);
        
        // Auto-hide on scroll down, show on scroll up (only after 300px)
        if (y > 300) {
          setHidden(y > lastScrollY.current && y - lastScrollY.current > 5);
        } else {
          setHidden(false);
        }
        
        lastScrollY.current = y;
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Animate drawer
  useEffect(() => {
    if (!drawerRef.current) return;
    
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(
        drawerRef.current.querySelectorAll(".drawer-link"),
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, stagger: 0.06, duration: 0.4, ease: "power2.out", delay: 0.15 }
      );
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { to: "/", label: "Início", end: true },
    { to: "/ferro", label: "Ferro" },
    { to: "/aco", label: "Aço" },
    { to: "/processo", label: "Processo" },
    { to: "/produtos", label: "Produtos" },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          hidden && !isMenuOpen && "-translate-y-full",
          !isHome
            ? scrolled
              ? "bg-background/85 backdrop-blur-xl border-b border-border/40 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.5)]"
              : "bg-background/70 backdrop-blur-lg border-b border-border/30"
            : scrolled
            ? "bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.5)]"
            : "bg-transparent border-b border-transparent",
        )}
      >
        <div className="section-container">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-500",
              scrolled ? "h-16" : "h-20"
            )}
          >
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center transition-all duration-300 hover:opacity-90"
            >
              <img
                src={logo}
                alt="Fundição Domínio"
                className={cn(
                  "w-auto transition-all duration-500",
                  scrolled ? "h-10" : "h-14"
                )}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      "relative px-4 py-2 font-medium uppercase tracking-wider text-[13px] transition-all duration-300 rounded-md",
                      "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-accent after:transition-all after:duration-300",
                      isActive
                        ? "text-accent after:w-6"
                        : "text-foreground/70 hover:text-foreground after:w-0 hover:after:w-4 hover:bg-white/[0.03]",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/orcamento"
                className={cn(
                  "ml-4 gradient-molten text-accent-foreground px-5 py-2 rounded-md font-semibold uppercase text-[13px] tracking-wider transition-all duration-300 hover:opacity-90 hover:scale-[1.02] shadow-md shadow-accent/10",
                  scrolled ? "py-1.5 px-4 text-xs" : ""
                )}
              >
                Orçamento
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-foreground p-2 hover:text-accent transition-colors"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden transition-all duration-300",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Drawer panel */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[70] w-[80%] max-w-[300px] bg-[hsl(30_12%_8%)] border-l border-accent/10 flex flex-col shadow-2xl md:hidden transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <span className="font-heading text-base font-bold uppercase tracking-[0.2em] text-accent/80">
            Menu
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-foreground/60 hover:text-accent p-1 transition-colors"
            aria-label="Fechar Menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-4 py-6 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "drawer-link font-medium uppercase tracking-wider text-sm py-3 px-3 transition-all duration-300 flex items-center justify-between rounded-lg",
                  isActive
                    ? "text-accent bg-accent/5"
                    : "text-foreground/70 hover:text-foreground hover:bg-white/[0.02]"
                )
              }
            >
              <span>{link.label}</span>
              <span className="text-xs text-foreground/20">→</span>
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div className="p-4 border-t border-border/30">
          <Link
            to="/orcamento"
            onClick={() => setIsMenuOpen(false)}
            className="gradient-molten text-accent-foreground w-full py-3.5 rounded-lg font-semibold uppercase text-sm tracking-wider text-center transition-all duration-300 hover:opacity-90 shadow-lg shadow-accent/10 block"
          >
            Orçamento
          </Link>
        </div>
      </div>
    </>
  );
};

export default Header;
