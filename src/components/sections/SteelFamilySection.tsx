import { useState } from "react";
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

const SteelAlloyFlipCard = ({
  steel,
  index,
  gridVisible,
}: {
  steel: SteelAlloy;
  index: number;
  gridVisible: boolean;
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const Icon = steel.icon;
  const statLabel = steel.mainStatLabel || "Teor de Carbono";
  const statValue = steel.mainStatValue || "";
  const statPct = steel.mainStatPct || 0;
  const prefix = steel.standardPrefix || "SAE / ABNT";

  return (
    <div
      onClick={() => setIsFlipped((prev) => !prev)}
      className={`group [perspective:1000px] h-[360px] sm:h-[440px] lg:h-[480px] w-full cursor-pointer select-none transition-all duration-700 ${
        gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Scoped CSS Animation & Hover Media Query Fix */}
      <style>{`
        @keyframes rotation_481 {
          0% {
            transform: rotateZ(0deg);
          }
          100% {
            transform: rotateZ(360deg);
          }
        }
        @media (hover: hover) {
          .group:hover .flip-card-inner {
            transform: rotateY(180deg);
          }
        }
      `}</style>

      {/* Flip Card Wrapper */}
      <div
        className={`flip-card-inner relative w-full h-full duration-700 ease-in-out transition-transform [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* FRONT SIDE (Capa em Repouso) */}
        <div className="absolute inset-0 w-full h-full bg-[#151515] rounded-xl overflow-hidden [backface-visibility:hidden] -webkit-[backface-visibility:hidden] flex items-center justify-center shadow-2xl">
          {/* Animated Ray of Light Beam Running Around Border */}
          <div className="absolute w-[130px] sm:w-[160px] h-[170%] bg-[linear-gradient(90deg,transparent,#ff9966,#ff9966,#ff5500,#ff9966,transparent)] animate-border-rotate" />

          {/* Inner Front Content */}
          <div className="absolute inset-[2px] bg-[#141414] rounded-[10px] p-3 sm:p-5 flex flex-col justify-between items-center text-center z-10">
            {/* Top Badges */}
            <div className="w-full flex justify-between items-center gap-1">
              <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-widest text-foreground/50 bg-white/5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded border border-white/10 truncate max-w-[48%]">
                {prefix}
              </span>
              <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-widest text-accent bg-accent/10 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded border border-accent/20 truncate max-w-[48%]">
                {steel.shape}
              </span>
            </div>

            {/* Central Microstructure Lens Image */}
            <div className="my-auto flex flex-col items-center justify-center w-full">
              <div className="w-24 h-24 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden border-3 sm:border-4 border-[#222] group-hover:border-accent shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_0_25px_rgba(255,90,45,0.25)] transition-colors duration-500 relative bg-black shrink-0">
                <img
                  src={steel.image}
                  alt={`Microestrutura ${steel.name}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Alloy Name & Subtitle */}
              <h3 className="font-heading text-sm sm:text-xl lg:text-2xl font-bold uppercase text-foreground mt-2 sm:mt-4 mb-0.5 sm:mb-1 leading-tight">
                {steel.name}
              </h3>
              <p className="text-accent text-[9px] sm:text-xs font-semibold uppercase tracking-wider line-clamp-1 max-w-[95%]">
                {steel.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* BACK SIDE (Informações Detalhadas) */}
        <div className="absolute inset-0 w-full h-full bg-[#161616] rounded-xl overflow-hidden [backface-visibility:hidden] -webkit-[backface-visibility:hidden] [transform:rotateY(180deg)] p-3 sm:p-5 flex flex-col justify-between border border-accent/50 shadow-[0_0_30px_rgba(255,90,45,0.2)] z-20">
          <div className="flex flex-col justify-between h-full overflow-y-auto no-scrollbar pr-0.5">
            <div>
              {/* Back Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-1.5 sm:pb-3 mb-2 sm:mb-3">
                <div className="pr-1">
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-accent font-semibold block">
                    {steel.shape} &bull; {prefix}
                  </span>
                  <h4 className="font-heading text-xs sm:text-lg lg:text-xl font-bold uppercase text-foreground">
                    {steel.name}
                  </h4>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg gradient-molten flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-foreground" />
                </div>
              </div>

              {/* Stat bar */}
              {statValue && (
                <div className="mb-2 sm:mb-3">
                  <div className="flex justify-between text-[8px] sm:text-[10px] uppercase tracking-wider text-foreground/70 mb-0.5">
                    <span>{statLabel}</span>
                    <span className="text-accent font-semibold">{statValue}</span>
                  </div>
                  <div className="h-1 sm:h-1.5 bg-background/80 rounded-full overflow-hidden border border-border/40">
                    <div
                      className="h-full gradient-molten rounded-full transition-all duration-1000"
                      style={{ width: gridVisible ? `${statPct}%` : "0%" }}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="text-[9px] sm:text-xs text-foreground/85 leading-tight sm:leading-relaxed mb-2 sm:mb-3">
                {steel.description}
              </p>

              {/* Properties Bars */}
              <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                {steel.properties.map((p, i) => (
                  <div key={p.label}>
                    <div className="flex justify-between text-[8px] sm:text-[10px] text-foreground/75 mb-0.5">
                      <span className="truncate mr-1">{p.label}</span>
                      <span className="text-accent font-medium">{p.value}%</span>
                    </div>
                    <div className="h-0.5 sm:h-1 bg-background/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-molten rounded-full transition-all duration-700"
                        style={{
                          width: gridVisible ? `${p.value}%` : "0%",
                          transitionDelay: `${index * 100 + i * 50}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications */}
            <div className="pt-1.5 sm:pt-2 border-t border-white/10 mt-auto shrink-0">
              <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-foreground/50 mb-1 font-mono">
                Aplicações
              </p>
              <div className="flex flex-wrap gap-1">
                {steel.applications.map((app) => (
                  <span
                    key={app}
                    className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-foreground/80 font-medium truncate max-w-full"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

        {/* Mobile Grid: 2 columns per row */}
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {alloys.map((steel, index) => (
            <SteelAlloyFlipCard
              key={steel.name}
              steel={steel}
              index={index}
              gridVisible={gridVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SteelFamilySection;
