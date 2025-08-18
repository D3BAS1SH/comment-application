import "reflect-metadata";
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const currentConfigService = app.get(ConfigService);
  const port = currentConfigService.getOrThrow<number>('GATEWAY_PORT');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(cookieParser());
  app.use(helmet());

  const allowedOrigins = currentConfigService.getOrThrow<string>("CORS_ORIGINS").split(',').map(origin=> origin.trim());
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
    credentials: true
  });
  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');

  const swaggerConfig = new DocumentBuilder().setTitle("API-GATEWAY-SERVICE").setDescription("This holds the API GATEWAY Docs").setVersion("1.0").addTag("Gateway").build();
  const documentFactory = () => SwaggerModule.createDocument(app,swaggerConfig);
  SwaggerModule.setup('api-docs',app,documentFactory);

  await app.listen(port ?? 3001,()=>{
    console.log(`--------------------------GATE WAY LISTENING ON PORT: ${port}--------------------------`);
  }); 
}
bootstrap();
