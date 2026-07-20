import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Shield, Zap, Wrench } from "lucide-react";

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
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.05 });

  return (
    <section id="aco" className="py-16 sm:py-24 surface-forge relative overflow-hidden border-t border-border/40">
      <div className="section-container relative z-10">
        <div
          ref={titleRef}
          className={`text-center mb-10 sm:mb-16 transition-all duration-700 ${
            titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
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

        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {steels.map((steel, index) => {
            const Icon = steel.icon;
            return (
              <div
                key={steel.name}
                className={`relative glass-dark edge-glow rounded-2xl p-6 sm:p-7 flex flex-col group hover:-translate-y-2 transition-all duration-500 ${
                  gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
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
                      className="h-full gradient-molten rounded-full transition-all duration-1000"
                      style={{ width: gridVisible ? `${steel.carbonPct * 2}%` : "0%" }}
                    />
                  </div>
                </div>

                <p className="text-sm text-foreground/75 leading-relaxed mb-5">
                  {steel.description}
                </p>

                {/* Propriedades */}
                <div className="space-y-2.5 mb-5">
                  {steel.properties.map((p, i) => (
                    <div key={p.label}>
                      <div className="flex justify-between text-[11px] text-foreground/70 mb-1">
                        <span>{p.label}</span>
                        <span className="text-foreground/50">{p.value}%</span>
                      </div>
                      <div className="h-1 bg-background/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-molten rounded-full transition-all duration-700"
                          style={{
                            width: gridVisible ? `${p.value}%` : "0%",
                            transitionDelay: `${index * 120 + i * 80 + 200}ms`,
                          }}
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
