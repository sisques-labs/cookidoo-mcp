import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CustomCollectionAddCommand } from '@contexts/cookidoo/application/commands/custom-collection-add/custom-collection-add.command';
import { customCollectionNameSchema } from '../schemas/collection.schema';

@McpTool()
@Injectable()
export class CustomCollectionAddMcpTool implements IMcpTool {
  private readonly logger = new Logger(CustomCollectionAddMcpTool.name);

  readonly name = 'cookidoo_add_custom_collection';
  readonly title = 'Create custom collection';
  readonly description =
    'Creates a new custom collection with the given name. Returns the created collection.';
  readonly inputSchema = customCollectionNameSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { name } = args as { name: string };
    this.logger.log(`Creating custom collection "${name}"`);
    const result = await this.commandBus.execute(
      new CustomCollectionAddCommand({ name }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
