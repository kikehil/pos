FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Instalar dependencias
RUN cd apps/api && npm install

# Copiar código
COPY apps/api ./apps/api

# Generar cliente prisma y construir
RUN cd apps/api && npx prisma generate && npm run build

EXPOSE 3000

CMD ["node", "apps/api/dist/main"]
