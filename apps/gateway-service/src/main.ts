import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthProxyMiddleware } from './auth/auth-proxy.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const currentConfigService = app.get(ConfigService);
  const port = currentConfigService.getOrThrow<number>('GATEWAY_PORT');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: 'same-site' },
      dnsPrefetchControl: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    })
  );

  const authProxyMiddleware = app.get(AuthProxyMiddleware);
  app.use('/api/v1/auth', authProxyMiddleware.use.bind(authProxyMiddleware));

  const allowedOrigins = currentConfigService
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim());
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
    credentials: true,
  });
  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API-GATEWAY-SERVICE')
    .setDescription('This holds the API GATEWAY Docs')
    .setVersion('1.0')
    .addTag('Gateway')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, documentFactory);

  await app.listen(port ?? 3001, () => {
    console.log(
      `--------------------------GATE WAY LISTENING ON PORT: ${port}--------------------------`
    );
  });
}
bootstrap().catch((error: Error) => {
  console.log('Application failed to run due to:\n', error);
  process.exit(1);
});
