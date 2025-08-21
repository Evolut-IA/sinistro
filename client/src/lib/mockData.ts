// Dados fictícios para demonstração seguindo exatamente a especificação

export const mockClaims = [
  {
    id: "claim-a-123",
    placa: "ABC1D23",
    cpf_segurado: "12345678901",
    data_evento: "2025-01-20T10:30:00.000Z",
    local_evento_cidade: "São Paulo",
    local_evento_uf: "SP",
    tipo_sinistro: "colisao",
    franquia_prevista: 2500,
    status: "aberto",
    prob_pt: null,
    estimativa_id: null,
    oficina_id: null,
    terceiro_token: "TERC-A-123",
    resumo: "Colisão em cruzamento durante horário de pico",
    created_at: "2025-01-20T10:30:00.000Z"
  },
  {
    id: "claim-b-456",
    placa: "EFG4H56",
    cpf_segurado: "98765432100",
    data_evento: "2025-01-19T18:10:00.000Z",
    local_evento_cidade: "Rio de Janeiro",
    local_evento_uf: "RJ",
    tipo_sinistro: "roubo",
    franquia_prevista: 0,
    status: "estimado",
    prob_pt: 0.85,
    estimativa_id: "est-b-456",
    oficina_id: null,
    terceiro_token: null,
    resumo: "Veículo roubado em via pública",
    created_at: "2025-01-19T18:10:00.000Z"
  },
  {
    id: "claim-c-789",
    placa: "IJK7L89",
    cpf_segurado: "11122233344",
    data_evento: "2025-01-20T08:15:00.000Z",
    local_evento_cidade: "Belo Horizonte",
    local_evento_uf: "MG",
    tipo_sinistro: "colisao",
    franquia_prevista: 1800,
    status: "autorizado_reparo",
    prob_pt: 0.10,
    estimativa_id: "est-c-789",
    oficina_id: "of-bh-01",
    terceiro_token: "TERC-C-456",
    resumo: "Colisão traseira em semáforo",
    created_at: "2025-01-20T08:15:00.000Z"
  }
];

export const mockArquivos = [
  // Claim A
  {
    id: "arq-a-1",
    claim_id: "claim-a-123",
    fonte: "segurado",
    tipo: "foto_danos",
    arquivo_url: "https://fake-storage.com/foto-danos-a-1.jpg",
    metadados_json: { nome_arquivo: "danos_frontais.jpg", mime_type: "image/jpeg" },
    created_at: "2025-01-20T10:45:00.000Z"
  },
  {
    id: "arq-a-2",
    claim_id: "claim-a-123",
    fonte: "segurado",
    tipo: "documento_boletim",
    arquivo_url: "https://fake-storage.com/boletim-a-1.pdf",
    metadados_json: { nome_arquivo: "boletim_ocorrencia.pdf", mime_type: "application/pdf" },
    created_at: "2025-01-20T10:50:00.000Z"
  },
  // Claim B
  {
    id: "arq-b-1",
    claim_id: "claim-b-456",
    fonte: "segurado",
    tipo: "foto_danos",
    arquivo_url: "https://fake-storage.com/foto-danos-b-1.jpg",
    metadados_json: { nome_arquivo: "local_roubo.jpg", mime_type: "image/jpeg" },
    created_at: "2025-01-19T18:30:00.000Z"
  },
  {
    id: "arq-b-2",
    claim_id: "claim-b-456",
    fonte: "segurado",
    tipo: "documento_boletim",
    arquivo_url: "https://fake-storage.com/boletim-b-1.pdf",
    metadados_json: { nome_arquivo: "boletim_roubo.pdf", mime_type: "application/pdf" },
    created_at: "2025-01-19T18:35:00.000Z"
  },
  // Claim C
  {
    id: "arq-c-1",
    claim_id: "claim-c-789",
    fonte: "segurado",
    tipo: "foto_danos",
    arquivo_url: "https://fake-storage.com/foto-danos-c-1.jpg",
    metadados_json: { nome_arquivo: "danos_traseiros.jpg", mime_type: "image/jpeg" },
    created_at: "2025-01-20T08:30:00.000Z"
  },
  {
    id: "arq-c-2",
    claim_id: "claim-c-789",
    fonte: "terceiro",
    tipo: "documento_boletim",
    arquivo_url: "https://fake-storage.com/boletim-c-1.pdf",
    metadados_json: { nome_arquivo: "boletim_terceiro.pdf", mime_type: "application/pdf" },
    created_at: "2025-01-20T09:00:00.000Z"
  }
];

