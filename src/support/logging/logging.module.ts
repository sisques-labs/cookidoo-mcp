import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';

import { createConsoleLogFormat, createJsonLogFormat } from './winston.formats';

/**
 * Structured logging for the whole app, built on plain `winston` +
 * `nest-winston` (this repo does not depend on `@sisques-labs/nestjs-kit`,
 * so it's reimplemented locally rather than imported).
 *
 * `main.ts` installs this as Nest's app-wide logger via
 * `app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))`, so every
 * `Logger.log(...)`/`Logger.error(...)` call already in the codebase is
 * routed through it automatically.
 *
 * Transports:
 * - Console: colorized, human-readable — always on.
 * - OpenTelemetryTransportV3: forwards every log line into the OTel Logs
 *   pipeline (see `src/telemetry.ts`), correlated with the active span. A
 *   no-op when `OTEL_EXPORTER_OTLP_ENDPOINT` is unset, since the NodeSDK
 *   (and its log processor) never starts in that case.
 *
 * No file transport: cookidoo-mcp runs as a stateless container/CLI-style
 * process (see `Dockerfile`) with no log volume convention, so daily-rotate
 * file logging would just accumulate inside an ephemeral filesystem.
 * Console + OTLP forwarding covers both local dev and production.
 */
@Module({
  imports: [
    WinstonModule.forRoot({
      level: process.env.LOG_LEVEL ?? 'info',
      format: createJsonLogFormat(),
      defaultMeta: { service: 'cookidoo-mcp' },
      transports: [
        new winston.transports.Console({ format: createConsoleLogFormat() }),
        new OpenTelemetryTransportV3(),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggingModule {}
