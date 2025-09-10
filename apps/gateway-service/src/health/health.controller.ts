import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheck } from '@nestjs/terminus';
import { HealthService } from './health.service';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Get overall health status' })
  @ApiResponse({
    status: 200,
    description: 'Health check passed',
  })
  @ApiResponse({
    status: 503,
    description: 'Health check failed',
  })
  async check() {
    return this.healthService.checkAllHealth();
  }

  @Get('gateway')
  @HealthCheck()
  @ApiOperation({ summary: 'Get gateway health status' })
  async checkGateway() {
    return this.healthService.checkGatewayHealth();
  }

  @Get('auth')
  @HealthCheck()
  @ApiOperation({ summary: 'Get auth service health status' })
  async checkAuth() {
    return this.healthService.checkAuthService();
  }

  @Get('system')
  @HealthCheck()
  @ApiOperation({ summary: 'Get system resources health status' })
  async checkSystem() {
    return this.healthService.checkSystemResources();
  }

  @Get('security')
  @HealthCheck()
  @ApiOperation({ summary: 'Get security health status' })
  async checkSecurity() {
    return this.healthService.checkSecurityHealth();
  }
}
