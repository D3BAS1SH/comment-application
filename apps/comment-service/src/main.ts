import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  console.log(`Comment-service is running on the port: ${port}`);
  await app.listen(port ?? 3000);
}
bootstrap().catch((err: Error) => {
  console.error('Application failed due to:\n', err);
  process.exit(1);
});
