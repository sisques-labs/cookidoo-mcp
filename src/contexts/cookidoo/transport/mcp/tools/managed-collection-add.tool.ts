import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ManagedCollectionAddCommand } from '@contexts/cookidoo/application/commands/managed-collection-add/managed-collection-add.command';
import { managedCollectionIdSchema } from '../schemas/collection.schema';

@McpTool()
@Injectable()
export class ManagedCollectionAddMcpTool implements IMcpTool {
  private readonly logger = new Logger(ManagedCollectionAddMcpTool.name);

  readonly name = 'cookidoo_add_managed_collection';
  readonly title = 'Subscribe to managed collection';
  readonly description =
    'Subscribes the account to a managed collection by id. Returns the added collection.';
  readonly inputSchema = managedCollectionIdSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { collectionId } = args as { collectionId: string };
    this.logger.log(`Adding managed collection ${collectionId}`);
    const result = await this.commandBus.execute(
      new ManagedCollectionAddCommand({ collectionId }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