export const mockEstimativas = [
  {
    id: "est-b-456",
    claim_id: "claim-b-456",
    valor_estimado: 38000,
    horas_mo: 42,
    prob_pt: 0.85,
    resumo_json: {
      pecas_afetadas: ["Para-choque dianteiro", "Capô", "Farol direito", "Grade frontal"],
      observacoes: "Danos extensos na parte frontal, provável perda total"
    },
    created_at: "2025-01-19T19:00:00.000Z"
  },
  {
    id: "est-c-789",
    claim_id: "claim-c-789",
    valor_estimado: 5200,
    horas_mo: 12,
    prob_pt: 0.10,
    resumo_json: {
      pecas_afetadas: ["Para-choque traseiro", "Lanterna esquerda"],
      observacoes: "Danos leves, reparo viável"
    },
    created_at: "2025-01-20T09:30:00.000Z"
  }
];

export const mockOficinas = [
  // São Paulo
  {
    id: "of-sp-01",
    nome: "Oficina SP 01 - Centro Automotivo",
    cidade: "São Paulo",
    uf: "SP",
    sla_medio_dias: 5,
    score_qualidade: 90
  },
  {
    id: "of-sp-02",
    nome: "Oficina SP 02 - Auto Repair",
    cidade: "São Paulo", 
    uf: "SP",
    sla_medio_dias: 7,
    score_qualidade: 80
  },
  // Rio de Janeiro
  {
    id: "of-rj-01",
    nome: "Oficina RJ 01 - Carioca Motors",
    cidade: "Rio de Janeiro",
    uf: "RJ", 
    sla_medio_dias: 6,
    score_qualidade: 88
  },
  // Belo Horizonte
  {
    id: "of-bh-01",
    nome: "Oficina BH 01 - Mineira Auto",
    cidade: "Belo Horizonte",
    uf: "MG",
    sla_medio_dias: 4,
    score_qualidade: 92
  }
];

export const mockAgendas = [
  {
    id: "ag-c-789",
    claim_id: "claim-c-789",
    oficina_id: "of-bh-01",
    data_agendada: "2025-01-23T09:00:00.000Z",
    status: "confirmado"
  },
  {
    id: "ag-a-123",
    claim_id: "claim-a-123",
    oficina_id: "of-sp-01",
    data_agendada: null,
    status: "pendente"
  }
];

export const mockTerceiros = [
  {
    id: "terc-a-123",
    claim_id: "claim-a-123",
    token: "TERC-A-123",
    nome: "João Terceiro",
    cpf: "22233344455",
    email: "joao@exemplo.com",
    telefone: "11999990000",
    status: "convidado"
  },
  {
    id: "terc-c-456",
    claim_id: "claim-c-789",
    token: "TERC-C-456",
    nome: "Maria Terceira",
    cpf: "55566677788",
    email: "maria@exemplo.com",
    telefone: "21988887777",
    status: "dados_recebidos"
  }
];

