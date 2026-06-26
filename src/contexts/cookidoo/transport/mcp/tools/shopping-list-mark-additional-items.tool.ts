import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CookidooOwnershipChange } from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { ShoppingListMarkAdditionalItemsCommand } from '@contexts/cookidoo/application/commands/shopping-list-mark-additional-items/shopping-list-mark-additional-items.command';
import { ownershipChangesSchema } from '../schemas/shopping-list-edit.schema';

@McpTool()
@Injectable()
export class ShoppingListMarkAdditionalItemsMcpTool implements IMcpTool {
  private readonly logger = new Logger(
    ShoppingListMarkAdditionalItemsMcpTool.name,
  );

  readonly name = 'cookidoo_mark_additional_items';
  readonly title = 'Mark additional items as bought';
  readonly description =
    'Sets the owned ("bought") flag on free-text ("additional") shopping-list items. Returns the updated items.';
  readonly inputSchema = ownershipChangesSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { items } = args as { items: CookidooOwnershipChange[] };
    this.logger.log(`Marking ${items.length} additional item(s)`);
    const result = await this.commandBus.execute(
      new ShoppingListMarkAdditionalItemsCommand({ changes: items }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
