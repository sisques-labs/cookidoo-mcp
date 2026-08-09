import * as winston from 'winston';

/**
 * Structured JSON format used for machine-readable output (currently the
 * OTel transport reads pre-format; this is the `format` passed to
 * `WinstonModule.forRoot`, so anything without its own transport-level
 * `format` — e.g. a future file transport — inherits it).
 */
export function createJsonLogFormat(): winston.Logform.Format {
  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  );
}

/**
 * Colorized, human-readable format for local/console output:
 * `<timestamp> <level> [context] <message>`, with the trace (if any) on its
 * own grey line below and the stack (if any) on its own red line below that.
 */
export function createConsoleLogFormat(): winston.Logform.Format {
  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize({
      all: false,
      colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        verbose: 'cyan',
        debug: 'blue',
      },
    }),
    winston.format.printf((raw) => {
      const info = raw as winston.Logform.TransformableInfo & {
        context?: string;
        trace?: string;
        stack?: string;
      };
      const { timestamp, level, message, context, trace, stack } = info;
      const contextStr = context ? `\x1b[36m[${context}]\x1b[0m` : '';
      const traceStr = trace ? `\n\x1b[90m${trace}\x1b[0m` : '';
      const stackStr = stack ? `\n\x1b[31m${stack}\x1b[0m` : '';
      const msg =
        typeof message === 'string' ? message : JSON.stringify(message);

      return `${timestamp} ${level} ${contextStr} ${msg}${traceStr}${stackStr}`;
    }),
  );
}
