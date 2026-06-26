/**
 * Metadata key used to flag a provider as an MCP tool.
 *
 * Providers tagged with the {@link McpTool} decorator are discovered at
 * bootstrap by {@link McpToolRegistry} via NestJS `DiscoveryService` and
 * registered on the per-request MCP server.
 */
export const MCP_TOOL_METADATA = Symbol('mcp:tool');

/** Server identity advertised to MCP clients during the initialize handshake. */
export const MCP_SERVER_NAME = 'cookidoo-mcp';

/** Server version advertised to MCP clients during the initialize handshake. */
export const MCP_SERVER_VERSION = '0.1.0';
