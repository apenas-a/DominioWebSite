import { ShieldCheck, Award, Factory, Gem } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const TrustSignals = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const signals = [
    { icon: ShieldCheck, text: "Qualidade Comprovada" },
    { icon: Factory, text: "Entrega no Prazo" },
    { icon: Award, text: "Certificação de Materiais" },
    { icon: Gem, text: "Acabamento Premium" },
  ];

  return (
    <section className="py-12 bg-card/30 border-y border-border/40 relative overflow-hidden">
      {/* Subtle shine effect */}
      <div className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_5s_infinite]" />

      <div className="section-container" ref={ref}>
        <div
          className={`grid grid-cols-2 gap-y-6 gap-x-4 md:flex md:flex-wrap md:justify-between md:items-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {signals.map((signal, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 text-foreground/70 hover:text-accent transition-colors duration-300 group justify-start md:justify-center"
            >
              <div className="p-2.5 rounded-xl bg-background/50 border border-border/50 group-hover:border-accent/30 group-hover:bg-accent/10 transition-colors shrink-0">
                <signal.icon className="w-5 h-5" />
              </div>
              <span className="font-heading text-xs sm:text-sm font-medium uppercase tracking-wider leading-tight">
                {signal.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;
