# POS Pro - Global SaaS System

Sistema de Punto de Venta (POS) profesional con arquitectura SaaS, gestión de múltiples sucursales (tenants), sistema de cobro tipo ATM, detección de escáner de códigos de barras y generación de etiquetas.

## 🚀 Tecnologías
- **Frontend**: Next.js 14, Tailwind CSS, Lucide React.
- **Backend**: NestJS, Prisma ORM, MySQL.
- **Autenticación**: JWT con Passport.
- **Despliegue**: Docker, Nginx.

## 📦 Instalación Local

1. **Clonar repositorio**:
   ```bash
   git clone https://github.com/kikehil/pos.git
   cd pos
   ```

2. **Backend (API)**:
   ```bash
   cd apps/api
   npm install
   # Configurar .env con DATABASE_URL
   npx prisma migrate dev
   npm run seed
   npm run start:dev
   ```

3. **Frontend (Web)**:
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

## 🌐 Credenciales de Desarrollo (Seeded)
- **URL**: `http://localhost:3001`
- **Usuario**: `admin@agencia.com`
- **Password**: `123456`

## 🚢 Despliegue en VPS (Preparación)

El proyecto está preparado para subirse a un VPS (Ubuntu/Debian recomendado).

### Requisitos en el VPS:
1. Docker y Docker Compose instalados.
2. Git.

### Pasos para el VPS:
1. Clonar el repositorio en el servidor.
2. Configurar las variables de entorno para producción.
3. Ejecutar contenedores:
   ```bash
   docker-compose up -d
   ```
4. Configurar Nginx como Proxy Inverso para los puertos 3000 (API) y 3001 (Web).

---
Desarrollado con ❤️ para Bocao Business.
