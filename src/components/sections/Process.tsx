import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import MoltenParticles from "@/components/MoltenParticles";
import { Box, Flame, FlaskConical, Wrench, CheckCircle, ArrowRight } from "lucide-react";
import moldagemImg from "@/assets/process-moldagem.jpg";
import fusaoImg from "@/assets/process-fusao.jpg";
import analiseImg from "@/assets/process-analise.jpg";
import vazamentoImg from "@/assets/process-vazamento.jpg";
import acabamentoImg from "@/assets/process-acabamento.jpg";
import { staggerContainer, revealUp, revealBlur } from "@/components/motion/variants";

const Process = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const [activeStep, setActiveStep] = useState<number | null>(null);

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

  return (
    <section id="processo" className="pt-24 sm:pt-32 pb-12 sm:pb-24 surface-forge relative overflow-hidden">
      {/* Background Effects */}
      <MoltenParticles />

      <div className="section-container relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="text-center mb-12 sm:mb-20"
        >
          <motion.div variants={revealBlur} className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full border border-accent/30 bg-accent/5 text-xs uppercase tracking-[0.2em] text-accent backdrop-blur-md">
            <Flame size={14} className="animate-pulse" />
            Da areia ao acabamento
          </motion.div>
          <motion.h2 variants={revealBlur} className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
            Nosso <span className="text-gradient-molten">Processo</span> de Fundição
          </motion.h2>
          <motion.div variants={revealBlur} className="w-24 h-1 gradient-molten mx-auto mb-6 sm:mb-8" />
          <motion.p variants={revealBlur} className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-3xl mx-auto">
            Conheça cada etapa da nossa linha de produção, projetada para entregar peças de ferro e aço com integridade estrutural absoluta.
          </motion.p>
        </motion.div>

        {/* Vertical Timeline Desktop / Snap Carousel Mobile */}
        <div className="relative max-w-4xl mx-auto" ref={containerRef}>
          {/* Vertical Molten Line Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-border/30 -translate-x-1/2">
            <motion.div 
              className="w-full gradient-molten"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-6 -mx-4 px-4 md:block md:space-y-24 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              const isActive = activeStep === index;
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  key={step.number}
                  className={`snap-center shrink-0 w-[85%] sm:w-[60%] md:w-full flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Desktop Center Node */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full glass-dark items-center justify-center border-2 border-accent/50 z-10 shadow-[0_0_20px_rgba(255,120,30,0.3)]">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>

                  {/* Number Overlay Outline (Desktop) */}
                  <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 ${isEven ? "left-12" : "right-12"} text-8xl font-heading font-bold text-transparent opacity-5 select-none`} style={{ WebkitTextStroke: "2px white" }}>
                    {step.number}
                  </div>

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 flex ${isEven ? "md:justify-start" : "md:justify-end"} z-20`}>
                    <div
                      onClick={() => setActiveStep(isActive ? null : index)}
                      className={`glass-dark edge-glow p-6 sm:p-8 rounded-2xl cursor-pointer transition-all duration-500 w-full hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,120,30,0.2)] ${
                        isActive ? "border-accent/50 scale-[1.02]" : "border-border/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="md:hidden w-12 h-12 rounded-xl gradient-molten flex items-center justify-center shadow-lg">
                          <Icon className="w-6 h-6 text-background" />
                        </div>
                        <span className="text-4xl sm:text-5xl font-heading font-bold bg-gradient-to-br from-white to-white/20 bg-clip-text text-transparent">
                          {step.number}
                        </span>
                      </div>

                      <h3 className="font-heading text-2xl font-bold uppercase mb-1 text-white">
                        {step.title}
                      </h3>
                      <p className="text-accent text-sm tracking-wider uppercase mb-4">{step.subtitle}</p>

                      <p className="text-foreground/75 leading-relaxed text-sm">
                        {step.description}
                      </p>

                      {/* Expand Indicator */}
                      <div className="mt-4 flex items-center gap-2 text-accent text-xs uppercase tracking-widest font-semibold">
                        <span>{isActive ? "Ocultar detalhes" : "Ver detalhes"}</span>
                        <ArrowRight size={14} className={`transition-transform duration-300 ${isActive ? "rotate-90" : ""}`} />
                      </div>

                      {/* Expanded Details */}
                      <motion.div 
                        initial={false}
                        animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 mt-4 border-t border-white/10">
                          <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 border border-white/10 relative">
                            <div className="absolute inset-0 bg-accent/20 mix-blend-overlay z-10" />
                            <img src={step.image} alt={step.title} className="w-full h-full object-cover saturate-50" />
                          </div>
                          <ul className="space-y-2">
                            {step.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color} mt-1.5 flex-shrink-0`} />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="text-center mt-16 sm:mt-24"
        >
          <Link
            to="/orcamento"
            className="inline-flex items-center gap-3 gradient-molten text-accent-foreground px-8 py-4 rounded-lg font-semibold uppercase tracking-widest hover:opacity-90 transition-all duration-300 hover:scale-105 text-sm glow-molten"
          >
            Faça um Orçamento
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Process;
