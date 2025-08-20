import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  prazo_limite: date("prazo_limite").notNull(),
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

export const insertSinistroSchema = createInsertSchema(sinistros).omit({
  id: true,
  criado_em: true,
  atualizado_em: true,
  prazo_limite: true,
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

export type Sinistro = typeof sinistros.$inferSelect;
export type InsertSinistro = z.infer<typeof insertSinistroSchema>;
export type Documento = typeof documentos.$inferSelect;
export type InsertDocumento = z.infer<typeof insertDocumentoSchema>;
export type Pendencia = typeof pendencias.$inferSelect;
export type InsertPendencia = z.infer<typeof insertPendenciaSchema>;
export type Andamento = typeof andamentos.$inferSelect;
export type InsertAndamento = z.infer<typeof insertAndamentoSchema>;
