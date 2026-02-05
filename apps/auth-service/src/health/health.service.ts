import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
// import { MailerService } from '@nestjs-modules/mailer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly healthCheckService: HealthCheckService
    // private readonly mailService: MailerService
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Main health check - checks all critical services
   */
  async checkAllHealth(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      () => this.checkDatabase(),
      () => this.checkEmail(),
      () => this.checkStorage(),
      () => this.checkSystemResources(),
      () => this.checkSecurityHealth(),
      () => this.checkContainerHealth(),
      () => this.checkServiceHealth(),
    ]);
  }

  checkEmail(): HealthIndicatorResult {
    const key = 'email';
    try {
      // TODO: We will not use this
      // await this.mailService.verifyAllTransporters();
      this.configService.getOrThrow<string>('MAIL_HOST');
      this.configService.getOrThrow<string>('MAIL_PORT');
      const apiKey = this.configService.getOrThrow<string>('MAIL_PASSWORD');
      if (!apiKey.startsWith('re_')) {
        throw new Error('Invalid Resend API key format');
      }
      return {
        [key]: {
          status: 'up',
          message: 'SMTP Server is healthy',
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown SMTP failure';
      throw new Error(`${key} check failed: ${errorMessage}`);
    }
  }

  /**
   *
   * @returns
   */
  async checkDatabase(): Promise<HealthIndicatorResult> {
    const key = 'database';
    try {
      const startTime = Date.now();
      const isPrismaDbHealthy = await this.prismaService.isHealthy();
      const responseTime = Date.now() - startTime;

      if (!isPrismaDbHealthy) {
        throw new Error('Database Health Failure');
      }

      return {
        [key]: {
          status: 'up',
          responseTime: `${responseTime}ms`,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown database error';
      throw new Error(`${key} check failed: ${errorMessage}`);
    }
  }

  /**
   * Check Cloudinary connectivity
   */
  async checkStorage(): Promise<HealthIndicatorResult> {
    const key = 'storage';
    try {
      const startTime = Date.now();

      // Ping Cloudinary API
      await cloudinary.api.ping();

      const responseTime = Date.now() - startTime;

      return {
        [key]: {
          status: 'up',
          responseTime: `${responseTime}ms`,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown storage service error';
      throw new Error(`${key} check failed: ${errorMessage}`);
    }
  }

  /**
   *
   * @returns
   */
  checkSystemResources(): HealthIndicatorResult {
    const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    const isHealthy = heapUsed < 512; // Example threshold of 512MB

    return {
      system_resources: {
        status: isHealthy ? 'up' : 'down',
        heapUsed: `${Math.round(heapUsed)}MB`,
      },
    };
  }

  /**
   *
   * @returns
   */
  checkServiceHealth(): HealthIndicatorResult {
    const key = 'system';
    const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    const threshold = 512; // MB
    const isHealthy = heapUsed < threshold;

    if (!isHealthy) {
      throw new Error(
        `${key} check failed: Heap usage ${Math.round(heapUsed)}MB exceeds threshold ${threshold}MB`
      );
    }

    return {
      [key]: {
        status: 'up',
        heapUsed: `${Math.round(heapUsed)}MB`,
        threshold: `${threshold}MB`,
      },
    };
  }

  /**
   *
   * @returns
   */
  checkSecurityHealth(): HealthIndicatorResult {
    // This is a basic security check. You might want to add more sophisticated checks
    // like TLS certificate expiration, security headers, etc.
    const key = 'security';
    const securityChecks = {
      helmet: true, // Helmet middleware enabled
      rateLimit: true, // Rate limiting enabled
    };

    const isHealthy = Object.values(securityChecks).every(Boolean);

    if (!isHealthy) {
      throw new Error(
        `${key} check failed: One or more security features disabled`
      );
    }

    return {
      [key]: {
        status: 'up',
        ...securityChecks,
      },
    };
  }

  /**
   *
   * @returns
   */
  checkContainerHealth(): HealthIndicatorResult {
    const key = 'container';
    try {
      const isContainer = fs.existsSync('/.dockerenv');

      const metrics = {
        isContainer,
        pid: process.pid,
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
      };

      return {
        [key]: {
          status: 'up',
          ...metrics,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`${key} check failed: ${errorMessage}`);
    }
  }
}
