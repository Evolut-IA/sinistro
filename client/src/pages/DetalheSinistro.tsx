import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Paperclip, Send, AlertTriangle, Flag, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { callWebhook } from "@/lib/webhooks";
import { useToastNotification } from "@/components/Toast";
import type { Sinistro, Documento, Pendencia, Andamento } from "@shared/schema";

export default function DetalheSinistro() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const sinistroId = searchParams.get("id");

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pendenciaModalOpen, setPendenciaModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [motivoStatus, setMotivoStatus] = useState("");

  // Upload document form state
  const [uploadForm, setUploadForm] = useState({
    tipo_documento: "",
    arquivo_base64: "",
    mime_type: "",
    nome_arquivo: "",
  });

  // Pendência form state
  const [pendenciaForm, setPendenciaForm] = useState({
    descricao: "",
    solicitada_por: "",
  });

  const { showSuccess, showError } = useToastNotification();

  const { data: sinistro } = useQuery<Sinistro>({
    queryKey: ["/api/sinistros", sinistroId],
    enabled: !!sinistroId,
  });

  const { data: documentos } = useQuery<Documento[]>({
    queryKey: ["/api/documentos", sinistroId],
    enabled: !!sinistroId,
  });

  const { data: pendencias } = useQuery<Pendencia[]>({
    queryKey: ["/api/pendencias", sinistroId],
    enabled: !!sinistroId,
  });

  const { data: andamentos } = useQuery<Andamento[]>({
    queryKey: ["/api/andamentos", sinistroId],
    enabled: !!sinistroId,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setUploadForm({
          ...uploadForm,
          arquivo_base64: base64.split(",")[1], // Remove data:type;base64, prefix
          mime_type: file.type,
          nome_arquivo: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!sinistroId || !uploadForm.tipo_documento || !uploadForm.arquivo_base64) {
      showError("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      await callWebhook("WH_DOC_UPLOAD", {
        sinistro_id: sinistroId,
        ...uploadForm,
      });
      showSuccess("Documento anexado");
      setUploadModalOpen(false);
      setUploadForm({
        tipo_documento: "",
        arquivo_base64: "",
        mime_type: "",
        nome_arquivo: "",
      });
    } catch (error) {
      showError("Erro ao anexar documento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnviarAviso = async () => {
    if (!sinistroId) return;

    setIsLoading(true);
    try {
      await callWebhook("WH_SINISTRO_ENVIAR_AVISO", { sinistro_id: sinistroId });
      showSuccess("Aviso enviado");
    } catch (error) {
      showError("Erro ao enviar aviso");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAtualizarStatus = async () => {
    if (!sinistroId || !selectedStatus) {
      showError("Selecione um status");
      return;
    }

    setIsLoading(true);
    try {
      await callWebhook("WH_SINISTRO_UPDATE_STATUS", {
        sinistro_id: sinistroId,
        novo_status: selectedStatus,
        motivo_opcional: motivoStatus,
      });
      showSuccess("Status atualizado");
    } catch (error) {
      showError("Erro ao atualizar status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCriarPendencia = async () => {
    if (!sinistroId || !pendenciaForm.descricao || !pendenciaForm.solicitada_por) {
      showError("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      await callWebhook("WH_PENDENCIA_CREATE", {
        sinistro_id: sinistroId,
        ...pendenciaForm,
      });
      showSuccess("Pendência criada");
      setPendenciaModalOpen(false);
      setPendenciaForm({ descricao: "", solicitada_por: "" });
    } catch (error) {
      showError("Erro ao criar pendência");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConcluirSinistro = async () => {
    if (!sinistroId) return;

    setIsLoading(true);
    try {
      await callWebhook("WH_SINISTRO_CLOSE", { sinistro_id: sinistroId });
      showSuccess("Sinistro concluído");
    } catch (error) {
      showError("Erro ao concluir sinistro");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDaysRemaining = (prazoLimite: string) => {
    const today = new Date();
    const limite = new Date(prazoLimite);
    const diffTime = limite.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!sinistroId) {
    return (
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="container-gradient-dark rounded-lg p-8">
          <p className="text-white text-center">ID do sinistro não fornecido</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cor-fundo-site min-h-screen">
      {/* Header Section with Claim Info */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-8 container-gradient-dark">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2">
                <h1 className="text-4xl font-bold text-white mb-2">Sinistro</h1>
                <p className="text-subtitle-dark text-lg mb-6" data-testid="text-segurado">
                  {sinistro?.segurado_nome || "Carregando..."}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-subtitle-dark text-sm">Protocolo</p>
                    <p className="text-white font-medium" data-testid="text-protocolo">
                      {sinistro?.protocolo || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-subtitle-dark text-sm">Seguradora</p>
                    <p className="text-white font-medium" data-testid="text-seguradora">
                      {sinistro?.seguradora_nome || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-subtitle-dark text-sm">Placa</p>
                    <p className="text-white font-medium" data-testid="text-placa">
                      {sinistro?.placa || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-subtitle-dark text-sm">Tipo</p>
                    <p className="text-white font-medium" data-testid="text-tipo">
                      {sinistro?.tipo_sinistro || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-subtitle-dark text-sm">Status</p>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-600 text-white" data-testid="text-status">
                      {sinistro?.status || "—"}
                    </span>
                  </div>
                  <div>
                    <p className="text-subtitle-dark text-sm">Data de aviso</p>
                    <p className="text-white font-medium" data-testid="text-data-aviso">
                      {sinistro?.data_aviso ? new Date(sinistro.data_aviso).toLocaleDateString("pt-BR") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-subtitle-dark text-sm">Prazo limite</p>
                    <p className="text-white font-medium" data-testid="text-prazo-limite">
                      {sinistro?.prazo_limite ? new Date(sinistro.prazo_limite).toLocaleDateString("pt-BR") : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* SLA Indicator */}
              <div className="flex items-center justify-center">
                <div className="text-center p-6 rounded-lg bg-yellow-900 border border-yellow-700">
                  <div className="text-3xl font-bold text-yellow-300 mb-2" data-testid="text-dias-restantes">
                    {sinistro?.prazo_limite ? calculateDaysRemaining(sinistro.prazo_limite) : "--"}
                  </div>
                  <p className="text-yellow-200 text-sm">dias restantes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-6 container-gradient-dark">
            <div className="flex flex-wrap gap-4 justify-center">
              <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-gradient text-white font-medium rounded flex items-center" data-testid="button-adicionar-documento">
                    <Paperclip className="mr-2" size={16} />
                    Adicionar Documento
                  </Button>
                </DialogTrigger>
                <DialogContent className="container-gradient-dark">
                  <DialogHeader>
                    <DialogTitle className="text-white">Anexar Documento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white text-sm font-medium">Tipo de documento *</Label>
                      <Select value={uploadForm.tipo_documento} onValueChange={(value) => setUploadForm({...uploadForm, tipo_documento: value})}>
                        <SelectTrigger className="w-full bg-dark border border-gray-600 text-white" data-testid="select-tipo-documento">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bo">Boletim de Ocorrência</SelectItem>
                          <SelectItem value="cnh">CNH</SelectItem>
                          <SelectItem value="crlv">CRLV</SelectItem>
                          <SelectItem value="fotos_danos">Fotos dos danos</SelectItem>
                          <SelectItem value="orcamento">Orçamento</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white text-sm font-medium">Arquivo *</Label>
                      <Input
                        type="file"
                        onChange={handleFileUpload}
                        className="w-full bg-dark border border-gray-600 text-white"
                        data-testid="input-arquivo"
                      />
                      <p className="text-subtitle-dark text-xs mt-1">Máximo 10MB</p>
                    </div>
                    <div>
                      <Label className="text-white text-sm font-medium">Nome do arquivo *</Label>
                      <Input
                        value={uploadForm.nome_arquivo}
                        onChange={(e) => setUploadForm({...uploadForm, nome_arquivo: e.target.value})}
                        placeholder="documento.pdf"
                        className="w-full bg-dark border border-gray-600 text-white"
                        data-testid="input-nome-arquivo"
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button variant="outline" onClick={() => setUploadModalOpen(false)} data-testid="button-cancelar-upload">
                        Cancelar
                      </Button>
                      <Button onClick={handleUploadDocument} disabled={isLoading} className="btn-gradient" data-testid="button-anexar">
                        {isLoading ? "Anexando..." : "Anexar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={handleEnviarAviso} disabled={isLoading} className="btn-gradient text-white font-medium rounded flex items-center" data-testid="button-enviar-aviso">
                <Send className="mr-2" size={16} />
                {isLoading ? "Preparando..." : "Enviar Aviso"}
              </Button>

              <Dialog open={pendenciaModalOpen} onOpenChange={setPendenciaModalOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-gradient text-white font-medium rounded flex items-center" data-testid="button-criar-pendencia">
                    <AlertTriangle className="mr-2" size={16} />
                    Criar Pendência
                  </Button>
                </DialogTrigger>
                <DialogContent className="container-gradient-dark">
                  <DialogHeader>
                    <DialogTitle className="text-white">Criar Pendência</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white text-sm font-medium">Descrição *</Label>
                      <Textarea
                        value={pendenciaForm.descricao}
                        onChange={(e) => setPendenciaForm({...pendenciaForm, descricao: e.target.value})}
                        rows={3}
                        placeholder="Descreva a pendência..."
                        className="w-full bg-dark border border-gray-600 text-white"
                        data-testid="textarea-descricao-pendencia"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm font-medium">Solicitada por *</Label>
                      <Select value={pendenciaForm.solicitada_por} onValueChange={(value) => setPendenciaForm({...pendenciaForm, solicitada_por: value})}>
                        <SelectTrigger className="w-full bg-dark border border-gray-600 text-white" data-testid="select-solicitada-por">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corretor">Corretor</SelectItem>
                          <SelectItem value="seguradora">Seguradora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button variant="outline" onClick={() => setPendenciaModalOpen(false)} data-testid="button-cancelar-pendencia">
                        Cancelar
                      </Button>
                      <Button onClick={handleCriarPendencia} disabled={isLoading} className="btn-gradient" data-testid="button-confirmar-pendencia">
                        {isLoading ? "Criando..." : "Criar Pendência"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="btn-gradient text-white font-medium rounded flex items-center" data-testid="button-concluir">
                    <Flag className="mr-2" size={16} />
                    Concluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="container-gradient-dark">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Concluir Sinistro</AlertDialogTitle>
                    <AlertDialogDescription className="text-subtitle-dark">
                      Deseja concluir este sinistro? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-subtitle-dark border-gray-600">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConcluirSinistro} className="btn-gradient" data-testid="button-confirmar-conclusao">
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </section>

      {/* Status Selector */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-6 container-gradient-dark">
            <h3 className="text-white font-semibold mb-4">Atualizar Status</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-dark border border-gray-600 text-white" data-testid="select-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="em_analise">Em análise</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="negado">Negado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={motivoStatus}
                onChange={(e) => setMotivoStatus(e.target.value)}
                placeholder="Motivo (opcional)"
                className="bg-dark border border-gray-600 text-white flex-1 max-w-md"
                data-testid="input-motivo-status"
              />
              <Button onClick={handleAtualizarStatus} disabled={isLoading} className="btn-gradient text-white font-medium rounded flex items-center" data-testid="button-atualizar-status">
                <RotateCcw className="mr-2" size={16} />
                {isLoading ? "Atualizando..." : "Atualizar Status"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Documents List */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-6 container-gradient-dark">
            <h3 className="text-white font-semibold mb-4">Documentos Anexados</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 px-4 text-white font-medium">Tipo</th>
                    <th className="text-left py-2 px-4 text-white font-medium">Nome do arquivo</th>
                    <th className="text-left py-2 px-4 text-white font-medium">Tipo MIME</th>
                    <th className="text-left py-2 px-4 text-white font-medium">Recebido em</th>
                  </tr>
                </thead>
                <tbody>
                  {documentos?.length ? (
                    documentos.map((documento) => (
                      <tr key={documento.id} className="border-b border-gray-700" data-testid={`row-documento-${documento.id}`}>
                        <td className="py-2 px-4 text-white">{documento.tipo_documento}</td>
                        <td className="py-2 px-4 text-white">{documento.nome_arquivo}</td>
                        <td className="py-2 px-4 text-subtitle-dark">{documento.mime_type}</td>
                        <td className="py-2 px-4 text-subtitle-dark">
                          {new Date(documento.recebido_em).toLocaleDateString("pt-BR")} {new Date(documento.recebido_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center text-subtitle-dark">
                        Nenhum documento anexado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Pendências List */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-6 container-gradient-dark">
            <h3 className="text-white font-semibold mb-4">Pendências</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 px-4 text-white font-medium">Descrição</th>
                    <th className="text-left py-2 px-4 text-white font-medium">Solicitada por</th>
                    <th className="text-left py-2 px-4 text-white font-medium">Status</th>
                    <th className="text-left py-2 px-4 text-white font-medium">Criada em</th>
                    <th className="text-left py-2 px-4 text-white font-medium">Resolvida em</th>
                  </tr>
                </thead>
                <tbody>
                  {pendencias?.length ? (
                    pendencias.map((pendencia) => (
                      <tr key={pendencia.id} className="border-b border-gray-700" data-testid={`row-pendencia-${pendencia.id}`}>
                        <td className="py-2 px-4 text-white">{pendencia.descricao}</td>
                        <td className="py-2 px-4 text-white">{pendencia.solicitada_por}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${pendencia.status === 'resolvida' ? 'bg-green-600' : 'bg-red-600'}`}>
                            {pendencia.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-subtitle-dark">
                          {new Date(pendencia.criada_em).toLocaleDateString("pt-BR")} {new Date(pendencia.criada_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-2 px-4 text-subtitle-dark">
                          {pendencia.resolvida_em ? 
                            `${new Date(pendencia.resolvida_em).toLocaleDateString("pt-BR")} ${new Date(pendencia.resolvida_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : 
                            "—"
                          }
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center text-subtitle-dark">
                        Nenhuma pendência registrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-6 container-gradient-dark">
            <h3 className="text-white font-semibold mb-4">Timeline de Andamentos</h3>
            <div className="space-y-4">
              {andamentos?.length ? (
                andamentos.map((andamento) => (
                  <div key={andamento.id} className="flex items-start space-x-4 border-l-2 border-blue-500 pl-4" data-testid={`timeline-${andamento.id}`}>
                    <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full -ml-6 mt-1"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{andamento.tipo_evento}</p>
                      {andamento.descricao && (
                        <p className="text-subtitle-dark text-sm">{andamento.descricao}</p>
                      )}
                      <p className="text-subtitle-dark text-xs mt-1">
                        {new Date(andamento.criado_em).toLocaleDateString("pt-BR")} {new Date(andamento.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-subtitle-dark text-center">Nenhum andamento registrado</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
