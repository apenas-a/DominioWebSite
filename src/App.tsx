import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Ferro from "./pages/Ferro";
import Aco from "./pages/Aco";
import Processo from "./pages/Processo";
import Produtos from "./pages/Produtos";
import Orcamento from "./pages/Orcamento";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ferro" element={<Ferro />} />
          <Route path="/aco" element={<Aco />} />
          {/* /ligas redirects to /ferro to preserve external links */}
          <Route path="/ligas" element={<Navigate to="/ferro" replace />} />
          <Route path="/processo" element={<Processo />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/orcamento" element={<Orcamento />} />
          {/* Redirecionamentos de rotas antigas */}
          <Route path="/sobre" element={<Navigate to="/" replace />} />
          <Route path="/contato" element={<Navigate to="/" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
