FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

RUN npm install

COPY apps/web ./apps/web

# Argumento para la URL del API en tiempo de build si es necesario
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN cd apps/web && npm run build

EXPOSE 3001

CMD ["npm", "--prefix", "apps/web", "start"]
