import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const currentConfigService = app.get(ConfigService);
  const port = currentConfigService.getOrThrow<number>('PORT');
  await app.listen(port ?? 3001,()=>{
    console.log(`--------------------------GATE WAY LISTENING ON PORT: ${port}--------------------------`);
  }); 
}
bootstrap();
