const getWebhookUrl = (webhookName: string): string | null => {
  const baseUrl = import.meta.env.VITE_N8N_BASE_URL;
  const webhookPath = import.meta.env[`VITE_${webhookName}`];
  
  if (!baseUrl || !webhookPath) {
    return null; // Return null instead of throwing error
  }
  
  return `${baseUrl}/${webhookPath}`;
};

export const callWebhook = async (webhookName: string, payload: any): Promise<any> => {
  try {
    const url = getWebhookUrl(webhookName);
    
    // If webhook not configured, use local API endpoints
    if (!url) {
      return await callLocalAPI(webhookName, payload);
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Fallback to local API if webhook fails
      console.warn(`Webhook failed, using local API for ${webhookName}`);
      return await callLocalAPI(webhookName, payload);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`Webhook call failed for ${webhookName}, using local API:`, error);
    // Fallback to local API
    return await callLocalAPI(webhookName, payload);
  }
};

const callLocalAPI = async (webhookName: string, payload: any): Promise<any> => {
  // Map webhook calls to local API endpoints seguindo especificação
  switch (webhookName) {
    // Webhook: Criar Sinistro
    case 'WH_SINISTROS_CRIAR':
      const createResponse = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const created = await createResponse.json();
      return { claim_id: created.id, status: 'aberto', mensagem: 'Sinistro criado com sucesso' };
      
    // Webhook: Upload de Arquivos
    case 'WH_ARQUIVOS_UPLOAD':
      const uploadResponse = await fetch('/api/arquivos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const uploaded = await uploadResponse.json();
      return { 
        arquivos_ids: uploaded.ids || [uploaded.id], 
        contagem: uploaded.count || 1,
        mensagem: 'Arquivos enviados com sucesso' 
      };
      
    // Webhook: Estimativa IA por Imagem
    case 'WH_ESTIMATIVA_GERAR':
      const estimativaResponse = await fetch('/api/estimativas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const estimativa = await estimativaResponse.json();
      return {
        valor_estimado: estimativa.valor_estimado,
        horas_mo: estimativa.horas_mo,
        prob_pt: estimativa.prob_pt,
        resumo: estimativa.resumo_json,
        mensagem: 'Estimativa gerada com sucesso'
      };
      
    // Webhook: Oficinas Roteamento e Agendamento
    case 'WH_OFICINAS_ROTEAR_AGENDAR':
      const oficinaResponse = await fetch('/api/oficinas/rotear-agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const oficina = await oficinaResponse.json();
      
      if (payload.acao === 'match') {
        return {
          oficina_sugerida: oficina.oficina,
          agenda_pendente: oficina.agenda,
          mensagem: 'Oficina selecionada com sucesso'
        };
      } else if (payload.acao === 'agendar') {
        return {
          agenda_confirmada: oficina.agenda,
          data_agendada: oficina.data_agendada,
          mensagem: 'Agendamento confirmado com sucesso'
        };
      }
      break;
      
    // Webhook: Status e Autorizações do Sinistro
    case 'WH_SINISTROS_STATUS':
      const statusResponse = await fetch('/api/claims/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const status = await statusResponse.json();
      
      if (payload.acao === 'autorizar_reparo') {
        return {
          status: 'autorizado_reparo',
          mensagem: 'Reparo autorizado com sucesso'
        };
      } else if (payload.acao === 'marcar_pt') {
        return {
          status: 'perda_total',
          mensagem: 'Perda total marcada com sucesso'
        };
      }
      break;
      
    // Webhook: Terceiros Link e Submissões
    case 'WH_TERCEIROS':
      const terceiroResponse = await fetch('/api/terceiros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const terceiro = await terceiroResponse.json();
      
      if (payload.acao === 'gerar_link') {
        return {
          url_portal_terceiro: `/terceiro/${terceiro.token}`,
          token: terceiro.token,
          mensagem: 'Link do terceiro gerado com sucesso'
        };
      } else if (payload.acao === 'submit') {
        return {
          terceiro_id: terceiro.id,
          status: 'dados_recebidos',
          mensagem: 'Dados do terceiro recebidos com sucesso'
        };
      }
      break;

    // Compatibilidade com webhooks antigos
    case 'WH_SINISTRO_LIST':
      const params = new URLSearchParams(payload);
      const response = await fetch(`/api/dashboard?${params}`);
      return await response.json();

    // Fallback usando dados fictícios quando API não estiver disponível
    default:
      console.warn(`Webhook ${webhookName} não implementado, usando dados fictícios`);
      return await handleMockWebhook(webhookName, payload);
  }
};

// Handler para dados fictícios
const handleMockWebhook = async (webhookName: string, payload: any): Promise<any> => {
  const { getDashboardData, mockClaims, mockOficinas } = await import('./mockData');
  
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  switch (webhookName) {
    case 'WH_SINISTROS_CRIAR':
      const newClaimId = `claim-${Date.now()}`;
      return {
        claim_id: newClaimId,
        status: 'aberto',
        mensagem: 'Sinistro criado com sucesso (mock)'
      };
      
    case 'WH_ARQUIVOS_UPLOAD':
      return {
        arquivos_ids: payload.arquivos?.map(() => `arq-${Date.now()}-${Math.random()}`) || [],
        contagem: payload.arquivos?.length || 0,
        mensagem: 'Arquivos enviados com sucesso (mock)'
      };
      
    case 'WH_ESTIMATIVA_GERAR':
      // Simular valores baseados no tipo de sinistro
      const isRoubo = payload.claim_id?.includes('roubo') || Math.random() > 0.7;
      return {
        valor_estimado: isRoubo ? 35000 : 8500,
        horas_mo: isRoubo ? 40 : 15,
        prob_pt: isRoubo ? 0.85 : 0.15,
        resumo: { pecas_afetadas: isRoubo ? ["Veículo total"] : ["Para-choque", "Farol"] },
        mensagem: 'Estimativa gerada com sucesso (mock)'
      };
      
    case 'WH_OFICINAS_ROTEAR_AGENDAR':
      if (payload.acao === 'match') {
        const oficina = mockOficinas.find(o => o.uf === payload.uf) || mockOficinas[0];
        return {
          oficina_sugerida: oficina,
          agenda_pendente: { status: 'pendente', oficina_id: oficina.id },
          mensagem: 'Oficina selecionada com sucesso (mock)'
        };
      } else if (payload.acao === 'agendar') {
        return {
          agenda_confirmada: { status: 'confirmado' },
          data_agendada: payload.data,
          mensagem: 'Agendamento confirmado com sucesso (mock)'
        };
      }
      break;
      
    case 'WH_SINISTROS_STATUS':
      if (payload.acao === 'autorizar_reparo') {
        return {
          status: 'autorizado_reparo',
          mensagem: 'Reparo autorizado com sucesso (mock)'
        };
      } else if (payload.acao === 'marcar_pt') {
        return {
          status: 'perda_total',
          mensagem: 'Perda total marcada com sucesso (mock)'
        };
      }
      break;
      
    case 'WH_TERCEIROS':
      if (payload.acao === 'gerar_link') {
        const token = `TERC-${Date.now()}`;
        return {
          url_portal_terceiro: `/terceiro/${token}`,
          token: token,
          mensagem: 'Link do terceiro gerado com sucesso (mock)'
        };
      } else if (payload.acao === 'submit') {
        return {
          terceiro_id: `terc-${Date.now()}`,
          status: 'dados_recebidos',
          mensagem: 'Dados do terceiro recebidos com sucesso (mock)'
        };
      }
      break;
      
    default:
      throw new Error(`Mock webhook não implementado: ${webhookName}`);
  }
};
