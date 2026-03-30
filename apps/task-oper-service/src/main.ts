import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'error', 'log', 'verbose', 'warn'],
  });
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('TASK_PORT');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  if (configService.getOrThrow<string>('NODE_ENV') === 'development') {
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
    .setTitle('TASK-OPER-SERVICE')
    .setDescription(
      'This is the Task Oper service handle the task operations and managements'
    )
    .setVersion('1.2')
    .addTag('Task Oper')
    .build();

  const doucmentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/api/v1/docs', app, doucmentFactory());

  console.log(`Task-service running on PORT: ${port}`);
  await app.listen(port);
}
bootstrap().catch((err: Error) => {
  console.error(err);
  process.exit(1);
});
