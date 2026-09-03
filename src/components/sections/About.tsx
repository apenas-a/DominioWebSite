import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import empresaImg from "@/assets/Empresa.jpeg";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  { short: "2022", label: "Fundada" },
  { short: "Do projeto à peça", label: "Ciclo completo" },
  { short: "Sob medida", label: "Cada cliente" },
  { short: "Quintana · SP", label: "Localização" },
];

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [activeItem, setActiveItem] = useState<number | null>(null);

  // ── Parallax image ───────────────────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section || !img) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // Image slides in from left
      gsap.fromTo(
        img.parentElement,
        { clipPath: "inset(0 100% 0 0)", opacity: 0 },
        {
          clipPath: "inset(0 0% 0 0)",
          opacity: 1,
          duration: 1.1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );

      if (!prefersReduced) {
        gsap.to(img, {
          y: 40,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Text lines stagger from right
      gsap.fromTo(
        ".about-line",
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.09,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-text-col",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Pillar items
      gsap.fromTo(
        ".about-pillar",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.55,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-pillars",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="sobre"
      className="relative overflow-hidden py-20 sm:py-28"
      style={{
        background:
          "radial-gradient(ellipse at 10% 50%, hsl(20 100% 55% / 0.04) 0%, transparent 50%), hsl(30 15% 7%)",
      }}
    >
      {/* Technical grid */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Image column ─────────────────────────────────────────── */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            {/* The clip-path container */}
            <div className="absolute inset-0 overflow-hidden rounded-sm">
              <img
                ref={imgRef}
                src={empresaImg}
                alt="Fundição Domínio — Quintana SP"
                className="w-full h-full object-cover scale-[1.08]"
              />
              {/* Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/20 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Corner markers */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-accent/50" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-accent/30" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-accent/30" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-accent/50" />

            {/* Label */}
            <div className="absolute bottom-5 left-5 label-tech text-foreground/30">
              Quintana · SP · Brasil
            </div>
          </div>

          {/* ── Text column ──────────────────────────────────────────── */}
          <div className="about-text-col flex flex-col gap-0">
            {/* Section label */}
            <p className="about-line font-mono text-[10px] uppercase tracking-[0.4em] text-accent/60 mb-5">
              // Sobre nós
            </p>

            {/* Headline — split lines */}
            <h2 className="about-line font-heading font-black uppercase text-4xl sm:text-5xl leading-[0.92] mb-1">
              Entender
            </h2>
            <h2 className="about-line font-heading font-black uppercase text-4xl sm:text-5xl leading-[0.92] text-gradient-molten mb-6">
              para atender.
            </h2>

            <div className="about-line w-10 h-px bg-accent/40 mb-7" />

            {/* Body text */}
            <p className="about-line text-foreground/55 text-sm sm:text-base leading-relaxed mb-3">
              Localizada em Quintana-SP, a Fundição Domínio nasceu com um propósito simples:{" "}
              <span className="text-foreground/80">entender a real necessidade de cada cliente</span>{" "}
              antes de fundir qualquer peça.
            </p>
            <p className="about-line text-foreground/40 text-sm leading-relaxed mb-10">
              Operamos todo o ciclo — do planejamento à usinagem — com controle metalúrgico
              rigoroso e engenharia aplicada a ferro fundido e aço carbono.
            </p>

            {/* Pillar list — interactive, no cards */}
            <div className="about-pillars flex flex-col divide-y divide-border/20">
              {PILLARS.map((p, i) => (
                <div
                  key={i}
                  className={`about-pillar opacity-0 flex items-center justify-between py-3.5 cursor-default transition-colors duration-200 group ${
                    activeItem === i ? "text-accent" : "text-foreground/50 hover:text-foreground/80"
                  }`}
                  onMouseEnter={() => setActiveItem(i)}
                  onMouseLeave={() => setActiveItem(null)}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[9px] text-foreground/20 w-4">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-heading font-semibold uppercase tracking-wide text-sm">
                      {p.short}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[9px] uppercase tracking-[0.25em] transition-all duration-300 ${
                      activeItem === i ? "opacity-100 text-accent/70" : "opacity-0"
                    }`}
                  >
                    {p.label}
                  </span>
                  <div
                    className={`w-px bg-accent/40 transition-all duration-300 ${
                      activeItem === i ? "h-5" : "h-0"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              to="/orcamento"
              className="about-line mt-10 inline-flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-foreground/40 hover:text-accent transition-colors duration-300 group w-fit"
            >
              <span>Fale conosco</span>
              <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
