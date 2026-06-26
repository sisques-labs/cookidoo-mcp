import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ShoppingListFindAdditionalItemsQuery } from '@contexts/cookidoo/application/queries/shopping-list-find-additional-items/shopping-list-find-additional-items.query';

@McpTool()
@Injectable()
export class ShoppingListGetAdditionalItemsMcpTool implements IMcpTool {
  private readonly logger = new Logger(
    ShoppingListGetAdditionalItemsMcpTool.name,
  );

  readonly name = 'cookidoo_get_additional_items';
  readonly title = 'Get shopping list additional items';
  readonly description =
    'Returns the free-text ("additional") items added manually to the Cookidoo shopping list.';
  readonly inputSchema = {};

  constructor(private readonly queryBus: QueryBus) {}

  async execute(): Promise<CallToolResult> {
    this.logger.log('Loading additional items');
    const result = await this.queryBus.execute(
      new ShoppingListFindAdditionalItemsQuery(),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
