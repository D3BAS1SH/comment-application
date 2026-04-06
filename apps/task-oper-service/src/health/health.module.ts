import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TerminusModule, PrometheusModule.register(), ConfigModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
