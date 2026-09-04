import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const AlloysComparison = () => {
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
    <section
      className="py-20 sm:py-28 relative overflow-hidden"
      ref={containerRef}
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, hsl(20 100% 55% / 0.04) 0%, transparent 50%), linear-gradient(180deg, hsl(30 15% 7%) 0%, hsl(30 12% 5%) 60%, hsl(30 15% 7%) 100%)",
      }}
    >
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />
      <div className="section-container relative z-10">
        <div className="compare-header text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-4">
            Comparativo <span className="text-gradient-molten">Técnico</span>
          </h2>
          <div className="w-24 h-1 gradient-molten mx-auto mb-6" />
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Comparativo entre as ligas de ferro fundido. Para propriedades detalhadas dos aços
            carbono, consulte a seção <a href="#aco" className="text-accent hover:underline">Ligas de Aço</a> acima.
          </p>
        </div>

        <div className="compare-table overflow-x-auto pb-8">
          <div className="min-w-[800px] w-full border border-border/50 rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-foreground uppercase font-heading tracking-wider">
                  <th className="p-5 font-semibold border-b border-border/50 w-1/4">Propriedade</th>
                  <th className="p-5 font-semibold border-b border-border/50 w-1/4 text-center text-orange-500">Nodular</th>
                  <th className="p-5 font-semibold border-b border-border/50 w-1/4 text-center text-red-500">Vermicular</th>
                  <th className="p-5 font-semibold border-b border-border/50 w-1/4 text-center text-gray-400">Cinzento</th>
                </tr>
              </thead>
              <tbody className="text-foreground/80">
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-5 border-b border-border/50 font-medium text-foreground">Resistência à Tração</td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="progress-bar bg-orange-500 h-2 rounded-full" data-width="90%" /></div></td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="progress-bar bg-red-500 h-2 rounded-full" data-width="65%" /></div></td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="progress-bar bg-gray-400 h-2 rounded-full" data-width="40%" /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-5 border-b border-border/50 font-medium text-foreground">Alongamento (Ductilidade)</td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="progress-bar bg-orange-500 h-2 rounded-full" data-width="85%" /></div></td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="progress-bar bg-red-500 h-2 rounded-full" data-width="40%" /></div></td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="progress-bar bg-gray-400 h-2 rounded-full" data-width="10%" /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-5 border-b border-border/50 font-medium text-foreground">Amortecimento (Vibração)</td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="progress-bar bg-orange-500 h-2 rounded-full" data-width="30%" /></div></td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="progress-bar bg-red-500 h-2 rounded-full" data-width="60%" /></div></td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="progress-bar bg-gray-400 h-2 rounded-full" data-width="95%" /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-5 font-medium text-foreground border-b border-border/50">Condutividade Térmica</td>
                  <td className="p-5 text-center border-b border-border/50"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="progress-bar bg-orange-500 h-2 rounded-full" data-width="40%" /></div></td>
                  <td className="p-5 text-center border-b border-border/50"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="progress-bar bg-red-500 h-2 rounded-full" data-width="80%" /></div></td>
                  <td className="p-5 text-center border-b border-border/50"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="progress-bar bg-gray-400 h-2 rounded-full" data-width="90%" /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-5 font-medium text-foreground">Aplicações Comuns</td>
                  <td className="p-5 text-center text-sm">Componentes de segurança, Engrenagens, Eixos</td>
                  <td className="p-5 text-center text-sm">Blocos de motor, Cabeçotes, Discos de freio</td>
                  <td className="p-5 text-center text-sm">Bases de máquinas, Carcaças, Válvulas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlloysComparison;
