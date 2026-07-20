import { CheckCircle2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const AlloysComparison = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-20 bg-background relative overflow-hidden border-t border-border/50">
      <div className="section-container" ref={ref}>
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-4">
            Comparativo <span className="text-gradient-molten">Técnico</span>
          </h2>
          <div className="w-24 h-1 gradient-molten mx-auto mb-6" />
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Comparativo entre as ligas de ferro fundido. Para propriedades detalhadas dos aços
            carbono, consulte a seção <a href="#aco" className="text-accent hover:underline">Ligas de Aço</a> acima.
          </p>
        </div>

        <div className={`overflow-x-auto pb-8 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="min-w-[800px] w-full border border-border/50 rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-foreground uppercase font-heading tracking-wider">
                  <th className="p-5 font-semibold border-b border-border/50 w-1/4">Propriedade</th>
                  <th className="p-5 font-semibold border-b border-border/50 w-1/4 text-center">Nodular</th>
                  <th className="p-5 font-semibold border-b border-border/50 w-1/4 text-center">Vermicular</th>
                  <th className="p-5 font-semibold border-b border-border/50 w-1/4 text-center">Cinzento</th>
                </tr>
              </thead>
              <tbody className="text-foreground/80">
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-5 border-b border-border/50 font-medium text-foreground">Resistência à Tração</td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="bg-orange-500 h-2 rounded-full transition-all duration-1000" style={{ width: isVisible ? "90%" : "0%" }} /></div></td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="bg-red-500 h-2 rounded-full transition-all duration-1000 delay-100" style={{ width: isVisible ? "65%" : "0%" }} /></div></td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="bg-gray-400 h-2 rounded-full transition-all duration-1000 delay-200" style={{ width: isVisible ? "40%" : "0%" }} /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-5 border-b border-border/50 font-medium text-foreground">Alongamento (Ductilidade)</td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="bg-orange-500 h-2 rounded-full transition-all duration-1000 delay-150" style={{ width: isVisible ? "85%" : "0%" }} /></div></td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="bg-red-500 h-2 rounded-full transition-all duration-1000 delay-250" style={{ width: isVisible ? "40%" : "0%" }} /></div></td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="bg-gray-400 h-2 rounded-full transition-all duration-1000 delay-350" style={{ width: isVisible ? "10%" : "0%" }} /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-5 border-b border-border/50 font-medium text-foreground">Amortecimento (Vibração)</td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="bg-orange-500 h-2 rounded-full transition-all duration-1000 delay-200" style={{ width: isVisible ? "30%" : "0%" }} /></div></td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="bg-red-500 h-2 rounded-full transition-all duration-1000 delay-300" style={{ width: isVisible ? "60%" : "0%" }} /></div></td>
                  <td className="p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="bg-gray-400 h-2 rounded-full transition-all duration-1000 delay-400" style={{ width: isVisible ? "95%" : "0%" }} /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-5 font-medium text-foreground border-b border-border/50">Condutividade Térmica</td>
                  <td className="p-5 text-center border-b border-border/50"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="bg-orange-500 h-2 rounded-full transition-all duration-1000 delay-250" style={{ width: isVisible ? "40%" : "0%" }} /></div></td>
                  <td className="p-5 text-center border-b border-border/50"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="bg-red-500 h-2 rounded-full transition-all duration-1000 delay-350" style={{ width: isVisible ? "80%" : "0%" }} /></div></td>
                  <td className="p-5 text-center border-b border-border/50"><div className="w-full bg-border rounded-full h-2 mt-2"><div className="bg-gray-400 h-2 rounded-full transition-all duration-1000 delay-450" style={{ width: isVisible ? "90%" : "0%" }} /></div></td>
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
