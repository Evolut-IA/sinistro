import { Clock, Shield, List, TrendingUp } from "lucide-react";

interface KPIs {
  tempo_medio_dias?: number;
  dentro_prazo_percent?: number;
  ativos?: number;
  total_mes?: number;
}

interface PainelIndicadoresProps {
  kpis: KPIs;
}

export default function PainelIndicadores({ kpis }: PainelIndicadoresProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* KPI Card 1 - Tempo médio */}
      <div className="rounded-lg p-6 container-gradient">
        <div className="flex items-center justify-between mb-4">
          <h3 className="cor-titulo font-semibold">Tempo médio</h3>
          <Clock className="text-2xl icon-gradient" size={32} />
        </div>
        <div className="text-3xl font-bold cor-titulo mb-2" data-testid="kpi-tempo-medio">
          {kpis?.tempo_medio_dias || "--"}
        </div>
        <p className="cor-subtitulo text-sm">dias - Janeiro 2025</p>
      </div>

      {/* KPI Card 2 - % dentro do prazo */}
      <div className="rounded-lg p-6 container-gradient">
        <div className="flex items-center justify-between mb-4">
          <h3 className="cor-titulo font-semibold">% dentro do prazo</h3>
          <Shield className="text-2xl icon-gradient" size={32} />
        </div>
        <div className="text-3xl font-bold cor-titulo mb-2" data-testid="kpi-dentro-prazo">
          {kpis?.dentro_prazo_percent || "--"}%
        </div>
        <p className="cor-subtitulo text-sm">meta: 90% - Janeiro 2025</p>
      </div>

      {/* KPI Card 3 - Sinistros ativos */}
      <div className="rounded-lg p-6 container-gradient">
        <div className="flex items-center justify-between mb-4">
          <h3 className="cor-titulo font-semibold">Sinistros ativos</h3>
          <List className="text-2xl icon-gradient" size={32} />
        </div>
        <div className="text-3xl font-bold cor-titulo mb-2" data-testid="kpi-ativos">
          {kpis?.ativos || "--"}
        </div>
        <p className="cor-subtitulo text-sm">em análise - Janeiro 2025</p>
      </div>

      {/* KPI Card 4 - Total do mês */}
      <div className="rounded-lg p-6 container-gradient">
        <div className="flex items-center justify-between mb-4">
          <h3 className="cor-titulo font-semibold">Total do mês</h3>
          <TrendingUp className="text-2xl icon-gradient" size={32} />
        </div>
        <div className="text-3xl font-bold cor-titulo mb-2" data-testid="kpi-total-mes">
          {kpis?.total_mes || "--"}
        </div>
        <p className="cor-subtitulo text-sm">casos - Janeiro 2025</p>
      </div>
    </div>
  );
}
