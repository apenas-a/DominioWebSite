import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const SteelComparison = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden border-t border-border/50">
      <div className="section-container" ref={ref}>
        <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className="font-heading text-2xl sm:text-4xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
            Comparativo <span className="text-gradient-molten">Técnico dos Aços</span>
          </h2>
          <div className="w-24 h-1 gradient-molten mx-auto mb-4 sm:mb-6" />
          <p className="text-xs sm:text-base text-foreground/70 max-w-2xl mx-auto">
            Síntese comparativa entre as 4 grandes famílias de aços fundidos e suas principais propriedades físico-químicas.
          </p>
        </div>

        <div className={`overflow-x-auto pb-6 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
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
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: isVisible ? "65%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-orange-500 h-2 rounded-full transition-all duration-1000 delay-100" style={{ width: isVisible ? "90%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-red-500 h-2 rounded-full transition-all duration-1000 delay-200" style={{ width: isVisible ? "98%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-cyan-400 h-2 rounded-full transition-all duration-1000 delay-300" style={{ width: isVisible ? "75%" : "0%" }} /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 sm:p-5 border-b border-border/50 font-medium text-foreground">Tenacidade / Impacto</td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-amber-500 h-2 rounded-full transition-all duration-1000 delay-100" style={{ width: isVisible ? "75%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-orange-500 h-2 rounded-full transition-all duration-1000 delay-200" style={{ width: isVisible ? "95%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-red-500 h-2 rounded-full transition-all duration-1000 delay-300" style={{ width: isVisible ? "40%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-cyan-400 h-2 rounded-full transition-all duration-1000 delay-400" style={{ width: isVisible ? "90%" : "0%" }} /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 sm:p-5 border-b border-border/50 font-medium text-foreground">Resistência ao Desgaste / Dureza</td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-amber-500 h-2 rounded-full transition-all duration-1000 delay-150" style={{ width: isVisible ? "60%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-orange-500 h-2 rounded-full transition-all duration-1000 delay-250" style={{ width: isVisible ? "85%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-red-500 h-2 rounded-full transition-all duration-1000 delay-350" style={{ width: isVisible ? "100%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-cyan-400 h-2 rounded-full transition-all duration-1000 delay-450" style={{ width: isVisible ? "60%" : "0%" }} /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 sm:p-5 border-b border-border/50 font-medium text-foreground">Resistência à Corrosão</td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-amber-500 h-2 rounded-full transition-all duration-1000 delay-200" style={{ width: isVisible ? "20%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-orange-500 h-2 rounded-full transition-all duration-1000 delay-300" style={{ width: isVisible ? "35%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-red-500 h-2 rounded-full transition-all duration-1000 delay-400" style={{ width: isVisible ? "50%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-cyan-400 h-2 rounded-full transition-all duration-1000 delay-500" style={{ width: isVisible ? "100%" : "0%" }} /></div></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 sm:p-5 border-b border-border/50 font-medium text-foreground">Usinabilidade / Soldabilidade</td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-amber-500 h-2 rounded-full transition-all duration-1000 delay-250" style={{ width: isVisible ? "90%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-orange-500 h-2 rounded-full transition-all duration-1000 delay-350" style={{ width: isVisible ? "70%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-red-500 h-2 rounded-full transition-all duration-1000 delay-450" style={{ width: isVisible ? "40%" : "0%" }} /></div></td>
                  <td className="p-4 sm:p-5 border-b border-border/50 text-center"><div className="w-full bg-border rounded-full h-2 mt-1"><div className="bg-cyan-400 h-2 rounded-full transition-all duration-1000 delay-550" style={{ width: isVisible ? "65%" : "0%" }} /></div></td>
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
