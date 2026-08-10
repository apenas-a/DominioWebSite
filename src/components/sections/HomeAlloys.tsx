import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import nodularImg from "@/assets/microstructure-nodular.jpg";
import vermicularImg from "@/assets/microstructure-vermicular.jpg";
import cinzentoImg from "@/assets/microstructure-cinzento.jpg";
import steel1045Img from "@/assets/microstructure-steel-1045.jpg";
import steel4140Img from "@/assets/microstructure-steel-4140.jpg";
import steelH13Img from "@/assets/microstructure-steel-h13.jpg";

gsap.registerPlugin(ScrollTrigger);

const ironAlloys = [
  {
    name: "Nodular",
    image: nodularImg,
    desc: "Alta resistência mecânica e ductilidade.",
    color: "from-orange-500 to-amber-600",
    to: "/ferro",
  },
  {
    name: "Vermicular",
    image: vermicularImg,
    desc: "Condutividade térmica e resistência à fadiga.",
    color: "from-red-500 to-orange-600",
    to: "/ferro",
  },
  {
    name: "Cinzento",
    image: cinzentoImg,
    desc: "Excelente amortecimento e usinabilidade.",
    color: "from-gray-400 to-gray-600",
    to: "/ferro",
  },
];

const steelAlloys = [
  {
    name: "Aços Carbono",
    image: steel1045Img,
    desc: "Equilíbrio ideal entre resistência e tenacidade (Séries 10xx).",
    color: "from-amber-400 to-amber-600",
    to: "/aco",
  },
  {
    name: "Aços Baixa Liga",
    image: steel4140Img,
    desc: "Alta resistência e temperabilidade (Séries 4xxx e 8xxx).",
    color: "from-orange-400 to-orange-600",
    to: "/aco",
  },
  {
    name: "Aços Alta Liga",
    image: steelH13Img,
    desc: "Aços ferramenta, extrema dureza e resistência térmica.",
    color: "from-red-400 to-red-600",
    to: "/aco",
  },
];

interface AlloySectionProps {
  title: React.ReactNode;
  subtitle: string;
  badge: string;
  badgeIcon: React.ReactNode;
  alloys: typeof ironAlloys;
  linkTo: string;
  linkLabel: string;
}

const AlloyAccordionGrid = ({
  title,
  subtitle,
  badge,
  badgeIcon,
  alloys,
  linkTo,
  linkLabel,
}: AlloySectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from(".alloy-header", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      // Cards stagger
      gsap.from(".alloy-card", {
        opacity: 0,
        y: 40,
        stagger: 0.12,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".alloy-cards-container",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div className="section-container relative z-10" ref={containerRef}>
      {/* Header */}
      <div className="alloy-header flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div className="max-w-2xl">
          <div className="badge-accent mb-4">
            {badgeIcon}
            {badge}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight">
            {title}
          </h2>
          <div className="w-20 h-[2px] gradient-molten mt-4" />
          <p className="text-foreground/60 mt-4 text-sm sm:text-base max-w-lg">
            {subtitle}
          </p>
        </div>

        <Link
          to={linkTo}
          className="group flex items-center gap-2 text-foreground/70 hover:text-accent font-semibold uppercase tracking-wide text-sm transition-colors shrink-0"
        >
          {linkLabel}
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Accordion Cards */}
      <div className="alloy-cards-container flex flex-col md:flex-row gap-3 h-[540px] sm:h-[460px] md:h-[400px] w-full">
        {alloys.map((alloy, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={alloy.name}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              className={`alloy-card group relative rounded-xl overflow-hidden cursor-pointer bg-card border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col p-5 sm:p-6 select-none ${
                isActive
                  ? "flex-[3.5] border-accent/40 shadow-[0_0_25px_rgba(255,90,45,0.15)]"
                  : "flex-1 border-border/50 hover:border-accent/20"
              }`}
            >
              {/* Background Image */}
              <img
                src={alloy.image}
                alt={alloy.name}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  isActive
                    ? "scale-105 opacity-80"
                    : "scale-100 opacity-35 group-hover:opacity-50"
                }`}
              />
              <div
                className={`absolute inset-0 transition-opacity duration-500 bg-gradient-to-t ${
                  isActive
                    ? "from-background/95 via-background/55 to-background/15"
                    : "from-background/90 via-background/65 to-background/45"
                }`}
              />

              {/* Accent Strip */}
              <div
                className={`absolute top-0 left-0 w-full md:w-1 h-1 md:h-full bg-gradient-to-r md:bg-gradient-to-b ${alloy.color} transition-all duration-500 ${
                  isActive ? "opacity-100" : "opacity-30"
                }`}
              />

              {/* Content */}
              <div
                className={`relative z-10 flex flex-col h-full w-full transition-all duration-500 ${
                  isActive
                    ? "justify-end items-start"
                    : "justify-center items-center md:items-center"
                }`}
              >
                <div
                  className={`transition-all duration-500 flex items-center justify-center ${
                    isActive
                      ? "rotate-0 translate-y-0 mb-3"
                      : "md:-rotate-90 md:whitespace-nowrap"
                  }`}
                >
                  <h3
                    className={`font-heading font-bold uppercase tracking-wider transition-all duration-500 ${
                      isActive
                        ? "text-xl sm:text-2xl lg:text-3xl text-foreground"
                        : "text-base sm:text-lg lg:text-xl text-accent"
                    }`}
                  >
                    {alloy.name}
                  </h3>
                </div>

                <div
                  className={`transition-all duration-500 overflow-hidden w-full ${
                    isActive
                      ? "opacity-100 translate-y-0 max-h-48"
                      : "opacity-0 translate-y-4 max-h-0 pointer-events-none"
                  }`}
                >
                  <p className="text-foreground/80 text-xs sm:text-sm lg:text-base mb-4 leading-relaxed line-clamp-3 max-w-lg">
                    {alloy.desc}
                  </p>

                  <Link
                    to={alloy.to}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-accent/90 transition-colors shadow-md group/btn"
                  >
                    <span>Descobrir mais</span>
                    <ArrowRight
                      size={14}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HomeAlloys = () => {
  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
      {/* Ferro Fundido */}
      <AlloyAccordionGrid
        badge="Nossas Especialidades"
        badgeIcon={<Sparkles size={14} />}
        title={
          <>
            Ferro <span className="text-gradient-molten">Fundido</span>
          </>
        }
        subtitle="Ferro fundido nodular, vermicular e cinzento — cada liga com um perfil mecânico específico para o seu projeto."
        alloys={ironAlloys}
        linkTo="/ferro"
        linkLabel="Ver microestruturas e propriedades"
      />

      {/* Divider */}
      <div className="my-12 sm:my-16 section-container">
        <div className="divider-molten" />
      </div>

      {/* Aços Fundidos */}
      <AlloyAccordionGrid
        badge="Fundição de Aço"
        badgeIcon={<Shield size={14} />}
        title={
          <>
            Aços <span className="text-gradient-molten">Fundidos</span>
          </>
        }
        subtitle="Famílias completas de aços carbono, baixa e alta liga — soluções metalúrgicas precisas para componentes submetidos a esforços severos."
        alloys={steelAlloys}
        linkTo="/aco"
        linkLabel="Ver especificações e aplicações"
      />
    </section>
  );
};

export default HomeAlloys;
