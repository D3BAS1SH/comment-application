import "reflect-metadata";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger: ["debug","error","fatal","log","warn","verbose"]
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
    forbidNonWhitelisted:true,
    transform:true
  }))
  app.use(cookieParser())

  const allowedOrigins = configService.getOrThrow<string>("CORS_ORIGINS").split(',').map(orig=>orig.trim());
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
    credentials: true
  })

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  console.log(`Auth-service running on PORT: ${port}`);
  await app.listen(port ?? 3000);
}
bootstrap();
