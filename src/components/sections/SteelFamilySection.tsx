import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

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
}: {
  steel: SteelAlloy;
  index: number;
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const frontBarsRef = useRef<HTMLDivElement>(null);
  
  const Icon = steel.icon;
  const statLabel = steel.mainStatLabel || "Teor de Carbono";
  const statValue = steel.mainStatValue || "";
  const statPct = steel.mainStatPct || 0;
  const prefix = steel.standardPrefix || "SAE / ABNT";

  const toggleFlip = () => {
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inner = cardRef.current?.querySelector(".flip-card-inner");
    
    setIsFlipped(!isFlipped);
    
    if (inner && !isReducedMotion) {
      gsap.to(inner, {
        rotateY: !isFlipped ? 180 : 0,
        duration: 0.8,
        ease: "power2.inOut"
      });
    } else if (inner) {
      gsap.set(inner, { rotateY: !isFlipped ? 180 : 0 });
    }
  };

  return (
    <div
      ref={cardRef}
      className="steel-card opacity-0 translate-y-12 group [perspective:1000px] h-[360px] sm:h-[440px] lg:h-[480px] w-full cursor-pointer select-none"
      onClick={toggleFlip}
    >
      <style>{`
        @keyframes border-rotate {
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-border-rotate {
          animation: border-rotate 4s linear infinite;
        }
      `}</style>

      {/* Flip Card Wrapper */}
      <div
        className="flip-card-inner relative w-full h-full [transform-style:preserve-3d]"
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
              <div className="w-24 h-24 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden border-3 sm:border-4 border-[#222] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_0_25px_rgba(255,90,45,0.25)] relative bg-black shrink-0">
                <img
                  src={steel.image}
                  alt={`Microestrutura ${steel.name}`}
                  className="w-full h-full object-cover"
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
          <div className="flex flex-col justify-between h-full overflow-y-auto no-scrollbar pr-0.5" ref={frontBarsRef}>
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
                      className="progress-bar-stat h-full gradient-molten rounded-full"
                      data-width={`${statPct}%`}
                      style={{ width: "0%" }}
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
                {steel.properties.map((p) => (
                  <div key={p.label}>
                    <div className="flex justify-between text-[8px] sm:text-[10px] text-foreground/75 mb-0.5">
                      <span className="truncate mr-1">{p.label}</span>
                      <span className="text-accent font-medium">{p.value}%</span>
                    </div>
                    <div className="h-0.5 sm:h-1 bg-background/80 rounded-full overflow-hidden">
                      <div
                        className="progress-bar-prop h-full bg-gradient-to-r from-accent to-molten rounded-full"
                        data-width={`${p.value}%`}
                        style={{ width: "0%" }}
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
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReducedMotion) {
      gsap.set(".steel-header, .steel-card", { opacity: 1, y: 0 });
      gsap.set(".progress-bar-stat, .progress-bar-prop", { 
        width: (i, el) => el.getAttribute("data-width") 
      });
      return;
    }

    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".steel-header", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".steel-header",
          start: "top 85%",
        }
      });

      // Cards stagger
      gsap.to(".steel-card", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".steel-grid",
          start: "top 85%",
        }
      });

      // Animate progress bars when cards come into view
      ScrollTrigger.create({
        trigger: ".steel-grid",
        start: "top 75%",
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>(".progress-bar-stat, .progress-bar-prop").forEach(bar => {
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
    <section
      id={id}
      ref={containerRef}
      className={`${isFirst ? "pt-24 sm:pt-32" : "pt-20 sm:pt-28"} pb-20 sm:pb-28 relative overflow-hidden`}
      style={{
        background: isFirst
          ? "radial-gradient(ellipse at 50% 0%, hsl(25 95% 50% / 0.04) 0%, transparent 55%), linear-gradient(180deg, hsl(30 15% 7%) 0%, hsl(30 12% 5%) 100%)"
          : "radial-gradient(ellipse at 50% 100%, hsl(25 95% 50% / 0.03) 0%, transparent 55%), linear-gradient(180deg, hsl(30 12% 5%) 0%, hsl(30 15% 7%) 100%)",
      }}
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="steel-header text-center mb-8 sm:mb-16">
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

        {/* Grid: 2 columns per row */}
        <div className="steel-grid grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {alloys.map((steel, index) => (
            <SteelAlloyFlipCard
              key={steel.name}
              steel={steel}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SteelFamilySection;
