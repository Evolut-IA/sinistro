import { IStorage } from "./storage";
import { 
  type Claim, 
  type InsertClaim, 
  type Sinistro, 
  type InsertSinistro,
  type Estimativa,
  type Oficina,
  type Agenda,
  type Terceiro,
  type Arquivo,
  type EventoLog
} from "@shared/schema";

// Mock data based on the structure expected by the frontend
const mockClaims: Claim[] = [
  {
    id: "claim-a-123",
    created_at: new Date("2025-01-20T10:30:00.000Z"),
    placa: "ABC1D23",
    cpf_segurado: "12345678901",
    data_evento: new Date("2025-01-20T10:30:00.000Z"),
    local_evento_cidade: "São Paulo",
    local_evento_uf: "SP",
    tipo_sinistro: "colisao",
    franquia_prevista: "2500",
    status: "aberto",
    prob_pt: null,
    estimativa_id: null,
    oficina_id: null,
    terceiro_token: "TERC-A-123",
    resumo: "Colisão em cruzamento durante horário de pico"
  },
  {
    id: "claim-b-456",
    created_at: new Date("2025-01-19T18:10:00.000Z"),
    placa: "EFG4H56",
    cpf_segurado: "98765432100",
    data_evento: new Date("2025-01-19T18:10:00.000Z"),
    local_evento_cidade: "Rio de Janeiro",
    local_evento_uf: "RJ",
    tipo_sinistro: "roubo",
    franquia_prevista: "0",
    status: "estimado",
    prob_pt: "0.85",
    estimativa_id: "est-b-456",
    oficina_id: null,
    terceiro_token: null,
    resumo: "Veículo roubado em via pública"
  },
  {
    id: "claim-c-789",
    created_at: new Date("2025-01-20T08:15:00.000Z"),
    placa: "IJK7L89",
    cpf_segurado: "11122233344",
    data_evento: new Date("2025-01-20T08:15:00.000Z"),
    local_evento_cidade: "Belo Horizonte",
    local_evento_uf: "MG",
    tipo_sinistro: "colisao",
    franquia_prevista: "1800",
    status: "autorizado_reparo",
    prob_pt: "0.10",
    estimativa_id: "est-c-789",
    oficina_id: "of-bh-01",
    terceiro_token: "TERC-C-456",
    resumo: "Colisão traseira em semáforo"
  }
];

export class MockStorage implements IStorage {
  
  async getDashboardData(filters: any): Promise<any> {
    console.log("🔄 Using mock data for dashboard");
    
    let filteredClaims = [...mockClaims];
    
    // Apply filters
    if (filters.status && filters.status !== '' && filters.status !== 'todos') {
      filteredClaims = filteredClaims.filter(claim => claim.status === filters.status);
    }
    
    if (filters.busca && filters.busca !== '') {
      const searchTerm = filters.busca.toLowerCase();
      filteredClaims = filteredClaims.filter(claim => 
        claim.placa.toLowerCase().includes(searchTerm) ||
        claim.cpf_segurado.includes(searchTerm)
      );
    }
    
    const total = filteredClaims.length;
    const ativos = filteredClaims.filter(c => !['concluido', 'negado'].includes(c.status)).length;
    
    return {
      indicadores: {
        tempo_medio_dias: 12,
        dentro_prazo_percent: 85,
        ativos: ativos,
        total_mes: total
      },
      sinistros: filteredClaims.map(claim => ({
        id: claim.id,
        placa: claim.placa,
        cpf_segurado: claim.cpf_segurado,
        data_evento: claim.data_evento,
        local_evento_cidade: claim.local_evento_cidade,
        local_evento_uf: claim.local_evento_uf,
        tipo_sinistro: claim.tipo_sinistro,
        status: claim.status,
        franquia_prevista: claim.franquia_prevista,
        prob_pt: claim.prob_pt,
        resumo: claim.resumo,
        created_at: claim.created_at
      }))
    };
  }
  
  async getClaimById(id: string): Promise<Claim | undefined> {
    return mockClaims.find(claim => claim.id === id);
  }
  
