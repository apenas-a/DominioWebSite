import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowDown } from "lucide-react";
import heroVideo from "@/assets/hero-foundry.mp4";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!%&";

function useScramble(target: string, active: boolean, duration = 1000) {
  const [display, setDisplay] = useState(target);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) { setDisplay(target); return; }
    let iteration = 0;
    const totalFrames = Math.floor(duration / 30);
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      setDisplay(
        target
          .split("")
          .map((char, idx) => {
            if (char === " ") return " ";
            if (idx < Math.floor((iteration / totalFrames) * target.length)) {
              return target[idx];
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("")
      );
      iteration++;
      if (iteration > totalFrames) {
        clearInterval(intervalRef.current!);
        setDisplay(target);
      }
    }, 30);
    return () => clearInterval(intervalRef.current!);
  }, [target, active, duration]);

  return display;
}

const ROTATING_PHRASES = [
  "Nodular · Vermicular · Cinzento",
  "Carbono · Baixa Liga · Alta Liga",
  "Quintana — SP · Brasil",
  "Entender para atender",
];

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorTrailRef = useRef<HTMLDivElement>(null);
  const magnetRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [scrambleActive, setScrambleActive] = useState(false);
  const scrambled = useScramble(ROTATING_PHRASES[phraseIndex], scrambleActive);
  const phraseCycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [hoveredCta, setHoveredCta] = useState<null | "primary" | "secondary">(null);
  const rafRef = useRef<number>(0);

  // ── Video ready ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 400);
    if (videoRef.current && videoRef.current.readyState >= 2) setIsLoaded(true);
    return () => clearTimeout(t);
  }, []);

  // ── Phrase rotation ──────────────────────────────────────────────────────────
  useEffect(() => {
    phraseCycleRef.current = setInterval(() => {
      setScrambleActive(true);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
        setTimeout(() => setScrambleActive(false), 800);
      }, 200);
    }, 3200);
    return () => clearInterval(phraseCycleRef.current!);
  }, []);

  // ── Custom magnetic cursor ───────────────────────────────────────────────────
  const animateCursor = useCallback(() => {
    const cursor = cursorRef.current;
    const trail = cursorTrailRef.current;
    if (!cursor || !trail) return;

    const { x, y } = mousePos.current;

    gsap.to(cursor, {
      x: x - 12,
      y: y - 12,
      duration: 0.1,
      ease: "power2.out",
    });
    gsap.to(trail, {
      x: x - 28,
      y: y - 28,
      duration: 0.45,
      ease: "power2.out",
    });

    rafRef.current = requestAnimationFrame(animateCursor);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(animateCursor);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animateCursor]);

  // ── Entrance animations ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Stagger each letter of "Domínio"
      tl.from(".hero-letter", {
        opacity: 0,
        y: 80,
        rotationX: -90,
        stagger: 0.04,
        duration: 0.9,
        delay: 0.1,
      })
        .from(".hero-fundicio-word", { opacity: 0, x: -60, duration: 0.7 }, "-=0.6")
        .from(".hero-tagline", { opacity: 0, y: 24, duration: 0.6 }, "-=0.4")
        .from(".hero-phrase-wrap", { opacity: 0, duration: 0.5 }, "-=0.3")
        .from(".hero-cta-wrap", { opacity: 0, y: 20, duration: 0.5 }, "-=0.2")
        .from(".hero-metrics", { opacity: 0, y: 16, stagger: 0.08, duration: 0.45 }, "-=0.3")
        .from(".hero-scroll", { opacity: 0, duration: 0.6 }, "-=0.1");
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoaded]);

  // ── Parallax / fade on scroll ────────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!section || !video || !overlay) return;

    const ctx = gsap.context(() => {
      gsap.to(video, {
        y: 100,
        scale: 1.12,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
      });

      gsap.to(".hero-content-inner", {
        y: -90,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: section, start: "15% top", end: "55% top", scrub: true },
      });

      gsap.to(overlay, {
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: section, start: "45% top", end: "90% top", scrub: true },
      });
    });

    return () => ctx.revert();
  }, []);

  // ── Scroll arrow bounce ──────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".hero-scroll-arrow", {
        y: 9,
        duration: 1.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
    return () => ctx.revert();
  }, []);

  // ── CTA Magnet effect ────────────────────────────────────────────────────────
  const handleCtaMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    gsap.to(e.currentTarget, { x: dx * 0.22, y: dy * 0.22, duration: 0.25, ease: "power2.out" });
  };
  const handleCtaLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.6)" });
  };

  const DOMINIO_LETTERS = "DOMÍNIO".split("");

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden select-none"
    >
      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="fixed z-[200] pointer-events-none w-6 h-6 rounded-full border border-accent/70 mix-blend-difference"
        style={{ top: 0, left: 0 }}
      />
      <div
        ref={cursorTrailRef}
        className="fixed z-[199] pointer-events-none w-14 h-14 rounded-full bg-accent/10 blur-sm"
        style={{ top: 0, left: 0 }}
      />

      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label="Metal fundido em vazamento"
          onCanPlayThrough={() => setIsLoaded(true)}
          onLoadedData={() => setIsLoaded(true)}
          className={`absolute left-1/2 top-1/2 min-w-full min-h-full w-auto h-auto object-cover transition-opacity duration-[1500ms] ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ transform: "translate(-50%, -52%) scale(1.1)" }}
        />

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,hsl(30_15%_7%/0.55)_65%,hsl(30_15%_7%/0.92)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-background/60 to-transparent" />
      </div>

      {/* Scroll transition overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-background pointer-events-none"
        style={{ opacity: 0 }}
      />

      {/* ── Floating technical labels ──────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-10 hidden md:block">
        {/* Top-left */}
        <div
          className="absolute top-[18%] left-[6%] label-tech opacity-0"
          style={{ animation: isLoaded ? "fadeInLabel 1s 1.4s ease forwards" : "none" }}
        >
          <span className="text-foreground/25 text-[9px] block mb-1">// LIGA</span>
          <span className="text-accent/60 font-mono text-[11px]">Fe · C · Mn · Si</span>
        </div>

        {/* Top-right */}
        <div
          className="absolute top-[20%] right-[6%] label-tech text-right opacity-0"
          style={{ animation: isLoaded ? "fadeInLabel 1s 1.6s ease forwards" : "none" }}
        >
          <span className="text-foreground/25 text-[9px] block mb-1">// LOCALIDADE</span>
          <span className="text-foreground/40 font-mono text-[11px]">QUINTANA · SP</span>
        </div>

        {/* Bottom-left */}
        <div
          className="absolute bottom-[22%] left-[6%] label-tech opacity-0"
          style={{ animation: isLoaded ? "fadeInLabel 1s 1.8s ease forwards" : "none" }}
        >
          <span className="text-foreground/25 text-[9px] block mb-1">// FUNDADO</span>
          <span className="text-foreground/40 font-mono text-[11px]">EST. 2022</span>
        </div>

        {/* Bottom-right */}
        <div
          className="absolute bottom-[22%] right-[6%] label-tech text-right opacity-0"
          style={{ animation: isLoaded ? "fadeInLabel 1s 2.0s ease forwards" : "none" }}
        >
          <span className="text-foreground/25 text-[9px] block mb-1">// ESPECIALIDADE</span>
          <span className="text-accent/60 font-mono text-[11px]">FERRO · AÇO</span>
        </div>

        {/* Vertical line left */}
        <div
          className="absolute left-[3%] top-1/4 w-px opacity-0"
          style={{
            height: "50vh",
            background: "linear-gradient(to bottom, transparent, hsl(25 95% 50% / 0.15), transparent)",
            animation: isLoaded ? "fadeInLabel 1.2s 1.2s ease forwards" : "none",
          }}
        />
        {/* Vertical line right */}
        <div
          className="absolute right-[3%] top-1/4 w-px opacity-0"
          style={{
            height: "50vh",
            background: "linear-gradient(to bottom, transparent, hsl(25 95% 50% / 0.1), transparent)",
            animation: isLoaded ? "fadeInLabel 1.2s 1.4s ease forwards" : "none",
          }}
        />
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full section-container flex flex-col items-center text-center pt-20 sm:pt-28">
        <div className="hero-content-inner flex flex-col items-center" ref={magnetRef}>

          {/* Pre-title */}
          <p className="hero-tagline font-mono text-[10px] sm:text-xs uppercase tracking-[0.45em] text-foreground/35 mb-8">
            Fundição de Precisão
          </p>

          {/* FUNDIÇÃO word */}
          <div className="overflow-hidden mb-1">
            <h1
              className="hero-fundicio-word font-heading text-[clamp(1.8rem,6vw,5rem)] font-light uppercase tracking-[0.25em]"
              style={{
                color: "transparent",
                WebkitTextStroke: "1.5px hsl(25 95% 50% / 0.85)",
              }}
            >
              Fundição
            </h1>
          </div>

          {/* DOMÍNIO — letter by letter */}
          <div className="overflow-hidden mb-6 sm:mb-8 flex items-end gap-0">
            {DOMINIO_LETTERS.map((l, i) => (
              <span
                key={i}
                className="hero-letter font-heading font-black uppercase text-gradient-molten"
                style={{
                  fontSize: "clamp(3.5rem, 14vw, 10rem)",
                  lineHeight: 0.88,
                  display: "inline-block",
                  letterSpacing: "-0.02em",
                  WebkitTextStroke: "1px rgba(255,255,255,0.55)",
                  paintOrder: "stroke fill",
                }}
              >
                {l}
              </span>
            ))}
          </div>

          {/* Rotating phrase */}
          <div className="hero-phrase-wrap h-6 sm:h-7 flex items-center justify-center mb-10 sm:mb-12">
            <p
              className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.35em] text-foreground/40 transition-all duration-200"
            >
              {scrambled}
            </p>
          </div>

          {/* CTA Buttons — magnetic */}
          <div className="hero-cta-wrap flex flex-col sm:flex-row gap-4 items-center mb-14 sm:mb-16">
            <Link
              to="/orcamento"
              onMouseMove={handleCtaMove}
              onMouseLeave={handleCtaLeave}
              onMouseEnter={() => setHoveredCta("primary")}
              className={`group relative overflow-hidden px-8 py-4 font-heading font-bold uppercase tracking-[0.15em] text-sm text-accent-foreground transition-all duration-300 ${
                hoveredCta === "primary" ? "scale-[1.03]" : ""
              }`}
              style={{
                background: "linear-gradient(135deg, hsl(20 100% 55%), hsl(25 95% 50%), hsl(30 100% 60%))",
                clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              }}
            >
              <span className="relative z-10">Solicitar Orçamento</span>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
            </Link>

            <Link
              to="/processo"
              onMouseMove={handleCtaMove}
              onMouseLeave={handleCtaLeave}
              onMouseEnter={() => setHoveredCta("secondary")}
              className="group relative px-8 py-4 font-heading font-bold uppercase tracking-[0.15em] text-sm text-foreground/70 hover:text-accent transition-colors duration-300"
              style={{
                clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                border: "1px solid hsl(30 12% 25% / 0.6)",
              }}
            >
              Nosso Processo
              <span className="absolute bottom-[11px] left-8 right-8 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          </div>

          {/* Metrics row — no cards, just raw numbers */}
          <div className="flex items-center gap-8 sm:gap-14">
            {[
              { value: "2022", label: "Fundada" },
              { value: "3+", label: "Ligas" },
              { value: "100%", label: "Nacional" },
            ].map(({ value, label }, i) => (
              <div key={i} className="hero-metrics flex flex-col items-center">
                <span className="font-heading font-black text-2xl sm:text-3xl text-gradient-molten leading-none">
                  {value}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/30 mt-1">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#sobre"
        className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground/25 hover:text-accent transition-colors duration-300 z-20 flex flex-col items-center gap-2"
        aria-label="Rolar para baixo"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/20">scroll</span>
        <div className="hero-scroll-arrow">
          <ArrowDown size={22} />
        </div>
      </a>

      <style>{`
        @keyframes fadeInLabel {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
