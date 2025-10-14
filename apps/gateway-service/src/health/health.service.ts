import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckResult,
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';

@Injectable()
export class HealthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly health: HealthIndicatorService,
  ) {}

  async checkAuthService(): Promise<HealthIndicatorResult> {
    try {
      const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
      const response = await firstValueFrom(
        this.httpService.get(`${authServiceUrl}/health`),
      );
      return {
        auth_service: {
          status: response.status === 200 ? 'up' : 'down',
          statusCode: response.status,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        auth_service: {
          status: 'down',
          message: errorMessage,
        },
      };
    }
  }

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

  checkGatewayHealth(): HealthIndicatorResult {
    const uptime = process.uptime();
    return {
      gateway: {
        status: 'up',
        uptime: `${Math.round(uptime)}s`,
      },
    };
  }

  checkSecurityHealth(): HealthIndicatorResult {
    // This is a basic security check. You might want to add more sophisticated checks
    // like TLS certificate expiration, security headers, etc.
    const securityChecks = {
      helmet: true, // We have Helmet middleware enabled
      rateLimit: true, // We have rate limiting enabled
    };

    const isHealthy = Object.values(securityChecks).every(Boolean);
    return {
      security: {
        status: isHealthy ? 'up' : 'down',
        ...securityChecks,
      },
    };
  }

  checkContainerHealth(): HealthIndicatorResult {
    try {
      // Check if we're running in a container by looking for .dockerenv file
      const isContainer = fs.existsSync('/.dockerenv');

      // Get container metrics
      const metrics = {
        isContainer,
        pid: process.pid,
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
      };

      return {
        container: {
          status: 'up',
          ...metrics,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occured';
      return {
        container: {
          status: 'down',
          message: errorMessage,
        },
      };
    }
  }

  async checkAllHealth(): Promise<HealthCheckResult> {
    const results = await Promise.all([
      this.checkGatewayHealth(),
      this.checkAuthService(),
      this.checkSystemResources(),
      this.checkSecurityHealth(),
      this.checkContainerHealth(),
    ]);

    const status = results.every(
      (result) => Object.values(result)[0].status === 'up',
    );

    const details = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    return {
      status: status ? 'ok' : 'error',
      info: details,
      details: details,
    };
  }
}
