import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Microscope, TestTube, Scale, ShieldCheck } from "lucide-react";
import analiseImg from "@/assets/process-analise.jpg";

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
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-background relative overflow-hidden border-t border-border/50">
      <div className="section-container">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-4 sm:gap-5">
          {/* Cell 1 — Título e texto (col-span-2, row 1) */}
          <div className="bento-cell glass-dark edge-glow rounded-2xl p-8 sm:p-10 flex flex-col justify-center lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-accent/30 bg-accent/5 text-[11px] uppercase tracking-[0.2em] text-accent w-fit">
              <ShieldCheck size={13} />
              Controle de Qualidade
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
              Garantia de <span className="text-gradient-molten">Qualidade</span>
            </h2>
            <div className="w-20 h-1 gradient-molten mb-6" />
            <p className="text-foreground/70 text-sm sm:text-base leading-relaxed max-w-xl">
              Nossos componentes estarão no coração de maquinários pesados, veículos e
              equipamentos agrícolas. Por isso, o controle de qualidade é implacável em
              todas as etapas — da areia ao acabamento.
            </p>
          </div>

          {/* Cell 2 — Imagem de laboratório (col 3, rows 1 e 2) */}
          <div className="bento-cell relative rounded-2xl overflow-hidden lg:row-span-2 min-h-[260px] lg:min-h-0">
            <img
              src={analiseImg}
              alt="Análise química laboratorial no espectrômetro"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />
            {/* Status badge on the image */}
            <div className="absolute bottom-4 left-4 right-4 glass-dark rounded-xl p-4 flex items-center justify-between border border-white/10">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-accent font-semibold mb-0.5">
                  Status de Inspeção
                </p>
                <p className="font-heading text-lg uppercase font-bold text-foreground">
                  Aprovado
                </p>
              </div>
              <div className="w-11 h-11 rounded-full gradient-molten flex items-center justify-center shadow-lg shadow-accent/20">
                <ShieldCheck className="w-5 h-5 text-background" />
              </div>
            </div>
          </div>

          {/* Cell 3 — Análise Metalográfica (col 1, row 2) */}
          <div className="bento-cell glass-dark edge-glow rounded-2xl p-6 flex gap-4 items-start">
            <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-accent mt-0.5">
              <Microscope size={20} />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold uppercase mb-2 text-foreground">
                Análise Metalográfica
              </h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Avaliação rigorosa da microestrutura para garantir a nodularização ou
                forma correta da grafita em cada corrida.
              </p>
            </div>
          </div>

          {/* Cell 4 — Espectrometria + Controle Dimensional (col 2, row 2) */}
          <div className="bento-cell flex flex-col gap-4">
            <div className="glass-dark edge-glow rounded-2xl p-6 flex gap-4 items-start flex-1">
              <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-accent mt-0.5">
                <TestTube size={20} />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold uppercase mb-2 text-foreground">
                  Espectrometria
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Controle da composição química em tempo real antes de cada vazamento.
                </p>
              </div>
            </div>

            <div className="glass-dark edge-glow rounded-2xl p-6 flex gap-4 items-start flex-1">
              <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-accent mt-0.5">
                <Scale size={20} />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold uppercase mb-2 text-foreground">
                  Controle Dimensional
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Peças dentro das tolerâncias do projeto, verificadas ao longo de toda
                  a produção.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessQuality;
