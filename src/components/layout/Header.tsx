import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import logo from "@/assets/logoNavbar.png";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          !isHome
            ? "bg-background border-b border-border/60 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"
            : scrolled
            ? "bg-background/70 backdrop-blur-xl border-b border-border/60 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"
            : "bg-transparent border-b border-transparent",
        )}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center transition-transform duration-300 hover:scale-[1.03]">
              <img src={logo} alt="Fundição Domínio" className="h-14 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      "relative font-medium uppercase tracking-wide text-sm transition-colors duration-300",
                      "after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-accent after:transition-all after:duration-300",
                      isActive
                        ? "text-accent after:w-full"
                        : "text-foreground/80 hover:text-accent after:w-0 hover:after:w-full",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/orcamento"
                className="gradient-molten text-accent-foreground px-6 py-2.5 rounded font-semibold uppercase text-sm tracking-wide transition-all duration-300 hover:opacity-90 hover:scale-105"
              >
                Orçamento
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-foreground p-2"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer overlay — OUTSIDE header to avoid backdrop-filter containing block bug */}
      <div 
        className={cn(
          "fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden transition-all duration-300",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Drawer panel — OUTSIDE header to avoid backdrop-filter containing block bug */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[70] w-[75%] max-w-[280px] bg-black border-l border-border/50 p-6 flex flex-col justify-between shadow-2xl md:hidden transition-transform duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
            <span className="font-heading text-lg font-bold uppercase tracking-wider text-accent">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-foreground p-1"
              aria-label="Fechar Menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "font-medium uppercase tracking-wider text-base py-3 transition-colors duration-300 flex items-center justify-between border-b border-border/10",
                    isActive ? "text-accent" : "text-foreground/80 hover:text-accent",
                  )
                }
              >
                <span>{link.label}</span>
                <span className="text-xs text-foreground/30 font-light">→</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <Link
          to="/orcamento"
          onClick={() => setIsMenuOpen(false)}
          className="gradient-molten text-accent-foreground w-full py-4 rounded-xl font-semibold uppercase text-sm tracking-wide text-center transition-all duration-300 hover:opacity-90 shadow-lg shadow-accent/15"
        >
          Orçamento
        </Link>
      </div>
    </>
  );
};

export default Header;
