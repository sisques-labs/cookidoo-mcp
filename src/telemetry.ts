import { config as loadEnv } from 'dotenv';

loadEnv({ quiet: true });

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import {
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
} from '@opentelemetry/semantic-conventions';

// Auto-instrumentation patches modules (http, express, ...) at require time,
// so this file MUST be the very first import in main.ts — before Nest or
// Express is required anywhere else.
const INSTRUMENTED_PACKAGES = new Set([
  '@opentelemetry/instrumentation-http',
  '@opentelemetry/instrumentation-express',
]);

function parseRatio(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    throw new Error(
      `Invalid OTEL_TRACES_SAMPLE_RATIO "${value}": expected a number between 0 and 1`,
    );
  }

  return parsed;
}

function parseIntervalMillis(
  value: string | undefined,
  fallback: number,
): number {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid OTEL_METRIC_EXPORT_INTERVAL_MILLIS "${value}": expected a positive number`,
    );
  }

  return parsed;
}

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim();

if (endpoint) {
  const serviceName =
    process.env.OTEL_SERVICE_NAME?.trim() ||
    process.env.SERVICE_NAME?.trim() ||
    'cookidoo-mcp';

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version,
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.NODE_ENV ?? 'development',
    }),
    traceExporter: new OTLPTraceExporter(),
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(
        parseRatio(process.env.OTEL_TRACES_SAMPLE_RATIO, 1),
      ),
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: parseIntervalMillis(
        process.env.OTEL_METRIC_EXPORT_INTERVAL_MILLIS,
        15000,
      ),
    }),
    // Winston forwards every log line to this via the OpenTelemetryTransportV3
    // transport (src/support/logging) — logs keep going to console as
    // before, and now also flow through the same OTLP pipeline as
    // traces/metrics, correlated with the active span.
    logRecordProcessors: [
      new BatchLogRecordProcessor({ exporter: new OTLPLogExporter() }),
    ],
    instrumentations: [
      // Whitelist rather than disable-by-name: only the packages this
      // service actually uses (HTTP/Express entry points) get patched,
      // regardless of what auto-instrumentations-node bundles in future
      // versions.
      getNodeAutoInstrumentations().filter((instrumentation) =>
        INSTRUMENTED_PACKAGES.has(instrumentation.instrumentationName),
      ),
    ],
  });

  sdk.start();

  const shutdown = () => {
    sdk
      .shutdown()
      .catch((error: unknown) =>
        console.error('Error shutting down OpenTelemetry SDK', error),
      )
      .finally(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
