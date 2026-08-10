import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MoltenParticles from "@/components/MoltenParticles";
import Process3DCanvas from "@/components/3d/Process3DCanvas";
import { Box, Flame, FlaskConical, Wrench, CheckCircle, ArrowRight } from "lucide-react";
import moldagemImg from "@/assets/process-moldagem.jpg";
import fusaoImg from "@/assets/process-fusao.jpg";
import analiseImg from "@/assets/process-analise.jpg";
import vazamentoImg from "@/assets/process-vazamento.jpg";
import acabamentoImg from "@/assets/process-acabamento.jpg";

gsap.registerPlugin(ScrollTrigger);

const Process = () => {
  const mainRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      number: "01",
      title: "Moldagem",
      subtitle: "Preparação das Caixas",
      icon: Box,
      image: moldagemImg,
      description: "Criação dos moldes em areia verde ou shell molding, reproduzindo com precisão o formato da peça desejada.",
      details: ["Preparação da areia de moldagem", "Confecção do modelo", "Montagem das caixas de moldagem", "Aplicação de revestimentos refratários"],
      color: "from-amber-500 to-orange-600",
    },
    {
      number: "02",
      title: "Fusão",
      subtitle: "Derretimento do Material",
      icon: Flame,
      image: fusaoImg,
      description: "O metal é aquecido em fornos de indução a temperaturas superiores a 1400°C até atingir o estado líquido.",
      details: ["Carregamento do forno", "Aquecimento a 1400-1500°C", "Adição de ligas", "Monitoramento da temperatura"],
      color: "from-red-500 to-orange-500",
    },
    {
      number: "03",
      title: "Análise",
      subtitle: "Controle Químico",
      icon: FlaskConical,
      image: analiseImg,
      description: "Análise espectrométrica em tempo real para garantir a composição química exata da liga.",
      details: ["Coleta de amostras", "Análise no espectrômetro", "Correção química", "Validação dos parâmetros"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: "04",
      title: "Vazamento",
      subtitle: "Preenchimento dos Moldes",
      icon: Wrench,
      image: vazamentoImg,
      description: "O metal fundido é vazado cuidadosamente nos moldes, respeitando tempo e temperatura ideais.",
      details: ["Transporte em panelas", "Vazamento controlado", "Tempo de solidificação", "Desmoldagem"],
      color: "from-orange-500 to-amber-500",
    },
    {
      number: "05",
      title: "Acabamento",
      subtitle: "Finalização",
      icon: CheckCircle,
      image: acabamentoImg,
      description: "Processos de rebarbação, jateamento, tratamento térmico e usinagem conforme especificação.",
      details: ["Rebarbação e corte", "Jateamento com granalha", "Tratamento térmico", "Inspeção final"],
      color: "from-green-500 to-emerald-600",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Header animation
        if (headerRef.current) {
          const headerElements = headerRef.current.children;
          gsap.fromTo(
            headerElements,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.15,
              scrollTrigger: {
                trigger: headerRef.current,
                start: "top 95%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        // Desktop horizontal scroll (only applies >= 768px)
        mm.add("(min-width: 768px)", () => {
          const container = containerRef.current;
          const horizContainer = horizontalRef.current;
          if (!container || !horizContainer) return;

          const sections = gsap.utils.toArray<HTMLElement>(".step-panel");

          const scrollTween = gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: "none",
            scrollTrigger: {
              trigger: container,
              pin: true,
              scrub: 1,
              end: () => "+=" + horizContainer.offsetWidth,
            },
          });

          // Horizontal Progress bar connecting steps
          gsap.to(".progress-bar-desktop", {
            width: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top top",
              end: () => "+=" + horizContainer.offsetWidth,
              scrub: true,
            },
          });

          // Step animations inside container
          sections.forEach((section: HTMLElement, index: number) => {
            const text = section.querySelector(".step-text");
            const img = section.querySelector(".step-img");
            const node = section.querySelector(".step-node");

            if (index === 0) {
              // First step is visible immediately
              if (text) gsap.set(text, { opacity: 1, y: 0 });
              if (node) gsap.set(node, { scale: 1, opacity: 1 });
            } else {
              // Subsequent steps animate in when scrolled horizontally
              if (text) {
                gsap.fromTo(
                  text,
                  { opacity: 0, y: 40 },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power2.out",
                    scrollTrigger: {
                      trigger: section,
                      containerAnimation: scrollTween,
                      start: "left 85%",
                      toggleActions: "play none none reverse",
                    },
                  }
                );
              }

              if (node) {
                gsap.fromTo(
                  node,
                  { scale: 0, opacity: 0 },
                  {
                    scale: 1,
                    opacity: 1,
                    duration: 0.5,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                      trigger: section,
                      containerAnimation: scrollTween,
                      start: "left 85%",
                      toggleActions: "play none none reverse",
                    },
                  }
                );
              }
            }

            // Image Parallax
            if (img) {
              gsap.fromTo(
                img,
                { xPercent: -15 },
                {
                  xPercent: 15,
                  ease: "none",
                  scrollTrigger: {
                    trigger: section,
                    containerAnimation: scrollTween,
                    start: "left right",
                    end: "right left",
                    scrub: true,
                  },
                }
              );
            }
          });
        });

        // Mobile vertical layout (only applies < 768px)
        mm.add("(max-width: 767px)", () => {
          const sections = gsap.utils.toArray<HTMLElement>(".step-panel-mobile");
          
          sections.forEach((section: HTMLElement) => {
            gsap.fromTo(
              section,
              { opacity: 0, y: 40 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: section,
                  start: "top 90%",
                  toggleActions: "play none none none",
                },
              }
            );
          });

          // Mobile progress bar vertical
          gsap.to(".progress-bar-mobile", {
            height: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top center",
              end: "bottom center",
              scrub: true,
            },
          });
        });
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="processo" ref={mainRef} className="surface-forge relative overflow-hidden">
      {/* Background Effects */}
      <MoltenParticles density="low" />

      {/* Header */}
      <div className="pt-24 sm:pt-32 pb-12 section-container relative z-10">
        <div ref={headerRef} className="text-center mb-4 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full border border-accent/30 bg-accent/5 text-xs uppercase tracking-[0.2em] text-accent backdrop-blur-md">
            <Flame size={14} className="animate-pulse" />
            Da areia ao acabamento
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
            Nosso <span className="text-gradient-molten">Processo</span> de Fundição
          </h2>
          <div className="w-24 h-1 gradient-molten mx-auto mb-6 sm:mb-8" />
          <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-3xl mx-auto">
            Conheça cada etapa da nossa linha de produção, projetada para entregar peças de ferro e aço com integridade estrutural absoluta.
          </p>
        </div>
      </div>

      {/* Process Steps */}
      <div ref={containerRef} className="relative w-full">
        {/* DESKTOP LAYOUT (Horizontal Scroller) */}
        <div className="hidden md:block overflow-hidden relative">
          <div ref={horizontalRef} className="flex h-[80vh] w-[500vw] relative z-10 flex-nowrap">
            
            {/* Desktop Progress Line Background */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-border/30 -translate-y-1/2 z-0">
              <div className="progress-bar-desktop h-full gradient-molten w-0 shadow-[0_0_15px_rgba(255,120,30,0.5)]" />
            </div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="step-panel w-screen h-full flex-shrink-0 relative flex items-center justify-center gap-16 px-16 lg:px-24">
                  
                  {/* Center Node */}
                  <div className="step-node absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full glass-dark flex items-center justify-center border-2 border-accent/50 z-20 shadow-[0_0_20px_rgba(255,120,30,0.3)]">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>

                  {/* Number Overlay Outline */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-heading font-bold text-transparent opacity-[0.03] select-none pointer-events-none z-0" style={{ WebkitTextStroke: "2px white" }}>
                    {step.number}
                  </div>

                  <div className={`w-1/2 max-w-lg z-10 step-text ${index % 2 === 0 ? "pr-12" : "pl-12 order-2"}`}>
                    <div className="glass-dark edge-glow p-8 rounded-2xl border border-border/30 backdrop-blur-md">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-5xl font-heading font-bold bg-gradient-to-br from-white to-white/20 bg-clip-text text-transparent">
                          {step.number}
                        </span>
                      </div>
                      <h3 className="font-heading text-2xl font-bold uppercase mb-1 text-white">
                        {step.title}
                      </h3>
                      <p className="text-accent text-sm tracking-wider uppercase mb-4">{step.subtitle}</p>
                      <p className="text-foreground/75 leading-relaxed text-sm mb-6">
                        {step.description}
                      </p>
                      <ul className="space-y-2 pt-4 border-t border-white/10">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                            <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color} mt-1.5 flex-shrink-0`} />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className={`w-1/2 max-w-xl h-[60vh] z-10 ${index % 2 === 0 ? "order-2 pl-12" : "pr-12"}`}>
                    <div className="w-full h-full rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl">
                      <div className="absolute inset-0 bg-accent/10 mix-blend-overlay z-10" />
                      <img src={step.image} alt={step.title} className="step-img w-full h-full object-cover saturate-50 scale-110" />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-15 flex items-center justify-center pointer-events-none">
                        <Process3DCanvas currentStep={index} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE LAYOUT (Vertical Stacked) */}
        <div className="md:hidden flex flex-col gap-12 px-4 relative">
          
          {/* Vertical Progress Line */}
          <div className="absolute top-0 bottom-0 left-8 w-[2px] bg-border/30 z-0">
            <div className="progress-bar-mobile w-full gradient-molten h-0" />
          </div>

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="step-panel-mobile relative z-10 pl-16">
                
                {/* Node Icon on Line */}
                <div className="absolute left-[33px] top-8 -translate-x-1/2 w-10 h-10 rounded-full glass-dark flex items-center justify-center border-2 border-accent/50 z-20">
                  <Icon className="w-4 h-4 text-accent" />
                </div>

                <div className="glass-dark edge-glow p-6 rounded-2xl border border-border/30">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl font-heading font-bold text-white/90">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="font-heading text-xl font-bold uppercase text-white leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-accent text-xs tracking-wider uppercase">{step.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="aspect-video w-full rounded-xl overflow-hidden relative mb-4 border border-white/10">
                    <div className="absolute inset-0 bg-accent/20 mix-blend-overlay z-10" />
                    <img src={step.image} alt={step.title} className="w-full h-full object-cover saturate-50" />
                  </div>

                  <p className="text-foreground/75 leading-relaxed text-sm mb-4">
                    {step.description}
                  </p>

                  <ul className="space-y-2 pt-4 border-t border-white/10">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color} mt-1.5 flex-shrink-0`} />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16 sm:mt-24 pb-12 sm:pb-24 relative z-10">
        <Link
          to="/orcamento"
          className="inline-flex items-center gap-3 gradient-molten text-accent-foreground px-8 py-4 rounded-lg font-semibold uppercase tracking-widest hover:opacity-90 transition-all duration-300 hover:scale-105 text-sm glow-molten"
        >
          Faça um Orçamento
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
};

export default Process;
