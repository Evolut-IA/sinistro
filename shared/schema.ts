import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela principal de sinistros (claims)
export const claims = pgTable("claims", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp("created_at").notNull().defaultNow(),
  placa: text("placa").notNull(),
  cpf_segurado: text("cpf_segurado").notNull(),
  data_evento: timestamp("data_evento").notNull(),
  local_evento_cidade: text("local_evento_cidade").notNull(),
  local_evento_uf: text("local_evento_uf").notNull(),
  tipo_sinistro: text("tipo_sinistro").notNull(),
  franquia_prevista: numeric("franquia_prevista"),
  status: text("status").notNull().default("aberto"),
  prob_pt: numeric("prob_pt"),
  estimativa_id: uuid("estimativa_id"),
  oficina_id: uuid("oficina_id"),
  terceiro_token: text("terceiro_token"),
  resumo: text("resumo"),
});

// Tabela de arquivos e documentos
export const arquivos = pgTable("arquivos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp("created_at").notNull().defaultNow(),
  claim_id: uuid("claim_id").notNull().references(() => claims.id),
  fonte: text("fonte").notNull(), // segurado, terceiro
  tipo: text("tipo").notNull(), // foto_danos, documento_boletim, etc
  arquivo_url: text("arquivo_url").notNull(),
  metadados_json: jsonb("metadados_json"),
});

// Tabela de estimativas de IA
export const estimativas = pgTable("estimativas", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp("created_at").notNull().defaultNow(),
  claim_id: uuid("claim_id").notNull().references(() => claims.id),
  valor_estimado: numeric("valor_estimado").notNull(),
  horas_mo: numeric("horas_mo").notNull(),
  prob_pt: numeric("prob_pt").notNull(),
  resumo_json: jsonb("resumo_json"),
});

// Tabela de oficinas
export const oficinas = pgTable("oficinas", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  cidade: text("cidade").notNull(),
  uf: text("uf").notNull(),
  sla_medio_dias: integer("sla_medio_dias").notNull(),
  score_qualidade: integer("score_qualidade").notNull(),
});

// Tabela de agendamentos
export const agendas = pgTable("agendas", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  claim_id: uuid("claim_id").notNull().references(() => claims.id),
  oficina_id: uuid("oficina_id").notNull().references(() => oficinas.id),
  data_agendada: timestamp("data_agendada"),
  status: text("status").notNull().default("pendente"), // pendente, confirmado, concluido
});

// Tabela de terceiros
export const terceiros = pgTable("terceiros", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  claim_id: uuid("claim_id").notNull().references(() => claims.id),
  token: text("token").notNull(),
  nome: text("nome"),
  cpf: text("cpf"),
  email: text("email"),
  telefone: text("telefone"),
  status: text("status").notNull().default("convidado"), // convidado, dados_recebidos
});

// Tabela de log de eventos
export const eventos_log = pgTable("eventos_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp("created_at").notNull().defaultNow(),
  workflow: text("workflow").notNull(),
  request_id: text("request_id"),
  claim_id: uuid("claim_id").references(() => claims.id),
  payload_resumo: jsonb("payload_resumo"),
  status: text("status").notNull(),
});

// Manter tabelas antigas por compatibilidade temporária
export const sinistros = pgTable("sinistros", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  protocolo: text("protocolo"),
  segurado_nome: text("segurado_nome").notNull(),
  segurado_email: text("segurado_email").notNull(),
  segurado_telefone: text("segurado_telefone").notNull(),
  placa: text("placa").notNull(),
  seguradora_nome: text("seguradora_nome").notNull(),
  tipo_sinistro: text("tipo_sinistro").notNull(),
  status: text("status").notNull().default("aberto"),
  data_aviso: timestamp("data_aviso").notNull().defaultNow(),
  prazo_limite: timestamp("prazo_limite").notNull(),
  resumo: text("resumo"),
  criado_em: timestamp("criado_em").notNull().defaultNow(),
  atualizado_em: timestamp("atualizado_em").notNull().defaultNow(),
});

