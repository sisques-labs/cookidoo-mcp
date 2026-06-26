import { Controller, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';

import { HealthResponseDto } from '../dtos/health-response.dto';

/**
 * Liveness probe exposed at `GET /api/health`.
 *
 * Unauthenticated and dependency-free: it only reports that the process is up,
 * so orchestrators and uptime checks can poll it cheaply.
 */
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Get()
  @HttpCode(HttpStatus.OK)
  check(): HealthResponseDto {
    this.logger.debug('Health check called');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
