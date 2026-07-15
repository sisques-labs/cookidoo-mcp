import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ZodRawShape } from 'zod';

import { IMcpToolContext } from './mcp-tool-context.interface';

/**
 * Contract every MCP tool implements.
 *
 * A tool is the MCP equivalent of a REST controller method: a transport-layer
 * entry point that translates tool arguments into a Command/Query and
 * dispatches it through the bus. Tools live in each bounded context's
 * `transport/mcp/tools/` directory and are tagged with the {@link McpTool}
 * decorator so they are auto-discovered and registered.
 */
export interface IMcpTool {
  /** Unique tool name exposed to clients (snake_case, e.g. `cookidoo_search_recipes`). */
  readonly name: string;
  /** Optional human-friendly title shown by MCP clients. */
  readonly title?: string;
  /** Description of what the tool does — surfaced to the AI client. */
  readonly description: string;
  /** Zod raw shape describing the tool's input arguments. */
  readonly inputSchema: ZodRawShape;
  /**
   * Executes the tool. Arguments are already validated against
   * {@link inputSchema} by the MCP SDK before this is called.
   */
  execute(
    args: Record<string, unknown>,
    context: IMcpToolContext,
  ): Promise<CallToolResult>;
}
