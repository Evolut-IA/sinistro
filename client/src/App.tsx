import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NovoSinistro from "./pages/NovoSinistro";
import DetalheSinistro from "./pages/DetalheSinistro";
import PortalTerceiro from "./pages/PortalTerceiro";
import OficinasAgendamentos from "./pages/OficinasAgendamentos";
import Relatorios from "./pages/Relatorios";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Rotas com Layout */}
      <Route path="/" component={() => <Layout><Dashboard /></Layout>} />
      <Route path="/dashboard" component={() => <Layout><Dashboard /></Layout>} />
      <Route path="/novo-sinistro" component={() => <Layout><NovoSinistro /></Layout>} />
      <Route path="/detalhe-do-sinistro" component={() => <Layout><DetalheSinistro /></Layout>} />
      <Route path="/oficinas-agendamentos" component={() => <Layout><OficinasAgendamentos /></Layout>} />
      <Route path="/relatorios" component={() => <Layout><Relatorios /></Layout>} />
      
      {/* Portal do Terceiro - sem layout */}
      <Route path="/terceiro/:token" component={PortalTerceiro} />
      
      {/* 404 */}
      <Route component={() => <Layout><NotFound /></Layout>} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
