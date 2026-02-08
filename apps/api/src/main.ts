import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('Starting NestJS application with ValidationPipe...');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // Temporalmente desactivado para diagnóstico
      forbidNonWhitelisted: false, // Temporalmente desactivado para diagnóstico
      transform: true,
    }),
  );


  // Habilitar CORS para desarrollo (permite cualquier origen)
  app.enableCors({
    origin: true, // Permite cualquier origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Prefijo global para todas las rutas (opcional)
  // app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);


  console.log(`🚀 Aplicación NestJS corriendo en: http://localhost:${port}`);
  console.log(`📦 Products API: http://localhost:${port}/products`);
  console.log(`💰 Sales API: http://localhost:${port}/sales`);
}



bootstrap();

