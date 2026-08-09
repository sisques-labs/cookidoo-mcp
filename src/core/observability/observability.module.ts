import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CqrsObservabilityService } from './cqrs-observability.service';

@Module({
  imports: [CqrsModule],
  providers: [CqrsObservabilityService],
})
export class ObservabilityModule {}
