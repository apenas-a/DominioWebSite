import Layout from "@/components/layout/Layout";
import SteelFamilySection from "@/components/sections/SteelFamilySection";
import { carbonSteels, lowAlloySteels, highAlloySteels, stainlessSteels } from "@/data/steels";

const Aco = () => (
  <Layout>
    <SteelFamilySection
      id="carbono"
      badge="Aços Carbono"
      title={<>Catálogo Técnico: <span className="text-gradient-molten">Aços Carbono</span></>}
      description="Nossa linha de aços carbono (Séries 10xx) abrange desde o baixo carbono para altíssima tenacidade até o alto carbono para máxima dureza."
      alloys={carbonSteels}
      isFirst={true}
    />
    <SteelFamilySection
      id="baixa-liga"
      badge="Baixa Liga"
      title={<>Aços <span className="text-gradient-molten">Baixa Liga</span></>}
      description="Ligas das séries 4xxx e 8xxx, contendo Níquel, Cromo e Molibdênio. Extremamente tenazes, com alta temperabilidade, desenhadas para os esforços mais severos."
      alloys={lowAlloySteels}
    />
    <SteelFamilySection
      id="alta-liga"
      badge="Alta Liga"
      title={<>Aços de <span className="text-gradient-molten">Alta Liga</span></>}
      description="Aços ferramenta especialmente formulados para trabalho a quente e a frio. Alto teor de elementos de liga garantindo excepcional dureza, retenção de fio e resistência ao desgaste."
      alloys={highAlloySteels}
    />
    <SteelFamilySection
      id="inoxidavel"
      badge="Inoxidáveis"
      title={<>Aços <span className="text-gradient-molten">Inoxidáveis</span></>}
      description="Ligas de alta resistência à corrosão e oxidação, ideais para ambientes agressivos, indústria alimentícia, naval e médica."
      alloys={stainlessSteels}
    />
  </Layout>
);

export default Aco;
