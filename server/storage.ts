import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, and, sql, or, gte, lte } from "drizzle-orm";
import { 
  type Sinistro, 
  type InsertSinistro, 
  type Documento, 
  type InsertDocumento,
  type Pendencia,
  type InsertPendencia,
  type Andamento,
  type InsertAndamento,
  sinistros,
  documentos,
  pendencias,
  andamentos,
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

export interface IStorage {
  // Sinistros
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
}

export const storage = new PostgresStorage();
