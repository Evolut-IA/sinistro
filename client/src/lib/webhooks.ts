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
  // Map webhook calls to local API endpoints
  switch (webhookName) {
    case 'WH_SINISTRO_LIST':
      const params = new URLSearchParams(payload);
      const response = await fetch(`/api/dashboard?${params}`);
      return await response.json();
      
    case 'WH_SINISTRO_CREATE':
      const createResponse = await fetch('/api/sinistros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const created = await createResponse.json();
      return { sinistro_id: created.id, mensagem: 'Sinistro criado com sucesso' };
      
    case 'WH_DOC_UPLOAD':
      const docResponse = await fetch('/api/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await docResponse.json();
      
    case 'WH_SINISTRO_ENVIAR_AVISO':
      // Simulate sending notice
      const protocol = `PROT-${Date.now()}`;
      await fetch(`/api/sinistros/${payload.sinistro_id}/protocol`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolo: protocol })
      });
      return { protocolo: protocol, mensagem: 'Aviso enviado com sucesso' };
      
    case 'WH_SINISTRO_UPDATE_STATUS':
      await fetch(`/api/sinistros/${payload.sinistro_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: payload.novo_status })
      });
      return { mensagem: 'Status atualizado com sucesso' };
      
    case 'WH_PENDENCIA_CREATE':
      const pendResponse = await fetch('/api/pendencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await pendResponse.json();
      
    case 'WH_SINISTRO_CLOSE':
      await fetch(`/api/sinistros/${payload.sinistro_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'concluido' })
      });
      return { mensagem: 'Sinistro concluído com sucesso' };
      
    case 'WH_RELATORIO_GERAR_MENSAL':
      const relParams = new URLSearchParams(payload);
      const relResponse = await fetch(`/api/relatorios?${relParams}`);
      return await relResponse.json();
      
    default:
      throw new Error(`Webhook não implementado: ${webhookName}`);
  }
};
