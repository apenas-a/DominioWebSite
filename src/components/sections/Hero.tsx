import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowDown } from "lucide-react";
import heroVideo from "@/assets/hero-foundry.mp4";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Safety fallback so content animation always runs even if video event was cached or delayed
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      setIsLoaded(true);
    }
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!isLoaded) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const content = contentRef.current;
    if (!content) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", {
        opacity: 0,
        y: 20,
        scale: 0.95,
        duration: 0.6,
        delay: 0.2,
      })
        .from(
          ".hero-title",
          {
            opacity: 0,
            y: 40,
            duration: 0.8,
          },
          "-=0.3"
        )
        .from(
          ".hero-subtitle",
          {
            opacity: 0,
            y: 30,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          ".hero-separator",
          {
            scaleX: 0,
            opacity: 0,
            duration: 0.5,
          },
          "-=0.3"
        )
        .from(
          ".hero-description",
          {
            opacity: 0,
            y: 25,
            duration: 0.6,
          },
          "-=0.2"
        )
        .from(
          ".hero-cta",
          {
            opacity: 0,
            y: 20,
            stagger: 0.12,
            duration: 0.5,
          },
          "-=0.2"
        )
        .from(
          ".hero-scroll",
          {
            opacity: 0,
            duration: 0.8,
          },
          "-=0.2"
        );
    }, content);

    return () => ctx.revert();
  }, [isLoaded]);

  // Parallax on scroll — hero fades and shifts
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const content = contentRef.current;
    const overlay = overlayRef.current;

    if (!section || !video || !content || !overlay) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Video parallax — moves slower than scroll
      gsap.to(video, {
        y: 120,
        scale: 1.15,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Content fades out and moves up
      gsap.to(content, {
        y: -80,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "20% top",
          end: "60% top",
          scrub: true,
        },
      });

      // Overlay darkens
      gsap.to(overlay, {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "40% top",
          end: "90% top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // Scroll indicator bounce
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.to(".hero-scroll-arrow", {
        y: 10,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Video */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-label="Vazamento de metal fundido em molde"
            onCanPlayThrough={() => setIsLoaded(true)}
            onLoadedData={() => setIsLoaded(true)}
            className={`absolute left-1/2 top-1/2 min-w-full min-h-full w-auto h-auto object-cover transition-opacity duration-1500 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: "translate(-50%, -52%) scale(1.1)",
            }}
          />
        </div>

        {/* Vignette overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(30_15%_7%/0.5)_70%,hsl(30_15%_7%/0.9)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/95 to-transparent" />
      </div>

      {/* Scroll transition overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-background pointer-events-none"
        style={{ opacity: 0 }}
      />

      {/* Content */}
      <div ref={contentRef} className="relative z-10 section-container text-center pt-16 sm:pt-24">
        <div className="flex flex-col items-center">
          {/* Badge */}
          <div className="hero-badge badge-accent mb-6">
            <Shield size={14} />
            Fundição de Ferro e Aço
          </div>

          {/* Title */}
          <h1 className="hero-title font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
            Fundição{" "}
            <span className="text-gradient-molten">Domínio</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-sm sm:text-base md:text-lg uppercase tracking-[0.3em] text-foreground/50 font-light mb-4 sm:mb-5">
            Ferro • Aço • Engenharia
          </p>

          {/* Separator */}
          <div className="hero-separator w-20 h-[2px] gradient-molten mb-5 sm:mb-6 origin-center" />

          {/* Description */}
          <p className="hero-description text-sm sm:text-base md:text-lg text-foreground/65 max-w-2xl mx-auto mb-4 sm:mb-5 leading-relaxed">
            &quot;Entender para atender&quot;
          </p>

          <p className="hero-description text-xs sm:text-sm md:text-base text-foreground/50 max-w-xl mx-auto mb-8 sm:mb-10">
            Fundição de ferro (nodular, vermicular e cinzento) e aço carbono
            com engenharia de precisão em Quintana-SP.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full">
            <Link
              to="/orcamento"
              className="hero-cta gradient-molten text-accent-foreground px-7 py-3.5 sm:px-8 sm:py-4 rounded-md font-semibold uppercase tracking-wider text-sm hover:opacity-90 transition-all duration-300 glow-molten-sm hover:scale-[1.02] w-full max-w-xs sm:w-auto text-center"
            >
              Solicitar Orçamento
            </Link>
            <Link
              to="/processo"
              className="hero-cta glass-dark text-foreground px-7 py-3.5 sm:px-8 sm:py-4 rounded-md font-semibold uppercase tracking-wider text-sm hover:border-accent/40 hover:text-accent transition-all duration-300 hover:scale-[1.02] w-full max-w-xs sm:w-auto text-center"
            >
              Nosso Processo
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <a
          href="#sobre"
          className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground/30 hover:text-accent transition-colors duration-300"
          aria-label="Rolar para baixo"
        >
          <div className="hero-scroll-arrow">
            <ArrowDown size={28} />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
