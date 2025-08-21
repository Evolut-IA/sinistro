import { CheckCircle, Clock, AlertCircle, FileText, Upload, Wrench, Shield } from "lucide-react";

interface EventoTimeline {
  id: string;
  workflow: string;
  status: string;
  created_at: string;
  payload_resumo: any;
}

interface TimelineSinistroProps {
  claimId: string;
  eventos: EventoTimeline[];
}

export default function TimelineSinistro({ claimId, eventos }: TimelineSinistroProps) {
  const getEventIcon = (workflow: string) => {
    switch (workflow) {
      case 'sinistros_criar':
        return <FileText className="text-blue-400" size={20} />;
      case 'arquivos_upload':
        return <Upload className="text-green-400" size={20} />;
      case 'estimativa_gerar':
        return <Shield className="text-purple-400" size={20} />;
      case 'oficinas_rotear_agendar':
      case 'oficinas_agendar':
        return <Wrench className="text-orange-400" size={20} />;
      case 'terceiros_gerar_link':
      case 'terceiros_submit':
        return <AlertCircle className="text-yellow-400" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getEventTitle = (workflow: string, status: string) => {
    switch (workflow) {
      case 'sinistros_criar':
        return 'Sinistro criado';
      case 'arquivos_upload':
        return 'Arquivos enviados';
      case 'estimativa_gerar':
        return 'Estimativa IA gerada';
      case 'oficinas_rotear_agendar':
        return 'Oficina selecionada';
      case 'oficinas_agendar':
        return 'Agendamento confirmado';
      case 'terceiros_gerar_link':
        return 'Link do terceiro gerado';
      case 'terceiros_submit':
        return 'Dados do terceiro recebidos';
      default:
        return workflow.replace('_', ' ');
    }
  };

  const getEventDescription = (evento: EventoTimeline) => {
    const { workflow, payload_resumo } = evento;
    
    switch (workflow) {
      case 'sinistros_criar':
        return `Claim criado para placa ${payload_resumo?.placa || 'N/A'}`;
      case 'arquivos_upload':
        return `${payload_resumo?.contagem || 0} arquivo(s) enviado(s)`;
      case 'estimativa_gerar':
        return `Valor estimado: R$ ${payload_resumo?.valor_estimado || '0,00'} | PT: ${payload_resumo?.prob_pt || '0'}%`;
      case 'oficinas_rotear_agendar':
        return `Oficina: ${payload_resumo?.oficina_nome || 'N/A'}`;
      case 'oficinas_agendar':
        return `Data: ${payload_resumo?.data_agendada || 'N/A'}`;
      case 'terceiros_gerar_link':
        return `Token: ${payload_resumo?.token || 'N/A'}`;
      case 'terceiros_submit':
        return `Dados recebidos de ${payload_resumo?.nome || 'terceiro'}`;
      default:
        return 'Evento processado';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sucesso':
        return 'text-green-400';
      case 'erro':
        return 'text-red-400';
      case 'processando':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="rounded-lg p-6 container-gradient">
      <h3 className="cor-titulo font-semibold text-lg mb-6">Timeline do Sinistro</h3>
      
      {eventos && eventos.length > 0 ? (
        <div className="space-y-4">
          {eventos.map((evento, index) => (
            <div key={evento.id} className="flex items-start gap-4">
              {/* Ícone do evento */}
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  {getEventIcon(evento.workflow)}
                </div>
              </div>

              {/* Linha conectora */}
              {index < eventos.length - 1 && (
                <div className="absolute left-[29px] mt-10 w-0.5 h-12 bg-gray-600"></div>
              )}

              {/* Conteúdo do evento */}
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="cor-titulo font-medium">
                    {getEventTitle(evento.workflow, evento.status)}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getStatusColor(evento.status)}`}>
                      {evento.status}
                    </span>
                    {evento.status === 'sucesso' && (
                      <CheckCircle className="text-green-400" size={16} />
                    )}
                  </div>
                </div>
                
                <p className="cor-subtitulo text-sm mb-2">
                  {getEventDescription(evento)}
                </p>
                
                <p className="text-gray-500 text-xs">
                  {new Date(evento.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="cor-subtitulo">Nenhum evento registrado ainda</p>
          <p className="cor-subtitulo text-sm mt-2">
            Os eventos aparecerão aqui conforme as ações forem executadas.
          </p>
        </div>
      )}
    </div>
  );
}
