import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { McpServerFactory } from './application/services/mcp-server.factory';
import { McpToolRegistry } from './application/services/mcp-tool-registry.service';
import { McpController } from './transport/mcp.controller';

/**
 * Wires the shared MCP transport.
 *
 * Owns the single MCP endpoint and the per-request server factory. The actual
 * tools are contributed by each bounded-context module (tagged with the
 * `@McpTool()` decorator) and discovered at bootstrap via `DiscoveryModule`,
 * so this module has no per-context dependencies.
 */
@Module({
  imports: [DiscoveryModule],
  controllers: [McpController],
  providers: [McpToolRegistry, McpServerFactory],
})
export class McpModule {}
