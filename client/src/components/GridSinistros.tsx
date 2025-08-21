import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import CardSinistro from "./CardSinistro";

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

interface GridSinistrosProps {
  claims: ClaimItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function GridSinistros({ claims, isLoading, onRefresh }: GridSinistrosProps) {
  const [, setLocation] = useLocation();

  const handleBtnIrDetalhe = (claimId: string) => {
    setLocation(`/detalhe-do-sinistro?id=${claimId}`);
  };

  const handleBtnAtualizarLista = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="rounded-lg p-6 container-gradient">
      <div className="flex justify-between items-center mb-6">
        <h3 className="cor-titulo font-semibold text-lg">Lista de Sinistros</h3>
        <Button
          onClick={handleBtnAtualizarLista}
          disabled={isLoading}
          className="btn-gradient text-white font-medium rounded"
          data-testid="BtnAtualizarLista"
        >
          {isLoading ? "Atualizando..." : "Atualizar Lista"}
        </Button>
      </div>

      {claims && claims.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {claims.map((claim) => (
            <CardSinistro 
              key={claim.id} 
              claim={claim} 
              onIrDetalhe={() => handleBtnIrDetalhe(claim.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="cor-subtitulo text-lg mb-4">
            {isLoading ? "Carregando sinistros..." : "Nenhum sinistro encontrado"}
          </p>
          <p className="cor-subtitulo text-sm">
            Use os filtros para carregar dados ou verifique sua conexão.
          </p>
        </div>
      )}
    </div>
  );
}
