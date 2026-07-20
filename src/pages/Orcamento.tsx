import Layout from "@/components/layout/Layout";
import MoltenParticles from "@/components/MoltenParticles";
import { Mail, MessageCircle, MapPin, Flame, Check, Layers, Cpu, FlaskConical } from "lucide-react";

const Orcamento = () => {
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

  const cardsData = [
    {
      number: "01",
      title: "Molde Existente",
      description: "Para quem já possui o ferramental (moldes de madeira, resina ou alumínio) e busca agilidade na produção e fundição das peças.",
      icon: Layers,
      requirements: [
        "Dimensões e material do ferramental",
        "Fotos nítidas do molde e de peças fundidas",
        "Peso aproximado da peça final",
        "Liga metálica desejada (ou aplicação)",
      ],
      whatsappLink: `https://wa.me/${whatsappNumber}`,
      emailLink: emailMolde,
    },
    {
      number: "02",
      title: "Desenvolvimento Completo",
      description: "Do esboço à peça finalizada. Nossa equipe de engenharia desenvolve a modelagem 3D e fabricação do ferramental.",
      icon: Cpu,
      requirements: [
        "Desenho técnico 2D (PDF) ou 3D (STEP/IGS)",
        "Amostra física (se possuir) ou croqui",
        "Esclarecimento da função mecânica da peça",
        "Estimativa de volume anual necessário",
      ],
      whatsappLink: `https://wa.me/${whatsappNumber}`,
      emailLink: emailDesenvolvimento,
    },
    {
      number: "03",
      title: "Análise Química de Metal",
      description: "Serviço laboratorial de espectrometria por emissão óptica para atestar a composição química e emitir certificados de ligas metálicas.",
      icon: FlaskConical,
      requirements: [
        "Tipo de liga metálica (ferrosa ou não-ferrosa)",
        "Quantidade de amostras para o ensaio",
        "Informação se exige laudo técnico assinado",
      ],
      whatsappLink: `https://wa.me/${whatsappNumber}`,
      emailLink: emailAnalise,
    },
  ];

  return (
    <Layout>
      <section className="relative py-12 sm:py-24 bg-background overflow-hidden min-h-screen pt-24 sm:pt-32">
        {/* Background atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-molten/5 blur-[120px]" />
        </div>
        <MoltenParticles />

        <div className="relative section-container">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full border border-accent/30 bg-accent/5 text-xs uppercase tracking-[0.2em] text-accent backdrop-blur-md">
              <Flame size={14} className="animate-pulse" />
              Agilidade & Precisão
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
              Solicite seu <span className="text-gradient-molten">Orçamento</span>
            </h1>
            <div className="w-24 h-1 gradient-molten mx-auto mb-6" />
            <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-3xl mx-auto font-light">
              Escolha a modalidade de orçamento que melhor atende a sua necessidade para abrir o canal
              direto com nossa engenharia ou atendimento comercial.
            </p>
          </div>

          {/* Asymmetric Cards Layout */}
          <div className="max-w-5xl mx-auto mb-16 sm:mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Card 01 — Full width horizontal */}
            {(() => {
              const card = cardsData[0];
              const Icon = card.icon;
              return (
                <div className="glass-dark edge-glow rounded-2xl p-6 sm:p-8 mb-4 group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(255,120,30,0.15)]">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left column */}
                    <div className="lg:w-2/5 flex flex-col">
                      <div className="flex items-center gap-4 mb-5">
                        <span className="text-6xl sm:text-7xl font-heading font-bold text-transparent select-none leading-none" style={{ WebkitTextStroke: "1px hsl(var(--accent) / 0.3)" }}>
                          {card.number}
                        </span>
                        <div className="w-12 h-12 rounded-xl gradient-molten flex items-center justify-center shadow-lg shadow-accent/20">
                          <Icon className="w-6 h-6 text-accent-foreground" />
                        </div>
                      </div>
                      <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground mb-3">
                        {card.title}
                      </h2>
                      <p className="text-sm text-foreground/60 leading-relaxed mb-6 flex-grow">
                        {card.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href={card.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gradient-molten text-accent-foreground px-5 py-3 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:opacity-95 hover:scale-[1.02] flex items-center justify-center gap-2 shadow-md shadow-accent/15"
                        >
                          <MessageCircle size={15} />
                          WhatsApp
                        </a>
                        <a
                          href={card.emailLink}
                          className="border border-border/60 hover:border-accent/40 bg-background/30 hover:bg-background/60 text-foreground px-5 py-3 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Mail size={15} />
                          E-mail
                        </a>
                      </div>
                    </div>

                    {/* Vertical divider */}
                    <div className="hidden lg:block w-px bg-border/30 self-stretch" />

                    {/* Right column — Requirements */}
                    <div className="lg:flex-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-5">
                        O que nos enviar:
                      </p>
                      <ul className="space-y-4">
                        {card.requirements.map((req, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-3 text-sm text-foreground/80 font-light">
                            <Check size={16} className="text-accent flex-shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Cards 02 and 03 — Side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cardsData.slice(1).map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.number}
                    className="glass-dark edge-glow rounded-2xl p-6 sm:p-7 flex flex-col group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(255,120,30,0.12)]"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-5xl font-heading font-bold text-transparent select-none leading-none" style={{ WebkitTextStroke: "1px hsl(var(--accent) / 0.3)" }}>
                        {card.number}
                      </span>
                      <div className="w-11 h-11 rounded-xl gradient-molten flex items-center justify-center shadow-lg shadow-accent/20">
                        <Icon className="w-5 h-5 text-accent-foreground" />
                      </div>
                    </div>

                    <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-foreground/60 leading-relaxed mb-5 flex-grow">
                      {card.description}
                    </p>

                    <div className="border-t border-border/30 pt-5 mb-5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-accent mb-4">
                        O que nos enviar:
                      </p>
                      <ul className="space-y-3">
                        {card.requirements.map((req, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2.5 text-xs text-foreground/75 font-light">
                            <Check size={14} className="text-accent flex-shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <a
                        href={card.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gradient-molten text-accent-foreground px-4 py-2.5 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:opacity-95 flex items-center justify-center gap-2 shadow-md shadow-accent/15"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                      <a
                        href={card.emailLink}
                        className="border border-border/60 hover:border-accent/40 bg-background/30 hover:bg-background/60 text-foreground px-4 py-2.5 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Mail size={14} />
                        E-mail
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Section — UNCHANGED */}
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 px-4 sm:px-0">
            <div className="text-center mb-8">
              <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground mb-2">
                Onde pode nos <span className="text-gradient-molten">Encontrar ?</span>
              </h2>
              <p className="text-sm text-foreground/60 max-w-xl mx-auto font-light">
                Venha nos visitar ou faça o envio de suas amostras e moldes diretamente ao nosso endereço físico.
              </p>
            </div>

            <a
              href="https://maps.app.goo.gl/r6YhFjSyr3NoCjrT8"
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative rounded-2xl overflow-hidden border border-border/50 hover:border-accent/60 transition-all duration-500 shadow-2xl shadow-background/50 hover:shadow-accent/10 h-[260px] sm:h-[380px] md:h-[480px]"
              aria-label="Abrir localização no Google Maps"
            >
              <iframe
                title="Localização Fundição Domínio - Quintana, SP"
                src={mapsEmbedSrc}
                className="w-full h-full border-0 grayscale-[20%] contrast-110 group-hover:grayscale-0 transition-all duration-500"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-molten flex items-center justify-center flex-shrink-0">
                  <MapPin size={22} className="text-accent-foreground" />
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold uppercase tracking-widest text-accent mb-1">
                    Endereço
                  </p>
                  <p className="text-sm md:text-base text-foreground/90 leading-tight">
                    Rua Saudade, 30 - Vila Industrial II, Quintana - SP, CEP 17674-228
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Orcamento;
