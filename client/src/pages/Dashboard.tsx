import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { callWebhook } from "@/lib/webhooks";
import { useToastNotification } from "@/components/Toast";
import FiltroSinistros from "@/components/FiltroSinistros";
import PainelIndicadores from "@/components/PainelIndicadores";
import GridSinistros from "@/components/GridSinistros";

interface KPIs {
  tempo_medio_dias?: number;
  dentro_prazo_percent?: number;
  ativos?: number;
  total_mes?: number;
}

interface ClaimListItem {
  id: string;
  placa: string;
  cpf_segurado: string;
  data_evento: string;
  local_evento_cidade: string;
  local_evento_uf: string;
  tipo_sinistro: string;
  status: string;
  franquia_prevista?: number;
  prob_pt?: number;
}

interface DashboardResponse {
  indicadores: KPIs;
  sinistros: ClaimListItem[];
}

export default function Dashboard() {
  const [filters, setFilters] = useState({
    data_inicio: "",
    data_fim: "",
    busca: "",
    status: "",
    periodo: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToastNotification();

  const { data: dashboardData, refetch } = useQuery<DashboardResponse>({
    queryKey: ["/api/dashboard", filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters.data_inicio) params.set('data_inicio', filters.data_inicio);
        if (filters.data_fim) params.set('data_fim', filters.data_fim);
        if (filters.busca) params.set('busca', filters.busca);
        if (filters.status) params.set('status', filters.status);
        if (filters.periodo) params.set('periodo', filters.periodo);
        
        const url = `/api/claims/dashboard?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('API not available, using mock data');
        }
        return response.json();
      } catch (error) {
        // Fallback para dados fictícios
        const { getDashboardData } = await import('@/lib/mockData');
        let data = getDashboardData();
        
        // Aplicar filtros básicos nos dados fictícios
        if (filters.status && filters.status !== '' && filters.status !== 'todos') {
          data.sinistros = data.sinistros.filter(claim => claim.status === filters.status);
        }
        if (filters.busca && filters.busca !== '') {
          data.sinistros = data.sinistros.filter(claim => 
            claim.placa.toLowerCase().includes(filters.busca.toLowerCase()) ||
            claim.cpf_segurado.includes(filters.busca)
          );
        }
        
        return data;
      }
    },
    enabled: true,
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await refetch();
      showSuccess("Dados atualizados com sucesso");
    } catch (error) {
      showError("Falha ao atualizar dados");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cor-fundo-site min-h-screen">
      {/* Header Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-8 container-gradient">
            <h1 className="text-4xl font-bold cor-titulo mb-2">Dashboard Sinistros</h1>
            <p className="cor-subtitulo text-lg">Visão geral e acesso rápido aos casos</p>
          </div>
        </div>
      </section>

      {/* Painel de Indicadores */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <PainelIndicadores kpis={dashboardData?.indicadores || {}} />
        </div>
      </section>

      {/* Filtros */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <FiltroSinistros 
            onFilterChange={handleFilterChange} 
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Grid de Sinistros */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <GridSinistros 
            claims={dashboardData?.sinistros || []}
            isLoading={isLoading}
            onRefresh={handleRefreshData}
          />
        </div>
      </section>

      {/* Help Section */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-6 container-gradient-dark">
            <p className="text-subtitle-dark text-center">
              Use os filtros por status e período para atualizar a visão. 
              Clique em "Ver Detalhes" em um sinistro para operar o caso.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
