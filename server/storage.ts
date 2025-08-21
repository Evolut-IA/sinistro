import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, and, sql, or, gte, lte } from "drizzle-orm";
import { MockStorage } from "./mock-storage";
import { 
  type Sinistro, 
  type InsertSinistro, 
  type Documento, 
  type InsertDocumento,
  type Pendencia,
  type InsertPendencia,
  type Andamento,
  type InsertAndamento,
  type Claim,
  type InsertClaim,
  type Estimativa,
  type Oficina,
  type Agenda,
  type Terceiro,
  type Arquivo,
  type EventoLog,
  sinistros,
  documentos,
  pendencias,
  andamentos,
  claims,
  estimativas,
  oficinas,
  agendas,
  terceiros,
  arquivos,
  eventos_log,
  workflow_logs
} from "@shared/schema";

const getDatabaseConnection = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  const sql = neon(databaseUrl);
  return drizzle(sql);
};

// Test database connection and return appropriate storage instance
const createStorageInstance = async (): Promise<IStorage> => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log("⚠️  Database URL not configured - using mock storage");
      return new MockStorage();
    }
    
    // Test connection
    const sql = neon(databaseUrl);
    await sql`SELECT 1`;
    console.log("✅ Database connection successful - using PostgresStorage");
    console.log("🔗 Connected to:", databaseUrl.replace(/:\/\/.*@/, '://***@'));
    return new PostgresStorage();
  } catch (error) {
    console.log("⚠️  Database connection failed - falling back to mock storage:", error.message);
    return new MockStorage();
  }
};

export interface IStorage {
  // Dashboard
  getDashboardData(filters: any): Promise<any>;
  
  // Claims (Nova API)
  getClaimById(id: string): Promise<Claim | undefined>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  
  // Related data for claims
  getEstimativaByClaimId(claimId: string): Promise<Estimativa | undefined>;
  getOficinaById(oficinaId: string): Promise<Oficina | undefined>;
  getAgendaByClaimId(claimId: string): Promise<Agenda | undefined>;
  getTerceiroByClaimId(claimId: string): Promise<Terceiro | undefined>;
  getArquivosByClaimId(claimId: string): Promise<Arquivo[]>;
  getEventosLogByClaimId(claimId: string): Promise<EventoLog[]>;
  
  // Sinistros (Legacy)
  getSinistrosList(filters: any): Promise<any>;
  getSinistroById(id: string): Promise<Sinistro | undefined>;
  createSinistro(sinistro: InsertSinistro): Promise<Sinistro>;
  updateSinistroStatus(id: string, status: string): Promise<void>;
  updateSinistroProtocol(id: string, protocolo: string): Promise<void>;
  
  // Documentos
  getDocumentosBySinistroId(sinistroId: string): Promise<Documento[]>;
  createDocumento(documento: InsertDocumento): Promise<Documento>;
  
  // Pendencias
  getPendenciasBySinistroId(sinistroId: string): Promise<Pendencia[]>;
  createPendencia(pendencia: InsertPendencia): Promise<Pendencia>;
  
  // Andamentos
  getAndamentosBySinistroId(sinistroId: string): Promise<Andamento[]>;
  createAndamento(andamento: InsertAndamento): Promise<Andamento>;
  
  // Relatórios
  getRelatorioMensal(dataInicio: string, dataFim: string): Promise<any>;
}

export class PostgresStorage implements IStorage {
  private db = getDatabaseConnection();

