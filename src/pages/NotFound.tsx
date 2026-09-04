import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-molten/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="text-center relative z-10 px-4">
        <h1 className="font-heading text-7xl sm:text-9xl font-bold text-gradient-molten mb-4">
          404
        </h1>
        <p className="text-xl sm:text-2xl text-foreground/60 mb-2 font-heading uppercase tracking-wider">
          Página não encontrada
        </p>
        <p className="text-sm text-foreground/40 mb-8 max-w-md mx-auto">
          A rota <code className="text-accent/60 bg-accent/5 px-2 py-0.5 rounded text-xs">{location.pathname}</code> não existe neste site.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 gradient-molten text-accent-foreground px-6 py-3 rounded-md font-semibold uppercase text-sm tracking-wider transition-all duration-300 hover:opacity-90 hover:scale-[1.02] shadow-md shadow-accent/10"
        >
          <ArrowLeft size={16} />
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
