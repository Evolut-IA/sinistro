-- Script SQL completo para configurar o banco de dados Sinistro
-- Execute este script para popular o banco com dados de exemplo

-- Limpar dados existentes (se necessário)
TRUNCATE TABLE eventos_log, terceiros, agendas, arquivos, estimativas, oficinas, claims CASCADE;
TRUNCATE TABLE workflow_logs, andamentos, pendencias, documentos, sinistros CASCADE;

-- 1. Inserir dados de oficinas
INSERT INTO oficinas (id, nome, cidade, uf, sla_medio_dias, score_qualidade) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Oficina SP 01 - Centro Automotivo', 'São Paulo', 'SP', 5, 90),
('550e8400-e29b-41d4-a716-446655440002', 'Oficina SP 02 - Auto Repair', 'São Paulo', 'SP', 7, 80),
('550e8400-e29b-41d4-a716-446655440003', 'Oficina RJ 01 - Carioca Motors', 'Rio de Janeiro', 'RJ', 6, 88),
('550e8400-e29b-41d4-a716-446655440004', 'Oficina BH 01 - Mineira Auto', 'Belo Horizonte', 'MG', 4, 92);

-- 2. Inserir dados de claims
INSERT INTO claims (id, created_at, placa, cpf_segurado, data_evento, local_evento_cidade, local_evento_uf, tipo_sinistro, franquia_prevista, status, prob_pt, estimativa_id, oficina_id, terceiro_token, resumo) VALUES
('7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', '2025-01-20T10:30:00.000Z', 'ABC1D23', '12345678901', '2025-01-20T10:30:00.000Z', 'São Paulo', 'SP', 'colisao', 2500, 'aberto', NULL, NULL, NULL, 'TERC-A-123', 'Colisão em cruzamento durante horário de pico'),
('8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', '2025-01-19T18:10:00.000Z', 'EFG4H56', '98765432100', '2025-01-19T18:10:00.000Z', 'Rio de Janeiro', 'RJ', 'roubo', 0, 'estimado', 0.85, 'c008f4f7-8f0f-9f2f-4f1f-7f03f0f0f666', NULL, NULL, 'Veículo roubado em via pública'),
('9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', '2025-01-20T08:15:00.000Z', 'IJK7L89', '11122233344', '2025-01-20T08:15:00.000Z', 'Belo Horizonte', 'MG', 'colisao', 1800, 'autorizado_reparo', 0.10, 'd119f5f8-9f1f-0f3f-5f2f-8f14f1f1f777', '550e8400-e29b-41d4-a716-446655440004', 'TERC-C-456', 'Colisão traseira em semáforo');

