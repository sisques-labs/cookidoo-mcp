import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ShoppingListClearCommand } from '@contexts/cookidoo/application/commands/shopping-list-clear/shopping-list-clear.command';

@McpTool()
@Injectable()
export class ShoppingListClearMcpTool implements IMcpTool {
  private readonly logger = new Logger(ShoppingListClearMcpTool.name);

  readonly name = 'cookidoo_clear_shopping_list';
  readonly title = 'Clear Cookidoo shopping list';
  readonly description =
    'Removes every recipe, ingredient and additional item from the Cookidoo shopping list. This cannot be undone.';
  readonly inputSchema = {};

  constructor(private readonly commandBus: CommandBus) {}

  async execute(): Promise<CallToolResult> {
    this.logger.log('Clearing shopping list');
    await this.commandBus.execute(new ShoppingListClearCommand());
    return {
      content: [{ type: 'text', text: JSON.stringify({ cleared: true }) }],
    };
  }
}
