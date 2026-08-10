import { Link } from "react-router-dom";
import logo from "@/assets/logo-fundacao-dominio.png";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);

  const links = [
    { to: "/", label: "Início" },
    { to: "/ferro", label: "Ferro" },
    { to: "/aco", label: "Aço" },
    { to: "/processo", label: "Processo" },
    { to: "/produtos", label: "Produtos" },
    { to: "/orcamento", label: "Orçamento" },
  ];

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll(".footer-reveal"), {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="bg-[hsl(30_12%_6%)] border-t border-border/30 py-10 sm:py-16 relative">
      <div className="divider-molten absolute top-0 left-0 right-0" />
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <Link
            to="/"
            className="footer-reveal flex items-center gap-3 transition-opacity duration-300 hover:opacity-80"
          >
            <img src={logo} alt="Fundição Domínio" className="h-12 w-auto" />
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.25em] text-foreground/40 border-l border-border/30 pl-3 leading-relaxed">
              Fundição de<br />Ferro e Aço
            </span>
          </Link>

          {/* Navigation */}
          <nav className="footer-reveal flex flex-wrap justify-center gap-4 md:gap-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-foreground/45 hover:text-accent transition-colors duration-300 text-xs uppercase tracking-wider"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="footer-reveal text-foreground/35 text-xs text-center md:text-right leading-relaxed">
            © {currentYear} Fundição Domínio.<br className="hidden md:block" /> Todos os direitos reservados.
          </p>
        </div>

        <div className="footer-reveal mt-8 pt-8 border-t border-border/20 text-center">
          <p className="text-foreground/25 text-[11px] tracking-wide">
            Quintana - SP | contato@fundicaodominio.com.br | (14) 99179-0555
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