  async getDashboardData(filters: any): Promise<any> {
    try {
      // Build where conditions for claims table
      const conditions = [];
      
      if (filters.data_inicio) {
        conditions.push(gte(claims.data_evento, new Date(filters.data_inicio)));
      }
      
      if (filters.data_fim) {
        conditions.push(lte(claims.data_evento, new Date(filters.data_fim)));
      }
      
      if (filters.busca) {
        conditions.push(
          or(
            sql`${claims.placa} ILIKE ${`%${filters.busca}%`}`,
            sql`${claims.cpf_segurado} ILIKE ${`%${filters.busca}%`}`
          )
        );
      }
      
      if (filters.status && filters.status !== '' && filters.status !== 'todos') {
        conditions.push(eq(claims.status, filters.status));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get claims data
      const claimsList = await this.db
        .select()
        .from(claims)
        .where(whereClause)
        .orderBy(desc(claims.created_at));

      // Calculate KPIs
      const total = claimsList.length;
      const ativos = claimsList.filter(c => !['concluido', 'negado'].includes(c.status)).length;

      return {
        indicadores: {
          tempo_medio_dias: 12, // Mock data for now
          dentro_prazo_percent: 85,
          ativos: ativos,
          total_mes: total
        },
        sinistros: claimsList.map(claim => ({
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
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      throw error;
    }
  }

  async getClaimById(id: string): Promise<Claim | undefined> {
    try {
      const result = await this.db
        .select()
        .from(claims)
        .where(eq(claims.id, id))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error("Error getting claim by ID:", error);
      throw error;
    }
  }

  async createClaim(claim: InsertClaim): Promise<Claim> {
    try {
      const result = await this.db
        .insert(claims)
        .values(claim)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating claim:", error);
      throw error;
    }
  }

  async getSinistrosList(filters: any): Promise<any> {
    try {
      // Build where conditions
      const conditions = [];
      
      if (filters.data_inicio) {
        conditions.push(gte(sinistros.data_aviso, new Date(filters.data_inicio)));
      }
      
      if (filters.data_fim) {
        conditions.push(lte(sinistros.data_aviso, new Date(filters.data_fim)));
      }
      
      if (filters.busca) {
        conditions.push(
          or(
            sql`${sinistros.segurado_nome} ILIKE ${`%${filters.busca}%`}`,
            sql`${sinistros.placa} ILIKE ${`%${filters.busca}%`}`
          )
        );
      }
      
      if (filters.status && filters.status.length > 0) {
        conditions.push(sql`${sinistros.status} = ANY(${filters.status})`);
      }
      
      if (filters.seguradora) {
        conditions.push(sql`${sinistros.seguradora_nome} ILIKE ${`%${filters.seguradora}%`}`);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(sinistros)
        .where(whereClause);
      
      const total = totalResult[0]?.count || 0;

      // Get paginated results
      const offset = (filters.pagina - 1) * filters.tamanho_pagina;
      const lista = await this.db
        .select()
        .from(sinistros)
        .where(whereClause)
        .orderBy(desc(sinistros.data_aviso))
        .limit(filters.tamanho_pagina)
        .offset(offset);

      // Calculate KPIs
      const kpis = {
        tempo_medio_dias: 15, // Mock data for now
        dentro_prazo_percent: 85,
        ativos: lista.filter(s => !['concluido', 'negado'].includes(s.status)).length
      };

      return {
        kpis,
        lista,
        paginacao: {
          pagina: filters.pagina,
          total_paginas: Math.ceil(total / filters.tamanho_pagina)
        }
      };
    } catch (error) {
      console.error("Error getting sinistros list:", error);
      throw error;
    }
  }

  async getSinistroById(id: string): Promise<Sinistro | undefined> {
    try {
      const result = await this.db
        .select()
        .from(sinistros)
        .where(eq(sinistros.id, id))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error("Error getting sinistro by ID:", error);
      throw error;
    }
  }

  async createSinistro(sinistro: InsertSinistro): Promise<Sinistro> {
    try {
      // Calculate prazo_limite (30 days from now)
      const prazoLimite = new Date();
      prazoLimite.setDate(prazoLimite.getDate() + 30);

      const result = await this.db
        .insert(sinistros)
        .values({
          ...sinistro,
          prazo_limite: prazoLimite.toISOString().split('T')[0]
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating sinistro:", error);
      throw error;
    }
  }

  async updateSinistroStatus(id: string, status: string): Promise<void> {
    try {
      await this.db
        .update(sinistros)
        .set({ 
          status,
          atualizado_em: new Date()
        })
        .where(eq(sinistros.id, id));
    } catch (error) {
      console.error("Error updating sinistro status:", error);
      throw error;
    }
  }

  async updateSinistroProtocol(id: string, protocolo: string): Promise<void> {
    try {
      await this.db
        .update(sinistros)
        .set({ 
          protocolo,
          status: 'enviado',
          atualizado_em: new Date()
        })
        .where(eq(sinistros.id, id));
    } catch (error) {
      console.error("Error updating sinistro protocol:", error);
      throw error;
    }
  }

  async getDocumentosBySinistroId(sinistroId: string): Promise<Documento[]> {
    try {
      const result = await this.db
        .select()
        .from(documentos)
        .where(eq(documentos.sinistro_id, sinistroId))
        .orderBy(desc(documentos.recebido_em));
      
      return result;
    } catch (error) {
      console.error("Error getting documentos:", error);
      throw error;
    }
  }

  async createDocumento(documento: InsertDocumento): Promise<Documento> {
    try {
      const result = await this.db
        .insert(documentos)
        .values(documento)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating documento:", error);
      throw error;
    }
  }

  async getPendenciasBySinistroId(sinistroId: string): Promise<Pendencia[]> {
    try {
      const result = await this.db
        .select()
        .from(pendencias)
        .where(eq(pendencias.sinistro_id, sinistroId))
        .orderBy(desc(pendencias.criada_em));
      
      return result;
    } catch (error) {
      console.error("Error getting pendencias:", error);
      throw error;
    }
  }

  async createPendencia(pendencia: InsertPendencia): Promise<Pendencia> {
    try {
      const result = await this.db
        .insert(pendencias)
        .values(pendencia)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating pendencia:", error);
      throw error;
    }
  }

  async getAndamentosBySinistroId(sinistroId: string): Promise<Andamento[]> {
    try {
      const result = await this.db
        .select()
        .from(andamentos)
        .where(eq(andamentos.sinistro_id, sinistroId))
        .orderBy(desc(andamentos.criado_em));
      
      return result;
    } catch (error) {
      console.error("Error getting andamentos:", error);
      throw error;
    }
  }

  async createAndamento(andamento: InsertAndamento): Promise<Andamento> {
    try {
      const result = await this.db
        .insert(andamentos)
        .values(andamento)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating andamento:", error);
      throw error;
    }
  }

  async getRelatorioMensal(dataInicio: string, dataFim: string): Promise<any> {
    try {
      // Get aggregated data by status
      const statusData = await this.db
        .select({
          status: sinistros.status,
          count: sql<number>`count(*)`
        })
        .from(sinistros)
        .where(
          and(
            gte(sinistros.data_aviso, new Date(dataInicio)),
            lte(sinistros.data_aviso, new Date(dataFim))
          )
        )
        .groupBy(sinistros.status);

      // Get aggregated data by seguradora
      const seguradoraData = await this.db
        .select({
          seguradora_nome: sinistros.seguradora_nome,
          status: sinistros.status,
          count: sql<number>`count(*)`
        })
        .from(sinistros)
        .where(
          and(
            gte(sinistros.data_aviso, new Date(dataInicio)),
            lte(sinistros.data_aviso, new Date(dataFim))
          )
        )
        .groupBy(sinistros.seguradora_nome, sinistros.status);

      // Transform data for frontend
      const kpis = {
        tempo_medio_dias: 18, // Mock calculation
        dentro_prazo_percent: 87,
        total_por_status: {
          aberto: statusData.find(s => s.status === 'aberto')?.count || 0,
          enviado: statusData.find(s => s.status === 'enviado')?.count || 0,
          em_analise: statusData.find(s => s.status === 'em_analise')?.count || 0,
          aprovado: statusData.find(s => s.status === 'aprovado')?.count || 0,
          negado: statusData.find(s => s.status === 'negado')?.count || 0,
          concluido: statusData.find(s => s.status === 'concluido')?.count || 0,
        }
      };

      // Transform seguradora data
      const seguradorasMap = new Map();
      seguradoraData.forEach(item => {
        if (!seguradorasMap.has(item.seguradora_nome)) {
          seguradorasMap.set(item.seguradora_nome, {
            seguradora_nome: item.seguradora_nome,
            aberto: 0,
            enviado: 0,
            em_analise: 0,
            aprovado: 0,
            negado: 0,
            concluido: 0,
          });
        }
        const seg = seguradorasMap.get(item.seguradora_nome);
        seg[item.status] = item.count;
      });

      const agregados = Array.from(seguradorasMap.values());

      return { kpis, agregados };
    } catch (error) {
      console.error("Error getting relatorio mensal:", error);
      throw error;
    }
  }

  // New methods for claims-related data
  async getEstimativaByClaimId(claimId: string): Promise<Estimativa | undefined> {
    try {
      const result = await this.db
        .select()
        .from(estimativas)
        .where(eq(estimativas.claim_id, claimId))
        .orderBy(desc(estimativas.created_at))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error("Error getting estimativa by claim ID:", error);
      throw error;
    }
  }

  async getOficinaById(oficinaId: string): Promise<Oficina | undefined> {
    try {
      const result = await this.db
        .select()
        .from(oficinas)
        .where(eq(oficinas.id, oficinaId))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error("Error getting oficina by ID:", error);
      throw error;
    }
  }

  async getAgendaByClaimId(claimId: string): Promise<Agenda | undefined> {
    try {
      const result = await this.db
        .select()
        .from(agendas)
        .where(eq(agendas.claim_id, claimId))
        .orderBy(desc(agendas.data_agendada))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error("Error getting agenda by claim ID:", error);
      throw error;
    }
  }

  async getTerceiroByClaimId(claimId: string): Promise<Terceiro | undefined> {
    try {
      const result = await this.db
        .select()
        .from(terceiros)
        .where(eq(terceiros.claim_id, claimId))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error("Error getting terceiro by claim ID:", error);
      throw error;
    }
  }

  async getArquivosByClaimId(claimId: string): Promise<Arquivo[]> {
    try {
      const result = await this.db
        .select()
        .from(arquivos)
        .where(eq(arquivos.claim_id, claimId))
        .orderBy(desc(arquivos.created_at));
      
      return result;
    } catch (error) {
      console.error("Error getting arquivos by claim ID:", error);
      throw error;
    }
  }

  async getEventosLogByClaimId(claimId: string): Promise<EventoLog[]> {
    try {
      const result = await this.db
        .select()
        .from(eventos_log)
        .where(eq(eventos_log.claim_id, claimId))
        .orderBy(desc(eventos_log.created_at));
      
      return result;
    } catch (error) {
      console.error("Error getting eventos log by claim ID:", error);
      throw error;
    }
  }
}

// Export a promise that resolves to the appropriate storage instance
let storageInstance: IStorage | null = null;

export const getStorage = async (): Promise<IStorage> => {
  if (!storageInstance) {
    storageInstance = await createStorageInstance();
  }
  return storageInstance;
};

// For backward compatibility, export a PostgresStorage instance
export const storage = new PostgresStorage();
