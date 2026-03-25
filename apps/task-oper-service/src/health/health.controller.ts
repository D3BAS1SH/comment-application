import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthCheck } from '@nestjs/terminus';

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
    return await this.healthService.checkAllHealth();
  }

  @Get('system')
  @HealthCheck()
  @ApiOperation({ summary: 'Get system resources health status' })
  checkSystem() {
    return this.healthService.checkSystemResources();
  }

  @Get('security')
  @HealthCheck()
  @ApiOperation({ summary: 'Get security health status' })
  checkSecurity() {
    return this.healthService.checkSecurityHealth();
  }

  @Get('email')
  @HealthCheck()
  @ApiOperation({ summary: 'Get Email Health checks' })
  checkEmailHealth() {
    return this.healthService.checkEmail();
  }

  @Get('database')
  @HealthCheck()
  @ApiOperation({ summary: 'Get Database Health checks' })
  async checkDatabaseHealth() {
    return await this.healthService.checkDatabase();
  }

  @Get('storage')
  @HealthCheck()
  @ApiOperation({ summary: 'Get Cloudinary Storage health check' })
  async checkCloudinaryStorage() {
    return await this.healthService.checkStorage();
  }

  @Get('service')
  @HealthCheck()
  @ApiOperation({ summary: 'Get Service health check' })
  checkServiceHeath() {
    return this.healthService.checkServiceHealth();
  }

  @Get('container')
  @HealthCheck()
  @ApiOperation({ summary: 'Get container health check' })
  checkContainerHealth() {
    return this.healthService.checkContainerHealth();
  }
}
