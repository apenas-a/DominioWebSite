import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const METRICS = [
  { value: "100%", suffix: "", label: "Rastreabilidade" },
  { value: "0", suffix: " defeito", label: "Política de Qualidade" },
  { value: "72h", suffix: "", label: "Prazo de Resposta" },
  { value: "5", suffix: " ligas", label: "Especializações" },
];

const TICKER_ITEMS = [
  "Ferro Nodular",
  "Ferro Vermicular",
  "Ferro Cinzento",
  "Aço Carbono",
  "Aço Baixa Liga",
  "Aço Alta Liga",
  "Qualidade Certificada",
  "Quintana · SP",
];

const TrustSignals = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const tickerInnerRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [hasAnimated, setHasAnimated] = useState(false);

  // ── Ticker tape ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const inner = tickerInnerRef.current;
    if (!inner) return;

    const ctx = gsap.context(() => {
      gsap.to(inner, {
        x: "-50%",
        duration: 22,
        ease: "none",
        repeat: -1,
      });
    });

    return () => ctx.revert();
  }, []);

  // ── Counter animation on scroll ──────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        onEnter: () => {
          if (hasAnimated) return;
          setHasAnimated(true);

          if (prefersReduced) return;

          // Animate the whole section in
          gsap.fromTo(
            ".trust-counter-block",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" }
          );

          // Number count-up
          countersRef.current.forEach((el, i) => {
            if (!el) return;
            const rawVal = METRICS[i].value;
            const num = parseFloat(rawVal.replace(/[^0-9.]/g, ""));
            if (isNaN(num)) return;
            const isFloat = rawVal.includes(".");
            const prefix = rawVal.match(/^[^0-9]*/)?.[0] ?? "";
            const suffix = rawVal.match(/[^0-9.]+$/)?.[0] ?? "";
            gsap.fromTo(
              { n: 0 },
              { n: num },
              {
                duration: 1.6,
                delay: i * 0.1,
                ease: "power2.out",
                onUpdate: function () {
                  const val = isFloat
                    ? this.targets()[0].n.toFixed(1)
                    : Math.round(this.targets()[0].n);
                  if (el) el.textContent = `${prefix}${val}${suffix}`;
                },
              }
            );
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, [hasAnimated]);

  const repeated = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-0">
      {/* ── Ticker tape ── */}
      <div
        ref={tickerRef}
        className="bg-accent/8 border-y border-accent/15 py-3 overflow-hidden whitespace-nowrap"
      >
        <div ref={tickerInnerRef} className="inline-flex items-center gap-0">
          {repeated.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-6 mx-6">
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-foreground/45">
                {item}
              </span>
              <span className="w-1 h-1 rounded-full bg-accent/40 shrink-0" />
            </span>
          ))}
        </div>
      </div>

      {/* ── Metric numbers ── */}
      <div className="section-container py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {METRICS.map((m, i) => (
            <div
              key={i}
              className="trust-counter-block flex flex-col items-center md:items-start opacity-0 group cursor-default"
            >
              <div className="flex items-baseline gap-0.5">
                <span
                  ref={(el) => { countersRef.current[i] = el; }}
                  className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-gradient-molten leading-none tabular-nums"
                >
                  {m.value}
                </span>
                {m.suffix && (
                  <span className="font-mono text-xs text-foreground/30 ml-1 self-end mb-1">
                    {m.suffix}
                  </span>
                )}
              </div>
              <div className="w-8 h-px bg-accent/30 mt-2 mb-2 group-hover:w-full transition-all duration-500 ease-out" />
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-foreground/35 leading-tight">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="section-container">
        <div className="divider-molten opacity-30" />
      </div>
    </section>
  );
};

export default TrustSignals;
