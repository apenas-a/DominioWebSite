import { Link } from "react-router-dom";
import logo from "@/assets/logo-fundacao-dominio.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    { to: "/", label: "Início" },
    { to: "/ferro", label: "Ferro" },
    { to: "/aco", label: "Aço" },
    { to: "/processo", label: "Processo" },
    { to: "/produtos", label: "Produtos" },
    { to: "/orcamento", label: "Orçamento" },
  ];

  return (
    <footer className="bg-card border-t border-border py-8 sm:py-14 relative">
      <div className="divider-molten absolute top-0 left-0 right-0" />
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <Link to="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-105">
            <img src={logo} alt="Fundição Domínio" className="h-12 w-auto" />
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.25em] text-accent/80 border-l border-border/50 pl-3">
              Fundição de<br />Ferro e Aço
            </span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-foreground/60 hover:text-accent transition-colors duration-300 text-xs sm:text-sm uppercase tracking-wider"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <p className="text-foreground/50 text-xs sm:text-sm text-center md:text-right">
            © {currentYear} Fundição Domínio.<br className="hidden md:block" /> Todos os direitos reservados.
          </p>
        </div>

        <div className="mt-6 pt-6 sm:mt-8 sm:pt-8 border-t border-border/50 text-center">
          <p className="text-foreground/40 text-[10px] sm:text-xs">
            Quintana - SP | contato@fundicaodominio.com.br | (14) 99179-0555
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
