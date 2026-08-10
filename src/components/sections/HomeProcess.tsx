import { Link } from "react-router-dom";
import { ArrowRight, Settings2, Flame, Wrench } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HomeProcess = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const steps = [
    {
      icon: Settings2,
      title: "Planejamento e Moldagem",
      desc: "Precisão na criação dos moldes para garantir dimensões exatas.",
    },
    {
      icon: Flame,
      title: "Fusão e Análise",
      desc: "Controle térmico e químico rigoroso do metal fundido.",
    },
    {
      icon: Wrench,
      title: "Vazamento e Acabamento",
      desc: "Solidificação controlada e usinagem com padrão de qualidade.",
    },
  ];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Section title
      gsap.fromTo(
        ".process-home-title",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Steps stagger
      gsap.fromTo(
        ".process-home-step",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Connection line
      gsap.fromTo(
        ".process-home-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // CTA
      gsap.fromTo(
        ".process-home-cta",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 gradient-dark relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-molten/3 blur-[100px] pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Title */}
        <div className="process-home-title text-center mb-12 sm:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-foreground">
            Tradição e{" "}
            <span className="text-gradient-molten">Tecnologia</span>
          </h2>
          <div className="w-20 h-[2px] gradient-molten mx-auto mb-6" />
          <p className="text-foreground/55 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Um processo produtivo dominado de ponta a ponta, unindo a arte da
            fundição à tecnologia moderna de controle de qualidade.
          </p>
        </div>

        {/* Steps */}
        <div className="process-home-steps grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
          {/* Connection line — desktop only */}
          <div className="process-home-line hidden sm:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent z-0 pointer-events-none origin-left" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="process-home-step relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-full bg-card border-2 border-border/40 flex items-center justify-center mb-6 relative overflow-hidden group-hover:border-accent/40 transition-all duration-500 shadow-lg group-hover:shadow-accent/10">
                  <div className="absolute inset-0 bg-gradient-to-t from-molten/15 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Icon className="w-10 h-10 text-foreground/70 group-hover:text-accent relative z-10 transition-colors duration-300" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold uppercase mb-2 text-foreground group-hover:text-accent transition-colors">
                  {step.title}
                </h3>
                <p className="text-foreground/55 text-sm leading-relaxed px-2">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="process-home-cta text-center mt-12 sm:mt-16">
          <Link
            to="/processo"
            className="inline-flex items-center gap-2 border border-border/50 hover:border-accent/40 bg-card/30 px-6 py-3 rounded-md text-foreground/80 hover:text-accent transition-all duration-300 font-medium uppercase tracking-wider text-sm group"
          >
            Conheça nosso chão de fábrica
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeProcess;
