CREATE TABLE "agendas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"oficina_id" uuid NOT NULL,
	"data_agendada" timestamp,
	"status" text DEFAULT 'pendente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "andamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sinistro_id" uuid NOT NULL,
	"tipo_evento" text NOT NULL,
	"descricao" text,
	"origem" text NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arquivos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"claim_id" uuid NOT NULL,
	"fonte" text NOT NULL,
	"tipo" text NOT NULL,
	"arquivo_url" text NOT NULL,
	"metadados_json" jsonb
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"placa" text NOT NULL,
	"cpf_segurado" text NOT NULL,
	"data_evento" timestamp NOT NULL,
	"local_evento_cidade" text NOT NULL,
	"local_evento_uf" text NOT NULL,
	"tipo_sinistro" text NOT NULL,
	"franquia_prevista" numeric,
	"status" text DEFAULT 'aberto' NOT NULL,
	"prob_pt" numeric,
	"estimativa_id" uuid,
	"oficina_id" uuid,
	"terceiro_token" text,
	"resumo" text
);
--> statement-breakpoint
CREATE TABLE "documentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sinistro_id" uuid NOT NULL,
	"tipo_documento" text NOT NULL,
	"nome_arquivo" text NOT NULL,
	"mime_type" text NOT NULL,
	"arquivo_base64" text NOT NULL,
	"recebido_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estimativas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"claim_id" uuid NOT NULL,
	"valor_estimado" numeric NOT NULL,
	"horas_mo" numeric NOT NULL,
	"prob_pt" numeric NOT NULL,
	"resumo_json" jsonb
);
--> statement-breakpoint
CREATE TABLE "eventos_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"workflow" text NOT NULL,
	"request_id" text,
	"claim_id" uuid,
	"payload_resumo" jsonb,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oficinas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cidade" text NOT NULL,
	"uf" text NOT NULL,
	"sla_medio_dias" integer NOT NULL,
	"score_qualidade" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pendencias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sinistro_id" uuid NOT NULL,
	"descricao" text NOT NULL,
	"solicitada_por" text NOT NULL,
	"status" text DEFAULT 'aberta' NOT NULL,
	"criada_em" timestamp DEFAULT now() NOT NULL,
	"resolvida_em" timestamp
);
--> statement-breakpoint
CREATE TABLE "sinistros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"protocolo" text,
	"segurado_nome" text NOT NULL,
	"segurado_email" text NOT NULL,
	"segurado_telefone" text NOT NULL,
	"placa" text NOT NULL,
	"seguradora_nome" text NOT NULL,
	"tipo_sinistro" text NOT NULL,
	"status" text DEFAULT 'aberto' NOT NULL,
	"data_aviso" timestamp DEFAULT now() NOT NULL,
	"prazo_limite" timestamp NOT NULL,
	"resumo" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terceiros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"token" text NOT NULL,
	"nome" text,
	"cpf" text,
	"email" text,
	"telefone" text,
	"status" text DEFAULT 'convidado' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sinistro_id" uuid,
	"workflow" text NOT NULL,
	"node" text NOT NULL,
	"nivel" text NOT NULL,
	"mensagem" text NOT NULL,
	"payload_resumido" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_oficina_id_oficinas_id_fk" FOREIGN KEY ("oficina_id") REFERENCES "public"."oficinas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "andamentos" ADD CONSTRAINT "andamentos_sinistro_id_sinistros_id_fk" FOREIGN KEY ("sinistro_id") REFERENCES "public"."sinistros"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arquivos" ADD CONSTRAINT "arquivos_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_sinistro_id_sinistros_id_fk" FOREIGN KEY ("sinistro_id") REFERENCES "public"."sinistros"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimativas" ADD CONSTRAINT "estimativas_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_log" ADD CONSTRAINT "eventos_log_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pendencias" ADD CONSTRAINT "pendencias_sinistro_id_sinistros_id_fk" FOREIGN KEY ("sinistro_id") REFERENCES "public"."sinistros"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "terceiros" ADD CONSTRAINT "terceiros_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_sinistro_id_sinistros_id_fk" FOREIGN KEY ("sinistro_id") REFERENCES "public"."sinistros"("id") ON DELETE no action ON UPDATE no action;