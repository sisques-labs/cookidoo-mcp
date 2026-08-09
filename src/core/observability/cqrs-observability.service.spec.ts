import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SpanStatusCode, metrics, trace } from '@opentelemetry/api';

import { CqrsObservabilityService } from './cqrs-observability.service';

jest.mock('@opentelemetry/api', () => {
  const actual = jest.requireActual('@opentelemetry/api');
  return {
    ...actual,
    trace: { getTracer: jest.fn() },
    metrics: { getMeter: jest.fn() },
  };
});

class TestCommand {
  constructor(public readonly id: string) {}
}

describe('CqrsObservabilityService', () => {
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;
  let span: {
    end: jest.Mock;
    setStatus: jest.Mock;
    recordException: jest.Mock;
  };
  let tracer: { startActiveSpan: jest.Mock };
  let histogram: { record: jest.Mock };
  let counter: { add: jest.Mock };
  let service: CqrsObservabilityService;

  beforeEach(() => {
    span = { end: jest.fn(), setStatus: jest.fn(), recordException: jest.fn() };
    tracer = {
      startActiveSpan: jest.fn(
        (_name: string, _opts: unknown, fn: (span: unknown) => unknown) =>
          fn(span),
      ),
    };
    histogram = { record: jest.fn() };
    counter = { add: jest.fn() };

    (trace.getTracer as jest.Mock).mockReturnValue(tracer);
    (metrics.getMeter as jest.Mock).mockReturnValue({
      createHistogram: jest.fn().mockReturnValue(histogram),
      createCounter: jest.fn().mockReturnValue(counter),
    });

    commandBus = { execute: jest.fn() } as unknown as jest.Mocked<CommandBus>;
    queryBus = { execute: jest.fn() } as unknown as jest.Mocked<QueryBus>;

    service = new CqrsObservabilityService(commandBus, queryBus);
  });

  it('wraps CommandBus.execute and QueryBus.execute on module init', () => {
    const originalCommandExecute = commandBus.execute;
    const originalQueryExecute = queryBus.execute;

    service.onModuleInit();

    expect(commandBus.execute).not.toBe(originalCommandExecute);
    expect(queryBus.execute).not.toBe(originalQueryExecute);
  });

  it('starts a span named command.<CommandName>, returns the result, and records success metrics', async () => {
    commandBus.execute.mockResolvedValueOnce('handler-result');
    service.instrument(commandBus, 'command');

    const result = await commandBus.execute(new TestCommand('abc'));

    expect(result).toBe('handler-result');
    expect(tracer.startActiveSpan).toHaveBeenCalledWith(
      'command.TestCommand',
      { kind: expect.any(Number) },
      expect.any(Function),
    );
    expect(span.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.OK });
    expect(span.end).toHaveBeenCalled();
    expect(histogram.record).toHaveBeenCalledWith(expect.any(Number), {
      type: 'TestCommand',
      kind: 'command',
      status: 'success',
    });
    expect(counter.add).toHaveBeenCalledWith(1, {
      type: 'TestCommand',
      kind: 'command',
      status: 'success',
    });
  });

  it('records exception, error status, and error metrics, then rethrows', async () => {
    const error = new Error('handler failed');
    queryBus.execute.mockRejectedValueOnce(error);
    service.instrument(queryBus, 'query');

    await expect(queryBus.execute(new TestCommand('abc'))).rejects.toThrow(
      error,
    );

    expect(span.recordException).toHaveBeenCalledWith(error);
    expect(span.setStatus).toHaveBeenCalledWith({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    expect(span.end).toHaveBeenCalled();
    expect(counter.add).toHaveBeenCalledWith(1, {
      type: 'TestCommand',
      kind: 'query',
      status: 'error',
    });
  });

  it('wraps a non-Error rejection before recording it on the span', async () => {
    queryBus.execute.mockRejectedValueOnce('rejected as string');
    service.instrument(queryBus, 'query');

    await expect(queryBus.execute(new TestCommand('abc'))).rejects.toBe(
      'rejected as string',
    );

    expect(span.recordException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'rejected as string' }),
    );
    expect(span.setStatus).toHaveBeenCalledWith({
      code: SpanStatusCode.ERROR,
      message: 'rejected as string',
    });
  });
});
