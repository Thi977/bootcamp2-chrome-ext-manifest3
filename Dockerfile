# Base Playwright (inclui Node.js, Chromium e dependências)
FROM mcr.microsoft.com/playwright:v1.46.0-jammy

WORKDIR /app

# Copia e instala dependências
COPY package*.json ./
# Usamos 'npm ci' para builds de CI/Contêineres
RUN npm ci --silent 

# Copia o restante do código
COPY . .

# Cria a extensão empacotada em dist/
# Isso garante que a extensão esteja pronta ANTES de rodar os testes
RUN npm run build

# Comando padrão para rodar os testes
CMD ["npm", "test"]