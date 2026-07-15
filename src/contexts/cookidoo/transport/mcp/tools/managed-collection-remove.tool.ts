import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ManagedCollectionRemoveCommand } from '@contexts/cookidoo/application/commands/managed-collection-remove/managed-collection-remove.command';
import { managedCollectionIdSchema } from '../schemas/collection.schema';

@McpTool()
@Injectable()
export class ManagedCollectionRemoveMcpTool implements IMcpTool {
  private readonly logger = new Logger(ManagedCollectionRemoveMcpTool.name);

  readonly name = 'cookidoo_remove_managed_collection';
  readonly title = 'Unsubscribe from managed collection';
  readonly description =
    'Unsubscribes the account from a managed collection by id.';
  readonly inputSchema = managedCollectionIdSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { collectionId } = args as { collectionId: string };
    this.logger.log(`Removing managed collection ${collectionId}`);
    await this.commandBus.execute(
      new ManagedCollectionRemoveCommand({ collectionId }),
    );
    return {
      content: [
        { type: 'text', text: JSON.stringify({ removed: collectionId }) },
      ],
    };
  }
}
