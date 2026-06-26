import { Module } from '@nestjs/common';

import { HealthController } from './transport/rest/controllers/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
