import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CookidooAdditionalItemEdit } from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { ShoppingListEditAdditionalItemsCommand } from '@contexts/cookidoo/application/commands/shopping-list-edit-additional-items/shopping-list-edit-additional-items.command';
import { additionalItemEditsSchema } from '../schemas/shopping-list-edit.schema';

@McpTool()
@Injectable()
export class ShoppingListEditAdditionalItemsMcpTool implements IMcpTool {
  private readonly logger = new Logger(
    ShoppingListEditAdditionalItemsMcpTool.name,
  );

  readonly name = 'cookidoo_edit_additional_items';
  readonly title = 'Rename additional items';
  readonly description =
    'Renames free-text ("additional") shopping-list items. Returns the updated items.';
  readonly inputSchema = additionalItemEditsSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { items } = args as { items: CookidooAdditionalItemEdit[] };
    this.logger.log(`Renaming ${items.length} additional item(s)`);
    const result = await this.commandBus.execute(
      new ShoppingListEditAdditionalItemsCommand({ edits: items }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
