import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Car, AlertTriangle } from "lucide-react";

interface ClaimItem {
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

interface CardSinistroProps {
  claim: ClaimItem;
  onIrDetalhe: () => void;
}

export default function CardSinistro({ claim, onIrDetalhe }: CardSinistroProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "aberto": return "bg-gray-600";
      case "estimado": return "bg-blue-600";
      case "autorizado_reparo": return "bg-green-600";
      case "perda_total": return "bg-red-600";
      case "negado": return "bg-red-800";
      case "concluido": return "bg-green-800";
      default: return "bg-gray-600";
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="rounded-lg p-4 container-gradient transition-colors no-outline">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Car className="icon-gradient" size={20} />
          <span className="cor-titulo font-semibold">{claim.placa}</span>
        </div>
        <Badge className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusBadgeColor(claim.status)}`}>
          {claim.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="cor-subtitulo" size={16} />
          <span className="cor-subtitulo">
            {new Date(claim.data_evento).toLocaleDateString("pt-BR")}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="cor-subtitulo" size={16} />
          <span className="cor-subtitulo">
            {claim.local_evento_cidade}, {claim.local_evento_uf}
          </span>
        </div>

        <div className="text-sm">
          <span className="cor-subtitulo">Tipo: </span>
          <span className="cor-titulo">{claim.tipo_sinistro}</span>
        </div>

        <div className="text-sm">
          <span className="cor-subtitulo">CPF: </span>
          <span className="cor-titulo">{claim.cpf_segurado}</span>
        </div>

        {claim.franquia_prevista && (
          <div className="text-sm">
            <span className="cor-subtitulo">Franquia: </span>
            <span className="cor-titulo">{formatCurrency(claim.franquia_prevista)}</span>
          </div>
        )}

        {claim.prob_pt && claim.prob_pt > 0.7 && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle size={16} />
            <span>Alto risco PT ({(claim.prob_pt * 100).toFixed(0)}%)</span>
          </div>
        )}
      </div>

      <Button
        onClick={onIrDetalhe}
        className="w-full btn-gradient text-white font-medium rounded"
        data-testid="BtnIrDetalhe"
      >
        Ver Detalhes
      </Button>
    </div>
  );
}
