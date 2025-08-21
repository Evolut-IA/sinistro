import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Wrench, Star, Clock, MapPin, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { callWebhook } from "@/lib/webhooks";
import { useToastNotification } from "@/components/Toast";

interface Oficina {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  sla_medio_dias: number;
  score_qualidade: number;
  distancia_km?: number;
  pontuacao?: number;
}

interface Cotacao {
  oficina_id: string;
  valor_estimado: number;
  prazo_dias: number;
  observacoes?: string;
}

export default function OficinasAgendamentos() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const claimId = searchParams.get("claim_id");
  
  const [isLoading, setIsLoading] = useState(false);
  const [oficinasSelecionadas, setOficinasSelecionadas] = useState<Oficina[]>([]);
  const [oficinaSelecionada, setOficinaSelecionada] = useState<string | null>(null);
  const [dataAgendamento, setDataAgendamento] = useState("");
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(false);
  const { showSuccess, showError } = useToastNotification();

  // Buscar dados do claim para contexto
  const { data: claimData } = useQuery({
    queryKey: ["claim-context", claimId],
    queryFn: async () => {
      if (!claimId) return null;
      
      try {
        const response = await fetch(`/api/claims/${claimId}`);
        if (!response.ok) throw new Error("API não disponível");
        return response.json();
      } catch (error) {
        // Fallback para dados fictícios
        const { getClaimById } = await import('@/lib/mockData');
        const claim = getClaimById(claimId);
        return claim ? { claim } : null;
      }
    },
    enabled: !!claimId,
  });

  const handleBtnRodarMatchOficina = async () => {
    if (!claimId || !claimData?.claim) {
      showError("Dados do claim não encontrados");
      return;
    }

    setIsLoading(true);
    try {
      const response = await callWebhook("WH_OFICINAS_ROTEAR_AGENDAR", {
        acao: "match",
        claim_id: claimId,
        uf: claimData.claim.local_evento_uf,
        cidade: claimData.claim.local_evento_cidade
      });
      
      if (response?.oficina_sugerida) {
        // Simular ranking de oficinas baseado na resposta
        const { mockOficinas } = await import('@/lib/mockData');
        const oficinasDisponiveis = mockOficinas
          .filter(o => o.uf === claimData.claim.local_evento_uf)
          .map(oficina => ({
            ...oficina,
            pontuacao: Math.round((oficina.score_qualidade * 0.6) + ((10 - oficina.sla_medio_dias) * 10 * 0.4)),
            distancia_km: Math.round(Math.random() * 50 + 5) // Simular distância
          }))
          .sort((a, b) => b.pontuacao! - a.pontuacao!);
          
        setOficinasSelecionadas(oficinasDisponiveis);
        showSuccess("Oficinas ranqueadas com sucesso!");
      }
    } catch (error) {
      showError("Falha ao executar match de oficinas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBtnConfirmarAgendamento = async () => {
    if (!oficinaSelecionada || !dataAgendamento) {
      showError("Selecione uma oficina e data para agendamento");
      return;
    }

    setIsLoading(true);
    try {
      const response = await callWebhook("WH_OFICINAS_ROTEAR_AGENDAR", {
        acao: "agendar",
        claim_id: claimId,
        oficina_id: oficinaSelecionada,
        data: dataAgendamento
      });
      
      if (response) {
        setAgendamentoConfirmado(true);
        showSuccess("Agendamento confirmado com sucesso!");
      }
    } catch (error) {
      showError("Falha ao confirmar agendamento");
    } finally {
      setIsLoading(false);
    }
  };

  if (!claimId) {
    return (
      <div className="cor-fundo-site min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="cor-titulo text-2xl mb-4">Claim ID não fornecido</h1>
          <p className="cor-subtitulo">Esta página requer um ID de claim válido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cor-fundo-site min-h-screen">
      {/* Header */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-8 container-gradient">
            <h1 className="text-4xl font-bold cor-titulo mb-2">Oficinas e Agendamentos</h1>
            <p className="cor-subtitulo text-lg">Escolher oficina e confirmar agenda de reparo</p>
            
            {claimData?.claim && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="cor-subtitulo">Claim ID</p>
                    <p className="cor-titulo font-mono">{claimId}</p>
                  </div>
                  <div>
                    <p className="cor-subtitulo">Placa</p>
                    <p className="cor-titulo font-semibold">{claimData.claim.placa}</p>
                  </div>
                  <div>
                    <p className="cor-subtitulo">Local</p>
                    <p className="cor-titulo">{claimData.claim.local_evento_cidade}, {claimData.claim.local_evento_uf}</p>
                  </div>
                  <div>
                    <p className="cor-subtitulo">Tipo</p>
                    <p className="cor-titulo">{claimData.claim.tipo_sinistro}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        {/* Ação para executar match */}
        {oficinasSelecionadas.length === 0 && !agendamentoConfirmado && (
          <Card className="container-gradient mb-8 no-outline">
            <CardHeader>
              <CardTitle className="cor-titulo flex items-center gap-2">
                <Wrench size={24} />
                Buscar Oficinas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="cor-subtitulo mb-6">
                  Execute o match de oficinas para encontrar as melhores opções 
                  baseadas na localização e qualidade.
                </p>
                <Button
                  onClick={handleBtnRodarMatchOficina}
                  disabled={isLoading}
                  className="btn-gradient text-white font-medium rounded px-8"
                  data-testid="BtnRodarMatchOficina"
                >
                  {isLoading ? "Buscando..." : "Rodar Match de Oficinas"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Oficinas */}
        {oficinasSelecionadas.length > 0 && !agendamentoConfirmado && (
          <div className="space-y-8">
            <Card className="container-gradient no-outline">
              <CardHeader>
                <CardTitle className="cor-titulo flex items-center gap-2">
                  <Wrench size={24} />
                  Oficinas Ranqueadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {oficinasSelecionadas.map((oficina, index) => (
                    <div 
                      key={oficina.id}
                      className={`p-4 rounded-lg transition-colors cursor-pointer no-outline ${
                        oficinaSelecionada === oficina.id 
                          ? 'bg-blue-900/20' 
                          : 'bg-gray-800'
                      }`}
                      onClick={() => setOficinaSelecionada(oficina.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-600 text-white">#{index + 1}</Badge>
                            <h3 className="cor-titulo font-semibold text-lg">{oficina.nome}</h3>
                            {oficina.pontuacao && (
                              <Badge className="bg-green-600 text-white">
                                {oficina.pontuacao} pts
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin size={16} className="cor-subtitulo" />
                              <span className="cor-subtitulo">{oficina.cidade}, {oficina.uf}</span>
                              {oficina.distancia_km && (
                                <span className="cor-subtitulo">• {oficina.distancia_km}km</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={16} className="cor-subtitulo" />
                              <span className="cor-subtitulo">SLA: {oficina.sla_medio_dias} dias</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star size={16} className="text-yellow-400" />
                              <span className="cor-titulo">{oficina.score_qualidade}/100</span>
                            </div>
                          </div>
                        </div>
                        {oficinaSelecionada === oficina.id && (
                          <CheckCircle className="text-blue-400" size={24} />
                        )}
                      </div>
                      
                      {/* Cotação resumida (simulada) */}
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 no-outline">
                        <div className="text-center p-2 bg-gray-700 rounded">
                          <p className="cor-subtitulo text-xs">Prazo Estimado</p>
                          <p className="cor-titulo font-semibold">{oficina.sla_medio_dias} dias</p>
                        </div>
                        <div className="text-center p-2 bg-gray-700 rounded">
                          <p className="cor-subtitulo text-xs">Valor Base</p>
                          <p className="cor-titulo font-semibold">R$ {(Math.random() * 5000 + 1000).toFixed(0)}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-700 rounded">
                          <p className="cor-subtitulo text-xs">Disponibilidade</p>
                          <p className="text-green-400 font-semibold">Imediata</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendário de Agendamento */}
            {oficinaSelecionada && (
              <Card className="container-gradient no-outline">
                <CardHeader>
                  <CardTitle className="cor-titulo flex items-center gap-2">
                    <Calendar size={24} />
                    Confirmar Agendamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-900/30 rounded-lg">
                      <p className="text-blue-200 text-sm">
                        Oficina selecionada: <span className="font-semibold">
                          {oficinasSelecionadas.find(o => o.id === oficinaSelecionada)?.nome}
                        </span>
                      </p>
                    </div>
                    
                    <div className="max-w-md">
                      <Label className="cor-titulo text-sm font-medium mb-2">
                        Data e Hora do Agendamento
                      </Label>
                      <Input
                        type="datetime-local"
                        value={dataAgendamento}
                        onChange={(e) => setDataAgendamento(e.target.value)}
                        className="w-full px-3 py-2 rounded input-themed no-outline"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        onClick={handleBtnConfirmarAgendamento}
                        disabled={isLoading || !dataAgendamento}
                        className="btn-gradient text-white font-medium rounded px-8"
                        data-testid="BtnConfirmarAgendamento"
                      >
                        {isLoading ? "Confirmando..." : "Confirmar Agendamento"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Agendamento Confirmado */}
        {agendamentoConfirmado && (
          <Card className="container-gradient border-gray-600">
            <CardHeader>
              <CardTitle className="cor-titulo flex items-center gap-2">
                <CheckCircle className="text-green-400" size={24} />
                Agendamento Confirmado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="mx-auto mb-4 text-green-400" size={64} />
                <h3 className="cor-titulo text-xl font-semibold mb-4">
                  Agendamento realizado com sucesso!
                </h3>
                
                <div className="max-w-md mx-auto space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <h4 className="cor-titulo font-semibold mb-3">Detalhes do Agendamento</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="cor-subtitulo">Oficina:</span>
                        <span className="cor-titulo font-semibold">
                          {oficinasSelecionadas.find(o => o.id === oficinaSelecionada)?.nome}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="cor-subtitulo">Data:</span>
                        <span className="cor-titulo">
                          {new Date(dataAgendamento).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="cor-subtitulo">Claim ID:</span>
                        <span className="cor-titulo font-mono">{claimId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="cor-subtitulo">Status:</span>
                        <Badge className="bg-green-600 text-white">Confirmado</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-900/30 rounded-lg">
                    <p className="text-blue-200 text-sm">
                      📞 A oficina entrará em contato em breve para confirmar os detalhes 
                      e orientações sobre o reparo.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    onClick={() => window.location.href = `/detalhe-do-sinistro?id=${claimId}`}
                    className="btn-gradient text-white font-medium rounded px-8"
                  >
                    Voltar aos Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
