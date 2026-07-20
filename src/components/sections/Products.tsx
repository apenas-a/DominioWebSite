import { CheckCircle, Flame, Car, ShieldAlert, Wrench, FileText } from "lucide-react";
import { useRef, useState } from "react";
import produtosFundidos from "@/assets/ProdutosFundidos.png";
import discoFreio from "@/assets/DiscoFreio.png";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import MoltenParticles from "@/components/MoltenParticles";

const Products = () => {
  // Scroll animations
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: showcaseImageRef, isVisible: showcaseImageVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: showcaseListRef, isVisible: showcaseListVisible } = useScrollAnimation({ threshold: 0.1 });
  
  const { ref: brakeTitleRef, isVisible: brakeTitleVisible } = useScrollAnimation();
  const { ref: brakeImageRef, isVisible: brakeImageVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: brakeSpecsRef, isVisible: brakeSpecsVisible } = useScrollAnimation({ threshold: 0.1 });

  // 3D Tilts
  const imgShowcaseRef = useRef<HTMLDivElement>(null);
  const imgBrakeRef = useRef<HTMLDivElement>(null);
  const [tiltShowcase, setTiltShowcase] = useState({ x: 0, y: 0 });
  const [tiltBrake, setTiltBrake] = useState({ x: 0, y: 0 });

  // Tabs for mobile (Brake Disc specs vs compatibility)
  const [activeBrakeTab, setActiveBrakeTab] = useState<"specs" | "compatibility">("specs");

  const handleMoveShowcase = (e: React.MouseEvent) => {
    const el = imgShowcaseRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTiltShowcase({ x: py * -8, y: px * 10 });
  };

  const handleMoveBrake = (e: React.MouseEvent) => {
    const el = imgBrakeRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTiltBrake({ x: py * -8, y: px * 10 });
  };

  const products = [
    {
      name: "Ferro Fundido Nodular",
      description: "Alta resistência mecânica, ductilidade e tenacidade. Ideal para peças que exigem resistência a impactos e fadiga sob especificação técnica rígida.",
      features: ["Alta resistência à tração", "Excelente ductilidade", "Usinabilidade precisa"],
    },
    {
      name: "Ferro Fundido Vermicular",
      description: "Combina propriedades do nodular e cinzento. Oferece alta condutividade térmica e resistência à fadiga térmica conforme o projeto.",
      features: ["Condutividade térmica superior", "Resistência à fadiga térmica", "Amortecimento sob medida"],
    },
    {
      name: "Ferro Fundido Cinzento",
      description: "Excelente capacidade de amortecimento estrutural e usinabilidade facilitada para bases e suportes mecânicos.",
      features: ["Fácil usinabilidade", "Alto amortecimento de vibrações", "Excelente fundibilidade"],
    },
  ];

  const techSpecs = [
    { label: "Marca", value: "Domínio" },
    { label: "Nº da Peça / Modelo", value: "HF02A" },
    { label: "Posição de Montagem", value: "Eixo Dianteiro" },
    { label: "Tipo de Disco", value: "Ventilado / Refrigerado" },
    { label: "Diâmetro Externo", value: "239 mm" },
    { label: "Espessura da Pista", value: "20 mm (Mín. de Segurança: 18 mm)" },
    { label: "Altura Total", value: "38,70 mm" },
    { label: "Furo Central", value: "65 mm" },
    { label: "Furação", value: "4 Furos + Furo Guia" },
    { label: "Conteúdo da Embalagem", value: "02 Discos (1 Par)" },
  ];

  const compatibilities = [
    { model: "Gol (G2)", years: "1997 - 2005" },
    { model: "Gol (G3)", years: "1999 - 2006" },
    { model: "Gol (G4)", years: "2004 - 2013" },
    { model: "Parati (G2)", years: "1996 - 2000" },
    { model: "Parati (G3)", years: "1999 - 2005" },
    { model: "Parati (G4)", years: "2005 - 2013" },
    { model: "Saveiro (G2)", years: "1998 - 2000" },
    { model: "Saveiro (G3)", years: "2000 - 2006" },
    { model: "Saveiro (G4)", years: "2005 - 2009" },
  ];

  return (
    <section id="produtos" className="relative py-12 sm:py-24 bg-background overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-molten/5 blur-[120px]" />
      </div>
      <MoltenParticles />

      <div className="relative section-container">
        {/* ========================================================
            PART 1: STAND/SHOWCASE FOR CUSTOM CLIENT PRODUCTS
           ======================================================== */}
        <div
          ref={titleRef}
          className={`text-center mb-8 sm:mb-16 transition-all duration-700 ${
            titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full border border-accent/30 bg-accent/5 text-xs uppercase tracking-[0.2em] text-accent">
            <Flame size={14} className="animate-pulse" />
            Showcase & Linha de Peças
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
            Nossos <span className="text-gradient-molten">Produtos</span>
          </h2>
          <div className="w-24 h-1 gradient-molten mx-auto mb-6 sm:mb-8" />
          <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-3xl mx-auto">
            Desenvolvemos soluções sob medida de alta performance para terceiros e oferecemos nossa própria linha de autopeças certificadas.
          </p>
        </div>

        {/* Section Heading for Custom Showcase */}
        <div className="mb-6 sm:mb-10 text-left">
          <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-semibold uppercase tracking-tight text-foreground flex items-wrap items-center gap-2">
            <Wrench size={20} className="text-accent" />
            Stand de Fundidos sob Projeto <span className="text-[10px] sm:text-xs text-accent uppercase tracking-widest font-mono bg-accent/10 border border-accent/30 px-2 py-0.5 rounded-full">(Para Terceiros)</span>
          </h3>
          <p className="text-xs sm:text-sm text-foreground/60 mt-1 max-w-2xl">
            Exibição de peças reais fundidas sob encomenda para nossos clientes industriais e parceiros comerciais.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 lg:mb-24">
          {/* Image Custom Showcase */}
          <div
            ref={showcaseImageRef}
            className={`relative transition-all duration-1000 w-full max-w-md mx-auto lg:max-w-none ${
              showcaseImageVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"
            }`}
          >
            <div
              ref={imgShowcaseRef}
              onMouseMove={handleMoveShowcase}
              onMouseLeave={() => setTiltShowcase({ x: 0, y: 0 })}
              className="relative rounded-2xl p-[1px] bg-gradient-to-br from-accent/40 via-molten/20 to-transparent group"
              style={{ perspective: "1200px" }}
            >
              <div
                className="relative rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm transition-transform duration-300 ease-out"
                style={{
                  transform: `rotateX(${tiltShowcase.x}deg) rotateY(${tiltShowcase.y}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <img
                  src={produtosFundidos}
                  alt="Peças em ferro fundido produzidas para terceiros sob encomenda"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {/* Heat shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-molten/10 mix-blend-overlay" />
                {/* Sweep light */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -inset-x-1 -inset-y-1 bg-[linear-gradient(110deg,transparent_40%,hsl(var(--molten-glow)/0.25)_50%,transparent_60%)] bg-[length:200%_100%] animate-shimmer" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-40 h-40 gradient-molten rounded-full opacity-20 blur-3xl animate-pulse" />
            <div className="absolute -top-6 -left-6 w-28 h-28 gradient-molten rounded-full opacity-10 blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute -bottom-4 left-6 px-4 py-2 rounded-lg bg-background/90 border border-accent/30 backdrop-blur-sm text-[10px] sm:text-xs uppercase tracking-widest text-accent shadow-lg">
              Soluções Sob Encomenda
            </div>
          </div>

          {/* Alloys & Materials Used */}
          <div 
            ref={showcaseListRef} 
            className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-6 -mx-4 px-4 lg:flex-col lg:overflow-x-visible lg:pb-0 lg:mx-0 lg:px-0 lg:space-y-6"
          >
            {products.map((product, index) => (
              <div
                key={product.name}
                className={`snap-center shrink-0 w-[85%] sm:w-[60%] lg:w-auto relative bg-card/70 backdrop-blur-sm border border-border rounded-xl p-5 sm:p-6 transition-all duration-700 group hover:border-accent/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/10 overflow-hidden ${
                  showcaseListVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {/* Left molten bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-accent to-transparent opacity-40 group-hover:opacity-100 group-hover:w-1 transition-all duration-500" />
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-accent/5 via-transparent to-molten/10" />

                <div className="relative flex items-start justify-between mb-2 sm:mb-3">
                  <h3 className="font-heading text-lg sm:text-xl font-semibold uppercase text-accent tracking-wide group-hover:translate-x-1 transition-transform duration-300">
                    {product.name}
                  </h3>
                  <span className="text-[10px] font-mono text-foreground/40 group-hover:text-accent transition-colors">
                    0{index + 1}
                  </span>
                </div>
                <p className="relative text-foreground/70 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                  {product.description}
                </p>
                <ul className="relative grid sm:grid-cols-2 gap-2 border-t border-border/30 pt-3 mt-auto">
                  {product.features.map((feature, i) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs sm:text-sm text-foreground/80 group-hover:text-foreground transition-colors duration-300"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    >
                      <CheckCircle size={14} className="text-accent flex-shrink-0 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent my-16 lg:my-24" />

        {/* ========================================================
            PART 2: OUR OWN AUTOMOTIVE BRAKE DISC LINE
           ======================================================== */}
        <div
          ref={brakeTitleRef}
          className={`mb-8 sm:mb-12 transition-all duration-700 ${
            brakeTitleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full border border-accent/30 bg-accent/5 text-xs uppercase tracking-[0.2em] text-accent">
            <Car size={14} className="animate-pulse" />
            Linha de Produção Própria
          </div>
          <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
            Sublinha Automotiva: <span className="text-gradient-molten">Discos de Freio</span>
          </h3>
          <div className="w-24 h-1 gradient-molten mb-4 sm:mb-6" />
          <p className="text-sm sm:text-base text-foreground/70 max-w-3xl leading-relaxed">
            Par de discos de freio dianteiros novos com padrão técnico de liga metálica e balanceamento industrial para reposição automotiva. Focado em eficiência e segurança.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Tech Specs & Compatibility */}
          <div 
            ref={brakeSpecsRef} 
            className={`lg:col-span-7 space-y-4 sm:space-y-6 transition-all duration-1000 ${
              brakeSpecsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            {/* Tabs for mobile screen spacing */}
            <div className="lg:hidden flex rounded-lg p-1 bg-card border border-border/60 mb-2">
              <button
                type="button"
                onClick={() => setActiveBrakeTab("specs")}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-semibold rounded-md transition-all uppercase tracking-wider ${
                  activeBrakeTab === "specs"
                    ? "bg-accent text-accent-foreground shadow font-bold"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                Ficha Técnica
              </button>
              <button
                type="button"
                onClick={() => setActiveBrakeTab("compatibility")}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-semibold rounded-md transition-all uppercase tracking-wider ${
                  activeBrakeTab === "compatibility"
                    ? "bg-accent text-accent-foreground shadow font-bold"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                Compatibilidade
              </button>
            </div>

            {/* Tech Specs Sheet */}
            <div className={`bg-card/50 backdrop-blur-sm border border-border/60 rounded-xl p-5 sm:p-6 relative overflow-hidden ${
              activeBrakeTab === "specs" ? "block" : "hidden lg:block"
            }`}>
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent via-molten to-transparent" />
              <h4 className="text-xs sm:text-sm font-heading font-semibold uppercase text-accent tracking-wider mb-4 flex items-center gap-2">
                <FileText size={16} /> Ficha Técnica (Modelo HF02A)
              </h4>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-4">
                {techSpecs.map((spec) => (
                  <div key={spec.label} className="border-b border-border/30 pb-1.5 flex flex-col">
                    <span className="text-[9px] sm:text-[10px] uppercase text-foreground/50 font-bold tracking-wider">{spec.label}</span>
                    <span className="text-xs sm:text-sm font-semibold text-foreground/90 mt-0.5 leading-tight">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Alert - Always visible for safety */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-red-500 uppercase tracking-wide">⚠️ Atenção à compatibilidade</h4>
                <p className="text-[11px] sm:text-xs text-foreground/80 leading-relaxed mt-1">
                  Este produto serve apenas em veículos com freios <strong>SISTEMA VARGA</strong> de fábrica. Não serve no sistema ATE.
                  Deve ser disco do tipo <strong>VENTILADO</strong> (não compatível com disco sólido).
                </p>
              </div>
            </div>

            {/* Compatibility List */}
            <div className={`bg-card/30 border border-border/40 rounded-xl p-5 sm:p-6 ${
              activeBrakeTab === "compatibility" ? "block" : "hidden lg:block"
            }`}>
              <h4 className="text-xs sm:text-sm font-heading font-semibold uppercase text-accent tracking-wider mb-4 flex items-center gap-2">
                <Car size={16} /> Veículos Compatíveis (Ventilado 239mm / Sistema Varga)
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {compatibilities.map((item) => (
                  <div key={item.model} className="bg-card/50 border border-border/30 rounded-lg p-2.5 sm:p-3 hover:border-accent/40 transition-all duration-300 flex items-center justify-between sm:flex-col sm:items-start">
                    <span className="text-xs font-bold text-foreground/95">{item.model}</span>
                    <span className="text-[10px] text-foreground/50 font-medium sm:mt-1">{item.years}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] sm:text-[11px] text-foreground/40 mt-4 leading-normal italic">
                * Recomendamos a instalação por profissional especializado e conferência das dimensões antes da compra.
              </p>
            </div>
          </div>

          {/* Right Column: Brake Disc Image */}
          <div
            ref={brakeImageRef}
            className={`lg:col-span-5 relative transition-all duration-1000 w-full max-w-md mx-auto lg:max-w-none ${
              brakeImageVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"
            }`}
          >
            <div
              ref={imgBrakeRef}
              onMouseMove={handleMoveBrake}
              onMouseLeave={() => setTiltBrake({ x: 0, y: 0 })}
              className="relative rounded-2xl p-[1px] bg-gradient-to-br from-accent/40 via-molten/20 to-transparent group"
              style={{ perspective: "1200px" }}
            >
              <div
                className="relative rounded-2xl overflow-hidden bg-card/85 backdrop-blur-sm transition-transform duration-300 ease-out"
                style={{
                  transform: `rotateX(${tiltBrake.x}deg) rotateY(${tiltBrake.y}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <img
                  src={discoFreio}
                  alt="Disco de Freio Dianteiro Ventilado HF02A fabricado pela Fundição Domínio"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {/* Heat shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/15 via-transparent to-molten/10 mix-blend-overlay" />
                {/* Sweep light */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -inset-x-1 -inset-y-1 bg-[linear-gradient(110deg,transparent_40%,hsl(var(--molten-glow)/0.25)_50%,transparent_60%)] bg-[length:200%_100%] animate-shimmer" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 gradient-molten rounded-full opacity-20 blur-3xl animate-pulse" />
            <div className="absolute -top-6 -right-6 w-28 h-28 gradient-molten rounded-full opacity-10 blur-2xl animate-pulse" style={{ animationDelay: "1.5s" }} />
            <div className="absolute -bottom-4 right-6 px-4 py-2 rounded-lg bg-background/90 border border-accent/30 backdrop-blur-sm text-[10px] sm:text-xs uppercase tracking-widest text-accent shadow-lg">
              Qualidade Industrial
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
