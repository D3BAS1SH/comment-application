import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'error', 'fatal', 'log', 'warn', 'verbose'],
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('AUTH_PORT');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(cookieParser());

  if (configService.get<string>('NODE_ENV') === 'development') {
    const allowedOrigins = configService
      .getOrThrow<string>('CORS_ORIGINS')
      .split(',')
      .map((orig) => orig.trim());
    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 3600,
      credentials: true,
    });
  }

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AUTH-SERIVCE')
    .setDescription('This is the Auth service handle the authentications')
    .setVersion('1.2')
    .addTag('Authentication')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, documentFactory);

  console.log(`Auth-service running on PORT: ${port}`);
  await app.listen(port ?? 3000);
}
bootstrap().catch((err: Error) => {
  console.error('Application failed due to:\n', err);
  process.exit(1);
});
