# Dockerfile
# Mude: FROM mcr.microsoft.com/playwright:v1.46.0-jammy
# Para: Use a versão que o Playwright está sugerindo ou a versão 'latest' para evitar futuras incompatibilidades.

# Usando a versão sugerida (v1.56.1) ou, de forma mais robusta, a última estável:
FROM mcr.microsoft.com/playwright:v1.56.1-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci --silent

# A linha abaixo não é mais necessária se você usar a imagem do Playwright
# RUN npx playwright install --with-deps chromium

COPY . .
# Build da extensão para dist/
RUN node scripts/build-extension.mjs

CMD ["npm","test"]