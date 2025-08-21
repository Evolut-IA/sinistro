import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { callWebhook } from "@/lib/webhooks";
import { useToastNotification } from "@/components/Toast";
import FormSinistro from "@/components/FormSinistro";
import UploaderMidia from "@/components/UploaderMidia";

interface FormData {
  placa: string;
  cpf_segurado: string;
  data_evento: string;
  local_evento_cidade: string;
  local_evento_uf: string;
  tipo_sinistro: string;
  resumo?: string;
}

interface ArquivoUpload {
  id: string;
  file: File;
  preview?: string;
  tipo: string;
}

export default function NovoSinistro() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'upload' | 'summary'>('form');
  const { showSuccess, showError } = useToastNotification();

  const handleBtnCriarSinistro = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await callWebhook("WH_SINISTROS_CRIAR", data);
      if (response?.claim_id) {
        setClaimId(response.claim_id);
        setStep('upload');
        showSuccess("Sinistro criado com sucesso! Agora você pode enviar mídias.");
      }
    } catch (error) {
      showError("Falha ao criar sinistro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBtnEnviarMidia = async (arquivos: ArquivoUpload[]) => {
    if (!claimId) return;
    
    setIsLoading(true);
    try {
      const payload = {
        claim_id: claimId,
        arquivos: arquivos.map(arquivo => ({
          nome: arquivo.file.name,
          tipo: arquivo.tipo,
          size: arquivo.file.size,
          // Em produção, aqui faria o upload real do arquivo
          arquivo_url: `fake-url-${arquivo.id}`
        }))
      };
      
      const response = await callWebhook("WH_ARQUIVOS_UPLOAD", payload);
      if (response) {
        showSuccess("Mídias enviadas com sucesso!");
        setStep('summary');
      }
    } catch (error) {
      showError("Falha ao enviar mídias.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBtnIrDetalhe = () => {
    if (claimId) {
      setLocation(`/detalhe-do-sinistro?id=${claimId}`);
    }
  };

  const handleCancel = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="cor-fundo-site min-h-screen">
      {/* Header Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-8 container-gradient">
            <h1 className="text-4xl font-bold cor-titulo mb-2">Novo Sinistro</h1>
            <p className="cor-subtitulo text-lg">Criar sinistro com dados básicos e anexos iniciais</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        {/* Etapa 1: FormSinistro */}
        {step === 'form' && (
          <div className="space-y-8">
            <FormSinistro 
              onSubmit={handleBtnCriarSinistro}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Etapa 2: UploaderMidia inicial */}
        {step === 'upload' && (
          <div className="space-y-8">
            <div className="rounded-lg p-6 container-gradient">
              <h3 className="cor-titulo font-semibold text-lg mb-4">
                ✅ Sinistro criado com sucesso!
              </h3>
              <p className="cor-subtitulo mb-4">
                Claim ID: <span className="cor-titulo font-mono">{claimId}</span>
              </p>
              <p className="cor-subtitulo">
                Agora você pode enviar mídias iniciais (fotos, documentos).
              </p>
            </div>
            
            <UploaderMidia 
              claimId={claimId || undefined}
              onUpload={handleBtnEnviarMidia}
              isLoading={isLoading}
            />
            
            <div className="flex justify-center">
              <Button
                onClick={() => setStep('summary')}
                variant="outline"
                className="px-6 py-2 text-gray-400 font-medium rounded no-outline"
              >
                Pular Upload
              </Button>
            </div>
          </div>
        )}

        {/* Etapa 3: Resumo antes do envio */}
        {step === 'summary' && (
          <div className="space-y-8">
            <div className="rounded-lg p-6 container-gradient">
              <h3 className="cor-titulo font-semibold text-lg mb-4">
                🎉 Processo Concluído!
              </h3>
              <div className="space-y-3">
                <p className="cor-subtitulo">
                  <strong className="cor-titulo">Claim ID:</strong> {claimId}
                </p>
                <p className="cor-subtitulo">
                  <strong className="cor-titulo">Status:</strong> Aberto
                </p>
                <p className="cor-subtitulo">
                  Sinistro criado e mídias enviadas com sucesso. 
                  Agora você pode acessar a página de detalhes para operar o caso.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="px-6 py-2 text-gray-400 font-medium rounded no-outline"
              >
                Voltar ao Dashboard
              </Button>
              <Button
                onClick={handleBtnIrDetalhe}
                className="btn-gradient text-white font-medium rounded px-8"
                data-testid="BtnIrDetalhe"
              >
                Ir para Detalhes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
