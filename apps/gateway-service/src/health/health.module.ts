import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    PrometheusModule.register()
  ],
  providers: [HealthService],
  controllers: [HealthController]
})
export class HealthModule {}
