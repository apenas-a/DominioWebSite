import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Microscope, TestTube, Scale, ShieldCheck, Activity, CheckCircle2, Award, Zap } from "lucide-react";
import SPECTROMAXxR3F from "@/components/3d/SPECTROMAXxR3F";

gsap.registerPlugin(ScrollTrigger);

const ProcessQuality = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray(".hud-card");

        gsap.fromTo(
          cards,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 70%",
              end: "top 20%",
              scrub: 1,
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const isSparkActive = scrollProgress >= 0.65;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#0a0f18] py-16 sm:py-24 border-t border-border/50 overflow-hidden"
      style={{ minHeight: "220vh" }} // Provides continuous scroll distance for R3F camera scrub
    >
      {/* Background cyan glow accent */}
      <div className="absolute top-1/3 right-0 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Sticky Container for Pinning Viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center p-4 sm:p-8">
        <div className="section-container w-full max-w-7xl mx-auto">
          
          {/* Main Grid: 35% Left (Cards HUD), 65% Right (R3F 3D Canvas) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* ========================================================= */}
            {/* LEFT 35% COLUMN: Glassmorphism Technical HUD Cards */}
            {/* ========================================================= */}
            <div
              ref={cardsContainerRef}
              className="lg:col-span-4 flex flex-col gap-4 sm:gap-5 justify-center z-10"
            >
              {/* Card 1: Main Title & Status */}
              <div className="hud-card glass-dark edge-glow rounded-2xl p-6 sm:p-7 border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-900/75">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[11px] uppercase tracking-[0.2em] text-cyan-400 w-fit">
                  <ShieldCheck size={13} />
                  NBR ISO/IEC 17025
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mb-2">
                  Garantia de <span className="text-gradient-molten">Qualidade</span>
                </h2>
                <div className="w-16 h-1 gradient-molten mb-3" />
                <p className="text-foreground/75 text-xs leading-relaxed">
                  Estação de espectrometria óptica SPECTROMAXx calibrada para análise química de precisão instantânea.
                </p>

                {/* Status Badge */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className={isSparkActive ? "text-cyan-400 animate-pulse" : "text-slate-500"} />
                    <span className="text-[11px] font-mono text-foreground/60 uppercase">STATUS ENSAIO:</span>
                  </div>
                  <span
                    className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isSparkActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    {isSparkActive ? "100% CONFORME" : "STANDBY"}
                  </span>
                </div>
              </div>

              {/* Card 2: Technical Elements Analysis */}
              <div className="hud-card glass-dark edge-glow rounded-2xl p-5 border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-900/75 flex gap-3.5 items-start">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
                  <TestTube size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xs font-bold uppercase text-white mb-1">
                    Espectrometria SPECTROMAXx
                  </h3>
                  <p className="text-[11px] text-foreground/65 leading-relaxed mb-2">
                    Teores Nominais conforme normas ASTM E415 & SAE J431:
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                    <div className="bg-black/40 p-1 rounded border border-white/5 text-center">
                      <span className="text-foreground/40 block">C</span>
                      <strong className={isSparkActive ? "text-cyan-400" : "text-foreground/50"}>
                        {isSparkActive ? "3.42%" : "---"}
                      </strong>
                    </div>
                    <div className="bg-black/40 p-1 rounded border border-white/5 text-center">
                      <span className="text-foreground/40 block">Si</span>
                      <strong className={isSparkActive ? "text-cyan-400" : "text-foreground/50"}>
                        {isSparkActive ? "2.15%" : "---"}
                      </strong>
                    </div>
                    <div className="bg-black/40 p-1 rounded border border-white/5 text-center">
                      <span className="text-foreground/40 block">Mn</span>
                      <strong className={isSparkActive ? "text-cyan-400" : "text-foreground/50"}>
                        {isSparkActive ? "0.45%" : "---"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Metalografia & Tolerâncias */}
              <div className="hud-card glass-dark edge-glow rounded-2xl p-4 sm:p-5 border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-900/75 flex gap-3.5 items-start">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0 text-accent mt-0.5">
                  <Microscope size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-xs font-bold uppercase text-white mb-1">
                    Análise Metalográfica
                  </h3>
                  <p className="text-[11px] text-foreground/65 leading-relaxed">
                    Nodularização &gt; 85% certificada em microscopia de grafitização.
                  </p>
                </div>
              </div>

              {/* Card 4: Certificação ISO */}
              <div className="hud-card glass-dark edge-glow rounded-2xl p-4 border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-900/75 flex items-center justify-between text-xs text-foreground/75">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-emerald-400" />
                  <span className="font-mono text-[11px]">Certificação NBR ISO 9001</span>
                </div>
                <span className="font-mono text-cyan-400 text-[10px] font-bold">100% APROVADO</span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT 65% COLUMN: React Three Fiber (R3F) 3D Canvas */}
            {/* ========================================================= */}
            <div className="lg:col-span-8 h-[450px] sm:h-[550px] relative z-0">
              <SPECTROMAXxR3F
                sectionRef={sectionRef}
                onProgressUpdate={(p) => setScrollProgress(p)}
              />

              {/* Floating Status Overlay on Top of 3D Canvas */}
              <div className="absolute bottom-4 left-4 right-4 glass-dark edge-glow rounded-xl p-3.5 flex items-center justify-between gap-3 border border-white/10 backdrop-blur-xl pointer-events-auto bg-slate-900/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Activity size={12} className={isSparkActive ? "text-cyan-400 animate-pulse" : "text-slate-500"} />
                      <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                        TELEMETRIA ESPECTRAL EM TEMPO REAL
                      </p>
                    </div>
                    <p className="font-heading text-xs sm:text-sm uppercase font-bold text-white leading-tight">
                      SPECTROMAXx — 100% CONFORME
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-foreground/80">
                    NBR ISO/IEC 17025
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessQuality;
