import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ShoppingListAddAdditionalItemsCommand } from '@contexts/cookidoo/application/commands/shopping-list-add-additional-items/shopping-list-add-additional-items.command';
import { addAdditionalItemsSchema } from '../schemas/additional-items.schema';

@McpTool()
@Injectable()
export class ShoppingListAddAdditionalItemsMcpTool implements IMcpTool {
  private readonly logger = new Logger(
    ShoppingListAddAdditionalItemsMcpTool.name,
  );

  readonly name = 'cookidoo_add_additional_items';
  readonly title = 'Add additional items to shopping list';
  readonly description =
    'Adds free-text items (e.g. "milk", "olive oil") to the Cookidoo shopping list. Returns the created items.';
  readonly inputSchema = addAdditionalItemsSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { names } = args as { names: string[] };
    this.logger.log(`Adding ${names.length} additional item(s)`);
    const result = await this.commandBus.execute(
      new ShoppingListAddAdditionalItemsCommand({ names }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
