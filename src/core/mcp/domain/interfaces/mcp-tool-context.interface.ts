/**
 * Per-request context handed to every MCP tool.
 *
 * Unlike a multi-tenant API, this server acts as a single Cookidoo account
 * configured through environment variables, so there is no per-request user or
 * tenant to resolve. The interface is kept (currently empty) as the seam where
 * request-scoped data — a correlation id, a locale override, … — would live if
 * the server ever needs it, without changing every tool signature.
 */
export interface IMcpToolContext {
  /** Optional correlation id for tracing a single MCP request across logs. */
  readonly requestId?: string;
}
