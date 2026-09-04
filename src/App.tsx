import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
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
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/ferro" element={<Ferro />} />
            <Route path="/aco" element={<Aco />} />
            <Route path="/processo" element={<Processo />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/orcamento" element={<Orcamento />} />
          </Route>
          {/* /ligas redirects to /ferro to preserve external links */}
          <Route path="/ligas" element={<Navigate to="/ferro" replace />} />
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