-- 3. Inserir dados de arquivos
INSERT INTO arquivos (id, created_at, claim_id, fonte, tipo, arquivo_url, metadados_json) VALUES
('aee6f2f5-6f8d-7d0f-2f9d-5f81f8f8d444', '2025-01-20T10:45:00.000Z', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', 'segurado', 'foto_danos', 'https://fake-storage.com/foto-danos-a-1.jpg', '{"nome_arquivo": "danos_frontais.jpg", "mime_type": "image/jpeg"}'),
('bff7f3f6-7f9e-8e1f-3f0e-6f92f9f9e555', '2025-01-20T10:50:00.000Z', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', 'segurado', 'documento_boletim', 'https://fake-storage.com/boletim-a-1.pdf', '{"nome_arquivo": "boletim_ocorrencia.pdf", "mime_type": "application/pdf"}'),
('c008f4f7-8f0f-9f2f-4f1f-7f03f0f0f666', '2025-01-19T18:30:00.000Z', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', 'segurado', 'foto_danos', 'https://fake-storage.com/foto-danos-b-1.jpg', '{"nome_arquivo": "local_roubo.jpg", "mime_type": "image/jpeg"}'),
('d119f5f8-9f1f-0f3f-5f2f-8f14f1f1f777', '2025-01-19T18:35:00.000Z', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', 'segurado', 'documento_boletim', 'https://fake-storage.com/boletim-b-1.pdf', '{"nome_arquivo": "boletim_roubo.pdf", "mime_type": "application/pdf"}'),
('e220f6f9-0f2f-1f4f-6f3f-9f25f2f2f888', '2025-01-20T08:30:00.000Z', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', 'segurado', 'foto_danos', 'https://fake-storage.com/foto-danos-c-1.jpg', '{"nome_arquivo": "danos_traseiros.jpg", "mime_type": "image/jpeg"}'),
('f331f7fa-1f3f-2f5f-7f4f-0f36f3f3f999', '2025-01-20T09:00:00.000Z', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', 'terceiro', 'documento_boletim', 'https://fake-storage.com/boletim-c-1.pdf', '{"nome_arquivo": "boletim_terceiro.pdf", "mime_type": "application/pdf"}');

-- 4. Inserir dados de estimativas
INSERT INTO estimativas (id, created_at, claim_id, valor_estimado, horas_mo, prob_pt, resumo_json) VALUES
('c008f4f7-8f0f-9f2f-4f1f-7f03f0f0f666', '2025-01-19T19:00:00.000Z', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', 38000, 42, 0.85, '{"pecas_afetadas": ["Para-choque dianteiro", "Capô", "Farol direito", "Grade frontal"], "observacoes": "Danos extensos na parte frontal, provável perda total"}'),
('d119f5f8-9f1f-0f3f-5f2f-8f14f1f1f777', '2025-01-20T09:30:00.000Z', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', 5200, 12, 0.10, '{"pecas_afetadas": ["Para-choque traseiro", "Lanterna esquerda"], "observacoes": "Danos leves, reparo viável"}');

-- 5. Inserir dados de agendas
INSERT INTO agendas (id, claim_id, oficina_id, data_agendada, status) VALUES
('d119f5f8-9f1f-0f3f-5f2f-8f14f1f1f777', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', '550e8400-e29b-41d4-a716-446655440004', '2025-01-23T09:00:00.000Z', 'confirmado'),
('e220f6f9-0f2f-1f4f-6f3f-9f25f2f2f888', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', '550e8400-e29b-41d4-a716-446655440001', NULL, 'pendente');

-- 6. Inserir dados de terceiros
INSERT INTO terceiros (id, claim_id, token, nome, cpf, email, telefone, status) VALUES
('e220f6f9-0f2f-1f4f-6f3f-9f25f2f2f888', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', 'TERC-A-123', 'João Terceiro', '22233344455', 'joao@exemplo.com', '11999990000', 'convidado'),
('f331f7fa-1f3f-2f5f-7f4f-0f36f3f3f999', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', 'TERC-C-456', 'Maria Terceira', '55566677788', 'maria@exemplo.com', '21988887777', 'dados_recebidos');

-- 7. Inserir dados de eventos_log
INSERT INTO eventos_log (id, created_at, workflow, request_id, claim_id, payload_resumo, status) VALUES
-- Claim A
('aee6f2f5-6f8d-7d0f-2f9d-5f81f8f8d444', '2025-01-20T10:30:00.000Z', 'sinistros_criar', 'req-a-1', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', '{"placa": "ABC1D23", "tipo_sinistro": "colisao"}', 'sucesso'),
('bff7f3f6-7f9e-8e1f-3f0e-6f92f9f9e555', '2025-01-20T10:50:00.000Z', 'arquivos_upload', 'req-a-2', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', '{"contagem": 2, "tipos": ["foto_danos", "documento_boletim"]}', 'sucesso'),
('c008f4f7-8f0f-9f2f-4f1f-7f03f0f0f666', '2025-01-20T11:00:00.000Z', 'terceiros_gerar_link', 'req-a-3', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', '{"token": "TERC-A-123"}', 'sucesso'),

-- Claim B  
('d119f5f8-9f1f-0f3f-5f2f-8f14f1f1f777', '2025-01-19T18:10:00.000Z', 'sinistros_criar', 'req-b-1', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', '{"placa": "EFG4H56", "tipo_sinistro": "roubo"}', 'sucesso'),
('e220f6f9-0f2f-1f4f-6f3f-9f25f2f2f888', '2025-01-19T18:35:00.000Z', 'arquivos_upload', 'req-b-2', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', '{"contagem": 2, "tipos": ["foto_danos", "documento_boletim"]}', 'sucesso'),
('f331f7fa-1f3f-2f5f-7f4f-0f36f3f3f999', '2025-01-19T19:00:00.000Z', 'estimativa_gerar', 'req-b-3', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', '{"valor_estimado": 38000, "prob_pt": 0.85}', 'sucesso'),

-- Claim C
('0442f8fb-2f4f-3f6f-8f5f-1f47f4f4f000', '2025-01-20T08:15:00.000Z', 'sinistros_criar', 'req-c-1', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', '{"placa": "IJK7L89", "tipo_sinistro": "colisao"}', 'sucesso'),
('1553f9fc-3f5f-4f7f-9f6f-2f58f5f5f111', '2025-01-20T09:00:00.000Z', 'arquivos_upload', 'req-c-2', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', '{"contagem": 2, "tipos": ["foto_danos", "documento_boletim"]}', 'sucesso'),
('2664fafd-4f6f-5f8f-0f7f-3f69f6f6f222', '2025-01-20T09:30:00.000Z', 'estimativa_gerar', 'req-c-3', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', '{"valor_estimado": 5200, "prob_pt": 0.10}', 'sucesso'),
('3775fbfe-5f7f-6f9f-1f8f-4f70f7f7f333', '2025-01-20T10:00:00.000Z', 'oficinas_rotear_agendar', 'req-c-4', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', '{"oficina_nome": "Oficina BH 01 - Mineira Auto"}', 'sucesso'),
('4886fcff-6f8f-7f0f-2f9f-5f81f8f8f444', '2025-01-20T10:15:00.000Z', 'oficinas_agendar', 'req-c-5', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', '{"data_agendada": "2025-01-23T09:00:00.000Z"}', 'sucesso'),
('5997fd00-7f9f-8f1f-3f0f-6f92f9f9f555', '2025-01-20T10:30:00.000Z', 'terceiros_gerar_link', 'req-c-6', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', '{"token": "TERC-C-456"}', 'sucesso'),
('6aa8fe01-8f0f-9f2f-4f1f-7f03f0f0f666', '2025-01-20T11:00:00.000Z', 'terceiros_submit', 'req-c-7', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', '{"nome": "Maria Terceira"}', 'sucesso');

-- 8. Inserir dados das tabelas legadas (sinistros)
INSERT INTO sinistros (id, protocolo, segurado_nome, segurado_email, segurado_telefone, placa, seguradora_nome, tipo_sinistro, status, data_aviso, prazo_limite, resumo, criado_em, atualizado_em) VALUES
('7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', null, 'João Silva', 'joao.silva@example.com', '21988887777', 'RIO2A34', 'Porto Seguro', 'colisao', 'aberto', '2025-08-19T10:15:00-03:00', '2025-09-18T00:00:00-03:00', 'Colisão traseira leve na Av. Brasil', '2025-08-19T10:15:00-03:00', '2025-08-19T10:15:00-03:00'),
('8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', 'ALL-2025-102938', 'Maria Oliveira', 'maria.oliveira@example.com', '11977776666', 'ABC1D23', 'Allianz', 'roubo_furto', 'enviado', '2025-08-15T09:00:00-03:00', '2025-09-14T00:00:00-03:00', 'Roubo sem recuperação do veículo', '2025-08-15T09:00:00-03:00', '2025-08-15T09:41:00-03:00'),
('9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', 'HDI-2025-223344', 'Carlos Pereira', 'carlos.pereira@example.com', '31966665555', 'XYZ9E88', 'HDI', 'alagamento', 'em_analise', '2025-08-10T08:00:00-03:00', '2025-09-09T00:00:00-03:00', 'Veículo atingido por enchente em garagem', '2025-08-10T08:00:00-03:00', '2025-08-10T08:31:00-03:00'),
('aee6f2f5-6f8d-7d0f-2f9d-5f81f8f8d444', 'TM-2025-778899', 'Ana Souza', 'ana.souza@example.com', '11955554444', 'BRA3F45', 'Tokio Marine', 'colisao', 'aprovado', '2025-07-25T11:00:00-03:00', '2025-08-24T00:00:00-03:00', 'Batida frontal com terceiro, sem vítimas', '2025-07-25T11:00:00-03:00', '2025-08-02T16:10:00-03:00'),
('bff7f3f6-7f9e-8e1f-3f0e-6f92f9f9e555', 'MAP-2025-556677', 'Beatriz Lima', 'beatriz.lima@example.com', '21944443333', 'SPQ2H10', 'Mapfre', 'incendio', 'negado', '2025-07-20T14:20:00-03:00', '2025-08-19T00:00:00-03:00', 'Incêndio no compartimento do motor', '2025-07-20T14:20:00-03:00', '2025-08-05T10:05:00-03:00'),
('c008f4f7-8f0f-9f2f-4f1f-7f03f0f0f666', 'PS-2025-332211', 'Rafael Gomes', 'rafael.gomes@example.com', '11933332222', 'DEF4G56', 'Porto Seguro', 'outros', 'concluido', '2025-06-30T13:40:00-03:00', '2025-07-30T00:00:00-03:00', 'Atropelamento de animal na estrada', '2025-06-30T13:40:00-03:00', '2025-07-20T09:00:00-03:00');

-- 9. Inserir dados de documentos
INSERT INTO documentos (id, sinistro_id, tipo_documento, nome_arquivo, mime_type, arquivo_base64, recebido_em) VALUES
('d119f5f8-9f1f-0f3f-5f2f-8f14f1f1f777', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', 'bo', 'bo_joao_2025.pdf', 'application/pdf', 'data:application/pdf;base64,JVBERi0x...', '2025-08-19T10:25:00-03:00'),
('e220f6f9-0f2f-1f4f-6f3f-9f25f2f2f888', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', 'bo', 'bo_maria_2025.pdf', 'application/pdf', 'data:application/pdf;base64,JVBERi0x...', '2025-08-15T09:20:00-03:00'),
('f331f7fa-1f3f-2f5f-7f4f-0f36f3f3f999', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', 'crlv', 'crlv_maria.png', 'image/png', 'data:image/png;base64,iVBORw0KGgo...', '2025-08-15T09:28:00-03:00'),
('0442f8fb-2f4f-3f6f-8f5f-1f47f4f4f000', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', 'fotos_danos', 'alagamento_carlos_1.jpg', 'image/jpeg', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...', '2025-08-10T08:15:00-03:00'),
('1553f9fc-3f5f-4f7f-9f6f-2f58f5f5f111', 'aee6f2f5-6f8d-7d0f-2f9d-5f81f8f8d444', 'orcamento', 'orcamento_oficina_ana.pdf', 'application/pdf', 'data:application/pdf;base64,JVBERi0x...', '2025-07-25T11:30:00-03:00'),
('2664fafd-4f6f-5f8f-0f7f-3f69f6f6f222', 'c008f4f7-8f0f-9f2f-4f1f-7f03f0f0f666', 'bo', 'bo_rafael_2025.pdf', 'application/pdf', 'data:application/pdf;base64,JVBERi0x...', '2025-06-30T14:05:00-03:00');

-- 10. Inserir dados de pendências
INSERT INTO pendencias (id, sinistro_id, descricao, solicitada_por, status, criada_em, resolvida_em) VALUES
('3775fbfe-5f7f-6f9f-1f8f-4f70f7f7f333', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', 'Enviar CNH do condutor', 'seguradora', 'aberta', '2025-08-19T10:30:00-03:00', null),
('4886fcff-6f8f-7f0f-2f9f-5f81f8f8f444', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', 'Orçamento detalhado da oficina', 'seguradora', 'aberta', '2025-08-10T08:40:00-03:00', null),
('5997fd00-7f9f-8f1f-3f0f-6f92f9f9f555', 'aee6f2f5-6f8d-7d0f-2f9d-5f81f8f8d444', 'Nota fiscal do reparo', 'corretor', 'resolvida', '2025-07-28T09:00:00-03:00', '2025-08-01T15:20:00-03:00');

-- 11. Inserir dados de andamentos
INSERT INTO andamentos (id, sinistro_id, tipo_evento, descricao, origem, criado_em) VALUES
('6aa8fe01-8f0f-9f2f-4f1f-7f03f0f0f666', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', 'abertura', 'Abertura do sinistro via formulário', 'sistema', '2025-08-19T10:15:00-03:00'),
('7bb9ff02-9f1f-0f3f-5f2f-8f14f1f1f777', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', 'documento_recebido', 'B.O. anexado', 'sistema', '2025-08-19T10:25:00-03:00'),
('8cc0f003-0f2f-1f4f-6f3f-9f25f2f2f888', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', 'pendencia_criada', 'Solicitado CNH do condutor', 'sistema', '2025-08-19T10:30:00-03:00'),
('9dd1f104-1f3f-2f5f-7f4f-0f36f3f3f999', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', 'abertura', 'Abertura do sinistro via formulário', 'sistema', '2025-08-15T09:00:00-03:00'),
('aee2f205-2f4f-3f6f-8f5f-1f47f4f4f000', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', 'documento_recebido', 'B.O. anexado', 'sistema', '2025-08-15T09:20:00-03:00'),
('bff3f306-3f5f-4f7f-9f6f-2f58f5f5f111', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', 'aviso_preparado', 'Pacote de envio compilado', 'sistema', '2025-08-15T09:40:00-03:00'),
('c004f407-4f6f-5f8f-0f7f-3f69f6f6f222', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', 'status_atualizado', 'Status alterado para enviado', 'sistema', '2025-08-15T09:41:00-03:00'),
('d115f508-5f7f-6f9f-1f8f-4f70f7f7f333', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', 'abertura', 'Abertura do sinistro via formulário', 'sistema', '2025-08-10T08:00:00-03:00'),
('e226f609-6f8f-7f0f-2f9f-5f81f8f8f444', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', 'documento_recebido', 'Fotos de danos anexadas', 'sistema', '2025-08-10T08:15:00-03:00'),
('f337f70a-7f9f-8f1f-3f0f-6f92f9f9f555', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', 'aviso_preparado', 'Pacote de envio compilado', 'sistema', '2025-08-10T08:30:00-03:00'),
('0448f80b-8f0f-9f2f-4f1f-7f03f0f0f666', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', 'status_atualizado', 'Status alterado para em_analise', 'sistema', '2025-08-10T08:31:00-03:00'),
('1559f90c-9f1f-0f3f-5f2f-8f14f1f1f777', 'aee6f2f5-6f8d-7d0f-2f9d-5f81f8f8d444', 'abertura', 'Abertura do sinistro via formulário', 'sistema', '2025-07-25T11:00:00-03:00'),
('266afa0d-0f2f-1f4f-6f3f-9f25f2f2f888', 'aee6f2f5-6f8d-7d0f-2f9d-5f81f8f8d444', 'aviso_preparado', 'Pacote de envio compilado', 'sistema', '2025-07-25T11:45:00-03:00'),
('377bfb0e-1f3f-2f5f-7f4f-0f36f3f3f999', 'aee6f2f5-6f8d-7d0f-2f9d-5f81f8f8d444', 'status_atualizado', 'Status alterado para em_analise', 'sistema', '2025-07-25T11:46:00-03:00'),
('488cfc0f-2f4f-3f6f-8f5f-1f47f4f4f000', 'aee6f2f5-6f8d-7d0f-2f9d-5f81f8f8d444', 'status_atualizado', 'Status alterado para aprovado', 'sistema', '2025-08-02T16:10:00-03:00'),
('599dfd10-3f5f-4f7f-9f6f-2f58f5f5f111', 'bff7f3f6-7f9e-8e1f-3f0e-6f92f9f9e555', 'abertura', 'Abertura do sinistro via formulário', 'sistema', '2025-07-20T14:20:00-03:00'),
('6aaefe11-4f6f-5f8f-0f7f-3f69f6f6f222', 'bff7f3f6-7f9e-8e1f-3f0e-6f92f9f9e555', 'aviso_preparado', 'Pacote de envio compilado', 'sistema', '2025-07-20T14:50:00-03:00'),
('7bbfff12-5f7f-6f9f-1f8f-4f70f7f7f333', 'bff7f3f6-7f9e-8e1f-3f0e-6f92f9f9e555', 'status_atualizado', 'Status alterado para em_analise', 'sistema', '2025-07-20T14:51:00-03:00'),
('8cc0f013-6f8f-7f0f-2f9f-5f81f8f8f444', 'bff7f3f6-7f9e-8e1f-3f0e-6f92f9f9e555', 'status_atualizado', 'Status alterado para negado', 'sistema', '2025-08-05T10:05:00-03:00'),
('9dd1f114-7f9f-8f1f-3f0f-6f92f9f9f555', 'c008f4f7-8f0f-9f2f-4f1f-7f03f0f0f666', 'abertura', 'Abertura do sinistro via formulário', 'sistema', '2025-06-30T13:40:00-03:00'),
('aee2f215-8f0f-9f2f-4f1f-7f03f0f0f666', 'c008f4f7-8f0f-9f2f-4f1f-7f03f0f0f666', 'aviso_preparado', 'Pacote de envio compilado', 'sistema', '2025-06-30T14:10:00-03:00'),
('bff3f316-9f1f-0f3f-5f2f-8f14f1f1f777', 'c008f4f7-8f0f-9f2f-4f1f-7f03f0f0f666', 'status_atualizado', 'Status alterado para em_analise', 'sistema', '2025-06-30T14:11:00-03:00'),
('c004f417-0f2f-1f4f-6f3f-9f25f2f2f888', 'c008f4f7-8f0f-9f2f-4f1f-7f03f0f0f666', 'status_atualizado', 'Status alterado para aprovado', 'sistema', '2025-07-05T09:30:00-03:00'),
('d115f518-1f3f-2f5f-7f4f-0f36f3f3f999', 'c008f4f7-8f0f-9f2f-4f1f-7f03f0f0f666', 'conclusao', 'Indenização paga e caso encerrado', 'sistema', '2025-07-20T09:00:00-03:00');

-- 12. Inserir dados de workflow_logs
INSERT INTO workflow_logs (id, sinistro_id, workflow, node, nivel, mensagem, payload_resumido, criado_em) VALUES
('e226f619-6f8f-7f0f-2f9f-5f81f8f8f444', '7bb3f9d2-3f5a-4a7d-9e6a-2f58f5e5a111', 'sinistro_criar', 'inicio', 'info', 'Iniciando criação de sinistro', '{"placa": "RIO2A34"}', '2025-08-19T10:15:00-03:00'),
('f337f71a-7f9f-8f1f-3f0f-6f92f9f9f555', '8cc4f0e3-4f6b-5b8e-0f7b-3f69f6f6b222', 'sinistro_criar', 'inicio', 'info', 'Iniciando criação de sinistro', '{"placa": "ABC1D23"}', '2025-08-15T09:00:00-03:00'),
('0448f81b-8f0f-9f2f-4f1f-7f03f0f0f666', '9dd5f1f4-5f7c-6c9f-1f8c-4f70f7f7c333', 'sinistro_criar', 'inicio', 'info', 'Iniciando criação de sinistro', '{"placa": "XYZ9E88"}', '2025-08-10T08:00:00-03:00'),
('1559f91c-9f1f-0f3f-5f2f-8f14f1f1f777', 'aee6f2f5-6f8d-7d0f-2f9d-5f81f8f8d444', 'sinistro_criar', 'inicio', 'info', 'Iniciando criação de sinistro', '{"placa": "BRA3F45"}', '2025-07-25T11:00:00-03:00'),
('266afa1d-0f2f-1f4f-6f3f-9f25f2f2f888', 'bff7f3f6-7f9e-8e1f-3f0e-6f92f9f9e555', 'sinistro_criar', 'inicio', 'info', 'Iniciando criação de sinistro', '{"placa": "SPQ2H10"}', '2025-07-20T14:20:00-03:00'),
('377bfb1e-1f3f-2f5f-7f4f-0f36f3f3f999', 'c008f4f7-8f0f-9f2f-4f1f-7f03f0f0f666', 'sinistro_criar', 'inicio', 'info', 'Iniciando criação de sinistro', '{"placa": "DEF4G56"}', '2025-06-30T13:40:00-03:00');

-- Verificar se os dados foram inseridos corretamente
SELECT 
    'claims' as tabela, 
    count(*) as registros 
FROM claims
UNION ALL
SELECT 
    'arquivos' as tabela, 
    count(*) as registros 
FROM arquivos
UNION ALL
SELECT 
    'estimativas' as tabela, 
    count(*) as registros 
FROM estimativas
UNION ALL
SELECT 
    'oficinas' as tabela, 
    count(*) as registros 
FROM oficinas
UNION ALL
SELECT 
    'agendas' as tabela, 
    count(*) as registros 
FROM agendas
UNION ALL
SELECT 
    'terceiros' as tabela, 
    count(*) as registros 
FROM terceiros
UNION ALL
SELECT 
    'eventos_log' as tabela, 
    count(*) as registros 
FROM eventos_log
UNION ALL
SELECT 
    'sinistros' as tabela, 
    count(*) as registros 
FROM sinistros
UNION ALL
SELECT 
    'documentos' as tabela, 
    count(*) as registros 
FROM documentos
UNION ALL
SELECT 
    'pendencias' as tabela, 
    count(*) as registros 
FROM pendencias
UNION ALL
SELECT 
    'andamentos' as tabela, 
    count(*) as registros 
FROM andamentos
UNION ALL
SELECT 
    'workflow_logs' as tabela, 
    count(*) as registros 
FROM workflow_logs;