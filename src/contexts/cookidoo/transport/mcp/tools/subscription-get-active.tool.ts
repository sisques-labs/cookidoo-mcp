import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { SubscriptionFindActiveQuery } from '@contexts/cookidoo/application/queries/subscription-find-active/subscription-find-active.query';

@McpTool()
@Injectable()
export class SubscriptionGetActiveMcpTool implements IMcpTool {
  private readonly logger = new Logger(SubscriptionGetActiveMcpTool.name);

  readonly name = 'cookidoo_get_active_subscription';
  readonly title = 'Get active Cookidoo subscription';
  readonly description =
    'Returns the active Cookidoo subscription of the configured account, or null if there is none.';
  readonly inputSchema = {};

  constructor(private readonly queryBus: QueryBus) {}

  async execute(): Promise<CallToolResult> {
    this.logger.log('Loading active subscription');
    const result = await this.queryBus.execute(
      new SubscriptionFindActiveQuery(),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result ?? null) }] };
  }
}
