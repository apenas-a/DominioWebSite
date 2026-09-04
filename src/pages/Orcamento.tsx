import MoltenParticles from "@/components/MoltenParticles";
import { Mail, MessageCircle, MapPin, Layers, Cpu, FlaskConical, ArrowRight, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const whatsappNumber = "5514991790555";
const emailTo = "contato@fundicaodominio.com.br";

const emailMolde = `mailto:${emailTo}?subject=${encodeURIComponent("Orçamento - Fundição com Molde Existente")}&body=${encodeURIComponent(
  "Olá equipe Fundição Domínio,\n\nGostaria de solicitar um orçamento de fundição para peças utilizando ferramental/molde já existente.\n\n" +
  "Seguem detalhes preliminares:\n" +
  "- Tipo/Material do molde (Madeira, Alumínio, Resina, etc):\n" +
  "- Peso aproximado da peça:\n" +
  "- Liga metálica desejada:\n" +
  "- Demanda estimada:\n\n" +
  "[Se possível, anexe fotos do molde e das peças para nos ajudar no orçamento]\n\n" +
  "Atenciosamente,\n[Seu Nome / Empresa]"
)}`;

const emailDesenvolvimento = `mailto:${emailTo}?subject=${encodeURIComponent("Orçamento - Desenvolvimento Completo de Peça")}&body=${encodeURIComponent(
  "Olá equipe Fundição Domínio,\n\nGostaria de solicitar o desenvolvimento completo de um novo projeto de fundição.\n\n" +
  "Seguem detalhes preliminares:\n" +
  "- Possuo desenho técnico (2D/3D) ou Amostra física:\n" +
  "- Liga metálica desejada (se souber):\n" +
  "- Aplicação/função da peça:\n" +
  "- Demanda anual estimada:\n\n" +
  "[Se possível, anexe desenhos técnicos, fotos ou especificações técnicas]\n\n" +
  "Atenciosamente,\n[Seu Nome / Empresa]"
)}`;

const emailAnalise = `mailto:${emailTo}?subject=${encodeURIComponent("Orçamento - Análise Química / Espectrometria")}&body=${encodeURIComponent(
  "Olá equipe Fundição Domínio,\n\nGostaria de solicitar uma cotação para análises químicas laboratoriais e espectrometria de ligas.\n\n" +
  "Seguem detalhes preliminares:\n" +
  "- Tipo de liga/amostra:\n" +
  "- Quantidade de amostras/corpos de prova:\n" +
  "- Necessita de certificado assinado por técnico? (Sim/Não):\n\n" +
  "Atenciosamente,\n[Seu Nome / Empresa]"
)}`;

const mapsEmbedSrc = "https://www.google.com/maps?q=Rua+Saudade,+30+-+Vila+Industrial+II,+Quintana+-+SP,+17674-228&t=k&z=18&output=embed";

const MODALITIES = [
  {
    index: "01",
    label: "Molde Existente",
    icon: Layers,
    tagline: "Já tem o ferramental",
    desc: "Para quem já possui moldes de madeira, resina ou alumínio e busca agilidade na produção.",
    checklist: [
      "Dimensões e material do ferramental",
      "Fotos nítidas do molde e peças fundidas",
      "Peso aproximado da peça final",
      "Liga metálica desejada",
    ],
    whatsapp: `https://wa.me/${whatsappNumber}`,
    email: emailMolde,
  },
  {
    index: "02",
    label: "Desenvolvimento Completo",
    icon: Cpu,
    tagline: "Do esboço à peça",
    desc: "Nossa engenharia desenvolve a modelagem 3D e fabricação do ferramental do zero.",
    checklist: [
      "Desenho técnico 2D (PDF) ou 3D (STEP/IGS)",
      "Amostra física ou croqui",
      "Função mecânica da peça",
      "Volume anual estimado",
    ],
    whatsapp: `https://wa.me/${whatsappNumber}`,
    email: emailDesenvolvimento,
  },
  {
    index: "03",
    label: "Análise Química",
    icon: FlaskConical,
    tagline: "Espectrometria de ligas",
    desc: "Ensaio laboratorial por emissão óptica. Composição química certificada de qualquer liga metálica.",
    checklist: [
      "Tipo de liga (ferrosa ou não-ferrosa)",
      "Quantidade de amostras",
      "Necessidade de laudo técnico assinado",
    ],
    whatsapp: `https://wa.me/${whatsappNumber}`,
    email: emailAnalise,
  },
];

const Orcamento = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeModal, setActiveModal] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const displayed = hovered !== null ? hovered : activeModal;

  // Animate progress bar
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    gsap.to(el, {
      width: `${((displayed + 1) / MODALITIES.length) * 100}%`,
      duration: 0.35,
      ease: "power2.out",
    });
  }, [displayed]);

  // Entrance animations
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Header words
      gsap.fromTo(".orc-word", { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, stagger: 0.07, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".orc-header", start: "top 85%", toggleActions: "play none none none" },
      });

      // Selector tabs
      gsap.fromTo(".orc-tab", { opacity: 0, x: -20 }, {
        opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".orc-tabs", start: "top 85%", toggleActions: "play none none none" },
      });

      // Panel
      gsap.fromTo(".orc-panel", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: ".orc-panel", start: "top 85%", toggleActions: "play none none none" },
      });

      // Map
      gsap.fromTo(".orc-map", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: ".orc-map", start: "top 85%", toggleActions: "play none none none" },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const mod = MODALITIES[displayed];
  const Icon = mod.icon;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden pt-24 sm:pt-32 pb-20 sm:pb-28"
      style={{
        background:
          "radial-gradient(ellipse at 20% 10%, hsl(25 95% 50% / 0.05) 0%, transparent 45%), hsl(30 15% 7%)",
      }}
    >
      {/* Grid texture */}
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />
      <MoltenParticles density="low" />

      {/* Forge glow top-left */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/4 blur-[140px] pointer-events-none" />

      <div className="relative section-container">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="orc-header mb-16 sm:mb-20">
          <p className="orc-word font-mono text-[10px] uppercase tracking-[0.45em] text-accent/60 mb-5 opacity-0">
            // Solicitar Orçamento
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-0 mb-6">
            {["Entre", "em", "contato."].map((w, i) => (
              <span
                key={i}
                className={`orc-word opacity-0 font-heading font-black uppercase leading-[0.88] text-4xl sm:text-6xl md:text-7xl ${
                  w === "contato." ? "text-gradient-molten" : "text-foreground"
                }`}
              >
                {w}
              </span>
            ))}
          </div>

          <p className="orc-word opacity-0 text-foreground/45 text-sm sm:text-base max-w-lg leading-relaxed">
            Escolha a modalidade que se encaixa no seu projeto e abra um canal direto com nossa engenharia.
          </p>
        </div>

        {/* ── Main Layout ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10 mb-20 sm:mb-28">

          {/* Tabs — vertical selector */}
          <div className="orc-tabs flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {/* Progress bar — desktop only */}
            <div className="hidden lg:block h-px bg-border/20 mb-5 relative overflow-hidden">
              <div
                ref={progressRef}
                className="absolute left-0 top-0 h-full"
                style={{
                  width: `${((displayed + 1) / MODALITIES.length) * 100}%`,
                  background: "linear-gradient(to right, hsl(20 100% 55%), hsl(25 95% 50%))",
                }}
              />
            </div>

            {MODALITIES.map((m, i) => {
              const isActive = displayed === i;
              return (
                <button
                  key={i}
                  className={`orc-tab opacity-0 shrink-0 lg:shrink text-left px-4 py-3 lg:py-4 flex items-center gap-3 lg:gap-4 transition-all duration-300 border-b lg:border-b-0 lg:border-l-2 ${
                    isActive
                      ? "border-accent text-foreground"
                      : "border-border/20 text-foreground/35 hover:text-foreground/65 hover:border-border/50"
                  }`}
                  onClick={() => { setActiveModal(i); setHovered(null); }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className={`font-mono text-[9px] shrink-0 transition-colors ${isActive ? "text-accent" : "text-foreground/20"}`}>
                    {m.index}
                  </span>
                  <div className="min-w-0">
                    <div className="font-heading font-bold uppercase text-sm tracking-tight whitespace-nowrap">
                      {m.label}
                    </div>
                    {isActive && (
                      <div className="font-mono text-[9px] text-foreground/30 uppercase tracking-widest mt-0.5">
                        {m.tagline}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <div className="orc-panel opacity-0">
            {/* Top bar */}
            <div className="flex items-center gap-4 mb-8">
              <span
                className="font-heading font-black text-[80px] sm:text-[100px] leading-none select-none"
                style={{ color: "transparent", WebkitTextStroke: "1px hsl(25 95% 50% / 0.2)" }}
              >
                {mod.index}
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/60 mb-1">{mod.tagline}</p>
                <h2 className="font-heading font-black uppercase text-2xl sm:text-3xl leading-none text-foreground">
                  {mod.label}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Left: description + CTA */}
              <div className="flex flex-col">
                <p className="text-foreground/55 text-sm sm:text-base leading-relaxed mb-8">
                  {mod.desc}
                </p>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <a
                    href={mod.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden flex items-center justify-center gap-2 px-6 py-3.5 font-heading font-bold uppercase tracking-[0.12em] text-sm text-accent-foreground transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, hsl(20 100% 55%), hsl(25 95% 50%))",
                      clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                  </a>

                  <a
                    href={mod.email}
                    className="group flex items-center justify-center gap-2 px-6 py-3.5 font-heading font-bold uppercase tracking-[0.12em] text-sm text-foreground/65 hover:text-accent transition-all duration-300"
                    style={{
                      border: "1px solid hsl(30 12% 25% / 0.5)",
                      clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                  >
                    <Mail size={15} />
                    E-mail
                    <span className="absolute bottom-[9px] left-8 right-8 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left hidden" />
                  </a>
                </div>
              </div>

              {/* Right: checklist */}
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/25 mb-5">
                  // O que nos enviar
                </p>

                <div className="flex flex-col divide-y divide-border/15">
                  {mod.checklist.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 py-3.5 group/item"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-mono text-[9px] text-foreground/20 shrink-0 w-4">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-accent/50 shrink-0 mt-0.5"
                        />
                        <span className="text-sm text-foreground/60 leading-snug group-hover/item:text-foreground/85 transition-colors duration-200">
                          {item}
                        </span>
                      </div>
                      <Check size={13} className="text-accent/50 shrink-0 mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className="divider-molten opacity-25 mb-20 sm:mb-24" />

        {/* ── Map Section ─────────────────────────────────────────────── */}
        <div className="orc-map opacity-0">
          <div className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent/60 mb-4">
              // Localização
            </p>
            <h2 className="font-heading font-black uppercase text-2xl sm:text-3xl leading-none text-foreground mb-2">
              Onde nos <span className="text-gradient-molten">encontrar</span>
            </h2>
            <p className="text-sm text-foreground/40 max-w-md">
              Venha nos visitar ou envie suas amostras e moldes ao nosso endereço.
            </p>
          </div>

          <a
            href="https://maps.app.goo.gl/r6YhFjSyr3NoCjrT8"
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative overflow-hidden h-[260px] sm:h-[380px] md:h-[480px]"
            style={{
              border: "1px solid hsl(30 12% 18% / 0.6)",
              clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
            }}
            aria-label="Abrir localização no Google Maps"
          >
            <iframe
              title="Localização Fundição Domínio - Quintana, SP"
              src={mapsEmbedSrc}
              className="w-full h-full border-0 grayscale-[30%] contrast-110 group-hover:grayscale-0 transition-all duration-700"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />

            {/* Bottom overlay */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-5 sm:p-7 flex items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-9 h-9 flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, hsl(20 100% 55%), hsl(25 95% 50%))",
                    clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                  }}
                >
                  <MapPin size={17} className="text-accent-foreground" />
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/70 mb-0.5">Endereço</p>
                  <p className="text-sm text-foreground/75 leading-tight">
                    Rua Saudade, 30 · Vila Industrial II · Quintana-SP · 17674-228
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-foreground/30 group-hover:text-accent transition-colors duration-300 shrink-0">
                <span className="font-mono text-[9px] uppercase tracking-widest">Abrir no Maps</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Corner markers */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-accent/30 pointer-events-none" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-foreground/10 pointer-events-none" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Orcamento;
