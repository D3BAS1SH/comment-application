import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TerminusModule,
    PrometheusModule.register(),
    PrismaModule,
    ConfigModule,
    JwtModule,
  ],
  controllers: [HealthController],
  providers: [HealthService, PrismaService, JwtService],
})
export class HealthModule {}
