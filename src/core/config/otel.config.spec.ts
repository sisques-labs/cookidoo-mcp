import { otelConfig } from './otel.config';

describe('otelConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('marks OpenTelemetry as disabled when OTEL_EXPORTER_OTLP_ENDPOINT is unset', () => {
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

    const config = otelConfig();

    expect(config.enabled).toBe(false);
    expect(config.endpoint).toBeUndefined();
  });

  it('exposes OpenTelemetry settings when OTEL_EXPORTER_OTLP_ENDPOINT is set', () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318';
    process.env.OTEL_SERVICE_NAME = 'orders-api';
    process.env.OTEL_TRACES_SAMPLE_RATIO = '0.5';

    const config = otelConfig();

    expect(config).toEqual({
      enabled: true,
      endpoint: 'http://localhost:4318',
      serviceName: 'orders-api',
      tracesSampleRatio: 0.5,
    });
  });

  it('falls back to SERVICE_NAME then the template default for serviceName', () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318';
    delete process.env.OTEL_SERVICE_NAME;
    process.env.SERVICE_NAME = 'orders-api';

    expect(otelConfig().serviceName).toBe('orders-api');

    delete process.env.SERVICE_NAME;

    expect(otelConfig().serviceName).toBe('cookidoo-mcp');
  });

  it('throws for an out-of-range traces sample ratio', () => {
    process.env.OTEL_TRACES_SAMPLE_RATIO = '1.5';

    expect(() => otelConfig()).toThrow(
      /Invalid OTEL_TRACES_SAMPLE_RATIO "1.5"/,
    );
  });
});
