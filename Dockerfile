# Usar a imagem base do Heroku Builder 24
FROM heroku/builder:24

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Construir a aplicação
RUN npm run build

# Expor porta
EXPOSE 5000

# Comando para executar a aplicação
CMD ["npm", "start"]
