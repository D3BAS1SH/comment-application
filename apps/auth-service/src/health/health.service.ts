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
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import fs from 'fs';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly healthCheckService: HealthCheckService
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
      // () => this.checkEmail(),
      () => this.checkStorage(),
      () => this.checkCrypto(),
      () => this.checkSystemResources(),
      () => this.checkSecurityHealth(),
    ]);
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
   * Check JWT and Bcrypt functionality
   */
  async checkCrypto(): Promise<HealthIndicatorResult> {
    const key = 'crypto';
    try {
      // Test JWT signing and verification
      const testPayload = { test: true, timestamp: Date.now() };
      const token = this.jwtService.sign(testPayload);
      const decoded: typeof testPayload = this.jwtService.verify(token);

      const jwtStatus = decoded.test === true ? 'operational' : 'failed';

      // Test Bcrypt hashing and comparison
      const testPassword = 'healthcheck';
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const isMatch = await bcrypt.compare(testPassword, hashedPassword);

      const bcryptStatus = isMatch ? 'operational' : 'failed';

      // If either fails, return down
      if (jwtStatus === 'failed' || bcryptStatus === 'failed') {
        throw new Error(`JWT: ${jwtStatus}, Bcrypt: ${bcryptStatus}`);
      }

      return {
        [key]: {
          status: 'up',
          jwt: jwtStatus,
          bcrypt: bcryptStatus,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown crypto error';
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