  async createClaim(claim: InsertClaim): Promise<Claim> {
    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      created_at: new Date(),
      placa: claim.placa,
      cpf_segurado: claim.cpf_segurado,
      data_evento: claim.data_evento,
      local_evento_cidade: claim.local_evento_cidade,
      local_evento_uf: claim.local_evento_uf,
      tipo_sinistro: claim.tipo_sinistro,
      status: claim.status || "aberto",
      franquia_prevista: claim.franquia_prevista?.toString() || "0",
      prob_pt: claim.prob_pt?.toString() || null,
      estimativa_id: claim.estimativa_id ?? null,
      oficina_id: claim.oficina_id ?? null,
      terceiro_token: claim.terceiro_token ?? null,
      resumo: claim.resumo ?? null,
    };
    mockClaims.push(newClaim);
    return newClaim;
  }
  
  // Legacy methods - return empty data or basic implementations
  async getSinistrosList(filters: any): Promise<any> {
    return { kpis: {}, lista: [], paginacao: { pagina: 1, total_paginas: 0 } };
  }
  
  async getSinistroById(id: string): Promise<Sinistro | undefined> {
    return undefined;
  }
  
  async createSinistro(sinistro: InsertSinistro): Promise<Sinistro> {
    throw new Error("Legacy sinistro creation not implemented in mock storage");
  }
  
  async updateSinistroStatus(id: string, status: string): Promise<void> {
    console.log(`Mock: Update sinistro ${id} status to ${status}`);
  }
  
  async updateSinistroProtocol(id: string, protocolo: string): Promise<void> {
    console.log(`Mock: Update sinistro ${id} protocol to ${protocolo}`);
  }
  
  async getDocumentosBySinistroId(sinistroId: string): Promise<any[]> {
    return [];
  }
  
  async createDocumento(documento: any): Promise<any> {
    return { id: `doc-${Date.now()}`, ...documento };
  }
  
  async getPendenciasBySinistroId(sinistroId: string): Promise<any[]> {
    return [];
  }
  
  async createPendencia(pendencia: any): Promise<any> {
    return { id: `pend-${Date.now()}`, ...pendencia };
  }
  
  async getAndamentosBySinistroId(sinistroId: string): Promise<any[]> {
    return [];
  }
  
  async createAndamento(andamento: any): Promise<any> {
    return { id: `and-${Date.now()}`, ...andamento };
  }
  
  async getRelatorioMensal(dataInicio: string, dataFim: string): Promise<any> {
    return {
      kpis: {
        tempo_medio_dias: 18,
        dentro_prazo_percent: 87,
        total_por_status: {
          aberto: 2,
          enviado: 1,
          em_analise: 0,
          aprovado: 1,
          negado: 0,
          concluido: 0,
        }
      },
      agregados: []
    };
  }

  // Mock implementations for new claim-related methods
  async getEstimativaByClaimId(claimId: string): Promise<Estimativa | undefined> {
    console.log("🔄 Using mock data for estimativa");
    if (claimId === "claim-b-456") {
      return {
        id: "est-b-456",
        created_at: new Date(),
        claim_id: claimId,
        valor_estimado: "25000",
        horas_mo: "40",
        prob_pt: "0.85",
        resumo_json: { danos: "Danos extensos na lateral" }
      };
    }
    return undefined;
  }

  async getOficinaById(oficinaId: string): Promise<Oficina | undefined> {
    console.log("🔄 Using mock data for oficina");
    return {
      id: oficinaId,
      nome: "Oficina Premium Auto",
      cidade: "São Paulo",
      uf: "SP",
      sla_medio_dias: 10,
      score_qualidade: 95
    };
  }

  async getAgendaByClaimId(claimId: string): Promise<Agenda | undefined> {
    console.log("🔄 Using mock data for agenda");
    return {
      id: "agenda-1",
      claim_id: claimId,
      oficina_id: "oficina-1",
      data_agendada: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      status: "confirmado"
    };
  }

  async getTerceiroByClaimId(claimId: string): Promise<Terceiro | undefined> {
    console.log("🔄 Using mock data for terceiro");
    if (claimId === "claim-a-123") {
      return {
        id: "terc-1",
        claim_id: claimId,
        token: "TERC-A-123",
        nome: "João Silva",
        cpf: "12345678901",
        email: "joao@email.com",
        telefone: "(11) 99999-9999",
        status: "dados_recebidos"
      };
    }
    return undefined;
  }

  async getArquivosByClaimId(claimId: string): Promise<Arquivo[]> {
    console.log("🔄 Using mock data for arquivos");
    return [
      {
        id: "arq-1",
        created_at: new Date(),
        claim_id: claimId,
        fonte: "segurado",
        tipo: "foto_danos",
        arquivo_url: "/mock/photo1.jpg",
        metadados_json: { nome_arquivo: "danos_frente.jpg" }
      }
    ];
  }

  async getEventosLogByClaimId(claimId: string): Promise<EventoLog[]> {
    console.log("🔄 Using mock data for eventos log");
    return [
      {
        id: "evt-1",
        created_at: new Date(),
        workflow: "intake",
        request_id: "req-1",
        claim_id: claimId,
        payload_resumo: { acao: "claim_criado" },
        status: "sucesso"
      }
    ];
  }
}
