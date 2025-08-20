import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Clock, Shield, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { callWebhook } from "@/lib/webhooks";
import { useToastNotification } from "@/components/Toast";

interface KPIs {
  tempo_medio_dias: number;
  dentro_prazo_percent: number;
  ativos: number;
}

interface SinistroListItem {
  id: string;
  protocolo: string | null;
  segurado_nome: string;
  placa: string;
  seguradora_nome: string;
  status: string;
  data_aviso: string;
  prazo_limite: string;
}

interface ListResponse {
  kpis: KPIs;
  lista: SinistroListItem[];
  paginacao: {
    pagina: number;
    total_paginas: number;
  };
}

export default function Dashboard() {
  const [filters, setFilters] = useState({
    data_inicio: "",
    data_fim: "",
    busca: "",
    status: [] as string[],
    seguradora: "",
    pagina: 1,
    tamanho_pagina: 10
  });

  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToastNotification();

  const { data: dashboardData, refetch } = useQuery<ListResponse>({
    queryKey: ["/api/dashboard", filters],
    enabled: true,
  });

  const handleUpdateList = async () => {
    setIsLoading(true);
    try {
      const response = await callWebhook("WH_SINISTRO_LIST", filters);
      if (response) {
        await refetch();
        showSuccess("Lista atualizada");
      }
    } catch (error) {
      showError("Falha ao obter lista");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "aberto": return "bg-gray-600";
      case "enviado": return "bg-blue-600";
      case "em_analise": return "bg-yellow-600";
      case "aprovado": return "bg-green-600";
      case "negado": return "bg-red-600";
      case "concluido": return "bg-green-800";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="cor-fundo-site min-h-screen">
      {/* Header Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-8 container-gradient">
            <h1 className="text-4xl font-bold cor-titulo mb-2">Dashboard de Sinistros</h1>
            <p className="cor-subtitulo text-lg">Acompanhe e gerencie o ciclo completo</p>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* KPI Card 1 */}
            <div className="rounded-lg p-6 container-gradient">
              <div className="flex items-center justify-between mb-4">
                <h3 className="cor-titulo font-semibold">Tempo médio</h3>
                <Clock className="text-2xl icon-gradient" size={32} />
              </div>
              <div className="text-3xl font-bold cor-titulo mb-2" data-testid="kpi-tempo-medio">
                {dashboardData?.kpis?.tempo_medio_dias || "--"}
              </div>
              <p className="cor-subtitulo text-sm">dias - Janeiro 2025</p>
            </div>

            {/* KPI Card 2 */}
            <div className="rounded-lg p-6 container-gradient">
              <div className="flex items-center justify-between mb-4">
                <h3 className="cor-titulo font-semibold">% dentro do prazo</h3>
                <Shield className="text-2xl icon-gradient" size={32} />
              </div>
              <div className="text-3xl font-bold cor-titulo mb-2" data-testid="kpi-dentro-prazo">
                {dashboardData?.kpis?.dentro_prazo_percent || "--"}%
              </div>
              <p className="cor-subtitulo text-sm">meta: 90% - Janeiro 2025</p>
            </div>

            {/* KPI Card 3 */}
            <div className="rounded-lg p-6 container-gradient">
              <div className="flex items-center justify-between mb-4">
                <h3 className="cor-titulo font-semibold">Sinistros ativos</h3>
                <List className="text-2xl icon-gradient" size={32} />
              </div>
              <div className="text-3xl font-bold cor-titulo mb-2" data-testid="kpi-ativos">
                {dashboardData?.kpis?.ativos || "--"}
              </div>
              <p className="cor-subtitulo text-sm">em análise - Janeiro 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-6 mb-8 container-gradient">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <div>
                <Label className="cor-titulo text-sm font-medium mb-2">Data início</Label>
                <Input
                  type="date"
                  value={filters.data_inicio}
                  onChange={(e) => setFilters({...filters, data_inicio: e.target.value})}
                  className="w-full px-3 py-2 cor-fundo-site border border-gray-600 rounded cor-titulo"
                  data-testid="input-data-inicio"
                />
              </div>
              <div>
                <Label className="cor-titulo text-sm font-medium mb-2">Data fim</Label>
                <Input
                  type="date"
                  value={filters.data_fim}
                  onChange={(e) => setFilters({...filters, data_fim: e.target.value})}
                  className="w-full px-3 py-2 bg-dark border border-gray-600 rounded text-white"
                  data-testid="input-data-fim"
                />
              </div>
              <div>
                <Label className="text-white text-sm font-medium mb-2">Busca texto</Label>
                <Input
                  type="text"
                  placeholder="Segurado, placa..."
                  value={filters.busca}
                  onChange={(e) => setFilters({...filters, busca: e.target.value})}
                  className="w-full px-3 py-2 bg-dark border border-gray-600 rounded text-white"
                  data-testid="input-busca"
                />
              </div>
              <div>
                <Label className="text-white text-sm font-medium mb-2">Status</Label>
                <Select>
                  <SelectTrigger className="w-full px-3 py-2 bg-dark border border-gray-600 rounded text-white" data-testid="select-status">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="em_analise">Em análise</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="negado">Negado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white text-sm font-medium mb-2">Seguradora</Label>
                <Input
                  type="text"
                  placeholder="Nome da seguradora"
                  value={filters.seguradora}
                  onChange={(e) => setFilters({...filters, seguradora: e.target.value})}
                  className="w-full px-3 py-2 bg-dark border border-gray-600 rounded text-white"
                  data-testid="input-seguradora"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleUpdateList}
                  disabled={isLoading}
                  className="w-full btn-gradient text-white font-medium rounded"
                  data-testid="button-atualizar-lista"
                >
                  {isLoading ? "Atualizando..." : "Atualizar Lista"}
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/novo-sinistro">
                <Button className="btn-gradient text-white font-medium rounded" data-testid="button-novo-sinistro">
                  Novo Sinistro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Claims Table */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-6 container-gradient">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 cor-titulo font-semibold">Número</th>
                    <th className="text-left py-3 px-4 cor-titulo font-semibold">Segurado</th>
                    <th className="text-left py-3 px-4 cor-titulo font-semibold">Placa</th>
                    <th className="text-left py-3 px-4 cor-titulo font-semibold">Seguradora</th>
                    <th className="text-left py-3 px-4 cor-titulo font-semibold">Status</th>
                    <th className="text-left py-3 px-4 cor-titulo font-semibold">Data de aviso</th>
                    <th className="text-left py-3 px-4 cor-titulo font-semibold">Prazo limite</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.lista?.length ? (
                    dashboardData.lista.map((sinistro) => (
                      <tr
                        key={sinistro.id}
                        className="border-b border-gray-700 cursor-pointer"
                        data-testid={`row-sinistro-${sinistro.id}`}
                      >
                        <Link href={`/detalhe-do-sinistro?id=${sinistro.id}`}>
                          <td className="py-3 px-4 text-subtitle-dark">{sinistro.protocolo || "—"}</td>
                          <td className="py-3 px-4 text-white">{sinistro.segurado_nome}</td>
                          <td className="py-3 px-4 text-white">{sinistro.placa}</td>
                          <td className="py-3 px-4 text-white">{sinistro.seguradora_nome}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusBadgeColor(sinistro.status)}`}>
                              {sinistro.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white">{new Date(sinistro.data_aviso).toLocaleDateString("pt-BR")}</td>
                          <td className="py-3 px-4 text-white">{new Date(sinistro.prazo_limite).toLocaleDateString("pt-BR")}</td>
                        </Link>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 px-4 text-center text-subtitle-dark">
                        Nenhum sinistro encontrado. Use os filtros para carregar dados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {dashboardData?.paginacao && (
              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  disabled={dashboardData.paginacao.pagina <= 1}
                  className="text-subtitle-dark font-medium rounded border border-gray-600"
                  data-testid="button-anterior"
                >
                  Anterior
                </Button>
                <span className="text-white" data-testid="text-paginacao">
                  Página {dashboardData.paginacao.pagina} de {dashboardData.paginacao.total_paginas}
                </span>
                <Button
                  disabled={dashboardData.paginacao.pagina >= dashboardData.paginacao.total_paginas}
                  className="btn-gradient text-white font-medium rounded"
                  data-testid="button-proxima"
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-6 container-gradient-dark">
            <p className="text-subtitle-dark text-center">Use os filtros para atualizar a visão. Clique em um sinistro para operar o caso.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
