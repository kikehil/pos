FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Instalar dependencias
RUN npm install

# Copiar código y prisma
COPY apps/api ./apps/api

# Generar cliente prisma
RUN cd apps/api && npx prisma generate

# Construir
RUN cd apps/api && npm run build

EXPOSE 3000

CMD ["node", "apps/api/dist/main"]
