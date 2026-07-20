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

const AlloyGrid = ({ title, subtitle, badge, badgeIcon, alloys, linkTo, linkLabel }: AlloySectionProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

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

      {/* SVG Gooey Filter */}
      <svg className="hidden">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" />
            <feBlend in="SourceGraphic" in2="gooey" />
          </filter>
        </defs>
      </svg>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
        {alloys.map((alloy, index) => (
          <div
            key={alloy.name}
            className={`group relative rounded-2xl overflow-hidden aspect-[9/16] bg-card border border-border/50 hover:border-accent/50 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <img
              src={alloy.image}
              alt={alloy.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            {/* Gooey melt on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{ filter: "url(#gooey)" }}
            >
              <div className="absolute -bottom-10 left-1/4 w-20 h-20 bg-accent/40 rounded-full animate-bounce-slow" style={{ animationDelay: "0s" }} />
              <div className="absolute -bottom-12 left-1/2 w-16 h-16 bg-molten/40 rounded-full animate-bounce-slow" style={{ animationDelay: "0.2s" }} />
              <div className="absolute -bottom-8 right-1/4 w-24 h-24 bg-accent/30 rounded-full animate-bounce-slow" style={{ animationDelay: "0.4s" }} />
            </div>

            <div className="absolute bottom-0 left-0 w-full p-3 sm:p-6 lg:p-8">
              <div
                className={`w-8 sm:w-12 h-1 bg-gradient-to-r ${alloy.color} mb-2 sm:mb-4 transform origin-left transition-transform duration-300 group-hover:scale-x-150`}
              />
              <h3 className="font-heading text-sm sm:text-xl lg:text-2xl font-bold uppercase text-foreground mb-1 sm:mb-2 truncate">
                {alloy.name}
              </h3>
              <p className="text-foreground/80 text-[10px] sm:text-sm lg:text-base mb-2 sm:mb-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 line-clamp-2">
                {alloy.desc}
              </p>
              <Link
                to={alloy.to}
                className="inline-flex items-center gap-1 sm:gap-2 text-accent text-[10px] sm:text-sm font-semibold uppercase tracking-wider transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100"
              >
                <span className="hidden sm:inline">Descobrir mais</span>
                <span className="sm:hidden">Ver</span>
                <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HomeAlloys = () => {
  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
      {/* Ferro Fundido */}
      <AlloyGrid
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
      <AlloyGrid
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
