import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Calendar, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { callWebhook } from "@/lib/webhooks";
import { useToastNotification } from "@/components/Toast";

interface KPIsRelatorio {
  tempo_medio_dias: number;
  dentro_prazo_percent: number;
  total_por_status: {
    aberto: number;
    enviado: number;
    em_analise: number;
    aprovado: number;
    negado: number;
    concluido: number;
  };
}

interface AgregadoSeguradora {
  seguradora_nome: string;
  aberto: number;
  enviado: number;
  em_analise: number;
  aprovado: number;
  negado: number;
  concluido: number;
}

interface RelatorioData {
  kpis: KPIsRelatorio;
  agregados: AgregadoSeguradora[];
}

export default function Relatorios() {
  const [filters, setFilters] = useState({
    data_inicio: "",
    data_fim: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToastNotification();

  const { data: relatorioData, refetch } = useQuery<RelatorioData>({
    queryKey: ["/api/relatorios", filters],
    enabled: false,
  });

  const handleGerarRelatorio = async () => {
    if (!filters.data_inicio || !filters.data_fim) {
      showError("Selecione o período para gerar o relatório");
      return;
    }

    setIsLoading(true);
    try {
      const response = await callWebhook("WH_RELATORIO_GERAR_MENSAL", filters);
      if (response) {
        await refetch();
        showSuccess("Relatório atualizado");
      }
    } catch (error) {
      showError("Não foi possível gerar o relatório. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalSinistros = () => {
    if (!relatorioData?.kpis?.total_por_status) return 0;
    const totais = relatorioData.kpis.total_por_status;
    return totais.aberto + totais.enviado + totais.em_analise + totais.aprovado + totais.negado + totais.concluido;
  };

  return (
    <div className="cor-fundo-site min-h-screen">
      {/* Header Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-8 container-gradient-light">
            <h1 className="text-4xl font-bold text-dark-bg mb-2">Relatórios</h1>
            <p className="text-subtitle-light text-lg">Indicadores operacionais do período</p>
          </div>
        </div>
      </section>

      {/* Filter Period */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-6 container-gradient-light">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <Label className="block text-dark-bg text-sm font-medium mb-2">Data início</Label>
                <Input
                  type="date"
                  value={filters.data_inicio}
                  onChange={(e) => setFilters({...filters, data_inicio: e.target.value})}
                  className="px-3 py-2 rounded input-themed no-outline"
                  data-testid="input-data-inicio"
                />
              </div>
              <div>
                <Label className="block text-dark-bg text-sm font-medium mb-2">Data fim</Label>
                <Input
                  type="date"
                  value={filters.data_fim}
                  onChange={(e) => setFilters({...filters, data_fim: e.target.value})}
                  className="px-3 py-2 rounded input-themed no-outline"
                  data-testid="input-data-fim"
                />
              </div>
              <Button
                onClick={handleGerarRelatorio}
                disabled={isLoading}
                className="btn-gradient text-white font-medium rounded"
                data-testid="button-gerar-relatorio"
              >
                {isLoading ? "Calculando..." : "Calcular"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* KPI Card 1 */}
            <div className="rounded-lg p-6 container-gradient-light">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-dark-bg font-semibold">Tempo médio de liquidação</h3>
                <TrendingUp className="text-2xl icon-gradient" size={32} />
              </div>
              <div className="text-3xl font-bold text-dark-bg mb-2" data-testid="kpi-tempo-medio-liquidacao">
                {relatorioData?.kpis?.tempo_medio_dias || "--"}
              </div>
              <p className="text-subtitle-light text-sm">dias - Janeiro 2025</p>
            </div>

            {/* KPI Card 2 */}
            <div className="rounded-lg p-6 container-gradient-light">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-dark-bg font-semibold">% dentro do prazo</h3>
                <Calendar className="text-2xl icon-gradient" size={32} />
              </div>
              <div className="text-3xl font-bold text-dark-bg mb-2" data-testid="kpi-dentro-prazo-percent">
                {relatorioData?.kpis?.dentro_prazo_percent || "--"}%
              </div>
              <p className="text-subtitle-light text-sm">meta: 90% - Janeiro 2025</p>
            </div>

            {/* KPI Card 3 */}
            <div className="rounded-lg p-6 container-gradient-light">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-dark-bg font-semibold">Sinistros por status</h3>
                <CheckSquare className="text-2xl icon-gradient" size={32} />
              </div>
              <div className="text-3xl font-bold text-dark-bg mb-2" data-testid="kpi-total-sinistros">
                {getTotalSinistros() || "--"}
              </div>
              <p className="text-subtitle-light text-sm">total processados - Janeiro 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* Aggregated Table */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-6 container-gradient-light">
            <h3 className="text-dark-bg font-semibold mb-4">Dados por Seguradora</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="no-outline">
                    <th className="text-left py-3 px-4 text-dark-bg font-semibold">Seguradora</th>
                    <th className="text-center py-3 px-4 text-dark-bg font-semibold">Abertos</th>
                    <th className="text-center py-3 px-4 text-dark-bg font-semibold">Enviados</th>
                    <th className="text-center py-3 px-4 text-dark-bg font-semibold">Em análise</th>
                    <th className="text-center py-3 px-4 text-dark-bg font-semibold">Aprovados</th>
                    <th className="text-center py-3 px-4 text-dark-bg font-semibold">Negados</th>
                    <th className="text-center py-3 px-4 text-dark-bg font-semibold">Concluídos</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorioData?.agregados?.length ? (
                    relatorioData.agregados.map((seguradora, index) => (
                      <tr key={seguradora.seguradora_nome} className="no-outline" data-testid={`row-seguradora-${index}`}>
                        <td className="py-3 px-4 text-dark-bg font-medium">{seguradora.seguradora_nome}</td>
                        <td className="py-3 px-4 text-center text-dark-bg">{seguradora.aberto}</td>
                        <td className="py-3 px-4 text-center text-dark-bg">{seguradora.enviado}</td>
                        <td className="py-3 px-4 text-center text-dark-bg">{seguradora.em_analise}</td>
                        <td className="py-3 px-4 text-center text-dark-bg">{seguradora.aprovado}</td>
                        <td className="py-3 px-4 text-center text-dark-bg">{seguradora.negado}</td>
                        <td className="py-3 px-4 text-center text-dark-bg">{seguradora.concluido}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 px-4 text-center text-subtitle-light">
                        Nenhum dado disponível para o período selecionado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Observation */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-4 container-gradient-light">
            <p className="text-subtitle-light text-center text-sm">Os dados consideram apenas sinistros do período selecionado.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
