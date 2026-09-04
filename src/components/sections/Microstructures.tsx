import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MoltenParticles from "@/components/MoltenParticles";
import { Flame } from "lucide-react";
import nodularImg from "@/assets/microstructure-nodular.jpg";
import vermicularImg from "@/assets/microstructure-vermicular.jpg";
import cinzentoImg from "@/assets/microstructure-cinzento.jpg";

gsap.registerPlugin(ScrollTrigger);

const Microstructures = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const structures = [
    {
      name: "Nodular",
      image: nodularImg,
      shape: "Grafita Esferoidal",
      description: "A grafita se apresenta em forma de nódulos esféricos, proporcionando excelente resistência mecânica e ductilidade.",
      properties: ["Alta resistência à tração", "Excelente alongamento", "Boa tenacidade"],
      color: "from-orange-500 to-amber-600",
    },
    {
      name: "Vermicular",
      image: vermicularImg,
      shape: "Grafita Compactada",
      description: "Estrutura intermediária com grafita em forma de vermes, combinando propriedades do nodular e cinzento.",
      properties: ["Condutividade térmica", "Resistência à fadiga", "Boa usinabilidade"],
      color: "from-red-500 to-orange-600",
    },
    {
      name: "Cinzento",
      image: cinzentoImg,
      shape: "Grafita Lamelar",
      description: "Grafita em formato de lamelas ou flocos, oferecendo excelente capacidade de amortecimento e fundibilidade.",
      properties: ["Alto amortecimento", "Fácil usinabilidade", "Excelente fundibilidade"],
      color: "from-gray-400 to-gray-600",
    },
  ];

  useEffect(() => {
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (isReducedMotion) {
      gsap.set(".micro-header, .micro-card", { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".micro-header", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".micro-header",
          start: "top 85%",
        }
      });

      // Cards stagger animation
      gsap.from(".micro-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".micro-grid",
          start: "top 80%",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="ligas" ref={sectionRef} className="pt-24 sm:pt-32 pb-12 sm:pb-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-molten/5 blur-[120px]" />
      </div>
      <MoltenParticles />

      <div className="section-container relative z-10">
        <div className="micro-header text-center mb-8 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full border border-accent/30 bg-accent/5 text-xs uppercase tracking-[0.2em] text-accent backdrop-blur-md">
            <Flame size={14} className="animate-pulse" />
            Metalurgia de precisão
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
            <span className="text-gradient-molten">Microestruturas</span> do Ferro Fundido
          </h2>
          <div className="w-24 h-1 gradient-molten mx-auto mb-6 sm:mb-8" />
          <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-3xl mx-auto">
            Cada tipo de ferro fundido possui uma microestrutura única que define 
            suas propriedades mecânicas e aplicações ideais.
          </p>
        </div>

        <div className="micro-grid flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-6 -mx-4 px-4 md:grid md:grid-cols-3 md:gap-8 md:overflow-x-visible md:pb-0 md:mx-0 md:px-0">
          {structures.map((structure) => (
            <div
              key={structure.name}
              className="micro-card snap-center shrink-0 w-[85%] sm:w-[60%] md:w-auto group relative"
            >
              <div className="glass-dark edge-glow rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(255,120,30,0.15)] hover:-translate-y-2 h-full flex flex-col p-2">
                {/* Image Lens */}
                <div className="relative aspect-square overflow-hidden flex-shrink-0 rounded-xl bg-black border border-white/10 m-2 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-white/5 bg-gradient-to-tr from-white/5 to-transparent z-10 pointer-events-none scale-105" />
                  
                  {/* Microscope Circle Mask */}
                  <div className="w-[90%] h-[90%] rounded-full overflow-hidden border-4 border-[#1a1a1a] shadow-[inset_0_0_20px_rgba(0,0,0,0.9),0_0_15px_rgba(255,120,30,0.1)] relative group-hover:border-accent/40 transition-colors duration-700">
                    <img
                      src={structure.image}
                      alt={`Microestrutura do ferro fundido ${structure.name}`}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 saturate-50 group-hover:saturate-100 mix-blend-screen"
                    />
                    
                    {/* Reticle / Scale overlay */}
                    <div className="absolute inset-0 border border-white/10 rounded-full pointer-events-none" />
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 pointer-events-none" />
                    <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/10 pointer-events-none" />
                  </div>
                  
                  {/* Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border border-white/10 text-accent font-mono text-[10px] uppercase tracking-widest shadow-lg z-20 group-hover:text-molten transition-colors">
                    {structure.name}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between z-10">
                  <div className="text-center">
                    <h3 className="font-heading text-lg sm:text-xl font-bold uppercase mb-1 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-molten transition-all duration-300">
                      {structure.shape}
                    </h3>
                    <p className="text-foreground/60 text-xs leading-relaxed mb-4 group-hover:text-foreground/80 transition-colors">
                      {structure.description}
                    </p>
                  </div>
                  
                  {/* Properties */}
                  <ul className="space-y-1.5 border-t border-border/20 pt-4 mt-auto">
                    {structure.properties.map((prop) => (
                      <li
                        key={prop}
                        className="flex items-center gap-2 text-[11px] sm:text-xs text-foreground/70 justify-center uppercase tracking-wider"
                      >
                        <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${structure.color} flex-shrink-0`} />
                        {prop}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Microstructures;
