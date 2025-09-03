# Instruções de Deploy no Easypanel

## Configuração para Heroku Buildpacks

Este projeto está configurado para ser implantado no Easypanel usando o modo de construção `heroku/builder:24` através de Buildpacks.

**⚠️ IMPORTANTE**: A versão do Node.js foi corrigida para `20.18.0` (versão estável suportada pelo Heroku Buildpack).

## Arquivos de Configuração Criados

### 1. Procfile
Define o comando para executar a aplicação:
```
web: npm start
```

### 2. app.json
Configurações específicas para o Heroku Buildpack.

### 3. easypanel.json
Configurações específicas para o Easypanel.

### 4. .nvmrc e .node-version
Especificam a versão do Node.js (20.18.0).

### 5. .buildpacks
Especifica explicitamente o buildpack do Node.js a ser usado.

### 6. heroku.yml
Configuração alternativa para deploy via Heroku.

### 7. Dockerfile (Alternativo)
Para deploy via Docker se preferir não usar Buildpacks.

## Passos para Deploy no Easypanel

### Opção 1: Usando Buildpacks (Recomendado)

1. **No Easypanel, crie um novo projeto**
2. **Escolha "Buildpacks" como método de deploy**
3. **Configure o Buildpack:**
   - Buildpack: `heroku/buildpacks:24`
   - Comando de build: `npm run build`
   - Comando de start: `npm run start:prod` (ou deixe o Procfile gerenciar)
   - Porta: `5000`

4. **Configure as variáveis de ambiente:**
   ```bash
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=sua_url_do_banco
   SESSION_SECRET=sua_chave_secreta
   VITE_N8N_BASE_URL=url_do_n8n
   VITE_WEBHOOK_SINISTRO=url_do_webhook
   ```

5. **Conecte seu repositório Git**

### Opção 2: Usando Docker

1. **No Easypanel, crie um novo projeto**
2. **Escolha "Docker" como método de deploy**
3. **Use o Dockerfile fornecido**
4. **Configure as mesmas variáveis de ambiente**

## Variáveis de Ambiente Necessárias

- `NODE_ENV`: Deve ser `production`
- `PORT`: Porta onde a aplicação rodará (5000)
- `DATABASE_URL`: URL de conexão com o banco PostgreSQL
- `SESSION_SECRET`: Chave secreta para sessões (use uma chave forte)
- `VITE_N8N_BASE_URL`: URL base do seu N8N
- `VITE_WEBHOOK_SINISTRO`: URL do webhook do N8N

## Verificação do Deploy

Após o deploy, você pode verificar se está funcionando:

1. **Health Check**: `GET /api/health`
2. **Dashboard**: `GET /api/dashboard`
3. **Interface Web**: Acesse a URL raiz

## Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme se o Node.js 20.18.0 está sendo usado

### Erro: "cross-env: not found"
Se você encontrar o erro "cross-env: not found", significa que a dependência não está disponível em produção.

**Solução**: 
- O `cross-env` foi movido para `dependencies` (não mais em `devDependencies`)
- O servidor agora define `NODE_ENV=production` por padrão
- Use o script `start:prod` para garantir que as variáveis de ambiente sejam definidas

### Erro: "Unknown Node.js version"
Se você encontrar o erro "Unknown Node.js version", significa que a versão especificada não é suportada pelo Heroku Buildpack.

**Solução**: Use uma das versões suportadas:
- `20.18.0` ✅ (recomendado)
- `20.17.0`
- `20.16.0`
- `20.15.0`

**Arquivos que controlam a versão**:
- `.nvmrc`
- `.node-version`
- `package.json` (seção `engines`)
- `app.json` (seção `engines`)

### Erro de Runtime
- Verifique as variáveis de ambiente
- Confirme se o banco de dados está acessível
- Verifique os logs no Easypanel

### Problemas de Porta
- A aplicação deve rodar na porta 5000
- Configure o proxy reverso no Easypanel para a porta 80

## Estrutura de Build

O processo de build:
1. `npm install` - Instala dependências
2. `npm run build` - Constrói o cliente e servidor
3. `npm start` - Executa a aplicação

## Monitoramento

- Use o endpoint `/api/health` para health checks
- Configure alertas no Easypanel
- Monitore logs e métricas
