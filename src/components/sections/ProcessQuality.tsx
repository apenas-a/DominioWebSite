import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Microscope, TestTube, Scale, ShieldCheck, Activity, CheckCircle2 } from "lucide-react";
import LabSpectrometerCanvas from "@/components/3d/LabSpectrometerCanvas";

gsap.registerPlugin(ScrollTrigger);

const ProcessQuality = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cells = gsap.utils.toArray(".bento-cell");

        gsap.fromTo(
          cells,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 bg-background relative overflow-hidden border-t border-border/50"
    >
      {/* Background glow accent */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Main Section Layout: Left Floating Cards, Right Interactive 3D SPECTROMAXx Station */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT COLUMN: Floating Cards (Span 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
            
            {/* Main Title Card */}
            <div className="bento-cell glass-dark edge-glow rounded-2xl p-6 sm:p-8 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[11px] uppercase tracking-[0.2em] text-cyan-400 w-fit">
                <ShieldCheck size={13} />
                Controle de Qualidade Espectrométrica
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-3">
                Garantia de <span className="text-gradient-molten">Qualidade</span>
              </h2>
              <div className="w-16 h-1 gradient-molten mb-4" />
              <p className="text-foreground/75 text-xs sm:text-sm leading-relaxed">
                Nossos componentes estruturais estarão no coração de maquinários pesados e
                veículos de alta exigência. O controle de qualidade é certificado ao vivo via
                espectrometria óptica de emissão direta.
              </p>
            </div>

            {/* Quality Feature Cards (Stack) */}
            <div className="bento-cell glass-dark edge-glow rounded-2xl p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
                <TestTube size={18} />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold uppercase mb-1 text-foreground">
                  Espectrometria SPECTROMAXx
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Leitura química instantânea de Ferro (Fe), Carbono (C), Silício (Si) e Manganês (Mn) antes de cada corrida.
                </p>
              </div>
            </div>

            <div className="bento-cell glass-dark edge-glow rounded-2xl p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0 text-accent mt-0.5">
                <Microscope size={18} />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold uppercase mb-1 text-foreground">
                  Análise Metalográfica
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Avaliação rigorosa da microestrutura para garantir a nodularização ideal da grafita.
                </p>
              </div>
            </div>

            <div className="bento-cell glass-dark edge-glow rounded-2xl p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
                <Scale size={18} />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold uppercase mb-1 text-foreground">
                  Controle Dimensional
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Tolerâncias geométricas verificadas rigorosamente ao longo de todo o lote produtivo.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive 3D SPECTROMAXx WebGL Canvas (Span 7 cols) */}
          <div className="bento-cell lg:col-span-7 flex flex-col min-h-[420px] sm:min-h-[520px] relative">
            
            {/* Interactive 3D WebGL Canvas Component */}
            <LabSpectrometerCanvas />

            {/* Floating Glassmorphic Inspection Status Badge Overlay */}
            <div className="absolute bottom-4 left-4 right-4 glass-dark edge-glow rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-white/10 backdrop-blur-xl pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-cyan-400 animate-pulse" />
                    <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                      ANÁLISE DE CORRIDA AO VIVO
                    </p>
                  </div>
                  <p className="font-heading text-base sm:text-lg uppercase font-bold text-white leading-tight">
                    Inspeção Aprovada — 100% Conforme
                  </p>
                </div>
              </div>

              {/* Chemical composition pills */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-foreground/80">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                  C: <strong className="text-white">3.42%</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                  Si: <strong className="text-white">2.15%</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 hidden sm:inline-block">
                  Mn: <strong className="text-white">0.45%</strong>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProcessQuality;
