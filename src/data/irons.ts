import { Shield, Zap, Wrench, Flame, Activity, Settings, Layers, Cpu } from "lucide-react";
import type { SteelAlloy } from "@/components/sections/SteelFamilySection";

// Microstructure Images for Nodular Irons (GGG)
import ggg40Img from "@/assets/microstructure-iron-ggg40.jpg";
import ggg50Img from "@/assets/microstructure-iron-ggg50.jpg";
import ggg60Img from "@/assets/microstructure-iron-ggg60.jpg";
import ggg70Img from "@/assets/microstructure-iron-ggg70.jpg";

// Microstructure Images for Gray Irons (GG)
import gg15Img from "@/assets/microstructure-iron-gg15.jpg";
import gg20Img from "@/assets/microstructure-iron-gg20.jpg";
import gg25Img from "@/assets/microstructure-iron-gg25.jpg";
import gg30Img from "@/assets/microstructure-iron-gg30.jpg";

// Microstructure Images for Vermicular Irons (GGV)
import ggv30Img from "@/assets/microstructure-iron-ggv30.jpg";
import ggv40Img from "@/assets/microstructure-iron-ggv40.jpg";
import ggv50Img from "@/assets/microstructure-iron-ggv50.jpg";

export const nodularIrons: SteelAlloy[] = [
  {
    name: "Ferro Nodular GGG-40",
    mainStatLabel: "Resistência à Tração",
    mainStatValue: "400 MPa (mín.)",
    mainStatPct: 65,
    tagline: "Alta ductilidade e tenacidade ao impacto",
    shape: "Grafita Esferoidal (Ferrítica)",
    description: "Matriz predominantemente ferrítica. Excelente alongamento e alta resistência ao impacto, ideal para peças sujeitas a choques mecânicos.",
    properties: [
      { label: "Resistência", value: 65 },
      { label: "Ductilidade", value: 95 },
      { label: "Amortecimento", value: 40 },
      { label: "Usinabilidade", value: 90 },
    ],
    applications: ["Buchas de suspensão", "Corpos de válvulas", "Conexões hidráulicas", "Suportes automotivos"],
    icon: Shield,
    image: ggg40Img,
    standardPrefix: "DIN 1693 / EN-GJS-400-15",
  },
  {
    name: "Ferro Nodular GGG-50",
    mainStatLabel: "Resistência à Tração",
    mainStatValue: "500 MPa (mín.)",
    mainStatPct: 75,
    tagline: "Equilíbrio mecânico e versatilidade",
    shape: "Grafita Esferoidal (Ferrito-Perlítica)",
    description: "Estrutura misturada oferecendo ótimo equilíbrio entre limite de escoamento e ductilidade. A liga nodular mais utilizada na indústria.",
    properties: [
      { label: "Resistência", value: 78 },
      { label: "Ductilidade", value: 70 },
      { label: "Amortecimento", value: 35 },
      { label: "Usinabilidade", value: 85 },
    ],
    applications: ["Engrenagens", "Caixas de direção", "Pintassangues", "Polias e eixos"],
    icon: Zap,
    image: ggg50Img,
    standardPrefix: "DIN 1693 / EN-GJS-500-7",
  },
  {
    name: "Ferro Nodular GGG-60",
    mainStatLabel: "Resistência à Tração",
    mainStatValue: "600 MPa (mín.)",
    mainStatPct: 85,
    tagline: "Alta resistência ao desgaste mecânico",
    shape: "Grafita Esferoidal (Perlítica)",
    description: "Matriz predominantemente perlítica. Alta dureza e capacidade de suportar elevadas pressões e cargas dinâmicas contínuas.",
    properties: [
      { label: "Resistência", value: 88 },
      { label: "Ductilidade", value: 45 },
      { label: "Amortecimento", value: 30 },
      { label: "Usinabilidade", value: 75 },
    ],
    applications: ["Virabrequins", "Camisas de cilindro", "Rodas dentadas", "Eixos de comando"],
    icon: Wrench,
    image: ggg60Img,
    standardPrefix: "DIN 1693 / EN-GJS-600-3",
  },
  {
    name: "Ferro Nodular GGG-70",
    mainStatLabel: "Resistência à Tração",
    mainStatValue: "700 MPa (mín.)",
    mainStatPct: 95,
    tagline: "Altíssima resistência e elevada dureza",
    shape: "Grafita Esferoidal (Perlita Fina)",
    description: "Perlita fina homogênea garantindo limite de tração elevado e excepcional resistência à abrasão e fadiga.",
    properties: [
      { label: "Resistência", value: 96 },
      { label: "Ductilidade", value: 30 },
      { label: "Amortecimento", value: 25 },
      { label: "Usinabilidade", value: 65 },
    ],
    applications: ["Engrenagens pesadas", "Matrizes de conformação", "Pistões de alta pressão", "Rodotes industriais"],
    icon: Flame,
    image: ggg70Img,
    standardPrefix: "DIN 1693 / EN-GJS-700-2",
  },
];

