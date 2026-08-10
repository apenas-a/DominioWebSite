import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SteelComparison = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (isReducedMotion) return;

    const ctx = gsap.context(() => {
      // Animate container
      gsap.from(".compare-header", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".compare-header",
          start: "top 85%",
        }
      });

      gsap.from(".compare-table", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".compare-table",
          start: "top 85%",
        }
      });

      // Animate progress bars
      const bars = gsap.utils.toArray<HTMLElement>(".progress-bar");
      bars.forEach((bar) => {
        const targetWidth = bar.getAttribute("data-width") || "0%";
        gsap.fromTo(
          bar,
          { width: "0%" },
          {
            width: targetWidth,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bar,
              start: "top 90%",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden border-t border-border/50" ref={containerRef}>
      <div className="section-container">
        <div className="compare-header text-center mb-12 sm:mb-16">
          <h2 className="font-heading text-2xl sm:text-4xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
            Comparativo <span className="text-gradient-molten">Técnico dos Aços</span>
          </h2>
          <div className="w-24 h-1 gradient-molten mx-auto mb-4 sm:mb-6" />
          <p className="text-xs sm:text-base text-foreground/70 max-w-2xl mx-auto">
            Síntese comparativa entre as 4 grandes famílias de aços fundidos e suas principais propriedades físico-químicas.
          </p>
        </div>

        <div className="compare-table overflow-x-auto pb-6">
          <div className="min-w-[900px] w-full border border-border/50 rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-foreground uppercase font-heading tracking-wider text-xs sm:text-sm">
                  <th className="p-4 sm:p-5 font-semibold border-b border-border/50 w-1/5">Propriedade</th>
                  <th className="p-4 sm:p-5 font-semibold border-b border-border/50 w-1/5 text-center text-amber-500">Aço Carbono</th>
                  <th className="p-4 sm:p-5 font-semibold border-b border-border/50 w-1/5 text-center text-orange-500">Baixa Liga</th>
                  <th className="p-4 sm:p-5 font-semibold border-b border-border/50 w-1/5 text-center text-red-500">Alta Liga</th>
                  <th className="p-4 sm:p-5 font-semibold border-b border-border/50 w-1/5 text-center text-cyan-400">Inoxidável</th>
                </tr>
              </thead>
              <tbody className="text-foreground/80 text-xs sm:text-sm">
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 sm:p-5 border-b border-border/50 font-medium text-foreground">Resistência Mecânica</td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-amber-500 h-2 rounded-full" data-width="65%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-orange-500 h-2 rounded-full" data-width="90%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-red-500 h-2 rounded-full" data-width="98%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-cyan-400 h-2 rounded-full" data-width="75%" /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 sm:p-5 border-b border-border/50 font-medium text-foreground">Tenacidade / Impacto</td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-amber-500 h-2 rounded-full" data-width="75%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-orange-500 h-2 rounded-full" data-width="95%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-red-500 h-2 rounded-full" data-width="40%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-cyan-400 h-2 rounded-full" data-width="90%" /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 sm:p-5 border-b border-border/50 font-medium text-foreground">Resistência ao Desgaste / Dureza</td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-amber-500 h-2 rounded-full" data-width="60%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-orange-500 h-2 rounded-full" data-width="85%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-red-500 h-2 rounded-full" data-width="100%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-cyan-400 h-2 rounded-full" data-width="60%" /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 sm:p-5 border-b border-border/50 font-medium text-foreground">Resistência à Corrosão</td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-amber-500 h-2 rounded-full" data-width="20%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-orange-500 h-2 rounded-full" data-width="35%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-red-500 h-2 rounded-full" data-width="50%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-cyan-400 h-2 rounded-full" data-width="100%" /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 sm:p-5 border-b border-border/50 font-medium text-foreground">Usinabilidade / Soldabilidade</td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-amber-500 h-2 rounded-full" data-width="90%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-orange-500 h-2 rounded-full" data-width="70%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-red-500 h-2 rounded-full" data-width="40%" /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="progress-bar bg-cyan-400 h-2 rounded-full" data-width="65%" /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-foreground">Aplicações Comuns</td>
                  <td className="p-4 sm:p-5 text-center text-xs">Eixos, engrenagens leves, peças estruturais e buchas</td>
                  <td className="p-4 sm:p-5 text-center text-xs">Eixos pesados, virabrequins, pinhões e componentes de alta fadiga</td>
                  <td className="p-4 sm:p-5 text-center text-xs">Matrizes de corte, moldes a quente/frio e estampos industriais</td>
                  <td className="p-4 sm:p-5 text-center text-xs">Indústria alimentícia, naval, química e equipamentos hospitalares</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SteelComparison;
