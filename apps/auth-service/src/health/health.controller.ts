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
    return this.healthService.checkAllHealth();
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
}