export const cinzentoIrons: SteelAlloy[] = [
  {
    name: "Ferro Cinzento GG-15",
    mainStatLabel: "Resistência à Tração",
    mainStatValue: "150 MPa (mín.)",
    mainStatPct: 40,
    tagline: "Máximo amortecimento de vibrações",
    shape: "Grafita Lamelar (Ferrítica)",
    description: "Baixa dureza e altíssima usinabilidade. Destaca-se pelo amortecimento acústico e de vibrações em estruturas estáticas.",
    properties: [
      { label: "Resistência", value: 40 },
      { label: "Ductilidade", value: 10 },
      { label: "Amortecimento", value: 100 },
      { label: "Usinabilidade", value: 100 },
    ],
    applications: ["Bases de máquinas", "Contrapesos", "Tampas de proteção", "Carcaças de reduzida solicitação"],
    icon: Layers,
    image: gg15Img,
    standardPrefix: "DIN 1691 / EN-GJL-150",
  },
  {
    name: "Ferro Cinzento GG-20",
    mainStatLabel: "Resistência à Tração",
    mainStatValue: "200 MPa (mín.)",
    mainStatPct: 55,
    tagline: "Excelente usinabilidade e estabilidade",
    shape: "Grafita Lamelar (Ferrito-Perlítica)",
    description: "Excelente condutividade térmica e amortecimento. Padrão industrial para componentes com exigência mecânica moderada.",
    properties: [
      { label: "Resistência", value: 55 },
      { label: "Ductilidade", value: 10 },
      { label: "Amortecimento", value: 90 },
      { label: "Usinabilidade", value: 95 },
    ],
    applications: ["Tambores de freio", "Volantes de motor", "Carcaças de bombas", "Polias simples"],
    icon: Settings,
    image: gg20Img,
    standardPrefix: "DIN 1691 / EN-GJL-200",
  },
  {
    name: "Ferro Cinzento GG-25",
    mainStatLabel: "Resistência à Tração",
    mainStatValue: "250 MPa (mín.)",
    mainStatPct: 70,
    tagline: "Alta estabilidade dimensional e mecânica",
    shape: "Grafita Lamelar (Perlítica)",
    description: "Matriz perlítica fina com alta resistência ao desgaste por fricção. Amplamente utilizado na indústria automotiva e pesada.",
    properties: [
      { label: "Resistência", value: 70 },
      { label: "Ductilidade", value: 10 },
      { label: "Amortecimento", value: 85 },
      { label: "Usinabilidade", value: 85 },
    ],
    applications: ["Discos de freio", "Blocos de motores leves", "Platôs de embreagem", "Carcaças de compressores"],
    icon: Activity,
    image: gg25Img,
    standardPrefix: "DIN 1691 / EN-GJL-250",
  },
  {
    name: "Ferro Cinzento GG-30",
    mainStatLabel: "Resistência à Tração",
    mainStatValue: "300 MPa (mín.)",
    mainStatPct: 82,
    tagline: "Alta densidade e resistência à pressão",
    shape: "Grafita Lamelar Fina (Perlítica)",
    description: "Garante estanqueidade e alta resistência para componentes hidráulicos e estruturais submetidos a elevadas tensões de compressão.",
    properties: [
      { label: "Resistência", value: 82 },
      { label: "Ductilidade", value: 10 },
      { label: "Amortecimento", value: 75 },
      { label: "Usinabilidade", value: 75 },
    ],
    applications: ["Blocos de motor heavy-duty", "Cabeçotes de cilindro", "Válvulas de alta pressão", "Guias de barramento"],
    icon: Cpu,
    image: gg30Img,
    standardPrefix: "DIN 1691 / EN-GJL-300",
  },
];

export const vermicularIrons: SteelAlloy[] = [
  {
    name: "Ferro Vermicular GGV-30",
    mainStatLabel: "Resistência à Tração",
    mainStatValue: "300 MPa (mín.)",
    mainStatPct: 65,
    tagline: "Alta condutividade térmica e tenacidade",
    shape: "Grafita Compactada (Ferrítica)",
    description: "Combina o elevado amortecimento e condutividade térmica do ferro cinzento com a tenacidade e resistência mecânica do nodular.",
    properties: [
      { label: "Resistência", value: 65 },
      { label: "Ductilidade", value: 45 },
      { label: "Amortecimento", value: 70 },
      { label: "Usinabilidade", value: 85 },
    ],
    applications: ["Colectores de escape", "Discos de freio de alta solicitação", "Moldes de vidro", "Peças sujeitas a choques térmicos"],
    icon: Flame,
    image: ggv30Img,
    standardPrefix: "ISO 16112 / CGI 300",
  },
  {
    name: "Ferro Vermicular GGV-40",
    mainStatLabel: "Resistência à Tração",
    mainStatValue: "400 MPa (mín.)",
    mainStatPct: 78,
    tagline: "Fadiga termomecânica superior",
    shape: "Grafita Compactada (Ferrito-Perlítica)",
    description: "Excelente resistência ao ciclo térmico contínuo. Ideal para redução de espessura de paredes mecânicas mantendo a rigidez.",
    properties: [
      { label: "Resistência", value: 78 },
      { label: "Ductilidade", value: 35 },
      { label: "Amortecimento", value: 60 },
      { label: "Usinabilidade", value: 75 },
    ],
    applications: ["Blocos de motores diesel de alta performance", "Cabeçotes industriais", "Tampas de caixas de transmissão"],
    icon: Activity,
    image: ggv40Img,
    standardPrefix: "ISO 16112 / CGI 400",
  },
  {
    name: "Ferro Vermicular GGV-50",
    mainStatLabel: "Resistência à Tração",
    mainStatValue: "500 MPa (mín.)",
    mainStatPct: 90,
    tagline: "Alta rigidez mecânica e leveza estrutural",
    shape: "Grafita Compactada (Perlítica)",
    description: "Elevado módulo de elasticidade e alta resistência mecânica para componentes de alta performance submetidos a pressão severa.",
    properties: [
      { label: "Resistência", value: 90 },
      { label: "Ductilidade", value: 25 },
      { label: "Amortecimento", value: 50 },
      { label: "Usinabilidade", value: 65 },
    ],
    applications: ["Motores de alta densidade de potência", "Carcaças de turbocompressores", "Peças ferroviárias"],
    icon: Shield,
    image: ggv50Img,
    standardPrefix: "ISO 16112 / CGI 500",
  },
];
