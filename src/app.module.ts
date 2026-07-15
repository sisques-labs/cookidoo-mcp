import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { cookidooConfig } from '@core/config/cookidoo.config';
import { validateEnv } from '@core/config/env.validation';
import { HealthModule } from '@core/health/health.module';
import { McpModule } from '@core/mcp/mcp.module';
import { CookidooModule } from '@contexts/cookidoo/cookidoo.module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [cookidooConfig],
      cache: true,
    }),
    HealthModule,
    McpModule,
    CookidooModule,
  ],
})
export class AppModule {}