export const mockEventosLog = [
  // Claim A
  {
    id: "evt-a-1",
    workflow: "sinistros_criar",
    request_id: "req-a-1",
    claim_id: "claim-a-123",
    payload_resumo: { placa: "ABC1D23", tipo_sinistro: "colisao" },
    status: "sucesso",
    created_at: "2025-01-20T10:30:00.000Z"
  },
  {
    id: "evt-a-2",
    workflow: "arquivos_upload",
    request_id: "req-a-2",
    claim_id: "claim-a-123",
    payload_resumo: { contagem: 2, tipos: ["foto_danos", "documento_boletim"] },
    status: "sucesso",
    created_at: "2025-01-20T10:50:00.000Z"
  },
  {
    id: "evt-a-3",
    workflow: "terceiros_gerar_link",
    request_id: "req-a-3",
    claim_id: "claim-a-123",
    payload_resumo: { token: "TERC-A-123" },
    status: "sucesso",
    created_at: "2025-01-20T11:00:00.000Z"
  },
  // Claim B
  {
    id: "evt-b-1",
    workflow: "sinistros_criar",
    request_id: "req-b-1",
    claim_id: "claim-b-456",
    payload_resumo: { placa: "EFG4H56", tipo_sinistro: "roubo" },
    status: "sucesso",
    created_at: "2025-01-19T18:10:00.000Z"
  },
  {
    id: "evt-b-2",
    workflow: "arquivos_upload",
    request_id: "req-b-2",
    claim_id: "claim-b-456",
    payload_resumo: { contagem: 2, tipos: ["foto_danos", "documento_boletim"] },
    status: "sucesso",
    created_at: "2025-01-19T18:35:00.000Z"
  },
  {
    id: "evt-b-3",
    workflow: "estimativa_gerar",
    request_id: "req-b-3",
    claim_id: "claim-b-456",
    payload_resumo: { valor_estimado: 38000, prob_pt: 0.85 },
    status: "sucesso",
    created_at: "2025-01-19T19:00:00.000Z"
  },
  // Claim C
  {
    id: "evt-c-1",
    workflow: "sinistros_criar",
    request_id: "req-c-1",
    claim_id: "claim-c-789",
    payload_resumo: { placa: "IJK7L89", tipo_sinistro: "colisao" },
    status: "sucesso",
    created_at: "2025-01-20T08:15:00.000Z"
  },
  {
    id: "evt-c-2",
    workflow: "arquivos_upload",
    request_id: "req-c-2",
    claim_id: "claim-c-789",
    payload_resumo: { contagem: 2, tipos: ["foto_danos", "documento_boletim"] },
    status: "sucesso",
    created_at: "2025-01-20T09:00:00.000Z"
  },
  {
    id: "evt-c-3",
    workflow: "estimativa_gerar",
    request_id: "req-c-3",
    claim_id: "claim-c-789",
    payload_resumo: { valor_estimado: 5200, prob_pt: 0.10 },
    status: "sucesso",
    created_at: "2025-01-20T09:30:00.000Z"
  },
  {
    id: "evt-c-4",
    workflow: "oficinas_rotear_agendar",
    request_id: "req-c-4",
    claim_id: "claim-c-789",
    payload_resumo: { oficina_nome: "Oficina BH 01 - Mineira Auto" },
    status: "sucesso",
    created_at: "2025-01-20T10:00:00.000Z"
  },
  {
    id: "evt-c-5",
    workflow: "oficinas_agendar",
    request_id: "req-c-5",
    claim_id: "claim-c-789",
    payload_resumo: { data_agendada: "2025-01-23T09:00:00.000Z" },
    status: "sucesso",
    created_at: "2025-01-20T10:15:00.000Z"
  },
  {
    id: "evt-c-6",
    workflow: "terceiros_gerar_link",
    request_id: "req-c-6",
    claim_id: "claim-c-789",
    payload_resumo: { token: "TERC-C-456" },
    status: "sucesso",
    created_at: "2025-01-20T10:30:00.000Z"
  },
  {
    id: "evt-c-7",
    workflow: "terceiros_submit",
    request_id: "req-c-7",
    claim_id: "claim-c-789",
    payload_resumo: { nome: "Maria Terceira" },
    status: "sucesso",
    created_at: "2025-01-20T11:00:00.000Z"
  }
];

// Helper functions para buscar dados
export const getClaimById = (id: string) => {
  return mockClaims.find(claim => claim.id === id);
};

export const getArquivosByClaimId = (claimId: string) => {
  return mockArquivos.filter(arquivo => arquivo.claim_id === claimId);
};

export const getEstimativaByClaimId = (claimId: string) => {
  const claim = getClaimById(claimId);
  if (!claim?.estimativa_id) return null;
  return mockEstimativas.find(est => est.id === claim.estimativa_id);
};

export const getOficinaById = (id: string) => {
  return mockOficinas.find(oficina => oficina.id === id);
};

export const getAgendaByClaimId = (claimId: string) => {
  return mockAgendas.find(agenda => agenda.claim_id === claimId);
};

export const getTerceiroByClaimId = (claimId: string) => {
  return mockTerceiros.find(terceiro => terceiro.claim_id === claimId);
};

export const getEventosLogByClaimId = (claimId: string) => {
  return mockEventosLog.filter(evento => evento.claim_id === claimId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getDashboardData = () => {
  const claims = mockClaims;
  const total = claims.length;
  const ativos = claims.filter(c => !['concluido', 'negado'].includes(c.status)).length;
  
  return {
    indicadores: {
      tempo_medio_dias: 12,
      dentro_prazo_percent: 85,
      ativos: ativos,
      total_mes: total
    },
    sinistros: claims
  };
};
