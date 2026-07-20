import { Link } from "react-router-dom";
import { ArrowRight, Settings2, Flame, Wrench } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const HomeProcess = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });

  const steps = [
    {
      icon: Settings2,
      title: "Planejamento e Moldagem",
      desc: "Precisão na criação dos moldes para garantir dimensões exatas.",
    },
    {
      icon: Flame,
      title: "Fusão e Análise",
      desc: "Controle térmico e químico rigoroso do metal fundido.",
    },
    {
      icon: Wrench,
      title: "Vazamento e Acabamento",
      desc: "Solidificação controlada e usinagem com padrão de qualidade.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 gradient-dark relative overflow-hidden">
      {/* Visual background element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-molten/5 blur-[100px] pointer-events-none" />

      <div className="section-container relative z-10" ref={ref}>
        <div
          className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-foreground">
            Tradição e <span className="text-gradient-molten">Tecnologia</span>
          </h2>
          <div className="w-24 h-1 gradient-molten mx-auto mb-6" />
          <p className="text-foreground/70 max-w-2xl mx-auto text-sm sm:text-base">
            Um processo produtivo dominado de ponta a ponta, unindo a arte da fundição
            à tecnologia moderna de controle de qualidade.
          </p>
        </div>

        {/* Desktop: static 3-column grid. Mobile: stacked vertical scroll. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
          {/* Connection line — desktop only */}
          <div className="hidden sm:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent z-0 pointer-events-none" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className={`relative z-10 flex flex-col items-center text-center group transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="w-24 h-24 rounded-full bg-card border-2 border-border/50 flex items-center justify-center mb-6 relative overflow-hidden group-hover:border-accent/50 transition-colors duration-500 shadow-lg group-hover:shadow-accent/10">
                  <div className="absolute inset-0 bg-gradient-to-t from-molten/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Icon className="w-10 h-10 text-foreground group-hover:text-accent relative z-10 transition-colors" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold uppercase mb-3 text-foreground group-hover:text-accent transition-colors">
                  {step.title}
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed px-2">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div
          className={`text-center mt-12 sm:mt-16 transition-all duration-700 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <Link
            to="/processo"
            className="inline-flex items-center gap-2 border border-border hover:border-accent bg-card/50 px-6 py-3 rounded-full text-foreground hover:text-accent transition-all duration-300 font-medium uppercase tracking-wide text-sm group"
          >
            Conheça nosso chão de fábrica
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeProcess;
