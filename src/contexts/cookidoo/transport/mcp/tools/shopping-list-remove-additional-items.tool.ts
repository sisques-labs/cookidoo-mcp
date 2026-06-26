import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ShoppingListRemoveAdditionalItemsCommand } from '@contexts/cookidoo/application/commands/shopping-list-remove-additional-items/shopping-list-remove-additional-items.command';
import { removeAdditionalItemsSchema } from '../schemas/additional-items.schema';

@McpTool()
@Injectable()
export class ShoppingListRemoveAdditionalItemsMcpTool implements IMcpTool {
  private readonly logger = new Logger(
    ShoppingListRemoveAdditionalItemsMcpTool.name,
  );

  readonly name = 'cookidoo_remove_additional_items';
  readonly title = 'Remove additional items from shopping list';
  readonly description =
    'Removes free-text ("additional") items from the Cookidoo shopping list by id.';
  readonly inputSchema = removeAdditionalItemsSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { ids } = args as { ids: string[] };
    this.logger.log(`Removing ${ids.length} additional item(s)`);
    await this.commandBus.execute(
      new ShoppingListRemoveAdditionalItemsCommand({ ids }),
    );
    return { content: [{ type: 'text', text: JSON.stringify({ removed: ids }) }] };
  }
}
