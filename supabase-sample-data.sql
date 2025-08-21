-- Script SQL para popular o Supabase com dados fictícios
-- Execute este script no SQL Editor do Supabase

-- Limpar dados existentes (opcional - descomente se necessário)
-- DELETE FROM eventos_log;
-- DELETE FROM terceiros;
-- DELETE FROM agendas;
-- DELETE FROM arquivos;
-- DELETE FROM estimativas;
-- DELETE FROM oficinas;
-- DELETE FROM claims;

-- 1. Inserir dados de oficinas
INSERT INTO oficinas (id, nome, cidade, uf, sla_medio_dias, score_qualidade) VALUES
('of-sp-01', 'Oficina SP 01 - Centro Automotivo', 'São Paulo', 'SP', 5, 90),
('of-sp-02', 'Oficina SP 02 - Auto Repair', 'São Paulo', 'SP', 7, 80),
('of-rj-01', 'Oficina RJ 01 - Carioca Motors', 'Rio de Janeiro', 'RJ', 6, 88),
('of-bh-01', 'Oficina BH 01 - Mineira Auto', 'Belo Horizonte', 'MG', 4, 92);

-- 2. Inserir dados de claims
INSERT INTO claims (id, created_at, placa, cpf_segurado, data_evento, local_evento_cidade, local_evento_uf, tipo_sinistro, franquia_prevista, status, prob_pt, estimativa_id, oficina_id, terceiro_token, resumo) VALUES
('claim-a-123', '2025-01-20T10:30:00.000Z', 'ABC1D23', '12345678901', '2025-01-20T10:30:00.000Z', 'São Paulo', 'SP', 'colisao', 2500, 'aberto', NULL, NULL, NULL, 'TERC-A-123', 'Colisão em cruzamento durante horário de pico'),
('claim-b-456', '2025-01-19T18:10:00.000Z', 'EFG4H56', '98765432100', '2025-01-19T18:10:00.000Z', 'Rio de Janeiro', 'RJ', 'roubo', 0, 'estimado', 0.85, 'est-b-456', NULL, NULL, 'Veículo roubado em via pública'),
('claim-c-789', '2025-01-20T08:15:00.000Z', 'IJK7L89', '11122233344', '2025-01-20T08:15:00.000Z', 'Belo Horizonte', 'MG', 'colisao', 1800, 'autorizado_reparo', 0.10, 'est-c-789', 'of-bh-01', 'TERC-C-456', 'Colisão traseira em semáforo');

-- 3. Inserir dados de arquivos
INSERT INTO arquivos (id, created_at, claim_id, fonte, tipo, arquivo_url, metadados_json) VALUES
('arq-a-1', '2025-01-20T10:45:00.000Z', 'claim-a-123', 'segurado', 'foto_danos', 'https://fake-storage.com/foto-danos-a-1.jpg', '{"nome_arquivo": "danos_frontais.jpg", "mime_type": "image/jpeg"}'),
('arq-a-2', '2025-01-20T10:50:00.000Z', 'claim-a-123', 'segurado', 'documento_boletim', 'https://fake-storage.com/boletim-a-1.pdf', '{"nome_arquivo": "boletim_ocorrencia.pdf", "mime_type": "application/pdf"}'),
('arq-b-1', '2025-01-19T18:30:00.000Z', 'claim-b-456', 'segurado', 'foto_danos', 'https://fake-storage.com/foto-danos-b-1.jpg', '{"nome_arquivo": "local_roubo.jpg", "mime_type": "image/jpeg"}'),
('arq-b-2', '2025-01-19T18:35:00.000Z', 'claim-b-456', 'segurado', 'documento_boletim', 'https://fake-storage.com/boletim-b-1.pdf', '{"nome_arquivo": "boletim_roubo.pdf", "mime_type": "application/pdf"}'),
('arq-c-1', '2025-01-20T08:30:00.000Z', 'claim-c-789', 'segurado', 'foto_danos', 'https://fake-storage.com/foto-danos-c-1.jpg', '{"nome_arquivo": "danos_traseiros.jpg", "mime_type": "image/jpeg"}'),
('arq-c-2', '2025-01-20T09:00:00.000Z', 'claim-c-789', 'terceiro', 'documento_boletim', 'https://fake-storage.com/boletim-c-1.pdf', '{"nome_arquivo": "boletim_terceiro.pdf", "mime_type": "application/pdf"}');

