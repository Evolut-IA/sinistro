import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Shield, User, Phone, Mail, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { callWebhook } from "@/lib/webhooks";
import { useToastNotification } from "@/components/Toast";
import UploaderMidia from "@/components/UploaderMidia";

const formTerceiroSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
});

type FormTerceiroData = z.infer<typeof formTerceiroSchema>;

interface TerceiroInfo {
  token: string;
  claim_id: string;
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  status: string;
  claim_info: {
    placa: string;
    data_evento: string;
    local_evento_cidade: string;
    local_evento_uf: string;
    tipo_sinistro: string;
    status: string;
  };
}

export default function PortalTerceiro() {
  const [location] = useLocation();
  const token = location.split("/terceiro/")[1];
  
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [step, setStep] = useState<'form' | 'upload' | 'complete'>('form');
  const { showSuccess, showError } = useToastNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<FormTerceiroData>({
    resolver: zodResolver(formTerceiroSchema),
    mode: "onChange"
  });

  // Validar token e buscar informações
  const { data: terceiroData, refetch } = useQuery({
    queryKey: ["terceiro-portal", token],
    queryFn: async () => {
      if (!token) throw new Error("Token não fornecido");
      
      try {
        const response = await fetch(`/api/terceiros/portal/${token}`);
        if (!response.ok) throw new Error("API não disponível");
        return response.json();
      } catch (error) {
        // Fallback para dados fictícios
        const { mockTerceiros, getClaimById } = await import('@/lib/mockData');
        
        const terceiro = mockTerceiros.find(t => t.token === token);
        if (!terceiro) throw new Error("Token inválido");
        
        const claim = getClaimById(terceiro.claim_id);
        if (!claim) throw new Error("Claim não encontrado");
        
        return {
          ...terceiro,
          claim_info: {
            placa: claim.placa,
            data_evento: claim.data_evento,
            local_evento_cidade: claim.local_evento_cidade,
            local_evento_uf: claim.local_evento_uf,
            tipo_sinistro: claim.tipo_sinistro,
            status: claim.status
          }
        };
      }
    },
    enabled: !!token,
  });

  // Pre-preencher formulário se já houver dados
  useEffect(() => {
    if (terceiroData && terceiroData.nome) {
      reset({
        nome: terceiroData.nome,
        cpf: terceiroData.cpf,
        email: terceiroData.email,
        telefone: terceiroData.telefone
      });
      setStep(terceiroData.status === 'dados_recebidos' ? 'upload' : 'form');
    }
  }, [terceiroData, reset]);

  const handleBtnEnviarFormTerceiro = async (data: FormTerceiroData) => {
    setIsLoadingSubmit(true);
    try {
      const response = await callWebhook("WH_TERCEIROS", {
        acao: "submit",
        token: token,
        ...data
      });
      
      if (response) {
        showSuccess("Dados enviados com sucesso!");
        setStep('upload');
        refetch();
      }
    } catch (error) {
      showError("Falha ao enviar dados do terceiro");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleBtnEnviarDocsTerceiro = async (arquivos: any[]) => {
    setIsLoadingUpload(true);
    try {
      const payload = {
        fonte: "terceiro",
        token: token,
        claim_id: terceiroData?.claim_id,
        arquivos: arquivos.map(arquivo => ({
          nome: arquivo.file.name,
          tipo: arquivo.tipo,
          size: arquivo.file.size,
          arquivo_url: `fake-url-terceiro-${arquivo.id}`
        }))
      };
      
      const response = await callWebhook("WH_ARQUIVOS_UPLOAD", payload);
      
      if (response) {
        showSuccess("Documentos enviados com sucesso!");
        setStep('complete');
      }
    } catch (error) {
      showError("Falha ao enviar documentos");
    } finally {
      setIsLoadingUpload(false);
    }
  };

  if (!token) {
    return (
      <div className="cor-fundo-site min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-400" size={64} />
          <h1 className="cor-titulo text-2xl mb-4">Token não fornecido</h1>
          <p className="cor-subtitulo">Acesso inválido ao portal do terceiro.</p>
        </div>
      </div>
    );
  }

  if (!terceiroData) {
    return (
      <div className="cor-fundo-site min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 no-outline">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-25"></div>
          </div>
          <h1 className="cor-titulo text-2xl mb-4">Validando acesso...</h1>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberto": return "bg-gray-600";
      case "estimado": return "bg-blue-600";
      case "autorizado_reparo": return "bg-green-600";
      case "perda_total": return "bg-red-600";
      case "concluido": return "bg-green-800";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="cor-fundo-site min-h-screen">
      {/* Header */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-8 container-gradient text-center">
            <Shield className="mx-auto mb-4 icon-gradient" size={64} />
            <h1 className="text-4xl font-bold cor-titulo mb-2">Portal do Terceiro</h1>
            <p className="cor-subtitulo text-lg">Envie seus dados e acompanhe o status do caso</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Informações do Caso */}
        <Card className="container-gradient mb-8 no-outline">
          <CardHeader>
            <CardTitle className="cor-titulo flex items-center gap-2">
              <FileText size={24} />
              Informações do Sinistro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="cor-subtitulo text-sm">Placa do Veículo</p>
                  <p className="cor-titulo font-semibold text-lg">{terceiroData.claim_info.placa}</p>
                </div>
                <div>
                  <p className="cor-subtitulo text-sm">Tipo de Sinistro</p>
                  <p className="cor-titulo">{terceiroData.claim_info.tipo_sinistro}</p>
                </div>
                <div>
                  <p className="cor-subtitulo text-sm">Local do Evento</p>
                  <p className="cor-titulo">
                    {terceiroData.claim_info.local_evento_cidade}, {terceiroData.claim_info.local_evento_uf}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="cor-subtitulo text-sm">Data do Evento</p>
                  <p className="cor-titulo">
                    {new Date(terceiroData.claim_info.data_evento).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="cor-subtitulo text-sm">Status do Caso</p>
                  <Badge className={`px-3 py-1 rounded text-sm font-medium text-white ${getStatusColor(terceiroData.claim_info.status)}`}>
                    {terceiroData.claim_info.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <p className="cor-subtitulo text-sm">Token de Acesso</p>
                  <p className="cor-titulo font-mono text-sm">{terceiroData.token}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Etapa 1: FormTerceiro */}
        {step === 'form' && (
          <Card className="container-gradient no-outline">
            <CardHeader>
              <CardTitle className="cor-titulo flex items-center gap-2">
                <User size={24} />
                Seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleBtnEnviarFormTerceiro)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="cor-titulo text-sm font-medium mb-2">
                      Nome Completo <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      {...register("nome")}
                      placeholder="Seu nome completo"
                      className="w-full px-3 py-2 rounded input-themed no-outline"
                      data-testid="input-nome"
                    />
                    {errors.nome && (
                      <p className="text-red-400 text-sm mt-1">{errors.nome.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="cor-titulo text-sm font-medium mb-2">
                      CPF <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      {...register("cpf")}
                      placeholder="12345678901"
                      className="w-full px-3 py-2 rounded input-themed no-outline"
                      data-testid="input-cpf"
                    />
                    {errors.cpf && (
                      <p className="text-red-400 text-sm mt-1">{errors.cpf.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="cor-titulo text-sm font-medium mb-2">
                      Email <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full px-3 py-2 rounded input-themed no-outline"
                      data-testid="input-email"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="cor-titulo text-sm font-medium mb-2">
                      Telefone <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      {...register("telefone")}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 rounded input-themed no-outline"
                      data-testid="input-telefone"
                    />
                    {errors.telefone && (
                      <p className="text-red-400 text-sm mt-1">{errors.telefone.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!isValid || isLoadingSubmit}
                    className="btn-gradient text-white font-medium rounded px-8"
                    data-testid="BtnEnviarFormTerceiro"
                  >
                    {isLoadingSubmit ? "Enviando..." : "Enviar Dados"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: UploaderDocsTerceiro */}
        {step === 'upload' && (
          <div className="space-y-8">
            <Card className="container-gradient no-outline">
              <CardHeader>
                <CardTitle className="cor-titulo">
                  ✅ Dados recebidos com sucesso!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="cor-subtitulo">
                  Agora você pode enviar documentos relacionados ao sinistro.
                </p>
              </CardContent>
            </Card>

            <Card className="container-gradient no-outline">
              <CardHeader>
                <CardTitle className="cor-titulo flex items-center gap-2">
                  <FileText size={24} />
                  Enviar Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UploaderMidia 
                  onUpload={handleBtnEnviarDocsTerceiro}
                  isLoading={isLoadingUpload}
                  maxFiles={5}
                />
                
                <div className="mt-6 p-4 bg-blue-900/30 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    💡 <strong>Dica:</strong> Envie fotos dos danos, documentos do veículo, 
                    boletim de ocorrência e outros documentos relevantes ao caso.
                  </p>
                </div>

                <div className="flex justify-center mt-6">
                  <Button
                    onClick={() => setStep('complete')}
                    variant="outline"
                    className="px-6 py-2 text-gray-400 font-medium rounded no-outline"
                  >
                    Finalizar sem Enviar Documentos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Etapa 3: Status do caso */}
        {step === 'complete' && (
          <Card className="container-gradient no-outline">
            <CardHeader>
              <CardTitle className="cor-titulo flex items-center gap-2">
                <CheckCircle className="text-green-400" size={24} />
                Processo Concluído
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="mx-auto mb-4 text-green-400" size={64} />
                <h3 className="cor-titulo text-xl font-semibold mb-4">
                  Obrigado pela colaboração!
                </h3>
                <p className="cor-subtitulo mb-6">
                  Seus dados e documentos foram enviados com sucesso. 
                  Acompanhe o status do sinistro através deste portal.
                </p>
                
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <h4 className="cor-titulo font-semibold mb-3">Status Atual do Caso</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="cor-subtitulo">Placa:</span>
                        <span className="cor-titulo font-semibold">{terceiroData.claim_info.placa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="cor-subtitulo">Status:</span>
                        <Badge className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(terceiroData.claim_info.status)}`}>
                          {terceiroData.claim_info.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-900/30 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    📞 Em caso de dúvidas, entre em contato conosco informando o token: 
                    <span className="font-mono bg-gray-800 px-2 py-1 rounded ml-2">{terceiroData.token}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
