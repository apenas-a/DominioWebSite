import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import processMoldagemImg from "@/assets/process-moldagem.jpg";
import processFusaoImg from "@/assets/process-fusao.jpg";
import processVazamentoImg from "@/assets/process-vazamento.jpg";
import processAnaliseImg from "@/assets/process-analise.jpg";
import processAcabamentoImg from "@/assets/process-acabamento.jpg";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    index: "01",
    name: "Moldagem",
    short: "Moldes precisos",
    desc: "Areia ou casca de resina — geometria controlada ao décimo.",
    image: processMoldagemImg,
  },
  {
    index: "02",
    name: "Fusão",
    short: "Metal vivo",
    desc: "Forno elétrico, análise espectral em tempo real.",
    image: processFusaoImg,
  },
  {
    index: "03",
    name: "Vazamento",
    short: "Fluxo controlado",
    desc: "Temperatura, velocidade e pressão monitoradas na corrida.",
    image: processVazamentoImg,
  },
  {
    index: "04",
    name: "Análise",
    short: "Rastreabilidade total",
    desc: "Espectrometria e ensaios não-destrutivos em cada lote.",
    image: processAnaliseImg,
  },
  {
    index: "05",
    name: "Acabamento",
    short: "Precisão final",
    desc: "Usinagem, jato, pintura e inspeção dimensional.",
    image: processAcabamentoImg,
  },
];

const HomeProcess = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);

  const displayed = hoveredStep !== null ? hoveredStep : activeStep;
  const step = STEPS[displayed];

  // Image crossfade on step change
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    gsap.fromTo(img, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" });
  }, [displayed]);

  // Progress indicator
  useEffect(() => {
    const line = progressLineRef.current;
    if (!line) return;
    gsap.to(line, {
      width: `${((displayed + 1) / STEPS.length) * 100}%`,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [displayed]);

  // Entrance
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".process-reveal",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  // Auto-advance
  useEffect(() => {
    if (hoveredStep !== null) return;
    const t = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 2800);
    return () => clearInterval(t);
  }, [hoveredStep]);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 relative overflow-hidden"
    >
      {/* Forge glow */}
      <div className="absolute right-0 top-0 w-1/3 h-2/3 bg-molten/4 blur-[120px] pointer-events-none" />

      <div className="section-container relative z-10">

        {/* Header */}
        <div className="process-reveal opacity-0 mb-10 sm:mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent/60 mb-3">
              // Processo
            </p>
            <h2 className="font-heading font-black uppercase text-3xl sm:text-4xl md:text-5xl leading-none">
              Dominado{" "}
              <span className="text-gradient-molten">ponta a ponta</span>
            </h2>
          </div>

          <Link
            to="/processo"
            className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-foreground/35 hover:text-accent transition-colors duration-300 group shrink-0"
          >
            <span>Ver chão de fábrica</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── Main layout ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

          {/* Step list — takes 2/5 */}
          <div className="process-reveal opacity-0 lg:col-span-2 flex flex-col">

            {/* Progress bar */}
            <div className="h-px bg-border/20 mb-6 relative overflow-hidden">
              <div
                ref={progressLineRef}
                className="absolute left-0 top-0 h-full"
                style={{
                  width: `${((displayed + 1) / STEPS.length) * 100}%`,
                  background: "linear-gradient(to right, hsl(20 100% 55%), hsl(25 95% 50%))",
                  transition: "none",
                }}
              />
            </div>

            <div className="flex flex-col divide-y divide-border/15">
              {STEPS.map((s, i) => {
                const isActive = displayed === i;
                return (
                  <button
                    key={i}
                    className={`text-left py-4 px-1 flex items-center gap-5 transition-all duration-300 group/step ${
                      isActive
                        ? "text-foreground"
                        : "text-foreground/30 hover:text-foreground/60"
                    }`}
                    onClick={() => { setActiveStep(i); setHoveredStep(null); }}
                    onMouseEnter={() => setHoveredStep(i)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <span
                      className={`font-mono text-[9px] shrink-0 transition-colors ${
                        isActive ? "text-accent" : "text-foreground/20"
                      }`}
                    >
                      {s.index}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-heading font-bold uppercase text-base sm:text-lg tracking-tight transition-all ${isActive ? "text-foreground" : ""}`}>
                          {s.name}
                        </span>
                        {isActive && (
                          <span className="font-mono text-[8px] uppercase tracking-widest text-foreground/25">
                            — {s.short}
                          </span>
                        )}
                      </div>

                      <div
                        className={`overflow-hidden transition-all duration-400 ${
                          isActive ? "max-h-10 opacity-100 mt-1" : "max-h-0 opacity-0"
                        }`}
                      >
                        <p className="text-foreground/40 text-xs leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </div>

                    {/* Active dot */}
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                        isActive ? "bg-accent scale-100" : "bg-border/30 scale-75"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image — takes 3/5 */}
          <div className="process-reveal opacity-0 lg:col-span-3 relative rounded-sm overflow-hidden min-h-[260px] sm:min-h-[340px] lg:min-h-0">
            <div className="absolute inset-0 overflow-hidden rounded-sm">
              <img
                ref={imgRef}
                src={step.image}
                alt={step.name}
                className="w-full h-full object-cover scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-transparent" />
            </div>

            {/* Step info overlay */}
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-accent/60">
                    Etapa {step.index}
                  </span>
                  <div className="flex-1 h-px bg-accent/15" />
                </div>
                <h3 className="font-heading font-black uppercase text-2xl sm:text-3xl text-foreground leading-none">
                  {step.name}
                </h3>
              </div>
            </div>

            {/* Corner marks */}
            <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-foreground/15 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-foreground/10 pointer-events-none" />
          </div>
        </div>

        {/* Bottom caption */}
        <div className="process-reveal opacity-0 mt-8 pt-8 border-t border-border/15">
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/20 text-center">
            Controle metalúrgico e dimensional em todas as etapas · Quintana · SP
          </p>
        </div>
      </div>
    </section>
  );
};

export default HomeProcess;
