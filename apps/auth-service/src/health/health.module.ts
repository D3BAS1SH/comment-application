import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TerminusModule,
    PrometheusModule.register(),
    ConfigModule,
    JwtModule,
  ],
  controllers: [HealthController],
  providers: [HealthService, JwtService],
})
export class HealthModule {}
