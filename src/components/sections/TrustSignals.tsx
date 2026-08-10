import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Award, Factory, Gem } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const TrustSignals = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const signals = [
    { icon: ShieldCheck, text: "Qualidade Comprovada" },
    { icon: Factory, text: "Entrega no Prazo" },
    { icon: Award, text: "Certificação de Materiais" },
    { icon: Gem, text: "Acabamento Premium" },
  ];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll(".trust-item"), {
        opacity: 0,
        y: 15,
        stagger: 0.08,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-10 sm:py-12 bg-card/20 border-y border-border/30 relative overflow-hidden"
    >
      <div className="section-container">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 md:flex md:flex-wrap md:justify-between md:items-center">
          {signals.map((signal, idx) => (
            <div
              key={idx}
              className="trust-item flex items-center gap-3 text-foreground/60 hover:text-accent transition-colors duration-300 group justify-start md:justify-center"
            >
              <div className="p-2.5 rounded-lg bg-background/40 border border-border/40 group-hover:border-accent/25 group-hover:bg-accent/5 transition-all duration-300 shrink-0">
                <signal.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="font-heading text-[11px] sm:text-xs font-medium uppercase tracking-wider leading-tight">
                {signal.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;
