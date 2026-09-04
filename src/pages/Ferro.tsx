import SteelFamilySection from "@/components/sections/SteelFamilySection";
import AlloysComparison from "@/components/sections/AlloysComparison";
import { nodularIrons, cinzentoIrons, vermicularIrons } from "@/data/irons";

const Ferro = () => (
  <>
    <SteelFamilySection
      id="nodular"
      badge="Ferro Nodular"
      title={<>Catálogo Técnico: <span className="text-gradient-molten">Ferro Nodular</span></>}
      description="Ligas de grafita esferoidal (Série GGG / EN-GJS). Elevada resistência à tração, excelente ductilidade e tenacidade ao impacto para componentes mecânicos e de segurança."
      alloys={nodularIrons}
      isFirst={true}
    />
    <SteelFamilySection
      id="cinzento"
      badge="Ferro Cinzento"
      title={<>Ferro Fundido <span className="text-gradient-molten">Cinzento</span></>}
      description="Ligas de grafita lamelar (Série GG / EN-GJL). Altíssima capacidade de amortecimento de vibrações, elevada estabilidade dimensional e máxima usinabilidade."
      alloys={cinzentoIrons}
    />
    <SteelFamilySection
      id="vermicular"
      badge="Ferro Vermicular"
      title={<>Ferro Fundido <span className="text-gradient-molten">Vermicular</span></>}
      description="Ligas de grafita compactada (Série GGV / CGI). Estrutura inovadora combinando o amortecimento e condutividade do cinzento com a resistência mecânica do nodular."
      alloys={vermicularIrons}
    />
    <AlloysComparison />
  </>
);

export default Ferro;
