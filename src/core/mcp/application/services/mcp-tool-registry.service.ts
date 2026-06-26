import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';

import { IMcpTool } from '../../domain/interfaces/mcp-tool.interface';
import { MCP_TOOL_METADATA } from '../../domain/constants/mcp-tool.constants';

/**
 * Collects every provider tagged with the {@link McpTool} decorator across all
 * bounded-context modules and exposes them as a flat list of MCP tools.
 *
 * Discovery happens once at bootstrap (`onModuleInit`) using NestJS
 * `DiscoveryService`, so the per-request server factory pays no scan cost.
 */
@Injectable()
export class McpToolRegistry implements OnModuleInit {
  private readonly logger = new Logger(McpToolRegistry.name);
  private readonly tools: IMcpTool[] = [];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit(): void {
    for (const wrapper of this.discoveryService.getProviders()) {
      const instance = wrapper.instance as object | undefined;
      if (!instance || typeof instance !== 'object') {
        continue;
      }

      const isTool = this.reflector.get<boolean | undefined>(
        MCP_TOOL_METADATA,
        instance.constructor,
      );

      if (isTool) {
        this.tools.push(instance as IMcpTool);
      }
    }

    this.logger.log(
      `Discovered ${this.tools.length} MCP tools: ${this.tools
        .map((tool) => tool.name)
        .join(', ')}`,
    );
  }

  getTools(): readonly IMcpTool[] {
    return this.tools;
  }
}
