import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import Microstructures from "@/components/sections/Microstructures";
import SteelAlloys from "@/components/sections/SteelAlloys";
import AlloysComparison from "@/components/sections/AlloysComparison";

const Ligas = () => (
  <Layout>
    <PageHeader
      title={<>Nossas Ligas <span className="text-gradient-molten">Metálicas</span></>}
      subtitle="Trabalhamos com ligas de ferro fundido — nodular, vermicular e cinzento — e aço carbono nas séries 1020, 1030 e 1045, atendendo aplicações estruturais e de alta exigência mecânica."
    />
    <Microstructures />
    <SteelAlloys />
    <AlloysComparison />
  </Layout>
);

export default Ligas;
