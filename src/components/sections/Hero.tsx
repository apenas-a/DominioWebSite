import { ArrowDown, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroVideo from "@/assets/hero-foundry.mp4";
import { useEffect, useState } from "react";
import { revealBlur, staggerContainer } from "@/components/motion/variants";

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Video */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 overflow-hidden">
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-label="Vazamento de metal fundido em molde"
            className={`absolute left-1/2 top-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: "translate(-50%, -52%) scale(1.12)",
            }}
          />
        </div>

        {/* Gradient overlays — radial vignette + edge gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/40 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/90 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-container text-center pt-12 sm:pt-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          className="flex flex-col items-center"
        >
          <motion.div variants={revealBlur} className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-accent/30 bg-accent/5 text-xs uppercase tracking-[0.2em] text-accent backdrop-blur-md">
            <Shield size={14} />
            Fundição de Ferro e Aço
          </motion.div>

          <motion.h1
            variants={revealBlur}
            className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight mb-4 sm:mb-6"
          >
            Fundição{" "}
            <span className="text-gradient-molten">Domínio</span>
          </motion.h1>

          <motion.p
            variants={revealBlur}
            className="text-lg sm:text-xl md:text-2xl text-foreground/80 font-light italic mb-2 sm:mb-4"
          >
            "Entender para atender"
          </motion.p>

          <motion.p
            variants={revealBlur}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground/70 max-w-2xl mx-auto mb-6 sm:mb-10"
          >
            Fundição de ferro (nodular, vermicular e cinzento) e aço carbono (1020, 1030 e 1045)
            com engenharia de precisão para a indústria brasileira.
          </motion.p>

          <motion.div
            variants={revealBlur}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full"
          >
            <Link
              to="/orcamento"
              className="gradient-molten text-accent-foreground px-6 py-3 sm:px-8 sm:py-4 rounded font-semibold uppercase tracking-wide text-sm sm:text-base md:text-lg hover:opacity-90 transition-all duration-300 glow-molten animate-glow-pulse hover:scale-105 w-full max-w-xs sm:w-auto text-center"
            >
              Orçamento
            </Link>
            <Link
              to="/processo"
              className="glass-dark border border-foreground/30 text-foreground px-6 py-3 sm:px-8 sm:py-4 rounded font-semibold uppercase tracking-wide text-sm sm:text-base md:text-lg hover:border-accent hover:text-accent transition-all duration-300 hover:scale-105 w-full max-w-xs sm:w-auto text-center"
            >
              Nossos Processos
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          href="#sobre"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-foreground/50 hover:text-accent transition-colors duration-300"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ArrowDown size={32} />
          </motion.div>
        </motion.a>
      </div>
    </section>
  );
};

export default Hero;
