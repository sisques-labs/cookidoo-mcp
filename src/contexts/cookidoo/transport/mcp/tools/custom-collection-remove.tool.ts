import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CustomCollectionRemoveCommand } from '@contexts/cookidoo/application/commands/custom-collection-remove/custom-collection-remove.command';
import { customCollectionIdSchema } from '../schemas/collection.schema';

@McpTool()
@Injectable()
export class CustomCollectionRemoveMcpTool implements IMcpTool {
  private readonly logger = new Logger(CustomCollectionRemoveMcpTool.name);

  readonly name = 'cookidoo_remove_custom_collection';
  readonly title = 'Delete custom collection';
  readonly description = 'Deletes a custom collection by id.';
  readonly inputSchema = customCollectionIdSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { collectionId } = args as { collectionId: string };
    this.logger.log(`Removing custom collection ${collectionId}`);
    await this.commandBus.execute(
      new CustomCollectionRemoveCommand({ collectionId }),
    );
    return {
      content: [
        { type: 'text', text: JSON.stringify({ removed: collectionId }) },
      ],
    };
  }
}
