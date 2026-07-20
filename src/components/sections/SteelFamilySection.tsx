import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Shield } from "lucide-react";

export interface SteelAlloy {
  name: string;
  mainStatLabel?: string;
  mainStatValue?: string;
  mainStatPct?: number;
  tagline: string;
  description: string;
  properties: { label: string; value: number }[];
  applications: string[];
  icon: React.ElementType;
  image: string;
  shape: string;
  standardPrefix?: string;
}

export interface SteelFamilySectionProps {
  id: string;
  badge: string;
  title: React.ReactNode;
  description: string;
  alloys: SteelAlloy[];
  isFirst?: boolean;
}

const SteelFamilySection = ({ id, badge, title, description, alloys, isFirst = false }: SteelFamilySectionProps) => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.05 });

  return (
    <section id={id} className={`${isFirst ? "pt-24 sm:pt-32" : "pt-16 sm:pt-24"} pb-16 sm:pb-24 surface-forge relative overflow-hidden ${!isFirst ? "border-t border-border/40" : ""}`}>
      <div className="section-container relative z-10">
        <div
          ref={titleRef}
          className={`text-center mb-8 sm:mb-16 transition-all duration-700 ${
            titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full border border-accent/30 bg-accent/5 text-xs uppercase tracking-[0.2em] text-accent backdrop-blur-md">
            <Shield size={14} />
            {badge}
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 gradient-molten mx-auto mb-4 sm:mb-6" />
          <p className="text-xs sm:text-base md:text-lg text-foreground/70 max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {alloys.map((steel, index) => {
            const Icon = steel.icon;
            const statLabel = steel.mainStatLabel || "Teor de Carbono";
            const statValue = steel.mainStatValue || "";
            const statPct = steel.mainStatPct || 0;
            const prefix = steel.standardPrefix || "SAE / ABNT";

            return (
              <div
                key={steel.name}
                className={`relative glass-dark edge-glow rounded-xl sm:rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-2 transition-all duration-500 ${
                  gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                {/* Microscope lens image */}
                <div className="relative aspect-square overflow-hidden flex-shrink-0 bg-black border-b border-white/10 flex items-center justify-center p-1.5 sm:p-3">
                  <div className="w-[88%] h-[88%] rounded-full overflow-hidden border-2 sm:border-4 border-[#1a1a1a] shadow-[inset_0_0_20px_rgba(0,0,0,0.9),0_0_15px_rgba(255,120,30,0.1)] relative group-hover:border-accent/40 transition-colors duration-700">
                    <img
                      src={steel.image}
                      alt={`Microestrutura ${steel.name}`}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 saturate-50 group-hover:saturate-100 mix-blend-screen"
                    />
                    <div className="absolute inset-0 border border-white/10 rounded-full pointer-events-none" />
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 pointer-events-none" />
                    <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/10 pointer-events-none" />
                  </div>
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border border-white/10 text-accent font-mono text-[7px] sm:text-[10px] uppercase tracking-widest shadow-lg z-20 group-hover:text-molten transition-colors">
                    {steel.shape}
                  </div>
                </div>

                {/* Card content */}
                <div className="p-3 sm:p-6 lg:p-7 flex flex-col flex-grow">
                  {/* Icon + prefix — hidden on mobile for compactness */}
                  <div className="hidden sm:flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl gradient-molten flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 font-medium text-right max-w-[100px] leading-tight">
                      {prefix}
                    </span>
                  </div>

                  <h3 className="font-heading text-sm sm:text-2xl font-bold uppercase text-foreground mb-0.5 sm:mb-1">
                    {steel.name}
                  </h3>
                  <p className="text-accent text-[9px] sm:text-xs uppercase tracking-wider mb-2 sm:mb-4 font-semibold line-clamp-1">
                    {steel.tagline}
                  </p>

                  {/* Main Stat Bar — hidden on mobile */}
                  <div className="hidden sm:block mb-5">
                    <div className="flex justify-between text-[11px] uppercase tracking-wider text-foreground/60 mb-1.5">
                      <span>{statLabel}</span>
                      <span className="text-foreground/80 font-medium">{statValue}</span>
                    </div>
                    <div className="h-1.5 bg-background/60 rounded-full overflow-hidden border border-border/40">
                      <div
                        className="h-full gradient-molten rounded-full transition-all duration-1000"
                        style={{ width: gridVisible ? `${statPct}%` : "0%" }}
                      />
                    </div>
                  </div>

                  {/* Description — hidden on mobile */}
                  <p className="hidden sm:block text-sm text-foreground/75 leading-relaxed mb-5">{steel.description}</p>

                  {/* Property bars */}
                  <div className="space-y-1.5 sm:space-y-2.5 mb-3 sm:mb-5">
                    {steel.properties.map((p, i) => (
                      <div key={p.label}>
                        <div className="flex justify-between text-[9px] sm:text-[11px] text-foreground/70 mb-0.5 sm:mb-1">
                          <span className="truncate mr-1">{p.label}</span>
                          <span className="text-foreground/50 shrink-0">{p.value}%</span>
                        </div>
                        <div className="h-0.5 sm:h-1 bg-background/60 rounded-full overflow-hidden">
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

                  <div className="mt-auto pt-2 sm:pt-4 border-t border-border/30">
                    <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.18em] text-foreground/50 mb-1 sm:mb-2">
                      Aplicações
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {steel.applications.map((app) => (
                        <span
                          key={app}
                          className="text-[8px] sm:text-[11px] px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-background/50 border border-border/40 text-foreground/75"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
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

export default SteelFamilySection;
