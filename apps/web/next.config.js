/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const nextConfig = {
  // Configuración para desarrollo
  experimental: {
    // Habilitar Server Actions si es necesario
  },
  async rewrites() {
    return [
      // Todo lo que empiece con /api lo mandamos al backend Nest
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
      // Rutas de autenticación /auth/*
      {
        source: '/auth/:path*',
        destination: `${API_URL}/auth/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