export const documentos = pgTable("documentos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sinistro_id: uuid("sinistro_id").notNull().references(() => sinistros.id),
  tipo_documento: text("tipo_documento").notNull(),
  nome_arquivo: text("nome_arquivo").notNull(),
  mime_type: text("mime_type").notNull(),
  arquivo_base64: text("arquivo_base64").notNull(),
  recebido_em: timestamp("recebido_em").notNull().defaultNow(),
});

export const pendencias = pgTable("pendencias", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sinistro_id: uuid("sinistro_id").notNull().references(() => sinistros.id),
  descricao: text("descricao").notNull(),
  solicitada_por: text("solicitada_por").notNull(),
  status: text("status").notNull().default("aberta"),
  criada_em: timestamp("criada_em").notNull().defaultNow(),
  resolvida_em: timestamp("resolvida_em"),
});

export const andamentos = pgTable("andamentos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sinistro_id: uuid("sinistro_id").notNull().references(() => sinistros.id),
  tipo_evento: text("tipo_evento").notNull(),
  descricao: text("descricao"),
  origem: text("origem").notNull(),
  criado_em: timestamp("criado_em").notNull().defaultNow(),
});

export const workflow_logs = pgTable("workflow_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sinistro_id: uuid("sinistro_id").references(() => sinistros.id),
  workflow: text("workflow").notNull(),
  node: text("node").notNull(),
  nivel: text("nivel").notNull(),
  mensagem: text("mensagem").notNull(),
  payload_resumido: text("payload_resumido"), // JSON as text
  criado_em: timestamp("criado_em").notNull().defaultNow(),
});

// Schemas para novas tabelas
export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  created_at: true,
});

export const insertArquivoSchema = createInsertSchema(arquivos).omit({
  id: true,
  created_at: true,
});

export const insertEstimativaSchema = createInsertSchema(estimativas).omit({
  id: true,
  created_at: true,
});

export const insertOficinaSchema = createInsertSchema(oficinas).omit({
  id: true,
});

export const insertAgendaSchema = createInsertSchema(agendas).omit({
  id: true,
});

export const insertTerceiroSchema = createInsertSchema(terceiros).omit({
  id: true,
});

export const insertEventoLogSchema = createInsertSchema(eventos_log).omit({
  id: true,
  created_at: true,
});

// Schemas para tabelas antigas (compatibilidade)
export const insertSinistroSchema = createInsertSchema(sinistros).omit({
  id: true,
  criado_em: true,
  atualizado_em: true,
});

export const insertDocumentoSchema = createInsertSchema(documentos).omit({
  id: true,
  recebido_em: true,
});

export const insertPendenciaSchema = createInsertSchema(pendencias).omit({
  id: true,
  criada_em: true,
  resolvida_em: true,
});

export const insertAndamentoSchema = createInsertSchema(andamentos).omit({
  id: true,
  criado_em: true,
});

// Types para novas tabelas
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Arquivo = typeof arquivos.$inferSelect;
export type InsertArquivo = z.infer<typeof insertArquivoSchema>;
export type Estimativa = typeof estimativas.$inferSelect;
export type InsertEstimativa = z.infer<typeof insertEstimativaSchema>;
export type Oficina = typeof oficinas.$inferSelect;
export type InsertOficina = z.infer<typeof insertOficinaSchema>;
export type Agenda = typeof agendas.$inferSelect;
export type InsertAgenda = z.infer<typeof insertAgendaSchema>;
export type Terceiro = typeof terceiros.$inferSelect;
export type InsertTerceiro = z.infer<typeof insertTerceiroSchema>;
export type EventoLog = typeof eventos_log.$inferSelect;
export type InsertEventoLog = z.infer<typeof insertEventoLogSchema>;

// Types para tabelas antigas (compatibilidade)
export type Sinistro = typeof sinistros.$inferSelect;
export type InsertSinistro = z.infer<typeof insertSinistroSchema>;
export type Documento = typeof documentos.$inferSelect;
export type InsertDocumento = z.infer<typeof insertDocumentoSchema>;
export type Pendencia = typeof pendencias.$inferSelect;
export type InsertPendencia = z.infer<typeof insertPendenciaSchema>;
export type Andamento = typeof andamentos.$inferSelect;
export type InsertAndamento = z.infer<typeof insertAndamentoSchema>;
