import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import nodularImg from "@/assets/microstructure-nodular.jpg";
import vermicularImg from "@/assets/microstructure-vermicular.jpg";
import cinzentoImg from "@/assets/microstructure-cinzento.jpg";
import steel1045Img from "@/assets/microstructure-steel-1045.jpg";
import steel4140Img from "@/assets/microstructure-steel-4140.jpg";
import steelH13Img from "@/assets/microstructure-steel-h13.jpg";

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
    color: "from-blue-400 to-slate-500",
    to: "/aco",
  },
  {
    name: "Aços Baixa Liga",
    image: steel4140Img,
    desc: "Alta resistência e temperabilidade (Séries 4xxx e 8xxx).",
    color: "from-slate-400 to-zinc-600",
    to: "/aco",
  },
  {
    name: "Aços Alta Liga",
    image: steelH13Img,
    desc: "Aços ferramenta, extrema dureza e resistência térmica.",
    color: "from-zinc-400 to-stone-600",
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

const AlloyAccordionGrid = ({ title, subtitle, badge, badgeIcon, alloys, linkTo, linkLabel }: AlloySectionProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const [activeIndex, setActiveIndex] = useState<number>(0);

  return (
    <div className="section-container relative z-10" ref={ref}>
      <div
        className={`flex flex-col md:flex-row justify-between items-end gap-6 mb-10 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full border border-accent/30 bg-accent/5 text-xs uppercase tracking-[0.2em] text-accent backdrop-blur-md">
            {badgeIcon}
            {badge}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight">
            {title}
          </h2>
          <div className="w-24 h-1 gradient-molten mt-4" />
          <p className="text-foreground/70 mt-4 text-sm sm:text-base max-w-lg">{subtitle}</p>
        </div>

        <Link
          to={linkTo}
          className="group flex items-center gap-2 text-foreground hover:text-accent font-semibold uppercase tracking-wide transition-colors shrink-0"
        >
          {linkLabel}
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Accordion Container */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 h-[560px] sm:h-[480px] md:h-[420px] w-full">
        {alloys.map((alloy, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={alloy.name}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              className={`group relative rounded-xl overflow-hidden cursor-pointer bg-card border transition-all duration-500 ease-in-out flex flex-col p-5 sm:p-6 select-none ${
                isActive
                  ? "flex-[3.5] border-accent shadow-[0_0_25px_rgba(255,90,45,0.25)]"
                  : "flex-1 border-border/60 hover:border-accent/40"
              } ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Background Image & Gradient */}
              <img
                src={alloy.image}
                alt={alloy.name}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  isActive ? "scale-105 opacity-85" : "scale-100 opacity-40 group-hover:opacity-60"
                }`}
              />
              <div
                className={`absolute inset-0 transition-opacity duration-500 bg-gradient-to-t ${
                  isActive
                    ? "from-background/95 via-background/60 to-background/20"
                    : "from-background/90 via-background/70 to-background/50"
                }`}
              />

              {/* Accent Strip */}
              <div
                className={`absolute top-0 left-0 w-full md:w-1.5 h-1.5 md:h-full bg-gradient-to-r md:bg-gradient-to-b ${alloy.color} transition-all duration-500 ${
                  isActive ? "opacity-100" : "opacity-40"
                }`}
              />

              {/* Card Inner Content */}
              <div
                className={`relative z-10 flex flex-col h-full w-full transition-all duration-500 ${
                  isActive
                    ? "justify-end items-start"
                    : "justify-center items-center md:items-center"
                }`}
              >
                {/* Title */}
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

                {/* Description & Action Button (Visible when active) */}
                <div
                  className={`transition-all duration-500 overflow-hidden w-full ${
                    isActive
                      ? "opacity-100 translate-y-0 max-h-48"
                      : "opacity-0 translate-y-4 max-h-0 pointer-events-none"
                  }`}
                >
                  <p className="text-foreground/90 text-xs sm:text-sm lg:text-base mb-4 leading-relaxed line-clamp-3 max-w-lg">
                    {alloy.desc}
                  </p>

                  <Link
                    to={alloy.to}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-accent/90 transition-colors shadow-md group/btn"
                  >
                    <span>Descobrir mais</span>
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
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
        title={<>Ferro <span className="text-gradient-molten">Fundido</span></>}
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
        title={<>Aços <span className="text-gradient-molten">Fundidos</span></>}
        subtitle="Famílias completas de aços carbono, baixa e alta liga — soluções metalúrgicas precisas para componentes submetidos a esforços severos."
        alloys={steelAlloys}
        linkTo="/aco"
        linkLabel="Ver especificações e aplicações"
      />
    </section>
  );
};

export default HomeAlloys;
