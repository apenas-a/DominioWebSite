import Layout from "@/components/layout/Layout";
import Hero from "@/components/sections/Hero";
import TrustSignals from "@/components/sections/TrustSignals";
import About from "@/components/sections/About";
import HomeAlloys from "@/components/sections/HomeAlloys";
import HomeProcess from "@/components/sections/HomeProcess";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <TrustSignals />
      <About />
      <HomeAlloys />
      <HomeProcess />
    </Layout>
  );
};

export default Index;
