import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  Counter,
  Histogram,
  SpanKind,
  SpanStatusCode,
  Tracer,
  metrics,
  trace,
} from '@opentelemetry/api';

type CqrsKind = 'command' | 'query';
type CqrsStatus = 'success' | 'error';

interface DispatchMessage {
  constructor: { name: string };
}

interface ExecutableBus {
  execute(message: DispatchMessage): Promise<unknown>;
}

// Wraps CommandBus/QueryBus.execute() once at startup so every command and
// query dispatched anywhere in the app (present or future bounded contexts)
// gets a trace span and duration/count metrics without per-handler wiring.
@Injectable()
export class CqrsObservabilityService implements OnModuleInit {
  private readonly logger = new Logger(CqrsObservabilityService.name);
  private readonly tracer: Tracer = trace.getTracer('nestjs-cqrs');
  private readonly meter = metrics.getMeter('nestjs-cqrs');
  private readonly duration: Histogram = this.meter.createHistogram(
    'cqrs.handler.duration',
    {
      description: 'Duration of CQRS command/query handler execution',
      unit: 's',
    },
  );
  private readonly total: Counter = this.meter.createCounter(
    'cqrs.handler.count',
    { description: 'Number of CQRS command/query executions' },
  );

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  onModuleInit(): void {
    this.instrument(this.commandBus, 'command');
    this.instrument(this.queryBus, 'query');
    this.logger.log('CQRS command/query buses instrumented with OpenTelemetry');
  }

  instrument(bus: ExecutableBus, kind: CqrsKind): void {
    const original = bus.execute.bind(bus);

    bus.execute = (message: DispatchMessage): Promise<unknown> => {
      const name = message?.constructor?.name ?? 'unknown';
      const startedAt = Date.now();

      return this.tracer.startActiveSpan(
        `${kind}.${name}`,
        { kind: SpanKind.INTERNAL },
        (span) =>
          Promise.resolve(original(message))
            .then((result) => {
              span.setStatus({ code: SpanStatusCode.OK });
              this.recordMetrics(kind, name, 'success', startedAt);
              return result;
            })
            .catch((error: unknown) => {
              const err =
                error instanceof Error ? error : new Error(String(error));
              span.recordException(err);
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: err.message,
              });
              this.recordMetrics(kind, name, 'error', startedAt);
              throw error;
            })
            .finally(() => {
              span.end();
            }),
      );
    };
  }

  private recordMetrics(
    kind: CqrsKind,
    name: string,
    status: CqrsStatus,
    startedAt: number,
  ): void {
    const attributes = { type: name, kind, status };
    this.duration.record((Date.now() - startedAt) / 1000, attributes);
    this.total.add(1, attributes);
  }
}
