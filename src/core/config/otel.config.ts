import { registerAs } from '@nestjs/config';

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

export const otelConfig = registerAs('otel', () => {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim() || undefined;

  return {
    enabled: Boolean(endpoint),
    endpoint,
    serviceName:
      process.env.OTEL_SERVICE_NAME?.trim() ||
      process.env.SERVICE_NAME?.trim() ||
      'cookidoo-mcp',
    tracesSampleRatio: parseRatio(process.env.OTEL_TRACES_SAMPLE_RATIO, 1),
  };
});
