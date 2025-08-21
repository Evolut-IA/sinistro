import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, DollarSign, Clock, Wrench, Users, FileText, Calendar, MapPin, AlertTriangle, CheckCircle, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { callWebhook } from "@/lib/webhooks";
import { useToastNotification } from "@/components/Toast";
import TimelineSinistro from "@/components/TimelineSinistro";
import UploaderMidia from "@/components/UploaderMidia";

interface ClaimDetail {
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
  resumo?: string;
  created_at: string;
}

interface Estimativa {
  valor_estimado: number;
  horas_mo: number;
  prob_pt: number;
  resumo_json?: any;
  created_at: string;
}

interface Oficina {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  sla_medio_dias: number;
  score_qualidade: number;
}

interface Agenda {
  oficina_id: string;
  data_agendada?: string;
  status: string;
}

interface Terceiro {
  token: string;
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  status: string;
}

interface Arquivo {
  id: string;
  fonte: string;
  tipo: string;
  arquivo_url: string;
  metadados_json?: any;
  created_at: string;
}

export default function DetalheSinistro() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const claimId = searchParams.get("id");
  
  const [isLoading, setIsLoading] = useState(false);
  const [dataAgendamento, setDataAgendamento] = useState("");
  const { showSuccess, showError } = useToastNotification();

  // Buscar detalhes do claim
  const { data: claimData, refetch } = useQuery({
    queryKey: ["claim-detail", claimId],
    queryFn: async () => {
      if (!claimId) throw new Error("Claim ID não fornecido");
      
      try {
        const response = await fetch(`/api/claims/${claimId}`);
        if (!response.ok) throw new Error("API não disponível");
        return response.json();
      } catch (error) {
        // Fallback para dados fictícios
        const { 
          getClaimById, 
          getEstimativaByClaimId, 
          getOficinaById, 
          getAgendaByClaimId, 
          getTerceiroByClaimId, 
          getArquivosByClaimId, 
          getEventosLogByClaimId 
        } = await import('@/lib/mockData');
        
        const claim = getClaimById(claimId);
        if (!claim) throw new Error("Claim não encontrado");
        
        return {
          claim,
          estimativa: getEstimativaByClaimId(claimId),
          oficina: claim.oficina_id ? getOficinaById(claim.oficina_id) : null,
          agenda: getAgendaByClaimId(claimId),
          terceiro: getTerceiroByClaimId(claimId),
          arquivos: getArquivosByClaimId(claimId),
          eventos: getEventosLogByClaimId(claimId)
        };
      }
    },
    enabled: !!claimId,
  });

  if (!claimId) {
    return (
      <div className="cor-fundo-site min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="cor-titulo text-2xl mb-4">Claim ID não fornecido</h1>
          <Link href="/dashboard">
            <Button className="btn-gradient text-white">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!claimData) {
    return (
      <div className="cor-fundo-site min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="cor-titulo text-2xl mb-4">Carregando...</h1>
        </div>
      </div>
    );
  }

  const { claim, estimativa, oficina, agenda, terceiro, arquivos, eventos } = claimData;

  const handleBtnGerarEstimativaIA = async () => {
    setIsLoading(true);
    try {
      const response = await callWebhook("WH_ESTIMATIVA_GERAR", { claim_id: claimId });
      if (response) {
        showSuccess("Estimativa IA gerada com sucesso!");
        refetch();
      }
    } catch (error) {
      showError("Falha ao gerar estimativa IA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBtnSelecionarOficina = async () => {
    setIsLoading(true);
    try {
      const response = await callWebhook("WH_OFICINAS_ROTEAR_AGENDAR", { 
        acao: "match", 
        claim_id: claimId,
        uf: claim.local_evento_uf 
      });
      if (response) {
        showSuccess("Oficina selecionada com sucesso!");
        refetch();
      }
    } catch (error) {
      showError("Falha ao selecionar oficina");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBtnAgendarOficina = async () => {
    if (!dataAgendamento) {
      showError("Selecione uma data para agendamento");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await callWebhook("WH_OFICINAS_ROTEAR_AGENDAR", { 
        acao: "agendar", 
        claim_id: claimId,
        data: dataAgendamento 
      });
      if (response) {
        showSuccess("Agendamento confirmado com sucesso!");
        refetch();
      }
    } catch (error) {
      showError("Falha ao confirmar agendamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBtnAutorizarReparo = async () => {
    setIsLoading(true);
    try {
      const response = await callWebhook("WH_SINISTROS_STATUS", { 
        acao: "autorizar_reparo", 
        claim_id: claimId 
      });
      if (response) {
        showSuccess("Reparo autorizado com sucesso!");
        refetch();
      }
    } catch (error) {
      showError("Falha ao autorizar reparo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBtnMarcarPerdaTotal = async () => {
    setIsLoading(true);
    try {
      const response = await callWebhook("WH_SINISTROS_STATUS", { 
        acao: "marcar_pt", 
        claim_id: claimId 
      });
      if (response) {
        showSuccess("Perda total marcada com sucesso!");
        refetch();
      }
    } catch (error) {
      showError("Falha ao marcar perda total");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBtnGerarLinkTerceiro = async () => {
    setIsLoading(true);
    try {
      const response = await callWebhook("WH_TERCEIROS", { 
        acao: "gerar_link", 
        claim_id: claimId 
      });
      if (response) {
        showSuccess("Link do terceiro gerado com sucesso!");
        refetch();
      }
    } catch (error) {
      showError("Falha ao gerar link do terceiro");
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="cor-fundo-site min-h-screen">
      {/* Header com identificação e status */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-8 container-gradient">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <ArrowLeft size={20} />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl font-bold cor-titulo mb-2">Detalhe do Sinistro</h1>
                  <p className="cor-subtitulo text-lg">Operar o caso do intake à decisão</p>
                </div>
              </div>
              <Badge className={`px-4 py-2 rounded text-sm font-medium text-white ${getStatusBadgeColor(claim.status)}`}>
                {claim.status.replace("_", " ")}
              </Badge>
            </div>
            
            {/* Cabeçalho com identificação */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="cor-subtitulo text-sm">Claim ID</p>
                <p className="cor-titulo font-mono text-lg">{claim.id}</p>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="cor-subtitulo text-sm">Placa</p>
                <p className="cor-titulo font-semibold text-lg">{claim.placa}</p>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="cor-subtitulo text-sm">CPF Segurado</p>
                <p className="cor-titulo text-lg">{claim.cpf_segurado}</p>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="cor-subtitulo text-sm">Tipo</p>
                <p className="cor-titulo text-lg">{claim.tipo_sinistro}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bloco Estimativa */}
            <Card className="container-gradient no-outline">
              <CardHeader>
                <CardTitle className="cor-titulo flex items-center gap-2">
                  <DollarSign size={24} />
                  Estimativa IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                {estimativa ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="cor-subtitulo text-sm">Valor Estimado</p>
                        <p className="cor-titulo font-semibold text-lg">
                          {formatCurrency(estimativa.valor_estimado)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="cor-subtitulo text-sm">Horas M.O.</p>
                        <p className="cor-titulo font-semibold text-lg">{estimativa.horas_mo}h</p>
                      </div>
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="cor-subtitulo text-sm">Prob. PT</p>
                        <p className={`font-semibold text-lg ${estimativa.prob_pt > 0.7 ? 'text-red-400' : 'text-green-400'}`}>
                          {(estimativa.prob_pt * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <p className="cor-subtitulo text-sm">
                      Última estimativa: {new Date(estimativa.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="cor-subtitulo mb-4">Nenhuma estimativa gerada ainda</p>
                    <Button
                      onClick={handleBtnGerarEstimativaIA}
                      disabled={isLoading}
                      className="btn-gradient text-white"
                      data-testid="BtnGerarEstimativaIA"
                    >
                      {isLoading ? "Gerando..." : "Gerar Estimativa IA"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bloco Oficinas */}
            <Card className="container-gradient no-outline">
              <CardHeader>
                <CardTitle className="cor-titulo flex items-center gap-2">
                  <Wrench size={24} />
                  Oficinas e Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {oficina ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="cor-titulo font-semibold mb-2">{oficina.nome}</h4>
                      <p className="cor-subtitulo text-sm mb-1">
                        📍 {oficina.cidade}, {oficina.uf}
                      </p>
                      <p className="cor-subtitulo text-sm mb-1">
                        ⏱️ SLA médio: {oficina.sla_medio_dias} dias
                      </p>
                      <p className="cor-subtitulo text-sm">
                        ⭐ Qualidade: {oficina.score_qualidade}/100
                      </p>
                    </div>
                    
                    {agenda ? (
                      agenda.status === 'confirmado' ? (
                        <div className="p-4 bg-green-900/30 rounded-lg">
                          <p className="text-green-400 font-semibold mb-2">✅ Agendamento Confirmado</p>
                          <p className="cor-subtitulo">
                            Data: {agenda.data_agendada ? new Date(agenda.data_agendada).toLocaleString('pt-BR') : 'N/A'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="cor-subtitulo">⏳ Agendamento pendente - confirme a data:</p>
                          <div className="flex gap-3">
                            <Input
                              type="datetime-local"
                              value={dataAgendamento}
                              onChange={(e) => setDataAgendamento(e.target.value)}
                              className="flex-1 input-themed no-outline"
                            />
                            <Button
                              onClick={handleBtnAgendarOficina}
                              disabled={isLoading}
                              className="btn-gradient text-white"
                              data-testid="BtnAgendarOficina"
                            >
                              {isLoading ? "Confirmando..." : "Confirmar"}
                            </Button>
                          </div>
                        </div>
                      )
                    ) : (
                      <p className="cor-subtitulo">Oficina selecionada, mas sem agenda criada.</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="cor-subtitulo mb-4">Nenhuma oficina selecionada ainda</p>
                    <Button
                      onClick={handleBtnSelecionarOficina}
                      disabled={isLoading}
                      className="btn-gradient text-white"
                      data-testid="BtnSelecionarOficina"
                    >
                      {isLoading ? "Selecionando..." : "Selecionar Oficina"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ações de Status */}
            <Card className="container-gradient no-outline">
              <CardHeader>
                <CardTitle className="cor-titulo">Ações do Sinistro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {claim.status !== 'autorizado_reparo' && (
                    <Button
                      onClick={handleBtnAutorizarReparo}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      data-testid="BtnAutorizarReparo"
                    >
                      {isLoading ? "Autorizando..." : "Autorizar Reparo"}
                    </Button>
                  )}
                  
                  {claim.status !== 'perda_total' && estimativa && estimativa.prob_pt > 0.7 && (
                    <Button
                      onClick={handleBtnMarcarPerdaTotal}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      data-testid="BtnMarcarPerdaTotal"
                    >
                      {isLoading ? "Marcando..." : "Marcar Perda Total"}
                    </Button>
                  )}
                  
                  {!terceiro && (
                    <Button
                      onClick={handleBtnGerarLinkTerceiro}
                      disabled={isLoading}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      data-testid="BtnGerarLinkTerceiro"
                    >
                      {isLoading ? "Gerando..." : "Gerar Link Terceiro"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <TimelineSinistro claimId={claim.id} eventos={eventos || []} />
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-8">
            {/* Informações do Terceiro */}
            {terceiro && (
              <Card className="container-gradient no-outline">
                <CardHeader>
                  <CardTitle className="cor-titulo flex items-center gap-2">
                    <Users size={20} />
                    Terceiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="cor-subtitulo text-sm">Status</p>
                      <Badge className={terceiro.status === 'dados_recebidos' ? 'bg-green-600' : 'bg-yellow-600'}>
                        {terceiro.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {terceiro.nome ? (
                      <div className="space-y-2">
                        <div>
                          <p className="cor-subtitulo text-sm">Nome</p>
                          <p className="cor-titulo">{terceiro.nome}</p>
                        </div>
                        <div>
                          <p className="cor-subtitulo text-sm">CPF</p>
                          <p className="cor-titulo">{terceiro.cpf}</p>
                        </div>
                        <div>
                          <p className="cor-subtitulo text-sm">Email</p>
                          <p className="cor-titulo">{terceiro.email}</p>
                        </div>
                        <div>
                          <p className="cor-subtitulo text-sm">Telefone</p>
                          <p className="cor-titulo">{terceiro.telefone}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="cor-subtitulo text-sm mb-3">Link gerado, aguardando dados</p>
                        <div className="flex items-center gap-2 p-2 bg-gray-800 rounded text-sm">
                          <LinkIcon size={16} className="text-blue-400" />
                          <span className="cor-titulo font-mono">/terceiro/{terceiro.token}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documentos e Mídias */}
            <Card className="container-gradient no-outline">
              <CardHeader>
                <CardTitle className="cor-titulo flex items-center gap-2">
                  <FileText size={20} />
                  Documentos e Mídias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {arquivos && arquivos.length > 0 ? (
                  <div className="space-y-3">
                    {arquivos.map((arquivo) => (
                      <div key={arquivo.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                        <div>
                          <p className="cor-titulo text-sm font-medium">
                            {arquivo.metadados_json?.nome_arquivo || 'Arquivo'}
                          </p>
                          <p className="cor-subtitulo text-xs">
                            {arquivo.tipo} • {arquivo.fonte} • {new Date(arquivo.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-400">
                          Ver
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="cor-subtitulo text-center py-4">Nenhum arquivo anexado ainda</p>
                )}
                
                <div className="mt-4">
                  <UploaderMidia 
                    claimId={claim.id}
                    onUpload={async (files) => {
                      // Implementar upload adicional
                      showSuccess("Upload realizado!");
                      refetch();
                    }}
                    maxFiles={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informações Gerais */}
            <Card className="container-gradient no-outline">
              <CardHeader>
                <CardTitle className="cor-titulo">Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="cor-subtitulo" />
                    <span className="cor-subtitulo">Data do evento:</span>
                    <span className="cor-titulo">{new Date(claim.data_evento).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="cor-subtitulo" />
                    <span className="cor-subtitulo">Local:</span>
                    <span className="cor-titulo">{claim.local_evento_cidade}, {claim.local_evento_uf}</span>
                  </div>
                  {claim.franquia_prevista && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="cor-subtitulo" />
                      <span className="cor-subtitulo">Franquia:</span>
                      <span className="cor-titulo">{formatCurrency(claim.franquia_prevista)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="cor-subtitulo" />
                    <span className="cor-subtitulo">Criado em:</span>
                    <span className="cor-titulo">{new Date(claim.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                  {claim.resumo && (
                    <div className="mt-4">
                      <p className="cor-subtitulo text-sm mb-2">Resumo:</p>
                      <p className="cor-titulo text-sm">{claim.resumo}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}