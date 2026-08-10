import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Zap, Wrench } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface SteelAlloy {
  name: string;
  carbon: string;
  carbonPct: number;
  tagline: string;
  description: string;
  properties: { label: string; value: number }[];
  applications: string[];
  icon: typeof Shield;
}

const steels: SteelAlloy[] = [
  {
    name: "Aço 1020",
    carbon: "0,18 – 0,23% C",
    carbonPct: 22,
    tagline: "Baixo carbono, alta soldabilidade",
    description:
      "Excelente conformabilidade e usinagem. Ideal para peças estruturais que exigem tenacidade e boa resposta a tratamentos superficiais como cementação.",
    properties: [
      { label: "Resistência à tração", value: 55 },
      { label: "Ductilidade", value: 90 },
      { label: "Soldabilidade", value: 95 },
      { label: "Usinabilidade", value: 75 },
    ],
    applications: ["Eixos", "Buchas", "Suportes estruturais", "Peças cementadas"],
    icon: Shield,
  },
  {
    name: "Aço 1030",
    carbon: "0,28 – 0,34% C",
    carbonPct: 32,
    tagline: "Médio carbono, equilíbrio mecânico",
    description:
      "Ótima combinação entre resistência mecânica e tenacidade. Responde bem a tratamentos térmicos como têmpera e revenido para aplicações de médio esforço.",
    properties: [
      { label: "Resistência à tração", value: 72 },
      { label: "Ductilidade", value: 70 },
      { label: "Soldabilidade", value: 75 },
      { label: "Usinabilidade", value: 80 },
    ],
    applications: ["Engrenagens", "Componentes forjados", "Virabrequins leves", "Bases estruturais"],
    icon: Zap,
  },
  {
    name: "Aço 1045",
    carbon: "0,43 – 0,50% C",
    carbonPct: 47,
    tagline: "Médio-alto carbono, alta resistência",
    description:
      "Excelente resposta a tratamentos térmicos, entregando alta dureza e resistência mecânica. Solução robusta para componentes submetidos a esforços severos.",
    properties: [
      { label: "Resistência à tração", value: 92 },
      { label: "Ductilidade", value: 55 },
      { label: "Soldabilidade", value: 55 },
      { label: "Usinabilidade", value: 85 },
    ],
    applications: ["Eixos de alta carga", "Pinhões", "Componentes temperados", "Peças de máquinas pesadas"],
    icon: Wrench,
  },
];

const SteelAlloys = () => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (isReducedMotion) {
      gsap.set(".steel-alloy-header, .steel-alloy-card", { opacity: 1, y: 0 });
      gsap.set(".steel-alloy-progress", { width: (i, el) => el.getAttribute("data-width") });
      return;
    }

    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".steel-alloy-header", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".steel-alloy-header",
          start: "top 85%",
        }
      });

      // Cards Animation
      gsap.from(".steel-alloy-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".steel-alloy-grid",
          start: "top 80%",
        }
      });

      // Progress Bars Animation
      ScrollTrigger.create({
        trigger: ".steel-alloy-grid",
        start: "top 75%",
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>(".steel-alloy-progress").forEach(bar => {
            gsap.to(bar, {
              width: bar.getAttribute("data-width") || "0%",
              duration: 1.2,
              ease: "power3.out"
            });
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="aco" ref={containerRef} className="py-16 sm:py-24 surface-forge relative overflow-hidden border-t border-border/40">
      <div className="section-container relative z-10">
        <div className="steel-alloy-header text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full border border-accent/30 bg-accent/5 text-xs uppercase tracking-[0.2em] text-accent">
            <Shield size={14} />
            Fundição de Aço
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
            Ligas de <span className="text-gradient-molten">Aço Carbono</span>
          </h2>
          <div className="w-24 h-1 gradient-molten mx-auto mb-6" />
          <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-3xl mx-auto">
            Trabalhamos com aços carbono das séries 1020, 1030 e 1045 — cada um com um perfil
            mecânico específico para atender projetos de estruturas, engrenagens e componentes
            submetidos a esforços elevados.
          </p>
        </div>

        <div className="steel-alloy-grid grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {steels.map((steel) => {
            const Icon = steel.icon;
            return (
              <div
                key={steel.name}
                className="steel-alloy-card relative glass-dark edge-glow rounded-2xl p-6 sm:p-7 flex flex-col group hover:-translate-y-2 transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl gradient-molten flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 font-medium">
                    SAE / ABNT
                  </span>
                </div>

                <h3 className="font-heading text-2xl font-bold uppercase text-foreground mb-1">
                  {steel.name}
                </h3>
                <p className="text-accent text-xs uppercase tracking-wider mb-4 font-semibold">
                  {steel.tagline}
                </p>

                {/* Barra de carbono */}
                <div className="mb-5">
                  <div className="flex justify-between text-[11px] uppercase tracking-wider text-foreground/60 mb-1.5">
                    <span>Teor de Carbono</span>
                    <span className="text-foreground/80 font-medium">{steel.carbon}</span>
                  </div>
                  <div className="h-1.5 bg-background/60 rounded-full overflow-hidden border border-border/40">
                    <div
                      className="steel-alloy-progress h-full gradient-molten rounded-full"
                      data-width={`${steel.carbonPct * 2}%`}
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>

                <p className="text-sm text-foreground/75 leading-relaxed mb-5">
                  {steel.description}
                </p>

                {/* Propriedades */}
                <div className="space-y-2.5 mb-5">
                  {steel.properties.map((p) => (
                    <div key={p.label}>
                      <div className="flex justify-between text-[11px] text-foreground/70 mb-1">
                        <span>{p.label}</span>
                        <span className="text-foreground/50">{p.value}%</span>
                      </div>
                      <div className="h-1 bg-background/60 rounded-full overflow-hidden">
                        <div
                          className="steel-alloy-progress h-full bg-gradient-to-r from-accent to-molten rounded-full"
                          data-width={`${p.value}%`}
                          style={{ width: "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-border/30">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/50 mb-2">
                    Aplicações típicas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {steel.applications.map((app) => (
                      <span
                        key={app}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-background/50 border border-border/40 text-foreground/75"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SteelAlloys;