-- 4. Inserir dados de estimativas
INSERT INTO estimativas (id, created_at, claim_id, valor_estimado, horas_mo, prob_pt, resumo_json) VALUES
('est-b-456', '2025-01-19T19:00:00.000Z', 'claim-b-456', 38000, 42, 0.85, '{"pecas_afetadas": ["Para-choque dianteiro", "Capô", "Farol direito", "Grade frontal"], "observacoes": "Danos extensos na parte frontal, provável perda total"}'),
('est-c-789', '2025-01-20T09:30:00.000Z', 'claim-c-789', 5200, 12, 0.10, '{"pecas_afetadas": ["Para-choque traseiro", "Lanterna esquerda"], "observacoes": "Danos leves, reparo viável"}');

-- 5. Inserir dados de agendas
INSERT INTO agendas (id, claim_id, oficina_id, data_agendada, status) VALUES
('ag-c-789', 'claim-c-789', 'of-bh-01', '2025-01-23T09:00:00.000Z', 'confirmado'),
('ag-a-123', 'claim-a-123', 'of-sp-01', NULL, 'pendente');

-- 6. Inserir dados de terceiros
INSERT INTO terceiros (id, claim_id, token, nome, cpf, email, telefone, status) VALUES
('terc-a-123', 'claim-a-123', 'TERC-A-123', 'João Terceiro', '22233344455', 'joao@exemplo.com', '11999990000', 'convidado'),
('terc-c-456', 'claim-c-789', 'TERC-C-456', 'Maria Terceira', '55566677788', 'maria@exemplo.com', '21988887777', 'dados_recebidos');

-- 7. Inserir dados de eventos_log
INSERT INTO eventos_log (id, created_at, workflow, request_id, claim_id, payload_resumo, status) VALUES
-- Claim A
('evt-a-1', '2025-01-20T10:30:00.000Z', 'sinistros_criar', 'req-a-1', 'claim-a-123', '{"placa": "ABC1D23", "tipo_sinistro": "colisao"}', 'sucesso'),
('evt-a-2', '2025-01-20T10:50:00.000Z', 'arquivos_upload', 'req-a-2', 'claim-a-123', '{"contagem": 2, "tipos": ["foto_danos", "documento_boletim"]}', 'sucesso'),
('evt-a-3', '2025-01-20T11:00:00.000Z', 'terceiros_gerar_link', 'req-a-3', 'claim-a-123', '{"token": "TERC-A-123"}', 'sucesso'),

-- Claim B  
('evt-b-1', '2025-01-19T18:10:00.000Z', 'sinistros_criar', 'req-b-1', 'claim-b-456', '{"placa": "EFG4H56", "tipo_sinistro": "roubo"}', 'sucesso'),
('evt-b-2', '2025-01-19T18:35:00.000Z', 'arquivos_upload', 'req-b-2', 'claim-b-456', '{"contagem": 2, "tipos": ["foto_danos", "documento_boletim"]}', 'sucesso'),
('evt-b-3', '2025-01-19T19:00:00.000Z', 'estimativa_gerar', 'req-b-3', 'claim-b-456', '{"valor_estimado": 38000, "prob_pt": 0.85}', 'sucesso'),

-- Claim C
('evt-c-1', '2025-01-20T08:15:00.000Z', 'sinistros_criar', 'req-c-1', 'claim-c-789', '{"placa": "IJK7L89", "tipo_sinistro": "colisao"}', 'sucesso'),
('evt-c-2', '2025-01-20T09:00:00.000Z', 'arquivos_upload', 'req-c-2', 'claim-c-789', '{"contagem": 2, "tipos": ["foto_danos", "documento_boletim"]}', 'sucesso'),
('evt-c-3', '2025-01-20T09:30:00.000Z', 'estimativa_gerar', 'req-c-3', 'claim-c-789', '{"valor_estimado": 5200, "prob_pt": 0.10}', 'sucesso'),
('evt-c-4', '2025-01-20T10:00:00.000Z', 'oficinas_rotear_agendar', 'req-c-4', 'claim-c-789', '{"oficina_nome": "Oficina BH 01 - Mineira Auto"}', 'sucesso'),
('evt-c-5', '2025-01-20T10:15:00.000Z', 'oficinas_agendar', 'req-c-5', 'claim-c-789', '{"data_agendada": "2025-01-23T09:00:00.000Z"}', 'sucesso'),
('evt-c-6', '2025-01-20T10:30:00.000Z', 'terceiros_gerar_link', 'req-c-6', 'claim-c-789', '{"token": "TERC-C-456"}', 'sucesso'),
('evt-c-7', '2025-01-20T11:00:00.000Z', 'terceiros_submit', 'req-c-7', 'claim-c-789', '{"nome": "Maria Terceira"}', 'sucesso');

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
FROM eventos_log;
