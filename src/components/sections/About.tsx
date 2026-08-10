import { useEffect, useRef } from "react";
import empresaImg from "@/assets/Empresa.jpeg";
import { Calendar, Layers, Shield, Handshake } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const highlights = [
    {
      icon: Calendar,
      title: "Fundada em 2022",
      description:
        "Compromisso em trazer qualidade superior e alta confiabilidade para nossos parceiros comerciais.",
    },
    {
      icon: Layers,
      title: "Do Projeto à Fusão",
      description:
        "Trabalhamos em todo o ciclo: desde o planejamento técnico, modelagem e projeto até a fusão das peças.",
    },
    {
      icon: Shield,
      title: "Qualidade Garantida",
      description:
        "Rigoroso controle metalúrgico e dimensional em todas as etapas para garantir a melhor entrega.",
    },
    {
      icon: Handshake,
      title: "Soluções Sob Medida",
      description:
        "Entendemos a real necessidade de cada cliente para oferecer ligas metálicas eficientes e sob medida.",
    },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || !image) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Title reveal
      gsap.fromTo(
        ".about-title",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-title",
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      // Image reveal
      gsap.fromTo(
        image,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: image,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Image parallax on scroll
      const imgInner = image.querySelector("img");
      if (imgInner) {
        gsap.to(imgInner, {
          y: 30,
          ease: "none",
          scrollTrigger: {
            trigger: image,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Highlight cards stagger
      gsap.fromTo(
        ".about-card",
        { opacity: 0, y: 30, x: 20 },
        {
          opacity: 1,
          y: 0,
          x: 0,
          stagger: 0.12,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-cards-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="sobre"
      className="py-16 sm:py-24 gradient-dark relative overflow-hidden"
    >
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Title */}
        <div className="about-title text-center mb-10 sm:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
            Sobre a <span className="text-gradient-molten">Fundição Domínio</span>
          </h2>
          <div className="w-20 h-[2px] gradient-molten mx-auto mb-6" />
          <p className="text-sm sm:text-base md:text-lg text-foreground/60 max-w-3xl mx-auto leading-relaxed">
            Localizada em Quintana-SP, somos uma fundição especializada na produção de peças em
            ferro fundido e aço carbono de alta qualidade. Nossa missão é entender as necessidades
            de cada cliente para oferecer soluções personalizadas e eficientes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Image */}
          <div
            ref={imageRef}
            className="lg:col-span-6 relative group overflow-hidden rounded-xl"
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={empresaImg}
                alt="Vista aérea da Fundição Domínio em Quintana-SP"
                className="w-full h-full object-cover aspect-[4/3] sm:aspect-video lg:aspect-[4/3] transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
              {/* Vignette */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_20px_hsl(30_15%_7%)] sm:shadow-[inset_0_0_60px_30px_hsl(30_15%_7%)]" />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/80 via-transparent to-background/30" />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background/30 via-transparent to-background/30" />

              {/* Accent highlight on hover */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Technical label */}
            <div className="absolute bottom-3 left-3 label-tech bg-background/70 backdrop-blur-md px-3 py-1.5 rounded-md border border-border/30">
              Quintana - SP
            </div>
          </div>

          {/* Highlight cards */}
          <div className="about-cards-grid lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="about-card glass-dark edge-glow rounded-xl p-5 sm:p-6 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="w-10 h-10 rounded-lg gradient-molten flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                  <highlight.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-semibold uppercase mb-2 text-foreground group-hover:text-accent transition-colors duration-300">
                  {highlight.title}
                </h3>
                <p className="text-foreground/55 text-xs sm:text-sm leading-relaxed">
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
