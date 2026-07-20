import { Link } from "react-router-dom";
import { Phone, Calendar } from "lucide-react";

const MobileActionBar = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-45 bg-background/80 backdrop-blur-lg border-t border-border/50 py-3 px-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex gap-3 max-w-md mx-auto">
        <a
          href="https://wa.me/5514991790555"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 border border-border/80 text-foreground bg-card/40 py-2.5 px-4 rounded-xl font-semibold uppercase text-xs tracking-wider transition-all duration-300 hover:bg-accent/5"
        >
          <Phone className="w-4 h-4 text-accent" />
          <span>Contato</span>
        </a>
        <Link
          to="/orcamento"
          className="flex-[2] flex items-center justify-center gap-2 gradient-molten text-accent-foreground py-2.5 px-4 rounded-xl font-semibold uppercase text-xs tracking-wider transition-all duration-300 hover:opacity-90 shadow-md shadow-accent/15"
        >
          <Calendar className="w-4 h-4" />
          <span>Solicitar Orçamento</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileActionBar;
