import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import empresaImg from "@/assets/Empresa.jpeg";
import { Calendar, Layers, Shield, Handshake } from "lucide-react";

const About = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.1 });

  const highlights = [
    {
      icon: Calendar,
      title: "Fundada em 2022",
      description: "Compromisso em trazer qualidade superior e alta confiabilidade para nossos parceiros comerciais.",
    },
    {
      icon: Layers,
      title: "Do Projeto à Fusão",
      description: "Trabalhamos em todo o ciclo: desde o planejamento técnico, modelagem e projeto até a fusão das peças.",
    },
    {
      icon: Shield,
      title: "Qualidade Garantida",
      description: "Rigoroso controle metalúrgico e dimensional em todas as etapas para garantir a melhor entrega.",
    },
    {
      icon: Handshake,
      title: "Soluções Sob Medida",
      description: "Entendemos a real necessidade de cada cliente para oferecer ligas metálicas eficientes e sob medida.",
    },
  ];

  return (
    <section id="sobre" className="py-12 sm:py-24 gradient-dark relative overflow-hidden">
      <div className="section-container relative z-10">
        <div
          ref={titleRef}
          className={`text-center mb-8 sm:mb-16 transition-all duration-700 ${
            titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
            Sobre a <span className="text-gradient-molten">Fundição Domínio</span>
          </h2>
          <div className="w-24 h-1 gradient-molten mx-auto mb-6 sm:mb-8" />
          <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-3xl mx-auto">
            Localizada em Quintana-SP, somos uma fundição especializada na produção de peças em
            ferro fundido e aço carbono de alta qualidade. Nossa missão é entender as
            necessidades de cada cliente para oferecer soluções personalizadas e eficientes.
          </p>
        </div>

        <div
          ref={contentRef}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center transition-all duration-1000 ${
            contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
          }`}
        >
          {/* Imagem da empresa com bordas em degradê */}
          <div className="lg:col-span-6 relative group overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={empresaImg}
              alt="Vista aérea da Fundição Domínio"
              className="w-full h-full object-cover aspect-[4/3] sm:aspect-video lg:aspect-[4/3] transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Efeito degradê nas bordas (Vignette escuro para disfarçar as bordas) */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_15px_hsl(var(--background))] sm:shadow-[inset_0_0_60px_30px_hsl(var(--background))] lg:shadow-[inset_0_0_80px_40px_hsl(var(--background))]" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-background/50" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background via-transparent to-background/50" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background via-transparent to-background/50" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-l from-background via-transparent to-background/50" />
            
            {/* Brilho laranja sutil no hover */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Caixas informativas */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {highlights.map((highlight, index) => (
              <div
                key={highlight.title}
                className="glass-dark edge-glow rounded-xl p-5 sm:p-6 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-lg gradient-molten flex items-center justify-center mb-4 group-hover:animate-glow-pulse transition-all duration-300 group-hover:scale-105">
                  <highlight.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-heading text-lg font-semibold uppercase mb-2 text-foreground group-hover:text-accent transition-colors duration-300">
                  {highlight.title}
                </h3>
                <p className="text-foreground/70 text-xs sm:text-sm leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
