FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiamos archivos de configuración del root
COPY package*.json ./

# Copiamos la API
COPY apps/api ./apps/api

# Nos movemos a la carpeta de la API para instalar y construir
WORKDIR /app/apps/api
RUN npm install
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Arrancamos desde la carpeta de la API
CMD ["node", "dist/main"]
